import crypto from "crypto";
import { pool } from "./db";

// ============================================================================
// Phase 2 (master document Part 6.3): messaging connector (adapter pattern).
// - MESSAGING_PROVIDER=stub (default) | bevatel
// - Bevatel is the primary production provider (Addendum A4), BUT every
//   capability must be verified against official Bevatel API docs BEFORE
//   implementation — unverified capabilities stay behind config and are
//   documented as external dependencies. NO endpoint is ever guessed.
// - Sender identity is per-brand config (hub_brands.config_json.messaging) —
//   cross-brand sender mix-ups are release-blocking.
// ============================================================================

export interface MessagingProvider {
  sendSms(
    to: string,
    body: string,
    senderId?: string,
  ): Promise<{ providerMessageId: string }>;
  sendWhatsApp?(
    to: string,
    templateKey: string,
    params: Record<string, string>,
    opts?: { locale?: string },
  ): Promise<{ providerMessageId: string }>;
}

export function maskPhone(phone: string): string {
  // +966*****1626 style — no PII in logs (Part 9.1)
  if (!phone || phone.length < 6) return "***";
  return `${phone.slice(0, 4)}*****${phone.slice(-4)}`;
}

class StubProvider implements MessagingProvider {
  async sendSms(to: string, body: string, senderId?: string) {
    const id = `stub-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    console.log(
      JSON.stringify({
        level: "info",
        msg: "stub_sms",
        to: maskPhone(to),
        senderId: senderId || null,
        bodyPreview: body.slice(0, 60),
        providerMessageId: id,
      }),
    );
    return { providerMessageId: id };
  }
  async sendWhatsApp(
    to: string,
    templateKey: string,
    _params: Record<string, string>,
    _opts?: { locale?: string },
  ) {
    const id = `stub-wa-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    console.log(
      JSON.stringify({
        level: "info",
        msg: "stub_whatsapp",
        to: maskPhone(to),
        templateKey,
        providerMessageId: id,
      }),
    );
    return { providerMessageId: id };
  }
}

// Bevatel adapter — CONFIG SHELL ONLY. Endpoint paths/credentials are read
// from env (BEVATEL_API_BASE_URL, BEVATEL_API_KEY) and the send path throws a
// clear unconfigured error until the official API contract is verified in
// docs/INTEGRATIONS_OPERATIONS.md (Addendum A4). Never guess an endpoint.
class BevatelProvider implements MessagingProvider {
  private baseUrl = process.env.BEVATEL_API_BASE_URL || "";
  private apiKey = process.env.BEVATEL_API_KEY || "";
  async sendSms(): Promise<{ providerMessageId: string }> {
    if (!this.baseUrl || !this.apiKey)
      throw new Error(
        "Bevatel not configured (BEVATEL_API_BASE_URL/BEVATEL_API_KEY missing)",
      );
    throw new Error(
      "Bevatel SMS endpoint not yet verified against official docs — see docs/INTEGRATIONS_OPERATIONS.md (external dependency, Addendum A4)",
    );
  }
}

