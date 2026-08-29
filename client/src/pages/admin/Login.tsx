import { useState } from "react";
import { useLocation } from "wouter";

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const r = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
      credentials: "include",
    });
    setLoading(false);
    if (r.ok) setLocation("/admin/dashboard");
    else setError("بيانات الدخول غير صحيحة");
  };

  return (
    <div dir="rtl" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f5f3fa", fontFamily: "sans-serif" }}>
      <form onSubmit={submit} style={{ background: "#fff", padding: 40, borderRadius: 16, boxShadow: "0 4px 24px rgba(0,0,0,.08)", width: 360 }}>
        <h1 style={{ color: "#6650a0", textAlign: "center", marginBottom: 8 }}>لوحة إدارة النخبة</h1>
        <p style={{ textAlign: "center", color: "#888", marginBottom: 24, fontSize: 14 }}>ONX Marketing — إدارة الموقع</p>
        <input placeholder="اسم المستخدم" value={username} onChange={(e) => setUsername(e.target.value)}
          style={{ width: "100%", padding: 12, marginBottom: 12, borderRadius: 8, border: "1px solid #ddd", boxSizing: "border-box" }} />
        <input type="password" placeholder="كلمة المرور" value={password} onChange={(e) => setPassword(e.target.value)}
          style={{ width: "100%", padding: 12, marginBottom: 16, borderRadius: 8, border: "1px solid #ddd", boxSizing: "border-box" }} />
        {error && <p style={{ color: "#c00", fontSize: 13, marginBottom: 12 }}>{error}</p>}
        <button disabled={loading} style={{ width: "100%", padding: 12, background: "#6650a0", color: "#fff", border: "none", borderRadius: 8, fontSize: 16, cursor: "pointer" }}>
          {loading ? "جارٍ الدخول…" : "دخول"}
        </button>
      </form>
    </div>
  );
}
