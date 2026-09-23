# Production Readiness Audit — 2026-09-23

Scope: current `main` (post #29/#30) + live Render configuration. Statuses:
**READY** / **BLOCKED** / **OWNER ACTION** / **EXTERNAL PROVIDER ACTION**.
Digitail production is NOT READY until George's confirmations arrive.

## Platform & code

| Item                 | Status                  | Evidence / note                                                                                                          |
| -------------------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| TypeScript baseline  | READY                   | 5 baseline errors fixed (#31); `tsc --noEmit` = 0 errors                                                                 |
| CI pipeline          | READY (after #31 merge) | `.github/workflows/ci.yml`: install, format, lint, typecheck, build, tests, im-verify, secret-scan, migration validation |
| Build                | READY                   | `npm run build` green                                                                                                    |
| Test suites          | READY                   | `im-verify` 38/38; `run-tests` auto-discovers future suites                                                              |
| Secret scan          | READY                   | `scripts/secret-scan.mts` in CI; redact.ts covers all configured secrets                                                 |
| Migration validation | READY                   | `scripts/migration-verify.mts` applies full DDL twice on real Postgres WASM                                              |

## Runtime safety (server)

| Item                        | Status       | Evidence / note                                                                                                                                             |
| --------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Feature flags               | READY        | All production-facing flags OFF: `INTEGRATIONS_MANAGER`, `WHATSAPP_ENABLED`, `DYNAMIC_DEPOSIT_ENABLED`, `EMERGENCY_PATH_ENABLED`, `MESSAGING_PROVIDER=stub` |
| Booking race protection     | READY        | Booking-level atomic claim (`status='confirming'`) + slot-level `hub_slot_claims` (TTL, no deadlock) — 20-way races verified live (#30)                     |
| Payment replay protection   | READY        | Event keys `inv:status:tx`, HMAC-SHA256 webhook verification, 200-then-async, replay/duplicate verified live                                                |
| Idempotency                 | READY        | Booking idempotency keys; confirm pipeline idempotent (`idempotent:true` evidence)                                                                          |
| Circuit breakers            | READY        | Digitail CB (5 failures → open); Integrations health CB per provider                                                                                        |
| Rate limits                 | READY        | Public hub endpoints rate-limited; admin test endpoint 5/min/provider                                                                                       |
| Audit logging               | READY        | `hub_audit_log` for payment/booking/integration actions; no secret material (verified)                                                                      |
| Cleanup jobs                | READY        | Sweeper (holds expiry, dispatch, OTP purge) with PG advisory lock                                                                                           |
| Health endpoints            | READY        | `/api/digitail/health`, IM health (flag-gated), webhook health records                                                                                      |
| Messaging fallbacks         | READY        | Stub provider default; booking_unavailable fallback shows WhatsApp number; quiet hours enforced                                                             |
| Rollback behavior           | READY        | Render deploys revertible; additive-only migrations (no destructive DDL shipped)                                                                            |
| Deployment safety           | READY        | Auto-deploy from main; env changes apply only on new deploy (verified)                                                                                      |
| Backup/recovery assumptions | OWNER ACTION | Render PG plan backups not verified in this audit — confirm point-in-time recovery / snapshot schedule on the Render dashboard                              |

## Integrations

| Integration           | Status                   | Remaining blocker                                                                        |
| --------------------- | ------------------------ | ---------------------------------------------------------------------------------------- |
| Digitail (sandbox)    | READY                    | Contract fully verified incl. pet fields + slot guards                                   |
| Digitail (production) | EXTERNAL PROVIDER ACTION | Waiting on George (production OAuth/whitelist/clinic access 3010/3011/3012/3381/3850)    |
| MyFatoorah (test)     | READY                    | Webhook signature verified live; replay/idempotency proven; payments OFF                 |
| MyFatoorah (live)     | OWNER ACTION             | Go-live decision + `MYFATOORAH_MODE=live` at launch                                      |
| M365 email            | READY                    | SMTP XOAUTH2 verified (235 + controlled send accepted)                                   |
| Google Ads            | BLOCKED (sandbox egress) | SA auth verified locally; live OAuth unreachable from sandbox — runs from Render runtime |
| Bevatel WhatsApp      | EXTERNAL PROVIDER ACTION | Needs Developer API-module token for account 120                                         |
| Bevatel SMS           | EXTERNAL PROVIDER ACTION | Needs approved Sender ID (upstream 6307); code ready, disabled                           |
| Meta WhatsApp         | BLOCKED                  | Not configured externally                                                                |

## Protected assets

| Item                                                                         | Status                                                                                  |
| ---------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Dr Paws isolation (Inbox 810, +966 9200 03045, GBP listings, Render service) | READY — hard isolation in code (`protectedAssets`), hidden from IM, 38/38 tests enforce |
