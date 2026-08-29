import { useEffect, useState } from "react";

// Homepage section visibility/order config stored in site_content key "home.sections".
// Format: { hidden: string[], order: string[], heroHidden: boolean }
export type HomeSectionsConfig = { hidden: string[]; order: string[]; heroHidden: boolean };

const DEFAULT_CFG: HomeSectionsConfig = { hidden: [], order: [], heroHidden: false };

let cache: HomeSectionsConfig | null = null;
let pending: Promise<HomeSectionsConfig> | null = null;

export function getHomeSectionsConfig(): Promise<HomeSectionsConfig> {
  if (cache) return Promise.resolve(cache);
  if (!pending) {
    pending = fetch("/api/content")
      .then((r) => (r.ok ? r.json() : []))
      .then((rows: any[]) => {
        const row = rows.find((c) => c.key === "home.sections");
        if (!row?.valueAr) return DEFAULT_CFG;
        try {
          const parsed = JSON.parse(row.valueAr);
          cache = { hidden: parsed.hidden || [], order: parsed.order || [], heroHidden: !!parsed.heroHidden };
        } catch { cache = DEFAULT_CFG; }
        return cache!;
      })
      .catch(() => DEFAULT_CFG);
  }
  return pending;
}

export function useHomeSectionsConfig(): HomeSectionsConfig {
  const [cfg, setCfg] = useState<HomeSectionsConfig>(cache || DEFAULT_CFG);
  useEffect(() => { getHomeSectionsConfig().then(setCfg); }, []);
  return cfg;
}

/** Apply hide/order config to the section list. */
export function arrangeSections<T extends { key: string }>(sections: T[], cfg: HomeSectionsConfig): T[] {
  const visible = sections.filter((s) => !cfg.hidden.includes(s.key));
  if (!cfg.order.length) return visible;
  const rank = (k: string) => {
    const i = cfg.order.indexOf(k);
    return i === -1 ? cfg.order.length + 100 : i;
  };
  return [...visible].sort((a, b) => rank(a.key) - rank(b.key));
}
