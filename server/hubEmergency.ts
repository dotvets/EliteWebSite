import crypto from "crypto";
import type { Express, Request, Response } from "express";
import { z } from "zod";
import { pool, dbEnabled } from "./db";
import { requireAdmin } from "./admin";
import { sendNotification } from "./email";
import { audit } from "./messaging";
import { redactErrorMessage } from "./redact";

// ============================================================================
// Phase 4 / G4 (master document Part 16.1): Emergency path.
// - Bypasses booking, payment, and OTP friction.
// - Ships behind EMERGENCY_PATH_ENABLED=false by default AND per-brand config
//   hub_brands.config_json.emergency.enabled=true.
// - No phone number is collected by the triage form (PDPL data minimization).
// - Server delivery channels: HTTPS webhook OR existing SMTP notification email.
//   WhatsApp/phone remain customer CTAs until a verified WhatsApp provider exists.
// ============================================================================

const EMERGENCY_IP_LIMIT = 5;
const emergencyBuckets = new Map<string, { count: number; resetAt: number }>();
setInterval(() => {
  const now = Date.now();
  emergencyBuckets.forEach((bucket, key) => {
    if (bucket.resetAt < now) emergencyBuckets.delete(key);
  });
}, 60_000).unref();

const BRAND_RE = /^[a-z][a-z0-9_-]{0,31}$/;

const emergencySchema = z.object({
  species: z.string().trim().min(1).max(40),
  symptoms: z.string().trim().min(3).max(500),
  eta: z.string().trim().min(1).max(80),
  locale: z.enum(["ar", "en"]).default("ar"),
  source: z.record(z.any()).default({}),
  website: z.string().max(0).optional(), // honeypot — must be empty
});

type BrandRow = {
  brand: string;
  display_name_ar: string;
  display_name_en: string;
  config_json: any;
};

function emergencyFeatureEnabled(): boolean {
  return (process.env.EMERGENCY_PATH_ENABLED || "false").toLowerCase() === "true";
}

function clientIp(req: Request): string {
  const cf = req.headers["cf-connecting-ip"];
  if (typeof cf === "string" && cf.trim()) return cf.trim();
  const xff = req.headers["x-forwarded-for"];
  if (typeof xff === "string" && xff.trim()) return xff.split(",")[0].trim();
  return req.ip || req.socket.remoteAddress || "unknown";
}

function emergencyRateLimit(req: Request, res: Response): boolean {
  const key = clientIp(req);
  const now = Date.now();
  let bucket = emergencyBuckets.get(key);
  if (!bucket || bucket.resetAt < now) {
    bucket = { count: 0, resetAt: now + 60_000 };
    emergencyBuckets.set(key, bucket);
  }
  bucket.count += 1;
  if (bucket.count > EMERGENCY_IP_LIMIT) {
    res.status(429).json({ error: "rate_limited", retry_after_seconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)) });
    return false;
  }
  return true;
}

async function getBrand(brand: string): Promise<BrandRow | null> {
  const r = await pool.query(`SELECT brand, display_name_ar, display_name_en, config_json FROM hub_brands WHERE brand = $1 LIMIT 1`, [brand]);
  return r.rows[0] || null;
}

function emergencyConfig(brand: BrandRow) {
  const root = brand.config_json || {};
  const cfg = root.emergency || {};
  const enabled = emergencyFeatureEnabled() && cfg.enabled === true;
  const webhookUrl = typeof cfg.webhook_url === "string" && cfg.webhook_url.trim() ? cfg.webhook_url.trim() : null;
  const email = cfg.email === true;
  const channel = webhookUrl ? "webhook" : email ? "email" : null;
  return {
    enabled,
    channel,
    contactOnly: enabled && !channel,
    fallback: {
      whatsapp: cfg.whatsapp || root.whatsapp || null,
      phone: cfg.phone || root.phone || null,
    },
  };
}

function validWebhookUrl(raw: string): URL | null {
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:") return null;
    if (url.username || url.password) return null;
    const host = url.hostname.toLowerCase();
    if (host === "localhost" || host.endsWith(".local") || /^10\.|^192\.168\.|^172\.(1[6-9]|2\d|3[01])\./.test(host)) return null;
    return url;
  } catch {
    return null;
  }
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>'"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[ch] || ch);
}

async function deliverEmergency(request: any, brand: BrandRow, channel: string): Promise<{ ok: boolean; channel: string; reason?: string }> {
  const cfg = (brand.config_json || {}).emergency || {};
  if (channel === "webhook") {
    const url = validWebhookUrl(String(cfg.webhook_url || ""));
    if (!url) return { ok: false, channel, reason: "invalid_webhook_url" };
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    try {
      const resp = await fetch(url.toString(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: request.id,
          brand: brand.brand,
          species: request.species,
          symptoms: request.symptoms,
          eta: request.eta,
          locale: request.locale,
          source: request.source_json,
          created_at: request.created_at,
        }),
        signal: controller.signal,
      });
      if (!resp.ok) return { ok: false, channel, reason: `webhook_http_${resp.status}` };
      return { ok: true, channel };
    } catch (error: any) {
      return { ok: false, channel, reason: error?.name === "AbortError" ? "webhook_timeout" : "webhook_failed" };
    } finally {
      clearTimeout(timer);
    }
  }

  if (channel === "email") {
    const brandName = brand.display_name_ar || brand.display_name_en || brand.brand;
    const html = `<div dir="rtl" style="font-family:sans-serif">
      <h2>حالة طارئة — ${escapeHtml(brandName)}</h2>
      <table cellpadding="6" style="border-collapse:collapse">
        <tr><td><b>رقم الطلب</b></td><td>${escapeHtml(request.id)}</td></tr>
        <tr><td><b>نوع الحيوان</b></td><td>${escapeHtml(request.species)}</td></tr>
        <tr><td><b>الأعراض</b></td><td>${escapeHtml(request.symptoms)}</td></tr>
        <tr><td><b>وقت الوصول المتوقع</b></td><td>${escapeHtml(request.eta)}</td></tr>
      </table>
    </div>`;
    const result = await sendNotification(`حالة طارئة — ${brandName}`, html);
    return result.sent ? { ok: true, channel } : { ok: false, channel, reason: result.reason || "email_failed" };
  }

  return { ok: false, channel: "none", reason: "emergency_channel_unconfigured" };
}

