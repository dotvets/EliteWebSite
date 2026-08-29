// MyFatoorah integration — Test mode by default.
// Env: MYFATOORAH_API_KEY, MYFATOORAH_MODE ("test" | "live"), SITE_URL
// Saudi accounts must use the api-sa endpoint.
const BASE = () =>
  process.env.MYFATOORAH_MODE === "live"
    ? (process.env.MYFATOORAH_BASE_URL || "https://api-sa.myfatoorah.com")
    : "https://apitest.myfatoorah.com";

function configured() {
  return !!process.env.MYFATOORAH_API_KEY;
}

async function mf(path: string, body: any) {
  const res = await fetch(`${BASE()}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.MYFATOORAH_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  return res.json();
}

export async function createInvoice(opts: {
  bookingId: string;
  customerName: string;
  customerEmail?: string;
  phone?: string;
  amount: number;
  service?: string;
}) {
  if (!configured()) return { ok: false, reason: "myfatoorah_not_configured" };
  const site = process.env.SITE_URL || "https://www.elitevetksa.com";
  const payload = {
    CustomerName: opts.customerName,
    NotificationOption: "LNK",
    InvoiceValue: opts.amount,
    DisplayCurrencyIso: "SAR",
    CustomerEmail: opts.customerEmail || undefined,
    CustomerMobile: opts.phone || undefined,
    CallBackUrl: `${site}/api/payment/callback`,
    ErrorUrl: `${site}/api/payment/error`,
    Language: "ar",
    CustomerReference: opts.bookingId,
    UserDefinedField: opts.service || "Booking",
  };
  try {
    const r = await mf("/v2/SendPayment", payload);
    if (r?.IsSuccess) {
      return {
        ok: true,
        invoiceId: String(r.Data.InvoiceId),
        invoiceUrl: r.Data.InvoiceURL,
      };
    }
    return { ok: false, reason: r?.Message || "myfatoorah_error", raw: r?.ValidationErrors };
  } catch (err: any) {
    return { ok: false, reason: err?.message };
  }
}

export async function getPaymentStatus(paymentId: string) {
  if (!configured()) return { ok: false, reason: "myfatoorah_not_configured" };
  try {
    const r = await mf("/v2/getPaymentStatus", {
      Key: paymentId,
      KeyType: "PaymentId",
    });
    if (r?.IsSuccess) {
      return {
        ok: true,
        invoiceStatus: r.Data.InvoiceStatus, // Paid | Pending | Failed
        invoiceId: String(r.Data.InvoiceId),
        customerReference: r.Data.CustomerReference,
      };
    }
    return { ok: false, reason: r?.Message };
  } catch (err: any) {
    return { ok: false, reason: err?.message };
  }
}
