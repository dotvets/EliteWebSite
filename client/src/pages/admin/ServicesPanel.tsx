import { useEffect, useRef, useState } from "react";

const S: Record<string, React.CSSProperties> = {
  card: { background: "#fff", borderRadius: 12, padding: 20, boxShadow: "0 2px 10px rgba(0,0,0,.06)", marginBottom: 16 },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 14 },
  th: { textAlign: "right", padding: 10, borderBottom: "2px solid #eee", color: "#6650a0" },
  td: { padding: 10, borderBottom: "1px solid #f0f0f0" },
  btn: { background: "#6650a0", color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", cursor: "pointer" },
  btnGhost: { background: "#eee", color: "#333", border: "none", borderRadius: 8, padding: "8px 14px", cursor: "pointer" },
  btnDanger: { background: "#c0392b", color: "#fff", border: "none", borderRadius: 8, padding: "6px 12px", cursor: "pointer" },
  input: { width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ddd", marginBottom: 10, boxSizing: "border-box" },
  badgeOn: { background: "#e8f8ee", color: "#1a7f37", borderRadius: 6, padding: "2px 10px", fontSize: 12, fontWeight: 700 },
  badgeOff: { background: "#fdecec", color: "#c00", borderRadius: 6, padding: "2px 10px", fontSize: 12, fontWeight: 700 },
};

type Service = {
  id: string; nameAr: string; nameEn: string;
  descriptionAr?: string | null; descriptionEn?: string | null;
  price: string; currency: string; isActive: string;
};

const emptyForm = { nameAr: "", nameEn: "", descriptionAr: "", descriptionEn: "", price: "", currency: "SAR", isActive: "true" };

export default function ServicesPanel({ api }: { api: (url: string, opts?: any) => Promise<any> }) {
  const [services, setServices] = useState<Service[]>([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<any>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [msg, setMsg] = useState("");
  const [importResults, setImportResults] = useState<any[] | null>(null);
  const [importing, setImporting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => setServices(await api("/api/admin/services"));
  useEffect(() => { load(); }, []);

  const save = async () => {
    setMsg("");
    try {
      if (editingId) {
        await api(`/api/admin/services/${editingId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      } else {
        await api("/api/admin/services", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      }
      setForm(emptyForm); setEditingId(null); await load();
      setMsg("✅ تم الحفظ");
    } catch (e: any) {
      setMsg("❌ " + (e?.message || "فشل الحفظ"));
    }
  };

  const toggle = async (s: Service) => {
    await api(`/api/admin/services/${s.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...s, isActive: s.isActive === "true" ? "false" : "true" }) });
    load();
  };

  const remove = async (s: Service) => {
    if (!window.confirm(`حذف الخدمة «${s.nameAr}» نهائياً؟`)) return;
    await api(`/api/admin/services/${s.id}`, { method: "DELETE" });
    load();
  };

  const parseCsv = (text: string): any[] => {
    const lines = text.replace(/^﻿/, "").split(/\r?\n/).filter((l) => l.trim());
    if (lines.length < 2) return [];
    const headers = lines[0].split(",").map((h) => h.trim());
    return lines.slice(1).map((l) => {
      const cells = l.split(",").map((c) => c.trim());
      const row: any = {};
      headers.forEach((h, i) => (row[h] = cells[i] ?? ""));
      return row;
    });
  };

  const onImportFile = async (file: File) => {
    setImporting(true); setImportResults(null); setMsg("");
    try {
      let rows: any[] = [];
      if (/\.(xlsx|xls)$/i.test(file.name)) {
        const XLSX = await import("xlsx");
        const wb = XLSX.read(await file.arrayBuffer());
        rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: "" });
      } else {
        rows = parseCsv(await file.text());
      }
      if (!rows.length) { setMsg("❌ الملف فارغ أو غير مقروء"); setImporting(false); return; }
      const res = await api("/api/admin/services/import", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ rows }) });
      setImportResults(res.results || []);
      setMsg(`✅ تم استيراد ${res.imported} — ❌ فشل ${res.failed}`);
      await load();
    } catch (e: any) {
      setMsg("❌ فشل الاستيراد: " + (e?.message || ""));
    }
    setImporting(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const filtered = services.filter((s) => !search || s.nameAr.includes(search) || s.nameEn.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div style={S.card}>
        <h3>{editingId ? "تعديل خدمة" : "إضافة خدمة"}</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <input style={S.input} placeholder="اسم الخدمة (عربي) *" value={form.nameAr} onChange={(e) => setForm({ ...form, nameAr: e.target.value })} />
          <input style={S.input} placeholder="Service Name (EN) *" value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} />
          <input style={S.input} placeholder="الوصف (عربي) — اختياري" value={form.descriptionAr} onChange={(e) => setForm({ ...form, descriptionAr: e.target.value })} />
          <input style={S.input} placeholder="Description (EN) — optional" value={form.descriptionEn} onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })} />
          <input style={S.input} type="number" min="0" step="0.01" placeholder="السعر *" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          <select style={S.input} value={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.value })}>
            <option value="true">مفعّلة</option>
            <option value="false">معطّلة</option>
          </select>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={S.btn} onClick={save}>{editingId ? "حفظ التعديل" : "إضافة"}</button>
          {editingId && <button style={S.btnGhost} onClick={() => { setEditingId(null); setForm(emptyForm); }}>إلغاء</button>}
        </div>
        {msg && <p style={{ marginTop: 10 }}>{msg}</p>}
      </div>

      <div style={S.card}>
        <h3>استيراد الخدمات (Excel / CSV)</h3>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" onChange={(e) => e.target.files?.[0] && onImportFile(e.target.files[0])} />
          <a href="/api/admin/services/template" style={{ ...S.btnGhost, textDecoration: "none", display: "inline-block" }}>⬇ تحميل نموذج جاهز</a>
          {importing && <span style={{ color: "#888" }}>جارٍ الاستيراد…</span>}
        </div>
        {importResults && (
          <div style={{ marginTop: 12, maxHeight: 220, overflowY: "auto", fontSize: 13 }}>
            {importResults.map((r) => (
              <div key={r.row} style={{ color: r.ok ? "#1a7f37" : "#c00" }}>
                صف {r.row}: {r.ok ? "✅ تم" : "❌ " + (r.errors || []).join(" | ")}
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={S.card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
          <h3 style={{ margin: 0 }}>الخدمات ({services.length})</h3>
          <input style={{ ...S.input, width: 240, marginBottom: 0 }} placeholder="بحث…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <table style={S.table as any}>
          <thead>
            <tr><th style={S.th}>الخدمة</th><th style={S.th}>Service</th><th style={S.th}>السعر</th><th style={S.th}>الحالة</th><th style={S.th}></th></tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <tr key={s.id}>
                <td style={S.td}>{s.nameAr}</td>
                <td style={S.td}>{s.nameEn}</td>
                <td style={S.td}>{s.price} {s.currency}</td>
                <td style={S.td}><span style={s.isActive === "true" ? S.badgeOn : S.badgeOff}>{s.isActive === "true" ? "مفعّلة" : "معطّلة"}</span></td>
                <td style={{ ...S.td, whiteSpace: "nowrap" }}>
                  <button style={S.btnGhost} onClick={() => { setEditingId(s.id); setForm({ nameAr: s.nameAr, nameEn: s.nameEn, descriptionAr: s.descriptionAr || "", descriptionEn: s.descriptionEn || "", price: s.price, currency: s.currency, isActive: s.isActive }); }}>تعديل</button>{" "}
                  <button style={S.btnGhost} onClick={() => toggle(s)}>{s.isActive === "true" ? "تعطيل" : "تفعيل"}</button>{" "}
                  <button style={S.btnDanger} onClick={() => remove(s)}>حذف</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p style={{ color: "#888" }}>لا خدمات مطابقة.</p>}
      </div>
    </div>
  );
}
