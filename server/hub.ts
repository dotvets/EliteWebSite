import type { Express, Request, Response } from "express";
import { pool, dbEnabled } from "./db";
import { requireAdmin } from "./admin";
import { digitailApi } from "./digitail";
import { resolveDigitailConfig } from "./digitailConfig";
import { cached, upstreamStats } from "./hubCache";
import { redactErrorMessage, redactSecrets } from "./redact";

// ============================================================================
// Phase 1 (master document Part 5): read-only Group Booking Hub.
// Public widget endpoints (/api/hub/:brand/...) backed by Digitail reads,
// cached + rate-limited + feature-flagged (hub_brands.booking_enabled gates
// everything; ship dark until UX sign-off).
// ============================================================================

const TTL_CLINICS = 6 * 3600; // 6h
const TTL_SERVICES = 6 * 3600; // 6h
const TTL_DOCTORS = 6 * 3600; // 6h
const TTL_AVAILABILITY = 60; // 60s

// ---------------------------------------------------------------------------
// Public per-IP rate limiting (Part 9.1): 60 req/min/IP on /api/hub/*.
// ---------------------------------------------------------------------------
const PUBLIC_RATE_LIMIT = 60;
const ipBuckets = new Map<string, { count: number; resetAt: number }>();
setInterval(() => {
  const now = Date.now();
  ipBuckets.forEach((b, k) => {
    if (b.resetAt < now) ipBuckets.delete(k);
  });
}, 60_000).unref();

function publicRateLimit(req: Request, res: Response): boolean {
  const key = req.ip || req.socket.remoteAddress || "unknown";
  const now = Date.now();
  let bucket = ipBuckets.get(key);
  if (!bucket || bucket.resetAt < now) {
    bucket = { count: 0, resetAt: now + 60_000 };
    ipBuckets.set(key, bucket);
  }
  bucket.count += 1;
  if (bucket.count > PUBLIC_RATE_LIMIT) {
    res.status(429).json({ error: "rate_limited", retry_after_seconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)) });
    return false;
  }
  return true;
}

// ---------------------------------------------------------------------------
// Brand / clinic config helpers
// ---------------------------------------------------------------------------
type BrandRow = {
  brand: string;
  display_name_ar: string;
  display_name_en: string;
  theme_json: any;
  default_locale: string;
  booking_enabled: boolean;
  messaging_enabled: boolean;
  payment_mode: string;
  config_json: any;
};

type ClinicRow = {
  id: string;
  brand: string;
  digitail_clinic_id: number;
  name_ar: string;
  name_en: string;
  booking_enabled: boolean;
  timezone: string;
  config_json: any;
};

async function getBrand(brand: string): Promise<BrandRow | null> {
  const r = await pool.query(`SELECT * FROM hub_brands WHERE brand = $1 LIMIT 1`, [brand]);
  return r.rows[0] || null;
}

async function getClinic(brand: string, publicId: string): Promise<ClinicRow | null> {
  const r = await pool.query(`SELECT * FROM hub_clinics WHERE brand = $1 AND id = $2 LIMIT 1`, [brand, publicId]);
  return r.rows[0] || null;
}

function brandFallbackContact(brand: BrandRow) {
  const cfg = brand.config_json || {};
  return {
    whatsapp: cfg.whatsapp || null, // e.g. "966920011626" → wa.me link client-side
    phone: cfg.phone || null,
  };
}

// Gate (Part 5.2 feature flag): booking_enabled=false → endpoints stay dark.
function brandGate(brand: BrandRow | null, res: Response): brand is BrandRow {
  if (!brand) {
    res.status(404).json({ error: "unknown_brand" });
    return false;
  }
  if (!brand.booking_enabled) {
    res.status(404).json({ error: "booking_unavailable", fallback: brandFallbackContact(brand) });
    return false;
  }
  return true;
}

const BRAND_RE = /^[a-z][a-z0-9_-]{0,31}$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function safeError(res: Response, error: any, code: string) {
  console.error(`[hub] ${code}:`, redactErrorMessage(error));
  const status = Number(error?.status) || 502;
  res.status(status === 401 || status === 403 ? 502 : status).json({
    error: code,
    details: redactSecrets(String(error?.message || "upstream error")).slice(0, 300),
  });
}

