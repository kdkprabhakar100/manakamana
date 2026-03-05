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

const PRIMARY = "#b45309";

const s = {
  page: {
    minHeight: "100vh",
    background: "#0a0a0a",
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: 24, fontFamily: "'Inter', system-ui, sans-serif",
    position: "relative",
  },
  pageOverlay: {
    position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
    background: "radial-gradient(circle at 50% 50%, rgba(217,119,6,0.04) 0%, transparent 60%)",
    pointerEvents: "none",
  },
  card: {
    background: "#fff", borderRadius: 28, padding: "48px 40px",
    width: "100%", maxWidth: 440,
    boxShadow: "0 20px 80px rgba(0,0,0,0.3)",
    position: "relative", zIndex: 1,
  },
  logoRow: { display: "flex", alignItems: "center", gap: 14, marginBottom: 36 },
  logoIcon: {
    width: 46, height: 46, borderRadius: 14,
    background: "linear-gradient(135deg, #92400e, #b45309)",
    color: "#fff", fontWeight: 800, fontSize: 22,
    display: "flex", alignItems: "center", justifyContent: "center",
    boxShadow: "0 4px 16px rgba(180,83,9,0.25)",
    fontFamily: "'Space Grotesk','Inter',sans-serif",
  },
  logoName: { fontSize: 16, fontWeight: 800, color: "#0a0a0a", fontFamily: "'Space Grotesk','Inter',sans-serif" },
  logoSub:  { fontSize: 10, color: "#737373", fontWeight: 500 },
  title:    { fontSize: 28, fontWeight: 800, color: "#0a0a0a", margin: "0 0 8px", fontFamily: "'Space Grotesk','Inter',sans-serif" },
  subtitle: { fontSize: 14, color: "#737373", marginBottom: 32, marginTop: 0 },
  error: {
    background: "#fef2f2", color: "#dc2626",
    border: "1px solid #fecaca", borderRadius: 14,
    padding: "12px 18px", fontSize: 13, marginBottom: 20, fontWeight: 500,
  },
  field: { marginBottom: 22 },
  label: { display: "block", fontSize: 13, fontWeight: 600, color: "#262626", marginBottom: 8, letterSpacing: 0.3 },
  input: {
    width: "100%", padding: "14px 16px", borderRadius: 14,
    border: "1.5px solid #e5e5e5", fontSize: 15, color: "#0a0a0a",
    boxSizing: "border-box", outline: "none",
    background: "#fafafa",
    transition: "all 0.3s cubic-bezier(0.16,1,0.3,1)",
  },
  inputErr: { borderColor: "#dc2626", background: "#fef2f2" },
  errMsg: { display: "block", fontSize: 12, color: "#dc2626", marginTop: 6, fontWeight: 500 },
  passWrap: { position: "relative" },
  passInput: { paddingRight: 48 },
  eyeBtn: {
    position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
    background: "none", border: "none", cursor: "pointer", fontSize: 16, padding: 4,
  },
  btn: {
    width: "100%", padding: "16px",
    background: "#0a0a0a",
    color: "#fff", borderRadius: 14, border: "none",
    fontSize: 15, fontWeight: 600, cursor: "pointer",
    boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
    transition: "all 0.35s cubic-bezier(0.16,1,0.3,1)",
    marginTop: 6, letterSpacing: 0.3,
  },
  hint: {
    fontSize: 12, color: "#a3a3a3", textAlign: "center",
    marginTop: 24, lineHeight: 1.6,
  },
};
