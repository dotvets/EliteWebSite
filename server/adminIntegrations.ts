// ============================================================================
// Integrations Manager V1 — admin routes (approved design §6, §13).
// Everything is behind INTEGRATIONS_MANAGER (Category C flag) + requireAdmin.
// Sensitive actions require a textual confirmation token (design §6.3).
// ============================================================================

import type { Express, Request, Response } from "express";
import { requireAdmin } from "./admin";
import { CATEGORY_C_DISPLAY, getProvider, PROVIDERS } from "./integrations/registry";
import {
  getIntegrationView,
  integrationEvents,
  listIntegrationViews,
  listRoutes,
  setEnabled,
  setRoute,
  upsertConfig,
  ROUTING_PURPOSES,
} from "./integrations/configStore";
import { runSafeTest } from "./integrations/adapters";
import { recordTestResult } from "./integrations/health";
import { logEvent } from "./integrations/configStore";

export function integrationsManagerEnabled(): boolean {
  return (process.env.INTEGRATIONS_MANAGER || "false").toLowerCase() === "true";
}

function actor(req: Request): string {
  return `admin:${(req.session as any)?.adminId || "unknown"}`;
}

// Per-provider test rate limit: 5 tests / minute (design §13).
const testBuckets = new Map<string, number[]>();
function testRateOk(providerKey: string): boolean {
  const now = Date.now();
  const arr = (testBuckets.get(providerKey) || []).filter((t) => now - t < 60_000);
  if (arr.length >= 5) return false;
  arr.push(now);
  testBuckets.set(providerKey, arr);
  return true;
}

export function registerAdminIntegrationRoutes(app: Express) {
  // Flag gate: dark 404 when disabled — the manager ships dark until accepted.
  app.use("/api/admin/integrations", (req, res, next) => {
    if (!integrationsManagerEnabled()) return res.status(404).json({ error: "not_found" });
    return next();
  });

  // ---- List (Dr Paws scopes are filtered inside the store) ----
  app.get("/api/admin/integrations", requireAdmin, async (_req, res) => {
    res.json({ integrations: await listIntegrationViews() });
  });

  // ---- Category C inventory (display-only; flags are NEVER editable here) ----
  app.get("/api/admin/integrations/system", requireAdmin, (_req, res) => {
    res.json({
      categoryC: CATEGORY_C_DISPLAY.map((c) => ({
        key: c.key,
        label: c.label,
        isFlag: c.isFlag,
        // Flags/ids are safe to display as state; values only for non-secret ops config.
        state: c.isFlag ? ((process.env[c.key] || "false").toLowerCase() === "true" ? "on" : "off") : "configured_state_hidden",
      })),
      note: "Category C is deployment-controlled — this dashboard never modifies it.",
    });
  });

  app.get("/api/admin/integrations/events", requireAdmin, async (req, res) => {
    const limit = Number(req.query.limit) || 100;
    res.json({ events: await integrationEvents(limit) });
  });

  app.get("/api/admin/integrations/routing", requireAdmin, async (_req, res) => {
    res.json({ routes: await listRoutes(), purposes: ROUTING_PURPOSES });
  });

  app.put("/api/admin/integrations/routing", requireAdmin, async (req, res) => {
    const { brandId, purpose, providerKey, environment, confirm } = req.body || {};
    if (purpose === "emergency" && confirm !== "ROUTE-EMERGENCY") {
      return res.status(400).json({ error: "confirmation_required", hint: "confirm=ROUTE-EMERGENCY" });
    }
    const r = await setRoute({ brandId: String(brandId || ""), purpose, providerKey: String(providerKey || ""), environment: String(environment || "sandbox") as any, actor: actor(req) });
    if (!r.ok) return res.status(400).json({ error: r.error });
    res.json({ ok: true });
  });

  // ---- Provider catalog (schemas for the UI — allowlisted fields only) ----
  app.get("/api/admin/integrations/catalog", requireAdmin, (_req, res) => {
    res.json({
      providers: PROVIDERS.map((p) => ({
        key: p.key,
        displayNameAr: p.displayNameAr,
        displayNameEn: p.displayNameEn,
        category: p.category,
        allowedScopes: p.allowedScopes,
        allowedEnvironments: p.allowedEnvironments,
        configFields: p.configFields.map((f) => ({ key: f.key, kind: f.kind, enumValues: f.enumValues, required: !!f.required, sensitiveAction: !!f.sensitiveAction })),
        secretRefs: p.secretRefs.map((r) => ({ key: r.key, envName: r.envName, required: r.required })),
        testCapability: p.testCapability,
      })),
    });
  });

  // ---- Single provider ----
  app.get("/api/admin/integrations/:provider", requireAdmin, async (req, res) => {
    const v = await getIntegrationView(String(req.params.provider));
    if (!v) return res.status(404).json({ error: "unknown_provider" });
    res.json(v);
  });

  // ---- Category A write (strict schema, audited; secrets rejected upstream) ----
  app.put("/api/admin/integrations/:provider/config", requireAdmin, async (req, res) => {
    const { scopeType, scopeId, environment, config, confirm } = req.body || {};
    const env = String(environment || "");
    if (env === "production" && confirm !== "SET-PRODUCTION") {
      return res.status(400).json({ error: "confirmation_required", hint: "confirm=SET-PRODUCTION" });
    }
    const r = await upsertConfig({
      providerKey: String(req.params.provider),
      scopeType: String(scopeType || "") as any,
      scopeId: String(scopeId || ""),
      environment: env as any,
      config: config || {},
      actor: actor(req),
    });
    if (!r.ok) return res.status(400).json({ error: r.error });
    res.json({ ok: true });
  });

  // ---- Enable/disable (sensitive: requires confirmation token) ----
  app.post("/api/admin/integrations/:provider/enabled", requireAdmin, async (req, res) => {
    const { enabled, confirm } = req.body || {};
    if (typeof enabled !== "boolean") return res.status(400).json({ error: "invalid_enabled" });
    if (confirm !== (enabled ? "ENABLE" : "DISABLE")) {
      return res.status(400).json({ error: "confirmation_required", hint: "confirm=ENABLE|DISABLE" });
    }
    const r = await setEnabled(String(req.params.provider), enabled, actor(req));
    if (!r.ok) return res.status(400).json({ error: r.error });
    res.json({ ok: true });
  });

  // ---- Safe Test Connection (design §13): read-only, rate-limited, redacted ----
  app.post("/api/admin/integrations/:provider/test", requireAdmin, async (req, res) => {
    const providerKey = String(req.params.provider);
    const provider = getProvider(providerKey);
    if (!provider) return res.status(404).json({ error: "unknown_provider" });
    if (!testRateOk(providerKey)) return res.status(429).json({ error: "rate_limited", retry_after_seconds: 60 });
    const view = await getIntegrationView(providerKey);
    const result = await runSafeTest(providerKey);
    if ("error" in result) return res.status(400).json(result);
    await recordTestResult(providerKey, view?.scopeId ?? null, result.result, result.errorClass);
    await logEvent(actor(req), providerKey, view?.scopeId ?? null, "test.run", {
      outcome: result.result, error_class: result.errorClass ?? null, latency_ms: result.latencyMs,
    }, result.result === "failed" ? "failed" : "ok");
    // Only the reduced, redacted result reaches the browser — never raw upstream data.
    res.json({ provider: providerKey, ...result });
  });

}