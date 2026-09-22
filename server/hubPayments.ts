import crypto from "crypto";
import type { Express, Request, Response } from "express";
import { pool, dbEnabled } from "./db";
import { requireAdmin } from "./admin";
import { runConfirmPipeline, loadBookingById, normalizeSaudiPhone } from "./hubBookings";
import { digitailRequest } from "./digitail";
import { enqueueNotification, audit } from "./messaging";
import { redactErrorMessage } from "./redact";

// ============================================================================
// Phase 3 (master document Part 7): MyFatoorah optional payment.
// - payment_mode ships OFF by default; enabled per brand/clinic from config.
// - Confirmation comes ONLY from the verified webhook — never the redirect.
// - Webhook: raw-body signature verification + replay protection + immediate
//   200 with async processing + full raw_webhook_json retention.
// - Missing MYFATOORAH_WEBHOOK_SECRET = go-live blocker (code path implemented
//   regardless; endpoint refuses to process without it).
// - Rollback: payment_mode=off → bookings confirm without payment (Part 7.4).
// ============================================================================

const MF_BASE = () =>
  process.env.MYFATOORAH_MODE === "live"
    ? process.env.MYFATOORAH_BASE_URL || "https://api-sa.myfatoorah.com"
    : "https://apitest.myfatoorah.com";

const RECON_ADVISORY_LOCK = 732_452;
let reconLastRun: Date | null = null;
let reconTimer: NodeJS.Timeout | null = null;

function mfConfigured() {
  return !!process.env.MYFATOORAH_API_KEY;
}

