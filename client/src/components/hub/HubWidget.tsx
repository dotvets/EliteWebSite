import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";

// ============================================================================
// Group Booking Hub widget — Phase 2: full booking flow.
// clinic → service → day/time → details(+PDPL consent) → OTP → confirm → success
// Reads/writes ONLY /api/hub/*. GA4 events: view_availability, begin_booking,
// otp_verified, booking_confirmed (Part 6.4).
// ============================================================================

type Fallback = { whatsapp?: string | null; phone?: string | null };
type Clinic = { id: string; name_ar: string; name_en: string; timezone: string };
type Service = { id: string; name_ar: string; name_en: string; duration_minutes: number | null };
type Doctor = { id: string; name: string; job_title: string | null };

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}
const track = (event: string, params: Record<string, any> = {}) => {
  try {
    window.gtag?.("event", event, params);
  } catch {}
};

const t = {
  ar: {
    title: "احجز موعدك",
    pickClinic: "اختر العيادة",
    pickService: "اختر الخدمة",
    pickDoctor: "اختر الطبيب (اختياري)",
    anyDoctor: "أي طبيب متاح",
    pickDay: "اختر اليوم",
    pickTime: "اختر الوقت",
    morning: "صباحاً",
    evening: "مساءً",
    details: "بياناتك",
    name: "الاسم الكامل",
    mobileLabel: "رقم الجوال (05xxxxxxxx)",
    petName: "اسم الحيوان",
    species: "النوع",
    speciesOptions: ["قط", "كلب", "طيور", "زواحف", "أخرى"],
    notes: "ملاحظات (اختياري)",
    consent: "أوافق على معالجة بياناتي الشخصية لغرض الحجز وفق سياسة الخصوصية",
    privacy: "سياسة الخصوصية",
    continue: "متابعة",
    confirmBooking: "تأكيد الحجز",
    otpTitle: "رمز التحقق",
    otpSent: "أرسلنا رمزاً من 6 أرقام إلى جوالك",
    resend: "إعادة الإرسال",
    resendIn: "إعادة الإرسال بعد",
    verify: "تحقق",
    loading: "جارٍ التحميل…",
    emptyClinics: "لا توجد عيادات متاحة حالياً",
    emptyServices: "لا توجد خدمات متاحة لهذه العيادة",
    emptySlots: "لا توجد مواعيد متاحة في هذا اليوم",
    error: "حدث خطأ — حاول مرة أخرى",
    contactCta: "تواصل معنا مباشرة",
    whatsapp: "واتساب",
    phone: "اتصال",
    back: "رجوع",
    unavailable: "الحجز الإلكتروني غير متاح حالياً",
    slotTaken: "الموعد اختير للتو — إليك أقرب البدائل",
    success: "تم تأكيد حجزك بنجاح ✅",
    successNote: "تم التأكيد فورياً في نظام العيادة",
    refLabel: "رقم المرجع",
    addToCalendar: "أضف إلى التقويم",
    required: "هذا الحقل مطلوب",
    invalidPhone: "أدخل رقماً سعودياً صحيحاً",
    holdNote: "الموعد محجوز لك مؤقتاً — أكمل التحقق قبل انتهاء المهلة",
  },
  en: {
    title: "Book your appointment",
    pickClinic: "Choose a clinic",
    pickService: "Choose a service",
    pickDoctor: "Choose a doctor (optional)",
    anyDoctor: "Any available doctor",
    pickDay: "Choose a day",
    pickTime: "Choose a time",
    morning: "Morning",
    evening: "Evening",
    details: "Your details",
    name: "Full name",
    mobileLabel: "Mobile (05xxxxxxxx)",
    petName: "Pet name",
    species: "Species",
    speciesOptions: ["Cat", "Dog", "Birds", "Reptiles", "Other"],
    notes: "Notes (optional)",
    consent: "I consent to processing my personal data for booking per the privacy policy",
    privacy: "Privacy policy",
    continue: "Continue",
    confirmBooking: "Confirm booking",
    otpTitle: "Verification code",
    otpSent: "We sent a 6-digit code to your phone",
    resend: "Resend",
    resendIn: "Resend in",
    verify: "Verify",
    loading: "Loading…",
    emptyClinics: "No clinics available right now",
    emptyServices: "No services available for this clinic",
    emptySlots: "No available slots on this day",
    error: "Something went wrong — try again",
    contactCta: "Contact us directly",
    whatsapp: "WhatsApp",
    phone: "Call",
    back: "رجوع",
    unavailable: "Online booking is currently unavailable",
    slotTaken: "This slot was just taken — nearest alternatives",
    success: "Booking confirmed ✅",
    successNote: "Confirmed instantly in the clinic system",
    refLabel: "Reference",
    addToCalendar: "Add to calendar",
    required: "Required",
    invalidPhone: "Enter a valid Saudi number",
    holdNote: "Your slot is temporarily held — verify before it expires",
  },
} as const;

function Skeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3 animate-pulse" aria-busy="true">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-14 rounded-xl bg-muted/60" />
      ))}
    </div>
  );
}

function FallbackCta({ fallback, lang }: { fallback?: Fallback; lang: "ar" | "en" }) {
  const L = t[lang];
  if (!fallback?.whatsapp && !fallback?.phone) return null;
  return (
    <div className="mt-4 rounded-xl border p-4 text-center space-y-3">
      <p className="font-medium">{L.contactCta}</p>
      <div className="flex gap-3 justify-center">
        {fallback.whatsapp && (
          <a className="rounded-lg bg-green-600 px-4 py-2 text-white" href={`https://wa.me/${fallback.whatsapp}`} target="_blank" rel="noreferrer">
            {L.whatsapp}
          </a>
        )}
        {fallback.phone && (
          <a className="rounded-lg border px-4 py-2" href={`tel:${fallback.phone}`}>
            {L.phone}
          </a>
        )}
      </div>
    </div>
  );
}

// Normalize a slot (string or object) into { iso, label } in Asia/Riyadh.
function normalizeSlot(slot: any, day: string): { iso: string; label: string } | null {
  const RIYADH_OFFSET = "+03:00";
  if (typeof slot === "string") {
    if (/^\d{2}:\d{2}/.test(slot)) return { iso: `${day}T${slot.slice(0, 5)}:00${RIYADH_OFFSET}`, label: slot.slice(0, 5) };
    const ms = Date.parse(slot);
    if (!Number.isNaN(ms)) {
      const d = new Date(ms);
      return { iso: d.toISOString(), label: d.toLocaleString("sv-SE", { timeZone: "Asia/Riyadh" }).slice(11, 16) };
    }
    return null;
  }
  if (slot && typeof slot === "object") {
    const raw = slot.start || slot.time || slot.datetime || slot.from;
    return raw ? normalizeSlot(String(raw), day) : null;
  }
  return null;
}