// Bevatel SMS provider — SEPARATE capability (owner decision 2026-09-23).
// Implements ONLY the official documented contract (docsv1):
//   POST https://sms-api.bevatel.com/msgs/sms   { src, dests[], body, msgClass, dlr }
//   Authorization: Bearer <BEVATEL_SMS_API_TOKEN>
// Fixed host (SSRF barrier). Token is read from env ONLY — never from DB,
// never logged (redact.ts covers BEVATEL_SMS_API_TOKEN).
// NOT the production default: MESSAGING_PROVIDER stays "stub" until the owner
// explicitly enables it AND Bevatel approves a sender ID (upstream currently
// rejects all src values with errorCode 6307 — verified 2026-09-23).
export class BevatelSmsProvider implements MessagingProvider {
  private token = process.env.BEVATEL_SMS_API_TOKEN || "";
  private defaultSender = process.env.BEVATEL_SMS_SENDER_ID || "";
  async sendSms(
    to: string,
    body: string,
    senderId?: string,
  ): Promise<{ providerMessageId: string }> {
    if (!this.token)
      throw new Error(
        "Bevatel SMS not configured (BEVATEL_SMS_API_TOKEN missing)",
      );
    const src = senderId || this.defaultSender;
    if (!src)
      throw new Error(
        "Bevatel SMS sender ID not approved yet (no registered src on the SMS account)",
      );
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10_000);
    let response: globalThis.Response;
    try {
      response = await fetch("https://sms-api.bevatel.com/msgs/sms", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          src,
          dests: [to],
          body,
          msgClass: "transactional",
          dlr: true,
        }),
        signal: controller.signal,
      });
    } catch (cause: any) {
      clearTimeout(timer);
      throw new Error(
        `Bevatel SMS request failed: ${cause?.name === "AbortError" ? "timeout" : "network error"}`,
        { cause },
      );
    }
    clearTimeout(timer);
    const data: any = await response.json().catch(() => ({}));
    if (!response.ok) {
      // Never echo upstream bodies into logs beyond the documented errorCode.
      const code = data?.errorCode ?? data?.error?.code ?? "unknown";
      const err = new Error(
        `Bevatel SMS rejected send (${response.status}, errorCode ${code})`,
      );
      (err as any).status = response.status;
      (err as any).errorCode = code;
      throw err;
    }
    const id =
      data?.data?.[0]?.msgId ??
      data?.msgIds?.[0] ??
      data?.jobId ??
      data?.id ??
      `bevatel-sms-${Date.now()}`;
    return { providerMessageId: String(id) };
  }
}

// Bevatel WhatsApp provider — SEPARATE capability from SMS (owner decision
// 2026-09-23). Implements ONLY the official Business Chat Developer API
// contract (Postman collection "Bevatel Business Chat Developer API",
// https://documenter.getpostman.com/view/27285397/2s9Xxwwa4r), verified live
// 2026-09-23:
//   POST https://chat.bevatel.com/developer/api/v1/messages
//   Headers: api_account_id, api_access_token (token is shown at the bottom of
//     the Business Chat profile page; NOT the Meta WhatsApp Cloud token).
//   Body: { inbox_id, contact: { phone_number | contact_id },
//           message: { template: { name, language, parameters? } } }
//   Success: 201 { "message": "Message created successfully" } (no message id
//     returned by the documented contract).
//   Rate limit (documented): 10 req/sec on /developer/api/v1/messages.
// Fixed host (SSRF barrier). Credentials are read from env ONLY — never from
// DB, never logged (redact.ts covers BEVATEL_ACCESS_TOKEN).
// NOT the production default: MESSAGING_PROVIDER stays "stub" and
// WHATSAPP_ENABLED stays "false" until the owner explicitly enables them.
const BEVATEL_CHAT_SEND_URL =
  "https://chat.bevatel.com/developer/api/v1/messages";

// templateKey -> approved template mapping is config-driven; the adapter
// never guesses a template name. Template families are configured once per
// key with the BASE name (no locale suffix); the adapter appends the booking
// locale ("_ar" default, "_en" for English bookings):
//   BEVATEL_WA_TEMPLATE_CONFIRM="elite_booking_confirmation"
//     -> elite_booking_confirmation_ar / elite_booking_confirmation_en
// Optional explicit per-language overrides (rarely needed):
//   BEVATEL_WA_TEMPLATE_CONFIRM_AR / BEVATEL_WA_TEMPLATE_CONFIRM_EN
// Locale comes from the persisted booking/customer record (hub_bookings.locale,
// z.enum(["ar","en"]) at creation) — never guessed from phone or name.
// Positional body parameters are taken from numeric param keys ("1","2",…).
function resolveWhatsAppTemplate(
  templateKey: string,
  locale?: string,
): {
  name: string;
  language: string;
} {
  const envKey = `BEVATEL_WA_TEMPLATE_${templateKey.toUpperCase().replace(/[^A-Z0-9]/g, "_")}`;
  const base = process.env[envKey] || "";
  if (!base)
    throw new Error(
      `Bevatel WhatsApp template not mapped for key "${templateKey}" (${envKey} missing) — refusing to guess a template name`,
    );
  const lang = locale === "en" ? "en" : "ar";
  const explicit = process.env[`${envKey}_${lang.toUpperCase()}`];
  return { name: explicit || `${base}_${lang}`, language: lang };
}

