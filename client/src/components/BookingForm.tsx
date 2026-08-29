import { useState } from "react";

const SERVICES = ["فحص عام", "لقاحات", "جراحة", "أسنان", "أشعة مقطعية CT", "مختبر وتحاليل", "طوارئ", "طيور وزواحف", "أخرى"];
const BRANCHES = ["الرياض — قرطبة", "جدة — الحمراء (قريباً)"];

const inp: React.CSSProperties = { width: "100%", padding: 12, borderRadius: 10, border: "1px solid #ddd", marginBottom: 12, boxSizing: "border-box", fontSize: 15 };

export default function BookingForm() {
  const [form, setForm] = useState({ name: "", phone: "", email: "", petType: "", service: "", branch: BRANCHES[0], preferredDate: "", notes: "", amount: "" });
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [invoiceUrl, setInvoiceUrl] = useState<string | null>(null);
  const params = new URLSearchParams(window.location.search);
  const paymentResult = params.get("payment");

  const set = (k: string) => (e: any) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("loading");
    try {
      const r = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, amount: form.amount ? Number(form.amount) : undefined }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setInvoiceUrl(d.invoiceUrl);
      setState("done");
    } catch {
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
      <p style={{ color: "#888", fontSize: 14, marginBottom: 20 }}>عبّئ البيانات وسنؤكد موعدك — الدفع اختياري.</p>

      {paymentResult === "success" && <p style={{ background: "#e8f8ee", color: "#1a7f37", padding: 10, borderRadius: 8 }}>تمت عملية الدفع بنجاح ✅</p>}
      {paymentResult === "failed" && <p style={{ background: "#fdecec", color: "#c00", padding: 10, borderRadius: 8 }}>فشلت عملية الدفع — يمكنك المحاولة مجدداً.</p>}

      <input style={inp} placeholder="الاسم الكامل *" value={form.name} onChange={set("name")} required />
      <input style={inp} placeholder="رقم الجوال *" value={form.phone} onChange={set("phone")} required />
      <input style={inp} type="email" placeholder="البريد الإلكتروني" value={form.email} onChange={set("email")} />
      <div style={{ display: "flex", gap: 10 }}>
        <select style={{ ...inp, flex: 1 }} value={form.petType} onChange={set("petType")}>
          <option value="">نوع الحيوان</option>
          {["قط", "كلب", "طائر", "زاحف", "أخرى"].map((p) => <option key={p}>{p}</option>)}
        </select>
        <select style={{ ...inp, flex: 1 }} value={form.service} onChange={set("service")}>
          <option value="">الخدمة المطلوبة</option>
          {SERVICES.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>
      <select style={inp} value={form.branch} onChange={set("branch")}>
        {BRANCHES.map((b) => <option key={b}>{b}</option>)}
      </select>
      <input style={inp} type="date" value={form.preferredDate} onChange={set("preferredDate")} />
      <textarea style={{ ...inp, minHeight: 80 }} placeholder="ملاحظات إضافية" value={form.notes} onChange={set("notes")} />
      <input style={inp} type="number" min="0" placeholder="مبلغ الدفع المسبق (اختياري — ريال)" value={form.amount} onChange={set("amount")} />

      {state === "error" && <p style={{ color: "#c00", marginBottom: 10 }}>حدث خطأ — حاول مرة أخرى أو اتصل بنا.</p>}
      <button disabled={state === "loading"} style={{ width: "100%", padding: 14, background: "#6650a0", color: "#fff", border: "none", borderRadius: 10, fontSize: 17, fontWeight: 700, cursor: "pointer" }}>
        {state === "loading" ? "جارٍ الإرسال…" : "تأكيد الحجز"}
      </button>
    </form>
  );
}
