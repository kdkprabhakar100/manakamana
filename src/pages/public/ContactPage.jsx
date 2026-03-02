import { useState } from "react";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", phone: "", email: "", message: "" });
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);
  const [touched, setTouched] = useState({});

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Name is required";
    else if (form.name.trim().length < 2) errs.name = "Name must be at least 2 characters";

    if (!form.phone.trim()) errs.phone = "Phone number is required";
    else if (!/^[+]?[\d\s-]{7,15}$/.test(form.phone.trim())) errs.phone = "Enter a valid phone number";

    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      errs.email = "Enter a valid email address";

    if (!form.message.trim()) errs.message = "Message is required";
    else if (form.message.trim().length < 10) errs.message = "Message must be at least 10 characters";

    return errs;
  };

  const handleBlur = (field) => {
    setTouched(t => ({ ...t, [field]: true }));
    setErrors(validate());
  };

  const handle = (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    setTouched({ name: true, phone: true, email: true, message: true });
    if (Object.keys(errs).length > 0) return;
    setSent(true);
  };

  const fieldError = (field) => touched[field] && errors[field];

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.pageHeader}>
        <div style={s.headerInner}>
          <p style={s.label}>GET IN TOUCH</p>
          <h1 className="page-title" style={s.htitle}>Contact Us</h1>
          <p style={s.hsubtitle}>Have a requirement? Send us a message or call directly.</p>
        </div>
      </div>

      <div style={s.inner}>
        <div className="contact-grid" style={s.grid}>
          {/* Info */}
          <div style={s.info}>
            {[
              { icon:"📍", t:"Address",  d:"Kathmandu, Bagmati Province, Nepal" },
              { icon:"📞", t:"Phone",    d:"+977-9851068337" },
              { icon:"✉️",  t:"Email",    d:"info@manakamana.com.np" },
              { icon:"🕐", t:"Hours",    d:"Sun – Fri: 9:00 AM – 6:00 PM\nSaturday: 10:00 AM – 4:00 PM" },
            ].map(c => (
              <div key={c.t} style={s.contactCard}>
                <div style={s.contactIconWrap}>{c.icon}</div>
                <div>
                  <div style={s.contactTitle}>{c.t}</div>
                  <div style={s.contactDetail}>{c.d}</div>
                </div>
              </div>
            ))}

            <div style={s.socialRow}>
              <a href="https://wa.me/9779851068337" target="_blank" rel="noreferrer" style={s.socialBtn}>
                💬 WhatsApp
              </a>
              <a href="tel:+9779851068337" style={{ ...s.socialBtn, background: "#f1f5f9", color: "#334155" }}>
                📞 Call Now
              </a>
            </div>
          </div>

          {/* Form */}
          <div style={s.formCard}>
            {sent ? (
              <div style={s.successMsg}>
                <div style={s.successIcon}>✅</div>
                <h3 style={s.successTitle}>Message Sent!</h3>
                <p style={s.successDesc}>We'll get back to you within 24 hours.</p>
                <button style={s.resetBtn} onClick={() => {
                  setSent(false);
                  setForm({ name:"",phone:"",email:"",message:"" });
                  setErrors({});
                  setTouched({});
                }}>
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handle} noValidate>
                <h2 style={s.formTitle}>Send a Message</h2>
                <p style={s.formDesc}>Fill out the form below and we'll respond promptly.</p>

                {/* Name */}
                <div style={s.field}>
                  <label style={s.fieldLabel}>Your Name <span style={s.required}>*</span></label>
                  <input
                    type="text" style={{ ...s.input, ...(fieldError("name") ? s.inputError : {}) }}
                    placeholder="Enter your full name"
                    value={form.name}
                    onChange={e => setForm(p => ({...p, name: e.target.value}))}
                    onBlur={() => handleBlur("name")}
                  />
                  {fieldError("name") && <span style={s.errMsg}>{errors.name}</span>}
                </div>

                {/* Phone */}
                <div style={s.field}>
                  <label style={s.fieldLabel}>Phone Number <span style={s.required}>*</span></label>
                  <input
                    type="tel" style={{ ...s.input, ...(fieldError("phone") ? s.inputError : {}) }}
                    placeholder="+977-XXXXXXXXXX"
                    value={form.phone}
                    onChange={e => setForm(p => ({...p, phone: e.target.value}))}
                    onBlur={() => handleBlur("phone")}
                  />
                  {fieldError("phone") && <span style={s.errMsg}>{errors.phone}</span>}
                </div>

                {/* Email */}
                <div style={s.field}>
                  <label style={s.fieldLabel}>Email Address</label>
                  <input
                    type="email" style={{ ...s.input, ...(fieldError("email") ? s.inputError : {}) }}
                    placeholder="your@email.com (optional)"
                    value={form.email}
                    onChange={e => setForm(p => ({...p, email: e.target.value}))}
                    onBlur={() => handleBlur("email")}
                  />
                  {fieldError("email") && <span style={s.errMsg}>{errors.email}</span>}
                </div>

                {/* Message */}
                <div style={s.field}>
                  <label style={s.fieldLabel}>Message / Requirement <span style={s.required}>*</span></label>
                  <textarea
                    style={{ ...s.input, ...s.textarea, ...(fieldError("message") ? s.inputError : {}) }}
                    placeholder="Describe the parts you need, machine model, or your query..."
                    value={form.message}
                    onChange={e => setForm(p => ({...p, message: e.target.value}))}
                    onBlur={() => handleBlur("message")}
                  />
                  {fieldError("message") && <span style={s.errMsg}>{errors.message}</span>}
                </div>

                <button type="submit" style={s.submitBtn}>Send Message →</button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const PRIMARY = "#ea580c";

const s = {
  page: { background: "#fafafa", minHeight: "100vh", fontFamily: "'Inter', 'Segoe UI', sans-serif" },
  pageHeader: {
    background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
    padding: "48px 24px 52px", color: "#fff",
  },
  headerInner: { maxWidth: 1100, margin: "0 auto" },
  label: { fontSize: 12, fontWeight: 800, letterSpacing: 3, color: "#f97316", textTransform: "uppercase", marginBottom: 8 },
  htitle: { fontSize: 36, fontWeight: 800, color: "#fff", margin: "0 0 10px", letterSpacing: "-0.01em" },
  hsubtitle: { fontSize: 15, color: "#94a3b8", marginBottom: 0 },
  inner: { maxWidth: 1100, margin: "0 auto", padding: "40px 24px 56px" },
  grid: { display: "grid", gridTemplateColumns: "1fr 1.3fr", gap: 40, alignItems: "start" },
  info: { display: "flex", flexDirection: "column", gap: 14 },
  contactCard: {
    display: "flex", gap: 14, alignItems: "flex-start",
    background: "#fff", borderRadius: 14, padding: "18px 20px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)",
    border: "1px solid #f1f5f9",
  },
  contactIconWrap: {
    fontSize: 20, flexShrink: 0, marginTop: 2,
    width: 42, height: 42, borderRadius: 10,
    background: "#fff7ed", display: "flex", alignItems: "center", justifyContent: "center",
  },
  contactTitle: { fontSize: 12, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 },
  contactDetail: { fontSize: 14, color: "#334155", lineHeight: 1.6, whiteSpace: "pre-line" },
  socialRow: { display: "flex", gap: 10, marginTop: 4 },
  socialBtn: {
    flex: 1, padding: "12px", background: `linear-gradient(135deg, ${PRIMARY}, #f97316)`,
    color: "#fff", borderRadius: 10, textAlign: "center", textDecoration: "none",
    fontSize: 14, fontWeight: 700, transition: "all 0.2s ease",
  },
  formCard: {
    background: "#fff", borderRadius: 18, padding: "36px 32px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.04), 0 8px 32px rgba(0,0,0,0.08)",
    border: "1px solid #f1f5f9",
  },
  formTitle: { fontSize: 22, fontWeight: 800, color: "#0f172a", margin: "0 0 6px" },
  formDesc: { fontSize: 14, color: "#64748b", marginBottom: 24, marginTop: 0 },
  field: { marginBottom: 18 },
  fieldLabel: { display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 7 },
  required: { color: "#ef4444" },
  input: {
    width: "100%", padding: "11px 14px", borderRadius: 10,
    border: "1.5px solid #e2e8f0", fontSize: 14, color: "#0f172a",
    boxSizing: "border-box", outline: "none",
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
    background: "#fafafa",
  },
  inputError: { borderColor: "#ef4444", background: "#fef2f2" },
  textarea: { height: 120, resize: "vertical" },
  errMsg: { display: "block", fontSize: 12, color: "#ef4444", marginTop: 5, fontWeight: 500 },
  submitBtn: {
    width: "100%", padding: "13px",
    background: `linear-gradient(135deg, ${PRIMARY}, #f97316)`,
    color: "#fff", borderRadius: 10, border: "none", fontSize: 15, fontWeight: 700,
    cursor: "pointer", marginTop: 6,
    boxShadow: "0 4px 16px rgba(249,115,22,0.25)",
    transition: "all 0.2s ease",
  },
  successMsg: { textAlign: "center", padding: "40px 0" },
  successIcon: { fontSize: 52, marginBottom: 8 },
  successTitle: { color: "#0f172a", margin: "0 0 8px", fontSize: 22, fontWeight: 800 },
  successDesc: { color: "#64748b", fontSize: 14, margin: "0 0 20px" },
  resetBtn: {
    padding: "11px 28px", background: "#f1f5f9", color: "#475569",
    borderRadius: 10, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 14,
    transition: "all 0.2s ease",
  },
};