export class BevatelWhatsAppProvider implements MessagingProvider {
  private accountId = process.env.BEVATEL_ACCOUNT_ID || "";
  private accessToken = process.env.BEVATEL_ACCESS_TOKEN || "";
  private inboxId =
    process.env.BEVATEL_INBOX_ID || process.env.BEVATEL_INDEX_ID || "";

  async sendSms(
    to: string,
    body: string,
    senderId?: string,
  ): Promise<{ providerMessageId: string }> {
    // This provider is WhatsApp-only. SMS must keep its exact current
    // production behavior (stub) until the Bevatel SMS sender ID is
    // approved upstream — so delegate to StubProvider instead of throwing.
    return new StubProvider().sendSms(to, body, senderId);
  }

  async sendWhatsApp(
    to: string,
    templateKey: string,
    params: Record<string, string>,
    opts?: { locale?: string },
  ): Promise<{ providerMessageId: string }> {
    if (!this.accountId || !this.accessToken || !this.inboxId)
      throw new Error(
        "Bevatel WhatsApp not configured (BEVATEL_ACCOUNT_ID/BEVATEL_ACCESS_TOKEN/BEVATEL_INBOX_ID missing)",
      );
    // Hard guard: the protected Dr Paws inbox 810 must never be used here.
    if (this.inboxId === "810")
      throw new Error("protected_asset: bevatel inbox 810");
    const template = resolveWhatsAppTemplate(templateKey, opts?.locale);
    const bodyParams = Object.keys(params)
      .filter((k) => /^\d+$/.test(k))
      .sort((a, b) => Number(a) - Number(b))
      .map((k) => String(params[k]));
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10_000);
    let response: globalThis.Response;
    try {
      response = await fetch(BEVATEL_CHAT_SEND_URL, {
        method: "POST",
        headers: {
          api_account_id: this.accountId,
          api_access_token: this.accessToken,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inbox_id: Number(this.inboxId),
          contact: { phone_number: to },
          message: {
            template: {
              name: template.name,
              language: template.language,
              ...(bodyParams.length
                ? { parameters: { body: bodyParams } }
                : {}),
            },
          },
        }),
        signal: controller.signal,
      });
    } catch (cause: any) {
      clearTimeout(timer);
      throw new Error(
        `Bevatel WhatsApp request failed: ${cause?.name === "AbortError" ? "timeout" : "network error"}`,
        { cause },
      );
    }
    clearTimeout(timer);
    const data: any = await response.json().catch(() => ({}));
    if (!response.ok) {
      // Documented failure shapes: 401 {error:"Invalid Access Token"},
      // 404 {error:"Inbox not found. ... whatsapp inboxes only"}.
      // Never echo upstream bodies beyond a short redacted error string.
      const msg =
        typeof data?.error === "string" ? data.error.slice(0, 120) : "unknown";
      const err = new Error(
        `Bevatel WhatsApp rejected send (${response.status}): ${msg}`,
      );
      (err as any).status = response.status;
      throw err;
    }
    // The documented 201 response carries no message id; synthesize a local
    // reference so audit/notification rows stay traceable.
    return { providerMessageId: `bevatel-wa-${Date.now()}` };
  }
}

export function getMessagingProvider(): MessagingProvider {
  const kind = (process.env.MESSAGING_PROVIDER || "stub").toLowerCase();
  if (kind === "bevatel") return new BevatelProvider();
  if (kind === "bevatel_sms") return new BevatelSmsProvider();
  if (kind === "bevatel_chat") return new BevatelWhatsAppProvider();
  return new StubProvider();
}

