# Digitail OAuth setup

This branch adds a server-side Digitail OAuth 2.0 Authorization Code + PKCE flow.

## Environment variables

Configure these on the server/deployment platform; do not commit secrets:

- `DIGITAIL_CLIENT_ID` — Digitail OAuth client ID.
- `DIGITAIL_CLIENT_SECRET` — Digitail OAuth client secret.
- `DIGITAIL_REDIRECT_URI` — must exactly match the URI whitelisted by Digitail. Default: `https://www.elitevetksa.com/api/digitail/callback`.
- `DIGITAIL_TOKEN_ENCRYPTION_KEY` — 64-character hexadecimal key (32 bytes) used to encrypt stored access/refresh tokens.
- `DATABASE_URL` — existing PostgreSQL connection used by the application.

## Endpoints

- `GET /api/digitail/connect` — admin-session protected; starts OAuth and redirects to Digitail.
- `GET /api/digitail/callback` — requires the initiating admin session; validates state/PKCE and stores encrypted tokens.
- `GET /api/digitail/status` — admin-session protected; reports whether a connection exists and its access-token expiry.
- `POST /api/digitail/refresh` — admin-session protected; refreshes the connection and replaces the single-use refresh token.
- `GET /api/digitail/clinics` — admin-session protected; returns clinics available to the connected user.
- `GET /api/digitail/test?clinicId=703|704` — admin-session protected sandbox smoke test, limited to the read-only `/appointments` endpoint.

## Digitail verification before production

This repository does not contain official Digitail OAuth documentation. Before enabling production, verify with Digitail that the authorization and token URLs, scopes, the exact redirect URI, and every authorization parameter (including whether `client_secret` belongs in the authorization URL) match their current requirements. The implementation has intentionally not changed those parameters based on assumptions.

## Setup order

1. Add the four Digitail/encryption environment variables to the deployment.
2. Ask Digitail to whitelist the exact `DIGITAIL_REDIRECT_URI` for the OAuth client.
3. Deploy this branch to a test environment.
4. Open `/api/digitail/connect` in a browser and complete Digitail authorization.
5. Confirm `/api/digitail/status` returns `connected: true`.
6. Test Digitail API calls from the backend using the stored token and the appropriate clinic ID/header.

No Digitail credentials or tokens are stored in this repository.