async function mfPost(path: string, body: any) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(`${MF_BASE()}${path}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.MYFATOORAH_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

// ---------------------------------------------------------------------------
// Webhook signature verification (MyFatoorah webhook v2).
// Canonical string: ordered "Key=Value" pairs (comma-separated) from Data,
// HMAC-SHA256 with the portal webhook secret, base64. The signed field list is
// env-configurable (MYFATOORAH_WEBHOOK_SIGNATURE_FIELDS, default
// "InvoiceId,InvoiceStatus") so a contract correction needs no code change.
// ---------------------------------------------------------------------------
function verifyWebhookSignature(rawBody: Buffer | undefined, data: any, signatureHeader: string | undefined): boolean {
  const secret = process.env.MYFATOORAH_WEBHOOK_SECRET;
  if (!secret) return false; // go-live blocker — never skip verification
  if (!signatureHeader || !data || typeof data !== "object") return false;
  const fields = (process.env.MYFATOORAH_WEBHOOK_SIGNATURE_FIELDS || "InvoiceId,InvoiceStatus")
    .split(",")
    .map((f) => f.trim())
    .filter(Boolean);
  const canonical = fields.map((f) => `${f}=${data[f] ?? ""}`).join(",");
  const expected = crypto.createHmac("sha256", secret).update(canonical).digest("base64");
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(String(signatureHeader)));
  } catch {
    return false;
  }
}

function paymentAmountFor(booking: any, clinic: any, brand: any): number | null {
  // required_deposit → clinic.deposit_amount_halalas; optional → service price
  // from the cached visit type, else brand config default. Never invented.
  const mode = clinic.payment_mode || brand.payment_mode;
  if (mode === "required_deposit") return clinic.deposit_amount_halalas ?? null;
  const svc = booking.service_json || {};
  if (svc.price_halalas) return svc.price_halalas;
  const cfgDefault = (brand.config_json || {}).optional_payment_amount_halalas;
  return typeof cfgDefault === "number" ? cfgDefault : null;
}

export function registerHubPaymentRoutes(app: Express) {
  if (!dbEnabled) return;

  // ---- Customer payment choice (Part 7.1) ----
  app.post("/api/hub/:brand/bookings/:id/payment-choice", async (req, res) => {
    try {
      const b = await loadBookingById(String(req.params.id || ""));
      if (!b || b.brand !== req.params.brand) return res.status(404).json({ error: "unknown_booking" });
      const supplied = normalizeSaudiPhone(String(req.body?.phone || ""));
      if (supplied !== b.customer_phone) return res.status(403).json({ error: "booking_access_denied" });
      if (!b.customer_phone_verified) return res.status(400).json({ error: "otp_required" });
      if (!["held", "pending_payment"].includes(b.status)) return res.status(409).json({ error: `invalid_state_${b.status}` });

      const brand = (await pool.query(`SELECT * FROM hub_brands WHERE brand = $1`, [b.brand])).rows[0];
      const clinic = (await pool.query(`SELECT * FROM hub_clinics WHERE id = $1`, [b.clinic_id])).rows[0];
      const mode = clinic.payment_mode || brand.payment_mode || "off";
      if (mode === "off") return res.status(400).json({ error: "payment_disabled" });

      const choice = String(req.body?.choice || "");
      if (mode === "optional" && choice === "clinic") {
        const result = await runConfirmPipeline(b, `customer:${b.customer_id || "anon"}`);
        if (result.outcome === "confirmed") return res.json({ confirmed: true, ref: result.ref });
        if (result.outcome === "conflict") return res.status(409).json({ error: "slot_taken", alternatives: result.alternatives });
        return res.status(503).json({ error: "upstream_unavailable_keep_hold" });
      }
      if (choice !== "now") return res.status(400).json({ error: "invalid_choice" });

      const amountHalalas = paymentAmountFor(b, clinic, brand);
      if (!amountHalalas || amountHalalas <= 0) return res.status(500).json({ error: "payment_amount_unconfigured" });
      if (!mfConfigured()) return res.status(503).json({ error: "payment_provider_unconfigured" });

      const idem = `pay:${b.id}`;
      const existing = await pool.query(`SELECT * FROM hub_payments WHERE idempotency_key = $1 LIMIT 1`, [idem]);
      if (existing.rows[0] && existing.rows[0].status === "initiated") {
        const raw = existing.rows[0].raw_webhook_json || {};
        return res.json({ paymentId: existing.rows[0].id, invoiceUrl: raw.invoice_url || null, idempotent: true });
      }

      const site = process.env.SITE_URL || "https://www.elitevetksa.com";
      const svc = b.service_json || {};
      const invoice = await mfPost("/v2/SendPayment", {
        CustomerName: b.customer_name,
        NotificationOption: "LNK",
        InvoiceValue: amountHalalas / 100,
        DisplayCurrencyIso: "SAR",
        CustomerMobile: b.customer_phone,
        CallBackUrl: `${site}/hub/${b.brand}?payment=return&booking=${b.id}`,
        ErrorUrl: `${site}/hub/${b.brand}?payment=error&booking=${b.id}`,
        Language: b.locale || "ar",
        CustomerReference: b.id,
        UserDefinedField: `hub:${b.brand}:${svc.service_id || ""}`,
      });
      if (!invoice?.IsSuccess) {
        await audit("system", "payment.initiate_failed", "hub_bookings", b.id, { reason: String(invoice?.Message || "unknown").slice(0, 200) });
        return res.status(502).json({ error: "payment_initiate_failed" });
      }
      const paymentId = crypto.randomUUID();
      await pool.query(
        `INSERT INTO hub_payments (id, booking_id, provider_invoice_id, amount_halalas, status, idempotency_key, raw_webhook_json)
         VALUES ($1,$2,$3,$4,'initiated',$5,$6)
         ON CONFLICT (idempotency_key) DO UPDATE SET provider_invoice_id = EXCLUDED.provider_invoice_id, raw_webhook_json = EXCLUDED.raw_webhook_json, updated_at = NOW()`,
        [paymentId, b.id, String(invoice.Data.InvoiceId), amountHalalas, idem, JSON.stringify({ invoice_url: invoice.Data.InvoiceURL })],
      );
      await pool.query(`UPDATE hub_bookings SET status = 'pending_payment', payment_id = $2, updated_at = NOW() WHERE id = $1`, [b.id, paymentId]);
      await enqueueNotification({
        bookingId: b.id,
        kind: "payment_link",
        channel: "sms",
        toPhone: b.customer_phone,
        templateKey: "payment_link",
        payload: { body: b.locale === "ar" ? `أكمل الدفع لتأكيد حجزك: ${invoice.Data.InvoiceURL}` : `Complete payment to confirm your booking: ${invoice.Data.InvoiceURL}` },
        scheduledAt: new Date(),
        respectQuietHours: false,
      });
      await audit(`customer:${b.customer_id || "anon"}`, "payment.initiated", "hub_payments", paymentId, { booking: b.id, invoice: String(invoice.Data.InvoiceId) });
      res.json({ paymentId, invoiceUrl: invoice.Data.InvoiceURL });
    } catch (error: any) {
      console.error(JSON.stringify({ level: "error", msg: "payment_choice_failed", error: redactErrorMessage(error) }));
      res.status(500).json({ error: "payment_choice_failed" });
    }
  });

  // ---- Webhook (Part 7.2) — source of truth for payment confirmation ----
  app.post("/api/hub/payments/myfatoorah/webhook", async (req: any, res: Response) => {
    // Always answer 200 immediately; process async (Part 7.2).
    res.status(200).json({ received: true });
    const raw = req.rawBody;
    const body = req.body || {};
    const signature = req.headers["myfatoorah-signature"] as string | undefined;
    setImmediate(async () => {
      try {
        if (!process.env.MYFATOORAH_WEBHOOK_SECRET) {
          await audit("system", "payment.webhook_blocked_no_secret", "hub_payments", "unknown", { note: "MYFATOORAH_WEBHOOK_SECRET missing — go-live blocker" });
          return;
        }
        const data = body?.Data || {};
        if (!verifyWebhookSignature(raw, data, signature)) {
          await audit("system", "payment.webhook_bad_signature", "hub_payments", String(data?.InvoiceId || "unknown"), {});
          return;
        }
        const invoiceId = String(data?.InvoiceId || "");
        const status = String(data?.InvoiceStatus || "");
        const txRef = String(data?.TransactionId || data?.PaymentId || "");
        if (!invoiceId) return;

        // Replay protection (Part 7.2): same invoice+status+tx processed once.
        const pay = await pool.query(`SELECT * FROM hub_payments WHERE provider_invoice_id = $1 LIMIT 1`, [invoiceId]);
        if (!pay.rows[0]) {
          await audit("system", "payment.webhook_unknown_invoice", "hub_payments", invoiceId, {});
          return;
        }
        const p = pay.rows[0];
        const priorEvents = (p.raw_webhook_json?.events || []) as string[];
        const eventKey = `${invoiceId}:${status}:${txRef}`;
        if (priorEvents.includes(eventKey)) return; // duplicate delivery — idempotent

        await pool.query(
          `UPDATE hub_payments SET raw_webhook_json = jsonb_set(COALESCE(raw_webhook_json,'{}'::jsonb), '{events}', COALESCE(raw_webhook_json->'events','[]'::jsonb) || $2::jsonb), updated_at = NOW() WHERE id = $1`,
          [p.id, JSON.stringify([eventKey])],
        );
        await pool.query(`UPDATE hub_payments SET raw_webhook_json = raw_webhook_json || $2::jsonb WHERE id = $1`, [p.id, JSON.stringify({ last_webhook: body })]);

        const booking = await loadBookingById(p.booking_id);
        if (!booking) return;

        if (status === "Paid" && p.status !== "paid") {
          await pool.query(`UPDATE hub_payments SET status = 'paid', updated_at = NOW() WHERE id = $1 AND status != 'paid'`, [p.id]);
          await audit("system", "payment.paid", "hub_payments", p.id, { booking: booking.id });
          const result = await runConfirmPipeline(booking, "system");
          if (result.outcome !== "confirmed") {
            await audit("system", "payment.confirm_after_paid_failed", "hub_bookings", booking.id, { outcome: result.outcome });
          } else {
            const receiptUrl = p.raw_webhook_json?.invoice_url || null;
            if (receiptUrl) {
              await enqueueNotification({
                bookingId: booking.id,
                kind: "receipt",
                channel: "sms",
                toPhone: booking.customer_phone,
                templateKey: "receipt",
                payload: { body: booking.locale === "ar" ? `إيصال الدفع لحجزك: ${receiptUrl}` : `Payment receipt for your booking: ${receiptUrl}` },
                scheduledAt: new Date(),
                respectQuietHours: false,
              });
            }
          }
        } else if (["Failed", "Expired"].includes(status) && p.status !== "failed") {
          await pool.query(`UPDATE hub_payments SET status = 'failed', updated_at = NOW() WHERE id = $1`, [p.id]);
          // Release hold + one-tap re-pay/fresh-booking notification (Part 7.1)
          await pool.query(`UPDATE hub_bookings SET status = 'failed', updated_at = NOW() WHERE id = $1 AND status = 'pending_payment'`, [booking.id]);
          const freshBookingUrl = `${process.env.SITE_URL || "https://www.elitevetksa.com"}/hub/${booking.brand}`;
          await enqueueNotification({
            bookingId: booking.id,
            kind: "payment_failed",
            channel: "sms",
            toPhone: booking.customer_phone,
            templateKey: "payment_failed",
            payload: { body: booking.locale === "ar" ? `لم يتم الدفع — يمكنك بدء حجز جديد من هنا: ${freshBookingUrl}` : `Payment failed — start a fresh booking here: ${freshBookingUrl}` },
            scheduledAt: new Date(),
            respectQuietHours: false,
          });
          await audit("system", "payment.failed", "hub_payments", p.id, { booking: booking.id, upstreamStatus: status });
        }
      } catch (e: any) {
        console.error(JSON.stringify({ level: "error", msg: "payment_webhook_processing_failed", error: redactErrorMessage(e) }));
      }
    });
  });

  // ---- Admin: reconciliation report (Part 7.3) ----
  app.get("/api/hub/admin/payments/reconciliation", requireAdmin, async (_req, res) => {
    try {
      const rows = await pool.query(
        `SELECT p.id, p.booking_id, p.provider_invoice_id, p.amount_halalas, p.status, p.updated_at, b.status AS booking_status
         FROM hub_payments p JOIN hub_bookings b ON b.id = p.booking_id
         ORDER BY p.updated_at DESC LIMIT 100`,
      );
      const discrepancies = rows.rows.filter(
        (r) => (r.status === "paid" && r.booking_status !== "confirmed") || (r.status === "initiated" && Date.now() - new Date(r.updated_at).getTime() > 24 * 3600_000),
      );
      res.json({ lastRun: reconLastRun?.toISOString() || null, payments: rows.rows, discrepancies });
    } catch (error: any) {
      console.error(JSON.stringify({ level: "error", msg: "recon_report_failed", error: redactErrorMessage(error) }));
      res.status(500).json({ error: "recon_report_failed" });
    }
  });

  startReconciliationJob();
}

// ---------------------------------------------------------------------------
// Nightly reconciliation (Part 7.3): 03:30 Asia/Riyadh, advisory-locked.
// ---------------------------------------------------------------------------
function startReconciliationJob() {
  if (reconTimer) return;
  reconTimer = setInterval(maybeRunReconciliation, 60_000);
  reconTimer.unref();
}

async function maybeRunReconciliation() {
  const riyadh = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Riyadh" }));
  const key = riyadh.toISOString().slice(0, 10);
  if (!(riyadh.getHours() === 3 && riyadh.getMinutes() >= 30 && riyadh.getMinutes() < 32)) return;
  if (reconLastRun && reconLastRun.toISOString().slice(0, 10) === key) return;
  const lock = await pool.query(`SELECT pg_try_advisory_lock($1) AS got`, [RECON_ADVISORY_LOCK]).catch(() => ({ rows: [{ got: false }] }));
  if (!lock.rows[0]?.got) return;
  try {
    let checkedPayments = 0;
    const initiated = await pool.query(`SELECT * FROM hub_payments WHERE status = 'initiated' AND updated_at < NOW() - interval '15 minutes'`);
    for (const p of initiated.rows) {
      checkedPayments += 1;
      try {
        const st = await mfPost("/v2/getPaymentStatus", { Key: p.provider_invoice_id, KeyType: "InvoiceId" });
        const upstream = st?.Data?.InvoiceStatus;
        if (upstream && upstream !== "Pending" && upstream !== "paid") {
          await audit("system", "recon.discrepancy", "hub_payments", p.id, { type: "stale_initiated_payment", local: p.status, upstream });
        }
      } catch (e: any) {
        await audit("system", "recon.check_failed", "hub_payments", p.id, { error: String(e?.message || e).slice(0, 150) });
      }
    }

    const paidMismatches = await pool.query(
      `SELECT p.id, p.booking_id, b.status AS booking_status
       FROM hub_payments p JOIN hub_bookings b ON b.id = p.booking_id
       WHERE p.status = 'paid' AND b.status <> 'confirmed'
       ORDER BY p.updated_at DESC LIMIT 100`,
    );
    for (const row of paidMismatches.rows) {
      await audit("system", "recon.discrepancy", "hub_payments", row.id, { type: "paid_booking_not_confirmed", booking: row.booking_id, bookingStatus: row.booking_status });
    }

    let checkedAppointments = 0;
    const confirmed = await pool.query(
      `SELECT id, digitail_appointment_id FROM hub_bookings
       WHERE status = 'confirmed' AND digitail_appointment_id IS NOT NULL AND updated_at > NOW() - interval '7 days'
       ORDER BY updated_at DESC LIMIT 50`,
    );
    for (const row of confirmed.rows) {
      checkedAppointments += 1;
      try {
        await digitailRequest("GET", `/appointments/${encodeURIComponent(row.digitail_appointment_id)}`);
      } catch (e: any) {
        if (e?.status === 404) {
          await audit("system", "recon.discrepancy", "hub_bookings", row.id, { type: "missing_upstream_appointment", appointment: row.digitail_appointment_id });
        } else {
          await audit("system", "recon.check_failed", "hub_bookings", row.id, { status: e?.status || 0 });
        }
      }
    }

    await audit("system", "recon.completed", "hub_payments", "nightly", { checkedPayments, checkedAppointments, paidMismatches: paidMismatches.rows.length });
    reconLastRun = new Date();
  } finally {
    await pool.query(`SELECT pg_advisory_unlock($1)`, [RECON_ADVISORY_LOCK]).catch(() => {});
  }
}
