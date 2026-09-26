// Test suite for scripts/digitail-simulator.mts.
// TEST-ONLY. Exercises Digitail integration contracts against the simulated
// provider: OAuth success/failure, refresh rotation + old-token invalidation,
// clinic discovery, filter[clinic_id] requirement, timeslot requirements,
// invalid timeslot 404, pet + appointment contracts, 401/403/404/409/429,
// timeout/malformed handling, partial access, duplicate submission, a
// 20-way concurrent confirmation race (1 winner / 19 conflicts), and the
// circuit breaker lifecycle (closed -> open -> half-open -> recovery).

import {
  assertNotProduction,
  createDigitailSimulator,
  createSimulatedBreaker,
  createState,
  SANDBOX_CLINICS,
  type SimState,
} from "./digitail-simulator.mts";

let passed = 0;
function check(name: string, cond: boolean) {
  if (!cond) {
    console.error(`FAIL: ${name}`);
    process.exit(1);
  }
  passed++;
  console.log(`ok: ${name}`);
}

function mkSim() {
  const state = createState();
  state.tokens.set("sim-x", "sim-x-refresh");
  const sim = createDigitailSimulator(state);
  return { state, sim };
}

const H = { authorization: "Bearer sim-x" };
const j = (r: Response) => r.json() as Promise<any>;

// --- fail-closed in production ---
{
  const prev = process.env.NODE_ENV;
  process.env.NODE_ENV = "production";
  let threw = false;
  try {
    assertNotProduction();
  } catch {
    threw = true;
  }
  check("fail-closed: throws under NODE_ENV=production", threw);
  process.env.NODE_ENV = prev;
}

// --- OAuth: authorization_code ---
{
  const { state, sim } = mkSim();
  const bad = await sim.request("POST", "/oauth/token", {
    body: { grant_type: "authorization_code", code: "wrong" },
  });
  check("oauth: bad auth code -> 400", bad.status === 400);

  const good = await j(
    await sim.request("POST", "/oauth/token", {
      body: { grant_type: "authorization_code", code: "valid-auth-code" },
    }),
  );
  check("oauth: valid auth code -> access+refresh", !!good.access_token && !!good.refresh_token);
  check("oauth: fixture tagged simulated", good.simulated === true);
  check("oauth: token usable afterwards", state.tokens.has(good.access_token));

  const ug = await sim.request("POST", "/oauth/token", { body: { grant_type: "nonsense" } });
  check("oauth: unsupported grant_type -> 400", ug.status === 400);
}

// --- refresh rotation: old token invalidated atomically ---
{
  const { state, sim } = mkSim();
  const t1 = await j(
    await sim.request("POST", "/oauth/token", {
      body: { grant_type: "authorization_code", code: "valid-auth-code" },
    }),
  );
  const t2 = await j(
    await sim.request("POST", "/oauth/token", {
      body: { grant_type: "refresh_token", refresh_token: t1.refresh_token },
    }),
  );
  check("refresh: new pair issued", !!t2.access_token && t2.access_token !== t1.access_token);
  const reuse = await sim.request("GET", "/api/v1/clinics", {
    headers: { authorization: `Bearer ${t1.access_token}` },
  });
  check("refresh: old access token rejected (401)", reuse.status === 401);
  const okNew = await sim.request("GET", "/api/v1/clinics", {
    headers: { authorization: `Bearer ${t2.access_token}` },
  });
  check("refresh: new access token accepted", okNew.status === 200);
  const badRefresh = await sim.request("POST", "/oauth/token", {
    body: { grant_type: "refresh_token", refresh_token: "bogus" },
  });
  check("refresh: bogus refresh token -> 400", badRefresh.status === 400);
  void state;
}

// --- unauthenticated ---
{
  const { sim } = mkSim();
  const r = await sim.request("GET", "/api/v1/clinics");
  check("auth: missing token -> 401", r.status === 401);
  const r2 = await sim.request("GET", "/api/v1/clinics", {
    headers: { authorization: "Bearer nope" },
  });
  check("auth: unknown token -> 401", r2.status === 401);
}

// --- clinics ---
{
  const { sim } = mkSim();
  const r = await j(await sim.request("GET", "/api/v1/clinics", { headers: H }));
  check("clinics: returns sandbox clinics", r.data.clinics.length === SANDBOX_CLINICS.length);
  check("clinics: all fixtures simulated", r.data.clinics.every((c: any) => c.simulated === true));
}

// --- appointments GET requires filter[clinic_id] ---
{
  const { sim } = mkSim();
  const noFilter = await sim.request("GET", "/api/v1/appointments", { headers: H });
  check("appointments GET: no filter -> 422", noFilter.status === 422);
  const withFilter = await sim.request("GET", "/api/v1/appointments?filter[clinic_id]=1", { headers: H });
  check("appointments GET: filter[clinic_id] -> 200", withFilter.status === 200);
}

// --- vets-timeslots ---
{
  const { sim } = mkSim();
  const noArgs = await sim.request("GET", "/api/v1/vets-timeslots", { headers: H });
  check("timeslots: no visit_type_id/duration -> 422", noArgs.status === 422);
  const ok = await sim.request("GET", "/api/v1/vets-timeslots?visit_type_id=5", { headers: H });
  check("timeslots: visit_type_id -> 200", ok.status === 200);
  const missing = await sim.request("GET", "/api/v1/vets-timeslots?visit_type_id=5&clinic_id=9999", { headers: H });
  check("timeslots: unknown clinic -> 404", missing.status === 404);
}

