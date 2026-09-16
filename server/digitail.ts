import crypto from "crypto";
import type { Express, Request, Response } from "express";
import { pool } from "./db";

const DIGITAIL_AUTHORIZE_URL = "https://vet.digitail.io/oauth/authorize";
const DIGITAIL_TOKEN_URL = "https://vet.digitail.io/oauth/token";
const TOKEN_ALGORITHM = "aes-256-gcm";

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

function redirectUri(): string {
  return process.env.DIGITAIL_REDIRECT_URI || "https://www.elitevetksa.com/api/digitail/callback";
}

function encryptionKey(): Buffer {
  const raw = required("DIGITAIL_TOKEN_ENCRYPTION_KEY");
  const key = Buffer.from(raw, "hex");
  if (key.length !== 32) {
    throw new Error("DIGITAIL_TOKEN_ENCRYPTION_KEY must be a 64-character hex string (32 bytes)");
  }
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

async function exchangeCode(code: string, verifier: string) {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: required("DIGITAIL_CLIENT_ID"),
    client_secret: required("DIGITAIL_CLIENT_SECRET"),
    redirect_uri: redirectUri(),
    code_verifier: verifier,
    code,
  });

  const response = await fetch(DIGITAIL_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  const data = await response.json();
  if (!response.ok || !data.access_token || !data.refresh_token) {
    throw new Error(`Digitail token exchange failed (${response.status}): ${JSON.stringify(data)}`);
  }
  return data as { access_token: string; refresh_token: string; expires_in: number; token_type: string };
}

async function refreshTokens(refreshToken: string) {
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    client_id: required("DIGITAIL_CLIENT_ID"),
    client_secret: required("DIGITAIL_CLIENT_SECRET"),
  });

  const response = await fetch(DIGITAIL_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  const data = await response.json();
  if (!response.ok || !data.access_token || !data.refresh_token) {
    throw new Error(`Digitail token refresh failed (${response.status}): ${JSON.stringify(data)}`);
  }
  return data as { access_token: string; refresh_token: string; expires_in: number; token_type: string };
}

async function saveTokens(tokens: { access_token: string; refresh_token: string; expires_in: number }) {
  await pool.query(
    `INSERT INTO digitail_connections (id, access_token_enc, refresh_token_enc, access_token_expires_at, updated_at)
     VALUES ('default', $1, $2, NOW() + ($3::text || ' seconds')::interval, NOW())
     ON CONFLICT (id) DO UPDATE SET
       access_token_enc = EXCLUDED.access_token_enc,
       refresh_token_enc = EXCLUDED.refresh_token_enc,
       access_token_expires_at = EXCLUDED.access_token_expires_at,
       updated_at = NOW()`,
    [encrypt(tokens.access_token), encrypt(tokens.refresh_token), tokens.expires_in],
  );
}

async function loadConnection() {
  const result = await pool.query(
    `SELECT access_token_enc, refresh_token_enc, access_token_expires_at FROM digitail_connections WHERE id = 'default' LIMIT 1`,
  );
  return result.rows[0] || null;
}

export function registerDigitailRoutes(app: Express) {
  app.get("/api/digitail/connect", (req: Request, res: Response) => {
    try {
      const verifier = randomString(48);
      const state = randomString(32);
      const challenge = createCodeChallenge(verifier);
      const session = req.session as any;
      session.digitailOAuth = { verifier, state, createdAt: Date.now() };

      const url = new URL(DIGITAIL_AUTHORIZE_URL);
      url.searchParams.set("response_type", "code");
      url.searchParams.set("client_id", required("DIGITAIL_CLIENT_ID"));
      url.searchParams.set("client_secret", required("DIGITAIL_CLIENT_SECRET"));
      url.searchParams.set("redirect_uri", redirectUri());
      url.searchParams.set("state", state);
      url.searchParams.set("code_challenge", challenge);
      url.searchParams.set("code_challenge_method", "S256");

      res.redirect(url.toString());
    } catch (error: any) {
      res.status(500).json({ error: "digitail_config_error", message: error?.message || String(error) });
    }
  });

  app.get("/api/digitail/callback", async (req: Request, res: Response) => {
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
      console.error("[digitail] OAuth callback failed:", error?.message || error);
      res.status(500).json({ error: "digitail_oauth_failed", message: error?.message || String(error) });
    }
  });

  app.get("/api/digitail/status", async (_req, res) => {
    try {
      const connection = await loadConnection();
      res.json({ connected: !!connection, expiresAt: connection?.access_token_expires_at || null });
    } catch (error: any) {
      res.status(500).json({ error: "digitail_status_failed", message: error?.message || String(error) });
    }
  });

  app.post("/api/digitail/refresh", async (_req, res) => {
    try {
      const connection = await loadConnection();
      if (!connection) return res.status(404).json({ error: "digitail_not_connected" });

      const tokens = await refreshTokens(decrypt(connection.refresh_token_enc));
      await saveTokens(tokens);
      res.json({ refreshed: true, expiresIn: tokens.expires_in });
    } catch (error: any) {
      console.error("[digitail] token refresh failed:", error?.message || error);
      res.status(502).json({ error: "digitail_refresh_failed", message: error?.message || String(error) });
    }
  });
}
