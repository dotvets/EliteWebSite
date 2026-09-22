import crypto from "crypto";
import type { Express, Request, Response } from "express";
import { z } from "zod";
import { pool, dbEnabled } from "./db";
import { requireAdmin } from "./admin";
import { digitailRequest, digitailCircuitState } from "./digitail";
import { cached } from "./hubCache";
import { getMessagingProvider, enqueueNotification, dispatchDueNotifications, audit, maskPhone, whatsappEnabled } from "./messaging";
import { redactErrorMessage } from "./redact";
import { resolvePaymentModeForHold } from "./hubDynamicDeposit";

// ============================================================================
// Phase 2 (master document Part 6): booking write path.
// State machine: held → (OTP verified) → confirmed → completed
//                  │            │
//                  ▼            ▼
//               expired   failed/cancelled (pending_payment arrives in Phase 3)
// Local holds are UX holds only (A7) — upstream contention is an expected
// state, handled by the conflict-safe confirm pipeline.
// ============================================================================

const OTP_TTL_MINUTES = 10;
const OTP_MAX_ATTEMPTS = 5;
const OTP_RESEND_COOLDOWN_SECONDS = 60;
const OTP_REQUESTS_PER_PHONE_PER_HOUR = 5;
const SWEEP_INTERVAL_MS = 60_000;
const ADVISORY_LOCK_KEY = 732_451;

let sweeperLastRun: Date | null = null;
let sweeperTimer: NodeJS.Timeout | null = null;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
export function normalizeSaudiPhone(raw: string): string | null {
  const digits = String(raw || "").replace(/[^\d+]/g, "");
  let d = digits.replace(/^\+/, "");
  if (/^05\d{8}$/.test(d)) d = `966${d.slice(1)}`;
  else if (/^5\d{8}$/.test(d)) d = `966${d}`;
  if (!/^9665\d{8}$/.test(d)) return null;
  return `+${d}`;
}

function hashOtp(phone: string, code: string): string {
  return crypto.createHash("sha256").update(`otp:${phone}:${code}:${process.env.SESSION_SECRET || ""}`).digest("hex");
}

export function signCustomerCookie(customerId: string): string {
  const sig = crypto.createHmac("sha256", process.env.SESSION_SECRET || "hub").update(customerId).digest("base64url");
  return `${customerId}.${sig}`;
}

export function verifyCustomerCookie(value: string | undefined): string | null {
  if (!value) return null;
  const [id, sig] = value.split(".");
  if (!id || !sig) return null;
  const expected = crypto.createHmac("sha256", process.env.SESSION_SECRET || "hub").update(id).digest("base64url");
  return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected)) ? id : null;
}

function referenceCode(brand: string, id: string): string {
  const prefix = brand === "elite" ? "ELT" : brand === "drpaws" ? "PAW" : "VAN";
  return `${prefix}-${id.replace(/-/g, "").slice(0, 5).toUpperCase()}`;
}

function safeErr(res: Response, error: any, code: string, status = 500) {
  console.error(JSON.stringify({ level: "error", msg: code, error: redactErrorMessage(error) }));
  res.status(Number(error?.status) && error.status < 500 ? error.status : status).json({ error: code });
}

async function getBrandRow(brand: string) {
  const r = await pool.query(`SELECT * FROM hub_brands WHERE brand = $1 LIMIT 1`, [brand]);
  return r.rows[0] || null;
}
async function getClinicRow(id: string) {
  const r = await pool.query(`SELECT * FROM hub_clinics WHERE id = $1 LIMIT 1`, [id]);
  return r.rows[0] || null;
}

// ---------------------------------------------------------------------------
// Validation schemas (Part 6.2 — schema validation on every input)
// ---------------------------------------------------------------------------
const createBookingSchema = z.object({
  clinicId: z.string().regex(/^[a-z][a-z0-9_-]{0,31}:\d+$/),
  serviceId: z.string().regex(/^\d+$/),
  serviceName: z.string().max(200).optional(),
  doctorId: z.string().regex(/^\d+$/).optional(),
  doctorName: z.string().max(200).optional(),
  start: z.string().datetime({ offset: true }),
  durationMinutes: z.number().int().min(5).max(240),
  customerName: z.string().trim().min(2).max(120),
  phone: z.string().min(9).max(20),
  pet: z.object({
    name: z.string().trim().min(1).max(80),
    species: z.string().trim().min(1).max(40),
    breed: z.string().max(80).optional(),
    sex: z.string().max(20).optional(),
    notes: z.string().max(500).optional(),
  }),
  idempotencyKey: z.string().uuid(),
  locale: z.enum(["ar", "en"]).default("ar"),
  source: z.record(z.any()).default({}),
  website: z.string().max(0).optional().or(z.literal("").optional()), // honeypot — must be empty
});

// ---------------------------------------------------------------------------
// Upstream availability re-check (conflict-safe confirm, Part 6.1 step 1)
// ---------------------------------------------------------------------------
async function fetchDaySlots(slug: string, day: string, serviceId: string, duration: number): Promise<any[]> {
  const params = new URLSearchParams();
  params.set("filter[start_date]", day);
  params.set("filter[end_date]", day);
  if (serviceId && serviceId !== "0") params.set("filter[visit_type_id]", serviceId);
  else params.set("filter[duration]", String(duration));
  const data = await digitailRequest("GET", `/public/clinics/${encodeURIComponent(slug)}/vets-timeslots?${params.toString()}`);
  return data?.data || [];
}

function slotMatches(slots: any[], startIso: string): boolean {
  if (!slots.length) return false;
  const target = new Date(startIso).getTime();
  const flatten = (v: any): string[] => {
    if (v == null) return [];
    if (typeof v === "string") return [v];
    if (Array.isArray(v)) return v.flatMap(flatten);
    if (typeof v === "object") return Object.values(v).flatMap(flatten);
    return [String(v)];
  };
  for (const s of flatten(slots)) {
    const t = Date.parse(s);
    if (!Number.isNaN(t) && Math.abs(t - target) < 60_000) return true;
    // tolerate "HH:mm" local Riyadh slot strings
    if (/^\d{2}:\d{2}/.test(s)) {
      const riyadhTarget = new Date(target).toLocaleString("sv-SE", { timeZone: "Asia/Riyadh" }).slice(11, 16);
      if (s.slice(0, 5) === riyadhTarget) return true;
    }
  }
  return false;
}

