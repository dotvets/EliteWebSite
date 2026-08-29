import type { Express, Request, Response, NextFunction } from "express";
import { db } from "./db";
import { teamMembers, testimonials, offers, blogPosts, branches, seoMeta, activityLog, services, siteContent, mediaFiles, bookings } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.session?.adminId) return next();
  return res.status(401).json({ error: "unauthorized" });
}

export async function logActivity(action: string, entity?: string, entityId?: string) {
  try { await db.insert(activityLog).values({ action, entity, entityId }); } catch { /* never break a mutation because of logging */ }
}

const now = () => new Date().toISOString();

/** Generic collection CRUD factory — admin endpoints + public published-only list. */
function collection(app: Express, opts: { route: string; publicRoute?: string; table: any; entity: string; orderBy?: any }) {
  const { route, publicRoute, table, entity } = opts;

  app.get(`/api/admin/${route}`, requireAdmin, async (_req, res) => {
    res.json(await db.select().from(table).orderBy(desc(table.createdAt)));
  });

  app.post(`/api/admin/${route}`, requireAdmin, async (req, res) => {
    const body = { ...req.body }; delete body.id; delete body.createdAt;
    const inserted: any = await db.insert(table).values({ ...body, updatedAt: now() }).returning();
    const row = inserted[0];
    await logActivity(`إضافة ${entity}`, entity, row?.id);
    res.json({ ok: true, row });
  });

  app.patch(`/api/admin/${route}/:id`, requireAdmin, async (req, res) => {
    const body = { ...req.body }; delete body.id; delete body.createdAt;
    await db.update(table).set({ ...body, updatedAt: now() }).where(eq(table.id, req.params.id));
    await logActivity(`تحديث ${entity}`, entity, req.params.id);
    res.json({ ok: true });
  });

  app.delete(`/api/admin/${route}/:id`, requireAdmin, async (req, res) => {
    await db.delete(table).where(eq(table.id, req.params.id));
    await logActivity(`حذف ${entity}`, entity, req.params.id);
    res.json({ ok: true });
  });

  if (publicRoute) {
    app.get(publicRoute, async (_req, res) => {
      const rows = await db.select().from(table).where(eq(table.published, "true")).orderBy(table.sortOrder ?? desc(table.createdAt));
      const nowIso = new Date().toISOString();
      res.json(rows.filter((r: any) => !r.publishAt || r.publishAt <= nowIso));
    });
  }
}

