import crypto from "crypto";
import type { Express, Request, Response } from "express";
import { pool } from "./db";
import { requireAdmin } from "./admin";
import {
  resolveDigitailConfig,
  digitailConnectionId,
  publicDigitailConfig,
  requireTokenUrl,
  type DigitailConfig,
} from "./digitailConfig";
import { redactSecrets, redactErrorMessage } from "./redact";

// Phase 0 (master document Part 4): all Digitail endpoints are resolved from
// DIGITAIL_ENV + optional overrides — nothing is hardcoded per environment.
const config: DigitailConfig = resolveDigitailConfig();
const CONNECTION_ID = digitailConnectionId(config);

const TOKEN_ALGORITHM = "aes-256-gcm";

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

function encryptionKey(): Buffer {
  const raw = required("DIGITAIL_TOKEN_ENCRYPTION_KEY");
  const key = Buffer.from(raw, "hex");
  if (key.length !== 32) throw new Error("DIGITAIL_TOKEN_ENCRYPTION_KEY must be a 64-character hex string (32 bytes)");
  return key;
}

function encrypt(value: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(TOKEN_ALGORITHM, encryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("base64url")}.${tag.toString("base64url")}.${encrypted.toString("base64url")}`;
}

function decrypt(value: string): string {
  const [ivPart, tagPart, dataPart] = value.split(".");
  if (!ivPart || !tagPart || !dataPart) throw new Error("Invalid encrypted Digitail token");
  const decipher = crypto.createDecipheriv(TOKEN_ALGORITHM, encryptionKey(), Buffer.from(ivPart, "base64url"));
  decipher.setAuthTag(Buffer.from(tagPart, "base64url"));
  return Buffer.concat([decipher.update(Buffer.from(dataPart, "base64url")), decipher.final()]).toString("utf8");
}

function randomString(bytes = 32): string {
  return crypto.randomBytes(bytes).toString("base64url");
}

function createCodeChallenge(verifier: string): string {
  return crypto.createHash("sha256").update(verifier).digest("base64url");
}

// Map Digitail OAuth error codes to safe, actionable admin-facing messages.
// Never include the upstream response body verbatim (it may echo request data).
function oauthErrorMessage(status: number, data: any): string {
  const code = typeof data?.error === "string" ? data.error : "";
  switch (code) {
    case "invalid_client":
      return (
        `Digitail rejected the client credentials (invalid_client, HTTP ${status}). ` +
        `Verify DIGITAIL_ENV matches the credentials in use and that Digitail has whitelisted this environment.`
      );
    case "invalid_grant":
      return `Digitail rejected the authorization code or refresh token (invalid_grant, HTTP ${status}). Restart the OAuth flow.`;
    case "invalid_request":
      return `Digitail rejected the OAuth request shape (invalid_request, HTTP ${status}). Check redirect URI and PKCE parameters.`;
    default:
      return `Digitail token endpoint returned HTTP ${status}${code ? ` (${code})` : ""}.`;
  }
}

interface TokenSet {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

async function postTokenRequest(body: URLSearchParams, operation: string): Promise<TokenSet> {
  const tokenUrl = requireTokenUrl(config);
  let response: globalThis.Response;
  try {
    response = await fetch(tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });
  } catch (cause: any) {
    throw new Error(`Digitail ${operation} failed: network error contacting token endpoint`, { cause });
  }
  let data: any;
  try {
    data = await response.json();
  } catch (cause: any) {
    throw new Error(`Digitail ${operation} failed: non-JSON response (HTTP ${response.status})`, { cause });
  }
  if (!response.ok || !data.access_token || !data.refresh_token) {
    throw new Error(`Digitail ${operation} failed: ${oauthErrorMessage(response.status, data)}`);
  }
  return data as TokenSet;
}

async function exchangeCode(code: string, verifier: string): Promise<TokenSet> {
  return postTokenRequest(
    new URLSearchParams({
      grant_type: "authorization_code",
      client_id: required("DIGITAIL_CLIENT_ID"),
      client_secret: required("DIGITAIL_CLIENT_SECRET"),
      redirect_uri: config.redirectUri,
      code_verifier: verifier,
      code,
    }),
    "token exchange",
  );
}

async function refreshTokens(refreshToken: string): Promise<TokenSet> {
  return postTokenRequest(
    new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: required("DIGITAIL_CLIENT_ID"),
      client_secret: required("DIGITAIL_CLIENT_SECRET"),
    }),
    "token refresh",
  );
}

// Multi-connection storage (master document Part 3.1): digitail_connections_v2,
// keyed "{env}:{connection_scope}". All token reads/writes go through this helper —
// single-global-row assumptions are a defect.
async function saveTokens(tokens: TokenSet) {
  await pool.query(
    `INSERT INTO digitail_connections_v2 (id, env, connection_scope, access_token_enc, refresh_token_enc, access_token_expires_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, NOW() + ($6::text || ' seconds')::interval, NOW())
     ON CONFLICT (id) DO UPDATE SET
       access_token_enc = EXCLUDED.access_token_enc,
       refresh_token_enc = EXCLUDED.refresh_token_enc,
       access_token_expires_at = EXCLUDED.access_token_expires_at,
       updated_at = NOW()`,
    [CONNECTION_ID, config.env, config.connectionScope, encrypt(tokens.access_token), encrypt(tokens.refresh_token), tokens.expires_in],
  );
}

export async function getConnection(env: string, scope: string) {
  const result = await pool.query(
    `SELECT id, env, connection_scope, access_token_enc, refresh_token_enc, access_token_expires_at
     FROM digitail_connections_v2 WHERE id = $1 LIMIT 1`,
    [`${env}:${scope}`],
  );
  return result.rows[0] || null;
}

async function loadConnection() {
  return getConnection(config.env, config.connectionScope);
}

async function getValidAccessToken(): Promise<string> {
  const connection = await loadConnection();
  if (!connection) throw new Error("Digitail is not connected");

  const expiresAt = new Date(connection.access_token_expires_at).getTime();
  if (expiresAt > Date.now() + 60_000) return decrypt(connection.access_token_enc);

  const tokens = await refreshTokens(decrypt(connection.refresh_token_enc));
  await saveTokens(tokens); // refresh-token rotation: always store the newly returned pair
  return tokens.access_token;
}

async function digitailApi(path: string, clinicId?: string) {
  const token = await getValidAccessToken();
  const headers: Record<string, string> = { Authorization: `Bearer ${token}`, Accept: "application/json" };
  if (clinicId) headers["X-ClinicId"] = clinicId;

  let response: globalThis.Response;
  try {
    response = await fetch(`${config.apiBaseUrl}${path}`, { headers });
  } catch (cause: any) {
    throw new Error("Digitail API request failed: network error", { cause });
  }
  const text = await response.text();
  let data: any;
  try { data = JSON.parse(text); } catch { data = { raw: text.slice(0, 2000) }; }
  if (!response.ok) {
    const error = new Error(`Digitail API request failed (${response.status})`);
    (error as any).status = response.status;
    (error as any).details = data;
    throw error;
  }
  return data;
}

export function registerDigitailRoutes(app: Express) {
  app.get("/api/digitail/connect", requireAdmin, (req: Request, res: Response) => {
    try {
      const verifier = randomString(48);
      const state = randomString(32);
      const challenge = createCodeChallenge(verifier);
      const session = req.session as any;
      session.digitailOAuth = { verifier, state, createdAt: Date.now() };

      const url = new URL(config.authorizeUrl);
      url.searchParams.set("response_type", "code");
      url.searchParams.set("client_id", required("DIGITAIL_CLIENT_ID"));
      // client_secret is deliberately NOT sent on the authorize GET (Digitail/George, 2026-09-21:
      // "With PKCE the authorize step never needs it... Send it only on the token POST." — supersedes
      // the earlier instruction; we send it on both token grants).
      url.searchParams.set("redirect_uri", config.redirectUri);
      url.searchParams.set("state", state);
      url.searchParams.set("code_challenge", challenge);
      url.searchParams.set("code_challenge_method", "S256");
      res.redirect(url.toString());
    } catch (error: any) {
      res.status(500).json({ error: "digitail_config_error", message: redactErrorMessage(error) });
    }
  });

  app.get("/api/digitail/callback", requireAdmin, async (req: Request, res: Response) => {
    try {
      const code = typeof req.query.code === "string" ? req.query.code : "";
      const state = typeof req.query.state === "string" ? req.query.state : "";
      const oauth = (req.session as any).digitailOAuth;
      if (!code || !state || !oauth) return res.status(400).json({ error: "invalid_oauth_callback" });
      if (oauth.state !== state) return res.status(400).json({ error: "invalid_oauth_state" });
      if (Date.now() - oauth.createdAt > 10 * 60 * 1000) return res.status(400).json({ error: "oauth_state_expired" });
      delete (req.session as any).digitailOAuth;
      const tokens = await exchangeCode(code, oauth.verifier);
      await saveTokens(tokens);
      res.status(200).send("<!doctype html><html><head><meta charset='utf-8'><title>Digitail Connected</title></head><body style='font-family:sans-serif;text-align:center;padding:60px'><h1>Digitail connected successfully</h1><p>You can close this window.</p></body></html>");
    } catch (error: any) {
      console.error("[digitail] OAuth callback failed:", redactErrorMessage(error));
      res.status(500).json({ error: "digitail_oauth_failed", message: redactErrorMessage(error) });
    }
  });

  app.get("/api/digitail/status", requireAdmin, async (_req, res) => {
    try {
      const connection = await loadConnection();
      res.json({
        connected: !!connection,
        expiresAt: connection?.access_token_expires_at || null,
        ...publicDigitailConfig(config),
      });
    } catch (error: any) {
      res.status(500).json({ error: "digitail_status_failed", message: redactErrorMessage(error) });
    }
  });

  // Phase 0 addition: operational health for admins — env, resolved hosts, DB reachability,
  // and per-connection token presence/expiry. Never exposes token or secret values.
  app.get("/api/digitail/health", requireAdmin, async (_req, res) => {
    const health: Record<string, any> = { ...publicDigitailConfig(config) };
    try {
      await pool.query("SELECT 1");
      health.database = "up";
    } catch {
      health.database = "down";
    }
    try {
      const result = await pool.query(
        `SELECT id, env, connection_scope, access_token_expires_at, updated_at FROM digitail_connections_v2 ORDER BY id`,
      );
      health.connections = result.rows.map((row: any) => ({
        id: row.id,
        env: row.env,
        connectionScope: row.connection_scope,
        tokenExpiresAt: row.access_token_expires_at,
        tokenExpired: new Date(row.access_token_expires_at).getTime() <= Date.now(),
        updatedAt: row.updated_at,
      }));
      res.json(health);
    } catch (error: any) {
      health.connections = null;
      health.connectionsError = redactErrorMessage(error);
      res.status(500).json(health);
    }
  });

  app.post("/api/digitail/refresh", requireAdmin, async (_req, res) => {
    try {
      const connection = await loadConnection();
      if (!connection) return res.status(404).json({ error: "digitail_not_connected" });
      const tokens = await refreshTokens(decrypt(connection.refresh_token_enc));
      await saveTokens(tokens);
      res.json({ refreshed: true, expiresIn: tokens.expires_in });
    } catch (error: any) {
      console.error("[digitail] token refresh failed:", redactErrorMessage(error));
      res.status(502).json({ error: "digitail_refresh_failed", message: redactErrorMessage(error) });
    }
  });

  // Returns the clinics available to the currently authorized Digitail user.
  // This is intentionally a backend endpoint so the OAuth token never reaches the browser.
  app.get("/api/digitail/clinics", requireAdmin, async (_req, res) => {
    try {
      const data = await digitailApi("/auth/me?include=multipleClinic");
      res.json(data);
    } catch (error: any) {
      console.error("[digitail] clinic discovery failed:", redactErrorMessage(error));
      res.status(error?.status || 502).json({ error: "digitail_clinic_discovery_failed", details: redactSecrets(JSON.stringify(error?.details || error?.message || String(error))) });
    }
  });

  // Sandbox-only, read-only smoke test. Do not turn this into a generic API proxy.
  const sandboxClinicIds = new Set(["703", "704"]);
  const sandboxTestPath = "/appointments";
  app.get("/api/digitail/test", requireAdmin, async (req, res) => {
    try {
      const clinicId = typeof req.query.clinicId === "string" ? req.query.clinicId.trim() : "";
      if (!sandboxClinicIds.has(clinicId)) return res.status(400).json({ error: "invalid_sandbox_clinic_id" });

      const requestedPath = typeof req.query.path === "string" ? req.query.path.trim() : sandboxTestPath;
      if (requestedPath !== sandboxTestPath) return res.status(400).json({ error: "unsupported_test_endpoint" });

      const data = await digitailApi(sandboxTestPath, clinicId);
      res.json({ clinicId, path: sandboxTestPath, data });
    } catch (error: any) {
      console.error("[digitail] API test failed:", redactErrorMessage(error));
      res.status(error?.status || 502).json({ error: "digitail_api_test_failed", details: redactSecrets(JSON.stringify(error?.details || error?.message || String(error))) });
    }
  });
}