// ---------------------------------------------------------------------------
// Digitail upserts: pet parent (by phone), pet, appointment
// ---------------------------------------------------------------------------
async function findOrCreatePetParent(clinicDigitailId: number, name: string, phone: string): Promise<string> {
  try {
    const found = await digitailRequest("GET", `/pet-parents?filter%5Bphone%5D=${encodeURIComponent(phone)}`);
    const row = (found?.data || [])[0];
    if (row?.id) return String(row.id);
  } catch {
    // search unsupported upstream → fall through to create
  }
  const [first, ...rest] = name.trim().split(/\s+/);
  const created = await digitailRequest("POST", "/pet-parents", {
    name: first,
    last_name: rest.join(" ") || "-",
    phone,
    terms_and_conditions: true,
  });
  return String(created?.data?.id);
}

// Digitail /pets REQUIRED fields (live-verified against the sandbox contract
// on 2026-09-23 — a bare nickname+species_id POST returns 422):
//   species_id (valid id from /species), breed_id (must belong to species),
//   birthday (YYYY-MM-DD), gender, hormonal_status (integer enum).
const DEFAULT_PET_BIRTHDAY = "2020-01-01"; // UX does not collect birthdate yet
const DEFAULT_HORMONAL_STATUS = 1; // integer enum value accepted by upstream

async function resolveBreedId(speciesId: number, breedName?: string): Promise<number> {
  const { value } = await cached(`digitail:breeds:${speciesId}`, 6 * 3600, async () => {
    const data = await digitailRequest("GET", `/breeds?filter%5Bspecies_id%5D=${speciesId}`);
    return data?.data || [];
  });
  const list = (value as any[]) || [];
  const labelOf = (b: any) => String(b?.breed || b?.label || b?.name || "").toLowerCase();
  if (breedName) {
    const exact = list.find((b: any) => labelOf(b) === breedName.trim().toLowerCase());
    if (exact?.id) return Number(exact.id);
  }
  const mix = list.find((b: any) => labelOf(b) === "mix");
  if (mix?.id) return Number(mix.id);
  if (list[0]?.id) return Number(list[0].id);
  throw Object.assign(new Error("no_breed_available_upstream"), { status: 502 });
}

function normalizeGender(sex: string | undefined): string {
  const s = (sex || "").trim().toLowerCase();
  if (s.startsWith("f") || s === "أنثى" || s === "انثى") return "female";
  return "male"; // upstream requires a value; male/female are the accepted literals
}

async function createDigitailPet(clinicDigitailId: number, vetId: string, parentId: string, pet: { name: string; species: string; breed?: string; sex?: string; birthdate?: string; birthday?: string; hormonal_status?: number }, speciesId?: number): Promise<string> {
  // Docs specify multipart/form-data for /pets; try JSON first, fall back.
  if (!speciesId) {
    // No valid species mapping — fail as an upstream error, NEVER silently send
    // a wrong species_id (the old `?? 1` fallback caused 422 on every confirm).
    throw Object.assign(new Error("species_unmapped"), { status: 502 });
  }
  const breedId = await resolveBreedId(speciesId, pet.breed);
  const payload: Record<string, any> = {
    clinic_id: clinicDigitailId,
    vet_id: Number(vetId),
    owner_id: Number(parentId),
    nickname: pet.name,
    species_id: speciesId,
    breed_id: breedId,
    birthday: pet.birthdate || pet.birthday || DEFAULT_PET_BIRTHDAY,
    gender: normalizeGender(pet.sex),
    hormonal_status: Number.isInteger(pet.hormonal_status) ? pet.hormonal_status : DEFAULT_HORMONAL_STATUS,
  };
  try {
    const created = await digitailRequest("POST", "/pets", payload);
    return String(created?.data?.id);
  } catch (e: any) {
    if (e?.status && e.status >= 400 && e.status < 500) {
      const form = new FormData();
      for (const [k, v] of Object.entries(payload)) form.append(k, String(v));
      const { getValidAccessTokenPublic } = await import("./digitail");
      const token = await getValidAccessTokenPublic();
      const { resolveDigitailConfig } = await import("./digitailConfig");
      const cfg = resolveDigitailConfig();
      const resp = await fetch(`${cfg.apiBaseUrl}/pets`, { method: "POST", headers: { Authorization: `Bearer ${token}`, Accept: "application/json" }, body: form });
      const data: any = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        const err = new Error(`Digitail API request failed (${resp.status})`);
        (err as any).status = resp.status;
        (err as any).details = data;
        throw err;
      }
      return String(data?.data?.id);
    }
    throw e;
  }
}

// ---------------------------------------------------------------------------
// Notification templates (config-overridable via brand config_json.templates)
// ---------------------------------------------------------------------------
function renderTemplate(key: string, vars: Record<string, string>, locale: string, brandTemplates?: Record<string, string>): string {
  const defaults: Record<string, string> = {
    otp: locale === "ar" ? `رمز التحقق الخاص بك: ${vars.code} — صالح 10 دقائق` : `Your verification code: ${vars.code} (valid 10 minutes)`,
    confirm:
      locale === "ar"
        ? `تم تأكيد حجزك ${vars.ref} في ${vars.clinic} يوم ${vars.date} الساعة ${vars.time}. نراك قريباً!`
        : `Your booking ${vars.ref} at ${vars.clinic} on ${vars.date} at ${vars.time} is confirmed. See you soon!`,
    remind_24h: locale === "ar" ? `تذكير: موعدك ${vars.ref} غداً الساعة ${vars.time} في ${vars.clinic}` : `Reminder: your appointment ${vars.ref} is tomorrow at ${vars.time} at ${vars.clinic}`,
    remind_2h: locale === "ar" ? `تذكير: موعدك ${vars.ref} بعد ساعتين في ${vars.clinic}` : `Reminder: your appointment ${vars.ref} is in 2 hours at ${vars.clinic}`,
  };
  const custom = brandTemplates?.[key];
  if (custom) {
    return Object.entries(vars).reduce((acc, [k, v]) => acc.replaceAll(`{${k}}`, v), custom);
  }
  return defaults[key] || key;
}

