import { useEffect, useState } from "react";
import CollectionManager from "./CollectionManager";
import { A, Empty, SearchBar, useToast } from "./ui";

type Api = (url: string, opts?: any) => Promise<any>;

const BRANCH_OPTS: [string, string][] = [["الرياض — قرطبة", "الرياض — قرطبة"], ["جدة — الحمراء", "جدة — الحمراء"]];

export const TeamPanel = ({ api }: { api: Api }) => (
  <CollectionManager api={api} route="team" title="الفريق / الأطباء" orderable
    listCols={[{ key: "nameAr", label: "الاسم" }, { key: "positionAr", label: "المنصب" }, { key: "branch", label: "الفرع" }]}
    defaultItem={{ nameAr: "", nameEn: "", positionAr: "", positionEn: "", specialty: "", bioAr: "", bioEn: "", photo: "", experience: "", certifications: "", languages: "", branch: "", email: "", published: "true", featured: "false", sortOrder: "0" }}
    fields={[
      { key: "name", label: "الاسم", type: "bi", bi: ["nameAr", "nameEn"] },
      { key: "position", label: "المنصب", type: "bi", bi: ["positionAr", "positionEn"] },
      { key: "specialty", label: "التخصص", type: "text" },
      { key: "bio", label: "السيرة", type: "bi", bi: ["bioAr", "bioEn"], textarea: true },
      { key: "photo", label: "الصورة الشخصية", type: "image" },
      { key: "experience", label: "سنوات الخبرة", type: "text" },
      { key: "certifications", label: "الشهادات", type: "textarea" },
      { key: "languages", label: "اللغات", type: "text" },
      { key: "branch", label: "الفرع", type: "select", options: BRANCH_OPTS },
      { key: "email", label: "البريد (إن كان يُعرض علناً)", type: "text" },
    ]} />
);

export const TestimonialsPanel = ({ api }: { api: Api }) => (
  <CollectionManager api={api} route="testimonials" title="آراء العملاء" orderable
    listCols={[{ key: "customerAr", label: "العميل" }, { key: "textAr", label: "الرأي" }, { key: "rating", label: "التقييم" }]}
    defaultItem={{ customerAr: "", customerEn: "", textAr: "", textEn: "", rating: "5", image: "", branch: "", published: "true", featured: "false", sortOrder: "0" }}
    fields={[
      { key: "customer", label: "اسم العميل", type: "bi", bi: ["customerAr", "customerEn"] },
      { key: "text", label: "نص الرأي", type: "bi", bi: ["textAr", "textEn"], textarea: true },
      { key: "rating", label: "التقييم (1-5)", type: "number" },
      { key: "image", label: "صورة العميل", type: "image" },
      { key: "branch", label: "الفرع", type: "select", options: BRANCH_OPTS },
    ]} />
);

export const OffersPanel = ({ api }: { api: Api }) => (
  <CollectionManager api={api} route="offers" title="العروض والتخفيضات"
    listCols={[{ key: "titleAr", label: "العرض" }, { key: "discount", label: "الخصم" }, { key: "endDate", label: "الانتهاء" }]}
    defaultItem={{ titleAr: "", titleEn: "", descriptionAr: "", descriptionEn: "", image: "", discount: "", startDate: "", endDate: "", cta: "", ctaUrl: "", published: "true", featured: "false" }}
    fields={[
      { key: "title", label: "عنوان العرض", type: "bi", bi: ["titleAr", "titleEn"] },
      { key: "description", label: "الوصف", type: "bi", bi: ["descriptionAr", "descriptionEn"], textarea: true },
      { key: "image", label: "صورة العرض", type: "image" },
      { key: "discount", label: "الخصم/القيمة", type: "text" },
      { key: "startDate", label: "تاريخ البداية", type: "date" },
      { key: "endDate", label: "تاريخ النهاية", type: "date" },
      { key: "cta", label: "نص الزر", type: "text" },
      { key: "ctaUrl", label: "رابط الزر", type: "text" },
    ]} />
);

