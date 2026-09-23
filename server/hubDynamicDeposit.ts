import { pool } from "./db";

// ============================================================================
// Phase 4+ / G3 (master document Part 16): dynamic deposit policy.
// - Deposit requirement is decided PER CUSTOMER from hub_bookings history:
//   customers with >= threshold no-shows inside the configured window get
//   required_deposit; clean-record customers keep the brand/clinic base mode.
// - Rules (threshold + window) live ONLY in hub_brands.config_json.dynamic_deposit
//   — never hardcoded in code. Missing/invalid rule = policy not applied.
// - Feature flag: DYNAMIC_DEPOSIT_ENABLED (default false — ships dark).
// - Admin per-booking override is stored on hub_bookings.payment_mode_override
//   and always wins; every override write is audit-logged (hubBookings PATCH).
// ============================================================================

export type DynamicDepositRule = {
  enabled: true;
  no_show_threshold: number;
  window_months: number;
};

export function dynamicDepositEnabled(): boolean {
  return (
    (process.env.DYNAMIC_DEPOSIT_ENABLED || "false").toLowerCase() === "true"
  );
}

// Parse + validate the rule from brand config. Strict: any malformed value
// disables the policy (fail-safe to the static brand/clinic payment_mode).
export function parseDynamicDepositRule(
  configJson: any,
): DynamicDepositRule | null {
  const cfg = configJson?.dynamic_deposit;
  if (!cfg || typeof cfg !== "object" || Array.isArray(cfg)) return null;
  if (cfg.enabled !== true) return null;
  const threshold = Number(cfg.no_show_threshold);
  const windowMonths = Number(cfg.window_months);
  if (!Number.isInteger(threshold) || threshold < 1 || threshold > 20)
    return null;
  if (!Number.isInteger(windowMonths) || windowMonths < 1 || windowMonths > 36)
    return null;
  return {
    enabled: true,
    no_show_threshold: threshold,
    window_months: windowMonths,
  };
}

// Pure decision — inputs only, no I/O, no hardcoded thresholds.
export function decideDynamicMode(
  rule: DynamicDepositRule,
  noShowCount: number,
): "required_deposit" | null {
  return noShowCount >= rule.no_show_threshold ? "required_deposit" : null;
}

export type ResolvedPaymentMode = {
  mode: string; // off | optional | required_deposit
  source: "static" | "dynamic_rule";
  no_show_count?: number;
};

// Query runner type — injectable so the policy can be verified against an
// in-memory database in sandbox tests without touching production data.
type QueryFn = (text: string, params?: any[]) => Promise<{ rows: any[] }>;

// Resolve the payment mode for a NEW booking hold, given the verified-format
// customer phone. Static mode comes from clinic override → brand default.
export async function resolvePaymentModeForHold(
  brand: any,
  clinic: any,
  phone: string,
  runQuery: QueryFn = (text, params) => pool.query(text, params),
): Promise<ResolvedPaymentMode> {
  const staticMode = clinic?.payment_mode || brand?.payment_mode || "off";
  if (!dynamicDepositEnabled()) return { mode: staticMode, source: "static" };
  const rule = parseDynamicDepositRule(brand?.config_json);
  if (!rule) return { mode: staticMode, source: "static" };

  const r = await runQuery(
    `SELECT COUNT(*)::int AS c FROM hub_bookings
     WHERE brand = $1 AND customer_phone = $2 AND status = 'no_show'
       AND created_at > NOW() - ($3::text || ' months')::interval`,
    [brand.brand, phone, String(rule.window_months)],
  );
  const count = Number(r.rows[0]?.c ?? 0);
  const decided = decideDynamicMode(rule, count);
  if (!decided)
    return { mode: staticMode, source: "static", no_show_count: count };
  return { mode: decided, source: "dynamic_rule", no_show_count: count };
}

// Effective mode for an EXISTING booking: admin override > hold snapshot >
// static fallback (for bookings created before G3 columns existed).
export function effectiveBookingPaymentMode(
  booking: any,
  brand: any,
  clinic: any,
): string {
  return (
    booking?.payment_mode_override ||
    booking?.payment_mode_effective ||
    clinic?.payment_mode ||
    brand?.payment_mode ||
    "off"
  );
}
