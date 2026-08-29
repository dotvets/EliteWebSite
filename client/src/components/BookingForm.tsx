import { useEffect, useState } from "react";

const BRANCHES = ["الرياض — قرطبة", "جدة — الحمراء (قريباً)"];

const inp: React.CSSProperties = { width: "100%", padding: 12, borderRadius: 10, border: "1px solid #ddd", marginBottom: 12, boxSizing: "border-box", fontSize: 15 };

type Service = { id: string; nameAr: string; nameEn: string; price: string; currency: string };

export default function BookingForm() {
  const [services, setServices] = useState<Service[]>([]);
  const [servicesError, setServicesError] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "", petType: "", serviceId: "", branch: BRANCHES[0], preferredDate: "", notes: "" });
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [invoiceUrl, setInvoiceUrl] = useState<string | null>(null);
  const params = new URLSearchParams(window.location.search);
  const paymentResult = params.get("payment");
  const paidBooking = params.get("booking");

  useEffect(() => {
    fetch("/api/services")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((rows: Service[]) => setServices(rows))
      .catch(() => setServicesError(true));
  }, []);

  const selected = services.find((s) => s.id === form.serviceId) || null;

  const set = (k: string) => (e: any) => setForm({ ...form, [k]: e.target.value });

  const retryPayment = async () => {
    if (!paidBooking) return;
    try {
      const r = await fetch(`/api/bookings/${paidBooking}/pay`, { method: "POST" });
      const d = await r.json();
      if (r.ok && d.invoiceUrl) window.location.href = d.invoiceUrl;
    } catch { /* ignore */ }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("loading");
    setErrorMsg("");
    try {
      const r = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error === "invalid_service" || d.error === "inactive_service" ? "الخدمة المختارة غير متاحة — اختر خدمة أخرى" : "submit_failed");
      if (d.invoiceUrl) {
        // proceed to payment immediately
        window.location.href = d.invoiceUrl;
        return;
      }
      setState("done");
    } catch (err: any) {
      setErrorMsg(err?.message === "submit_failed" ? "حدث خطأ — حاول مرة أخرى أو اتصل بنا." : err?.message);
      setState("error");
    }
  };

  if (state === "done") {
    return (
      <div dir="rtl" style={{ background: "#f3edff", borderRadius: 16, padding: 32, textAlign: "center" }}>
        <h3 style={{ color: "#6650a0" }}>✅ تم استلام حجزك بنجاح</h3>
        <p>سيتواصل معك فريق النخبة لتأكيد الموعد على الرقم 920011626.</p>
        {invoiceUrl && (
          <a href={invoiceUrl} style={{ display: "inline-block", marginTop: 12, background: "#6650a0", color: "#fff", padding: "12px 28px", borderRadius: 10, textDecoration: "none", fontWeight: 700 }}>
            إتمام الدفع الآن عبر MyFatoorah
          </a>
        )}
      </div>
    );
  }

  return (
    <form dir="rtl" onSubmit={submit} style={{ background: "#fff", borderRadius: 16, padding: 28, boxShadow: "0 4px 24px rgba(0,0,0,.08)", maxWidth: 560, margin: "0 auto" }}>
      <h3 style={{ color: "#6650a0", marginBottom: 4 }}>احجز موعدك إلكترونياً</h3>
      <p style={{ color: "#888", fontSize: 14, marginBottom: 20 }}>عبّئ البيانات واختر الخدمة — السعر يظهر تلقائياً.</p>

      {paymentResult === "success" && (
        <div style={{ background: "#e8f8ee", color: "#1a7f37", padding: 14, borderRadius: 8, marginBottom: 12 }}>
          <b>تم الدفع بنجاح ✅</b>
          {paidBooking && <div style={{ fontSize: 13, marginTop: 4 }}>رقم الحجز: <code>{paidBooking}</code></div>}
        </div>
      )}
      {paymentResult === "failed" && (
        <div style={{ background: "#fdecec", color: "#c00", padding: 14, borderRadius: 8, marginBottom: 12 }}>
          <b>لم تتم عملية الدفع</b>
          {paidBooking && (
            <button type="button" onClick={retryPayment} style={{ display: "block", marginTop: 8, background: "#c00", color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", cursor: "pointer" }}>
              إعادة محاولة الدفع
            </button>
          )}
        </div>
      )}
      {paymentResult === "pending" && (
        <div style={{ background: "#fff7e0", color: "#8a6d00", padding: 14, borderRadius: 8, marginBottom: 12 }}>
          <b>الدفع قيد الانتظار / تم الإلغاء</b> — لم يُسجَّل الحجز كمدفوع. يمكنك إعادة المحاولة.
          {paidBooking && (
            <button type="button" onClick={retryPayment} style={{ display: "block", marginTop: 8, background: "#8a6d00", color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", cursor: "pointer" }}>
              إتمام الدفع
            </button>
          )}
        </div>
      )}

      <input style={inp} placeholder="الاسم الكامل *" value={form.name} onChange={set("name")} required />
      <input style={inp} placeholder="رقم الجوال *" value={form.phone} onChange={set("phone")} required />
      <input style={inp} type="email" placeholder="البريد الإلكتروني" value={form.email} onChange={set("email")} />
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <select style={{ ...inp, flex: 1, minWidth: 140 }} value={form.petType} onChange={set("petType")}>
          <option value="">نوع الحيوان</option>
          {["قط", "كلب", "طائر", "زاحف", "أخرى"].map((p) => <option key={p}>{p}</option>)}
        </select>
        <select style={{ ...inp, flex: 1, minWidth: 140 }} value={form.serviceId} onChange={set("serviceId")} required>
          <option value="">الخدمة المطلوبة *</option>
          {services.map((s) => <option key={s.id} value={s.id}>{s.nameAr} — {s.nameEn}</option>)}
        </select>
      </div>
      {services.length === 0 && !servicesError && <p style={{ color: "#888", fontSize: 13 }}>جارٍ تحميل الخدمات…</p>}
      {servicesError && <p style={{ color: "#c00", fontSize: 13 }}>تعذّر تحميل قائمة الخدمات — حدّث الصفحة أو اتصل بنا.</p>}

      {selected && (
        <div style={{ background: "#f3edff", border: "1px solid #d9ccf5", borderRadius: 10, padding: "12px 16px", marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ color: "#6650a0", fontWeight: 700 }}>{selected.nameAr}</span>
          <span style={{ color: "#333", fontWeight: 800, fontSize: 17 }}>{selected.price} {selected.currency === "SAR" ? "ريال" : selected.currency}</span>
        </div>
      )}

      <select style={inp} value={form.branch} onChange={set("branch")}>
        {BRANCHES.map((b) => <option key={b}>{b}</option>)}
      </select>
      <input style={inp} type="date" value={form.preferredDate} onChange={set("preferredDate")} />
      <textarea style={{ ...inp, minHeight: 80 }} placeholder="ملاحظات إضافية" value={form.notes} onChange={set("notes")} />

      {state === "error" && <p style={{ color: "#c00", marginBottom: 10 }}>{errorMsg || "حدث خطأ — حاول مرة أخرى أو اتصل بنا."}</p>}
      <button disabled={state === "loading" || !form.serviceId} style={{ width: "100%", padding: 14, background: "#6650a0", color: "#fff", border: "none", borderRadius: 10, fontSize: 17, fontWeight: 700, cursor: "pointer", opacity: state === "loading" || !form.serviceId ? 0.6 : 1 }}>
        {state === "loading" ? "جارٍ التحويل للدفع…" : selected ? `تأكيد الحجز والدفع — ${selected.price} ${selected.currency === "SAR" ? "ريال" : selected.currency}` : "تأكيد الحجز والدفع"}
      </button>
      <p style={{ color: "#aaa", fontSize: 12, marginTop: 8, textAlign: "center" }}>الدفع آمن عبر MyFatoorah — السعر يُحسب من النظام ولا يمكن تعديله.</p>
    </form>
  );
}
