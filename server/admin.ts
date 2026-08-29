import type { Express, Request, Response, NextFunction } from "express";
import { db, dbEnabled } from "./db";
import { bookings, messages, siteContent, mediaFiles, adminUsers } from "@shared/schema";
import { eq, desc } from "drizzle-orm";
import crypto from "crypto";
import { sendNotification, bookingEmailHtml } from "./email";
import { createInvoice, getPaymentStatus } from "./myfatoorah";

const hash = (p: string) => crypto.createHash("sha256").update(p + (process.env.ADMIN_SALT || "elite-onx")).digest("hex");

declare module "express-session" {
  interface SessionData {
    adminId?: string;
  }
}

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.session?.adminId) return next();
  return res.status(401).json({ error: "unauthorized" });
}

export function registerAdminRoutes(app: Express) {
  if (!dbEnabled) {
    app.all("/api/admin/*", (_req, res) => res.status(503).json({ error: "database_not_configured" }));
    app.all(["/api/bookings","/api/messages","/api/content"], (_req, res) => res.status(503).json({ error: "database_not_configured" }));
    return;
  }
  // ---------- Auth ----------
  app.post("/api/admin/login", async (req, res) => {
    const { username, password } = req.body || {};
    if (!username || !password) return res.status(400).json({ error: "missing credentials" });
    // Bootstrap: if no admin exists and env ADMIN_USERNAME/ADMIN_PASSWORD match, create it
    const existing = await db.select().from(adminUsers).where(eq(adminUsers.username, username));
    if (existing.length === 0) {
      const envUser = process.env.ADMIN_USERNAME || "admin";
      const envPass = process.env.ADMIN_PASSWORD;
      if (envPass && username === envUser && password === envPass) {
        const [created] = await db.insert(adminUsers).values({ username: envUser, passwordHash: hash(envPass) }).returning();
        req.session.adminId = created.id;
        return res.json({ ok: true, bootstrapped: true });
      }
      return res.status(401).json({ error: "invalid credentials" });
    }
    const admin = existing[0];
    if (admin.passwordHash !== hash(password)) return res.status(401).json({ error: "invalid credentials" });
    req.session.adminId = admin.id;
    return res.json({ ok: true });
  });

  app.post("/api/admin/logout", (req, res) => {
    req.session.destroy(() => res.json({ ok: true }));
  });

  app.get("/api/admin/me", (req, res) => {
    res.json({ authenticated: !!req.session?.adminId });
  });

  // ---------- Bookings (public create) ----------
  app.post("/api/bookings", async (req, res) => {
    const { name, phone, email, petType, service, branch, preferredDate, notes, amount } = req.body || {};
    if (!name || !phone) return res.status(400).json({ error: "name and phone are required" });
    const [b] = await db.insert(bookings).values({ name, phone, email, petType, service, branch, preferredDate, notes, amount: amount ? String(amount) : null }).returning();

    let payment: any = null;
    if (amount && Number(amount) > 0) {
      payment = await createInvoice({ bookingId: b.id, customerName: name, customerEmail: email, phone, amount: Number(amount), service });
      if (payment.ok) {
        await db.update(bookings).set({ invoiceId: payment.invoiceId, invoiceUrl: payment.invoiceUrl, paymentStatus: "pending" }).where(eq(bookings.id, b.id));
      }
    }
    await sendNotification("حجز جديد — موقع النخبة", bookingEmailHtml({ ...b, paymentStatus: payment?.ok ? "بانتظار الدفع" : "غير مدفوع" }));
    res.json({ ok: true, bookingId: b.id, invoiceUrl: payment?.ok ? payment.invoiceUrl : null });
  });

  app.get("/api/admin/bookings", requireAdmin, async (_req, res) => {
    res.json(await db.select().from(bookings).orderBy(desc(bookings.createdAt)));
  });

  app.patch("/api/admin/bookings/:id", requireAdmin, async (req, res) => {
    const { status, paymentStatus } = req.body || {};
    await db.update(bookings).set({ ...(status && { status }), ...(paymentStatus && { paymentStatus }) }).where(eq(bookings.id, req.params.id));
    res.json({ ok: true });
  });

  // ---------- Payment callbacks (MyFatoorah redirects here) ----------
  app.get("/api/payment/callback", async (req, res) => {
    const paymentId = String(req.query.paymentId || "");
    if (paymentId) {
      const st = await getPaymentStatus(paymentId);
      if (st.ok && st.customerReference) {
        const ps = st.invoiceStatus === "Paid" ? "paid" : st.invoiceStatus === "Failed" ? "failed" : "pending";
        await db.update(bookings).set({ paymentStatus: ps, paymentId }).where(eq(bookings.id, st.customerReference));
      }
    }
    res.redirect("/book-now?payment=success");
  });

  app.get("/api/payment/error", async (req, res) => {
    const paymentId = String(req.query.paymentId || "");
    if (paymentId) {
      const st = await getPaymentStatus(paymentId);
      if (st.ok && st.customerReference) {
        await db.update(bookings).set({ paymentStatus: "failed", paymentId }).where(eq(bookings.id, st.customerReference));
      }
    }
    res.redirect("/book-now?payment=failed");
  });

  // ---------- Messages (contact form) ----------
  app.post("/api/messages", async (req, res) => {
    const { name, phone, email, subject, body } = req.body || {};
    if (!name || !body) return res.status(400).json({ error: "name and body are required" });
    await db.insert(messages).values({ name, phone, email, subject, body });
    await sendNotification(`رسالة تواصل: ${subject || "بدون موضوع"}`, `<div dir=rtl><p><b>${name}</b> (${phone || ""} ${email || ""})</p><p>${body}</p></div>`);
    res.json({ ok: true });
  });

  app.get("/api/admin/messages", requireAdmin, async (_req, res) => {
    res.json(await db.select().from(messages).orderBy(desc(messages.createdAt)));
  });

  app.patch("/api/admin/messages/:id/read", requireAdmin, async (req, res) => {
    await db.update(messages).set({ isRead: "true" }).where(eq(messages.id, req.params.id));
    res.json({ ok: true });
  });

  // ---------- Site content (CMS) ----------
  app.get("/api/content", async (_req, res) => {
    res.json(await db.select().from(siteContent));
  });

  app.put("/api/admin/content/:key", requireAdmin, async (req, res) => {
    const { valueAr, valueEn, type, section } = req.body || {};
    const key = req.params.key;
    const existing = await db.select().from(siteContent).where(eq(siteContent.key, key));
    if (existing.length) {
      await db.update(siteContent).set({ valueAr, valueEn, ...(type && { type }), ...(section && { section }), updatedAt: new Date().toISOString() }).where(eq(siteContent.key, key));
    } else {
      await db.insert(siteContent).values({ key, valueAr, valueEn, type: type || "text", section });
    }
    res.json({ ok: true });
  });

  app.delete("/api/admin/content/:key", requireAdmin, async (req, res) => {
    await db.delete(siteContent).where(eq(siteContent.key, req.params.key));
    res.json({ ok: true });
  });

  // ---------- Media library (stored in DB as data URLs — survives redeploys) ----------
  app.post("/api/admin/media", requireAdmin, async (req, res) => {
    const { filename, mimeType, dataBase64 } = req.body || {};
    if (!filename || !dataBase64) return res.status(400).json({ error: "filename and dataBase64 required" });
    if (dataBase64.length > 2_500_000) return res.status(400).json({ error: "file too large (max ~1.8MB)" });
    const url = `data:${mimeType || "image/png"};base64,${dataBase64}`;
    const [m] = await db.insert(mediaFiles).values({ filename, url, mimeType, size: String(dataBase64.length) }).returning();
    res.json({ ok: true, id: m.id, url });
  });

  app.get("/api/admin/media", requireAdmin, async (_req, res) => {
    const all = await db.select().from(mediaFiles).orderBy(desc(mediaFiles.uploadedAt));
    res.json(all.map(({ url, ...rest }) => ({ ...rest, url: url.slice(0, 60) + "…", hasData: true })));
  });

  app.get("/api/media/:id", async (req, res) => {
    const [m] = await db.select().from(mediaFiles).where(eq(mediaFiles.id, req.params.id));
    if (!m) return res.status(404).end();
    const match = m.url.match(/^data:([^;]+);base64,(.+)$/);
    if (!match) return res.status(500).end();
    res.setHeader("Content-Type", match[1]);
    res.setHeader("Cache-Control", "public, max-age=31536000");
    res.send(Buffer.from(match[2], "base64"));
  });

  // ---------- Dashboard stats ----------
  app.get("/api/admin/stats", requireAdmin, async (_req, res) => {
    const b = await db.select().from(bookings);
    const m = await db.select().from(messages);
    res.json({
      bookingsTotal: b.length,
      bookingsNew: b.filter((x) => x.status === "new").length,
      bookingsPaid: b.filter((x) => x.paymentStatus === "paid").length,
      messagesTotal: m.length,
      messagesUnread: m.filter((x) => x.isRead !== "true").length,
    });
  });
}
