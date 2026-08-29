import type { Express, Request, Response, NextFunction } from "express";
import { db } from "./db";
import { services } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.session?.adminId) return next();
  return res.status(401).json({ error: "unauthorized" });
}

const PRICE_RE = /^\d+(\.\d{1,2})?$/;

function validateRow(row: any, idx: number): { ok: boolean; errors: string[]; data?: any } {
  const errors: string[] = [];
  const nameAr = String(row.nameAr ?? row["Service Name AR"] ?? "").trim();
  const nameEn = String(row.nameEn ?? row["Service Name EN"] ?? "").trim();
  const descriptionAr = String(row.descriptionAr ?? row["Description AR"] ?? "").trim() || null;
  const descriptionEn = String(row.descriptionEn ?? row["Description EN"] ?? "").trim() || null;
  const priceRaw = String(row.price ?? row["Price"] ?? "").trim();
  const currency = (String(row.currency ?? row["Currency"] ?? "SAR").trim() || "SAR").toUpperCase();
  const activeRaw = String(row.isActive ?? row["Active"] ?? "yes").trim().toLowerCase();
  if (!nameAr) errors.push("اسم الخدمة بالعربية مفقود");
  if (!nameEn) errors.push("Service Name EN missing");
  if (!PRICE_RE.test(priceRaw)) errors.push("السعر غير صالح — يجب أن يكون رقماً");
  const isActive = ["no", "0", "false", "inactive", "غير مفعلة", "لا"].includes(activeRaw) ? "false" : "true";
  if (errors.length) return { ok: false, errors };
  return { ok: true, errors: [], data: { nameAr, nameEn, descriptionAr, descriptionEn, price: priceRaw, currency, isActive } };
}

export function registerServiceRoutes(app: Express) {
  // ---------- Public: active services for the booking form ----------
  app.get("/api/services", async (_req, res) => {
    const all = await db.select().from(services).where(eq(services.isActive, "true")).orderBy(desc(services.createdAt));
    res.json(all.map((s) => ({ id: s.id, nameAr: s.nameAr, nameEn: s.nameEn, descriptionAr: s.descriptionAr, descriptionEn: s.descriptionEn, price: s.price, currency: s.currency })));
  });

  // ---------- Admin CRUD ----------
  app.get("/api/admin/services", requireAdmin, async (_req, res) => {
    res.json(await db.select().from(services).orderBy(desc(services.createdAt)));
  });

  app.post("/api/admin/services", requireAdmin, async (req, res) => {
    const v = validateRow(req.body || {}, 0);
    if (!v.ok) return res.status(400).json({ error: v.errors.join(" | ") });
    const now = new Date().toISOString();
    const [s] = await db.insert(services).values({ ...v.data, updatedAt: now }).returning();
    res.json({ ok: true, service: s });
  });

  app.patch("/api/admin/services/:id", requireAdmin, async (req, res) => {
    const [cur] = await db.select().from(services).where(eq(services.id, req.params.id));
    if (!cur) return res.status(404).json({ error: "not found" });
    const merged = { ...cur, ...req.body };
    const v = validateRow(merged, 0);
    if (!v.ok) return res.status(400).json({ error: v.errors.join(" | ") });
    await db.update(services).set({ ...v.data, updatedAt: new Date().toISOString() }).where(eq(services.id, req.params.id));
    res.json({ ok: true });
  });

  app.delete("/api/admin/services/:id", requireAdmin, async (req, res) => {
    await db.delete(services).where(eq(services.id, req.params.id));
    res.json({ ok: true });
  });

  // ---------- Bulk import (rows parsed client-side, validated server-side) ----------
  app.post("/api/admin/services/import", requireAdmin, async (req, res) => {
    const rows = Array.isArray(req.body?.rows) ? req.body.rows : [];
    if (!rows.length) return res.status(400).json({ error: "no rows" });
    if (rows.length > 500) return res.status(400).json({ error: "max 500 rows per import" });
    const existing = await db.select().from(services);
    const seen = new Set(existing.map((s) => `${s.nameAr}||${s.nameEn}`));
    const results: { row: number; ok: boolean; errors?: string[]; skipped?: boolean }[] = [];
    const toInsert: any[] = [];
    rows.forEach((row: any, i: number) => {
      const v = validateRow(row, i);
      if (!v.ok) { results.push({ row: i + 1, ok: false, errors: v.errors }); return; }
      const key = `${v.data.nameAr}||${v.data.nameEn}`;
      if (seen.has(key)) { results.push({ row: i + 1, ok: false, skipped: true, errors: ["مكررة — الخدمة موجودة مسبقاً"] }); return; }
      seen.add(key);
      toInsert.push({ ...v.data, updatedAt: new Date().toISOString() });
      results.push({ row: i + 1, ok: true });
    });
    if (toInsert.length) await db.insert(services).values(toInsert);
    res.json({ ok: true, imported: toInsert.length, failed: results.filter((r) => !r.ok).length, results });
  });

  // ---------- Sample template (CSV with BOM for Excel Arabic) ----------
  app.get("/api/admin/services/template", requireAdmin, (_req, res) => {
    const csv = "Service Name AR,Service Name EN,Description AR,Description EN,Price,Currency,Active\n" +
      "كشف بيطري,Veterinary Consultation,فحص شامل للحيوان,Full pet examination,150,SAR,Yes\n" +
      "تطعيم,Vaccination,تطعيم دوري,Routine vaccination,100,SAR,Yes\n" +
      "تنظيف أسنان,Dental Cleaning,تنظيف وتلميع الأسنان,Dental cleaning and polishing,350,SAR,Yes\n";
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", "attachment; filename=services-template.csv");
    res.send("﻿" + csv);
  });
}