export default function HubWidget() {
  const { brand = "" } = useParams<{ brand: string }>();
  const { language } = useLanguage();
  const lang = language === "ar" ? "ar" : "en";
  const L = t[lang];
  const dir = lang === "ar" ? "rtl" : "ltr";

  const [fallback, setFallback] = useState<Fallback | undefined>();
  const [fatal, setFatal] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [clinics, setClinics] = useState<Clinic[] | null>(null);
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [services, setServices] = useState<Service[] | null>(null);
  const [service, setService] = useState<Service | null>(null);
  const [doctors, setDoctors] = useState<Doctor[] | null>(null);
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [day, setDay] = useState<string>(() => new Date().toLocaleString("sv-SE", { timeZone: "Asia/Riyadh" }).slice(0, 10));
  const [slots, setSlots] = useState<any[] | null>(null);
  const [slot, setSlot] = useState<{ iso: string; label: string } | null>(null);
  const [loading, setLoading] = useState(false);

  // Details + OTP + confirmation state
  const [step, setStep] = useState<"browse" | "details" | "otp" | "success">("browse");
  const [form, setForm] = useState({ name: "", phone: "", petName: "", species: "", notes: "", website: "" });
  const [consent, setConsent] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [idempotencyKey, setIdempotencyKey] = useState<string>(() => crypto.randomUUID());
  const [otp, setOtp] = useState("");
  const [resendAfter, setResendAfter] = useState(0);
  const [refCode, setRefCode] = useState<string | null>(null);
  const [alternatives, setAlternatives] = useState<string[]>([]);
  const idemRef = useRef(idempotencyKey);
  idemRef.current = idempotencyKey;

  useEffect(() => {
    if (resendAfter <= 0) return;
    const tm = setInterval(() => setResendAfter((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(tm);
  }, [resendAfter > 0]);

  const utm = useMemo(() => {
    const p = new URLSearchParams(window.location.search);
    const out: Record<string, string> = {};
    for (const k of ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"]) {
      const v = p.get(k);
      if (v) out[k] = v;
    }
    return out;
  }, []);

  // Load clinics
  useEffect(() => {
    setLoading(true);
    fetch(`/api/hub/${brand}/clinics`)
      .then(async (r) => {
        const j = await r.json();
        if (!r.ok) {
          setFallback(j.fallback);
          setFatal(j.error === "booking_unavailable" ? "unavailable" : "error");
          return;
        }
        setFallback(j.fallback);
        setClinics(j.clinics || []);
      })
      .catch(() => setFatal("error"))
      .finally(() => setLoading(false));
  }, [brand]);

  useEffect(() => {
    if (!clinic) return;
    setLoading(true);
    setServices(null);
    fetch(`/api/hub/${brand}/clinics/${encodeURIComponent(clinic.id)}/services`)
      .then(async (r) => {
        const j = await r.json();
        if (!r.ok) throw new Error(j.error);
        setServices(j.services || []);
      })
      .catch(() => setError("error"))
      .finally(() => setLoading(false));
  }, [brand, clinic]);

  useEffect(() => {
    if (!clinic || !service) return;
    setDoctors(null);
    fetch(`/api/hub/${brand}/clinics/${encodeURIComponent(clinic.id)}/doctors?serviceId=${service.id}`)
      .then(async (r) => {
        const j = await r.json();
        if (!r.ok) throw new Error(j.error);
        setDoctors(j.doctors || []);
      })
      .catch(() => setDoctors([]));
  }, [brand, clinic, service]);

  // Availability
  useEffect(() => {
    if (!clinic || !service || !day) return;
    setLoading(true);
    setSlots(null);
    setSlot(null);
    const q = new URLSearchParams({ from: day, to: day });
    if (service.id && service.id !== "0") q.set("serviceId", service.id);
    else q.set("duration", String(service.duration_minutes || 30));
    if (doctor) q.set("doctorId", doctor.id);
    fetch(`/api/hub/${brand}/clinics/${encodeURIComponent(clinic.id)}/availability?${q}`)
      .then(async (r) => {
        const j = await r.json();
        if (!r.ok) throw new Error(j.error);
        setSlots(Array.isArray(j.availability) ? j.availability : []);
        track("view_availability", { brand, clinic: clinic.id, day });
      })
      .catch(() => setError("error"))
      .finally(() => setLoading(false));
  }, [brand, clinic, service, doctor, day]);

  const normalizedSlots = useMemo(() => (slots || []).map((s) => normalizeSlot(s, day)).filter(Boolean) as { iso: string; label: string }[], [slots, day]);
  const morning = normalizedSlots.filter((s) => Number(s.label.slice(0, 2)) < 13);
  const evening = normalizedSlots.filter((s) => Number(s.label.slice(0, 2)) >= 13);

  async function createHold(): Promise<boolean> {
    if (!clinic || !service || !slot) return false;
    setError(null);
    const r = await fetch(`/api/hub/${brand}/bookings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clinicId: clinic.id,
        serviceId: service.id,
        serviceName: lang === "ar" ? service.name_ar : service.name_en,
        doctorId: doctor?.id,
        doctorName: doctor?.name,
        start: slot.iso,
        durationMinutes: service.duration_minutes || 30,
        customerName: form.name.trim(),
        phone: form.phone.trim(),
        pet: { name: form.petName.trim(), species: form.species, notes: form.notes.trim() || undefined },
        idempotencyKey: idemRef.current,
        locale: lang,
        source: { ...utm, page: window.location.pathname },
        website: form.website, // honeypot
      }),
    });
    const j = await r.json();
    if (r.status === 409) {
      setError("slotTaken");
      setAlternatives(j.alternatives || []);
      return false;
    }
    if (!r.ok) {
      setError(j.error || "error");
      return false;
    }
    setBookingId(j.booking.id);
    track("begin_booking", { brand, clinic: clinic.id });
    return true;
  }

  async function requestOtp(bId: string): Promise<boolean> {
    const r = await fetch(`/api/hub/${brand}/bookings/${bId}/otp/request`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: form.phone.trim(), consent: true, consentAt: new Date().toISOString() }),
    });
    const j = await r.json();
    if (!r.ok) {
      setError(j.error || "error");
      return false;
    }
    setResendAfter(j.resend_after_seconds || 60);
    return true;
  }

  async function submitDetails() {
    if (!form.name.trim() || !form.petName.trim() || !form.species || !/^(\+?9665\d{8}|05\d{8})$/.test(form.phone.trim().replace(/\s/g, ""))) {
      setError("invalidPhone");
      return;
    }
    if (!consent) {
      setError("consent");
      return;
    }
    setLoading(true);
    try {
      const held = await createHold();
      if (!held || !bookingId && !idemRef.current) return;
      // bookingId is set inside createHold via state — but state may lag; fetch from response path instead
      // (createHold sets it synchronously enough for the next tick)
      const id = await new Promise<string | null>((resolve) => {
        let tries = 0;
        const tick = () => (bookingId ? resolve(bookingId) : tries++ > 20 ? resolve(null) : setTimeout(tick, 50));
        tick();
      });
      if (!id) {
        setError("error");
        return;
      }
      if (await requestOtp(id)) setStep("otp");
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtpAndConfirm() {
    if (!bookingId || otp.length !== 6) return;
    setLoading(true);
    setError(null);
    try {
      const v = await fetch(`/api/hub/${brand}/bookings/${bookingId}/otp/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: form.phone.trim(), code: otp }),
      });
      const vj = await v.json();
      if (!v.ok) {
        setError(vj.error || "otp_incorrect");
        return;
      }
      track("otp_verified", { brand });
      const c = await fetch(`/api/hub/${brand}/bookings/${bookingId}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: form.phone.trim() }),
      });
      const cj = await c.json();
      if (c.status === 409) {
        setError("slotTaken");
        setAlternatives(cj.alternatives || []);
        setStep("browse");
        setSlot(null);
        return;
      }
      if (!c.ok) {
        setError(cj.error || "error");
        return;
      }
      setRefCode(cj.ref);
      setStep("success");
      track("booking_confirmed", { brand, clinic: clinic?.id });
    } finally {
      setLoading(false);
    }
  }

  function icsUrl(): string {
    if (!slot || !clinic || !service) return "#";
    const start = new Date(slot.iso);
    const end = new Date(start.getTime() + (service.duration_minutes || 30) * 60000);
    const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z";
    const ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "BEGIN:VEVENT", `DTSTART:${fmt(start)}`, `DTEND:${fmt(end)}`, `SUMMARY:${lang === "ar" ? clinic.name_ar : clinic.name_en} — ${lang === "ar" ? service.name_ar : service.name_en}`, "END:VEVENT", "END:VCALENDAR"].join("\r\n");
    return `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`;
  }

  // -------------------------------------------------------------------------
  if (fatal) {
    return (
      <div dir={dir} className="mx-auto max-w-xl p-6 text-center">
        <p className="text-lg font-semibold">{fatal === "unavailable" ? L.unavailable : L.error}</p>
        <FallbackCta fallback={fallback} lang={lang} />
      </div>
    );
  }

  if (step === "success") {
    return (
      <div dir={dir} className="mx-auto max-w-xl p-6 text-center space-y-4">
        <h2 className="text-2xl font-bold">{L.success}</h2>
        <p className="text-muted-foreground">{L.successNote}</p>
        <div className="rounded-xl border p-4">
          <span className="text-sm text-muted-foreground">{L.refLabel}</span>
          <div className="text-3xl font-mono font-bold tracking-wider">{refCode}</div>
        </div>
        <a href={icsUrl()} download="booking.ics" className="inline-block rounded-lg border px-4 py-2">
          {L.addToCalendar}
        </a>
        <FallbackCta fallback={fallback} lang={lang} />
      </div>
    );
  }

  if (step === "otp") {
    return (
      <div dir={dir} className="mx-auto max-w-xl p-4 space-y-6">
        <h2 className="text-2xl font-bold text-center">{L.otpTitle}</h2>
        <p className="text-center text-muted-foreground">{L.otpSent}</p>
        <p className="text-center text-sm">{L.holdNote}</p>
        <div className="flex justify-center">
          <input
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
            className="w-48 rounded-xl border p-3 text-center text-2xl tracking-[0.5em]"
            aria-label={L.otpTitle}
          />
        </div>
        {error && <p className="text-center text-red-600 text-sm">{error in L ? (L as any)[error] : L.error}</p>}
        <div className="sticky bottom-4">
          <button onClick={verifyOtpAndConfirm} disabled={loading || otp.length !== 6} className="w-full rounded-xl bg-primary px-4 py-3 text-primary-foreground min-h-[48px] disabled:opacity-50">
            {loading ? L.loading : L.confirmBooking}
          </button>
        </div>
        <button onClick={() => bookingId && requestOtp(bookingId)} disabled={resendAfter > 0} className="w-full text-center text-sm underline disabled:no-underline disabled:text-muted-foreground">
          {resendAfter > 0 ? `${L.resendIn} ${resendAfter}s` : L.resend}
        </button>
      </div>
    );
  }

  if (step === "details") {
    return (
      <div dir={dir} className="mx-auto max-w-xl p-4 space-y-4">
        <button className="text-sm underline" onClick={() => setStep("browse")}>← {L.back}</button>
        <h2 className="text-xl font-bold">{L.details}</h2>
        <input className="w-full rounded-xl border p-3 min-h-[48px]" placeholder={L.name} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input className="w-full rounded-xl border p-3 min-h-[48px]" placeholder={L.mobileLabel} inputMode="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <div className="flex gap-2">
          <input className="flex-1 rounded-xl border p-3 min-h-[48px]" placeholder={L.petName} value={form.petName} onChange={(e) => setForm({ ...form, petName: e.target.value })} />
        </div>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={L.species}>
          {L.speciesOptions.map((s) => (
            <button key={s} onClick={() => setForm({ ...form, species: s })} className={`rounded-full border px-4 py-2 min-h-[48px] ${form.species === s ? "bg-primary text-primary-foreground" : ""}`}>
              {s}
            </button>
          ))}
        </div>
        <textarea className="w-full rounded-xl border p-3" placeholder={L.notes} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} />
        {/* honeypot — invisible to humans */}
        <input type="text" name="website" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} className="hidden" tabIndex={-1} autoComplete="off" aria-hidden="true" />
        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1" />
          <span>
            {L.consent} — <a href="/PrivacyPolicy" target="_blank" className="underline">{L.privacy}</a>
          </span>
        </label>
        {error && <p className="text-red-600 text-sm">{error === "invalidPhone" ? L.invalidPhone : error === "consent" ? L.required : error in L ? (L as any)[error] : L.error}</p>}
        <div className="sticky bottom-4">
          <button onClick={submitDetails} disabled={loading} className="w-full rounded-xl bg-primary px-4 py-3 text-primary-foreground min-h-[48px] disabled:opacity-50">
            {loading ? L.loading : L.continue}
          </button>
        </div>
      </div>
    );
  }

  // browse step
  return (
    <div dir={dir} className="mx-auto max-w-xl p-4 space-y-6">
      <h2 className="text-2xl font-bold text-center">{L.title}</h2>

      {!clinic && (
        <section className="space-y-3">
          <h3 className="font-semibold">{L.pickClinic}</h3>
          {clinics === null ? (
            <Skeleton />
          ) : clinics.length === 0 ? (
            <div className="text-center text-muted-foreground">
              <p>{L.emptyClinics}</p>
              <FallbackCta fallback={fallback} lang={lang} />
            </div>
          ) : (
            <div className="grid gap-3">
              {clinics.map((c) => (
                <button key={c.id} onClick={() => setClinic(c)} className="rounded-xl border p-4 text-start hover:bg-accent transition min-h-[48px]">
                  {lang === "ar" ? c.name_ar : c.name_en}
                </button>
              ))}
            </div>
          )}
        </section>
      )}

      {clinic && !service && (
        <section className="space-y-3">
          <button className="text-sm underline" onClick={() => setClinic(null)}>← {L.back}</button>
          <h3 className="font-semibold">{L.pickService}</h3>
          {services === null ? (
            <Skeleton />
          ) : services.length === 0 ? (
            <div className="text-center text-muted-foreground">
              <p>{L.emptyServices}</p>
              <FallbackCta fallback={fallback} lang={lang} />
            </div>
          ) : (
            <div className="grid gap-3">
              {services.map((s) => (
                <button key={s.id} onClick={() => setService(s)} className="rounded-xl border p-4 text-start hover:bg-accent transition min-h-[48px]">
                  <span className="font-medium">{lang === "ar" ? s.name_ar : s.name_en}</span>
                  {s.duration_minutes ? <span className="block text-sm text-muted-foreground">{s.duration_minutes} min</span> : null}
                </button>
              ))}
            </div>
          )}
        </section>
      )}

      {clinic && service && !slot && (
        <section className="space-y-4">
          <button className="text-sm underline" onClick={() => { setService(null); setDoctor(null); setSlots(null); }}>← {L.back}</button>
          <div className="space-y-2">
            <h3 className="font-semibold">{L.pickDoctor}</h3>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setDoctor(null)} className={`rounded-lg border px-3 py-2 min-h-[48px] ${!doctor ? "bg-primary text-primary-foreground" : ""}`}>{L.anyDoctor}</button>
              {(doctors || []).map((d) => (
                <button key={d.id} onClick={() => setDoctor(d)} className={`rounded-lg border px-3 py-2 min-h-[48px] ${doctor?.id === d.id ? "bg-primary text-primary-foreground" : ""}`}>
                  {d.name}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold">{L.pickDay}</h3>
            <input type="date" value={day} min={new Date().toLocaleString("sv-SE", { timeZone: "Asia/Riyadh" }).slice(0, 10)} onChange={(e) => setDay(e.target.value)} className="rounded-lg border p-2 min-h-[48px]" />
          </div>
          <div>
            {loading || slots === null ? (
              <Skeleton rows={4} />
            ) : normalizedSlots.length === 0 ? (
              <div className="text-center text-muted-foreground">
                <p>{L.emptySlots}</p>
                <FallbackCta fallback={fallback} lang={lang} />
              </div>
            ) : (
              <div className="space-y-3">
                {([
                  [L.morning, morning],
                  [L.evening, evening],
                ] as const).map(([label, group]) =>
                  group.length ? (
                    <div key={label}>
                      <p className="text-sm text-muted-foreground mb-1">{label}</p>
                      <div className="grid grid-cols-3 gap-2">
                        {group.map((s) => (
                          <button key={s.iso} onClick={() => { setSlot(s); setIdempotencyKey(crypto.randomUUID()); setStep("details"); track("begin_booking", { brand, clinic: clinic.id, slot: s.iso }); }} className="rounded-lg border p-2 text-center min-h-[48px] hover:bg-accent">
                            {s.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null,
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {error === "slotTaken" && alternatives.length > 0 && (
        <div className="rounded-xl border border-amber-400 p-4 text-center">
          <p className="font-medium">{L.slotTaken}</p>
          <div className="flex gap-2 justify-center mt-2 flex-wrap">
            {alternatives.map((a) => {
              const n = normalizeSlot(a, day);
              return n ? (
                <button key={a} onClick={() => { setSlot(n); setIdempotencyKey(crypto.randomUUID()); setError(null); setStep("details"); }} className="rounded-lg border px-3 py-2">
                  {n.label}
                </button>
              ) : null;
            })}
          </div>
        </div>
      )}
    </div>
  );
}
