import { useEffect, useState } from "react";
import { A, BiField, Confirm, Empty, SearchBar, StatusBadge, useToast, useUnsavedGuard } from "./ui";

export type FieldDef =
  | { key: string; label: string; type: "text" | "textarea" | "number" | "date" | "datetime" }
  | { key: string; label: string; type: "bi"; bi: [string, string]; textarea?: boolean }
  | { key: string; label: string; type: "image" }
  | { key: string; label: string; type: "select"; options: [string, string][] };

export default function CollectionManager({ api, route, title, fields, listCols, defaultItem, orderable }: {
  api: (url: string, opts?: any) => Promise<any>;
  route: string; title: string;
  fields: FieldDef[];
  listCols: { key: string; label: string }[];
  defaultItem: any;
  orderable?: boolean;
}) {
  const toast = useToast();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<any>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [confirmDel, setConfirmDel] = useState<any>(null);
  const [preview, setPreview] = useState<any>(null);
  const [filter, setFilter] = useState("all");
  useUnsavedGuard(dirty);

  const load = async () => {
    setLoading(true);
    try { setRows(await api(`/api/admin/${route}`)); } catch { toast("فشل التحميل", "err"); }
    setLoading(false);
  };
  useEffect(() => { load(); }, [route]);

  const openNew = () => { setForm({ ...defaultItem }); setEditingId(null); setDirty(false); };
  const openEdit = (r: any) => { setForm({ ...defaultItem, ...r }); setEditingId(r.id); setDirty(false); };
  const closeForm = () => {
    if (dirty && !window.confirm("لديك تغييرات غير محفوظة. هل تريد المغادرة؟")) return;
    setForm(null); setEditingId(null); setDirty(false);
  };

  const save = async () => {
    try {
      if (editingId) {
        await api(`/api/admin/${route}/${editingId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
        toast("✅ تم الحفظ");
      } else {
        await api(`/api/admin/${route}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
        toast("✅ تمت الإضافة");
      }
      setForm(null); setEditingId(null); setDirty(false);
      load();
    } catch { toast("❌ فشل الحفظ", "err"); }
  };

  const togglePub = async (r: any) => {
    await api(`/api/admin/${route}/${r.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ published: r.published === "true" ? "false" : "true" }) });
    toast(r.published === "true" ? "تم الإخفاء" : "تم النشر");
    load();
  };

  const duplicate = async (r: any) => {
    const copy = { ...r }; delete copy.id; delete copy.createdAt; delete copy.updatedAt;
    await api(`/api/admin/${route}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(copy) });
    toast("تم النسخ");
    load();
  };

  const doDelete = async () => {
    await api(`/api/admin/${route}/${confirmDel.id}`, { method: "DELETE" });
    setConfirmDel(null); toast("تم الحذف"); load();
  };

  const move = async (r: any, dir: number) => {
    const cur = Number(r.sortOrder || 0);
    await api(`/api/admin/${route}/${r.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sortOrder: String(cur + dir) }) });
    load();
  };

  const filtered = rows.filter((r) => {
    if (filter === "published" && r.published !== "true") return false;
    if (filter === "hidden" && r.published === "true") return false;
    if (!search) return true;
    return Object.values(r).some((v) => String(v || "").toLowerCase().includes(search.toLowerCase()));
  });

  const renderField = (f: FieldDef) => {
    if (f.type === "bi") {
      const [kar, ken] = f.bi;
      return <BiField key={f.key} labelAr={f.label} valueAr={form[kar] || ""} valueEn={form[ken] || ""} textarea={(f as any).textarea}
        onAr={(v) => { setForm({ ...form, [kar]: v }); setDirty(true); }} onEn={(v) => { setForm({ ...form, [ken]: v }); setDirty(true); }} />;
    }
    if (f.type === "select") {
      return (
        <div key={f.key} style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 13, color: "#6650a0", fontWeight: 700, marginBottom: 6 }}>{f.label}</div>
          <select style={A.input} value={form[f.key] || ""} onChange={(e) => { setForm({ ...form, [f.key]: e.target.value }); setDirty(true); }}>
            <option value="">—</option>
            {f.options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
      );
    }
    if (f.type === "image") {
      return (
        <div key={f.key} style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 13, color: "#6650a0", fontWeight: 700, marginBottom: 6 }}>{f.label}</div>
          <input style={A.input} placeholder="رابط الصورة أو /api/media/<id>" value={form[f.key] || ""} onChange={(e) => { setForm({ ...form, [f.key]: e.target.value }); setDirty(true); }} />
          {form[f.key] && <img src={form[f.key]} style={{ maxWidth: 140, borderRadius: 8 }} />}
        </div>
      );
    }
    return (
      <div key={f.key} style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 13, color: "#6650a0", fontWeight: 700, marginBottom: 6 }}>{f.label}</div>
        {f.type === "textarea"
          ? <textarea style={{ ...A.input, minHeight: 90 }} value={form[f.key] || ""} onChange={(e) => { setForm({ ...form, [f.key]: e.target.value }); setDirty(true); }} />
          : <input style={A.input} type={f.type === "number" ? "number" : f.type === "date" ? "date" : f.type === "datetime" ? "datetime-local" : "text"} value={form[f.key] || ""} onChange={(e) => { setForm({ ...form, [f.key]: e.target.value }); setDirty(true); }} />}
      </div>
    );
  };

  return (
    <div>
      <div style={{ ...A.card, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
        <h3 style={{ margin: 0 }}>{title} ({rows.length})</h3>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <SearchBar value={search} onChange={setSearch} />
          <select style={{ ...A.input, width: "auto", marginBottom: 0 }} value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">الكل</option><option value="published">منشور</option><option value="hidden">مخفي/مسودة</option>
          </select>
          <button style={A.btn} onClick={openNew}>+ إضافة</button>
        </div>
      </div>

      {form && (
        <div style={A.card}>
          <h3>{editingId ? "تعديل" : "إضافة جديد"}</h3>
          {fields.map(renderField)}
          <div style={{ position: "sticky", bottom: 0, background: "#fff", padding: "10px 0", display: "flex", gap: 8 }}>
            <button style={A.btn} onClick={save}>حفظ</button>
            <button style={A.btnGhost} onClick={closeForm}>إلغاء</button>
            {dirty && <span style={{ color: "#c80", fontSize: 13, alignSelf: "center" }}>● تغييرات غير محفوظة</span>}
          </div>
        </div>
      )}

      <div style={{ ...A.card, overflowX: "auto" }}>
        {loading ? <Empty text="جارٍ التحميل…" /> : filtered.length === 0 ? <Empty text="لا عناصر — أضف أول عنصر." /> : (
          <table style={A.table as any}>
            <thead>
              <tr>
                {listCols.map((c) => <th key={c.key} style={A.th}>{c.label}</th>)}
                <th style={A.th}>الحالة</th>{orderable && <th style={A.th}>الترتيب</th>}<th style={A.th}>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id}>
                  {listCols.map((c) => <td key={c.key} style={A.td}>{String(r[c.key] ?? "—").slice(0, 60)}</td>)}
                  <td style={A.td}>
                    <StatusBadge on={r.published === "true"} onText="منشور" offText="مخفي" />
                    {r.publishAt && r.publishAt > new Date().toISOString() && (
                      <span style={{ marginInlineStart: 6, fontSize: 11, background: "#fff3cd", color: "#856404", borderRadius: 6, padding: "2px 6px" }}>⏰ مجدول {String(r.publishAt).slice(0, 16).replace("T", " ")}</span>
                    )}
                  </td>
                  {orderable && (
                    <td style={{ ...S_tdNowrap }}>
                      <button style={A.btnGhost} onClick={() => move(r, 1)}>▲</button>{" "}
                      <button style={A.btnGhost} onClick={() => move(r, -1)}>▼</button>
                    </td>
                  )}
                  <td style={S_tdNowrap}>
                    <button style={A.btnGhost} onClick={() => setPreview(r)}>👁 معاينة</button>{" "}
                    <button style={A.btnGhost} onClick={() => openEdit(r)}>تعديل</button>{" "}
                    <button style={A.btnGhost} onClick={() => duplicate(r)}>نسخ</button>{" "}
                    <button style={A.btnGhost} onClick={() => togglePub(r)}>{r.published === "true" ? "إخفاء" : "نشر"}</button>{" "}
                    <button style={A.btnDanger} onClick={() => setConfirmDel(r)}>حذف</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {preview && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={() => setPreview(null)}>
          <div style={{ background: "#fff", borderRadius: 14, maxWidth: 560, width: "100%", maxHeight: "80vh", overflowY: "auto", padding: 24 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <h3 style={{ margin: 0 }}>معاينة</h3>
              <button style={A.btnGhost} onClick={() => setPreview(null)}>✕ إغلاق</button>
            </div>
            {(preview.image || preview.coverImage || preview.photo) && (
              <img src={preview.image || preview.coverImage || preview.photo} style={{ width: "100%", maxHeight: 240, objectFit: "cover", borderRadius: 10, marginBottom: 14 }} />
            )}
            <div dir="rtl">
              <h2 style={{ color: "#6650a0", marginTop: 0 }}>{preview.titleAr || preview.nameAr || preview.customerAr || preview.slug || "—"}</h2>
              {(preview.titleEn || preview.nameEn) && <div style={{ color: "#999", fontSize: 13, marginBottom: 8 }} dir="ltr">{preview.titleEn || preview.nameEn}</div>}
              {preview.discount && <span style={{ background: "#6650a0", color: "#fff", borderRadius: 20, padding: "3px 12px", fontSize: 13 }}>{preview.discount}</span>}
              <p style={{ lineHeight: 1.9, marginTop: 12, whiteSpace: "pre-wrap" }}>{preview.contentAr || preview.descriptionAr || preview.textAr || ""}</p>
              <div style={{ color: "#888", fontSize: 12, marginTop: 14, borderTop: "1px solid #eee", paddingTop: 10 }}>
                {preview.author && <span style={{ marginInlineEnd: 12 }}>✍ {preview.author}</span>}
                {preview.branch && <span style={{ marginInlineEnd: 12 }}>📍 {preview.branch}</span>}
                {preview.rating && <span style={{ marginInlineEnd: 12 }}>★ {preview.rating}</span>}
                {(preview.publishAt || preview.publishedAt) && <span>🗓 {String(preview.publishAt || preview.publishedAt).slice(0, 16).replace("T", " ")}</span>}
              </div>
            </div>
            <div style={{ marginTop: 16, fontSize: 12, color: "#999" }}>معاينة تقريبية داخل اللوحة — الشكل النهائي على الموقع قد يختلف في التنسيق.</div>
          </div>
        </div>
      )}

      <Confirm open={!!confirmDel} text={`حذف «${confirmDel?.nameAr || confirmDel?.titleAr || confirmDel?.customerAr || confirmDel?.slug || ""}» نهائياً؟`} onYes={doDelete} onNo={() => setConfirmDel(null)} />
    </div>
  );
}

const S_tdNowrap: React.CSSProperties = { padding: 10, borderBottom: "1px solid #f0f0f0", whiteSpace: "nowrap" };