// ---------------------------------------------------------------------------
// Rate limiting (writes): per-IP 20/min + per-phone daily cap (env-tunable)
// ---------------------------------------------------------------------------
const WRITE_IP_LIMIT = 20;
const writeBuckets = new Map<string, { count: number; resetAt: number }>();

function clientIpOf(req: Request): string {
  const cf = req.headers["cf-connecting-ip"];
  if (typeof cf === "string" && cf.trim()) return cf.trim();
  const xff = req.headers["x-forwarded-for"];
  if (typeof xff === "string" && xff.trim()) return xff.split(",")[0].trim();
  return req.ip || req.socket.remoteAddress || "unknown";
}

function writeRateLimit(req: Request, res: Response): boolean {
  const key = clientIpOf(req);
  const now = Date.now();
  let b = writeBuckets.get(key);
  if (!b || b.resetAt < now) {
    b = { count: 0, resetAt: now + 60_000 };
    writeBuckets.set(key, b);
  }
  b.count += 1;
  if (b.count > WRITE_IP_LIMIT) {
    res.status(429).json({ error: "rate_limited" });
    return false;
  }
  return true;
}

function phoneDailyCap(): number {
  const n = Number(process.env.HUB_PHONE_DAILY_CAP || "5");
  return Number.isInteger(n) && n > 0 ? n : 5;
}

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------
export function registerHubBookingRoutes(app: Express) {
  if (!dbEnabled) return;

  // ---- Create held booking (Part 6.2) ----
  app.post("/api/hub/:brand/bookings", async (req, res) => {
    if (!writeRateLimit(req, res)) return;
    try {
      const brandParam = String(req.params.brand || "");
      if (!/^[a-z][a-z0-9_-]{0,31}$/.test(brandParam)) return res.status(400).json({ error: "invalid_brand" });
      const brand = await getBrandRow(brandParam);
      if (!brand?.booking_enabled) return res.status(404).json({ error: "booking_unavailable" });

      const parsed = createBookingSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: "invalid_input", fields: parsed.error.issues.map((i) => i.path.join(".")).slice(0, 10) });
      const input = parsed.data;
      if (input.website) return res.status(400).json({ error: "invalid_input" }); // honeypot tripped

      const phone = normalizeSaudiPhone(input.phone);
      if (!phone) return res.status(400).json({ error: "invalid_phone" });

      const clinic = await getClinicRow(input.clinicId);
      if (!clinic || clinic.brand !== brand.brand) return res.status(404).json({ error: "unknown_clinic" });
      if (!clinic.booking_enabled) return res.status(404).json({ error: "booking_unavailable" });

      // Per-phone daily cap (Part 6.2)
      const today = await pool.query(
        `SELECT COUNT(*)::int AS c FROM hub_bookings WHERE customer_phone = $1 AND created_at > NOW() - interval '1 day' AND status NOT IN ('expired','failed','cancelled')`,
        [phone],
      );
      if (today.rows[0].c >= phoneDailyCap()) return res.status(429).json({ error: "daily_booking_cap_reached" });

      // Slot window
      const startMs = Date.parse(input.start);
      if (Number.isNaN(startMs) || startMs < Date.now() - 60_000) return res.status(400).json({ error: "invalid_start" });
      const holdMinutes = Number(clinic.slot_hold_minutes) || 15;
      const start = new Date(startMs);
      const end = new Date(startMs + input.durationMinutes * 60_000);
      const day = start.toLocaleString("sv-SE", { timeZone: clinic.timezone || "Asia/Riyadh" }).slice(0, 10);

      // Re-check upstream availability (cache ≤60s allowed — Part 6.2)
      const slug = (clinic.config_json || {}).slug;
      if (slug) {
        try {
          const cacheKey = `avail:${slug}:${day}:${day}:${input.serviceId}::${input.durationMinutes}`;
          const { value } = await cached(cacheKey, 60, async () => ({
            data: await fetchDaySlots(slug, day, input.serviceId, input.durationMinutes),
          }));
          if (!slotMatches((value as any).data, input.start)) {
            return res.status(409).json({ error: "slot_unavailable" });
          }
        } catch (e: any) {
          if (e?.status === 503) return res.status(503).json({ error: "upstream_unavailable" });
          // Degradation matrix (A13): never fabricate availability — fail safe.
          return res.status(503).json({ error: "availability_uncertain" });
        }
      }

      // Idempotent create (Part 6.1)
      const existing = await pool.query(`SELECT * FROM hub_bookings WHERE idempotency_key = $1 LIMIT 1`, [input.idempotencyKey]);
      if (existing.rows[0]) {
        const b = existing.rows[0];
        return res.json({ booking: publicBooking(b), ref: referenceCode(brand.brand, b.id), idempotent: true });
      }

      const id = crypto.randomUUID();
      // G3: resolve the payment mode for THIS customer at hold time (dynamic
      // deposit policy from brand config_json; static fallback when the
      // feature flag or rule is off). Snapshot is stored on the booking.
      const resolvedPayment = await resolvePaymentModeForHold(brand, clinic, phone);
      const serviceJson = {
        service_id: input.serviceId,
        name: input.serviceName || null,
        doctor_id: input.doctorId || null,
        doctor_name: input.doctorName || null,
        starts_at: start.toISOString(),
        ends_at: end.toISOString(),
        duration_minutes: input.durationMinutes,
      };
      await pool.query(
        `INSERT INTO hub_bookings (id, brand, clinic_id, status, idempotency_key, customer_name, customer_phone, pet_snapshot_json, service_json, hold_expires_at, locale, source_json, payment_mode_effective)
         VALUES ($1,$2,$3,'held',$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
        [id, brand.brand, clinic.id, input.idempotencyKey, input.customerName, phone, JSON.stringify(input.pet), JSON.stringify(serviceJson), new Date(Date.now() + holdMinutes * 60_000), input.locale, JSON.stringify(input.source || {}), resolvedPayment.mode],
      );
      await audit(`customer:anon`, "booking.create", "hub_bookings", id, { brand: brand.brand, clinic: clinic.id, phone: maskPhone(phone) });
      if (resolvedPayment.source === "dynamic_rule") {
        await audit("system", "deposit.dynamic_required", "hub_bookings", id, { mode: resolvedPayment.mode, no_show_count: resolvedPayment.no_show_count ?? 0 });
      }
      const created = await pool.query(`SELECT * FROM hub_bookings WHERE id = $1`, [id]);
      res.json({ booking: publicBooking(created.rows[0]), ref: referenceCode(brand.brand, id) });
    } catch (error: any) {
      safeErr(res, error, "booking_create_failed");
    }
  });

  // ---- OTP request (Part 6.2) ----
  app.post("/api/hub/:brand/bookings/:id/otp/request", async (req, res) => {
    if (!writeRateLimit(req, res)) return;
    try {
      const b = await loadBookingForWrite(req, res);
      if (!b) return;
      if (b.customer_phone_verified) return res.status(400).json({ error: "already_verified" });

      const consent = req.body?.consent === true;
      const consentAt = typeof req.body?.consentAt === "string" ? req.body.consentAt : null;
      if (!consent || !consentAt || Number.isNaN(Date.parse(consentAt))) {
        return res.status(400).json({ error: "pdpl_consent_required" });
      }

      // Resend cooldown + per-phone hourly cap
      const recent = await pool.query(
        `SELECT created_at FROM hub_otp_codes WHERE phone = $1 ORDER BY created_at DESC LIMIT 1`,
        [b.customer_phone],
      );
      if (recent.rows[0] && Date.now() - new Date(recent.rows[0].created_at).getTime() < OTP_RESEND_COOLDOWN_SECONDS * 1000) {
        const wait = OTP_RESEND_COOLDOWN_SECONDS - Math.floor((Date.now() - new Date(recent.rows[0].created_at).getTime()) / 1000);
        return res.status(429).json({ error: "otp_resend_cooldown", retry_after_seconds: wait });
      }
      const hourly = await pool.query(`SELECT COUNT(*)::int AS c FROM hub_otp_codes WHERE phone = $1 AND created_at > NOW() - interval '1 hour'`, [b.customer_phone]);
      if (hourly.rows[0].c >= OTP_REQUESTS_PER_PHONE_PER_HOUR) return res.status(429).json({ error: "otp_hourly_cap" });

      const code = String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");
      await pool.query(`INSERT INTO hub_otp_codes (id, phone, code_hash, expires_at) VALUES ($1,$2,$3,$4)`, [
        crypto.randomUUID(),
        b.customer_phone,
        hashOtp(b.customer_phone, code),
        new Date(Date.now() + OTP_TTL_MINUTES * 60_000),
      ]);
      // Persist consent on the (future) customer record at verify time; stash on booking for now.
      await pool.query(`UPDATE hub_bookings SET source_json = source_json || $2::jsonb, updated_at = NOW() WHERE id = $1`, [b.id, JSON.stringify({ pdpl_consent_at: consentAt })]);

      const provider = getMessagingProvider();
      const body = renderTemplate("otp", { code }, b.locale, (b.brand_config || {}).templates);
      await provider.sendSms(b.customer_phone, body, (b.brand_config || {}).smsSenderId);
      await audit(`customer:anon`, "otp.request", "hub_bookings", b.id, { phone: maskPhone(b.customer_phone) });
      res.json({ sent: true, expires_in_seconds: OTP_TTL_MINUTES * 60, resend_after_seconds: OTP_RESEND_COOLDOWN_SECONDS });
    } catch (error: any) {
      safeErr(res, error, "otp_request_failed");
    }
  });

  // ---- OTP verify + identity resolution (Part 6.2 / Recommendation #1) ----
  app.post("/api/hub/:brand/bookings/:id/otp/verify", async (req, res) => {
    if (!writeRateLimit(req, res)) return;
    try {
      const b = await loadBookingForWrite(req, res);
      if (!b) return;
      const code = String(req.body?.code || "").trim();
      if (!/^\d{6}$/.test(code)) return res.status(400).json({ error: "invalid_code_format" });

      const row = await pool.query(
        `SELECT * FROM hub_otp_codes WHERE phone = $1 AND consumed_at IS NULL AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1`,
        [b.customer_phone],
      );
      const otp = row.rows[0];
      if (!otp) return res.status(400).json({ error: "otp_expired" });
      if (otp.attempts >= OTP_MAX_ATTEMPTS) return res.status(429).json({ error: "otp_attempts_exceeded" });
      if (hashOtp(b.customer_phone, code) !== otp.code_hash) {
        await pool.query(`UPDATE hub_otp_codes SET attempts = attempts + 1 WHERE id = $1`, [otp.id]);
        return res.status(400).json({ error: "otp_incorrect", attempts_left: OTP_MAX_ATTEMPTS - otp.attempts - 1 });
      }
      await pool.query(`UPDATE hub_otp_codes SET consumed_at = NOW() WHERE id = $1`, [otp.id]);

      // Identity resolution: find-or-create hub_customers by verified phone.
      const consentAt = (b.source_json || {}).pdpl_consent_at || null;
      let customer = (await pool.query(`SELECT * FROM hub_customers WHERE phone = $1 LIMIT 1`, [b.customer_phone])).rows[0];
      if (!customer) {
        const cid = crypto.randomUUID();
        await pool.query(`INSERT INTO hub_customers (id, phone, name, locale, pdpl_consent_at) VALUES ($1,$2,$3,$4,$5)`, [cid, b.customer_phone, b.customer_name, b.locale, consentAt]);
        customer = (await pool.query(`SELECT * FROM hub_customers WHERE id = $1`, [cid])).rows[0];
      } else if (!customer.pdpl_consent_at && consentAt) {
        await pool.query(`UPDATE hub_customers SET pdpl_consent_at = $2 WHERE id = $1`, [customer.id, consentAt]);
      }

      // Link booking + upsert pet record (persistent entity, snapshot stays immutable)
      const petSnap = b.pet_snapshot_json || {};
      let petId: string | null = null;
      const existingPet = await pool.query(
        `SELECT id FROM hub_pets WHERE customer_id = $1 AND brand = $2 AND lower(name) = lower($3) AND active = true LIMIT 1`,
        [customer.id, b.brand, petSnap.name || ""],
      );
      if (existingPet.rows[0]) {
        petId = existingPet.rows[0].id;
      } else {
        petId = crypto.randomUUID();
        await pool.query(
          `INSERT INTO hub_pets (id, customer_id, brand, name, species, breed, sex) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
          [petId, customer.id, b.brand, petSnap.name || "Pet", petSnap.species || "other", petSnap.breed || null, petSnap.sex || null],
        );
      }
      await pool.query(`UPDATE hub_bookings SET customer_phone_verified = true, customer_id = $2, pet_id = $3, updated_at = NOW() WHERE id = $1`, [b.id, customer.id, petId]);
      await audit(`customer:${customer.id}`, "otp.verified", "hub_bookings", b.id, { phone: maskPhone(b.customer_phone) });

      res.cookie("hub_customer", signCustomerCookie(customer.id), { httpOnly: true, secure: true, sameSite: "lax", maxAge: 30 * 24 * 3600 * 1000, path: "/" });
      res.json({ verified: true });
    } catch (error: any) {
      safeErr(res, error, "otp_verify_failed");
    }
  });

  // ---- Confirm pipeline (Part 6.1) ----
  app.post("/api/hub/:brand/bookings/:id/confirm", async (req, res) => {
    if (!writeRateLimit(req, res)) return;
    try {
      const b = await loadBookingForWrite(req, res);
      if (!b) return;
      const result = await runConfirmPipeline(b, `customer:${b.customer_id || "anon"}`);
      switch (result.outcome) {
        case "confirmed":
          return res.json({ confirmed: true, ref: result.ref, starts_at: result.startsAt, ends_at: result.endsAt, idempotent: result.idempotent });
        case "conflict":
          return res.status(409).json({ error: "slot_taken", alternatives: result.alternatives });
        case "invalid_state":
          return res.status(409).json({ error: `invalid_state_${result.state}` });
        case "otp_required":
          return res.status(400).json({ error: "otp_required" });
        case "hold_expired":
          return res.status(410).json({ error: "hold_expired" });
        default:
          return res.status(503).json({ error: "upstream_unavailable_keep_hold" });
      }
    } catch (error: any) {
      safeErr(res, error, "booking_confirm_failed");
    }
  });

  // ---- Customer cancel (Part 6.2) ----
  app.post("/api/hub/:brand/bookings/:id/cancel", async (req, res) => {
    if (!writeRateLimit(req, res)) return;
    try {
      const b = await loadBookingForWrite(req, res);
      if (!b) return;
      if (!["held", "confirmed"].includes(b.status)) return res.status(409).json({ error: `invalid_state_${b.status}` });

      const startMs = Date.parse((b.service_json || {}).starts_at || "");
      const moreThan2h = !Number.isNaN(startMs) && startMs - Date.now() > 2 * 3600_000;
      if (b.status === "confirmed" && moreThan2h) {
        const code = String(req.body?.otpCode || "").trim();
        const row = await pool.query(
          `SELECT * FROM hub_otp_codes WHERE phone = $1 AND consumed_at IS NULL AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1`,
          [b.customer_phone],
        );
        const otp = row.rows[0];
        if (!/^\d{6}$/.test(code) || !otp || hashOtp(b.customer_phone, code) !== otp.code_hash) {
          return res.status(400).json({ error: "otp_required_for_cancel" });
        }
        await pool.query(`UPDATE hub_otp_codes SET consumed_at = NOW() WHERE id = $1`, [otp.id]);
      }

      if (b.status === "confirmed" && b.digitail_appointment_id) {
        await digitailRequest("POST", `/appointments/${encodeURIComponent(b.digitail_appointment_id)}/cancel`);
      }
      await pool.query(`UPDATE hub_bookings SET status = 'cancelled', updated_at = NOW() WHERE id = $1`, [b.id]);
      await audit(`customer:${b.customer_id || "anon"}`, "booking.cancelled", "hub_bookings", b.id, {});
      res.json({ cancelled: true });
    } catch (error: any) {
      safeErr(res, error, "booking_cancel_failed");
    }
  });

  // ---- Booking status (widget polling) ----
  app.get("/api/hub/:brand/bookings/:id", async (req, res) => {
    try {
      const b = await loadBookingForWrite(req, res, { requirePhone: false });
      if (!b) return;
      let payment: any = null;
      if (b.payment_id) {
        const p = await pool.query(`SELECT status, amount_halalas, currency FROM hub_payments WHERE id = $1`, [b.payment_id]);
        payment = p.rows[0] || null;
      }
      res.json({ booking: publicBooking(b), ref: referenceCode(b.brand, b.id), payment });
    } catch (error: any) {
      safeErr(res, error, "booking_read_failed");
    }
  });

  // ---- Admin: bookings list / override / notifications log ----
  app.get("/api/hub/admin/bookings", requireAdmin, async (req, res) => {
    try {
      const brand = typeof req.query.brand === "string" ? req.query.brand : null;
      const status = typeof req.query.status === "string" ? req.query.status : null;
      const q = typeof req.query.q === "string" ? `%${req.query.q}%` : null;
      const rows = await pool.query(
        `SELECT id, brand, clinic_id, status, customer_name, customer_phone, service_json, digitail_appointment_id, created_at, updated_at
         FROM hub_bookings
         WHERE ($1::varchar IS NULL OR brand = $1) AND ($2::varchar IS NULL OR status = $2)
           AND ($3::varchar IS NULL OR customer_name ILIKE $3 OR customer_phone ILIKE $3 OR id::text ILIKE $3)
         ORDER BY created_at DESC LIMIT 100`,
        [brand, status, q],
      );
      res.json({ bookings: rows.rows.map((b) => ({ ...b, customer_phone: maskPhone(b.customer_phone), ref: referenceCode(b.brand, b.id) })) });
    } catch (error: any) {
      safeErr(res, error, "admin_bookings_failed");
    }
  });

  app.patch("/api/hub/admin/bookings/:id", requireAdmin, async (req, res) => {
    try {
      const updates: string[] = [];
      const values: any[] = [];
      const meta: Record<string, any> = {};
      if ("status" in (req.body || {})) {
        const to = String(req.body?.status || "");
        if (!["held", "confirmed", "failed", "cancelled", "expired", "completed", "no_show", "pending_payment"].includes(to)) {
          return res.status(400).json({ error: "invalid_status" });
        }
        values.push(to);
        updates.push(`status = $${values.length}`);
        meta.to = to;
      }
      // G3: admin override of the resolved payment mode (audited). null clears
      // the override and returns the booking to its hold-time snapshot.
      if ("payment_mode_override" in (req.body || {})) {
        const o = req.body.payment_mode_override;
        if (!(o === null || ["off", "optional", "required_deposit"].includes(String(o)))) {
          return res.status(400).json({ error: "invalid_payment_mode_override" });
        }
        values.push(o === null ? null : String(o));
        updates.push(`payment_mode_override = $${values.length}`);
        meta.payment_mode_override = o;
      }
      if (!updates.length) return res.status(400).json({ error: "no_fields" });
      values.push(String(req.params.id));
      const r = await pool.query(`UPDATE hub_bookings SET ${updates.join(", ")}, updated_at = NOW() WHERE id = $${values.length} RETURNING id, brand, status, payment_mode_override`, values);
      if (!r.rows[0]) return res.status(404).json({ error: "unknown_booking" });
      await audit(`admin:${(req.session as any)?.adminId || "unknown"}`, "booking.admin_override", "hub_bookings", String(req.params.id), meta);
      res.json({ updated: r.rows[0] });
    } catch (error: any) {
      safeErr(res, error, "admin_override_failed");
    }
  });

  app.get("/api/hub/admin/notifications", requireAdmin, async (_req, res) => {
    try {
      const rows = await pool.query(`SELECT id, booking_id, kind, channel, to_phone, template_key, status, attempt_count, scheduled_at, sent_at FROM hub_notifications ORDER BY created_at DESC LIMIT 100`);
      res.json({ notifications: rows.rows.map((n) => ({ ...n, to_phone: maskPhone(n.to_phone) })) });
    } catch (error: any) {
      safeErr(res, error, "admin_notifications_failed");
    }
  });

  // ---- Hub health (Part 9.4 — admin) ----
  app.get("/api/hub/health", requireAdmin, async (_req, res) => {
    try {
      const q = await pool.query(`SELECT status, COUNT(*)::int AS c FROM hub_notifications GROUP BY status`);
      const counts: Record<string, number> = {};
      for (const r of q.rows) counts[r.status] = r.c;
      const recon = await pool.query(`SELECT created_at FROM hub_audit_log WHERE action = 'recon.completed' ORDER BY created_at DESC LIMIT 1`);
      const emergencyQ = await pool.query(`SELECT status, COUNT(*)::int AS c FROM hub_emergency_requests GROUP BY status`);
      const emergencyCounts: Record<string, number> = {};
      for (const r of emergencyQ.rows) emergencyCounts[r.status] = r.c;
      res.json({
        db: "up",
        digitail: digitailCircuitState(),
        messaging: { provider: (process.env.MESSAGING_PROVIDER || "stub").toLowerCase(), whatsapp_enabled: whatsappEnabled() },
        myfatoorah: {
          configured: !!process.env.MYFATOORAH_API_KEY,
          mode: process.env.MYFATOORAH_MODE || "test",
          webhook_configured: !!process.env.MYFATOORAH_WEBHOOK_SECRET,
          reconciliation_last_run: recon.rows[0]?.created_at || null,
        },
        emergency: { enabled: (process.env.EMERGENCY_PATH_ENABLED || "false").toLowerCase() === "true", requests: emergencyCounts },
        notifications: counts,
        sweeper: { enabled: sweeperEnabled(), lastRun: sweeperLastRun?.toISOString() || null, intervalMs: SWEEP_INTERVAL_MS },
      });
    } catch (error: any) {
      safeErr(res, error, "hub_health_failed");
    }
  });

  startSweeper();
}

