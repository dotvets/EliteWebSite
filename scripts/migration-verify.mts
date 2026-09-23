// CI: migration/schema validation — applies the canonical DDL from
// server/migrate.ts to a REAL Postgres engine (@electric-sql/pglite, WASM —
// no server, no network, no production contact), TWICE (idempotency), then
// asserts the critical tables exist. Fails on any DDL error.
import assert from "node:assert";

const { DDL } = await import("../server/migrate");
const { PGlite } = await import("@electric-sql/pglite");

const db = new PGlite();
await db.exec(DDL);
await db.exec(DDL); // second run must not throw (CREATE TABLE IF NOT EXISTS …)

const required = [
  "hub_bookings",
  "hub_payments",
  "hub_notifications",
  "hub_audit_log",
  "hub_slot_claims",
  "hub_integrations_configs",
  "hub_integrations_health",
  "hub_integrations_events",
  "hub_messaging_routes",
  "digitail_connections_v2",
];
for (const t of required) {
  const r = await db.query<{ c: number }>(
    `SELECT COUNT(*)::int AS c FROM information_schema.tables WHERE table_schema='public' AND table_name=$1`,
    [t],
  );
  assert.equal(r.rows[0].c, 1, `missing table: ${t}`);
}
await db.close();
console.log(
  `migration-verify: DDL applied twice on real Postgres (pglite), ${required.length} critical tables present — PASS`,
);
