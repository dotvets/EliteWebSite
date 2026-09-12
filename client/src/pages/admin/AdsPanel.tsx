import { useEffect, useRef, useState } from "react";
import { A, useToast } from "./ui";

type Api = (url: string, opts?: any) => Promise<any>;
type Lang = "ar" | "en";

const ACCEPTED = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/svg+xml"];
const MAX_BYTES = 1_800_000;

async function fileToOptimizedBase64(file: File): Promise<{ dataBase64: string; mimeType: string }> {
  const rawToB64 = (blob: Blob, mimeType: string) =>
    new Promise<{ dataBase64: string; mimeType: string }>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = String(reader.result || "");
        resolve({ dataBase64: dataUrl.slice(dataUrl.indexOf(",") + 1), mimeType });
      };
      reader.onerror = () => reject(new Error("read_failed"));
      reader.readAsDataURL(blob);
    });

  if (file.type === "image/svg+xml" || file.size <= MAX_BYTES) {
    return rawToB64(file, file.type || "image/png");
  }

  const bitmap = await createImageBitmap(file);
  let scale = Math.min(1, 1920 / bitmap.width);

  for (let attempt = 0; attempt < 6; attempt++) {
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const quality = Math.max(0.6, 0.88 - attempt * 0.07);
    const blob: Blob = await new Promise((resolve) =>
      canvas.toBlob((result) => resolve(result!), "image/webp", quality),
    );
    if (blob.size <= MAX_BYTES) return rawToB64(blob, "image/webp");
    scale *= 0.75;
  }

  throw new Error("large");
}

function AdImageCard({
  title,
  subtitle,
  image,
  busy,
  onUpload,
  onRemove,
}: {
  title: string;
  subtitle: string;
  image: string;
  busy: boolean;
  onUpload: (file: File) => void;
  onRemove: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div style={{ border: "1px solid #eee", borderRadius: 12, padding: 16, background: "#fff" }}>
      <h4 style={{ margin: "0 0 4px" }}>{title}</h4>
      <div style={{ color: "#888", fontSize: 12, marginBottom: 12 }}>{subtitle}</div>
      <div
        style={{
          height: 260,
          borderRadius: 10,
          background: "#faf9fd",
          border: "1px dashed #ddd",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {image ? (
          <img src={image} alt="" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
        ) : (
          <span style={{ color: "#aaa" }}>لا توجد صورة مرفوعة</span>
        )}
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
        <button
          style={{ ...A.btn, opacity: busy ? 0.6 : 1 }}
          disabled={busy}
          onClick={() => inputRef.current?.click()}
        >
          {busy ? "جاري الرفع…" : image ? "استبدال الصورة" : "رفع صورة"}
        </button>
        {image && (
          <button style={A.btnGhost} disabled={busy} onClick={onRemove}>
            حذف الصورة
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp,.svg"
        style={{ display: "none" }}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onUpload(file);
          event.target.value = "";
        }}
      />
    </div>
  );
}

export default function AdsPanel({ api }: { api: Api }) {
  const toast = useToast();
  const [valueAr, setValueAr] = useState("");
  const [valueEn, setValueEn] = useState("");
  const [busy, setBusy] = useState<Lang | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const rows: any[] = await api("/api/content");
      const row = rows.find((item) => item.key === "ads.floating");
      setValueAr(row?.valueAr || "");
      setValueEn(row?.valueEn || "");
    } catch {
      toast("تعذر تحميل بيانات الإعلان");
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const save = async (nextAr: string, nextEn: string) => {
    if (!nextAr && !nextEn) {
      await api(`/api/admin/content/${encodeURIComponent("ads.floating")}`, { method: "DELETE" });
      return;
    }

    const result = await api(`/api/admin/content/${encodeURIComponent("ads.floating")}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        valueAr: nextAr,
        valueEn: nextEn,
        type: "image",
        section: "ads",
      }),
    });

    if (!result || result.ok !== true) throw new Error("save_failed");
  };

  const upload = async (lang: Lang, file: File) => {
    if (!ACCEPTED.includes(file.type)) {
      toast("صيغة غير مدعومة — المسموح: JPG, PNG, WEBP, SVG");
      return;
    }

    setBusy(lang);
    const oldUrl = lang === "ar" ? valueAr : valueEn;

    try {
      const { dataBase64, mimeType } = await fileToOptimizedBase64(file);
      const uploaded = await api("/api/admin/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: `floating-ad-${lang}-${Date.now()}`,
          mimeType,
          dataBase64,
        }),
      });

      if (!uploaded?.id) throw new Error("upload_failed");

      const url = `/api/media/${uploaded.id}`;
      const nextAr = lang === "ar" ? url : valueAr;
      const nextEn = lang === "en" ? url : valueEn;
      await save(nextAr, nextEn);
      setValueAr(nextAr);
      setValueEn(nextEn);

      const oldMatch = oldUrl.match(/^\/api\/media\/([\w-]+)$/);
      if (oldMatch && oldMatch[1] !== uploaded.id) {
        api(`/api/admin/media/${oldMatch[1]}`, { method: "DELETE" }).catch(() => {});
      }

      toast(lang === "ar" ? "تم تحديث صورة الإعلان العربية" : "تم تحديث صورة الإعلان الإنجليزية");
    } catch (error: any) {
      const message =
        error?.message === "large"
          ? "الصورة كبيرة جدًا حتى بعد التحسين — جرّب صورة أصغر"
          : error?.message === "upload_failed"
            ? "فشل رفع الصورة"
            : "فشل حفظ الإعلان";
      toast(message);
    }

    setBusy(null);
  };

  const remove = async (lang: Lang) => {
    const label = lang === "ar" ? "العربية" : "الإنجليزية";
    if (!window.confirm(`حذف صورة الإعلان ${label}؟`)) return;

    setBusy(lang);
    const oldUrl = lang === "ar" ? valueAr : valueEn;
    const nextAr = lang === "ar" ? "" : valueAr;
    const nextEn = lang === "en" ? "" : valueEn;

    try {
      await save(nextAr, nextEn);
      setValueAr(nextAr);
      setValueEn(nextEn);

      const oldMatch = oldUrl.match(/^\/api\/media\/([\w-]+)$/);
      if (oldMatch) api(`/api/admin/media/${oldMatch[1]}`, { method: "DELETE" }).catch(() => {});
      toast(`تم حذف صورة الإعلان ${label}`);
    } catch {
      toast("فشل حذف الصورة");
    }

    setBusy(null);
  };

  if (loading) return <div style={A.card}>جاري تحميل الإعلانات…</div>;

  return (
    <div style={A.card}>
      <div style={{ marginBottom: 18 }}>
        <h3 style={{ margin: "0 0 6px" }}>Ads</h3>
        <div style={{ color: "#777", fontSize: 13 }}>
          ارفع صورة الإعلان العربية وصورة الإعلان الإنجليزية. سيظهر الإعلان أسفل يسار الموقع، والصورة تتغير تلقائيًا حسب لغة الموقع.
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 16 }}>
        <AdImageCard
          title="الإعلان العربي"
          subtitle="يظهر عندما تكون لغة الموقع العربية"
          image={valueAr}
          busy={busy === "ar"}
          onUpload={(file) => upload("ar", file)}
          onRemove={() => remove("ar")}
        />
        <AdImageCard
          title="English Ad"
          subtitle="يظهر عندما تكون لغة الموقع الإنجليزية"
          image={valueEn}
          busy={busy === "en"}
          onUpload={(file) => upload("en", file)}
          onRemove={() => remove("en")}
        />
      </div>
    </div>
  );
}