// ---------------------------------------------------------------------------
// Shared loaders / shaping
// ---------------------------------------------------------------------------
async function loadBookingForWrite(req: Request, res: Response, opts: { requirePhone?: boolean } = {}): Promise<any | null> {
  const id = String(req.params.id || "");
  if (!/^[0-9a-f-]{36}$/i.test(id)) {
    res.status(400).json({ error: "invalid_booking_id" });
    return null;
  }
  const r = await pool.query(`SELECT * FROM hub_bookings WHERE id = $1 AND brand = $2 LIMIT 1`, [id, String(req.params.brand || "")]);
  const b = r.rows[0];
  if (!b) {
    res.status(404).json({ error: "unknown_booking" });
    return null;
  }
  if (opts.requirePhone !== false) {
    // Bind mutations to the booking's phone: caller must supply it (except where OTP/session already auths).
    const supplied = normalizeSaudiPhone(String(req.body?.phone || req.query?.phone || ""));
    const cookieCustomer = verifyCustomerCookie(req.headers.cookie?.split(/;\s*/).find((c) => c.startsWith("hub_customer="))?.split("=")[1]);
    if (supplied !== b.customer_phone && (!cookieCustomer || cookieCustomer !== b.customer_id)) {
      res.status(403).json({ error: "booking_access_denied" });
      return null;
    }
  }
  const brand = await getBrandRow(b.brand);
  b.brand_config = brand?.config_json || {};
  return b;
}

