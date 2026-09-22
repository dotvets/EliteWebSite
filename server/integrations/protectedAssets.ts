// ============================================================================
// Integrations Manager V1 — Dr Paws HARD ISOLATION (approved design §10).
//
// This list lives IN CODE on purpose — it is not dashboard-editable and no
// global action may silently affect these assets. Owner decision #3:
// Dr Paws integrations are HIDDEN entirely in V1 (not even read-only).
// ============================================================================

export const PROTECTED_BRAND = "drpaws";

/** Assets that must never be targeted by dashboard actions (design §10.1). */
export const PROTECTED_ASSETS = {
  bevatelInboxIds: ["810"],
  bevatelPhones: ["+966920003045", "966920003045"],
  renderServices: ["DrPawsWebSite"],
  note: "Dr Paws GBP listings (3) are external and read-only by policy — never modified.",
} as const;

/** V1 visibility rule: the Dr Paws brand is hidden from the Integrations Manager. */
export function isProtectedBrand(brand: string | null | undefined): boolean {
  return (brand || "").toLowerCase() === PROTECTED_BRAND;
}

/**
 * Throws if a Category A config references a protected asset. Called by the
 * config store BEFORE any write — adapter-level defense is layered on top.
 */
export function assertNoProtectedAsset(providerKey: string, scopeType: string, scopeId: string, config: Record<string, unknown>): void {
  if (isProtectedBrand(scopeType === "brand" ? scopeId : null)) {
    throw Object.assign(new Error("protected_asset: drpaws is isolated in V1"), { code: "protected_asset" });
  }
  if (providerKey === "bevatel") {
    const inbox = String(config.inbox_id ?? "");
    if ((PROTECTED_ASSETS.bevatelInboxIds as readonly string[]).includes(inbox)) {
      throw Object.assign(new Error("protected_asset: bevatel inbox 810"), { code: "protected_asset" });
    }
    const tm = (config.template_map ?? {}) as Record<string, string>;
    for (const v of Object.values(tm)) {
      if (PROTECTED_ASSETS.bevatelPhones.some((p) => String(v).includes(p))) {
        throw Object.assign(new Error("protected_asset: drpaws phone reference"), { code: "protected_asset" });
      }
    }
  }
}

/** Filters any dashboard listing so protected brands never appear (design §10.2). */
export function visibleScope(scopeType: string, scopeId: string): boolean {
  return !(scopeType === "brand" && isProtectedBrand(scopeId));
}
