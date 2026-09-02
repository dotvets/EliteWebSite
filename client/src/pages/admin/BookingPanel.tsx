import { useEffect, useState } from "react";
import { A, useToast } from "./ui";

type Api = (url: string, opts?: any) => Promise<any>;

/**
 * Booking Form Settings — lets the admin choose what renders on /book-now:
 *   internal → the site's built-in booking form (default, never removed)
 *   external → an external embed code (iframe / script widget) pasted below
 *
 * Stored as site-content keys so the public page picks changes up immediately:
 *   settings.bookingMode, settings.bookingEmbed
 */
export default function BookingPanel({ api }: { api: Api }) {
  const toast = useToast();
  const [mode, setMode] = useState<"internal" | "external">("internal");
  const [embed, setEmbed] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const rows = await api("/api/content");
        const get = (k: string) => rows.find((x: any) => x.key === k)?.valueAr ?? "";
        setMode(get("settings.bookingMode") === "external" ? "external" : "internal");
        setEmbed(get("settings.bookingEmbed"));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const saveKey = (key: string, value: string) =>
    api(`/api/admin/content/${encodeURIComponent(key)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ valueAr: value, valueEn: value, type: "text", section: "settings" }),
    });

  const save = async () => {
    if (mode === "external" && !embed.trim()) {
      toast("⚠️ اخترت «كود خارجي» لكن حقل الكود فارغ — أدخل الكود أو ارجع للفورم الداخلي", "err");
      return;
    }
    setSaving(true);
    try {
      await saveKey("settings.bookingMode", mode);
      await saveKey("settings.bookingEmbed", embed.trim());
      toast("✅ حُفظت إعدادات الحجز — صفحة Book Now تستخدمها مباشرة");
    } catch {
      toast("❌ فشل الحفظ — حاول مرة أخرى", "err");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={A.card}>جارٍ التحميل…</div>;

  return (
    <div style={A.card}>
      <h3>إعدادات نموذج الحجز (صفحة Book Now)</h3>
      <p style={{ color: "#888", fontSize: 13 }}>
        تحكّم في طريقة عرض الحجز: الفورم الداخلي الحالي يبقى كما هو ولا يُحذف — يمكنك التبديل بينه وبين كود Embed خارجي في أي وقت.
      </p>

      <div style={{ margin: "16px 0 8px", fontWeight: 700, color: "#6650a0" }}>طريقة عرض الحجز</div>
      <label style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 0", cursor: "pointer" }}>
        <input type="radio" name="bookingMode" checked={mode === "internal"} onChange={() => setMode("internal")} />
        <span>الفورم الداخلي الحالي <span style={{ color: "#1a7f37", fontSize: 12 }}>(الافتراضي)</span></span>
      </label>
      <label style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 0", cursor: "pointer" }}>
        <input type="radio" name="bookingMode" checked={mode === "external"} onChange={() => setMode("external")} />
        <span>كود Embed خارجي (iframe أو ودجت حجز)</span>
      </label>

      <div style={{ margin: "16px 0 8px", fontWeight: 700, color: "#6650a0" }}>كود الـ Embed الخارجي</div>
      <textarea
        style={{ ...A.input, minHeight: 140, fontFamily: "monospace", direction: "ltr", textAlign: "left", fontSize: 13 }}
        placeholder={'<iframe src="https://example.com/booking"></iframe>'}
        value={embed}
        onChange={(e) => setEmbed(e.target.value)}
        data-testid="input-booking-embed"
      />
      <p style={{ color: "#999", fontSize: 12 }}>
        ملاحظات أمان: يُسمح فقط بـ iframe وروابط سكربت https — تُزال أي أكواد JavaScript مضمّنة أو عناصر قد تغيّر محتوى الموقع تلقائيًا.
        {mode === "external" && !embed.trim() && (
          <span style={{ display: "block", color: "#b26a00", marginTop: 6 }}>
            ⚠️ الوضع الحالي «كود خارجي» والحقل فارغ — صفحة الحجز ستستمر بعرض الفورم الداخلي حتى تُدخل الكود.
          </span>
        )}
      </p>

      <button style={A.btn} onClick={save} disabled={saving} data-testid="button-save-booking-settings">
        {saving ? "جارٍ الحفظ…" : "حفظ الإعدادات"}
      </button>
    </div>
  );
}
