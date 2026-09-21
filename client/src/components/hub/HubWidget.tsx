import { useEffect, useState } from "react";
import { useParams } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";

// ============================================================================
// Phase 1 (master document Parts 5.3 + 8): Group Booking Hub widget — READ-ONLY.
// Reads ONLY /api/hub/* endpoints. Booking writes arrive in Phase 2.
// Mandatory states: loading skeletons, empty states, error state with
// WhatsApp/phone fallback CTA (number from hub brand config, never hardcoded).
// ============================================================================

type Fallback = { whatsapp?: string | null; phone?: string | null };
type Clinic = { id: string; name_ar: string; name_en: string; timezone: string };
type Service = { id: string; name_ar: string; name_en: string; duration_minutes: number | null };
type Doctor = { id: string; name: string; job_title: string | null };

const t = {
  ar: {
    title: "احجز موعدك",
    pickClinic: "اختر العيادة",
    pickService: "اختر الخدمة",
    pickDoctor: "اختر الطبيب (اختياري)",
    anyDoctor: "أي طبيب متاح",
    pickDay: "اختر اليوم",
    loading: "جارٍ التحميل…",
    emptyClinics: "لا توجد عيادات متاحة حالياً",
    emptyServices: "لا توجد خدمات متاحة لهذه العيادة",
    emptySlots: "لا توجد مواعيد متاحة في هذا اليوم",
    error: "تعذر تحميل المواعيد الآن",
    contactCta: "تواصل معنا مباشرة",
    whatsapp: "واتساب",
    phone: "اتصال",
    back: "رجوع",
    unavailable: "الحجز الإلكتروني غير متاح حالياً",
  },
  en: {
    title: "Book your appointment",
    pickClinic: "Choose a clinic",
    pickService: "Choose a service",
    pickDoctor: "Choose a doctor (optional)",
    anyDoctor: "Any available doctor",
    pickDay: "Choose a day",
    loading: "Loading…",
    emptyClinics: "No clinics available right now",
    emptyServices: "No services available for this clinic",
    emptySlots: "No available slots on this day",
    error: "Could not load availability right now",
    contactCta: "Contact us directly",
    whatsapp: "WhatsApp",
    phone: "Call",
    back: "Back",
    unavailable: "Online booking is currently unavailable",
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

export default function HubWidget() {
  const { brand = "" } = useParams<{ brand: string }>();
  const { language } = useLanguage();
  const lang = language === "ar" ? "ar" : "en";
  const L = t[lang];

  const [fallback, setFallback] = useState<Fallback | undefined>();
  const [fatal, setFatal] = useState<string | null>(null);

  const [clinics, setClinics] = useState<Clinic[] | null>(null);
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [services, setServices] = useState<Service[] | null>(null);
  const [service, setService] = useState<Service | null>(null);
  const [doctors, setDoctors] = useState<Doctor[] | null>(null);
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [day, setDay] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [slots, setSlots] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);

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

  // Load services when clinic picked
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
      .catch(() => setFatal("error"))
      .finally(() => setLoading(false));
  }, [brand, clinic]);

  // Load doctors when service picked
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

  // Load availability when service + day chosen
  useEffect(() => {
    if (!clinic || !service || !day) return;
    setLoading(true);
    setSlots(null);
    const q = new URLSearchParams({ serviceId: service.id, from: day, to: day });
    if (doctor) q.set("doctorId", doctor.id);
    fetch(`/api/hub/${brand}/clinics/${encodeURIComponent(clinic.id)}/availability?${q}`)
      .then(async (r) => {
        const j = await r.json();
        if (!r.ok) throw new Error(j.error);
        setSlots(Array.isArray(j.availability) ? j.availability : []);
      })
      .catch(() => setFatal("error"))
      .finally(() => setLoading(false));
  }, [brand, clinic, service, doctor, day]);

  if (fatal) {
    return (
      <div dir={lang === "ar" ? "rtl" : "ltr"} className="mx-auto max-w-xl p-6 text-center">
        <p className="text-lg font-semibold">{fatal === "unavailable" ? L.unavailable : L.error}</p>
        <FallbackCta fallback={fallback} lang={lang} />
      </div>
    );
  }

  return (
    <div dir={lang === "ar" ? "rtl" : "ltr"} className="mx-auto max-w-xl p-4 space-y-6">
      <h2 className="text-2xl font-bold text-center">{L.title}</h2>

      {/* Step 1: clinic */}
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
                <button key={c.id} onClick={() => setClinic(c)} className="rounded-xl border p-4 text-start hover:bg-accent transition">
                  {lang === "ar" ? c.name_ar : c.name_en}
                </button>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Step 2: service */}
      {clinic && !service && (
        <section className="space-y-3">
          <button className="text-sm underline" onClick={() => setClinic(null)}>
            ← {L.back}
          </button>
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
                <button key={s.id} onClick={() => setService(s)} className="rounded-xl border p-4 text-start hover:bg-accent transition">
                  <span className="font-medium">{lang === "ar" ? s.name_ar : s.name_en}</span>
                  {s.duration_minutes ? <span className="block text-sm text-muted-foreground">{s.duration_minutes} min</span> : null}
                </button>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Step 3: doctor (optional) + day + slots */}
      {clinic && service && (
        <section className="space-y-4">
          <button
            className="text-sm underline"
            onClick={() => {
              setService(null);
              setDoctor(null);
              setSlots(null);
            }}
          >
            ← {L.back}
          </button>

          <div className="space-y-2">
            <h3 className="font-semibold">{L.pickDoctor}</h3>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setDoctor(null)} className={`rounded-lg border px-3 py-2 ${!doctor ? "bg-primary text-primary-foreground" : ""}`}>
                {L.anyDoctor}
              </button>
              {(doctors || []).map((d) => (
                <button
                  key={d.id}
                  onClick={() => setDoctor(d)}
                  className={`rounded-lg border px-3 py-2 ${doctor?.id === d.id ? "bg-primary text-primary-foreground" : ""}`}
                >
                  {d.name}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">{L.pickDay}</h3>
            <input type="date" value={day} min={new Date().toISOString().slice(0, 10)} onChange={(e) => setDay(e.target.value)} className="rounded-lg border p-2" />
          </div>

          <div>
            {loading || slots === null ? (
              <Skeleton rows={4} />
            ) : slots.length === 0 ? (
              <div className="text-center text-muted-foreground">
                <p>{L.emptySlots}</p>
                <FallbackCta fallback={fallback} lang={lang} />
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {slots.map((slot: any, i: number) => (
                  <div key={i} className="rounded-lg border p-2 text-center text-sm">
                    {typeof slot === "string" ? slot : slot.time || slot.start || JSON.stringify(slot)}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
