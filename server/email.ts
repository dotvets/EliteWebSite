import nodemailer from "nodemailer";

// Email notifications via SMTP (env-configurable).
// Required env: SMTP_HOST, SMTP_PORT, SMTP_USER, NOTIFY_EMAIL
// Auth: SMTP_PASS (basic) OR the existing Microsoft 365 OAuth2
// client-credentials app (M365_TENANT_ID/M365_CLIENT_ID/M365_CLIENT_SECRET)
// — the same configuration proven against smtp.office365.com. No new app,
// no new credentials, sender stays SMTP_USER.
// Until configured, emails are skipped gracefully and logged.

// Acquires an M365 access token for SMTP AUTH (XOAUTH2). Never logs the
// token or any secret; failures return null so callers fall back safely.
async function getM365AccessToken(): Promise<string | null> {
  const { M365_TENANT_ID, M365_CLIENT_ID, M365_CLIENT_SECRET } = process.env;
  if (!M365_TENANT_ID || !M365_CLIENT_ID || !M365_CLIENT_SECRET) return null;
  try {
    const r = await fetch(
      `https://login.microsoftonline.com/${encodeURIComponent(M365_TENANT_ID)}/oauth2/v2.0/token`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: M365_CLIENT_ID,
          client_secret: M365_CLIENT_SECRET,
          scope: "https://outlook.office365.com/.default",
          grant_type: "client_credentials",
        }).toString(),
      },
    );
    if (!r.ok) return null;
    const j: any = await r.json();
    return typeof j?.access_token === "string" ? j.access_token : null;
  } catch {
    return null;
  }
}

export async function sendNotification(subject: string, html: string) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, NOTIFY_EMAIL } =
    process.env;
  if (!SMTP_HOST || !SMTP_USER || !NOTIFY_EMAIL) {
    console.log("[email] SMTP not configured — skipping:", subject);
    return { sent: false, reason: "smtp_not_configured" };
  }
  let auth:
    | { user: string; pass: string }
    | { type: "OAuth2"; user: string; accessToken: string };
  if (SMTP_PASS) {
    auth = { user: SMTP_USER, pass: SMTP_PASS };
  } else {
    const accessToken = await getM365AccessToken();
    if (!accessToken) {
      console.log(
        "[email] no SMTP_PASS and M365 OAuth2 token unavailable — skipping:",
        subject,
      );
      return { sent: false, reason: "smtp_auth_unavailable" };
    }
    auth = { type: "OAuth2", user: SMTP_USER, accessToken };
  }
  try {
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT || 465),
      secure: Number(SMTP_PORT || 465) === 465,
      auth,
    });
    const info = await transporter.sendMail({
      from: `"Elite Vet Website" <${SMTP_USER}>`,
      to: NOTIFY_EMAIL,
      subject,
      html,
    });
    return {
      sent: true,
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected,
    };
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