function publicBooking(b: any) {
  return {
    id: b.id,
    brand: b.brand,
    clinic_id: b.clinic_id,
    status: b.status,
    customer_name: b.customer_name,
    phone_verified: b.customer_phone_verified,
    service: b.service_json,
    pet: b.pet_snapshot_json,
    hold_expires_at: b.hold_expires_at,
    created_at: b.created_at,
    // Non-PII analytics dimension needed to keep G8 attribution intact after
    // a payment redirect returns with only payment/booking query parameters.
    district: typeof b.source_json?.district === "string" && /^[a-z0-9-]{2,40}$/.test(b.source_json.district) ? b.source_json.district : null,
    // G3: effective payment mode for this booking (override > snapshot).
    // Non-PII; lets the widget render the correct payment step after OTP.
    payment_mode: b.payment_mode_override || b.payment_mode_effective || null,
  };
}

function nearestAlternatives(slots: any[], startIso: string): string[] {
  const target = Date.parse(startIso);
  const flatten = (v: any): string[] => {
    if (v == null) return [];
    if (typeof v === "string") return [v];
    if (Array.isArray(v)) return v.flatMap(flatten);
    if (typeof v === "object") return Object.values(v).flatMap(flatten);
    return [String(v)];
  };
  return flatten(slots)
    .filter((s) => !Number.isNaN(Date.parse(s)))
    .sort((a, b2) => Math.abs(Date.parse(a) - target) - Math.abs(Date.parse(b2) - target))
    .slice(0, 3);
}

