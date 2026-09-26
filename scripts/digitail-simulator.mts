// TEST-ONLY Digitail API simulator.
// Used by scripts/digitail-simulator.test.mts to exercise the Digitail
// integration contracts (OAuth, refresh rotation, clinic discovery,
// appointments, pets, error mapping, circuit breaker) without contacting
// any real provider.
//
// SAFETY: This harness is for tests only. It refuses to initialize when
// NODE_ENV=production (fail-closed). Every fixture it produces is tagged
// `simulated: true`. It must NEVER be used as evidence of production
// acceptance, and must NEVER be wired into server runtime code.

export function assertNotProduction(): void {
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "digitail-simulator: fail-closed — this test harness must not run under NODE_ENV=production",
    );
  }
}

export type FailMode = "timeout" | "malformed" | "429" | "500" | null;

export interface SimToken {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface SimAppointment {
  id: number;
  clinicId: number;
  petId: number;
  clientReference: string;
  status: number;
  simulated: true;
}

export interface SimState {
  tokens: Map<string, string>; // accessToken -> refreshToken
  nextId: number;
  appointments: Map<string, SimAppointment>; // keyed by clientReference and by String(id)
  pets: Map<number, { id: number; clinicId: number; simulated: true }>;
  failMode: FailMode;
  invalidatedTokens: Set<string>;
  calls: { method: string; path: string }[];
}

export const SANDBOX_CLINICS = [
  { id: 1, name: "Simulated Elite Vet Clinic", simulated: true },
  { id: 2, name: "Simulated Branch Clinic", simulated: true },
];

export function createState(): SimState {
  assertNotProduction();
  return {
    tokens: new Map(),
    nextId: 1000,
    appointments: new Map(),
    pets: new Map(),
    failMode: null,
    invalidatedTokens: new Set(),
    calls: [],
  };
}

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

export interface SimRequestOpts {
  headers?: Record<string, string>;
  body?: unknown;
}

export function createDigitailSimulator(state: SimState) {
  assertNotProduction();

  async function request(
    method: string,
    path: string,
    opts: SimRequestOpts = {},
  ): Promise<Response> {
    state.calls.push({ method, path });
    if (state.failMode === "timeout") {
      // simulate a hanging request aborted by caller's AbortController
      return new Promise<Response>(() => {});
    }
    if (state.failMode === "429") return jsonResponse(429, { message: "Too Many Requests" });
    if (state.failMode === "500") return jsonResponse(500, { message: "Server Error" });
    if (state.failMode === "malformed") {
      return new Response("<html>not json</html>", {
        status: 200,
        headers: { "content-type": "text/html" },
      });
    }

    const auth = opts.headers?.authorization ?? "";
    const isTokenRoute = path === "/oauth/token";

    if (!isTokenRoute) {
      const token = auth.replace(/^Bearer\s+/i, "");
      if (!token || !state.tokens.has(token) || state.invalidatedTokens.has(token)) {
        return jsonResponse(401, { message: "Unauthenticated." });
      }
    }

    // --- OAuth token ---
    if (path === "/oauth/token") {
      const body = (opts.body ?? {}) as Record<string, string>;
      if (body.grant_type === "authorization_code") {
        if (body.code !== "valid-auth-code") {
          return jsonResponse(400, { error: "invalid_grant" });
        }
        const accessToken = `sim-at-${state.nextId++}`;
        const refreshToken = `sim-rt-${state.nextId++}`;
        state.tokens.set(accessToken, refreshToken);
        return jsonResponse(200, {
          token_type: "Bearer",
          access_token: accessToken,
          refresh_token: refreshToken,
          expires_in: 3600,
          simulated: true,
        });
      }
      if (body.grant_type === "refresh_token") {
        // atomic rotation: find + invalidate old, issue new
        let oldAccess: string | null = null;
        for (const [at, rt] of state.tokens) {
          if (rt === body.refresh_token) {
            oldAccess = at;
            break;
          }
        }
        if (!oldAccess) return jsonResponse(400, { error: "invalid_grant" });
        state.tokens.delete(oldAccess);
        state.invalidatedTokens.add(oldAccess);
        const accessToken = `sim-at-${state.nextId++}`;
        const refreshToken = `sim-rt-${state.nextId++}`;
        state.tokens.set(accessToken, refreshToken);
        return jsonResponse(200, {
          token_type: "Bearer",
          access_token: accessToken,
          refresh_token: refreshToken,
          expires_in: 3600,
          simulated: true,
        });
      }
      return jsonResponse(400, { error: "unsupported_grant_type" });
    }

    // --- clinics ---
    if (path === "/api/v1/clinics" || path.startsWith("/api/v1/clinics?")) {
      return jsonResponse(200, { data: { clinics: SANDBOX_CLINICS } });
    }

    // --- vets-timeslots ---
    if (path.startsWith("/api/v1/vets-timeslots")) {
      const url = new URL(`https://sim.digitail.test${path}`);
      if (!url.searchParams.get("visit_type_id") && !url.searchParams.get("duration")) {
        return jsonResponse(422, { message: "visit_type_id or duration required" });
      }
      if (url.searchParams.get("clinic_id") === "9999") {
        return jsonResponse(404, { message: "Not Found" });
      }
      return jsonResponse(200, {
        data: [{ vet_id: 1, start: "2026-10-01T09:00:00Z", end: "2026-10-01T09:30:00Z", simulated: true }],
      });
    }

    // --- pets ---
    if (path === "/api/v1/pets" && method === "POST") {
      const body = (opts.body ?? {}) as Record<string, unknown>;
      const required = ["species", "breed", "birthday", "gender", "hormonal_status"];
      const missing = required.filter((k) => !body[k]);
      if (missing.length) {
        return jsonResponse(422, { message: "missing fields", errors: missing });
      }
      const id = state.nextId++;
      state.pets.set(id, { id, clinicId: 1, simulated: true });
      return jsonResponse(201, { data: { id, simulated: true } });
    }

    // --- appointments ---
    if (path === "/api/v1/appointments" && method === "POST") {
      const body = (opts.body ?? {}) as Record<string, unknown>;
      if (body.reminder_notifications === undefined) {
        return jsonResponse(422, { message: "reminder_notifications required" });
      }
      const ref = String(body.client_reference ?? "");
      if (state.appointments.has(ref)) {
        return jsonResponse(409, { message: "client_reference already exists" });
      }
      const id = state.nextId++;
      const appt: SimAppointment = {
        id,
        clinicId: 1,
        petId: 1,
        clientReference: ref,
        status: 1,
        simulated: true,
      };
      state.appointments.set(ref, appt);
      state.appointments.set(String(id), appt);
      return jsonResponse(201, { data: { id, simulated: true } });
    }

    if (path.startsWith("/api/v1/appointments") && method === "GET") {
      const url = new URL(`https://sim.digitail.test${path}`);
      if (!url.searchParams.get("filter[clinic_id]")) {
        return jsonResponse(422, { message: "filter[clinic_id] required" });
      }
      return jsonResponse(200, { data: [...new Set(state.appointments.values())] });
    }

    const cancelMatch = path.match(/^\/api\/v1\/appointments\/(\d+)\/cancel$/);
    if (cancelMatch && method === "POST") {
      const appt = state.appointments.get(cancelMatch[1]);
      if (!appt) return jsonResponse(404, { message: "Not Found" });
      appt.status = 7;
      return jsonResponse(200, { data: { id: appt.id, status: 7, simulated: true } });
    }

    return jsonResponse(404, { message: "Not Found" });
  }

  return { request };
}

export type CircuitState = "closed" | "open" | "half-open";

export interface CircuitBreaker {
  state: () => CircuitState;
  canTry: () => boolean;
  onSuccess: () => void;
  onFailure: () => void;
}

export function createSimulatedBreaker(opts: {
  failureThreshold: number;
  resetAfterMs: number;
}): CircuitBreaker {
  let failures = 0;
  let openedAt: number | null = null;
  let st: CircuitState = "closed";

  return {
    state: () => st,
    canTry: () => {
      if (st === "closed") return true;
      if (st === "open") {
        if (openedAt !== null && Date.now() - openedAt >= opts.resetAfterMs) {
          st = "half-open";
          return true;
        }
        return false;
      }
      return true; // half-open: one trial
    },
    onSuccess: () => {
      failures = 0;
      openedAt = null;
      st = "closed";
    },
    onFailure: () => {
      if (st === "half-open") {
        openedAt = Date.now();
        st = "open";
        return;
      }
      failures++;
      if (failures >= opts.failureThreshold) {
        openedAt = Date.now();
        st = "open";
      }
    },
  };
}
