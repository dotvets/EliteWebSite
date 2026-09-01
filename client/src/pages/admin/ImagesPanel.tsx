import { useEffect, useRef, useState } from "react";
import { A, Empty, SearchBar, useToast } from "./ui";
import { SITE_IMAGES, SITE_IMAGE_SECTIONS } from "@/lib/siteImages";

import logoHeader from "@assets/Elite final logo_1761818487960.jpg";
import logoFooter from "@assets/Elite final logo_1762859223489.jpg";
import heroSlide1 from "@assets/generated_images/Veterinarian_examining_golden_retriever_66fcde95.png";
import heroSlide2 from "@assets/freepik__img1i-want-you-to-make-the-attached-image-more-bea__64912_1762857524224.png";
import heroSlide3 from "@assets/generated_images/Happy_pet_owner_with_cat_0ee67349.png";
import homeIntro from "@assets/generated_images/Veterinarian_holding_small_dog_1111faba.png";
import partnerVetsvan from "@assets/Partners_vetsvan_1764085956349.png";
import partnerWadi from "@assets/Partners_wadi qourtobah_1764085956355.jpg";
import partnerWalaaa from "@assets/Partners_walaaa plus_1764085956356.png";
import partnerWazen from "@assets/Partners_wazen_1764085956358.jpg";
import aboutHero from "@assets/freepik__img1i-want-you-to-make-the-attached-image-more-bea__64912_1762857524224.png";
import aboutReception from "@assets/freepik__clarify-attachment-photo-img1-increase-clarity-and__22061_1763027414442.png";
import aboutVetDog from "@assets/Mission Section_1763032965994.png";
import aboutTeam from "@assets/Why Choose Elite Vet Section_1763032965996.png";
import aboutCommunity from "@assets/generated_images/Veterinarian_community_service_animals_52a0c7de.png";
import aboutSurgical from "@assets/generated_images/Veterinary_surgical_team_operation_82668a9f.png";
import aboutCareer from "@assets/generated_images/Veterinarian_professional_development_learning_3d5bf9be.png";
import servicesHeroBg from "@assets/freepik__img1-make-background-fully-white-remove-shadows-re__83842_1763051566185.png";
import servicesMedical from "@assets/stock_images/veterinarian_examini_bffcd340.jpg";
import servicesSurgery from "@assets/stock_images/veterinary_surgery_o_7559b1f2.jpg";
import servicesDiagnostic from "@assets/stock_images/veterinary_diagnosti_473733b0.jpg";
import drKhaled from "@assets/dr-khaled-abu-elnasser.png";
import drAnas from "@assets/dr-anas-shobaki.png";
import drAhmed from "@assets/dr-ahmed-mounir.png";
import drShoaib from "@assets/dr-shoaib-husnain.png";
import drEssam from "@assets/dr-essam-elmenshawy.png";
import blog1 from "@assets/Blog_photo1.png";
import blog2 from "@assets/Blog_photo2.png";
import blog3 from "@assets/Blog_photo3.png";
import blog4 from "@assets/Blog_photo4.png";

const DEFAULTS: Record<string, string> = {
  "img.header.logo": logoHeader,
  "img.footer.logo": logoFooter,
  "img.hero.slide1": heroSlide1,
  "img.hero.slide2": heroSlide2,
  "img.hero.slide3": heroSlide3,
  "img.home.intro": homeIntro,
  "img.partners.vetsvan": partnerVetsvan,
  "img.partners.wadiqortuba": partnerWadi,
  "img.partners.walaaaplus": partnerWalaaa,
  "img.partners.wazen": partnerWazen,
  "img.about.hero": aboutHero,
  "img.about.reception": aboutReception,
  "img.about.vetwithdog": aboutVetDog,
  "img.about.vetteam": aboutTeam,
  "img.about.community": aboutCommunity,
  "img.about.surgical": aboutSurgical,
  "img.about.career": aboutCareer,
  "img.services.herobg": servicesHeroBg,
  "img.services.medical": servicesMedical,
  "img.services.surgery": servicesSurgery,
  "img.services.diagnostic": servicesDiagnostic,
  "img.doctors.drkhaled": drKhaled,
  "img.doctors.dranas": drAnas,
  "img.doctors.drahmedmounir": drAhmed,
  "img.doctors.drshoaib": drShoaib,
  "img.doctors.dressam": drEssam,
  "img.blog.photo1": blog1,
  "img.blog.photo2": blog2,
  "img.blog.photo3": blog3,
  "img.blog.photo4": blog4,
};

