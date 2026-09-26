# Go-Live Runbook — Elite Vet KSA (DO NOT EXECUTE without owner sign-off)

Every step lists: action → verification → rollback. Stop conditions in **bold**.

## 0. Preconditions

- [ ] George's Digitail production confirmations received (OAuth app, redirect whitelist, clinic access)
- [ ] Bevatel Sender ID approved (SMS) — only required for SMS step
- [ ] Bevatel Developer API token (WhatsApp) — only required for WhatsApp step
- [ ] Owner approval for live payments recorded
- [ ] CI green on `main`

## 1. Digitail production

1. Set `DIGITAIL_ENV=production` (Render env, per-key) → new deploy.
   Verify: `/api/digitail/health` shows env=production, connection ok.
   Rollback: set back to `sandbox` → redeploy.
2. Production OAuth flow: connect via `/api/digitail/connect` (admin), complete consent.
   Verify: token row `production:elite` in `digitail_connections_v2`; `/auth/me?include=multipleClinic` succeeds.
   **Stop if:** invalid_grant or redirect mismatch → check redirect URI whitelist with George.
3. Verify clinic access: 3010, 3011, 3012, 3381, 3850 — read-only `GET /public/clinics/{slug}/vets-timeslots` per clinic.
   **Stop if:** any clinic 403/404 → George.
4. Controlled write test: create ONE test pet + ONE appointment in production clinic, then cancel the appointment immediately.
   Verify: 201 + cancel status 7. Cleanup: cancel appointment; note pet id.
   Rollback: appointment cancelled; pet remains as inert record (DELETE unsupported upstream).

## 2. Booking

1. Enable `booking_enabled` for ONE clinic (admin booking settings), keep others off.
2. Controlled booking smoke: widget booking end-to-end (OTP → hold → confirm).
   Verify: booking `confirmed`, appointment id present, notifications queued (confirm sent).
3. Idempotency check: resubmit same idempotency key → same booking, no duplicate.
4. Same-slot contention: two concurrent holds on the same slot → exactly one confirms; loser gets conflict + alternatives.
   **Stop if:** duplicate upstream appointment → disable booking, investigate `hub_slot_claims`.

## 3. Payments (MyFatoorah)

1. Webhook health: confirm `hub_integrations_health.webhook_last_event_at` updates on test webhook.
2. Controlled payment: one real small-amount payment on the gated deposit path.
   Verify: webhook accepted (valid signature), payment `paid`, booking `confirmed`, single event key.
3. Replay verification: resend identical webhook → no state change, no duplicate event.
4. Rollback procedure: refund via MyFatoorah portal; set `MYFATOORAH_MODE=test` (or disable payment mode per clinic) → redeploy.
   **Stop if:** bad_signature spikes or confirm failures → disable payments, keep booking.

## 4. Messaging

1. Email (M365): send one controlled test email; verify acceptance + audit.
2. SMS (after Sender ID approval): set `MESSAGING_PROVIDER=bevatel_sms` + sender config → send test to the two verified numbers → verify msgIds + DLRs via `POST /msgs/status` / `GET /inbox/dlrs`.
   Rollback: `MESSAGING_PROVIDER=stub` → redeploy.
3. WhatsApp (after Developer API token): send approved template to one verified number; verify channel 272 delivery.
   Rollback: `WHATSAPP_ENABLED=false` → redeploy.

## 5. Launch sequencing

1. Enable flags one at a time, in this order: booking (one clinic) → payments (deposit path) → messaging (email → SMS → WhatsApp).
2. After EACH step: health checks (site 200, `/api/digitail/health`, hub availability 200, audit log clean, no circuit breaker open).
3. Rollback conditions: any 5xx spike, payment webhook failure, double-booking evidence, or provider auth failure → revert the last flag (Render env, per-key) → redeploy.
4. Rollback commands: Render Dashboard → service → Env (revert key) → Manual Deploy (or `POST /services/{id}/deploys` via API). Code rollback: revert merge commit on `main` → auto-deploy.

## 5b. Flag-specific rollback (keep OFF until their step arrives)

| Flag (Render env, per-key)          | Enable only when                              | Rollback                                  |
| ----------------------------------- | --------------------------------------------- | ----------------------------------------- |
| `DYNAMIC_DEPOSIT_ENABLED`           | Payments step complete + deposit policy set   | unset → redeploy (deposit path falls back) |
| `EMERGENCY_PATH_ENABLED`            | Owner sign-off + staffing confirmed           | unset → redeploy (standard flow resumes)   |
| `INTEGRATIONS_MANAGER`              | Launch stabilization, after messaging live    | unset → redeploy (IM UI hidden)            |
| Locale templates (`*_AR` / `*_EN`)  | Before WhatsApp activation                    | per-key revert → redeploy                  |
| `DIGITAIL_ENV=production`           | Section 1 only                                | back to `sandbox` → redeploy               |

Rollback for migrations: all shipped migrations are additive-only; there is no destructive DDL to roll back. If a migration misbehaves, restore from Render PG backup (point-in-time) — confirm backup schedule before launch (see audit OWNER ACTION).

## 6. Post-launch

- Watch `hub_audit_log` (payment._, booking._) and Integrations health for 24h.
- Expand clinics gradually; keep Dr Paws assets untouched throughout.
