import { useEffect, useState } from "react";

/**
 * Working hours — single source of truth.
 *
 * Stored in the site-content table under key `settings.workingHours`
 * (JSON array of 7 day entries, Sunday first) and edited from
 * Dashboard → مواعيد العمل. The Footer on every page reads the same
 * data, so one dashboard save updates the whole site.
 *
 * Closed days are never shown. Consecutive days with identical hours
 * are grouped automatically: "Sunday – Thursday", "Friday & Saturday",
 * or a single day on its own line when its hours differ.
 */

export type DaySchedule = { open: boolean; from: string; to: string }; // from/to: "HH:MM" 24h

export const DAY_NAMES: Record<string, string[]> = {
  en: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  ar: ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"],
};

// Matches the hours previously hardcoded in the footer.
export const DEFAULT_SCHEDULE: DaySchedule[] = [
  { open: true, from: "12:00", to: "21:00" }, // Sunday
  { open: true, from: "12:00", to: "21:00" }, // Monday
  { open: true, from: "12:00", to: "21:00" }, // Tuesday
  { open: true, from: "12:00", to: "21:00" }, // Wednesday
  { open: true, from: "12:00", to: "21:00" }, // Thursday
  { open: true, from: "09:00", to: "22:00" }, // Friday
  { open: true, from: "09:00", to: "22:00" }, // Saturday
];

const CONTENT_KEY = "settings.workingHours";

let cache: DaySchedule[] | null = null;
const listeners = new Set<() => void>();

function parseSchedule(raw: string): DaySchedule[] | null {
  try {
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr) || arr.length !== 7) return null;
    return arr.map((d: any, i: number) => ({
      open: d?.open !== false,
      from: /^\d{2}:\d{2}$/.test(d?.from) ? d.from : DEFAULT_SCHEDULE[i].from,
      to: /^\d{2}:\d{2}$/.test(d?.to) ? d.to : DEFAULT_SCHEDULE[i].to,
    }));
  } catch {
    return null;
  }
}

async function fetchSchedule() {
  try {
    const r = await fetch("/api/content", { cache: "no-store" });
    if (!r.ok) throw new Error("fetch failed");
    const rows: any[] = await r.json();
    const row = rows.find((x) => x.key === CONTENT_KEY);
    cache = (row && parseSchedule(row.valueAr || "")) || DEFAULT_SCHEDULE;
  } catch {
    cache = cache || DEFAULT_SCHEDULE;
  }
  listeners.forEach((fn) => fn());
}

export function useWorkingHours(): DaySchedule[] {
  const [, setTick] = useState(0);
  useEffect(() => {
    const fn = () => setTick((t) => t + 1);
    listeners.add(fn);
    if (!cache) fetchSchedule();
    return () => { listeners.delete(fn); };
  }, []);
  return cache || DEFAULT_SCHEDULE;
}

/** Force a refetch (e.g. right after saving from the dashboard). */
export function refreshWorkingHours() { fetchSchedule(); }

const AR_DIGITS = "٠١٢٣٤٥٦٧٨٩";
const toArDigits = (s: string) => s.replace(/\d/g, (d) => AR_DIGITS[+d]);

function formatTime(hhmm: string, lang: string): string {
  const [hStr, m] = hhmm.split(":");
  let h = parseInt(hStr, 10);
  const periodEn = h >= 12 ? "PM" : "AM";
  const periodAr = h >= 12 ? "م" : "ص";
  h = h % 12 || 12;
  const t = `${h}:${m}`;
  return lang === "ar" ? `${toArDigits(t)} ${periodAr}` : `${t} ${periodEn}`;
}

export type HoursGroup = { time: string; days: string };

/** Group consecutive open days with identical hours; closed days are omitted. */
export function groupSchedule(schedule: DaySchedule[], lang: "en" | "ar" | string): HoursGroup[] {
  const names = DAY_NAMES[lang === "ar" ? "ar" : "en"];
  const groups: { days: number[]; from: string; to: string }[] = [];
  schedule.forEach((d, i) => {
    if (!d.open) return;
    const last = groups[groups.length - 1];
    if (last && last.from === d.from && last.to === d.to && last.days[last.days.length - 1] === i - 1) {
      last.days.push(i);
    } else {
      groups.push({ days: [i], from: d.from, to: d.to });
    }
  });
  const sep = lang === "ar" ? " – " : " – ";
  const and = lang === "ar" ? " و" : " & ";
  return groups.map((g) => {
    const first = names[g.days[0]];
    const last = names[g.days[g.days.length - 1]];
    const days = g.days.length === 1 ? first : g.days.length === 2 ? `${first}${and}${last}` : `${first}${sep}${last}`;
    return { time: `${formatTime(g.from, lang)}${sep}${formatTime(g.to, lang)}`, days };
  });
}