type Api = (url: string, opts?: any) => Promise<any>;

const ACCEPTED = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/svg+xml"];
const MAX_BYTES = 1_800_000; // server limit ~1.8MB base64 payload

async function fileToOptimizedBase64(file: File): Promise<{ dataBase64: string; mimeType: string }> {
  const rawToB64 = (f: Blob, mime: string) =>
    new Promise<{ dataBase64: string; mimeType: string }>((res, rej) => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = String(reader.result || "");
        res({ dataBase64: dataUrl.slice(dataUrl.indexOf(",") + 1), mimeType: mime });
      };
      reader.onerror = () => rej(new Error("read_failed"));
      reader.readAsDataURL(f);
    });
  if (file.type === "image/svg+xml" || file.size <= MAX_BYTES) return rawToB64(file, file.type);
  // auto-optimize: downscale + re-encode as webp/jpeg until under the limit
  const bitmap = await createImageBitmap(file);
  let scale = Math.min(1, 1920 / bitmap.width);
  for (let attempt = 0; attempt < 6; attempt++) {
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const quality = Math.max(0.6, 0.88 - attempt * 0.07);
    const blob: Blob = await new Promise((res) => canvas.toBlob((b) => res(b!), "image/webp", quality));
    if (blob.size <= MAX_BYTES) return rawToB64(blob, "image/webp");
    scale *= 0.75;
  }
  throw new Error("large");
}

function ImageCard({
  imgKey, label, sectionLabel, current, overridden, busy, onReplace, onReset,
}: {
  imgKey: string; label: string; sectionLabel: string; current: string | null;
  overridden: boolean; busy: boolean; onReplace: (f: File) => void; onReset: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div style={{ border: "1px solid #eee", borderRadius: 8, padding: 8, background: "#fff" }}>
      <div style={{ height: 110, display: "flex", alignItems: "center", justifyContent: "center", background: "#faf9fd", borderRadius: 6, overflow: "hidden" }}>
        {current ? (
          <img src={current} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} loading="lazy" />
        ) : (
          <span style={{ color: "#bbb", fontSize: 12 }}>لا صورة</span>
        )}
      </div>
      <div style={{ fontSize: 13, fontWeight: 700, marginTop: 6 }}>{label}</div>
      <div style={{ fontSize: 11, color: "#999" }}>{sectionLabel}{overridden ? " • مُستبدلة" : " • افتراضية"}</div>
      <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
        <button style={{ ...A.btn, opacity: busy ? 0.6 : 1 }} disabled={busy} onClick={() => inputRef.current?.click()}>
          {busy ? "جاري الرفع…" : "استبدال الصورة"}
        </button>
        {overridden && (
          <button style={A.btnGhost} disabled={busy} onClick={onReset}>استعادة الافتراضية</button>
        )}
      </div>
      <input
        ref={inputRef} type="file" accept=".jpg,.jpeg,.png,.webp,.svg" style={{ display: "none" }}
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onReplace(f); e.target.value = ""; }}
      />
    </div>
  );
}

