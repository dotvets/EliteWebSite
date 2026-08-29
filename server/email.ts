import nodemailer from "nodemailer";

// Email notifications via SMTP (env-configurable).
// Required env: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, NOTIFY_EMAIL
// Until configured, emails are skipped gracefully and logged.

export async function sendNotification(subject: string, html: string) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, NOTIFY_EMAIL } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !NOTIFY_EMAIL) {
    console.log("[email] SMTP not configured — skipping:", subject);
    return { sent: false, reason: "smtp_not_configured" };
  }
  try {
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT || 465),
      secure: Number(SMTP_PORT || 465) === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
    await transporter.sendMail({
      from: `"Elite Vet Website" <${SMTP_USER}>`,
      to: NOTIFY_EMAIL,
      subject,
      html,
    });
    return { sent: true };
  } catch (err: any) {
    console.error("[email] send failed:", err?.message);
    return { sent: false, reason: err?.message };
  }
}

export function bookingEmailHtml(b: any) {
  return `<div dir="rtl" style="font-family:sans-serif">
    <h2>حجز جديد — النخبة البيطرية</h2>
    <table cellpadding="6" style="border-collapse:collapse">
      <tr><td><b>الاسم</b></td><td>${b.name}</td></tr>
      <tr><td><b>الجوال</b></td><td>${b.phone}</td></tr>
      <tr><td><b>البريد</b></td><td>${b.email || "—"}</td></tr>
      <tr><td><b>نوع الحيوان</b></td><td>${b.petType || "—"}</td></tr>
      <tr><td><b>الخدمة</b></td><td>${b.service || "—"}</td></tr>
      <tr><td><b>الفرع</b></td><td>${b.branch || "—"}</td></tr>
      <tr><td><b>التاريخ المفضل</b></td><td>${b.preferredDate || "—"}</td></tr>
      <tr><td><b>ملاحظات</b></td><td>${b.notes || "—"}</td></tr>
      <tr><td><b>حالة الدفع</b></td><td>${b.paymentStatus}</td></tr>
    </table>
  </div>`;
}
