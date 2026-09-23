import { useCallback, useEffect, useState } from "react";

// ============================================================================
// Integrations Manager V1 — admin panel (approved design 2026-09-22).
// - Category A editable · Category B shown as state only · Category C read-only
// - Dr Paws scopes never rendered (server-enforced; UI trusts the filtered list)
// - Sensitive actions require typing a confirmation token
// ============================================================================

type Api = (url: string, opts?: any) => Promise<any>;

const STATUS_LABELS: Record<string, [string, string, string]> = {
  not_configured: ["غير مُعدّ", "#f0f0f0", "#666"],
  configured_externally: ["مُعدّ خارجيًا", "#e0f0ff", "#1565c0"],
  configured: ["مُعدّ", "#f3e8ff", "#6650a0"],
  ready: ["جاهز", "#e8f8ee", "#1a7f37"],
  disabled: ["معطّل", "#f0f0f0", "#666"],
  connection_failed: ["فشل الاتصال", "#fdecec", "#c00"],
  needs_attention: ["يحتاج انتباه", "#fff7e0", "#8a6d00"],
  blocked: ["محجوب", "#fdecec", "#c00"],
};

const card: React.CSSProperties = {
  background: "#fff",
  borderRadius: 12,
  padding: 20,
  boxShadow: "0 2px 10px rgba(0,0,0,.06)",
  marginBottom: 16,
};
const btn: React.CSSProperties = {
  background: "#6650a0",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  padding: "8px 16px",
  cursor: "pointer",
};
const btnGhost: React.CSSProperties = {
  ...btn,
  background: "#eee",
  color: "#333",
};
const input: React.CSSProperties = {
  width: "100%",
  padding: 10,
  borderRadius: 8,
  border: "1px solid #ddd",
  marginBottom: 8,
  boxSizing: "border-box",
};

function StatusBadge({ status }: { status: string }) {
  const [label, bg, fg] = STATUS_LABELS[status] || [status, "#f0f0f0", "#666"];
  return (
    <span
      style={{
        background: bg,
        color: fg,
        borderRadius: 6,
        padding: "2px 10px",
        fontSize: 12,
        fontWeight: 700,
      }}
    >
      {label}
    </span>
  );
}