// Map widget species (ar/en quick-chips) to Digitail species id via the live
// /species list (6h cache) — never a hardcoded guess table.
async function mapSpeciesId(species: string | undefined): Promise<number | undefined> {
  if (!species) return undefined;
  try {
    const { value } = await cached("digitail:species", 6 * 3600, async () => {
      const data = await digitailRequest("GET", "/species");
      return data?.data || [];
    });
    const s = species.trim().toLowerCase();
    const aliases: Record<string, string[]> = {
      cat: ["cat", "قط", "قطة", "cats"],
      dog: ["dog", "كلب", "dogs"],
      bird: ["bird", "طائر", "طيور", "birds"],
      reptile: ["reptile", "زواحف", "reptiles"],
    };
    const entry = Object.entries(aliases).find(([, names]) => names.includes(s));
    const wanted = entry?.[0] || s;
    const list = value as any[];
    // Real Digitail species payload exposes the name under `species`/`label`
    // (NOT `name`) — live-verified 2026-09-23: [{"id":3,"label":"Cat","species":"Cat"}].
    const match = list.find((sp: any) => {
      const names = [sp?.species, sp?.label, sp?.name].filter((v) => v != null).map((v) => String(v).toLowerCase());
      return names.includes(wanted);
    });
    return match?.id ? Number(match.id) : undefined;
  } catch {
    return undefined;
  }
}

