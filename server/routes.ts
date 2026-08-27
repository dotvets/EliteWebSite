import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // put application routes here
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

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  const httpServer = createServer(app);

  return httpServer;
}
