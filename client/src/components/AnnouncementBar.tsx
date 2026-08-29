import { useState } from "react";
import { X } from "lucide-react";
import { useBootstrap, bsVal } from "@/hooks/useBootstrap";
import { useLanguage } from "@/contexts/LanguageContext";

// Top announcement bar driven by settings.announcement (admin → الإعدادات). Hidden when empty.
export default function AnnouncementBar() {
  const { language } = useLanguage();
  const bs = useBootstrap();
  const [dismissed, setDismissed] = useState(false);
  const text = bsVal(bs, "announcement", language, "");
  if (!text.trim() || dismissed) return null;
  return (
    <div className="bg-primary text-primary-foreground text-sm py-2 px-4 flex items-center justify-center gap-3 relative z-50" data-testid="announcement-bar">
      <span className="text-center font-medium">{text}</span>
      <button
        onClick={() => setDismissed(true)}
        className="absolute end-3 top-1/2 -translate-y-1/2 opacity-70 hover:opacity-100 transition-opacity"
        aria-label="close"
        data-testid="button-dismiss-announcement"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
