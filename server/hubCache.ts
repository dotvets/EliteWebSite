import { pool } from "./db";

// Phase 1 (master document Part 5.2): server-side read cache for Digitail reads.
// - In-memory primary, DB-backed (hub_read_cache) fallback for provider-failure
//   degradation (Part 9.3), single-flight stampede protection.
// - TTLs: clinics/services/doctors 6h, availability 60s (set by callers).

type MemoryEntry = { value: unknown; expiresAt: number };
const memory = new Map<string, MemoryEntry>();
const inflight = new Map<string, Promise<unknown>>();

// Upstream rate-limit stewardship (Part 9.5): budget Digitail calls far under
// 200 req/min across ALL consumers on this instance. This is a soft cap — when
// exhausted we serve from cache/DB fallback or fail safe with 503.
const UPSTREAM_SOFT_CAP_PER_MIN = 120;
let windowStart = Date.now();
let windowCount = 0;

export function upstreamBudgetAllow(): boolean {
  const now = Date.now();
  if (now - windowStart >= 60_000) {
    windowStart = now;
    windowCount = 0;
  }
  if (windowCount >= UPSTREAM_SOFT_CAP_PER_MIN) return false;
  windowCount += 1;
  return true;
}

export function upstreamStats() {
  return { usedThisMinute: windowCount, softCapPerMinute: UPSTREAM_SOFT_CAP_PER_MIN, windowStartedAt: new Date(windowStart).toISOString() };
}

export class UpstreamBusyError extends Error {
  status = 503;
  constructor() {
    super("Upstream request budget exhausted — try again shortly");
  }
}

export type CacheResult<T> = { value: T; source: "memory" | "live" | "stale-fallback" };

export async function cached<T>(key: string, ttlSeconds: number, loader: () => Promise<T>): Promise<CacheResult<T>> {
  const hit = memory.get(key);
  if (hit && hit.expiresAt > Date.now()) {
    return { value: hit.value as T, source: "memory" };
  }
  const existing = inflight.get(key);
  if (existing) return existing as Promise<CacheResult<T>>;

  const promise = (async (): Promise<CacheResult<T>> => {
    try {
      if (!upstreamBudgetAllow()) throw new UpstreamBusyError();
      const value = await loader();
      memory.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
      pool
        .query(
          `INSERT INTO hub_read_cache (cache_key, payload_json, fetched_at, ttl_seconds)
           VALUES ($1, $2, NOW(), $3)
           ON CONFLICT (cache_key) DO UPDATE SET
             payload_json = EXCLUDED.payload_json,
             fetched_at = NOW(),
             ttl_seconds = EXCLUDED.ttl_seconds`,
          [key, JSON.stringify(value), ttlSeconds],
        )
        .catch(() => {});
      return { value, source: "live" };
    } catch (err) {
      // Provider-failure degradation (Part 9.3): serve the last good DB snapshot
      // within a generous grace window (24x TTL) rather than failing the widget.
      try {
        const r = await pool.query(`SELECT payload_json, fetched_at, ttl_seconds FROM hub_read_cache WHERE cache_key = $1`, [key]);
        const row = r.rows[0];
        if (row) {
          const ageSeconds = (Date.now() - new Date(row.fetched_at).getTime()) / 1000;
          if (ageSeconds < Number(row.ttl_seconds) * 24) {
            const value = row.payload_json as T;
            memory.set(key, { value, expiresAt: Date.now() + 30_000 });
            return { value, source: "stale-fallback" };
          }
        }
      } catch {
        // fall through to original error
      }
      throw err;
    } finally {
      inflight.delete(key);
    }
  })();

  inflight.set(key, promise);
  return promise;
}
