# INTEGRATIONS & OPERATIONS

## Messaging provider strategy (Phase 2, Part 6.3)

- `MESSAGING_PROVIDER=stub` (default): log-only provider for sandbox/staging. Fully implemented.
- `MESSAGING_PROVIDER=bevatel`: Bevatel is the primary production provider (Addendum A4).
  **Status: EXTERNAL DEPENDENCY — contract not yet verified.** The adapter is a config shell
  (`BEVATEL_API_BASE_URL`, `BEVATEL_API_KEY`); every capability (OTP SMS, transactional,
  reminders, WhatsApp BSP, delivery callbacks) must be verified against official Bevatel API
  docs BEFORE implementation. No endpoint is implemented until verified. Unverified sends
  throw a clear error rather than guessing.
- Sender identity is per-brand: `hub_brands.config_json.messaging.smsSenderId` — cross-brand
  sender mix-ups are release-blocking.

## WhatsApp route (Recommendation #3)
1. FIRST: verify whether Bevatel provides WhatsApp Business API access (BSP/Meta partner or
   upstream BSP) — onboarding model, templates, sending, inbound webhooks, delivery callbacks,
   interactive messages. **VERIFY EARLY — this answer decides the WhatsApp route and G9.**
2. If yes → Bevatel is the WhatsApp provider.
3. If no → separate approved BSP or direct Meta setup.
4. Either way: `WHATSAPP_ENABLED=false` until the route is verified and approved.

## Digitail
- Endpoints/config: `docs/DIGITAIL_OAUTH.md` (single source of truth).
- Rate limit: 200 req/min per account — hub budget soft-caps at 120/min (see `hubCache.ts`).
- No webhooks — pull-based polling only (documented upstream constraint).

## MyFatoorah (Phase 3)
- **Purpose:** optional/deposit card payment for Group Booking Hub bookings. MyFatoorah is the
  payment-status authority; `hub_payments` is the local reconciled operational record.
- **Owner/contact:** Elite Vet KSA + ONX Marketing payments owner (MyFatoorah merchant portal
  administrator).
- **Documentation:** https://docs.myfatoorah.com/ — verify webhook/signature and refund scopes
  against the merchant account before go-live.
- **Environments:** `MYFATOORAH_MODE=test|live`; test base `apitest.myfatoorah.com`, live Saudi
  base `api-sa.myfatoorah.com` unless `MYFATOORAH_BASE_URL` is explicitly configured.
- **Credential source (names only):** Render service env vars `MYFATOORAH_API_KEY`,
  `MYFATOORAH_MODE`, optional `MYFATOORAH_BASE_URL`, and go-live blocker
  `MYFATOORAH_WEBHOOK_SECRET`. Never commit or print values.
- **Callback/webhook URLs:** customer return/error URLs are `/hub/{brand}?payment=return&booking={id}`
  and `/hub/{brand}?payment=error&booking={id}`; provider webhook is
  `POST /api/hub/payments/myfatoorah/webhook`.
- **Timeout/retry/idempotency:** payment initiation uses an 8s timeout; invoice idempotency key is
  `pay:{bookingId}`; webhook processing is immediate-200 + async, with replay protection keyed by
  `InvoiceId:InvoiceStatus:TransactionId/PaymentId` and full webhook JSON retained.
- **Rate limits:** not assumed; confirm the merchant-account limit with MyFatoorah before go-live.
- **Outage/fallback:** if payment initiation fails in optional mode, the customer can choose pay at
  clinic; required-deposit bookings retain their hold according to hold policy. Webhook secret
  missing or invalid → payment events are not processed and the incident is audited.
- **Health check:** `GET /api/hub/health` (admin) reports configured/mode/webhook_configured and
  last reconciliation marker; `GET /api/hub/admin/payments/reconciliation` lists discrepancies.
- **Rotation:** rotate API key and webhook secret in the MyFatoorah portal, update Render env vars,
  trigger a redeploy, then run webhook paid/failed/replay tests before enabling `payment_mode`.