export default function IntegrationsPanel({ api }: { api: Api }) {
  const [items, setItems] = useState<any[]>([]);
  const [catalog, setCatalog] = useState<any[]>([]);
  const [system, setSystem] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [form, setForm] = useState<Record<string, any>>({});
  const [scope, setScope] = useState({
    scopeType: "",
    scopeId: "",
    environment: "",
  });
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [disabled, setDisabled] = useState(false);

  const load = useCallback(async () => {
    try {
      const [list, cat, sys, ev, rt] = await Promise.all([
        api("/api/admin/integrations"),
        api("/api/admin/integrations/catalog"),
        api("/api/admin/integrations/system"),
        api("/api/admin/integrations/events?limit=30"),
        api("/api/admin/integrations/routing"),
      ]);
      setItems(list.integrations || []);
      setCatalog(cat.providers || []);
      setSystem(sys);
      setEvents(ev.events || []);
      setRoutes(rt.routes || []);
      setDisabled(false);
    } catch {
      // Flag off → endpoint 404s; render an honest dark state instead of noise.
      setDisabled(true);
    }
  }, [api]);

  useEffect(() => {
    load();
  }, [load]);

  if (disabled) {
    return (
      <div style={card}>
        <h3>مدير التكاملات</h3>
        <p style={{ color: "#888" }}>
          الوحدة غير مفعّلة حاليًا (INTEGRATIONS_MANAGER=false) — تُفعَّل من
          إعدادات النشر فقط.
        </p>
      </div>
    );
  }

  const sel = items.find((i) => i.provider === selected);
  const selSpec = catalog.find((c) => c.key === selected);

  const saveConfig = async () => {
    setMsg(null);
    setErr(null);
    const body: any = {
      scopeType: scope.scopeType,
      scopeId: scope.scopeId,
      environment: scope.environment,
      config: form,
    };
    if (scope.environment === "production") body.confirm = "SET-PRODUCTION";
    const r = await api(`/api/admin/integrations/${selected}/config`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (r.error) return setErr(r.error);
    setMsg("تم حفظ الإعداد (فئة A فقط — لا أسرار)");
    await load();
  };

  const toggleEnabled = async (enabled: boolean) => {
    setMsg(null);
    setErr(null);
    const r = await api(`/api/admin/integrations/${selected}/enabled`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        enabled,
        confirm: enabled ? "ENABLE" : "DISABLE",
      }),
    });
    if (r.error) return setErr(r.error);
    setMsg(enabled ? "تم التفعيل" : "تم التعطيل");
    await load();
  };

  const runTest = async () => {
    setMsg(null);
    setErr(null);
    const r = await api(`/api/admin/integrations/${selected}/test`, {
      method: "POST",
    });
    if (r.error) return setErr(r.error);
    setMsg(
      `نتيجة الاختبار: ${r.result}${r.note ? ` — ${r.note}` : ""}${r.errorClass ? ` (${r.errorClass})` : ""}`,
    );
    await load();
  };

  return (
    <div>
      <h3 style={{ marginTop: 0 }}>مدير التكاملات (V1)</h3>
      {msg && (
        <div style={{ ...card, background: "#e8f8ee", color: "#1a7f37" }}>
          {msg}
        </div>
      )}
      {err && (
        <div style={{ ...card, background: "#fdecec", color: "#c00" }}>
          {err}
        </div>
      )}

      {/* ---- Grid of providers ---- */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))",
          gap: 12,
        }}
      >
        {items.map((i) => (
          <div
            key={i.provider}
            style={{
              ...card,
              cursor: "pointer",
              border:
                selected === i.provider
                  ? "2px solid #6650a0"
                  : "2px solid transparent",
            }}
            onClick={() => {
              setSelected(i.provider);
              setForm(i.config || {});
              setScope({
                scopeType: i.scopeType || "",
                scopeId: i.scopeId || "",
                environment: i.environment || "",
              });
              setConfirm("");
              setMsg(null);
              setErr(null);
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <b>{i.displayNameAr}</b>
              <StatusBadge status={i.status} />
            </div>
            <div style={{ fontSize: 13, color: "#888", marginTop: 6 }}>
              المصدر:{" "}
              {i.source === "dashboard"
                ? "اللوحة"
                : i.source === "environment"
                  ? "البيئة (env)"
                  : "—"}
              {i.blockedReason ? ` · مانع: ${i.blockedReason}` : ""}
            </div>
            <div style={{ fontSize: 12, color: "#aaa", marginTop: 6 }}>
              الأسرار:{" "}
              {i.secrets
                .map(
                  (s: any) =>
                    `${s.envName}: ${s.state === "configured" ? "مُعدّ" : "مفقود"}`,
                )
                .join(" · ")}
            </div>
            {i.health && (
              <div style={{ fontSize: 12, color: "#aaa", marginTop: 4 }}>
                آخر اختبار:{" "}
                {i.health.lastTestAt
                  ? new Date(i.health.lastTestAt).toLocaleString("ar")
                  : "—"}
                {i.health.circuitState !== "closed"
                  ? ` · قاطع الدائرة: ${i.health.circuitState}`
                  : ""}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ---- Detail editor ---- */}
      {sel && selSpec && (
        <div style={card}>
          <h4 style={{ marginTop: 0 }}>{sel.displayNameAr} — إعداد فئة A</h4>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 8,
            }}
          >
            <select
              style={input}
              value={scope.scopeType}
              onChange={(e) =>
                setScope({ ...scope, scopeType: e.target.value })
              }
            >
              <option value="">النطاق…</option>
              {selSpec.allowedScopes.map((s: string) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <input
              style={input}
              placeholder="معرّف النطاق (مثل elite أو *)"
              value={scope.scopeId}
              onChange={(e) => setScope({ ...scope, scopeId: e.target.value })}
            />
            <select
              style={input}
              value={scope.environment}
              onChange={(e) =>
                setScope({ ...scope, environment: e.target.value })
              }
            >
              <option value="">البيئة…</option>
              {selSpec.allowedEnvironments.map((s: string) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {selSpec.configFields.map((f: any) => (
            <div key={f.key}>
              {f.kind === "boolean" ? (
                <label style={{ display: "block", marginBottom: 8 }}>
                  <input
                    type="checkbox"
                    checked={!!form[f.key]}
                    onChange={(e) =>
                      setForm({ ...form, [f.key]: e.target.checked })
                    }
                  />{" "}
                  {f.key}
                  {f.required ? " *" : ""}
                </label>
              ) : f.kind === "enum" ? (
                <select
                  style={input}
                  value={form[f.key] || ""}
                  onChange={(e) =>
                    setForm({ ...form, [f.key]: e.target.value })
                  }
                >
                  <option value="">
                    {f.key}
                    {f.required ? " *" : ""}…
                  </option>
                  {f.enumValues.map((v: string) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              ) : f.kind === "string_map" ? (
                <input
                  style={input}
                  placeholder={`${f.key} (JSON: {"otp":"template_id"})`}
                  value={
                    typeof form[f.key] === "object"
                      ? JSON.stringify(form[f.key])
                      : form[f.key] || ""
                  }
                  onChange={(e) => {
                    try {
                      setForm({
                        ...form,
                        [f.key]: JSON.parse(e.target.value || "{}"),
                      });
                    } catch {
                      setForm({ ...form, [f.key]: e.target.value });
                    }
                  }}
                />
              ) : (
                <input
                  style={input}
                  placeholder={`${f.key}${f.required ? " *" : ""}`}
                  value={form[f.key] || ""}
                  onChange={(e) =>
                    setForm({ ...form, [f.key]: e.target.value })
                  }
                />
              )}
            </div>
          ))}

          <div
            style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}
          >
            <button style={btn} onClick={saveConfig}>
              حفظ الإعداد
            </button>
            <button style={btnGhost} onClick={runTest}>
              اختبار الاتصال (آمن)
            </button>
            <input
              style={{ ...input, width: 180, marginBottom: 0 }}
              placeholder="اكتب ENABLE أو DISABLE"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
            <button
              style={{ ...btn, background: sel.enabled ? "#c00" : "#1a7f37" }}
              onClick={() => toggleEnabled(!sel.enabled)}
              disabled={confirm !== (sel.enabled ? "DISABLE" : "ENABLE")}
            >
              {sel.enabled ? "تعطيل" : "تفعيل"}
            </button>
          </div>
          <div style={{ fontSize: 12, color: "#aaa", marginTop: 8 }}>
            الأسرار (فئة B) تُدار من بيئة النشر ولا تُخزَّن هنا. الحقول السرية
            تُرفض تلقائيًا.
          </div>
        </div>
      )}

      {/* ---- Category C read-only ---- */}
      {system && (
        <div style={card}>
          <h4 style={{ marginTop: 0 }}>
            إعدادات النشر (فئة C — عرض فقط، لا تُعدَّل من هنا)
          </h4>
          <table
            style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}
          >
            <tbody>
              {system.categoryC.map((c: any) => (
                <tr key={c.key}>
                  <td style={{ padding: 8, borderBottom: "1px solid #f0f0f0" }}>
                    {c.label}
                  </td>
                  <td
                    style={{
                      padding: 8,
                      borderBottom: "1px solid #f0f0f0",
                      color: "#888",
                    }}
                  >
                    {c.key}
                  </td>
                  <td style={{ padding: 8, borderBottom: "1px solid #f0f0f0" }}>
                    {c.state}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ---- Messaging routing ---- */}
      <div style={card}>
        <h4 style={{ marginTop: 0 }}>توجيه الرسائل</h4>
        {routes.length === 0 && (
          <div style={{ color: "#888", fontSize: 14 }}>
            لا قواعد توجيه — السلوك الحالي (المزوّد الافتراضي) كما هو.
          </div>
        )}
        {routes.map((r) => (
          <div
            key={r.id}
            style={{
              fontSize: 14,
              padding: "4px 0",
              borderBottom: "1px solid #f5f5f5",
            }}
          >
            {r.brand_id} · {r.purpose} → <b>{r.provider_key}</b> (
            {r.environment})
          </div>
        ))}
        <div style={{ fontSize: 12, color: "#aaa", marginTop: 8 }}>
          قواعد Dr Paws محمية ولا تظهر هنا. تغيير مسار الطوارئ يتطلب تأكيدًا
          نصيًا عبر API.
        </div>
      </div>

      {/* ---- Audit ---- */}
      <div style={card}>
        <h4 style={{ marginTop: 0 }}>سجل التدقيق (آخر 30)</h4>
        {events.length === 0 && (
          <div style={{ color: "#888", fontSize: 14 }}>لا أحداث بعد.</div>
        )}
        {events.map((e) => (
          <div
            key={e.id}
            style={{
              fontSize: 13,
              padding: "4px 0",
              borderBottom: "1px solid #f5f5f5",
              direction: "ltr",
              textAlign: "left",
            }}
          >
            <span style={{ color: "#888" }}>
              {new Date(e.created_at).toLocaleString()}
            </span>{" "}
            — <b>{e.action}</b> {e.provider_key} {e.scope_id || ""} [{e.result}]
          </div>
        ))}
      </div>
    </div>
  );
}
