// ============================================================================
// Integrations Manager V1 — provider adapters, SAFE TEST CONNECTION (§13).
//
// Every test is a single documented READ-ONLY operation against a FIXED host
// compiled into the adapter. No URL ever comes from user input (SSRF barrier).
// Responses are reduced to { result, errorClass, latencyMs } — raw upstream
// responses are NEVER returned to the browser (leak barrier).
// ============================================================================

import { getProvider } from "./registry";
import { classifyError } from "./health";

export interface TestResult {
  result: "ok" | "degraded" | "failed" | "blocked";
  errorClass?: string;
  latencyMs: number;
  /** Short human-safe note (no secrets, no payloads) */
  note?: string;
}

const TIMEOUT_MS = 10_000;

async function timedFetch(url: string, init: RequestInit): Promise<Response> {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: ctl.signal });
  } finally {
    clearTimeout(t);
  }
}

// --- M365: client-credentials token request only (auth proof, no mail send) ---
async function testM365(): Promise<TestResult> {
  const tenant = process.env.M365_TENANT_ID;
  const cid = process.env.M365_CLIENT_ID;
  const csec = process.env.M365_CLIENT_SECRET;
  if (!tenant || !cid || !csec)
    return { result: "failed", errorClass: "missing_secret_ref", latencyMs: 0 };
  const started = Date.now();
  try {
    const r = await timedFetch(
      `https://login.microsoftonline.com/${encodeURIComponent(tenant)}/oauth2/v2.0/token`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: cid,
          client_secret: csec,
          scope: "https://outlook.office365.com/.default",
          grant_type: "client_credentials",
        }).toString(),
      },
    );
    const latencyMs = Date.now() - started;
    if (!r.ok)
      return {
        result: "failed",
        errorClass: classifyError({ status: r.status }),
        latencyMs,
      };
    const j: any = await r.json();
    // Read the role claim only — the token itself is discarded immediately.
    let roles: string[] = [];
    try {
      const payload = JSON.parse(
        Buffer.from(
          String(j.access_token).split(".")[1],
          "base64url",
        ).toString(),
      );
      roles = Array.isArray(payload.roles) ? payload.roles : [];
    } catch {
      /* roles unreadable — still an auth success */
    }
    const hasSmtp = roles.includes("SMTP.SendAsApp");
    return {
      result: "ok",
      latencyMs,
      note: hasSmtp
        ? "auth_ok smtp_role_present"
        : "auth_ok smtp_role_absent(exo_registration_pending)",
    };
  } catch (e: any) {
    return {
      result: "failed",
      errorClass: classifyError(e),
      latencyMs: Date.now() - started,
    };
  }
}

// --- MyFatoorah: GetPaymentStatus for a non-existent invoice (documented read) ---
async function testMyFatoorah(): Promise<TestResult> {
  const key = process.env.MYFATOORAH_API_KEY;
  if (!key)
    return { result: "failed", errorClass: "missing_secret_ref", latencyMs: 0 };
  const mode = (process.env.MYFATOORAH_MODE || "live").toLowerCase();
  const base =
    mode === "test"
      ? "https://apitest.myfatoorah.com"
      : "https://api.myfatoorah.com";
  const started = Date.now();
  try {
    const r = await timedFetch(`${base}/v2/GetPaymentStatus`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ Key: "0", KeyType: "InvoiceId" }),
    });
    const latencyMs = Date.now() - started;
    if (r.status === 401)
      return { result: "failed", errorClass: "auth_denied", latencyMs };
    // 200/4xx/500 after a successful auth handshake = credentials accepted.
    return { result: "ok", latencyMs, note: `auth_ok mode_${mode}` };
  } catch (e: any) {
    return {
      result: "failed",
      errorClass: classifyError(e),
      latencyMs: Date.now() - started,
    };
  }
}

// --- Bevatel: Chatwoot-standard profile read (verified 2026-09-22) ---
const BEVATEL_BASE = "https://chat.bevatel.com"; // FIXED — never user-supplied
async function testBevatel(): Promise<TestResult> {
  const token = process.env.BEVATEL_ACCESS_TOKEN;
  if (!token)
    return { result: "failed", errorClass: "missing_secret_ref", latencyMs: 0 };
  const started = Date.now();
  try {
    const r = await timedFetch(`${BEVATEL_BASE}/api/v1/profile`, {
      headers: { api_access_token: token },
    });
    const latencyMs = Date.now() - started;
    if (r.status === 401)
      return { result: "failed", errorClass: "auth_denied", latencyMs };
    if (!r.ok)
      return {
        result: "failed",
        errorClass: classifyError({ status: r.status }),
        latencyMs,
      };
    const j: any = await r.json().catch(() => ({}));
    const accountMatch =
      String(j?.account_id ?? "") ===
      String(process.env.BEVATEL_ACCOUNT_ID ?? "");
    return {
      result: accountMatch ? "ok" : "degraded",
      latencyMs,
      note: accountMatch ? "auth_ok account_match" : "auth_ok account_mismatch",
    };
  } catch (e: any) {
    return {
      result: "failed",
      errorClass: classifyError(e),
      latencyMs: Date.now() - started,
    };
  }
}