export default function ImagesPanel({ api }: { api: Api }) {
  const toast = useToast();
  const [overrides, setOverrides] = useState<Record<string, string>>({});
  const [services, setServices] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [section, setSection] = useState("all");
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const rows: any[] = await api("/api/content");
      setOverrides(Object.fromEntries(
        rows.filter((r) => r.type === "image" && r.key?.startsWith("img.") && r.valueAr).map((r) => [r.key, r.valueAr])
      ));
      setServices(await api("/api/admin/services").catch(() => []));
    } catch {
      toast("تعذر تحميل بيانات الصور");
    }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const replace = async (key: string, label: string, file: File) => {
    if (!ACCEPTED.includes(file.type)) {
      toast("صيغة غير مدعومة — المسموح: JPG, PNG, WEBP, SVG");
      return;
    }
    setBusyKey(key);
    const previousUrl = overrides[key] || null;
    try {
      const { dataBase64, mimeType } = await fileToOptimizedBase64(file);
      const up = await api("/api/admin/media", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: `${key.replace(/\W+/g, "-")}-${Date.now()}`, mimeType, dataBase64 }),
      });
      if (!up || !up.id) throw new Error("upload_failed");
      const url = `/api/media/${up.id}`;
      const saved = await api(`/api/admin/content/${encodeURIComponent(key)}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ valueAr: url, valueEn: url, type: "image", section: "site-images" }),
      });
      if (!saved || saved.ok !== true) throw new Error("save_failed");
      // update preview instantly, then clean up the replaced media file
      setOverrides((o) => ({ ...o, [key]: url }));
      const oldMatch = previousUrl?.match(/^\/api\/media\/([\w-]+)$/);
      if (oldMatch && oldMatch[1] !== up.id) {
        api(`/api/admin/media/${oldMatch[1]}`, { method: "DELETE" }).catch(() => {});
      }
      toast(`تم استبدال «${label}» — ستظهر بالموقع مباشرة`);
      await load();
    } catch (e: any) {
      const msg = e?.message === "large" ? "الصورة كبيرة جدًا حتى بعد التحسين — جرّب صورة أصغر"
        : e?.message === "upload_failed" ? "فشل رفع الصورة إلى المكتبة — حاول مرة أخرى"
        : e?.message === "save_failed" ? "رُفعت الصورة لكن فشل حفظ الربط — حاول مرة أخرى"
        : "فشل استبدال الصورة";
      toast(msg);
    }
    setBusyKey(null);
  };

  const reset = async (key: string, label: string) => {
    if (!window.confirm(`استعادة الصورة الافتراضية لـ «${label}»؟`)) return;
    setBusyKey(key);
    const previousUrl = overrides[key] || null;
    try {
      await api(`/api/admin/content/${encodeURIComponent(key)}`, { method: "DELETE" });
      setOverrides((o) => { const n = { ...o }; delete n[key]; return n; });
      const oldMatch = previousUrl?.match(/^\/api\/media\/([\w-]+)$/);
      if (oldMatch) api(`/api/admin/media/${oldMatch[1]}`, { method: "DELETE" }).catch(() => {});
      toast("تمت الاستعادة للافتراضية");
      await load();
    } catch {
      toast("فشلت الاستعادة");
    }
    setBusyKey(null);
  };

  const sectionLabel = (id: string) => SITE_IMAGE_SECTIONS.find((s) => s.id === id)?.label || id;
  const filtered = SITE_IMAGES.filter((e) =>
    (section === "all" || e.section === section) &&
    (!search || e.label.includes(search) || e.key.toLowerCase().includes(search.toLowerCase()))
  );
  const filteredServices = services.filter((s) =>
    section === "all" || section === "services"
  ).filter((s) => !search || (s.nameAr || "").includes(search) || (s.nameEn || "").toLowerCase().includes(search.toLowerCase()));

  if (loading) return <div style={A.card}>جاري تحميل صور الموقع…</div>;

  return (
    <div style={A.card}>
      <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
        <h3 style={{ margin: 0 }}>صور الموقع ({SITE_IMAGES.length + services.length})</h3>
        <div style={{ display: "flex", gap: 8 }}>
          <SearchBar value={search} onChange={setSearch} placeholder="بحث…" />
          <select style={{ ...A.input, width: "auto", marginBottom: 0 }} value={section} onChange={(e) => setSection(e.target.value)}>
            <option value="all">كل الأقسام</option>
            {SITE_IMAGE_SECTIONS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </div>
      </div>

      {filtered.length === 0 && filteredServices.length === 0 ? <Empty text="لا نتائج." /> : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(190px,1fr))", gap: 12 }}>
          {filtered.map((e) => (
            <ImageCard
              key={e.key}
              imgKey={e.key}
              label={e.label}
              sectionLabel={sectionLabel(e.section)}
              current={overrides[e.key] || DEFAULTS[e.key] || null}
              overridden={!!overrides[e.key]}
              busy={busyKey === e.key}
              onReplace={(f) => replace(e.key, e.label, f)}
              onReset={() => reset(e.key, e.label)}
            />
          ))}
          {filteredServices.map((s) => {
            const key = `img.service.${s.id}`;
            return (
              <ImageCard
                key={key}
                imgKey={key}
                label={`خدمة: ${s.nameAr}`}
                sectionLabel="صور الخدمات"
                current={overrides[key] || null}
                overridden={!!overrides[key]}
                busy={busyKey === key}
                onReplace={(f) => replace(key, s.nameAr, f)}
                onReset={() => reset(key, s.nameAr)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
