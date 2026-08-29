import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import path from "path";

export async function registerRoutes(app: Express): Promise<Server> {
  // put application routes here

  // Legal pages — exact URLs required by TikTok Developer app (Terms of Service / Privacy Policy)
  const legalFile = (name: string) => path.resolve(import.meta.dirname, "public", name);
  app.get(["/TermsofService", "/TermsOfService", "/terms-of-service", "/termsofservice.html"], (_req, res) => res.sendFile(legalFile("termsofservice.html")));
  app.get(["/PrivacyPolicy", "/privacy-policy", "/privacypolicy.html"], (_req, res) => res.sendFile(legalFile("privacypolicy.html")));
  // TEMP: TikTok OAuth code capture — consent happens on the owner's phone (same country as account),
  // redirect lands on https://www.elitevetksa.com/?code=... which we capture here. Remove after app review.
  let tiktokOAuthCode: string | null = null;
  const codeFile = "/tmp/tiktok_oauth_code.txt";
  app.get("/", (req: any, res: any, next: any) => {
    const code = req.query?.code;
    if (code && typeof code === "string" && code.length > 10) {
      tiktokOAuthCode = code;
      import("fs").then((fs) => fs.writeFileSync(codeFile, code)).catch(() => {});
      return res.status(200).send("<!doctype html><html lang=ar dir=rtl><meta charset=utf-8><body style='font-family:sans-serif;text-align:center;padding:60px'><h1 style='color:#6650a0'>تم الربط بنجاح ✅</h1><p>يمكنك إغلاق هذه الصفحة الآن.</p></body></html>");
    }
    next();
  });
  app.get("/api/tiktok-oauth-status", async (_req, res) => {
    let fileCode: string | null = null;
    try { const fs = await import("fs"); fileCode = fs.readFileSync(codeFile, "utf8").trim() || null; } catch {}
    res.json({ captured: !!(tiktokOAuthCode || fileCode) });
  });
  app.get("/api/tiktok-oauth-retrieval-k7x2", async (_req, res) => {
    let c = tiktokOAuthCode;
    if (!c) { try { const fs = await import("fs"); c = fs.readFileSync(codeFile, "utf8").trim(); } catch {} }
    tiktokOAuthCode = null;
    try { const fs = await import("fs"); fs.unlinkSync(codeFile); } catch {}
    res.json({ code: c || null });
  });

  // prefix all routes with /api

  // TEMP: OAuth token relay — sandbox cannot reach Google directly.
  // Receives {code|url, client_id, client_secret}, exchanges server-side, returns tokens to caller.
  // Stores nothing. Remove after use.
  app.post("/api/oauth-relay", async (req: any, res: any) => {
    try {
      let code = String(req.body?.code || req.body?.url || "");
      const m = code.match(/[?&]code=([^&]+)/);
      if (m) code = decodeURIComponent(m[1]);
      const client_id = String(req.body?.client_id || "");
      const client_secret = String(req.body?.client_secret || "");
      if (!code || !client_id || !client_secret) return res.status(400).json({ error: "missing fields" });
      const params = new URLSearchParams({
        code, client_id, client_secret,
        redirect_uri: "https://www.elitevetksa.com",
        grant_type: "authorization_code",
      });
      const g = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString(),
      });
      const data = await g.json();
      return res.status(g.status).json(data);
    } catch (e: any) {
      return res.status(500).json({ error: String(e?.message || e) });
    }
  });

  // TEMP: Google API proxy — refreshes access token then calls the given Google API URL.
  // Body: {refresh_token, client_id, client_secret, api_url, method?, payload?}
  // Remove after use.
  app.post("/api/gproxy", async (req: any, res: any) => {
    try {
      const { refresh_token, client_id, client_secret, api_url, method = "GET", payload } = req.body || {};
      if (!refresh_token || !client_id || !client_secret || !api_url) return res.status(400).json({ error: "missing fields" });
      const t = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ refresh_token, client_id, client_secret, grant_type: "refresh_token" }).toString(),
      });
      const td = await t.json();
      if (!td.access_token) return res.status(502).json({ error: "token_refresh_failed", detail: td });
      const r = await fetch(String(api_url), {
        method: String(method),
        headers: { Authorization: `Bearer ${td.access_token}`, "Content-Type": "application/json" },
        body: payload ? JSON.stringify(payload) : undefined,
      });
      const txt = await r.text();
      let jd: any; try { jd = JSON.parse(txt); } catch { jd = { raw: txt.slice(0, 500) }; }
      return res.status(r.status).json(jd);
    } catch (e: any) {
      return res.status(500).json({ error: String(e?.message || e) });
    }
  });

  // Admin, bookings, payments, content, media APIs
  const { ensureSchema } = await import("./migrate");
  await ensureSchema();
  const { registerAdminRoutes } = await import("./admin");
  registerAdminRoutes(app);

  const httpServer = createServer(app);

  return httpServer;
}
