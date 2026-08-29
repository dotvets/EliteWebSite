import { useEffect, useState } from "react";

// Single source of truth for global settings (phone, whatsapp, email, social, branches).
// Cached at module level — fetched once per session.
let cache: any = null;
let pending: Promise<any> | null = null;

export function getBootstrap(): Promise<any> {
  if (cache) return Promise.resolve(cache);
  if (!pending) {
    pending = fetch("/api/public/bootstrap")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { cache = d; return d; })
      .catch(() => null);
  }
  return pending;
}

export function useBootstrap() {
  const [data, setData] = useState<any>(cache);
  useEffect(() => { getBootstrap().then(setData); }, []);
  return data;
}

/** Bilingual setting value with fallback. */
export function bsVal(data: any, key: string, lang: string, fallback: string): string {
  const v = data?.settings?.[key];
  if (!v) return fallback;
  return (lang === "ar" ? v.ar : v.en) || v.ar || v.en || fallback;
}
