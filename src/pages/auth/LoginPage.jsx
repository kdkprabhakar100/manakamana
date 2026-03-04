import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [errors,   setErrors]   = useState({});
  const [loading,  setLoading]  = useState(false);
  const [showPass, setShowPass] = useState(false);

  const validate = () => {
    const errs = {};
    if (!email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errs.email = "Enter a valid email address";

    if (!password) errs.password = "Password is required";
    else if (password.length < 6) errs.password = "Password must be at least 6 characters";

    return errs;
  };

  const handle = async (e) => {
    e.preventDefault();
    setError("");
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      await login(email, password);
      navigate("/admin");
    } catch (err) {
      setError(err?.message?.includes("Too many") ? err.message : "Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <div style={s.pageOverlay} />
      <div className="login-card" style={s.card}>
        <div style={s.logoRow}>
          <div style={s.logoIcon}>M</div>
          <div>
            <div style={s.logoName}>Manakamana</div>
            <div style={s.logoSub}>Heavy Equipments Pvt. Ltd.</div>
          </div>
        </div>

        <h2 style={s.title}>Welcome Back</h2>
        <p style={s.subtitle}>Sign in to manage products and invoices</p>

        {error && <div style={s.error}>{error}</div>}

        <form onSubmit={handle} noValidate>
          <div style={s.field}>
            <label style={s.label}>Email Address</label>
            <input
              type="email" style={{ ...s.input, ...(errors.email ? s.inputErr : {}) }}
              placeholder="admin@example.com"
              value={email} onChange={e => { setEmail(e.target.value); setErrors(er => ({...er, email: ""})); }}
            />
            {errors.email && <span style={s.errMsg}>{errors.email}</span>}
          </div>

          <div style={s.field}>
            <label style={s.label}>Password</label>
            <div style={s.passWrap}>
              <input
                type={showPass ? "text" : "password"}
                style={{ ...s.input, ...s.passInput, ...(errors.password ? s.inputErr : {}) }}
                placeholder="Enter your password"
                value={password} onChange={e => { setPassword(e.target.value); setErrors(er => ({...er, password: ""})); }}
              />
              <button type="button" style={s.eyeBtn} onClick={() => setShowPass(v => !v)}
                tabIndex={-1} aria-label="Toggle password visibility">
                {showPass ? "🙈" : "👁️"}
              </button>
            </div>
            {errors.password && <span style={s.errMsg}>{errors.password}</span>}
          </div>

          <button type="submit" style={{ ...s.btn, opacity: loading ? 0.7 : 1 }} disabled={loading}>
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

const PRIMARY = "#ea580c";

const s = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f2030 100%)",
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: 24, fontFamily: "'Inter', 'Segoe UI', sans-serif",
    position: "relative",
  },
  pageOverlay: {
    position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
    backgroundImage: "radial-gradient(circle at 30% 70%, rgba(249,115,22,0.06) 0%, transparent 50%)",
    pointerEvents: "none",
  },
  card: {
    background: "#fff", borderRadius: 20, padding: "40px 36px",
    width: "100%", maxWidth: 420,
    boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
    position: "relative", zIndex: 1,
  },
  logoRow: { display: "flex", alignItems: "center", gap: 12, marginBottom: 32 },
  logoIcon: {
    width: 44, height: 44, borderRadius: 12,
    background: `linear-gradient(135deg, ${PRIMARY}, #f97316)`,
    color: "#fff", fontWeight: 900, fontSize: 22,
    display: "flex", alignItems: "center", justifyContent: "center",
    boxShadow: "0 2px 8px rgba(249,115,22,0.35)",
  },
  logoName: { fontSize: 16, fontWeight: 800, color: "#0f172a" },
  logoSub:  { fontSize: 10, color: "#64748b", fontWeight: 500 },
  title:    { fontSize: 26, fontWeight: 800, color: "#0f172a", margin: "0 0 6px" },
  subtitle: { fontSize: 14, color: "#64748b", marginBottom: 28, marginTop: 0 },
  error: {
    background: "#fef2f2", color: "#dc2626",
    border: "1px solid #fecaca", borderRadius: 10,
    padding: "11px 16px", fontSize: 13, marginBottom: 18, fontWeight: 500,
  },
  field: { marginBottom: 18 },
  label: { display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 7 },
  input: {
    width: "100%", padding: "12px 14px", borderRadius: 10,
    border: "1.5px solid #e2e8f0", fontSize: 14, color: "#0f172a",
    boxSizing: "border-box", outline: "none",
    background: "#fafafa",
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  },
  inputErr: { borderColor: "#ef4444", background: "#fef2f2" },
  errMsg: { display: "block", fontSize: 12, color: "#ef4444", marginTop: 5, fontWeight: 500 },
  passWrap: { position: "relative" },
  passInput: { paddingRight: 44 },
  eyeBtn: {
    position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
    background: "none", border: "none", cursor: "pointer", fontSize: 16, padding: 4,
  },
  btn: {
    width: "100%", padding: "13px",
    background: `linear-gradient(135deg, ${PRIMARY}, #f97316)`,
    color: "#fff", borderRadius: 10, border: "none",
    fontSize: 15, fontWeight: 700, cursor: "pointer",
    boxShadow: "0 4px 16px rgba(249,115,22,0.25)",
    transition: "all 0.2s ease",
    marginTop: 4,
  },
  hint: {
    fontSize: 12, color: "#94a3b8", textAlign: "center",
    marginTop: 22, lineHeight: 1.6,
  },
};
