// ============================================================================
// Integrations Manager V1 — health model (design §12).
// Stores ONLY health metadata + timestamps — never payloads (owner decision #4).
// Circuit breaker: 5 consecutive failures → open (60s), then half-open probe.
// ============================================================================

import { pool } from "../db";

export type TestOutcome = "ok" | "degraded" | "failed" | "blocked";

export async function recordTestResult(providerKey: string, scopeId: string | null, outcome: TestOutcome, errorClass?: string): Promise<void> {
  const ok = outcome === "ok";
  await pool.query(
    `INSERT INTO hub_integrations_health (provider_key, scope_id, last_test_at, last_test_result, last_success_at, last_failure_at, last_error_class, consecutive_failures, circuit_opened_at)
     VALUES ($1, $2, NOW(), $3, ${ok ? "NOW()" : "NULL"}, ${ok ? "NULL" : "NOW()"}, $4, $5, ${ok ? "NULL" : "CASE WHEN $5 >= 5 THEN NOW() ELSE NULL END"})
     ON CONFLICT (provider_key, scope_id) DO UPDATE SET
       last_test_at = NOW(),
       last_test_result = EXCLUDED.last_test_result,
       last_success_at = CASE WHEN $3 = 'ok' THEN NOW() ELSE hub_integrations_health.last_success_at END,
       last_failure_at = CASE WHEN $3 = 'ok' THEN hub_integrations_health.last_failure_at ELSE NOW() END,
       last_error_class = CASE WHEN $3 = 'ok' THEN NULL ELSE EXCLUDED.last_error_class END,
       consecutive_failures = CASE WHEN $3 = 'ok' THEN 0 ELSE hub_integrations_health.consecutive_failures + 1 END,
       circuit_opened_at = CASE
         WHEN $3 = 'ok' THEN NULL
         WHEN hub_integrations_health.consecutive_failures + 1 >= 5 AND hub_integrations_health.circuit_opened_at IS NULL THEN NOW()
         ELSE hub_integrations_health.circuit_opened_at END`,
    [providerKey, scopeId ?? "*", outcome, errorClass ?? null, ok ? 0 : 1],
  );
}

export async function recordWebhookEvent(providerKey: string, scopeId: string | null): Promise<void> {
  await pool
    .query(
      `INSERT INTO hub_integrations_health (provider_key, scope_id, webhook_last_event_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (provider_key, scope_id) DO UPDATE SET webhook_last_event_at = NOW()`,
      [providerKey, scopeId ?? "*"],
    )
    .catch(() => {});
}

/** Classify an error without leaking its message (design §13.4). */
export function classifyError(e: any): string {
  const status = Number(e?.status ?? e?.response?.status ?? 0);
  if (status === 401 || status === 403) return "auth_denied";
  if (status === 404) return "not_found";
  if (status === 429) return "rate_limited";
  if (status >= 500) return "upstream_5xx";
  if (status >= 400) return "upstream_4xx";
  const code = String(e?.code || "");
  if (code === "ENOTFOUND" || code === "ECONNREFUSED" || code === "ETIMEDOUT" || code === "ECONNRESET") return "network_unreachable";
  if (/timeout/i.test(String(e?.message || ""))) return "timeout";
  return "unknown";
}
