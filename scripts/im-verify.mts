// Integrations Manager V1 — acceptance harness (temporary; deleted after use).
// Runs pure/unit checks without a DB + pg-mem checks for the config store.
import assert from "node:assert";

const results: { name: string; pass: boolean; err?: string }[] = [];
async function check(name: string, fn: () => unknown | Promise<unknown>) {
  try { await fn(); results.push({ name, pass: true }); }
  catch (e: any) { results.push({ name, pass: false, err: e?.message }); }
}

// ---------------------------------------------------------------------------
// 1) Registry: strict schema validation + secret scanner
// ---------------------------------------------------------------------------
const { PROVIDERS, getProvider, validateCategoryA, findSecretLeak, CATEGORY_C_DISPLAY } = await import("../server/integrations/registry");

await check("registry: 6 providers registered", () => {
  assert.equal(PROVIDERS.length, 6);
  for (const k of ["digitail", "myfatoorah", "google_ads", "m365", "bevatel", "meta_whatsapp"]) assert.ok(getProvider(k));
});

await check("schema: valid bevatel Category A config passes", () => {
  const p = getProvider("bevatel")!;
  const r = validateCategoryA(p, { account_id: "120", inbox_id: "272", channel_id: "272", template_map: { otp: "1069317625858703" } });
  assert.ok(r.ok, (r as any).error);
});

await check("schema: unknown field rejected (strict)", () => {
  const r = validateCategoryA(getProvider("bevatel")!, { account_id: "120", inbox_id: "272", evil_url: "https://x.com" });
  assert.ok(!r.ok && r.error.startsWith("unknown_field"));
});

await check("schema: required field missing rejected", () => {
  const r = validateCategoryA(getProvider("bevatel")!, { account_id: "120" });
  assert.ok(!r.ok && r.error.includes("missing_field"));
});

await check("schema: secret-looking KEY rejected", () => {
  const r = validateCategoryA(getProvider("m365")!, { sender_mailbox: "a@b.co", mode: "smtp", access_token: "x" });
  assert.ok(!r.ok);
});

await check("scanner: private key material rejected", () => {
  assert.ok(findSecretLeak({ cfg: "-----BEGIN PRIVATE KEY-----\nABC" }));
  assert.ok(findSecretLeak({ nested: { client_secret: "abc" } }));
  assert.ok(findSecretLeak({ h: "Bearer abcdefghijklmnop" }));
  assert.equal(findSecretLeak({ account_id: "120" }), null);
});

await check("schema: enum validation (m365 mode)", () => {
  assert.ok(!validateCategoryA(getProvider("m365")!, { sender_mailbox: "a@b.co", mode: "smtp2" }).ok);
  assert.ok(validateCategoryA(getProvider("m365")!, { sender_mailbox: "a@b.co", mode: "smtp" }).ok);
});

await check("schema: invalid email rejected", () => {
  assert.ok(!validateCategoryA(getProvider("m365")!, { sender_mailbox: "not-an-email", mode: "smtp" }).ok);
});

await check("category C: production flags are display-only inventory", () => {
  const flags = CATEGORY_C_DISPLAY.map((c) => c.key);
  for (const f of ["MYFATOORAH_MODE", "DYNAMIC_DEPOSIT_ENABLED", "EMERGENCY_PATH_ENABLED", "INTEGRATIONS_MANAGER"]) assert.ok(flags.includes(f));
});

// ---------------------------------------------------------------------------
// 2) Dr Paws hard isolation
// ---------------------------------------------------------------------------
const { assertNoProtectedAsset, isProtectedBrand, visibleScope, PROTECTED_ASSETS } = await import("../server/integrations/protectedAssets");

await check("isolation: drpaws brand blocked from config writes", () => {
  assert.ok(isProtectedBrand("drpaws"));
  assert.ok(!visibleScope("brand", "drpaws"));
  assert.throws(() => assertNoProtectedAsset("bevatel", "brand", "drpaws", {}), /protected_asset/);
});

await check("isolation: protected inbox 810 rejected even for elite scope", () => {
  assert.throws(() => assertNoProtectedAsset("bevatel", "brand", "elite", { inbox_id: "810" }), /protected_asset/);
});

await check("isolation: protected phone in template_map rejected", () => {
  assert.throws(() => assertNoProtectedAsset("bevatel", "brand", "elite", { inbox_id: "272", template_map: { otp: "966920003045" } }), /protected_asset/);
});

await check("isolation: legitimate elite config passes", () => {
  assertNoProtectedAsset("bevatel", "brand", "elite", { inbox_id: "272", template_map: { otp: "1069317625858703" } });
  assert.deepEqual(PROTECTED_ASSETS.bevatelInboxIds, ["810"]);
});

