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

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  const httpServer = createServer(app);

  return httpServer;
}
