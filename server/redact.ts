// Group Booking Hub — Phase 0: log redaction (master document Part 4.2 item 3).
//
// Ensures no token material ever reaches logs (Render logs included):
//   - Authorization headers / Bearer tokens
//   - client_secret, access_token, refresh_token (field names in JSON or form bodies)
//   - the literal VALUES of configured secrets (defense in depth: even if a
//     third-party error echoes our own request back at us)

const SENSITIVE_FIELD_PATTERN =
  /("(?:access_token|refresh_token|client_secret|code_verifier|authorization|id_token)"\s*:\s*")[^"]*(")|((?:access_token|refresh_token|client_secret|code_verifier|authorization|id_token)=)[^&\s]*/gi;

const BEARER_PATTERN = /Bearer\s+[A-Za-z0-9\-._~+/]+=*/gi;

// Collect the literal secret values configured in the environment so we can scrub
// them even when they appear outside a recognizable field name.
function configuredSecretValues(): string[] {
  return [
    process.env.DIGITAIL_CLIENT_SECRET,
    process.env.DIGITAIL_CLIENT_ID, // not a secret per se, but never useful in logs
    process.env.DIGITAIL_TOKEN_ENCRYPTION_KEY,
  ].filter((v): v is string => !!v && v.length >= 8);
}

export function redactSecrets(input: string): string {
  let out = input.replace(SENSITIVE_FIELD_PATTERN, (_m, p1, p2, p3) =>
    p1 !== undefined ? `${p1}[REDACTED]${p2}` : `${p3}[REDACTED]`,
  );
  out = out.replace(BEARER_PATTERN, "Bearer [REDACTED]");
  for (const secret of configuredSecretValues()) {
    out = out.split(secret).join("[REDACTED]");
  }
  return out;
}

export function redactErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  return redactSecrets(message);
}