- **Go-live checklist:** set webhook secret; configure portal webhook URL; run test-mode
  paid → confirmed, failed/expired → released, replay rejected, duplicate delivery idempotent;
  verify one `purchase` conversion per paid booking; only then set brand/clinic `payment_mode`.

## Emergency path (Phase 4 / G4)
- **Purpose:** urgent-care entry point inside the booking hub that bypasses booking, payment, and OTP friction.
- **Feature flags:** `EMERGENCY_PATH_ENABLED=false` by default, plus per-brand config
  `hub_brands.config_json.emergency.enabled=true`. Both are required.
- **Public endpoints:** `GET /api/hub/{brand}/emergency-config` returns only enabled state and public
  call/WhatsApp fallbacks; `POST /api/hub/{brand}/emergency` accepts species, symptoms, ETA, locale,
  source metadata, and an empty honeypot field. No phone number is collected.
- **Operations channels (config names only):** `hub_brands.config_json.emergency.webhook_url` for an
  HTTPS POST webhook, or `hub_brands.config_json.emergency.email=true` to use the existing SMTP
  notification env vars (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `NOTIFY_EMAIL`).
  WhatsApp/phone are customer CTAs only until a verified messaging provider route exists.
- **Timeout/retry/idempotency:** webhook delivery uses a 5s timeout and one attempt; submissions are
  stored first in `hub_emergency_requests`, then marked `sent` or `failed` so no request is lost.
- **Abuse controls:** schema validation, honeypot, and 5 requests/minute/IP using the real client IP
  behind Cloudflare/Render.
- **Audit/health:** writes audit `emergency.submitted`, `emergency.delivery_failed`, or
  `emergency.channel_unconfigured`; `GET /api/hub/health` reports the flag and request counts.
- **Rollback:** set `EMERGENCY_PATH_ENABLED=false` or remove/disable the brand emergency config; the
  widget hides the entry point and POST returns `404 emergency_unavailable`.
- **Go-live checklist:** configure an HTTPS webhook or SMTP email, enable the env flag, enable the
  brand config, submit a test emergency, verify delivery under 60 seconds, then check the admin log.

## District pages attribution (Phase 4+ / G8)
- **Purpose:** connect the 18 existing Riyadh district landing pages to the Group Booking Hub with
  per-district analytics attribution while keeping booking availability controlled by the existing
  hub booking gate.
- **Feature flag:** `DISTRICT_PAGES_ENABLED=false` by default. Public clients read only the boolean
  `features.district_pages` from `GET /api/public/bootstrap`; no secrets are exposed.
- **Pages:** the activation script `/district-tracking.js` is loaded by all 18
  `client/public/vet-clinic-*.html` district pages. When the flag is off or bootstrap is unavailable,
  the pages keep their existing `/book-now#booking-section` links and no district events are sent.
- **Enabled behavior:** booking CTAs are rewritten to `/hub/elite?district={slug}` and preserve only
  the approved attribution keys: `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`,
  `utm_content`, `gclid`, `gbraid`, and `wbraid`.
- **Analytics/storage:** district pages send a GA4 `page_view` with `district`; booking CTA clicks
  send `district_booking_click`; call/WhatsApp clicks send `district_contact_click`. The hub widget
  stores `district`, UTM fields, and Google click IDs in `hub_bookings.source_json`, and adds the
  `district` event parameter to hub GA4 events. Payment redirects return without the original query,
  so the public booking status response exposes only the non-PII `district` slug to keep
  `booking_confirmed`/`purchase` attribution intact.
- **GA4 setup required:** register `district` as an event-scoped custom dimension in GA4 before
  relying on reports; DebugView still shows the raw event parameter without that setup.
- **Rollback:** set `DISTRICT_PAGES_ENABLED=false` and redeploy (or restart if env reload is supported).
  The district pages immediately keep their legacy `/book-now` links on the next page load.
- **Go-live checklist:** enable the flag, redeploy, open a district page with test UTM and click-ID
  parameters, verify the CTA points to `/hub/elite?district=...` with the same parameters, verify
  `page_view` and `district_booking_click` in GA4 DebugView, then after hub booking is enabled run a
  sandbox booking and verify `source_json.district` plus click IDs.