export function registerCmsRoutes(app: Express) {
  collection(app, { route: "team", publicRoute: "/api/public/team", table: teamMembers, entity: "عضو فريق" });
  collection(app, { route: "testimonials", publicRoute: "/api/public/testimonials", table: testimonials, entity: "رأي عميل" });
  collection(app, { route: "offers", publicRoute: "/api/public/offers", table: offers, entity: "عرض" });
  collection(app, { route: "blog", publicRoute: "/api/public/blog", table: blogPosts, entity: "مقال" });
  collection(app, { route: "branches", publicRoute: "/api/public/branches", table: branches, entity: "فرع" });

  // ---------- SEO meta (per path) ----------
  app.get("/api/admin/seo", requireAdmin, async (_req, res) => {
    res.json(await db.select().from(seoMeta));
  });
  app.put("/api/admin/seo/:path(*)", requireAdmin, async (req, res) => {
    const p = req.params.path.startsWith("/") ? req.params.path : "/" + req.params.path;
    const body = { ...req.body }; delete body.id; delete body.path;
    const existing = await db.select().from(seoMeta).where(eq(seoMeta.path, p));
    if (existing.length) {
      await db.update(seoMeta).set({ ...body, updatedAt: now() }).where(eq(seoMeta.path, p));
    } else {
      await db.insert(seoMeta).values({ path: p, ...body });
    }
    await logActivity("تحديث SEO", "seo", p);
    res.json({ ok: true });
  });
  // used by serve-time injection
  app.get("/api/public/seo", async (_req, res) => {
    res.json(await db.select().from(seoMeta));
  });

  // ---------- Activity log ----------
  app.get("/api/admin/activity", requireAdmin, async (_req, res) => {
    res.json((await db.select().from(activityLog).orderBy(desc(activityLog.createdAt))).slice(0, 100));
  });

  // ---------- Global search ----------
  app.get("/api/admin/search", requireAdmin, async (req, res) => {
    const q = String(req.query.q || "").trim().toLowerCase();
    if (!q) return res.json({ results: [] });
    const has = (v: any) => String(v || "").toLowerCase().includes(q);
    const results: any[] = [];
    for (const s of await db.select().from(services)) if (has(s.nameAr) || has(s.nameEn)) results.push({ type: "خدمة", label: s.nameAr, tab: "services" });
    for (const t of await db.select().from(teamMembers)) if (has(t.nameAr) || has(t.nameEn)) results.push({ type: "فريق", label: t.nameAr, tab: "team" });
    for (const t of await db.select().from(testimonials)) if (has(t.customerAr) || has(t.textAr)) results.push({ type: "رأي", label: t.customerAr, tab: "testimonials" });
    for (const o of await db.select().from(offers)) if (has(o.titleAr) || has(o.titleEn)) results.push({ type: "عرض", label: o.titleAr, tab: "offers" });
    for (const b of await db.select().from(blogPosts)) if (has(b.titleAr) || has(b.titleEn)) results.push({ type: "مقال", label: b.titleAr, tab: "blog" });
    for (const b of await db.select().from(branches)) if (has(b.nameAr) || has(b.nameEn)) results.push({ type: "فرع", label: b.nameAr, tab: "branches" });
    for (const m of await db.select().from(mediaFiles)) if (has(m.filename)) results.push({ type: "وسائط", label: m.filename, tab: "media" });
    for (const c of await db.select().from(siteContent)) if (has(c.key) || has(c.valueAr)) results.push({ type: "محتوى", label: c.key, tab: "content" });
    res.json({ results: results.slice(0, 30) });
  });

  // ---------- Extended stats (real values only) ----------
  app.get("/api/admin/stats2", requireAdmin, async (_req, res) => {
    const [sv, tm, ts, of, bl, br, mf, sc] = await Promise.all([
      db.select().from(services), db.select().from(teamMembers), db.select().from(testimonials),
      db.select().from(offers), db.select().from(blogPosts), db.select().from(branches),
      db.select().from(mediaFiles), db.select().from(siteContent),
    ]);
    const [lastContent] = await db.select().from(siteContent).orderBy(desc(siteContent.updatedAt));
    res.json({
      services: sv.length, team: tm.length, testimonials: ts.length, offers: of.length,
      blog: bl.length, branches: br.length, media: mf.length, contentKeys: sc.length,
      publishedBlog: bl.filter((x) => x.published === "true").length,
      activeServices: sv.filter((x) => x.isActive === "true").length,
      lastContentUpdate: lastContent?.updatedAt || null,
    });
  });

  // ---------- Export (JSON backup) ----------
  app.get("/api/admin/export", requireAdmin, async (_req, res) => {
    const dump = {
      exportedAt: now(),
      services: await db.select().from(services),
      team: await db.select().from(teamMembers),
      testimonials: await db.select().from(testimonials),
      offers: await db.select().from(offers),
      blog: await db.select().from(blogPosts),
      branches: await db.select().from(branches),
      seo: await db.select().from(seoMeta),
      content: await db.select().from(siteContent),
      bookings: (await db.select().from(bookings)).length, // count only — no PII in backup
    };
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename=elite-backup-${now().slice(0, 10)}.json`);
    res.json(dump);
  });

  // ---------- Media delete (upgrade) ----------
  app.delete("/api/admin/media/:id", requireAdmin, async (req, res) => {
    await db.delete(mediaFiles).where(eq(mediaFiles.id, req.params.id));
    await logActivity("حذف وسائط", "media", req.params.id);
    res.json({ ok: true });
  });

  // ---------- Public bootstrap: single source of truth for header/footer/contact ----------
  app.get("/api/public/bootstrap", async (_req, res) => {
    const content = await db.select().from(siteContent);
    const get = (k: string) => content.find((c) => c.key === k);
    const val = (k: string) => ({ ar: get(k)?.valueAr || null, en: get(k)?.valueEn || null });
    res.json({
      settings: {
        phone: val("settings.phone"), whatsapp: val("settings.whatsapp"), email: val("settings.email"),
        address: val("settings.address"), logo: val("settings.logo"), siteName: val("settings.siteName"),
        social: {
          facebook: val("settings.social.facebook"), twitter: val("settings.social.twitter"),
          instagram: val("settings.social.instagram"), snapchat: val("settings.social.snapchat"), tiktok: val("settings.social.tiktok"),
        },
        announcement: val("settings.announcement"),
      },
      branches: await db.select().from(branches).where(eq(branches.published, "true")),
    });
  });
}