export function registerHubEmergencyRoutes(app: Express) {
  if (!dbEnabled) return;

  // Public config: safe to call even when booking_enabled=false. Never exposes
  // webhook URLs or any operations-channel secret.
  app.get("/api/hub/:brand/emergency-config", async (req, res) => {
    try {
      const brandParam = String(req.params.brand || "");
      if (!BRAND_RE.test(brandParam)) return res.status(400).json({ error: "invalid_brand" });
      const brand = await getBrand(brandParam);
      if (!brand) return res.status(404).json({ error: "unknown_brand" });
      const cfg = emergencyConfig(brand);
      res.json({
        enabled: cfg.enabled,
        contact_only: cfg.contactOnly,
        channel: cfg.enabled ? cfg.channel : null,
        fallback: cfg.fallback,
      });
    } catch (error: any) {
      console.error(JSON.stringify({ level: "error", msg: "emergency_config_failed", error: redactErrorMessage(error) }));
      res.status(500).json({ error: "emergency_config_failed" });
    }
  });

  // Public triage submission: no OTP, no payment, no phone field.
  app.post("/api/hub/:brand/emergency", async (req, res) => {
    if (!emergencyRateLimit(req, res)) return;
    try {
      const brandParam = String(req.params.brand || "");
      if (!BRAND_RE.test(brandParam)) return res.status(400).json({ error: "invalid_brand" });
      const brand = await getBrand(brandParam);
      if (!brand) return res.status(404).json({ error: "unknown_brand" });
      const cfg = emergencyConfig(brand);
      if (!cfg.enabled) return res.status(404).json({ error: "emergency_unavailable" });

      const parsed = emergencySchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: "invalid_input", fields: parsed.error.issues.map((i) => i.path.join(".")).slice(0, 10) });
      if (parsed.data.website) return res.status(400).json({ error: "invalid_input" });

      const id = crypto.randomUUID();
      const inserted = await pool.query(
        `INSERT INTO hub_emergency_requests (id, brand, species, symptoms, eta, locale, channel, status, source_json)
         VALUES ($1,$2,$3,$4,$5,$6,$7,'pending',$8)
         RETURNING id, brand, species, symptoms, eta, locale, channel, status, source_json, created_at`,
        [id, brand.brand, parsed.data.species, parsed.data.symptoms, parsed.data.eta, parsed.data.locale, cfg.channel, JSON.stringify(parsed.data.source || {})],
      );
      const request = inserted.rows[0];

      if (!cfg.channel) {
        await pool.query(`UPDATE hub_emergency_requests SET status = 'failed' WHERE id = $1`, [id]);
        await audit("system", "emergency.channel_unconfigured", "hub_emergency_requests", id, { brand: brand.brand });
        return res.status(503).json({ error: "emergency_channel_unconfigured", fallback: cfg.fallback });
      }

      const delivered = await deliverEmergency(request, brand, cfg.channel);
      if (!delivered.ok) {
        await pool.query(`UPDATE hub_emergency_requests SET status = 'failed' WHERE id = $1`, [id]);
        await audit("system", "emergency.delivery_failed", "hub_emergency_requests", id, { brand: brand.brand, channel: delivered.channel, reason: delivered.reason || "unknown" });
        return res.status(502).json({ error: "emergency_delivery_failed", fallback: cfg.fallback });
      }

      await pool.query(`UPDATE hub_emergency_requests SET status = 'sent' WHERE id = $1`, [id]);
      await audit("public:emergency", "emergency.submitted", "hub_emergency_requests", id, { brand: brand.brand, channel: delivered.channel, species: request.species });
      res.json({ received: true, requestId: id, channel: delivered.channel });
    } catch (error: any) {
      console.error(JSON.stringify({ level: "error", msg: "emergency_submit_failed", error: redactErrorMessage(error) }));
      res.status(500).json({ error: "emergency_submit_failed" });
    }
  });

  // Admin operational log. No phone numbers are collected by this feature.
  app.get("/api/hub/admin/emergency-requests", requireAdmin, async (req, res) => {
    try {
      const brand = typeof req.query.brand === "string" ? req.query.brand : null;
      const rows = await pool.query(
        `SELECT id, brand, species, symptoms, eta, channel, status, source_json, created_at
         FROM hub_emergency_requests
         WHERE ($1::varchar IS NULL OR brand = $1)
         ORDER BY created_at DESC LIMIT 100`,
        [brand],
      );
      res.json({ requests: rows.rows });
    } catch (error: any) {
      console.error(JSON.stringify({ level: "error", msg: "emergency_admin_list_failed", error: redactErrorMessage(error) }));
      res.status(500).json({ error: "emergency_admin_list_failed" });
    }
  });
}