async function defaultVetId(clinicDigitailId: number): Promise<string> {
  const data = await digitailRequest("GET", `/vets?filter%5Bclinic_id%5D=${clinicDigitailId}`);
  const first = (data?.data || [])[0];
  if (!first?.id) throw new Error("no_vet_available_upstream");
  return String(first.id);
}

// ---------------------------------------------------------------------------
// Sweeper (Part 6.1/9.3): expire holds, dispatch notifications, purge OTPs.
// Single-instance safe via a Postgres advisory lock; restart-resumable.
// ---------------------------------------------------------------------------
function sweeperEnabled(): boolean {
  return (process.env.HUB_SWEEPER_ENABLED || "true").toLowerCase() !== "false";
}

export function startSweeper() {
  if (sweeperTimer || !sweeperEnabled()) return;
  sweeperTimer = setInterval(runSweep, SWEEP_INTERVAL_MS);
  sweeperTimer.unref();
  setTimeout(runSweep, 5000).unref();
}

async function runSweep() {
  try {
    const lock = await pool.query(`SELECT pg_try_advisory_lock($1) AS got`, [ADVISORY_LOCK_KEY]);
    if (!lock.rows[0]?.got) return;
    try {
      const expired = await pool.query(
        `UPDATE hub_bookings SET status = 'expired', updated_at = NOW()
         WHERE status IN ('held','pending_payment') AND hold_expires_at IS NOT NULL AND hold_expires_at < NOW()
         RETURNING id`,
      );
      for (const row of expired.rows) {
        await audit("system", "booking.expired", "hub_bookings", row.id, {});
      }
      await dispatchDueNotifications();
      await pool.query(`DELETE FROM hub_otp_codes WHERE created_at < NOW() - interval '24 hours'`);
      sweeperLastRun = new Date();
    } finally {
      await pool.query(`SELECT pg_advisory_unlock($1)`, [ADVISORY_LOCK_KEY]);
    }
  } catch (e: any) {
    console.error(JSON.stringify({ level: "error", msg: "sweeper_failed", error: redactErrorMessage(e) }));
  }
}

// ---------------------------------------------------------------------------
// Exported confirm pipeline (Part 6.1) — used by the public confirm route AND
// the Phase 3 payment webhook (Part 7.1: confirm ONLY after verified payment).
// Idempotent: re-entry on a confirmed booking returns the same reference.
// ---------------------------------------------------------------------------
export type ConfirmResult =
  | { outcome: "confirmed"; ref: string; idempotent: boolean; startsAt?: string; endsAt?: string }
  | { outcome: "conflict"; alternatives: string[] }
  | { outcome: "invalid_state"; state: string }
  | { outcome: "otp_required" }
  | { outcome: "hold_expired" }
  | { outcome: "upstream_error" };

