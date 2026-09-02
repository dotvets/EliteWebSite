import { useEffect, useRef, useState } from "react";

/**
 * Booking form source switcher (public side).
 *
 * Reads two site-content keys (managed from Dashboard → إعدادات الحجز):
 *   settings.bookingMode   — "internal" (default) | "external"
 *   settings.bookingEmbed  — external embed code (iframe / script-tag widget)
 *
 * The internal BookingForm stays untouched — when the mode is "internal",
 * or when external is selected but no code is stored yet, callers fall back
 * to the internal form.
 */

export type BookingSource = { mode: string; embed: string; loaded: boolean };

let cache: { mode: string; embed: string } | null = null;
const listeners = new Set<() => void>();

async function fetchBookingSource() {
  try {
    const r = await fetch("/api/content", { cache: "no-store" });
    if (!r.ok) throw new Error("content fetch failed");
    const rows: any[] = await r.json();
    const get = (k: string) => rows.find((x) => x.key === k)?.valueAr ?? "";
    cache = {
      mode: get("settings.bookingMode") === "external" ? "external" : "internal",
      embed: get("settings.bookingEmbed"),
    };
  } catch {
    cache = cache || { mode: "internal", embed: "" };
  }
  listeners.forEach((fn) => fn());
}

export function useBookingSource(): BookingSource {
  const [, setTick] = useState(0);
  useEffect(() => {
    const fn = () => setTick((t) => t + 1);
    listeners.add(fn);
    if (!cache) fetchBookingSource();
    return () => { listeners.delete(fn); };
  }, []);
  return { mode: cache?.mode ?? "internal", embed: cache?.embed ?? "", loaded: !!cache };
}

/**
 * Sanitizes external embed HTML:
 *  - keeps <iframe> only with https: src; strips inline event handlers;
 *    forces responsive sizing and a restrictive sandbox
 *  - keeps <script src="https://…"> tags only (inline JS is removed) and
 *    returns them separately so they can be injected programmatically
 *    (React never executes scripts set via innerHTML)
 *  - drops everything else that can auto-redirect or take over the page
 *    (<meta http-equiv=refresh>, <form>, <object>, <embed>, <base>, <link>)
 */
export function sanitizeEmbed(html: string): { markup: string; scripts: { src: string; attrs: Record<string, string> }[] } {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const scripts: { src: string; attrs: Record<string, string> }[] = [];

  doc.querySelectorAll("script").forEach((el) => {
    const src = el.getAttribute("src") || "";
    if (/^https:\/\//i.test(src) && !el.textContent?.trim()) {
      const attrs: Record<string, string> = {};
      for (const a of Array.from(el.attributes)) {
        if (/^on/i.test(a.name)) continue;
        attrs[a.name] = a.value;
      }
      scripts.push({ src, attrs });
    }
    el.remove();
  });

  doc.querySelectorAll("meta,form,object,embed,base,link,audio,video").forEach((el) => el.remove());

  doc.querySelectorAll("*").forEach((el) => {
    for (const a of Array.from(el.attributes)) {
      if (/^on/i.test(a.name)) el.removeAttribute(a.name);
      if ((a.name === "href" || a.name === "src") && /^\s*javascript:/i.test(a.value)) el.removeAttribute(a.name);
    }
  });

  doc.querySelectorAll("iframe").forEach((el) => {
    const src = el.getAttribute("src") || "";
    if (!/^https:\/\//i.test(src)) { el.remove(); return; }
    el.setAttribute("sandbox", "allow-scripts allow-same-origin allow-forms allow-popups");
    el.setAttribute("loading", "lazy");
    el.setAttribute("referrerpolicy", "no-referrer-when-downgrade");
    if (!el.getAttribute("width")) el.style.width = "100%";
    if (!el.getAttribute("height") && !el.style.height) el.style.height = "600px";
    el.style.maxWidth = "100%";
    el.style.border = el.style.border || "0";
  });

  return { markup: doc.body.innerHTML, scripts };
}

export default function BookingEmbed({ code }: { code: string }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    try {
      const { markup, scripts } = sanitizeEmbed(code);
      host.innerHTML = markup;
      for (const s of scripts) {
        const el = document.createElement("script");
        Object.entries(s.attrs).forEach(([k, v]) => el.setAttribute(k, v));
        el.async = true;
        host.appendChild(el);
      }
      return () => { host.innerHTML = ""; };
    } catch {
      setError(true);
    }
  }, [code]);

  if (error) return null;
  return (
    <div
      ref={hostRef}
      data-testid="external-booking-embed"
      style={{ width: "100%", maxWidth: "100%", overflow: "hidden", minHeight: 200 }}
    />
  );
}
