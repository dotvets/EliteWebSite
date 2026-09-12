import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useLanguage } from "@/contexts/LanguageContext";

type ContentRow = {
  key?: string;
  valueAr?: string | null;
  valueEn?: string | null;
};

export default function FloatingAd() {
  const { language } = useLanguage();
  const [ad, setAd] = useState<ContentRow | null>(null);
  const [link, setLink] = useState("");
  const [closed, setClosed] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/content")
      .then((res) => (res.ok ? res.json() : []))
      .then((rows: ContentRow[]) => {
        if (cancelled || !Array.isArray(rows)) return;
        const adRow = rows.find((row) => row.key === "ads.floating") || null;
        const linkRow = rows.find((row) => row.key === "ads.floating.link") || null;
        setAd(adRow);
        setLink((linkRow?.valueAr || linkRow?.valueEn || "").trim());
      })
      .catch(() => {
        if (!cancelled) {
          setAd(null);
          setLink("");
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)");
    const sync = () => setIsMobile(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  const imageUrl = useMemo(
    () => (language === "ar" ? ad?.valueAr : ad?.valueEn) || "",
    [ad, language],
  );

  const isExternalLink = /^https?:\/\//i.test(link);

  useEffect(() => {
    setImageFailed(false);
  }, [imageUrl]);

  if (closed || !imageUrl || imageFailed || typeof document === "undefined") return null;

  const image = (
    <img
      src={imageUrl}
      alt=""
      onError={() => setImageFailed(true)}
      style={{
        display: "block",
        width: "100%",
        height: "auto",
        maxHeight: isMobile ? "72vh" : "min(520px, calc(100vh - 80px))",
        objectFit: "contain",
        borderRadius: 14,
        boxShadow: "0 12px 34px rgba(0,0,0,.22)",
      }}
    />
  );

  return createPortal(
    <div
      style={{
        position: "fixed",
        left: isMobile ? 12 : 20,
        bottom: isMobile ? 12 : 20,
        zIndex: 2147483000,
        width: isMobile ? "calc(100vw - 24px)" : "min(380px, calc(100vw - 40px))",
        maxWidth: isMobile ? 420 : 380,
        display: "block",
        visibility: "visible",
        opacity: 1,
        pointerEvents: "auto",
      }}
    >
      <div style={{ position: "relative", width: "100%" }}>
        {link ? (
          <a
            href={link}
            target={isExternalLink ? "_blank" : undefined}
            rel={isExternalLink ? "noopener noreferrer" : undefined}
            aria-label={language === "ar" ? "فتح رابط الإعلان" : "Open advertisement link"}
            style={{ display: "block", width: "100%", cursor: "pointer" }}
          >
            {image}
          </a>
        ) : image}

        <button
          type="button"
          aria-label={language === "ar" ? "إغلاق الإعلان" : "Close advertisement"}
          onClick={() => setClosed(true)}
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            width: isMobile ? 36 : 34,
            height: isMobile ? 36 : 34,
            borderRadius: "50%",
            border: "none",
            background: "rgba(0,0,0,.72)",
            color: "#fff",
            fontSize: isMobile ? 24 : 22,
            lineHeight: isMobile ? "36px" : "34px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 0,
            zIndex: 2,
          }}
        >
          ×
        </button>
      </div>
    </div>,
    document.body,
  );
}
