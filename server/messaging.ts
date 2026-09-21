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
  sendSms(to: string, body: string, senderId?: string): Promise<{ providerMessageId: string }>;
  sendWhatsApp?(to: string, templateKey: string, params: Record<string, string>): Promise<{ providerMessageId: string }>;
}

export function maskPhone(phone: string): string {
  // +966*****1626 style — no PII in logs (Part 9.1)
  if (!phone || phone.length < 6) return "***";
  return `${phone.slice(0, 4)}*****${phone.slice(-4)}`;
}

class StubProvider implements MessagingProvider {
  async sendSms(to: string, body: string, senderId?: string) {
    const id = `stub-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    console.log(JSON.stringify({ level: "info", msg: "stub_sms", to: maskPhone(to), senderId: senderId || null, bodyPreview: body.slice(0, 60), providerMessageId: id }));
    return { providerMessageId: id };
  }
  async sendWhatsApp(to: string, templateKey: string, params: Record<string, string>) {
    const id = `stub-wa-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    console.log(JSON.stringify({ level: "info", msg: "stub_whatsapp", to: maskPhone(to), templateKey, providerMessageId: id }));
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
    if (!this.baseUrl || !this.apiKey) throw new Error("Bevatel not configured (BEVATEL_API_BASE_URL/BEVATEL_API_KEY missing)");
    throw new Error("Bevatel SMS endpoint not yet verified against official docs — see docs/INTEGRATIONS_OPERATIONS.md (external dependency, Addendum A4)");
  }
}

export function getMessagingProvider(): MessagingProvider {
  const kind = (process.env.MESSAGING_PROVIDER || "stub").toLowerCase();
  if (kind === "bevatel") return new BevatelProvider();
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
  const riyadh = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Riyadh" }));
  const h = riyadh.getHours();
  return h >= 22 || h < 9;
}

export function nextAllowedSendTime(now = new Date()): Date {
  // Returns `now` if outside quiet hours, else next 09:00 Asia/Riyadh.
  if (!inQuietHours(now)) return now;
  const riyadh = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Riyadh" }));
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
  if (opts.respectQuietHours !== false && opts.kind !== "confirm" && inQuietHours(scheduledAt)) {
    scheduledAt = nextAllowedSendTime(scheduledAt);
  }
  // Dedup: same booking + kind + channel + template not already queued/sent.
  await pool.query(
    `INSERT INTO hub_notifications (id, booking_id, kind, channel, to_phone, template_key, payload_json, status, scheduled_at)
     SELECT $1, $2, $3, $4, $5, $6, $7, 'queued', $8
     WHERE NOT EXISTS (
       SELECT 1 FROM hub_notifications
       WHERE booking_id IS NOT DISTINCT FROM $2 AND kind = $3 AND channel = $4 AND template_key = $6
         AND status IN ('queued', 'sent', 'delivered')
     )`,
    [crypto.randomUUID(), opts.bookingId || null, opts.kind, opts.channel, opts.toPhone, opts.templateKey, JSON.stringify(opts.payload || {}), scheduledAt],
  );
}

export async function audit(actor: string, action: string, entity: string, entityId: string, meta: Record<string, any> = {}) {
  await pool
    .query(`INSERT INTO hub_audit_log (id, actor, action, entity, entity_id, meta_json) VALUES ($1, $2, $3, $4, $5, $6)`, [
      crypto.randomUUID(),
      actor,
      action,
      entity,
      entityId,
      JSON.stringify(meta),
    ])
    .catch((e) => console.error("[audit] write failed:", e?.message));
}

// ---------------------------------------------------------------------------
// Dispatcher: called by the sweeper job every cycle. Sends due queued
// notifications; failed sends retry with backoff (attempts 1..3) then status
// 'failed' + audit alert.
// ---------------------------------------------------------------------------
export async function dispatchDueNotifications(): Promise<{ sent: number; failed: number }> {
  const provider = getMessagingProvider();
  const due = await pool.query(
    `SELECT * FROM hub_notifications WHERE status = 'queued' AND scheduled_at <= NOW() ORDER BY scheduled_at LIMIT 50`,
  );
  let sent = 0;
  let failed = 0;
  for (const n of due.rows) {
    try {
      let result: { providerMessageId: string };
      if (n.channel === "whatsapp") {
        if (!whatsappEnabled() || !provider.sendWhatsApp) {
          await pool.query(`UPDATE hub_notifications SET status = 'skipped' WHERE id = $1`, [n.id]);
          continue;
        }
        result = await provider.sendWhatsApp(n.to_phone, n.template_key, n.payload_json || {});
      } else {
        const senderId = (n.payload_json || {}).senderId;
        result = await provider.sendSms(n.to_phone, (n.payload_json || {}).body || n.template_key, senderId);
      }
      await pool.query(`UPDATE hub_notifications SET status = 'sent', sent_at = NOW(), provider_message_id = $2 WHERE id = $1`, [n.id, result.providerMessageId]);
      sent += 1;
    } catch (e: any) {
      const attempts = Number(n.attempt_count) + 1;
      if (attempts >= 3) {
        await pool.query(`UPDATE hub_notifications SET status = 'failed', attempt_count = $2 WHERE id = $1`, [n.id, attempts]);
        await audit("system", "notification.failed", "hub_notifications", n.id, { to: maskPhone(n.to_phone), kind: n.kind, error: String(e?.message || e).slice(0, 200) });
        failed += 1;
      } else {
        const backoffMinutes = attempts * 5;
        await pool.query(`UPDATE hub_notifications SET attempt_count = $2, scheduled_at = NOW() + ($3 || ' minutes')::interval WHERE id = $1`, [n.id, attempts, String(backoffMinutes)]);
      }
    }
  }
  return { sent, failed };
}

