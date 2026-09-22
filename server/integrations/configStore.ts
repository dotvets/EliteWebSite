// ============================================================================
// Integrations Manager V1 — Category A config store (design §4.2, §5, §15).
//
// Precedence (owner decision #1): dashboard-managed config (DB) is the primary
// source for Category A once a row exists; env remains a backward-compatible
// FALLBACK during migration only. Nothing is auto-migrated — writes are
// explicit, validated, and audited.
//
// Secrets (Category B) are NEVER read into responses — only presence state
// (configured/missing) of their env references.
// ============================================================================

import crypto from "crypto";
import { pool } from "../db";
import {
  getProvider,
  validateCategoryA,
  type IntegrationEnvironment,
  type IntegrationStatus,
  type ProviderSpec,
  type ScopeType,
} from "./registry";
import { assertNoProtectedAsset, isProtectedBrand, visibleScope } from "./protectedAssets";

export interface ConfigRow {
  id: string;
  provider_key: string;
  scope_type: ScopeType;
  scope_id: string;
  environment: IntegrationEnvironment;
  config_json: Record<string, unknown>;
  secret_refs_json: Record<string, { kind: string; name: string }>;
  enabled: boolean;
  blocked_reason: string | null;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface SecretState {
  key: string;
  envName: string;
  required: boolean;
  state: "configured" | "missing";
}

export interface IntegrationView {
  provider: string;
  displayNameAr: string;
  displayNameEn: string;
  category: string;
  scopeType: ScopeType | null;
  scopeId: string | null;
  environment: IntegrationEnvironment | null;
  enabled: boolean;
  status: IntegrationStatus;
  blockedReason: string | null;
  config: Record<string, unknown> | null; // Category A only — secrets never appear
  source: "dashboard" | "environment" | "none";
  secrets: SecretState[];
  health: {
    lastTestAt: string | null;
    lastTestResult: string | null;
    lastSuccessAt: string | null;
    lastFailureAt: string | null;
    lastErrorClass: string | null;
    consecutiveFailures: number;
    circuitState: "closed" | "open" | "half_open";
    webhookLastEventAt: string | null;
  } | null;
}

function secretStates(provider: ProviderSpec): SecretState[] {
  return provider.secretRefs.map((r) => ({
    key: r.key,
    envName: r.envName,
    required: r.required,
    state: process.env[r.envName] ? "configured" : "missing",
  }));
}

/** An integration is "Configured Externally" when every REQUIRED secret ref resolves from env. */
export function externallyConfigured(provider: ProviderSpec): boolean {
  return provider.secretRefs.filter((r) => r.required).every((r) => !!process.env[r.envName]);
}

export async function integrationEvents(limit = 100) {
  const r = await pool.query(
    `SELECT id, actor, provider_key, scope_id, action, meta_json, result, created_at
     FROM hub_integrations_events ORDER BY created_at DESC LIMIT $1`,
    [Math.min(Math.max(1, limit), 500)],
  );
  return r.rows;
}

export async function logEvent(
  actor: string,
  providerKey: string,
  scopeId: string | null,
  action: string,
  meta: Record<string, unknown>,
  result: "ok" | "failed",
): Promise<void> {
  await pool
    .query(
      `INSERT INTO hub_integrations_events (id, actor, provider_key, scope_id, action, meta_json, result)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [crypto.randomUUID(), actor, providerKey, scopeId, action, JSON.stringify(meta), result],
    )
    .catch((e) => console.error("[integrations] audit write failed:", e?.message));
}

async function getConfigRow(providerKey: string): Promise<ConfigRow | null> {
  const r = await pool.query(
    `SELECT * FROM hub_integrations_configs WHERE provider_key = $1 ORDER BY updated_at DESC LIMIT 1`,
    [providerKey],
  );
  return r.rows[0] || null;
}

async function getHealthRow(providerKey: string, scopeId: string | null) {
  const r = await pool.query(
    `SELECT * FROM hub_integrations_health WHERE provider_key = $1 AND scope_id = $2 LIMIT 1`,
    [providerKey, scopeId ?? "*"],
  );
  const h = r.rows[0];
  if (!h) return null;
  const failures = Number(h.consecutive_failures || 0);
  let circuit: "closed" | "open" | "half_open" = "closed";
  if (failures >= 5) {
    const openedAt = h.circuit_opened_at ? new Date(h.circuit_opened_at).getTime() : 0;
    circuit = Date.now() - openedAt >= 60_000 ? "half_open" : "open";
  }
  return {
    lastTestAt: h.last_test_at,
    lastTestResult: h.last_test_result,
    lastSuccessAt: h.last_success_at,
    lastFailureAt: h.last_failure_at,
    lastErrorClass: h.last_error_class,
    consecutiveFailures: failures,
    circuitState: circuit,
    webhookLastEventAt: h.webhook_last_event_at,
  };
}

function computeStatus(provider: ProviderSpec, row: ConfigRow | null, health: Awaited<ReturnType<typeof getHealthRow>>): IntegrationStatus {
  const secrets = secretStates(provider);
  const missingRequired = secrets.some((s) => s.required && s.state === "missing");
  if (row?.blocked_reason) return "blocked";
  if (provider.testBlockedReason && secrets.some((s) => s.envName === "GOOGLE_ADS_DEVELOPER_TOKEN" && s.state === "missing")) {
    return "blocked"; // documented blocker (developer token) — not "not_configured"
  }
  if (!row) {
    if (!externallyConfigured(provider)) return "not_configured";
    // Externally configured integrations still surface live health signals.
    if (health?.lastTestResult === "failed") return "connection_failed";
    if (health && health.consecutiveFailures > 0) return "needs_attention";
    return "configured_externally";
  }
  if (!row.enabled) return "disabled";
  if (missingRequired) return "needs_attention";
  if (health && health.lastTestResult === "failed") return "connection_failed";
  if (health && (health.consecutiveFailures > 0 || health.circuitState !== "closed")) return "needs_attention";
  if (health?.lastTestResult === "ok") return "ready";
  return "configured";
}

export async function getIntegrationView(providerKey: string): Promise<IntegrationView | null> {
  const provider = getProvider(providerKey);
  if (!provider) return null;
  const row = await getConfigRow(providerKey);
  // Dr Paws hard isolation (owner decision #3): never surface protected scope.
  if (row && !visibleScope(row.scope_type, row.scope_id)) return hiddenView(provider);
  const health = await getHealthRow(providerKey, row?.scope_id ?? "*");
  return {
    provider: provider.key,
    displayNameAr: provider.displayNameAr,
    displayNameEn: provider.displayNameEn,
    category: provider.category,
    scopeType: row?.scope_type ?? null,
    scopeId: row?.scope_id ?? null,
    environment: row?.environment ?? null,
    enabled: row?.enabled ?? false,
    status: computeStatus(provider, row, health),
    blockedReason: row?.blocked_reason ?? (provider.testBlockedReason && !process.env.GOOGLE_ADS_DEVELOPER_TOKEN ? provider.testBlockedReason : null),
    config: row?.config_json ?? null,
    source: row ? "dashboard" : externallyConfigured(provider) ? "environment" : "none",
    secrets: secretStates(provider),
    health,
  };
}

function hiddenView(provider: ProviderSpec): IntegrationView {
  return {
    provider: provider.key,
    displayNameAr: provider.displayNameAr,
    displayNameEn: provider.displayNameEn,
    category: provider.category,
    scopeType: null,
    scopeId: null,
    environment: null,
    enabled: false,
    status: externallyConfigured(provider) ? "configured_externally" : "not_configured",
    blockedReason: null,
    config: null,
    source: externallyConfigured(provider) ? "environment" : "none",
    secrets: secretStates(provider),
    health: null,
  };
}

export async function listIntegrationViews(): Promise<IntegrationView[]> {
  const out: IntegrationView[] = [];
  for (const p of PROVIDERS_KEYS) {
    const v = await getIntegrationView(p);
    if (v) out.push(v);
  }
  return out;
}
const PROVIDERS_KEYS = ["digitail", "myfatoorah", "google_ads", "m365", "bevatel", "meta_whatsapp"];

export async function upsertConfig(opts: {
  providerKey: string;
  scopeType: ScopeType;
  scopeId: string;
  environment: IntegrationEnvironment;
  config: Record<string, unknown>;
  actor: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const provider = getProvider(opts.providerKey);
  if (!provider) return { ok: false, error: "unknown_provider" };
  if (!provider.allowedScopes.includes(opts.scopeType)) return { ok: false, error: "invalid_scope" };
  if (!provider.allowedEnvironments.includes(opts.environment)) return { ok: false, error: "invalid_environment" };
  if (opts.scopeType === "brand" && isProtectedBrand(opts.scopeId)) return { ok: false, error: "protected_asset" };
  if (!/^[a-zA-Z0-9*:_-]{1,64}$/.test(opts.scopeId)) return { ok: false, error: "invalid_scope_id" };

  const v = validateCategoryA(provider, opts.config);
  if (!v.ok) return { ok: false, error: v.error };
  try {
    assertNoProtectedAsset(opts.providerKey, opts.scopeType, opts.scopeId, v.clean);
  } catch {
    return { ok: false, error: "protected_asset" };
  }

  // Secret refs are derived from the registry (env names only) — never from client input.
  const refs = Object.fromEntries(provider.secretRefs.map((r) => [r.key, { kind: "render_env", name: r.envName }]));

  const existing = await getConfigRow(opts.providerKey);
  if (existing) {
    await pool.query(
      `UPDATE hub_integrations_configs
       SET scope_type = $2, scope_id = $3, environment = $4, config_json = $5::jsonb,
           secret_refs_json = $6::jsonb, updated_by = $7, updated_at = NOW()
       WHERE id = $1`,
      [existing.id, opts.scopeType, opts.scopeId, opts.environment, JSON.stringify(v.clean), JSON.stringify(refs), opts.actor],
    );
    await logEvent(opts.actor, opts.providerKey, opts.scopeId, "config.update", {
      fields: Object.keys(v.clean), previous_scope: `${existing.scope_type}:${existing.scope_id}`,
    }, "ok");
  } else {
    await pool.query(
      `INSERT INTO hub_integrations_configs (id, provider_key, scope_type, scope_id, environment, config_json, secret_refs_json, enabled, created_by, updated_by)
       VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7::jsonb, false, $8, $8)`,
      [crypto.randomUUID(), opts.providerKey, opts.scopeType, opts.scopeId, opts.environment, JSON.stringify(v.clean), JSON.stringify(refs), opts.actor],
    );
    await logEvent(opts.actor, opts.providerKey, opts.scopeId, "config.create", { fields: Object.keys(v.clean) }, "ok");
  }
  return { ok: true };
}

export async function setEnabled(providerKey: string, enabled: boolean, actor: string): Promise<{ ok: boolean; error?: string }> {
  const row = await getConfigRow(providerKey);
  if (!row) return { ok: false, error: "not_configured" };
  if (!visibleScope(row.scope_type, row.scope_id)) return { ok: false, error: "protected_asset" };
  await pool.query(`UPDATE hub_integrations_configs SET enabled = $2, updated_by = $3, updated_at = NOW() WHERE id = $1`, [row.id, enabled, actor]);
  await logEvent(actor, providerKey, row.scope_id, enabled ? "provider.enable" : "provider.disable", {}, "ok");
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Messaging routing (design §11): per-brand purpose → provider. Resolution is
// consumed by messaging.ts; absence of a rule = existing behavior (stub).
// ---------------------------------------------------------------------------
export const ROUTING_PURPOSES = ["otp", "booking_confirmation", "reminder", "payment_notification", "emergency", "fallback"] as const;
export type RoutingPurpose = (typeof ROUTING_PURPOSES)[number];

export async function listRoutes(): Promise<any[]> {
  const r = await pool.query(`SELECT * FROM hub_messaging_routes ORDER BY brand_id, purpose`);
  return r.rows.filter((row) => !isProtectedBrand(row.brand_id)); // §10.3
}

export async function setRoute(opts: {
  brandId: string;
  purpose: RoutingPurpose;
  providerKey: string;
  environment: IntegrationEnvironment;
  actor: string;
}): Promise<{ ok: boolean; error?: string }> {
  if (isProtectedBrand(opts.brandId)) return { ok: false, error: "protected_asset" };
  const provider = getProvider(opts.providerKey);
  if (!provider || provider.category !== "messaging") return { ok: false, error: "invalid_provider" };
  if (!ROUTING_PURPOSES.includes(opts.purpose)) return { ok: false, error: "invalid_purpose" };
  const view = await getIntegrationView(opts.providerKey);
  if (!view || (view.status !== "ready" && view.status !== "configured" && view.status !== "configured_externally")) {
    return { ok: false, error: "provider_not_ready" };
  }
  const existing = await pool.query(
    `SELECT provider_key FROM hub_messaging_routes WHERE brand_id = $1 AND purpose = $2 AND environment = $3`,
    [opts.brandId, opts.purpose, opts.environment],
  );
  await pool.query(
    `INSERT INTO hub_messaging_routes (id, brand_id, purpose, provider_key, environment, updated_by, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, NOW())
     ON CONFLICT (brand_id, purpose, environment) DO UPDATE SET provider_key = EXCLUDED.provider_key, updated_by = EXCLUDED.updated_by, updated_at = NOW()`,
    [crypto.randomUUID(), opts.brandId, opts.purpose, opts.providerKey, opts.environment, opts.actor],
  );
  await logEvent(opts.actor, opts.providerKey, opts.brandId, "routing.set", {
    purpose: opts.purpose,
    previous: existing.rows[0]?.provider_key ?? null,
    next: opts.providerKey,
  }, "ok");
  return { ok: true };
}

/** Runtime resolution hook used by messaging.ts — null = keep current behavior. */
export async function resolveRouteProvider(brandId: string | null, purpose: RoutingPurpose, environment: string): Promise<string | null> {
  if (!brandId || isProtectedBrand(brandId)) return null;
  const r = await pool
    .query(
      `SELECT provider_key FROM hub_messaging_routes WHERE brand_id = $1 AND purpose = $2 AND environment = $3 LIMIT 1`,
      [brandId, purpose, environment],
    )
    .catch(() => ({ rows: [] as any[] }));
  return r.rows[0]?.provider_key ?? null;
}