## Dynamic deposit policy (Phase 4+ / G3)
- **Purpose:** decide the deposit requirement per customer from `hub_bookings` history — customers
  with enough `no_show` bookings inside the configured window get `required_deposit`; clean-record
  customers keep the brand/clinic base payment mode (optional/free booking).
- **Feature flag:** `DYNAMIC_DEPOSIT_ENABLED=false` by default (ships dark). When off, behavior is
  identical to the static Phase 3 logic.
- **Rules live in config, never code:** the rule is `hub_brands.config_json.dynamic_deposit`
  (`enabled`, `no_show_threshold`, `window_months`), editable via
  `PATCH /api/hub/admin/brands/:brand` with `dynamic_deposit_config`. Missing, disabled, or invalid
  rules disable the policy and fall back to the static mode.
- **Resolution:** at hold creation the server counts this phone's `no_show` bookings within
  `window_months`; if the count reaches `no_show_threshold` the booking's
  `payment_mode_effective` snapshot becomes `required_deposit` and an audit entry
  `deposit.dynamic_required` is written. The widget uses the booking's resolved `payment_mode`
  instead of the static clinic/brand mode.
- **Admin override:** `PATCH /api/hub/admin/bookings/:id` accepts `payment_mode_override`
  (`off` | `optional` | `required_deposit` | `null` to clear). Overrides always win over the
  snapshot and are audit-logged as `booking.admin_override` with the override value.
- **Payment path:** `payment-choice` and amount calculation use the effective mode
  (override > snapshot > clinic > brand). `required_deposit` still requires
  `deposit_amount_halalas` on the clinic and a configured MyFatoorah key.
- **Rollback:** set `DYNAMIC_DEPOSIT_ENABLED=false`; existing snapshots are ignored and static
  modes apply. Clearing a per-booking override restores its snapshot.
- **Go-live checklist:** set the brand rule via `dynamic_deposit_config`, enable the env flag,
  verify a seeded no-show phone gets `payment_mode: "required_deposit"` on the created booking and
  a clean phone keeps the static mode, test an admin override plus its audit entry, then proceed
  only when the Phase 3 payment prerequisites are already accepted.

## Integrations Manager V1 (feat/integrations-manager, 2026-09-22)

Admin module behind `INTEGRATIONS_MANAGER` (Category C flag, default OFF, dark 404).
Design doc: approved 2026-09-22 (22 sections). Rules: provider logic in code,
Category A config in DB (`hub_integrations_configs`, strict zod-style allowlist),
Category B secrets NEVER in DB (env references only), Category C display-only,
Dr Paws hard isolation (`server/integrations/protectedAssets.ts`).

- Routes: `/api/admin/integrations*` (requireAdmin + flag).
- Safe Test Connection: read-only adapter per provider, fixed hosts (no user
  URLs — SSRF barrier), ≤10s timeout, 5/min rate limit, redacted results only.
- Health: `hub_integrations_health` (metadata/timestamps only, circuit breaker
  opens after 5 consecutive failures, half-open probe after 60s).
- Audit: `hub_integrations_events` for every config write / enable / test /
  routing change.
- Messaging routing: `hub_messaging_routes` per brand+purpose+environment;
  V1 never switches to an unimplemented adapter (falls back to current
  behavior with `routing.unsupported_provider` audit).
- Rollback: set `INTEGRATIONS_MANAGER=false` → module dark; system reads env
  exactly as before. Tables are additive; dropping them has zero effect on
  booking/payment paths.
- Live validation 2026-09-22 (temp PG allowlist window, reverted): bevatel ok
  (account_match), m365 ok (smtp_role_present), myfatoorah ok (mode_live),
  digitail ok (clinics_readable), google_ads blocked (developer_token_missing),
  meta_whatsapp missing_secret_ref. Rate limit 429 after 5/min verified.
  Flag-OFF rollback: integrations 404, other admin APIs 200.
