import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export default function LoginPage() {
  const { login, ADMIN_EMAIL } = useAuth();
  const navigate = useNavigate();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  const handle = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/admin");
    } catch {
      setError("Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <div className="login-card" style={s.card}>
        <div style={s.logoRow}>
          <div style={s.logoIcon}>M</div>
          <div>
            <div style={s.logoName}>Manakamana</div>
            <div style={s.logoSub}>Heavy Equipments Pvt. Ltd.</div>
          </div>
        </div>

        <h2 style={s.title}>Admin Login</h2>
        <p style={s.subtitle}>Sign in to manage products and invoices</p>

        {error && <div style={s.error}>{error}</div>}

        <form onSubmit={handle}>
          <label style={s.label}>Email Address</label>
          <input
            type="email" required style={s.input}
            placeholder={ADMIN_EMAIL}
            value={email} onChange={e => setEmail(e.target.value)}
          />
          <label style={s.label}>Password</label>
          <input
            type="password" required style={s.input}
            placeholder="Enter your password"
            value={password} onChange={e => setPassword(e.target.value)}
          />
          <button type="submit" style={s.btn} disabled={loading}>
            {loading ? "Signing in…" : "Sign In →"}
          </button>
        </form>

        <div style={s.hint}>
          🔒 Admin access only. Contact your system administrator for credentials.
        </div>
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: "100vh", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "'Segoe UI', sans-serif" },
  card: { background: "#fff", borderRadius: 20, padding: "40px 36px", width: "100%", maxWidth: 420, boxShadow: "0 8px 40px rgba(0,0,0,0.10)" },
  logoRow: { display: "flex", alignItems: "center", gap: 12, marginBottom: 32 },
  logoIcon: { width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg,#0ea5e9,#0369a1)", color: "#fff", fontWeight: 900, fontSize: 22, display: "flex", alignItems: "center", justifyContent: "center" },
  logoName: { fontSize: 15, fontWeight: 800, color: "#0f172a" },
  logoSub:  { fontSize: 10, color: "#64748b" },
  title:    { fontSize: 24, fontWeight: 800, color: "#0f172a", margin: "0 0 6px" },
  subtitle: { fontSize: 13, color: "#64748b", marginBottom: 24 },
  error:    { background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", borderRadius: 8, padding: "10px 14px", fontSize: 13, marginBottom: 16 },
  label:    { display: "block", fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 6 },
  input:    { width: "100%", padding: "11px 13px", borderRadius: 9, border: "1.5px solid #e2e8f0", fontSize: 14, color: "#0f172a", marginBottom: 16, boxSizing: "border-box", outline: "none" },
  btn:      { width: "100%", padding: "12px", background: "#0ea5e9", color: "#fff", borderRadius: 10, border: "none", fontSize: 15, fontWeight: 700, cursor: "pointer" },
  hint:     { fontSize: 11, color: "#94a3b8", textAlign: "center", marginTop: 20, lineHeight: 1.6 },
};