export async function runConfirmPipeline(b: any, actor: string): Promise<ConfirmResult> {
  if (b.status === "confirmed" && b.digitail_appointment_id) {
    return { outcome: "confirmed", ref: referenceCode(b.brand, b.id), idempotent: true };
  }
  if (b.status !== "held" && b.status !== "pending_payment") {
    return { outcome: "invalid_state", state: b.status };
  }

  // Atomic claim (race protection, live-verified 2026-09-23): two concurrent
  // confirms of the SAME booking both passed the status read above and each
  // created an upstream appointment (orphan 23807). Claim the booking by
  // flipping it to the transient 'confirming' state in ONE conditional UPDATE
  // — Postgres row locking serializes concurrent claims, so losers re-evaluate
  // the WHERE after the winner commits and get rowCount 0.
  const claim = await pool.query(
    `UPDATE hub_bookings SET status = 'confirming', updated_at = NOW() WHERE id = $1 AND status IN ('held','pending_payment') RETURNING id`,
    [b.id],
  );
  if (claim.rowCount === 0) {
    const cur = await loadBookingById(b.id);
    if (cur?.status === "confirmed" && cur?.digitail_appointment_id) {
      return { outcome: "confirmed", ref: referenceCode(cur.brand, cur.id), idempotent: true };
    }
    return { outcome: "invalid_state", state: cur?.status || "unknown" };
  }
  if (!b.customer_phone_verified) return { outcome: "otp_required" };
  if (b.hold_expires_at && new Date(b.hold_expires_at).getTime() < Date.now()) {
    await pool.query(`UPDATE hub_bookings SET status = 'expired', updated_at = NOW() WHERE id = $1`, [b.id]);
    return { outcome: "hold_expired" };
  }

  const clinic = await getClinicRow(b.clinic_id);
  const svc = b.service_json || {};
  const day = new Date(svc.starts_at).toLocaleString("sv-SE", { timeZone: clinic?.timezone || "Asia/Riyadh" }).slice(0, 10);
  const slug = (clinic?.config_json || {}).slug;

  // (1) Re-check upstream availability immediately before creation.
  if (slug) {
    try {
      const slots = await fetchDaySlots(slug, day, svc.service_id, svc.duration_minutes || 30);
      if (!slotMatches(slots, svc.starts_at)) {
        await pool.query(`UPDATE hub_bookings SET status = 'failed', updated_at = NOW() WHERE id = $1`, [b.id]);
        await audit("system", "booking.conflict", "hub_bookings", b.id, { reason: "slot_taken_at_confirm", clinic: b.clinic_id });
        const alternatives = nearestAlternatives(slots, svc.starts_at);
        return { outcome: "conflict", alternatives };
      }
    } catch (e: any) {
      if (e?.status === 503) return { outcome: "upstream_error" };
      return { outcome: "upstream_error" };
    }
  }

  // (2) Single upstream write — idempotency owned by this layer.
  try {
    const vetId = svc.doctor_id || (await defaultVetId(clinic.digitail_clinic_id));
    const parentId = await findOrCreatePetParent(clinic.digitail_clinic_id, b.customer_name, b.customer_phone);
    const petSnap = b.pet_snapshot_json || {};
    const speciesId = await mapSpeciesId(petSnap.species);
    const patientId = await createDigitailPet(clinic.digitail_clinic_id, vetId, parentId, petSnap, speciesId);
    const appt = await digitailRequest("POST", "/appointments", {
      clinic_id: clinic.digitail_clinic_id,
      vet_id: Number(vetId),
      patient_id: Number(patientId),
      visit_type_id: Number(svc.service_id),
      datetime_start_utc: new Date(svc.starts_at).toISOString(),
      datetime_end_utc: new Date(svc.ends_at || new Date(new Date(svc.starts_at).getTime() + (svc.duration_minutes || 30) * 60_000)).toISOString(),
      // Required by the live Digitail contract (verified 2026-09-23): an empty
      // reminder list — notifications are owned by our own scheduler.
      reminder_notifications: [],
    });
    const apptId = String(appt?.data?.id);
    await pool.query(`UPDATE hub_bookings SET status = 'confirmed', digitail_appointment_id = $2, updated_at = NOW() WHERE id = $1`, [b.id, apptId]);
    await pool.query(`UPDATE hub_pets SET digitail_patient_id = $2, digitail_parent_id = $3, updated_at = NOW() WHERE id = $1`, [b.pet_id, patientId, parentId]);

    // (3) Notifications: confirm now + reminders scheduled.
    const ref = referenceCode(b.brand, b.id);
    const vars = {
      ref,
      clinic: b.locale === "ar" ? clinic.name_ar : clinic.name_en,
      date: new Date(svc.starts_at).toLocaleString("sv-SE", { timeZone: "Asia/Riyadh" }).slice(0, 10),
      time: new Date(svc.starts_at).toLocaleString("sv-SE", { timeZone: "Asia/Riyadh" }).slice(11, 16),
    };
    const templates = ((await getBrandRow(b.brand))?.config_json || {}).templates;
    await enqueueNotification({ bookingId: b.id, kind: "confirm", channel: "sms", toPhone: b.customer_phone, templateKey: "confirm", payload: { body: renderTemplate("confirm", vars, b.locale, templates) }, scheduledAt: new Date(), respectQuietHours: false });
    const startMs2 = new Date(svc.starts_at).getTime();
    for (const [kind, offsetMs] of [["remind_24h", 24 * 3600_000], ["remind_2h", 2 * 3600_000]] as const) {
      const at = new Date(startMs2 - offsetMs);
      if (at.getTime() > Date.now() + 60_000) {
        await enqueueNotification({ bookingId: b.id, kind, channel: "sms", toPhone: b.customer_phone, templateKey: kind, payload: { body: renderTemplate(kind, vars, b.locale, templates) }, scheduledAt: at });
      }
    }
    await audit(actor, "booking.confirmed", "hub_bookings", b.id, { ref, appointment: apptId });
    return { outcome: "confirmed", ref, idempotent: false, startsAt: svc.starts_at, endsAt: svc.ends_at };
  } catch (e: any) {
    if (e?.status === 409 || e?.status === 422) {
      await pool.query(`UPDATE hub_bookings SET status = 'failed', updated_at = NOW() WHERE id = $1`, [b.id]);
      let alternatives: string[] = [];
      if (slug) {
        try {
          alternatives = nearestAlternatives(await fetchDaySlots(slug, day, svc.service_id, svc.duration_minutes || 30), svc.starts_at);
        } catch {}
      }
      await audit("system", "booking.conflict", "hub_bookings", b.id, { reason: "upstream_conflict", status: e.status });
      return { outcome: "conflict", alternatives };
    }
    // Transient upstream failure: release the claim back to the original
    // state so the caller (webhook retry / sweeper) can try again instead of
    // the booking being stuck in the transient 'confirming' state.
    await pool.query(`UPDATE hub_bookings SET status = $2, updated_at = NOW() WHERE id = $1 AND status = 'confirming'`, [b.id, b.status]);
    await audit("system", "booking.confirm_upstream_error", "hub_bookings", b.id, { status: e?.status || 0 });
    return { outcome: "upstream_error" };
  }
}

export async function loadBookingById(id: string) {
  const r = await pool.query(`SELECT * FROM hub_bookings WHERE id = $1 LIMIT 1`, [id]);
  return r.rows[0] || null;
}
