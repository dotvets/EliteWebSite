// Group Booking Hub — Phase 0: environment-driven Digitail configuration.
//
// Resolution order (locked by the master document, Part 4.1):
//   (1) explicit env override  (DIGITAIL_AUTHORIZE_URL / DIGITAIL_TOKEN_URL / DIGITAIL_API_BASE_URL)
//   (2) environment default    (per DIGITAIL_ENV)
//
// NEVER guess an endpoint. The sandbox token endpoint is NOT confirmed by Digitail
// (support thread + documentation.digitail.io only document the production token URL),
// so the sandbox has NO default token URL — it must be supplied via DIGITAIL_TOKEN_URL
// until Digitail confirms it (tracked as OPEN-Q #6 in the master document).

// Sandbox token endpoint confirmed 2026-09-21 (POST https://developer.digitail.io/oauth/token,
// same URL for authorization_code and refresh_token grants).
export type DigitailEnv = "sandbox" | "production";

export interface DigitailConfig {
  env: DigitailEnv;
  authorizeUrl: string;
  tokenUrl: string | null; // null = unconfigured for this env (sandbox, until confirmed)
  apiBaseUrl: string;
  redirectUri: string;
  connectionScope: string;
  overrides: { authorizeUrl: boolean; tokenUrl: boolean; apiBaseUrl: boolean };
}

const ENV_DEFAULTS: Record<
  DigitailEnv,
  { authorizeUrl: string; tokenUrl: string | null; apiBaseUrl: string }
> = {
  sandbox: {
    // Confirmed by Digitail (George Roman, Slack, 2026-09-21) — see docs/DIGITAIL_OAUTH.md.
    // NOTE: an earlier message gave authorize as ".../authorize" without /oauth; George corrected
    // it to ".../oauth/authorize" the same day ("my bad on that"). The corrected value is below.
    authorizeUrl: "https://developer.digitail.io/oauth/authorize",
    tokenUrl: "https://developer.digitail.io/oauth/token", // confirmed same URL for both grants
    apiBaseUrl: "https://developer.digitail.io/api/v1",
  },
  production: {
    authorizeUrl: "https://vet.digitail.io/oauth/authorize",
    tokenUrl: "https://vet.digitail.io/oauth/token",
    apiBaseUrl: "https://vet.digitail.io/api/v1",
  },
};

export const DEFAULT_REDIRECT_URI =
  "https://www.elitevetksa.com/api/digitail/callback";

function parseEnv(value: string | undefined): DigitailEnv {
  const env = (value || "sandbox").trim().toLowerCase();
  if (env !== "sandbox" && env !== "production") {
    throw new Error(
      `[digitail] Invalid DIGITAIL_ENV="${value}". Allowed values: sandbox | production. ` +
        `Refusing to start with an unknown Digitail environment.`,
    );
  }
  return env;
}

function assertHttpsUrl(name: string, url: string): void {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error(`[digitail] ${name} is not a valid URL: "${url}"`);
  }
  if (parsed.protocol !== "https:") {
    throw new Error(`[digitail] ${name} must use https: "${url}"`);
  }
}

export function resolveDigitailConfig(): DigitailConfig {
  const env = parseEnv(process.env.DIGITAIL_ENV);
  const defaults = ENV_DEFAULTS[env];

  const authorizeUrl =
    process.env.DIGITAIL_AUTHORIZE_URL?.trim() || defaults.authorizeUrl;
  const tokenUrl = process.env.DIGITAIL_TOKEN_URL?.trim() || defaults.tokenUrl;
  const apiBaseUrl =
    process.env.DIGITAIL_API_BASE_URL?.trim() || defaults.apiBaseUrl;

  assertHttpsUrl("DIGITAIL authorize URL", authorizeUrl);
  if (tokenUrl) assertHttpsUrl("DIGITAIL token URL", tokenUrl);
  assertHttpsUrl("DIGITAIL API base URL", apiBaseUrl);

  return {
    env,
    authorizeUrl,
    tokenUrl,
    apiBaseUrl,
    redirectUri:
      process.env.DIGITAIL_REDIRECT_URI?.trim() || DEFAULT_REDIRECT_URI,
    connectionScope: process.env.DIGITAIL_CONNECTION_SCOPE?.trim() || "elite",
    overrides: {
      authorizeUrl: !!process.env.DIGITAIL_AUTHORIZE_URL?.trim(),
      tokenUrl: !!process.env.DIGITAIL_TOKEN_URL?.trim(),
      apiBaseUrl: !!process.env.DIGITAIL_API_BASE_URL?.trim(),
    },
  };
}

// Boot-time validation (master document Part 4.2 item 1): fail fast on an unknown
// DIGITAIL_ENV or missing required variables — before the server accepts traffic.
export function assertDigitailBootConfig(): DigitailConfig {
  const config = resolveDigitailConfig(); // throws on invalid env / malformed URLs
  const missing = [
    "DIGITAIL_CLIENT_ID",
    "DIGITAIL_CLIENT_SECRET",
    "DIGITAIL_TOKEN_ENCRYPTION_KEY",
  ].filter((name) => !process.env[name]);
  if (missing.length > 0) {
    throw new Error(
      `[digitail] Missing required environment variables: ${missing.join(", ")}`,
    );
  }
  return config;
}

// Connection identity (master document Part 3.1 + Addendum A2): "{env}:{connection_scope}".
// connection_scope is NOT a brand — a group-level connection ("group") is fully supported.
export function digitailConnectionId(config: DigitailConfig): string {
  return `${config.env}:${config.connectionScope}`;
}

// Non-secret view for /api/digitail/status and /api/digitail/health.
// Hosts and flags only — never credentials, never tokens.
export function publicDigitailConfig(config: DigitailConfig) {
  return {
    env: config.env,
    authorizeHost: new URL(config.authorizeUrl).host,
    tokenHost: config.tokenUrl ? new URL(config.tokenUrl).host : null,
    tokenUrlConfigured: config.tokenUrl !== null,
    apiBaseHost: new URL(config.apiBaseUrl).host,
    redirectUri: config.redirectUri,
    connectionScope: config.connectionScope,
    connectionId: digitailConnectionId(config),
    overrides: config.overrides,
  };
}

export function requireTokenUrl(config: DigitailConfig): string {
  if (!config.tokenUrl) {
    throw new Error(
      `[digitail] No token endpoint configured for DIGITAIL_ENV=${config.env}. ` +
        `Digitail has not published a sandbox token endpoint; set DIGITAIL_TOKEN_URL explicitly ` +
        `(see docs/DIGITAIL_OAUTH.md, OPEN-Q: sandbox token endpoint).`,
    );
  }
  return config.tokenUrl;
}