export function whatsappEnabled(): boolean {
  return (process.env.WHATSAPP_ENABLED || "false").toLowerCase() === "true";
}

// ---------------------------------------------------------------------------
// Quiet hours (Part 6.3): no non-urgent sends 22:00–09:00 Asia/Riyadh.
// Confirmations are excepted by callers (kind === "confirm").
// ---------------------------------------------------------------------------
export function inQuietHours(now = new Date()): boolean {
  const riyadh = new Date(
    now.toLocaleString("en-US", { timeZone: "Asia/Riyadh" }),
  );
  const h = riyadh.getHours();
  return h >= 22 || h < 9;
}

export function nextAllowedSendTime(now = new Date()): Date {
  // Returns `now` if outside quiet hours, else next 09:00 Asia/Riyadh.
  if (!inQuietHours(now)) return now;
  const riyadh = new Date(
    now.toLocaleString("en-US", { timeZone: "Asia/Riyadh" }),
  );
  const target = new Date(riyadh);
  target.setHours(9, 0, 0, 0);
  if (riyadh.getHours() >= 22) target.setDate(target.getDate() + 1);
  return new Date(target.toLocaleString("en-US", { timeZone: "Asia/Riyadh" }));
}

// ---------------------------------------------------------------------------
// Notification rows (Part 6.3): row-based, deduplicated, retry with backoff
// (max 3) then alert via audit log. Phones are masked in every log line.
// ---------------------------------------------------------------------------
export async function enqueueNotification(opts: {
  bookingId?: string | null;
  kind: string;
  channel: "sms" | "whatsapp";
  toPhone: string;
  templateKey: string;
  payload?: Record<string, any>;
  scheduledAt: Date;
  respectQuietHours?: boolean;
}): Promise<void> {
  let scheduledAt = opts.scheduledAt;
  if (
    opts.respectQuietHours !== false &&
    opts.kind !== "confirm" &&
    inQuietHours(scheduledAt)
  ) {
    scheduledAt = nextAllowedSendTime(scheduledAt);
  }
  // Dedup: same booking + kind + channel + template not already queued/sent.
  await pool.query(
    `INSERT INTO hub_notifications (id, booking_id, kind, channel, to_phone, template_key, payload_json, status, scheduled_at)
     SELECT $1::varchar, $2::varchar, $3::varchar, $4::varchar, $5::varchar, $6::varchar, $7::jsonb, 'queued', $8::timestamptz
     WHERE NOT EXISTS (
       SELECT 1 FROM hub_notifications
       WHERE booking_id IS NOT DISTINCT FROM $2::varchar AND kind = $3::varchar AND channel = $4::varchar AND template_key = $6::varchar
         AND status IN ('queued', 'sent', 'delivered')
     )`,
    [
      crypto.randomUUID(),
      opts.bookingId || null,
      opts.kind,
      opts.channel,
      opts.toPhone,
      opts.templateKey,
      JSON.stringify(opts.payload || {}),
      scheduledAt,
    ],
  );
}