// ---------------------------------------------------------------------------
// Admin: clinic discovery sync (Part 5.2 — never hardcode clinic ID lists)
// ---------------------------------------------------------------------------
async function syncClinicsFromDigitail() {
  const config = resolveDigitailConfig();
  const me = await digitailApi(`/auth/me?include=multipleClinic`);
  // Live response carries the clinic list under `clinics` (verified 2026-09-21);
  // keep `multipleClinic` as a fallback alias.
  const clinics: Array<{ id: number; name: string; slug: string; logo?: string }> =
    me?.data?.multipleClinic || me?.data?.clinics || [];

  // Brand assignment is CONFIG, not code: HUB_CLINIC_BRAND_MAP='{"3010":"elite",...}'.
  // Unknown clinics fall back to the connection scope as brand (sandbox scope "elite").
  let brandMap: Record<string, string> = {};
  try {
    brandMap = JSON.parse(process.env.HUB_CLINIC_BRAND_MAP || "{}");
  } catch {
    brandMap = {};
  }

  const synced: string[] = [];
  for (const c of clinics) {
    const brand = brandMap[String(c.id)] || config.connectionScope;
    const brandRow = await getBrand(brand);
    if (!brandRow) continue; // skip clinics whose brand is not configured
    const publicId = `${brand}:${c.id}`;
    await pool.query(
      `INSERT INTO hub_clinics (id, brand, digitail_clinic_id, name_ar, name_en, config_json)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (id) DO UPDATE SET
         name_ar = EXCLUDED.name_ar,
         name_en = EXCLUDED.name_en,
         config_json = hub_clinics.config_json || EXCLUDED.config_json`,
      [publicId, brand, c.id, c.name, c.name, JSON.stringify({ slug: c.slug, logo: c.logo || null })],
    );
    synced.push(publicId);
  }
  return synced;
}

// ---------------------------------------------------------------------------
// Response shaping (Part 5.2): Arabic + English fields, opaque public ids,
// no PIMS internals.
// ---------------------------------------------------------------------------
function shapeClinic(c: ClinicRow) {
  return {
    id: c.id,
    name_ar: c.name_ar,
    name_en: c.name_en,
    timezone: c.timezone || "Asia/Riyadh",
    booking_enabled: c.booking_enabled,
  };
}

function shapeService(v: any) {
  return {
    id: String(v.id),
    name_ar: v.name ?? "",
    name_en: v.name ?? "",
    description: v.description ?? "",
    category: v.category ?? null,
    duration_minutes: v.duration ?? null,
  };
}

