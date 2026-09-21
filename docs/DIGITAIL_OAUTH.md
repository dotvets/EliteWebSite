# Digitail OAuth setup

Server-side Digitail OAuth 2.0 Authorization Code + PKCE flow, configuration-driven per
`DIGITAIL_ENV` (Group Booking Hub — Phase 0).

## Environment-driven configuration

Resolution order: **(1) explicit env override → (2) environment default.** Never guess endpoints.

| Variable | Purpose | Default |
|---|---|---|
| `DIGITAIL_ENV` | `sandbox` or `production` | `sandbox` |
| `DIGITAIL_AUTHORIZE_URL` | optional override | per env (below) |
| `DIGITAIL_TOKEN_URL` | optional override | per env (below) |
| `DIGITAIL_API_BASE_URL` | optional override | per env (below) |
| `DIGITAIL_CONNECTION_SCOPE` | OAuth connection scope (`elite`, `group`, …) — **not** a brand | `elite` |

Environment defaults:

| | sandbox | production |
|---|---|---|
| authorize | `https://developer.digitail.io/authorize` ✅ confirmed | `https://vet.digitail.io/oauth/authorize` ✅ |
| token | **NONE — not confirmed by Digitail** (OPEN-Q below). Set `DIGITAIL_TOKEN_URL` explicitly once confirmed. | `https://vet.digitail.io/oauth/token` ✅ |
| API base | `https://developer.digitail.io/api/v1` ✅ | `https://vet.digitail.io/api/v1` ✅ |

On boot the server validates `DIGITAIL_ENV` and the required variables and **fails fast**
on an unknown environment or missing values.

## Confirmed facts — support-ticket reference (Part 4.2 item 4)

Source: Digitail support correspondence with **George Roman (Platform Engineer)** —
Slack thread `#elitevet` (2026-09-17 → 2026-09-21) and email thread
"Elite Vet Group - Digitail API Request" (2026-08-31 → 2026-09-14), plus a live
screen-share meeting (week of 2026-09-21).

- Sandbox authorization URL: `GET https://developer.digitail.io/authorize` — **confirmed by George in Slack, 2026-09-21** ("the tokens and flow we're looking at here is meant to interact with the sandbox version of our app first … GET developer.digitail.io/authorize").
- Sandbox API base: `https://developer.digitail.io/api/v1` — confirmed (email 2026-09-08 + docs).
- Production authorize/token/API base: `https://vet.digitail.io/oauth/authorize`, `/oauth/token`, `/api/v1` — confirmed (docs + email).
- `client_secret` IS expected in the authorization request — do not remove it.
- Same OAuth client credentials for both environments; the environment is chosen by base URL. The earlier `invalid_client` error was caused by hitting the production authorize URL for a sandbox flow.
- Access model: the OAuth connection inherits the authorizing user's clinic permissions; one group-access user covers all group clinics. `GET /auth/me?include=multipleClinic` lists them.
- **Production gate**: the live API only accepts the OAuth handshake initiated from a publicly accessible, Digitail-whitelisted URL. Localhost/Postman works for sandbox only. Whitelisting must be requested from Digitail before any production attempt.
- Recommended production identity: a dedicated least-privilege "API user" in the clinic group (George's recommendation), not a personal staff account.
- Rate limit: 200 requests/minute.

### OPEN-Q (never guess)
- **Sandbox token endpoint**: not published in documentation.digitail.io and not stated in the
  support thread. Until Digitail confirms it, set `DIGITAIL_TOKEN_URL` explicitly for sandbox;
  the code refuses token exchange with a clear error rather than inventing a URL.

## Connection storage (multi-connection)

Tokens live in `digitail_connections_v2`, keyed `"{env}:{connection_scope}"` (e.g.
`sandbox:elite`, later `production:group`). All token reads/writes go through
`getConnection(env, scope)` in `server/digitail.ts`. The legacy `digitail_connections`
table is migrated forward at boot (encrypted tokens copied byte-for-byte) and kept in
place per migration-safety rules.

## Environment variables (secrets — configure on the platform, never commit)

- `DIGITAIL_CLIENT_ID` — Digitail OAuth client ID.
- `DIGITAIL_CLIENT_SECRET` — Digitail OAuth client secret.
- `DIGITAIL_REDIRECT_URI` — must exactly match the URI whitelisted by Digitail. Default: `https://www.elitevetksa.com/api/digitail/callback`.
- `DIGITAIL_TOKEN_ENCRYPTION_KEY` — 64-character hexadecimal key (32 bytes) used to encrypt stored access/refresh tokens.
- `DATABASE_URL` — existing PostgreSQL connection used by the application.

## Endpoints (all admin-session protected)

- `GET /api/digitail/connect` — starts OAuth and redirects to the resolved authorize URL.
- `GET /api/digitail/callback` — validates state/PKCE (10-minute state expiry) and stores encrypted tokens.
- `GET /api/digitail/status` — reports `connected`, token expiry, and the resolved non-secret config (env, hosts, scope, overrides). Never secrets.
- `GET /api/digitail/health` — env, resolved hosts, DB reachability, per-connection token presence/expiry. Never token values.
- `POST /api/digitail/refresh` — refreshes the connection and replaces the single-use refresh token.
- `GET /api/digitail/clinics` — clinic discovery via `/auth/me?include=multipleClinic`.
- `GET /api/digitail/test?clinicId=703|704` — sandbox smoke test, limited to the read-only `/appointments` endpoint. Not a generic proxy.

## Log redaction

All logging paths pass through `server/redact.ts`: `Authorization`/Bearer values,
`access_token` / `refresh_token` / `client_secret` fields (JSON or form-encoded), and the
literal configured secret values are scrubbed before anything reaches the logs.

## Setup order

1. Add the Digitail/encryption environment variables to the deployment (plus `DIGITAIL_ENV`, and `DIGITAIL_TOKEN_URL` for sandbox until the endpoint is confirmed).
2. Ask Digitail to whitelist the exact `DIGITAIL_REDIRECT_URI` for the OAuth client (done for the value above).
3. Deploy this branch to a test environment.
4. Open `/api/digitail/connect` in a browser and complete Digitail authorization.
5. Confirm `/api/digitail/status` returns `connected: true` with `env` and hosts shown.
6. Test Digitail API calls from the backend using the stored token and the appropriate clinic ID/header.

No Digitail credentials or tokens are stored in this repository.
