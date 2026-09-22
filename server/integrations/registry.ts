// ============================================================================
// Integrations Manager V1 (approved design doc 2026-09-22) — provider registry.
//
// HARD RULES (locked by the approved design):
//  - Provider logic lives in code. Only Category A config is dashboard-managed.
//  - Category B = secrets: references only, NEVER stored in the DB (V1).
//  - Category C = deployment-controlled (env): display-only, never editable.
//  - No arbitrary URL / auth-type input. Every provider has a fixed adapter.
//  - Production feature flags (booking/payment/DYNAMIC_DEPOSIT_ENABLED/
//    EMERGENCY_PATH_ENABLED/INTEGRATIONS_MANAGER …) are Category C — display only.
//  - Dr Paws hard isolation is enforced in protectedAssets.ts and here.
// ============================================================================

export type ProviderCategory = "pims" | "payments" | "messaging" | "advertising" | "system";
export type ScopeType = "global" | "brand" | "clinic" | "connection";
export type IntegrationEnvironment = "test" | "sandbox" | "production";

export type IntegrationStatus =
  | "not_configured"
  | "configured_externally"
  | "configured"
  | "ready"
  | "disabled"
  | "connection_failed"
  | "needs_attention"
  | "blocked";

export interface SecretRefSpec {
  /** Reference key inside secret_refs_json, e.g. "api_key" */
  key: string;
  /** Expected env variable name (Render/deployment secret store) */
  envName: string;
  required: boolean;
}

export interface ConfigFieldSpec {
  key: string;
  kind: "string" | "boolean" | "integer" | "enum" | "string_map";
  enumValues?: string[];
  maxLength?: number;
  pattern?: RegExp;
  required?: boolean;
  sensitiveAction?: boolean; // requires explicit textual confirmation in UI
}

export interface ProviderSpec {
  key: string;
  displayNameAr: string;
  displayNameEn: string;
  category: ProviderCategory;
  allowedScopes: ScopeType[];
  allowedEnvironments: IntegrationEnvironment[];
  /** Category A fields — the ONLY dashboard-editable keys (strict allowlist) */
  configFields: ConfigFieldSpec[];
  /** Category B secret references (presence/absence only) */
  secretRefs: SecretRefSpec[];
  /** Category C env names surfaced read-only in the dashboard */
  categoryC: string[];
  /** Health test capability — read-only operations only */
  testCapability: "readonly" | "none";
  webhookHealth: boolean; // tracks webhook_last_event_at
}

// Field-pattern guards reused across providers.
const ID_RE = /^[A-Za-z0-9_-]{1,64}$/;
const NUM_ID_RE = /^\d{1,20}$/;
const EMAIL_RE = /^[^@\s]{1,64}@[^@\s]{1,190}$/;