export async function audit(
  actor: string,
  action: string,
  entity: string,
  entityId: string,
  meta: Record<string, any> = {},
) {
  await pool
    .query(
      `INSERT INTO hub_audit_log (id, actor, action, entity, entity_id, meta_json) VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        crypto.randomUUID(),
        actor,
        action,
        entity,
        entityId,
        JSON.stringify(meta),
      ],
    )
    .catch((e) => console.error("[audit] write failed:", e?.message));
}

// ---------------------------------------------------------------------------
// Dispatcher: called by the sweeper job every cycle. Sends due queued
// notifications; failed sends retry with backoff (attempts 1..3) then status
// 'failed' + audit alert.
// ---------------------------------------------------------------------------
// Integrations Manager V1 (design §11): optional per-brand routing. A routing
// rule only takes effect when (a) a rule exists, (b) the provider key maps to
// a REAL implemented adapter. Anything else falls back to the current behavior
// (MESSAGING_PROVIDER env / stub) — no automatic provider switching.
const KIND_TO_PURPOSE: Record<string, string> = {
  otp: "otp",
  confirm: "booking_confirmation",
  reminder: "reminder",
  payment: "payment_notification",
  rebook: "payment_notification",
};

async function resolveRoutedProvider(
  bookingId: string | null,
  kind: string,
): Promise<MessagingProvider | null> {
  try {
    if (!bookingId) return null;
    const purpose = KIND_TO_PURPOSE[kind];
    if (!purpose) return null;
    const { resolveRouteProvider } = await import("./integrations/configStore");
    const b = await pool.query(
      `SELECT brand FROM hub_bookings WHERE id = $1 LIMIT 1`,
      [bookingId],
    );
    const brand = b.rows[0]?.brand;
    if (!brand) return null;
    const routed = await resolveRouteProvider(
      brand,
      purpose as any,
      process.env.DIGITAIL_ENV || "sandbox",
    );
    if (!routed) return null;
    // V1: routing is recorded but NEVER auto-switches providers. Even though
    // a documented BevatelSmsProvider now exists, switching requires explicit
    // owner enablement (sender ID still unapproved upstream, 2026-09-23).
    await audit(
      "system",
      "routing.unsupported_provider",
      "hub_notifications",
      bookingId,
      { routed, purpose },
    );
    return null;
  } catch {
    return null; // routing failure must never break notification delivery
  }
}

export async function dispatchDueNotifications(): Promise<{
  sent: number;
  failed: number;
}> {
  const defaultProvider = getMessagingProvider();
  const due = await pool.query(
    `SELECT * FROM hub_notifications WHERE status = 'queued' AND scheduled_at <= NOW() ORDER BY scheduled_at LIMIT 50`,
  );
  let sent = 0;
  let failed = 0;
  for (const n of due.rows) {
    try {
      const provider =
        (await resolveRoutedProvider(n.booking_id, n.kind)) || defaultProvider;
      let result: { providerMessageId: string };
      if (n.channel === "whatsapp") {
        if (!whatsappEnabled() || !provider.sendWhatsApp) {
          await pool.query(
            `UPDATE hub_notifications SET status = 'skipped' WHERE id = $1`,
            [n.id],
          );
          continue;
        }
        result = await provider.sendWhatsApp(
          n.to_phone,
          n.template_key,
          n.payload_json || {},
          { locale: (n.payload_json || {}).locale },
        );
      } else {
        const senderId = (n.payload_json || {}).senderId;
        result = await provider.sendSms(
          n.to_phone,
          (n.payload_json || {}).body || n.template_key,
          senderId,
        );
      }
      await pool.query(
        `UPDATE hub_notifications SET status = 'sent', sent_at = NOW(), provider_message_id = $2 WHERE id = $1`,
        [n.id, result.providerMessageId],
      );
      sent += 1;
    } catch (e: any) {
      const attempts = Number(n.attempt_count) + 1;
      if (attempts >= 3) {
        await pool.query(
          `UPDATE hub_notifications SET status = 'failed', attempt_count = $2 WHERE id = $1`,
          [n.id, attempts],
        );
        await audit(
          "system",
          "notification.failed",
          "hub_notifications",
          n.id,
          {
            to: maskPhone(n.to_phone),
            kind: n.kind,
            error: String(e?.message || e).slice(0, 200),
          },
        );
        failed += 1;
      } else {
        const backoffMinutes = attempts * 5;
        await pool.query(
          `UPDATE hub_notifications SET attempt_count = $2, scheduled_at = NOW() + ($3 || ' minutes')::interval WHERE id = $1`,
          [n.id, attempts, String(backoffMinutes)],
        );
      }
    }
  }
  return { sent, failed };
}
