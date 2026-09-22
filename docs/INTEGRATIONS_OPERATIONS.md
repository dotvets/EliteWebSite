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