export const BlogPanel = ({ api }: { api: Api }) => (
  <CollectionManager api={api} route="blog" title="المدونة"
    listCols={[{ key: "titleAr", label: "العنوان" }, { key: "category", label: "التصنيف" }, { key: "publishedAt", label: "النشر" }]}
    defaultItem={{ slug: "", titleAr: "", titleEn: "", contentAr: "", contentEn: "", coverImage: "", author: "", category: "", tags: "", publishedAt: "", metaTitleAr: "", metaTitleEn: "", metaDescAr: "", metaDescEn: "", published: "false", featured: "false" }}
    fields={[
      { key: "slug", label: "الرابط (slug)", type: "text" },
      { key: "title", label: "عنوان المقال", type: "bi", bi: ["titleAr", "titleEn"] },
      { key: "content", label: "المحتوى", type: "bi", bi: ["contentAr", "contentEn"], textarea: true },
      { key: "coverImage", label: "صورة الغلاف", type: "image" },
      { key: "author", label: "الكاتب", type: "text" },
      { key: "category", label: "التصنيف", type: "text" },
      { key: "tags", label: "الوسوم (مفصولة بفواصل)", type: "text" },
      { key: "publishedAt", label: "تاريخ النشر", type: "date" },
      { key: "metaTitle", label: "SEO — العنوان", type: "bi", bi: ["metaTitleAr", "metaTitleEn"] },
      { key: "metaDesc", label: "SEO — الوصف", type: "bi", bi: ["metaDescAr", "metaDescEn"], textarea: true },
    ]} />
);

export const BranchesPanel = ({ api }: { api: Api }) => (
  <CollectionManager api={api} route="branches" title="الفروع" orderable
    listCols={[{ key: "nameAr", label: "الفرع" }, { key: "phone", label: "الهاتف" }, { key: "hours", label: "الساعات" }]}
    defaultItem={{ nameAr: "", nameEn: "", addressAr: "", addressEn: "", mapsUrl: "", phone: "", whatsapp: "", hours: "", emergency: "false", image: "", published: "true", sortOrder: "0" }}
    fields={[
      { key: "name", label: "اسم الفرع", type: "bi", bi: ["nameAr", "nameEn"] },
      { key: "address", label: "العنوان", type: "bi", bi: ["addressAr", "addressEn"] },
      { key: "mapsUrl", label: "رابط خرائط جوجل", type: "text" },
      { key: "phone", label: "الهاتف", type: "text" },
      { key: "whatsapp", label: "واتساب", type: "text" },
      { key: "hours", label: "ساعات العمل", type: "text" },
      { key: "emergency", label: "طوارئ 24/7؟", type: "select", options: [["true", "نعم"], ["false", "لا"]] },
      { key: "image", label: "صورة الفرع", type: "image" },
    ]} />
);

// ---------- Settings (single source of truth) ----------
const SETTING_KEYS: { group: string; items: { key: string; label: string }[] }[] = [
  { group: "عام", items: [{ key: "settings.siteName", label: "اسم الموقع" }, { key: "settings.logo", label: "الشعار (رابط)" }, { key: "settings.announcement", label: "شريط إعلان (اتركه فارغاً لإخفائه)" }] },
  { group: "التواصل", items: [{ key: "settings.phone", label: "الهاتف الموحد" }, { key: "settings.whatsapp", label: "واتساب" }, { key: "settings.email", label: "البريد" }, { key: "settings.address", label: "العنوان" }] },
  { group: "وسائل التواصل", items: [{ key: "settings.social.facebook", label: "فيسبوك" }, { key: "settings.social.twitter", label: "تويتر/X" }, { key: "settings.social.instagram", label: "إنستغرام" }, { key: "settings.social.snapchat", label: "سناب شات" }, { key: "settings.social.tiktok", label: "تيك توك" }] },
];