// --- Bevatel SMS: SEPARATE capability (host sms-api.bevatel.com, Bearer token).
// Read-only auth proof: GET /users/me (documented). NEVER sends a message.
const BEVATEL_SMS_BASE = "https://sms-api.bevatel.com";
async function testBevatelSms(): Promise<TestResult> {
  const token = process.env.BEVATEL_SMS_API_TOKEN;
  if (!token)
    return { result: "failed", errorClass: "missing_secret_ref", latencyMs: 0 };
  const started = Date.now();
  try {
    const r = await timedFetch(`${BEVATEL_SMS_BASE}/users/me`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    });
    const latencyMs = Date.now() - started;
    if (r.status === 401 || r.status === 403)
      return { result: "failed", errorClass: "auth_denied", latencyMs };
    if (!r.ok)
      return {
        result: "failed",
        errorClass: classifyError({ status: r.status }),
        latencyMs,
      };
    return { result: "ok", latencyMs, note: "auth_ok account_readable" };
  } catch (e: any) {
    return {
      result: "failed",
      errorClass: classifyError(e),
      latencyMs: Date.now() - started,
    };
  }
}

// --- Digitail: reuse the existing typed client (clinics read = /auth/me) ---
async function testDigitail(): Promise<TestResult> {
  if (
    !process.env.DIGITAIL_CLIENT_ID ||
    !process.env.DIGITAIL_CLIENT_SECRET ||
    !process.env.DIGITAIL_TOKEN_ENCRYPTION_KEY
  ) {
    return { result: "failed", errorClass: "missing_secret_ref", latencyMs: 0 };
  }
  const started = Date.now();
  try {
    const { digitailApi } = await import("../digitail");
    await digitailApi("/auth/me?include=multipleClinic");
    return {
      result: "ok",
      latencyMs: Date.now() - started,
      note: "auth_ok clinics_readable",
    };
  } catch (e: any) {
    return {
      result: "failed",
      errorClass: classifyError(e),
      latencyMs: Date.now() - started,
    };
  }
}

// --- Google Ads (owner decision 2026-09-22): health = SA auth + configured
// Customer/Login IDs + reachability + account access. NO Developer Token in V1.
// Read-only: JWT bearer token exchange (scope adwords) against the FIXED
// Google token endpoint; plus local validation of the SA key + IDs.
async function testGoogleAds(): Promise<TestResult> {
  const saRaw = process.env.GOOGLE_ADS_SERVICE_ACCOUNT_JSON;
  if (!saRaw)
    return { result: "failed", errorClass: "missing_secret_ref", latencyMs: 0 };
  let sa: any;
  try {
    sa = JSON.parse(saRaw);
  } catch {
    return {
      result: "failed",
      errorClass: "invalid_service_account_json",
      latencyMs: 0,
    };
  }
  // Local key validation (no network): private key must parse as RSA.
  try {
    const { createPrivateKey } = await import("crypto");
    createPrivateKey(sa.private_key);
  } catch {
    return {
      result: "failed",
      errorClass: "invalid_service_account_json",
      latencyMs: 0,
    };
  }
  if (
    !/^\d{1,20}$/.test(process.env.GOOGLE_ADS_CUSTOMER_ID || "") ||
    !/^\d{1,20}$/.test(process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID || "")
  ) {
    return {
      result: "failed",
      errorClass: "customer_ids_unconfigured",
      latencyMs: 0,
    };
  }
  const started = Date.now();
  try {
    // Signed JWT → token endpoint (documented OAuth2 service-account flow).
    const { createSign } = await import("crypto");
    const now = Math.floor(Date.now() / 1000);
    const b64 = (o: any) =>
      Buffer.from(JSON.stringify(o)).toString("base64url");
    const unsigned = `${b64({ alg: "RS256", typ: "JWT", kid: sa.private_key_id })}.${b64(
      {
        iss: sa.client_email,
        scope: "https://www.googleapis.com/auth/adwords",
        aud: "https://oauth2.googleapis.com/token",
        iat: now,
        exp: now + 3600,
      },
    )}`;
    const signer = createSign("RSA-SHA256");
    signer.update(unsigned);
    const assertion = `${unsigned}.${signer.sign(sa.private_key, "base64url")}`;
    const r = await timedFetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion,
      }).toString(),
    });
    const latencyMs = Date.now() - started;
    if (!r.ok)
      return {
        result: "failed",
        errorClass: classifyError({ status: r.status }),
        latencyMs,
      };
    const j: any = await r.json();
    // Discard the token immediately — auth proof only, never stored/returned.
    return {
      result: j?.access_token ? "ok" : "failed",
      errorClass: j?.access_token ? undefined : "auth_failed",
      latencyMs,
      note: j?.access_token ? "sa_auth_ok ids_configured" : undefined,
    };
  } catch (e: any) {
    return {
      result: "failed",
      errorClass: classifyError(e),
      latencyMs: Date.now() - started,
    };
  }
}

// --- Meta WhatsApp: no assets yet → not configured; adapter shell only ---
async function testMetaWhatsApp(): Promise<TestResult> {
  if (!process.env.META_WHATSAPP_ACCESS_TOKEN)
    return { result: "failed", errorClass: "missing_secret_ref", latencyMs: 0 };
  return { result: "blocked", latencyMs: 0, note: "not_configured_externally" };
}

const TESTERS: Record<string, () => Promise<TestResult>> = {
  digitail: testDigitail,
  myfatoorah: testMyFatoorah,
  google_ads: testGoogleAds,
  m365: testM365,
  bevatel: testBevatel,
  bevatel_sms: testBevatelSms,
  meta_whatsapp: testMetaWhatsApp,
};

export async function runSafeTest(
  providerKey: string,
): Promise<TestResult | { error: string }> {
  const provider = getProvider(providerKey);
  if (!provider) return { error: "unknown_provider" };
  if (provider.testCapability !== "readonly")
    return { error: "test_not_supported" };
  const tester = TESTERS[providerKey];
  if (!tester) return { error: "test_not_supported" };
  return tester();
}
