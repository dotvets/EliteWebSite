import { useEffect, useState } from "react";

/**
 * Site image overrides — managed from the admin dashboard (Website Images).
 * Overrides are stored in site_content rows with type="image" and key "img.*",
 * valueAr holds the URL (typically /api/media/:id). Falls back to bundled asset.
 */
let overrides: Record<string, string> = {};
let loaded = false;
let loading: Promise<void> | null = null;

async function fetchOverrides(): Promise<void> {
  try {
    const rows: any[] = await fetch("/api/content").then((r) => r.json());
    overrides = Object.fromEntries(
      rows
        .filter((r) => r.type === "image" && typeof r.key === "string" && r.key.startsWith("img.") && r.valueAr)
        .map((r) => [r.key, r.valueAr])
    );
  } catch {
    // keep bundled defaults on any failure
  }
  loaded = true;
}

/** Resolve an image key to its override URL, or the bundled fallback. */
export function siteImage(key: string, fallback: string): string {
  const v = overrides[key];
  // guard against corrupted rows (e.g. "/api/media/undefined") — always fall back safely
  if (!v || typeof v !== "string" || v.includes("undefined")) return fallback;
  if (!/^(https?:\/\/|\/|data:image\/)/.test(v)) return fallback;
  return v;
}

/** Call once near the app root: loads overrides and re-renders when ready. */
export function useSiteImageOverrides(): void {
  const [, setVersion] = useState(0);
  useEffect(() => {
    if (!loading) loading = fetchOverrides();
    if (!loaded) loading.then(() => setVersion((v) => v + 1));
  }, []);
}

export const SITE_IMAGE_SECTIONS = [
  { id: "header", label: "الهيدر / Header" },
  { id: "hero", label: "الواجهة الرئيسية / Hero" },
  { id: "home", label: "الرئيسية / Home" },
  { id: "partners", label: "الشركاء / Partners" },
  { id: "about", label: "من نحن / About" },
  { id: "services", label: "الخدمات / Services" },
  { id: "doctors", label: "الأطباء / Doctors" },
  { id: "blog", label: "المدونة / Blog" },
  { id: "footer", label: "الفوتر / Footer" },
] as const;

export interface SiteImageEntry {
  key: string;
  section: (typeof SITE_IMAGE_SECTIONS)[number]["id"];
  label: string;
}

/** Registry of every replaceable site image (defaults stay bundled). */
export const SITE_IMAGES: SiteImageEntry[] = [
  { key: "img.header.logo", section: "header", label: "شعار الهيدر" },
  { key: "img.footer.logo", section: "footer", label: "شعار الفوتر" },
  { key: "img.hero.slide1", section: "hero", label: "سلايدر الواجهة 1" },
  { key: "img.hero.slide2", section: "hero", label: "سلايدر الواجهة 2" },
  { key: "img.hero.slide3", section: "hero", label: "سلايدر الواجهة 3" },
  { key: "img.home.intro", section: "home", label: "صورة المقدمة (الرئيسية)" },
  { key: "img.partners.vetsvan", section: "partners", label: "شعار شريك VetsVan" },
  { key: "img.partners.wadiqortuba", section: "partners", label: "شعار شريك Wadi Qortuba" },
  { key: "img.partners.walaaaplus", section: "partners", label: "شعار شريك Walaaa Plus" },
  { key: "img.partners.wazen", section: "partners", label: "شعار شريك Wazen" },
  { key: "img.about.hero", section: "about", label: "واجهة صفحة من نحن" },
  { key: "img.about.reception", section: "about", label: "استقبال العيادة" },
  { key: "img.about.vetwithdog", section: "about", label: "طبيب مع كلب (Mission)" },
  { key: "img.about.vetteam", section: "about", label: "فريق الأطباء" },
  { key: "img.about.community", section: "about", label: "خدمة المجتمع" },
  { key: "img.about.surgical", section: "about", label: "الفريق الجراحي" },
  { key: "img.about.career", section: "about", label: "التطوير المهني" },
  { key: "img.services.herobg", section: "services", label: "خلفية صفحة الخدمات" },
  { key: "img.services.medical", section: "services", label: "التخصصات الطبية" },
  { key: "img.services.surgery", section: "services", label: "الجراحة" },
  { key: "img.services.diagnostic", section: "services", label: "التشخيص والمختبر" },
  { key: "img.doctors.drkhaled", section: "doctors", label: "د. خالد أبو الناصر" },
  { key: "img.doctors.dranas", section: "doctors", label: "د. أنس الشوبكي" },
  { key: "img.doctors.drahmedmounir", section: "doctors", label: "د. أحمد منير" },
  { key: "img.doctors.drshoaib", section: "doctors", label: "د. شعيب حسنين" },
  { key: "img.doctors.dressam", section: "doctors", label: "د. عصام المنشاوي" },
  { key: "img.blog.photo1", section: "blog", label: "صورة المدونة 1" },
  { key: "img.blog.photo2", section: "blog", label: "صورة المدونة 2" },
  { key: "img.blog.photo3", section: "blog", label: "صورة المدونة 3" },
  { key: "img.blog.photo4", section: "blog", label: "صورة المدونة 4" },
];
