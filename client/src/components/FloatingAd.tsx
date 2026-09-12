import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

type ContentRow = {
  key?: string;
  valueAr?: string | null;
  valueEn?: string | null;
};

export default function FloatingAd() {
  const { language } = useLanguage();
  const [ad, setAd] = useState<ContentRow | null>(null);
  const [closed, setClosed] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/content")
      .then((res) => (res.ok ? res.json() : []))
      .then((rows: ContentRow[]) => {
        if (cancelled || !Array.isArray(rows)) return;
        setAd(rows.find((row) => row.key === "ads.floating") || null);
      })
      .catch(() => {
        if (!cancelled) setAd(null);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const imageUrl = useMemo(
    () => (language === "ar" ? ad?.valueAr : ad?.valueEn) || "",
    [ad, language],
  );

  useEffect(() => {
    setImageFailed(false);
  }, [imageUrl]);

  if (closed || !imageUrl || imageFailed) return null;

  return (
    <div
      style={{
        position: "fixed",
        left: 18,
        bottom: 18,
        zIndex: 60,
        width: "min(320px, calc(100vw - 36px))",
      }}
    >
      <div style={{ position: "relative" }}>
        <img
          src={imageUrl}
          alt=""
          onError={() => setImageFailed(true)}
          style={{
            display: "block",
            width: "100%",
            height: "auto",
            maxHeight: "min(430px, calc(100vh - 80px))",
            objectFit: "contain",
            borderRadius: 14,
            boxShadow: "0 12px 34px rgba(0,0,0,.22)",
          }}
        />
        <button
          type="button"
          aria-label={language === "ar" ? "إغلاق الإعلان" : "Close advertisement"}
          onClick={() => setClosed(true)}
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            width: 32,
            height: 32,
            borderRadius: "50%",
            border: "none",
            background: "rgba(0,0,0,.72)",
            color: "#fff",
            fontSize: 22,
            lineHeight: "32px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 0,
          }}
        >
          ×
        </button>
      </div>
    </div>
  );
}