// ---------------------------------------------------------------------------
// 3) Config store with pg-mem
// ---------------------------------------------------------------------------
const { newDb } = await import("pg-mem");
const mem = newDb();
const pg = mem.adapters.createPg();
const memPool = new pg.Pool();
await memPool.query(`
CREATE TABLE hub_integrations_configs (id varchar PRIMARY KEY, provider_key varchar NOT NULL, scope_type varchar NOT NULL, scope_id varchar NOT NULL, environment varchar NOT NULL, config_json jsonb NOT NULL DEFAULT '{}', secret_refs_json jsonb NOT NULL DEFAULT '{}', enabled boolean NOT NULL DEFAULT false, blocked_reason varchar, created_by varchar, updated_by varchar, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), UNIQUE (provider_key, scope_type, scope_id, environment));
CREATE TABLE hub_integrations_health (provider_key varchar NOT NULL, scope_id varchar NOT NULL DEFAULT '*', last_test_at timestamptz, last_test_result varchar, last_success_at timestamptz, last_failure_at timestamptz, last_error_class varchar, consecutive_failures integer NOT NULL DEFAULT 0, circuit_opened_at timestamptz, webhook_last_event_at timestamptz, PRIMARY KEY (provider_key, scope_id));
CREATE TABLE hub_integrations_events (id varchar PRIMARY KEY, actor varchar NOT NULL, provider_key varchar NOT NULL, scope_id varchar, action varchar NOT NULL, meta_json jsonb NOT NULL DEFAULT '{}', result varchar NOT NULL DEFAULT 'ok', created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE hub_messaging_routes (id varchar PRIMARY KEY, brand_id varchar NOT NULL, purpose varchar NOT NULL, provider_key varchar NOT NULL, environment varchar NOT NULL, updated_by varchar, updated_at timestamptz NOT NULL DEFAULT now(), created_at timestamptz NOT NULL DEFAULT now(), UNIQUE (brand_id, purpose, environment));
`);

// Patch the shared pool before importing the store (same trick as g3-verify).
const dbModule = await import("../server/db");
(dbModule as any).pool.query = memPool.query.bind(memPool);

process.env.BEVATEL_ACCESS_TOKEN = "x-test-token";
process.env.BEVATEL_API_KEY = "x-test-key";
process.env.BEVATEL_WEBHOOK_VERIFY_TOKEN = "x-test-verify";
process.env.BEVATEL_ACCOUNT_ID = "120";
delete process.env.GOOGLE_ADS_DEVELOPER_TOKEN;

const store = await import("../server/integrations/configStore");

await check("store: externally configured detection (bevatel env present)", () => {
  const p = getProvider("bevatel")!;
  assert.ok(store.externallyConfigured(p));
  assert.ok(!store.externallyConfigured(getProvider("meta_whatsapp")!));
});

await check("store: valid write persists + audited", async () => {
  const r = await store.upsertConfig({ providerKey: "bevatel", scopeType: "brand", scopeId: "elite", environment: "production", config: { account_id: "120", inbox_id: "272" }, actor: "test" });
  assert.ok(r.ok, (r as any).error);
  const ev = await memPool.query(`SELECT * FROM hub_integrations_events WHERE action = 'config.create'`);
  assert.equal(ev.rows.length, 1);
});

await check("store: no secret values anywhere in DB row", async () => {
  const r = await memPool.query(`SELECT * FROM hub_integrations_configs WHERE provider_key='bevatel'`);
  const raw = JSON.stringify(r.rows[0]);
  assert.ok(!raw.includes("x-test-token") && !raw.includes("x-test-key") && !raw.includes("x-test-verify"));
  assert.ok(raw.includes("render_env"));
});

await check("store: drpaws write rejected", async () => {
  const r = await store.upsertConfig({ providerKey: "bevatel", scopeType: "brand", scopeId: "drpaws", environment: "production", config: { account_id: "1", inbox_id: "1" }, actor: "test" });
  assert.ok(!r.ok && r.error === "protected_asset");
});

await check("store: invalid scope rejected", async () => {
  const r = await store.upsertConfig({ providerKey: "digitail", scopeType: "brand", scopeId: "elite", environment: "sandbox", config: { connection_scope: "elite" }, actor: "test" });
  assert.ok(!r.ok && r.error === "invalid_scope");
});

await check("store: view computes status + hides secrets", async () => {
  const v = await store.getIntegrationView("bevatel");
  assert.ok(v);
  assert.equal(v!.status, "disabled"); // row exists, enabled=false
  const raw = JSON.stringify(v);
  assert.ok(!raw.includes("x-test-token"));
  assert.ok(v!.secrets.every((s) => s.state === "configured"));
});

await check("store: google_ads blocked (developer token missing)", async () => {
  process.env.GOOGLE_ADS_SERVICE_ACCOUNT_JSON = "{}"; // presence only
  const v = await store.getIntegrationView("google_ads");
  assert.equal(v!.status, "blocked");
  assert.equal(v!.blockedReason, "developer_token_missing");
});

await check("store: meta_whatsapp not_configured", async () => {
  delete process.env.META_WHATSAPP_ACCESS_TOKEN;
  delete process.env.META_WHATSAPP_VERIFY_TOKEN;
  const v = await store.getIntegrationView("meta_whatsapp");
  assert.equal(v!.status, "not_configured");
});