export function SettingsPanel({ api }: { api: Api }) {
  const toast = useToast();
  const [content, setContent] = useState<any[]>([]);
  const [group, setGroup] = useState(0);
  const [vals, setVals] = useState<Record<string, string>>({});
  const load = async () => {
    const c = await api("/api/content");
    setContent(c);
    const v: Record<string, string> = {};
    c.forEach((x: any) => (v[x.key] = x.valueAr || ""));
    setVals(v);
  };
  useEffect(() => { load(); }, []);
  const saveKey = async (key: string) => {
    await api(`/api/admin/content/${encodeURIComponent(key)}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ valueAr: vals[key] || "", type: "text", section: "settings" }) });
    toast("✅ حُفظ — سيظهر في الموقع فوراً");
  };
  const g = SETTING_KEYS[group];
  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {SETTING_KEYS.map((s, i) => (
          <button key={s.group} style={i === group ? A.btn : A.btnGhost} onClick={() => setGroup(i)}>{s.group}</button>
        ))}
        <a href="/api/admin/export" style={{ ...A.btnGhost, textDecoration: "none", marginInlineStart: "auto" }}>⬇ تصدير نسخة احتياطية JSON</a>
      </div>
      <div style={A.card}>
        <h3>{g.group}</h3>
        <p style={{ color: "#888", fontSize: 13 }}>هذه القيم مصدر موحد — تغييرها يحدّث الموقع كله تلقائياً.</p>
        {g.items.map((it) => (
          <div key={it.key} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 10 }}>
            <div style={{ width: 200, fontSize: 14, fontWeight: 700, color: "#6650a0" }}>{it.label}</div>
            <input style={{ ...A.input, marginBottom: 0 }} value={vals[it.key] || ""} onChange={(e) => setVals({ ...vals, [it.key]: e.target.value })} />
            <button style={A.btn} onClick={() => saveKey(it.key)}>حفظ</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------- SEO panel ----------
const PAGE_PATHS = ["/", "/about", "/services", "/blog", "/book-now", "/contact-us"];

export function SeoPanel({ api }: { api: Api }) {
  const toast = useToast();
  const [rows, setRows] = useState<any[]>([]);
  const [sel, setSel] = useState("/");
  const [form, setForm] = useState<any>({});
  const load = async () => setRows(await api("/api/admin/seo"));
  useEffect(() => { load(); }, []);
  useEffect(() => {
    const cur = rows.find((r) => r.path === sel);
    setForm(cur || { titleAr: "", titleEn: "", descAr: "", descEn: "", ogImage: "", canonical: "", robots: "index,follow" });
  }, [sel, rows]);
  const save = async () => {
    await api(`/api/admin/seo${encodeURI(sel)}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    toast("✅ حُفظت وسوم SEO — تُحقن في HTML مباشرة");
    load();
  };
  const Counter = ({ v, max }: { v: string; max: number }) => (
    <span style={{ fontSize: 11, color: (v || "").length > max ? "#c00" : "#999" }}>{(v || "").length}/{max}</span>
  );
  return (
    <div style={A.card}>
      <h3>إعدادات SEO لكل صفحة</h3>
      <select style={{ ...A.input, maxWidth: 320 }} value={sel} onChange={(e) => setSel(e.target.value)}>
        {PAGE_PATHS.map((p) => <option key={p} value={p}>{p === "/" ? "الرئيسية" : p}</option>)}
      </select>
      <div style={{ marginTop: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#6650a0" }}>عنوان ميتا (عربي) <Counter v={form.titleAr} max={60} /></div>
        <input style={A.input} value={form.titleAr || ""} onChange={(e) => setForm({ ...form, titleAr: e.target.value })} />
        <div style={{ fontSize: 13, fontWeight: 700, color: "#6650a0" }}>Meta Title (EN) <Counter v={form.titleEn} max={60} /></div>
        <input style={A.input} dir="ltr" value={form.titleEn || ""} onChange={(e) => setForm({ ...form, titleEn: e.target.value })} />
        <div style={{ fontSize: 13, fontWeight: 700, color: "#6650a0" }}>وصف ميتا (عربي) <Counter v={form.descAr} max={160} /></div>
        <textarea style={{ ...A.input, minHeight: 70 }} value={form.descAr || ""} onChange={(e) => setForm({ ...form, descAr: e.target.value })} />
        <div style={{ fontSize: 13, fontWeight: 700, color: "#6650a0" }}>Meta Description (EN) <Counter v={form.descEn} max={160} /></div>
        <textarea style={{ ...A.input, minHeight: 70 }} dir="ltr" value={form.descEn || ""} onChange={(e) => setForm({ ...form, descEn: e.target.value })} />
        <div style={{ fontSize: 13, fontWeight: 700, color: "#6650a0" }}>صورة OG</div>
        <input style={A.input} value={form.ogImage || ""} onChange={(e) => setForm({ ...form, ogImage: e.target.value })} />
        <div style={{ fontSize: 13, fontWeight: 700, color: "#6650a0" }}>Canonical</div>
        <input style={A.input} dir="ltr" value={form.canonical || ""} onChange={(e) => setForm({ ...form, canonical: e.target.value })} />
        <div style={{ fontSize: 13, fontWeight: 700, color: "#6650a0" }}>Robots</div>
        <select style={A.input} value={form.robots || "index,follow"} onChange={(e) => setForm({ ...form, robots: e.target.value })}>
          <option value="index,follow">index, follow</option>
          <option value="noindex,follow">noindex, follow</option>
          <option value="noindex,nofollow">noindex, nofollow</option>
        </select>
        <button style={A.btn} onClick={save}>حفظ SEO</button>
      </div>
    </div>
  );
}

// ---------- Activity log ----------
export function ActivityPanel({ api }: { api: Api }) {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => { api("/api/admin/activity").then(setRows).catch(() => {}); }, []);
  return (
    <div style={A.card}>
      <h3>سجل النشاط</h3>
      {rows.length === 0 ? <Empty text="لا نشاط مسجل بعد." /> : rows.map((r) => (
        <div key={r.id} style={{ borderBottom: "1px solid #f0f0f0", padding: "8px 0", fontSize: 14 }}>
          <b>{r.action}</b> <span style={{ color: "#aaa", fontSize: 12 }}>{String(r.createdAt).replace("T", " ").slice(0, 16)}</span>
        </div>
      ))}
    </div>
  );
}

// ---------- Media library (upgraded: search, filter, delete) ----------
export function MediaPanel({ api, uploadMedia }: { api: Api; uploadMedia: (f: File) => Promise<void> }) {
  const toast = useToast();
  const [media, setMedia] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const load = async () => setMedia(await api("/api/admin/media"));
  useEffect(() => { load(); }, []);
  const del = async (m: any) => {
    if (!window.confirm(`حذف «${m.filename}»؟`)) return;
    await api(`/api/admin/media/${m.id}`, { method: "DELETE" });
    toast("تم الحذف"); load();
  };
  const filtered = media.filter((m) =>
    (!search || m.filename.toLowerCase().includes(search.toLowerCase())) &&
    (type === "all" || (m.mimeType || "").startsWith(type))
  );
  return (
    <div style={A.card}>
      <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
        <h3 style={{ margin: 0 }}>مكتبة الصور ({media.length})</h3>
        <div style={{ display: "flex", gap: 8 }}>
          <SearchBar value={search} onChange={setSearch} placeholder="بحث بالاسم…" />
          <select style={{ ...A.input, width: "auto", marginBottom: 0 }} value={type} onChange={(e) => setType(e.target.value)}>
            <option value="all">كل الأنواع</option><option value="image">صور</option><option value="video">فيديو</option>
          </select>
          <label style={{ ...A.btn, cursor: "pointer" }}>
            + رفع
            <input type="file" accept="image/*" style={{ display: "none" }} onChange={async (e) => { if (e.target.files?.[0]) { await uploadMedia(e.target.files[0]); await load(); } }} />
          </label>
        </div>
      </div>
      {filtered.length === 0 ? <Empty text="لا ملفات." /> : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))", gap: 12 }}>
          {filtered.map((m) => (
            <div key={m.id} style={{ border: "1px solid #eee", borderRadius: 8, padding: 8 }}>
              <img src={`/api/media/${m.id}`} style={{ width: "100%", borderRadius: 6 }} loading="lazy" />
              <div style={{ fontSize: 12, color: "#888", marginTop: 4, wordBreak: "break-all" }}>{m.filename}</div>
              <div style={{ fontSize: 11, color: "#aaa" }}>{m.size ? Math.round(Number(m.size) / 1024) + "KB" : ""} • {String(m.uploadedAt || "").slice(0, 10)}</div>
              <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                <button style={A.btnGhost} onClick={() => { navigator.clipboard?.writeText(`/api/media/${m.id}`); toast("نُسخ الرابط"); }}>نسخ الرابط</button>
                <button style={A.btnDanger} onClick={() => del(m)}>حذف</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------- Global search ----------
export function GlobalSearch({ api, onNavigate }: { api: Api; onNavigate: (tab: string) => void }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<any[]>([]);
  useEffect(() => {
    if (!q.trim()) { setResults([]); return; }
    const t = setTimeout(async () => {
      try { const r = await api(`/api/admin/search?q=${encodeURIComponent(q)}`); setResults(r.results || []); } catch {}
    }, 300);
    return () => clearTimeout(t);
  }, [q]);
  return (
    <div style={{ position: "relative", margin: "0 24px 16px" }}>
      <input style={{ ...A.search, maxWidth: "100%" }} placeholder="🔎 بحث شامل في كل المحتوى…" value={q} onChange={(e) => setQ(e.target.value)} />
      {results.length > 0 && (
        <div style={{ position: "absolute", top: "100%", right: 0, left: 0, background: "#fff", borderRadius: 10, boxShadow: "0 8px 30px rgba(0,0,0,.15)", zIndex: 500, maxHeight: 300, overflowY: "auto" }}>
          {results.map((r, i) => (
            <div key={i} style={{ padding: "10px 14px", borderBottom: "1px solid #f0f0f0", cursor: "pointer", fontSize: 14 }}
              onClick={() => { onNavigate(r.tab); setQ(""); setResults([]); }}>
              <span style={{ color: "#6650a0", fontWeight: 700, fontSize: 12 }}>{r.type}</span> — {r.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
