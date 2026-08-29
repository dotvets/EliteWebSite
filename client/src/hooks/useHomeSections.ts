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

// ---------- Per-section text overrides (key "home.texts") ----------
// Format: { "intro.title": { ar: "...", en: "..." }, ... } — deep-set onto translations.
export type HomeTexts = Record<string, { ar?: string; en?: string }>;

let textsCache: HomeTexts | null = null;
let textsPending: Promise<HomeTexts> | null = null;

export function getHomeTexts(): Promise<HomeTexts> {
  if (textsCache) return Promise.resolve(textsCache);
  if (!textsPending) {
    textsPending = fetch("/api/content")
      .then((r) => (r.ok ? r.json() : []))
      .then((rows: any[]) => {
        const row = rows.find((c) => c.key === "home.texts");
        if (!row?.valueAr) return {};
        try { textsCache = JSON.parse(row.valueAr) || {}; } catch { textsCache = {}; }
        return textsCache!;
      })
      .catch(() => ({}));
  }
  return textsPending;
}

export function useHomeTexts(): HomeTexts {
  const [texts, setTexts] = useState<HomeTexts>(textsCache || {});
  useEffect(() => { getHomeTexts().then(setTexts); }, []);
  return texts;
}

/** Deep-set dotted paths from overrides for the active language (non-destructive). */
export function applyTextOverrides<T>(t: T, texts: HomeTexts, lang: "ar" | "en"): T {
  if (!texts || !Object.keys(texts).length) return t;
  const clone: any = JSON.parse(JSON.stringify(t));
  for (const [path, val] of Object.entries(texts)) {
    const v = (val as any)?.[lang];
    if (typeof v !== "string" || !v.trim()) continue;
    const parts = path.split(".");
    let node = clone;
    for (let i = 0; i < parts.length - 1; i++) {
      if (node[parts[i]] == null || typeof node[parts[i]] !== "object") { node = null as any; break; }
      node = node[parts[i]];
    }
    if (node) node[parts[parts.length - 1]] = v;
  }
  return clone;
}