await check("store: enable/disable audited", async () => {
  await store.setEnabled("bevatel", true, "test");
  const v = await store.getIntegrationView("bevatel");
  assert.equal(v!.enabled, true);
  assert.ok(["configured", "ready", "needs_attention"].includes(v!.status));
  const ev = await memPool.query(`SELECT * FROM hub_integrations_events WHERE action='provider.enable'`);
  assert.equal(ev.rows.length, 1);
});

// ---------------------------------------------------------------------------
// 4) Routing
// ---------------------------------------------------------------------------
await check("routing: set route for elite otp → bevatel", async () => {
  const r = await store.setRoute({ brandId: "elite", purpose: "otp", providerKey: "bevatel", environment: "production", actor: "test" });
  assert.ok(r.ok, r.error);
  const got = await store.resolveRouteProvider("elite", "otp", "production");
  assert.equal(got, "bevatel");
});

await check("routing: drpaws route rejected + never resolves", async () => {
  const r = await store.setRoute({ brandId: "drpaws", purpose: "otp", providerKey: "bevatel", environment: "production", actor: "test" });
  assert.ok(!r.ok && r.error === "protected_asset");
  assert.equal(await store.resolveRouteProvider("drpaws", "otp", "production"), null);
});

await check("routing: non-messaging provider rejected", async () => {
  const r = await store.setRoute({ brandId: "elite", purpose: "otp", providerKey: "myfatoorah", environment: "production", actor: "test" });
  assert.ok(!r.ok && r.error === "invalid_provider");
});

await check("routing: routes list hides drpaws", async () => {
  await memPool.query(`INSERT INTO hub_messaging_routes (id, brand_id, purpose, provider_key, environment) VALUES ('x', 'drpaws', 'otp', 'bevatel', 'production')`);
  const routes = await store.listRoutes();
  assert.ok(routes.every((r: any) => r.brand_id !== "drpaws"));
});

// ---------------------------------------------------------------------------
// 5) Health model + circuit breaker
// ---------------------------------------------------------------------------
const { recordTestResult, classifyError } = await import("../server/integrations/health");

await check("health: ok then 5 failures open circuit", async () => {
  process.env.M365_CLIENT_ID = "x"; process.env.M365_CLIENT_SECRET = "x"; process.env.M365_TENANT_ID = "x";
  await recordTestResult("m365", "*", "ok");
  let h = (await memPool.query(`SELECT * FROM hub_integrations_health WHERE provider_key='m365'`)).rows[0];
  assert.equal(h.consecutive_failures, 0);
  for (let i = 0; i < 5; i++) await recordTestResult("m365", "*", "failed", "auth_denied");
  h = (await memPool.query(`SELECT * FROM hub_integrations_health WHERE provider_key='m365'`)).rows[0];
  assert.equal(h.consecutive_failures, 5);
  assert.ok(h.circuit_opened_at);
  const v = await store.getIntegrationView("m365");
  assert.ok(v!.health && v!.health.circuitState === "open");
  assert.equal(v!.status, "connection_failed");
});

await check("health: error classifier leaks nothing", () => {
  assert.equal(classifyError({ status: 401, message: "secret=x-test-token" }), "auth_denied");
  assert.equal(classifyError({ code: "ETIMEDOUT" }), "network_unreachable");
  assert.equal(classifyError(new Error("connect timeout")), "timeout");
});

// ---------------------------------------------------------------------------
// 6) Flag gate + adapters shape
// ---------------------------------------------------------------------------
const { integrationsManagerEnabled } = await import("../server/adminIntegrations");
await check("flag: INTEGRATIONS_MANAGER gates the manager", () => {
  delete process.env.INTEGRATIONS_MANAGER;
  assert.equal(integrationsManagerEnabled(), false);
  process.env.INTEGRATIONS_MANAGER = "true";
  assert.equal(integrationsManagerEnabled(), true);
  delete process.env.INTEGRATIONS_MANAGER;
});

const { runSafeTest } = await import("../server/integrations/adapters");
await check("adapters: google_ads blocked without developer token", async () => {
  const r = await runSafeTest("google_ads");
  assert.ok("result" in r && r.result === "blocked");
});

await check("adapters: meta missing secrets fails cleanly", async () => {
  const r = await runSafeTest("meta_whatsapp");
  assert.ok("result" in r && r.result === "failed" && r.errorClass === "missing_secret_ref");
});

await check("adapters: unknown provider rejected", async () => {
  const r = await runSafeTest("evil");
  assert.ok("error" in r);
});

// ---------------------------------------------------------------------------
const passed = results.filter((r) => r.pass).length;
console.log(`\n${passed}/${results.length} PASS`);
for (const r of results.filter((r) => !r.pass)) console.log(`FAIL: ${r.name} — ${r.err}`);
process.exit(passed === results.length ? 0 : 1);
