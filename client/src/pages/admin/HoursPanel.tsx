import { useEffect, useState } from "react";
import { A, useToast } from "./ui";
import { DAY_NAMES, DEFAULT_SCHEDULE, refreshWorkingHours, type DaySchedule } from "@/lib/workingHours";

type Api = (url: string, opts?: any) => Promise<any>;

/**
 * Working Hours — edits the footer "Working Hours" block site-wide.
 * Per-day Open/Closed toggle + time pickers; saved as JSON in the
 * site-content table (settings.workingHours) and applied immediately.
 */
export default function HoursPanel({ api }: { api: Api }) {
  const toast = useToast();
  const [days, setDays] = useState<DaySchedule[]>(DEFAULT_SCHEDULE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const rows = await api("/api/content");
        const row = rows.find((x: any) => x.key === "settings.workingHours");
        if (row?.valueAr) {
          try {
            const arr = JSON.parse(row.valueAr);
            if (Array.isArray(arr) && arr.length === 7) setDays(arr.map((d: any, i: number) => ({
              open: d?.open !== false,
              from: d?.from || DEFAULT_SCHEDULE[i].from,
              to: d?.to || DEFAULT_SCHEDULE[i].to,
            })));
          } catch { /* keep defaults */ }
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const update = (i: number, patch: Partial<DaySchedule>) =>
    setDays((ds) => ds.map((d, j) => (j === i ? { ...d, ...patch } : d)));

  const save = async () => {
    setSaving(true);
    try {
      const json = JSON.stringify(days);
      await api(`/api/admin/content/${encodeURIComponent("settings.workingHours")}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ valueAr: json, valueEn: json, type: "text", section: "settings" }),
      });
      refreshWorkingHours();
      toast("✅ Working hours updated successfully");
    } catch {
      toast("❌ فشل الحفظ — حاول مرة أخرى", "err");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={A.card}>جارٍ التحميل…</div>;

  return (
    <div style={A.card}>
      <h3>مواعيد العمل (Working Hours)</h3>
      <p style={{ color: "#888", fontSize: 13 }}>
        هذه المواعيد تظهر في قسم Working Hours في فوتر الموقع كله. الأيام المتتالية بنفس الموعد تُجمَّع تلقائيًا في سطر واحد، وأي يوم «مغلق» لا تُعرض له ساعات.
      </p>

      <div style={{ marginTop: 16 }}>
        {DAY_NAMES.ar.map((nameAr, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid #f0f0f0", flexWrap: "wrap" }}>
            <div style={{ width: 110, fontWeight: 700, color: "#6650a0", fontSize: 14 }}>
              {nameAr} <span style={{ color: "#aaa", fontWeight: 400, fontSize: 12 }}>{DAY_NAMES.en[i]}</span>
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 13 }}>
              <input type="checkbox" checked={days[i].open} onChange={(e) => update(i, { open: e.target.checked })} />
              {days[i].open ? "مفتوح" : "مغلق"}
            </label>
            {days[i].open && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, direction: "ltr" }}>
                <input type="time" style={{ ...A.input, width: 130, marginBottom: 0 }} value={days[i].from} onChange={(e) => update(i, { from: e.target.value })} />
                <span style={{ color: "#888" }}>→</span>
                <input type="time" style={{ ...A.input, width: 130, marginBottom: 0 }} value={days[i].to} onChange={(e) => update(i, { to: e.target.value })} />
              </div>
            )}
          </div>
        ))}
      </div>

      <button style={{ ...A.btn, marginTop: 16 }} onClick={save} disabled={saving} data-testid="button-save-working-hours">
        {saving ? "جارٍ الحفظ…" : "Save Changes"}
      </button>
    </div>
  );
}
