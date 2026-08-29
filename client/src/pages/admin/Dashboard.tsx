import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import ServicesPanel from "./ServicesPanel";

const S: Record<string, React.CSSProperties> = {
  wrap: { display: "flex", minHeight: "100vh", fontFamily: "sans-serif", background: "#f5f3fa", direction: "rtl" },
  side: { width: 220, background: "#6650a0", color: "#fff", padding: "24px 0", flexShrink: 0 },
  sideItem: { padding: "12px 24px", cursor: "pointer", fontSize: 15 },
  sideActive: { padding: "12px 24px", cursor: "pointer", fontSize: 15, background: "rgba(255,255,255,.18)", fontWeight: 700 },
  main: { flex: 1, padding: 32, overflowY: "auto" },
  card: { background: "#fff", borderRadius: 12, padding: 20, boxShadow: "0 2px 10px rgba(0,0,0,.06)", marginBottom: 16 },
  stat: { background: "#fff", borderRadius: 12, padding: 20, textAlign: "center", boxShadow: "0 2px 10px rgba(0,0,0,.06)" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 14 },
  th: { textAlign: "right", padding: 10, borderBottom: "2px solid #eee", color: "#6650a0" },
  td: { padding: 10, borderBottom: "1px solid #f0f0f0" },
  btn: { background: "#6650a0", color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", cursor: "pointer" },
  input: { width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ddd", marginBottom: 10, boxSizing: "border-box" },
};

const api = async (url: string, opts?: any) => {
  const r = await fetch(url, { credentials: "include", ...opts });
  if (r.status === 401) throw new Error("unauthorized");
  return r.json();
};


const payLabel = (s: string) => ({ paid: "مدفوع", pending: "بانتظار الدفع", failed: "فشل الدفع", cancelled: "ملغي", refunded: "مسترد", unpaid: "غير مدفوع" } as any)[s] || s;
const payBadge = (s: string): React.CSSProperties => {
  const colors: Record<string, [string, string]> = {
    paid: ["#e8f8ee", "#1a7f37"], pending: ["#fff7e0", "#8a6d00"], failed: ["#fdecec", "#c00"],
    cancelled: ["#f0f0f0", "#666"], refunded: ["#e0f0ff", "#1565c0"], unpaid: ["#f0f0f0", "#666"],
  };
  const [bg, fg] = colors[s] || ["#f0f0f0", "#666"];
  return { background: bg, color: fg, borderRadius: 6, padding: "2px 10px", fontSize: 12, fontWeight: 700 };
};

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const [tab, setTab] = useState("stats");
  const [stats, setStats] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [msgs, setMsgs] = useState<any[]>([]);
  const [content, setContent] = useState<any[]>([]);
  const [media, setMedia] = useState<any[]>([]);
  const [newKey, setNewKey] = useState({ key: "", valueAr: "", valueEn: "", section: "" });

  const load = async () => {
    try {
      const me = await api("/api/admin/me");
      if (!me.authenticated) return setLocation("/admin");
      setStats(await api("/api/admin/stats"));
      setBookings(await api("/api/admin/bookings"));
      setMsgs(await api("/api/admin/messages"));
      setContent(await api("/api/content"));
      setMedia(await api("/api/admin/media"));
    } catch {
      setLocation("/admin");
    }
  };
  useEffect(() => { load(); }, []);

  const setBookingStatus = async (id: string, status: string) => {
    await api(`/api/admin/bookings/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    load();
  };
  const markRead = async (id: string) => {
    await api(`/api/admin/messages/${id}/read`, { method: "PATCH" });
    load();
  };
  const saveContent = async (c: any) => {
    await api(`/api/admin/content/${encodeURIComponent(c.key)}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(c) });
    load();
  };
  const uploadMedia = async (file: File) => {
    const buf = await file.arrayBuffer();
    const dataBase64 = btoa(String.fromCharCode(...new Uint8Array(buf)));
    await api("/api/admin/media", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ filename: file.name, mimeType: file.type, dataBase64 }) });
    load();
  };
  const logout = async () => {
    await api("/api/admin/logout", { method: "POST" });
    setLocation("/admin");
  };

  const tabs: [string, string][] = [
    ["stats", "الرئيسية"], ["bookings", "الحجوزات"], ["services", "الخدمات"], ["messages", "الرسائل"],
    ["content", "محتوى الموقع"], ["media", "مكتبة الصور"],
  ];

  return (
    <div style={S.wrap}>
      <div style={S.side}>
        <h2 style={{ padding: "0 24px 20px", fontSize: 18 }}>🐾 لوحة النخبة</h2>
        {tabs.map(([k, label]) => (
          <div key={k} style={tab === k ? S.sideActive : S.sideItem} onClick={() => setTab(k)}>{label}</div>
        ))}
        <div style={{ ...S.sideItem, marginTop: 40, color: "#ffd" }} onClick={logout}>تسجيل خروج</div>
      </div>
      <div style={S.main}>
        {tab === "stats" && stats && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 16 }}>
            {[["إجمالي الحجوزات", stats.bookingsTotal], ["حجوزات جديدة", stats.bookingsNew], ["مدفوعة", stats.bookingsPaid], ["الرسائل", stats.messagesTotal], ["غير مقروءة", stats.messagesUnread]].map(([l, v]) => (
              <div key={String(l)} style={S.stat}><div style={{ fontSize: 32, fontWeight: 800, color: "#6650a0" }}>{String(v)}</div><div style={{ color: "#888" }}>{l}</div></div>
            ))}
          </div>
        )}

        {tab === "services" && <ServicesPanel api={api} />}

        {tab === "bookings" && (
          <div style={S.card}>
            <h3>الحجوزات ({bookings.length})</h3>
            <table style={S.table as any}>
              <thead><tr><th style={S.th}>الاسم</th><th style={S.th}>الجوال</th><th style={S.th}>الخدمة</th><th style={S.th}>السعر</th><th style={S.th}>الفرع</th><th style={S.th}>التاريخ</th><th style={S.th}>الدفع</th><th style={S.th}>مرجع الدفع</th><th style={S.th}>الحالة</th><th style={S.th}></th></tr></thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id}>
                    <td style={S.td}>{b.name}</td><td style={S.td}>{b.phone}</td><td style={S.td}>{b.service || "—"}</td>
                    <td style={S.td}>{b.amount ? `${b.amount} ريال` : "—"}</td><td style={S.td}>{b.branch || "—"}</td>
                    <td style={S.td}>{b.preferredDate || "—"}</td>
                    <td style={S.td}><span style={payBadge(b.paymentStatus)}>{payLabel(b.paymentStatus)}</span></td>
                    <td style={{ ...S.td, fontSize: 11, color: "#999" }}>{b.invoiceId ? `#${b.invoiceId}` : "—"}</td>
                    <td style={S.td}>{b.status}</td>
                    <td style={S.td}>
                      <select defaultValue={b.status} onChange={(e) => setBookingStatus(b.id, e.target.value)}>
                        {["new", "confirmed", "completed", "cancelled"].map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {bookings.length === 0 && <p style={{ color: "#888" }}>لا حجوزات بعد.</p>}
          </div>
        )}

        {tab === "messages" && (
          <div style={S.card}>
            <h3>الرسائل ({msgs.length})</h3>
            {msgs.map((m) => (
              <div key={m.id} style={{ ...S.card, background: m.isRead === "true" ? "#fafafa" : "#f3edff" }}>
                <b>{m.name}</b> — {m.phone || ""} {m.email || ""}
                <p>{m.body}</p>
                {m.isRead !== "true" && <button style={S.btn} onClick={() => markRead(m.id)}>تحديد كمقروءة</button>}
              </div>
            ))}
            {msgs.length === 0 && <p style={{ color: "#888" }}>لا رسائل بعد.</p>}
          </div>
        )}

        {tab === "content" && (
          <div style={S.card}>
            <h3>محتوى الموقع (نصوص قابلة للتعديل)</h3>
            {content.map((c) => (
              <div key={c.key} style={{ borderBottom: "1px solid #eee", padding: "12px 0" }}>
                <code style={{ color: "#6650a0" }}>{c.key}</code> <span style={{ color: "#aaa", fontSize: 12 }}>{c.section}</span>
                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  <input style={S.input} defaultValue={c.valueAr || ""} placeholder="النص بالعربية" onBlur={(e) => saveContent({ ...c, valueAr: e.target.value })} />
                  <input style={S.input} defaultValue={c.valueEn || ""} placeholder="English text" onBlur={(e) => saveContent({ ...c, valueEn: e.target.value })} />
                </div>
              </div>
            ))}
            <h4 style={{ marginTop: 24 }}>إضافة مفتاح جديد</h4>
            <input style={S.input} placeholder="المفتاح (مثال: home.hero.title)" value={newKey.key} onChange={(e) => setNewKey({ ...newKey, key: e.target.value })} />
            <input style={S.input} placeholder="النص بالعربية" value={newKey.valueAr} onChange={(e) => setNewKey({ ...newKey, valueAr: e.target.value })} />
            <input style={S.input} placeholder="English" value={newKey.valueEn} onChange={(e) => setNewKey({ ...newKey, valueEn: e.target.value })} />
            <input style={S.input} placeholder="القسم (home / services / footer…)" value={newKey.section} onChange={(e) => setNewKey({ ...newKey, section: e.target.value })} />
            <button style={S.btn} onClick={() => newKey.key && saveContent(newKey)}>حفظ</button>
          </div>
        )}

        {tab === "media" && (
          <div style={S.card}>
            <h3>مكتبة الصور ({media.length})</h3>
            <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && uploadMedia(e.target.files[0])} />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: 12, marginTop: 16 }}>
              {media.map((m) => (
                <div key={m.id} style={{ border: "1px solid #eee", borderRadius: 8, padding: 8 }}>
                  <img src={`/api/media/${m.id}`} style={{ width: "100%", borderRadius: 6 }} />
                  <div style={{ fontSize: 12, color: "#888", marginTop: 4, wordBreak: "break-all" }}>{m.filename}</div>
                  <code style={{ fontSize: 11 }}>/api/media/{m.id}</code>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
