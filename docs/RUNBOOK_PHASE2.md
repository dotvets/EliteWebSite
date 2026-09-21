# RUNBOOK — Phase 2 (Booking Write Path)

## The five most likely failures

### 1. OTP not arriving
- Check `GET /api/hub/health` (admin) → `messaging.provider`. `stub` = log-only (check Render logs for `stub_sms` — this is expected outside production).
- If `bevatel`: sends throw "endpoint not yet verified" until the official contract is documented in `docs/INTEGRATIONS_OPERATIONS.md` (Addendum A4). Switch `MESSAGING_PROVIDER=stub` for testing.
- Check `hub_notifications` rows with status `failed` and audit log action `notification.failed`.

### 2. Confirm returns 503 `upstream_unavailable_keep_hold`
- Digitail is down or the circuit breaker is open (`/api/hub/health` → `digitail.open=true`, opens after 5 consecutive upstream failures, auto-closes after 60s).
- The booking hold is PRESERVED — customer can retry confirm; never re-create the booking.
- Check Digitail token health via `/api/digitail/health`.

### 3. Confirm returns 409 `slot_taken`
- Expected under upstream contention (A7): someone took the slot in Digitail during the local hold. Alternatives are returned in the response. The hold is released and the conflict is in the audit log (`booking.conflict`).

### 4. Sweeper not running
- `/api/hub/health` → `sweeper.lastRun` should be < 2 min old. If null: check `HUB_SWEEPER_ENABLED` (default true) and DB connectivity. The sweeper is advisory-locked (`pg_try_advisory_lock`) — multi-instance safe.

### 5. Bookings stuck `held`
- Normal until OTP verify + confirm. Holds auto-expire after `slot_hold_minutes` (default 15) via the sweeper → status `expired`. If many stuck: check OTP delivery (failure #1).

## Security notes
- OTPs are SHA-256 hashed at rest (with SESSION_SECRET), 10-min TTL, 5 attempts, 60s resend cooldown, 5 requests/phone/hour; rows purge after 24h.
- Phones are masked (`+966*****1626`) in every log line and admin list.
- Per-phone booking cap: `HUB_PHONE_DAILY_CAP` (default 5/day).
- Retention: audit log 24 months (documented per PDPL, Part 9.2).

## Rollback
`booking_enabled=false` on brand/clinics (admin PATCH endpoints) + `HUB_SWEEPER_ENABLED=false` env → redeploy. Verified per acceptance.
