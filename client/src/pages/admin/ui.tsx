import { createContext, useCallback, useContext, useEffect, useState } from "react";

// ---------- Styles shared across admin ----------
export const A: Record<string, React.CSSProperties> = {
  card: { background: "#fff", borderRadius: 12, padding: 20, boxShadow: "0 2px 10px rgba(0,0,0,.06)", marginBottom: 16 },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 14 },
  th: { textAlign: "right", padding: 10, borderBottom: "2px solid #eee", color: "#6650a0" },
  td: { padding: 10, borderBottom: "1px solid #f0f0f0" },
  btn: { background: "#6650a0", color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", cursor: "pointer" },
  btnGhost: { background: "#eee", color: "#333", border: "none", borderRadius: 8, padding: "8px 14px", cursor: "pointer" },
  btnDanger: { background: "#c0392b", color: "#fff", border: "none", borderRadius: 8, padding: "6px 12px", cursor: "pointer" },
  input: { width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ddd", marginBottom: 10, boxSizing: "border-box" },
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
  modal: { background: "#fff", borderRadius: 14, padding: 24, maxWidth: 420, width: "90%", textAlign: "center" },
  search: { padding: "10px 14px", borderRadius: 10, border: "1px solid #ddd", width: "100%", maxWidth: 320, boxSizing: "border-box" },
};

// ---------- Toast ----------
type ToastMsg = { id: number; text: string; kind: "ok" | "err" };
const ToastCtx = createContext<(text: string, kind?: "ok" | "err") => void>(() => {});
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMsg[]>([]);
  const push = useCallback((text: string, kind: "ok" | "err" = "ok") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, text, kind }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div style={{ position: "fixed", bottom: 20, left: 20, zIndex: 2000, display: "flex", flexDirection: "column", gap: 8 }}>
        {toasts.map((t) => (
          <div key={t.id} style={{ background: t.kind === "ok" ? "#1a7f37" : "#c0392b", color: "#fff", padding: "10px 18px", borderRadius: 10, boxShadow: "0 4px 14px rgba(0,0,0,.2)", fontSize: 14 }}>
            {t.text}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

// ---------- Confirm modal ----------
export function Confirm({ open, text, onYes, onNo }: { open: boolean; text: string; onYes: () => void; onNo: () => void }) {
  if (!open) return null;
  return (
    <div style={A.overlay} onClick={onNo}>
      <div style={A.modal} onClick={(e) => e.stopPropagation()}>
        <p style={{ fontSize: 16, marginBottom: 20 }}>{text}</p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <button style={A.btnDanger} onClick={onYes}>تأكيد</button>
          <button style={A.btnGhost} onClick={onNo}>إلغاء</button>
        </div>
      </div>
    </div>
  );
}

// ---------- Status badge ----------
export function StatusBadge({ on, onText, offText }: { on: boolean; onText: string; offText: string }) {
  return (
    <span style={{ background: on ? "#e8f8ee" : "#fdecec", color: on ? "#1a7f37" : "#c00", borderRadius: 6, padding: "2px 10px", fontSize: 12, fontWeight: 700 }}>
      {on ? onText : offText}
    </span>
  );
}

// ---------- Bilingual field with missing-language indicator ----------
export function BiField({ labelAr, valueAr, valueEn, onAr, onEn, textarea }: {
  labelAr: string; valueAr: string; valueEn: string;
  onAr: (v: string) => void; onEn: (v: string) => void; textarea?: boolean;
}) {
  const Tag: any = textarea ? "textarea" : "input";
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 13, color: "#6650a0", fontWeight: 700, marginBottom: 6 }}>{labelAr}</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <div>
          <div style={{ fontSize: 11, color: "#999", marginBottom: 3 }}>العربية {!valueAr && <span style={{ color: "#c80" }}>⚠ العربية مفقودة</span>}</div>
          <Tag style={{ ...A.input, marginBottom: 0, minHeight: textarea ? 80 : undefined }} dir="rtl" value={valueAr} onChange={(e: any) => onAr(e.target.value)} />
        </div>
        <div>
          <div style={{ fontSize: 11, color: "#999", marginBottom: 3 }}>English {!valueEn && <span style={{ color: "#c80" }}>⚠ English missing</span>}</div>
          <Tag style={{ ...A.input, marginBottom: 0, minHeight: textarea ? 80 : undefined }} dir="ltr" value={valueEn} onChange={(e: any) => onEn(e.target.value)} />
        </div>
      </div>
    </div>
  );
}

// ---------- Unsaved changes warning ----------
export function useUnsavedGuard(dirty: boolean) {
  useEffect(() => {
    const h = (e: BeforeUnloadEvent) => { if (dirty) { e.preventDefault(); e.returnValue = ""; } };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);
}

// ---------- Empty state ----------
export function Empty({ text }: { text: string }) {
  return <div style={{ textAlign: "center", color: "#999", padding: 40, fontSize: 15 }}>{text}</div>;
}

// ---------- Search bar ----------
export function SearchBar({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return <input style={A.search} placeholder={placeholder || "بحث…"} value={value} onChange={(e) => onChange(e.target.value)} />;
}