export const PROVIDERS: ProviderSpec[] = [
  {
    key: "digitail",
    displayNameAr: "Digitail (PIMS)",
    displayNameEn: "Digitail",
    category: "pims",
    allowedScopes: ["connection"],
    allowedEnvironments: ["sandbox", "production"],
    configFields: [
      { key: "connection_scope", kind: "string", pattern: ID_RE, required: true },
      { key: "sync_enabled", kind: "boolean" },
    ],
    secretRefs: [
      { key: "client_id", envName: "DIGITAIL_CLIENT_ID", required: true },
      { key: "client_secret", envName: "DIGITAIL_CLIENT_SECRET", required: true },
      { key: "token_encryption_key", envName: "DIGITAIL_TOKEN_ENCRYPTION_KEY", required: true },
    ],
    categoryC: ["DIGITAIL_ENV", "DIGITAIL_REDIRECT_URI"],
    testCapability: "readonly",
    webhookHealth: false,
  },
  {
    key: "myfatoorah",
    displayNameAr: "ماي فاتورة (المدفوعات)",
    displayNameEn: "MyFatoorah",
    category: "payments",
    allowedScopes: ["brand"],
    allowedEnvironments: ["test", "production"],
    configFields: [
      { key: "brand_mapping", kind: "string", pattern: ID_RE, required: true },
      { key: "webhook_display", kind: "string", maxLength: 200 },
    ],
    secretRefs: [
      { key: "api_key", envName: "MYFATOORAH_API_KEY", required: true },
      { key: "api_key_vetsvan", envName: "MYFATOORAH_API_KEY_VETSVAN", required: false },
      { key: "webhook_secret", envName: "MYFATOORAH_WEBHOOK_SECRET", required: false },
    ],
    // MYFATOORAH_MODE stays Category C (owner decision #2): display-only.
    categoryC: ["MYFATOORAH_MODE"],
    testCapability: "readonly",
    webhookHealth: true,
  },
  {
    key: "google_ads",
    displayNameAr: "إعلانات جوجل",
    displayNameEn: "Google Ads",
    category: "advertising",
    allowedScopes: ["brand"],
    allowedEnvironments: ["production"],
    configFields: [
      { key: "customer_id", kind: "string", pattern: NUM_ID_RE, required: true },
      { key: "login_customer_id", kind: "string", pattern: NUM_ID_RE },
    ],
    // Owner decision (2026-09-22): NO Developer Token field in V1. Health is
    // based on: valid Service Account auth + configured Customer/Login IDs +
    // reachability + actual account access. Explorer Access is already enabled.
    secretRefs: [
      { key: "service_account_json", envName: "GOOGLE_ADS_SERVICE_ACCOUNT_JSON", required: true },
    ],
    categoryC: [],
    testCapability: "readonly",
    webhookHealth: false,
  },
  {
    key: "m365",
    displayNameAr: "Microsoft 365 (البريد)",
    displayNameEn: "Microsoft 365 Email",
    category: "messaging",
    allowedScopes: ["global", "brand"],
    allowedEnvironments: ["production"],
    configFields: [
      { key: "sender_mailbox", kind: "string", pattern: EMAIL_RE, required: true },
      { key: "mode", kind: "enum", enumValues: ["smtp", "graph"], required: true },
    ],
    secretRefs: [
      { key: "client_id", envName: "M365_CLIENT_ID", required: true },
      { key: "client_secret", envName: "M365_CLIENT_SECRET", required: true },
      { key: "tenant_id", envName: "M365_TENANT_ID", required: true },
    ],
    categoryC: ["SMTP_HOST", "SMTP_PORT", "SMTP_USER"],
    testCapability: "readonly",
    webhookHealth: false,
  },
  {
    key: "bevatel",
    displayNameAr: "بيفاتيل (رسائل)",
    displayNameEn: "Bevatel",
    category: "messaging",
    allowedScopes: ["brand"],
    allowedEnvironments: ["production"],
    configFields: [
      { key: "account_id", kind: "string", pattern: NUM_ID_RE, required: true },
      { key: "inbox_id", kind: "string", pattern: NUM_ID_RE, required: true },
      { key: "channel_id", kind: "string", pattern: NUM_ID_RE },
      { key: "template_map", kind: "string_map" },
    ],
    secretRefs: [
      { key: "access_token", envName: "BEVATEL_ACCESS_TOKEN", required: true },
      { key: "api_key", envName: "BEVATEL_API_KEY", required: true },
      { key: "webhook_verify_token", envName: "BEVATEL_WEBHOOK_VERIFY_TOKEN", required: true },
    ],
    // Base URL is FIXED inside the adapter (SSRF prevention) — never editable.
    categoryC: ["BEVATEL_API_BASE_URL"],
    testCapability: "readonly",
    webhookHealth: true,
  },
  {
    key: "meta_whatsapp",
    displayNameAr: "واتساب ميتا (مستقبلي)",
    displayNameEn: "Meta WhatsApp",
    category: "messaging",
    allowedScopes: ["brand"],
    allowedEnvironments: ["production"],
    configFields: [
      { key: "waba_id", kind: "string", pattern: NUM_ID_RE, required: true },
      { key: "phone_number_id", kind: "string", pattern: NUM_ID_RE, required: true },
      { key: "api_version", kind: "enum", enumValues: ["v21.0", "v22.0", "v23.0"], required: true },
      { key: "template_map", kind: "string_map" },
    ],
    secretRefs: [
      { key: "access_token", envName: "META_WHATSAPP_ACCESS_TOKEN", required: true },
      { key: "verify_token", envName: "META_WHATSAPP_VERIFY_TOKEN", required: true },
    ],
    categoryC: [],
    testCapability: "readonly",
    webhookHealth: true,
  },
];

export function getProvider(key: string): ProviderSpec | null {
  return PROVIDERS.find((p) => p.key === key) || null;
}