function shapeDoctor(v: any) {
  return {
    id: String(v.id),
    name: [v.first_name, v.last_name].filter(Boolean).join(" "),
    job_title: v.job_title ?? null,
    avatar: v.avatar ?? null,
  };
}

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------
export function registerHubRoutes(app: Express) {
  if (!dbEnabled) {
    app.all("/api/hub/*", (_req, res) => res.status(503).json({ error: "database_not_configured" }));
    return;
  }

  // ---- Admin: sync clinics from Digitail discovery ----
  app.post("/api/hub/admin/sync-clinics", requireAdmin, async (_req, res) => {
    try {
      const synced = await syncClinicsFromDigitail();
      res.json({ synced, count: synced.length });
    } catch (error: any) {
      safeError(res, error, "hub_sync_failed");
    }
  });

  // ---- Admin: upstream budget observability ----
  app.get("/api/hub/admin/upstream-stats", requireAdmin, (_req, res) => {
    res.json(upstreamStats());
  });

  // ---- Public: brand clinics ----
  app.get("/api/hub/:brand/clinics", async (req, res) => {
    if (!publicRateLimit(req, res)) return;
    try {
      const brandParam = String(req.params.brand || "");
      if (!BRAND_RE.test(brandParam)) return res.status(400).json({ error: "invalid_brand" });
      const brand = await getBrand(brandParam);
      if (!brandGate(brand, res)) return;
      const r = await pool.query(`SELECT * FROM hub_clinics WHERE brand = $1 ORDER BY name_en`, [brand.brand]);
      res.set("Cache-Control", `public, max-age=${TTL_CLINICS}`);
      res.json({
        brand: { id: brand.brand, name_ar: brand.display_name_ar, name_en: brand.display_name_en, locale: brand.default_locale },
        clinics: r.rows.map(shapeClinic),
        fallback: brandFallbackContact(brand),
      });
    } catch (error: any) {
      safeError(res, error, "hub_clinics_failed");
    }
  });

  // ---- Public: clinic services (Digitail visit types) ----
  app.get("/api/hub/:brand/clinics/:clinicId/services", async (req, res) => {
    if (!publicRateLimit(req, res)) return;
    try {
      const brandParam = String(req.params.brand || "");
      if (!BRAND_RE.test(brandParam)) return res.status(400).json({ error: "invalid_brand" });
      const brand = await getBrand(brandParam);
      if (!brandGate(brand, res)) return;
      const clinic = await getClinic(brand.brand, String(req.params.clinicId || ""));
      if (!clinic) return res.status(404).json({ error: "unknown_clinic" });

      const { value, source } = await cached(`services:${clinic.digitail_clinic_id}`, TTL_SERVICES, async () => {
        const data = await digitailApi(`/visit-types?filter%5Bclinic_id%5D=${clinic.digitail_clinic_id}`);
        return (data?.data || []).filter((v: any) => v?.is_visible !== false).map(shapeService);
      });
      res.set("Cache-Control", `public, max-age=${TTL_SERVICES}`);
      res.json({ clinic: shapeClinic(clinic), services: value, cache: source });
    } catch (error: any) {
      safeError(res, error, "hub_services_failed");
    }
  });

  // ---- Public: clinic doctors (optionally filtered by serviceId) ----
  app.get("/api/hub/:brand/clinics/:clinicId/doctors", async (req, res) => {
    if (!publicRateLimit(req, res)) return;
    try {
      const brandParam = String(req.params.brand || "");
      if (!BRAND_RE.test(brandParam)) return res.status(400).json({ error: "invalid_brand" });
      const brand = await getBrand(brandParam);
      if (!brandGate(brand, res)) return;
      const clinic = await getClinic(brand.brand, String(req.params.clinicId || ""));
      if (!clinic) return res.status(404).json({ error: "unknown_clinic" });

      const serviceId = typeof req.query.serviceId === "string" && /^\d+$/.test(req.query.serviceId) ? req.query.serviceId : null;

      if (serviceId) {
        // Doctors for a specific service come from the visit type's vet list.
        const { value, source } = await cached(`services:raw:${clinic.digitail_clinic_id}`, TTL_SERVICES, async () => {
          const data = await digitailApi(`/visit-types?filter%5Bclinic_id%5D=${clinic.digitail_clinic_id}`);
          return data?.data || [];
        });
        const vt = (value as any[]).find((v) => String(v.id) === serviceId);
        res.set("Cache-Control", `public, max-age=${TTL_SERVICES}`);
        return res.json({ clinic: shapeClinic(clinic), service_id: serviceId, doctors: (vt?.vets || []).map(shapeDoctor), cache: source });
      }

      const { value, source } = await cached(`doctors:${clinic.digitail_clinic_id}`, TTL_DOCTORS, async () => {
        const data = await digitailApi(`/vets?filter%5Bclinic_id%5D=${clinic.digitail_clinic_id}`);
        return (data?.data || []).map(shapeDoctor);
      });
      res.set("Cache-Control", `public, max-age=${TTL_DOCTORS}`);
      res.json({ clinic: shapeClinic(clinic), doctors: value, cache: source });
    } catch (error: any) {
      safeError(res, error, "hub_doctors_failed");
    }
  });

  // ---- Public: availability (Digitail public vets-timeslots) ----
  app.get("/api/hub/:brand/clinics/:clinicId/availability", async (req, res) => {
    if (!publicRateLimit(req, res)) return;
    try {
      const brandParam = String(req.params.brand || "");
      if (!BRAND_RE.test(brandParam)) return res.status(400).json({ error: "invalid_brand" });
      const brand = await getBrand(brandParam);
      if (!brandGate(brand, res)) return;
      const clinic = await getClinic(brand.brand, String(req.params.clinicId || ""));
      if (!clinic) return res.status(404).json({ error: "unknown_clinic" });

      const from = typeof req.query.from === "string" ? req.query.from : "";
      const to = typeof req.query.to === "string" ? req.query.to : from;
      if (!DATE_RE.test(from) || !DATE_RE.test(to)) return res.status(400).json({ error: "invalid_date_range", expected: "YYYY-MM-DD" });
      const spanDays = (new Date(to).getTime() - new Date(from).getTime()) / 86_400_000;
      if (spanDays < 0 || spanDays > 31) return res.status(400).json({ error: "date_range_too_large", max_days: 31 });

      const serviceId = typeof req.query.serviceId === "string" && /^\d+$/.test(req.query.serviceId) ? req.query.serviceId : null;
      const doctorId = typeof req.query.doctorId === "string" && /^[a-zA-Z0-9_-]+$/.test(req.query.doctorId) ? req.query.doctorId : null;

      const slug = (clinic.config_json || {}).slug;
      if (!slug) return res.status(503).json({ error: "clinic_availability_unconfigured" });

      const cacheKey = `avail:${slug}:${from}:${to}:${serviceId || ""}:${doctorId || ""}`;
      const { value, source } = await cached(cacheKey, TTL_AVAILABILITY, async () => {
        const params = new URLSearchParams();
        params.set("filter[start_date]", from);
        params.set("filter[end_date]", to);
        if (serviceId) params.set("filter[visit_type_id]", serviceId);
        if (doctorId) params.set("filter[vet_slug]", doctorId);
        const data = await digitailApi(`/public/clinics/${encodeURIComponent(slug)}/vets-timeslots?${params.toString()}`);
        return { data: data?.data || [], meta: data?.meta || {} };
      });

      res.set("Cache-Control", `public, max-age=${TTL_AVAILABILITY}`);
      res.json({
        clinic: shapeClinic(clinic),
        timezone: clinic.timezone || "Asia/Riyadh",
        from,
        to,
        service_id: serviceId,
        doctor_id: doctorId,
        availability: (value as any).data,
        meta: (value as any).meta,
        cache: source,
      });
    } catch (error: any) {
      safeError(res, error, "hub_availability_failed");
    }
  });
}
