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
- Existing keys stay server-side. Webhook signature verification is a go-live blocker if the
  webhook secret is missing from env.