// ---------------------------------------------------------------------------
// Category C (deployment-controlled) — display-only inventory.
// Production feature flags are ALWAYS Category C (owner decision: the
// dashboard may display state but must never modify them).
// ---------------------------------------------------------------------------
export const CATEGORY_C_DISPLAY: { key: string; label: string; isFlag: boolean }[] = [
  { key: "MYFATOORAH_MODE", label: "MyFatoorah mode (test/live)", isFlag: false },
  { key: "DYNAMIC_DEPOSIT_ENABLED", label: "G3 dynamic deposit flag", isFlag: true },
  { key: "EMERGENCY_PATH_ENABLED", label: "G4 emergency path flag", isFlag: true },
  { key: "MESSAGING_PROVIDER", label: "Messaging provider selection", isFlag: false },
  { key: "WHATSAPP_ENABLED", label: "WhatsApp send flag", isFlag: true },
  { key: "DIGITAIL_ENV", label: "Digitail environment", isFlag: false },
  { key: "INTEGRATIONS_MANAGER", label: "Integrations Manager flag", isFlag: true },
];

// ---------------------------------------------------------------------------
// Secret-pattern scanner (defense in depth): any Category A payload containing
// secret-looking material is REJECTED before it can reach the DB.
// ---------------------------------------------------------------------------
const SECRET_KEY_RE = /(secret|token|private_key|api[_-]?key|password|authorization|bearer|credential)/i;
const SECRET_VALUE_RES = [
  /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
  /"private_key"\s*:/,
  /Bearer\s+[A-Za-z0-9\-._~+/]{10,}/i,
  /^EAA[A-Za-z0-9]{20,}$/, // Meta-style token
];

export function findSecretLeak(value: unknown, path = ""): string | null {
  if (value == null) return null;
  if (typeof value === "string") {
    for (const re of SECRET_VALUE_RES) if (re.test(value)) return path || "(value)";
    return null;
  }
  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      const hit = findSecretLeak(value[i], `${path}[${i}]`);
      if (hit) return hit;
    }
    return null;
  }
  if (typeof value === "object") {
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (SECRET_KEY_RE.test(k)) return path ? `${path}.${k}` : k;
      const hit = findSecretLeak(v, path ? `${path}.${k}` : k);
      if (hit) return hit;
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Strict Category A validation against the provider's allowlisted schema.
// Unknown keys are rejected (strict) — classification default is Category C.
// ---------------------------------------------------------------------------
export function validateCategoryA(
  provider: ProviderSpec,
  config: Record<string, unknown>,
): { ok: true; clean: Record<string, unknown> } | { ok: false; error: string } {
  if (!config || typeof config !== "object" || Array.isArray(config)) return { ok: false, error: "invalid_config" };
  const allowed = new Set(provider.configFields.map((f) => f.key));
  for (const k of Object.keys(config)) {
    if (!allowed.has(k)) return { ok: false, error: `unknown_field:${k}` };
  }
  const leak = findSecretLeak(config);
  if (leak) return { ok: false, error: `secret_material_rejected:${leak}` };
  const clean: Record<string, unknown> = {};
  for (const f of provider.configFields) {
    if (!(f.key in config)) {
      if (f.required) return { ok: false, error: `missing_field:${f.key}` };
      continue;
    }
    const v = config[f.key];
    switch (f.kind) {
      case "string": {
        if (typeof v !== "string" || !v.trim()) return { ok: false, error: `invalid_${f.key}` };
        const s = v.trim();
        if (f.maxLength && s.length > f.maxLength) return { ok: false, error: `invalid_${f.key}` };
        if (f.pattern && !f.pattern.test(s)) return { ok: false, error: `invalid_${f.key}` };
        clean[f.key] = s;
        break;
      }
      case "boolean": {
        if (typeof v !== "boolean") return { ok: false, error: `invalid_${f.key}` };
        clean[f.key] = v;
        break;
      }
      case "integer": {
        if (!Number.isInteger(v)) return { ok: false, error: `invalid_${f.key}` };
        clean[f.key] = v;
        break;
      }
      case "enum": {
        if (typeof v !== "string" || !f.enumValues?.includes(v)) return { ok: false, error: `invalid_${f.key}` };
        clean[f.key] = v;
        break;
      }
      case "string_map": {
        if (typeof v !== "object" || v === null || Array.isArray(v)) return { ok: false, error: `invalid_${f.key}` };
        const m: Record<string, string> = {};
        for (const [mk, mv] of Object.entries(v as Record<string, unknown>)) {
          if (!/^[a-z0-9_]{1,64}$/.test(mk) || typeof mv !== "string" || mv.length > 200) {
            return { ok: false, error: `invalid_${f.key}` };
          }
          m[mk] = mv;
        }
        clean[f.key] = m;
        break;
      }
    }
  }
  return { ok: true, clean };
}