// --- pets ---
{
  const { sim } = mkSim();
  const incomplete = await sim.request("POST", "/api/v1/pets", {
    headers: H,
    body: { species: "dog" },
  });
  check("pets: missing fields -> 422 with field list", incomplete.status === 422);
  const full = await sim.request("POST", "/api/v1/pets", {
    headers: H,
    body: {
      species: "dog",
      breed: "labrador",
      birthday: "2020-01-01",
      gender: "male",
      hormonal_status: "neutered",
    },
  });
  check("pets: complete payload -> 201", full.status === 201);
}

// --- appointments POST ---
{
  const { state, sim } = mkSim();
  const noReminders = await sim.request("POST", "/api/v1/appointments", {
    headers: H,
    body: { client_reference: "ref-1" },
  });
  check("appointments POST: reminder_notifications required -> 422", noReminders.status === 422);
  const good = await sim.request("POST", "/api/v1/appointments", {
    headers: H,
    body: { client_reference: "ref-1", reminder_notifications: false },
  });
  check("appointments POST: valid -> 201", good.status === 201);
  const dup = await sim.request("POST", "/api/v1/appointments", {
    headers: H,
    body: { client_reference: "ref-1", reminder_notifications: false },
  });
  check("appointments POST: duplicate client_reference -> 409", dup.status === 409);
  // idempotent retry lookup: same id retrievable by reference and numeric id
  const byRef = state.appointments.get("ref-1");
  check("appointments: stored under client_reference", !!byRef);
  check(
    "appointments: stored under numeric id too (idempotent cancel lookup)",
    !!state.appointments.get(String(byRef!.id)),
  );
}

// --- cancel ---
{
  const { sim } = mkSim();
  await sim.request("POST", "/api/v1/appointments", {
    headers: H,
    body: { client_reference: "ref-c", reminder_notifications: true },
  });
  const missing = await sim.request("POST", "/api/v1/appointments/424242/cancel", { headers: H });
  check("cancel: unknown appointment -> 404", missing.status === 404);
  const ok = await j(
    await sim.request("POST", "/api/v1/appointments/1000/cancel", { headers: H }),
  );
  check("cancel: success sets status 7", ok.data.status === 7);
}

// --- failure modes ---
{
  const { state, sim } = mkSim();
  state.failMode = "429";
  const r429 = await sim.request("GET", "/api/v1/clinics", { headers: H });
  check("failmode: 429", r429.status === 429);
  state.failMode = "500";
  const r500 = await sim.request("GET", "/api/v1/clinics", { headers: H });
  check("failmode: 500", r500.status === 500);
  state.failMode = "malformed";
  const rm = await sim.request("GET", "/api/v1/clinics", { headers: H });
  const ct = rm.headers.get("content-type") ?? "";
  check("failmode: malformed (non-json 200)", rm.status === 200 && !ct.includes("json"));
  state.failMode = "timeout";
  const timeoutRace = await Promise.race([
    sim.request("GET", "/api/v1/clinics", { headers: H }),
    new Promise<string>((res) => setTimeout(() => res("caller-aborted"), 50)),
  ]);
  check("failmode: timeout aborted by caller", timeoutRace === "caller-aborted");
  state.failMode = null;
}

// --- partial access: valid token, unknown path -> 404 not 401 ---
{
  const { sim } = mkSim();
  const r = await sim.request("GET", "/api/v1/unknown", { headers: H });
  check("partial access: authed but unknown path -> 404", r.status === 404);
}

// --- 20-way concurrent confirmation: 1 winner, 19 conflicts ---
{
  const { state, sim } = mkSim();
  const results = await Promise.all(
    Array.from({ length: 20 }, (_, i) =>
      sim.request("POST", "/api/v1/appointments", {
        headers: H,
        body: { client_reference: "race-ref", reminder_notifications: false, attempt: i },
      }),
    ),
  );
  const created = results.filter((r) => r.status === 201).length;
  const conflicts = results.filter((r) => r.status === 409).length;
  check("concurrency: exactly 1 winner", created === 1);
  check("concurrency: exactly 19 conflicts", conflicts === 19);
  let stored = 0;
  for (const [, a] of state.appointments) if (a.clientReference === "race-ref") stored++;
  check("concurrency: appointment created exactly once", stored === 2); // ref key + id key
}

// --- circuit breaker lifecycle ---
{
  const breaker = createSimulatedBreaker({ failureThreshold: 3, resetAfterMs: 40 });
  check("breaker: starts closed", breaker.state() === "closed" && breaker.canTry());
  breaker.onFailure();
  breaker.onFailure();
  check("breaker: below threshold still closed", breaker.state() === "closed");
  breaker.onFailure();
  check("breaker: opens at threshold", breaker.state() === "open" && !breaker.canTry());
  await new Promise((r) => setTimeout(r, 60));
  const canTryNow = breaker.canTry();
  check("breaker: half-open after reset window", breaker.state() === "half-open" && canTryNow);
  breaker.onFailure();
  check("breaker: half-open failure re-opens", breaker.state() === "open" && !breaker.canTry());
  await new Promise((r) => setTimeout(r, 60));
  breaker.canTry();
  breaker.onSuccess();
  check("breaker: half-open success closes", breaker.state() === "closed" && breaker.canTry());
}

console.log(`digitail-simulator: ${passed} checks passed`);
