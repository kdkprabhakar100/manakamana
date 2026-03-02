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
      {/* Hero Header */}
      <div style={s.hero}>
        <div style={s.heroOverlay} />
        <div style={s.heroInner}>
          <span style={s.heroBadge}>&#9881; GET IN TOUCH</span>
          <h1 className="page-title" style={s.heroTitle}>Contact Us</h1>
          <p style={s.heroDesc}>
            Need heavy equipment parts or have a question? Our team of experts is ready to help you find exactly what you need.
          </p>
        </div>
      </div>

      <div style={s.contentWrap}>
        <div className="contact-grid" style={s.grid}>
          {/* Contact Info Side */}
          <div style={s.infoSide}>
            <div style={s.infoCard}>
              <h3 style={s.infoCardTitle}>Contact Information</h3>
              <p style={s.infoCardDesc}>Reach out to us through any of the following channels.</p>

              <div style={s.contactList}>
                {[
                  { icon: "\uD83D\uDCCD", t: "Visit Us", d: "Kathmandu, Bagmati Province, Nepal" },
                  { icon: "\uD83D\uDCDE", t: "Call Us", d: "+977-9851068337" },
                  { icon: "\u2709\uFE0F", t: "Email Us", d: "info@manakamana.com.np" },
                  { icon: "\uD83D\uDD50", t: "Working Hours", d: "Sun \u2013 Fri: 9 AM \u2013 6 PM\nSaturday: 10 AM \u2013 4 PM" },
                ].map(c => (
                  <div key={c.t} style={s.contactItem}>
                    <div style={s.contactIconWrap}>{c.icon}</div>
                    <div>
                      <div style={s.contactLabel}>{c.t}</div>
                      <div style={s.contactDetail}>{c.d}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={s.divider} />

              <div style={s.quickActions}>
                <a href="https://wa.me/9779851068337" target="_blank" rel="noreferrer" style={s.waBtn}>
                  \uD83D\uDCAC WhatsApp Us
                </a>
                <a href="tel:+9779851068337" style={s.callBtn}>
                  \uD83D\uDCDE Call Now
                </a>
              </div>
            </div>

            {/* Map placeholder */}
            <div style={s.mapCard}>
              <div style={s.mapPlaceholder}>
                <span style={s.mapIcon}>\uD83D\uDCCD</span>
                <span style={s.mapText}>Kathmandu, Nepal</span>
              </div>
            </div>
          </div>

          {/* Form Side */}
          <div style={s.formCard}>
            {sent ? (
              <div style={s.successMsg}>
                <div style={s.successCheck}>\u2705</div>
                <h3 style={s.successTitle}>Message Sent Successfully!</h3>
                <p style={s.successDesc}>Thank you for reaching out. Our team will get back to you within 24 hours.</p>
                <button style={s.resetBtn} onClick={() => {
                  setSent(false);
                  setForm({ name: "", phone: "", email: "", message: "" });
                  setErrors({});
                  setTouched({});
                }}>Send Another Message</button>
              </div>
            ) : (
              <form onSubmit={handle} noValidate>
                <div style={s.formHeader}>
                  <h2 style={s.formTitle}>Send a Message</h2>
                  <p style={s.formDesc}>Tell us what parts or equipment you need and we will respond promptly.</p>
                </div>

                <div style={s.field}>
                  <label style={s.fieldLabel}>Your Name <span style={s.req}>*</span></label>
                  <input type="text" style={{ ...s.input, ...(fieldError("name") ? s.inputErr : {}) }}
                    placeholder="Enter your full name" value={form.name}
                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    onBlur={() => handleBlur("name")} />
                  {fieldError("name") && <span style={s.errMsg}>{errors.name}</span>}
                </div>

                <div style={s.fieldRow}>
                  <div style={{ ...s.field, flex: 1 }}>
                    <label style={s.fieldLabel}>Phone <span style={s.req}>*</span></label>
                    <input type="tel" style={{ ...s.input, ...(fieldError("phone") ? s.inputErr : {}) }}
                      placeholder="+977-XXXXXXXXXX" value={form.phone}
                      onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                      onBlur={() => handleBlur("phone")} />
                    {fieldError("phone") && <span style={s.errMsg}>{errors.phone}</span>}
                  </div>
                  <div style={{ ...s.field, flex: 1 }}>
                    <label style={s.fieldLabel}>Email</label>
                    <input type="email" style={{ ...s.input, ...(fieldError("email") ? s.inputErr : {}) }}
                      placeholder="your@email.com" value={form.email}
                      onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                      onBlur={() => handleBlur("email")} />
                    {fieldError("email") && <span style={s.errMsg}>{errors.email}</span>}
                  </div>
                </div>

                <div style={s.field}>
                  <label style={s.fieldLabel}>Message / Requirement <span style={s.req}>*</span></label>
                  <textarea style={{ ...s.input, ...s.textarea, ...(fieldError("message") ? s.inputErr : {}) }}
                    placeholder="Describe the parts you need, machine model, quantities, or any specific requirements..."
                    value={form.message}
                    onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                    onBlur={() => handleBlur("message")} />
                  {fieldError("message") && <span style={s.errMsg}>{errors.message}</span>}
                </div>

                <button type="submit" style={s.submitBtn}>Send Message &#8594;</button>
                <p style={s.formNote}>&#128274; Your information is safe and will never be shared.</p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const PRIMARY = "#ea580c";
const DARK = "#0f172a";
const STEEL = "#1e293b";

const s = {
  page: { background: "#f8fafc", minHeight: "100vh", fontFamily: "'Inter','Segoe UI',sans-serif" },

  hero: {
    position: "relative", background: `linear-gradient(135deg, ${DARK} 0%, ${STEEL} 50%, #0c1829 100%)`,
    padding: "56px 24px 52px", overflow: "hidden",
  },
  heroOverlay: {
    position: "absolute", inset: 0, opacity: 0.04,
    backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,0.05) 35px, rgba(255,255,255,0.05) 36px)",
  },
  heroInner: { position: "relative", maxWidth: 1100, margin: "0 auto" },
  heroBadge: {
    display: "inline-block", background: "rgba(249,115,22,0.12)", color: "#f97316",
    fontSize: 11, fontWeight: 700, padding: "6px 16px", borderRadius: 20,
    letterSpacing: 2, marginBottom: 16, border: "1px solid rgba(249,115,22,0.2)",
  },
  heroTitle: { fontSize: 38, fontWeight: 900, color: "#fff", margin: "0 0 12px", lineHeight: 1.15 },
  heroDesc: { fontSize: 15, color: "#94a3b8", lineHeight: 1.7, maxWidth: 600, margin: 0 },

  contentWrap: { maxWidth: 1100, margin: "0 auto", padding: "40px 24px 64px" },
  grid: { display: "grid", gridTemplateColumns: "1fr 1.3fr", gap: 32, alignItems: "start" },

  infoSide: { display: "flex", flexDirection: "column", gap: 20 },
  infoCard: {
    background: DARK, borderRadius: 20, padding: "32px 28px", color: "#fff",
  },
  infoCardTitle: { fontSize: 20, fontWeight: 800, margin: "0 0 6px", color: "#fff" },
  infoCardDesc: { fontSize: 13, color: "#94a3b8", margin: "0 0 24px" },
  contactList: { display: "flex", flexDirection: "column", gap: 18 },
  contactItem: { display: "flex", gap: 14, alignItems: "flex-start" },
  contactIconWrap: {
    width: 42, height: 42, borderRadius: 12, flexShrink: 0,
    background: "rgba(249,115,22,0.1)", display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 18,
  },
  contactLabel: { fontSize: 11, fontWeight: 700, color: "#f97316", textTransform: "uppercase", letterSpacing: 1, marginBottom: 3 },
  contactDetail: { fontSize: 14, color: "#cbd5e1", lineHeight: 1.5, whiteSpace: "pre-line" },
  divider: { height: 1, background: "rgba(255,255,255,0.08)", margin: "24px 0" },
  quickActions: { display: "flex", gap: 10 },
  waBtn: {
    flex: 1, padding: "12px", background: "#22c55e", color: "#fff", borderRadius: 10,
    textAlign: "center", textDecoration: "none", fontSize: 13, fontWeight: 700,
  },
  callBtn: {
    flex: 1, padding: "12px", background: "rgba(255,255,255,0.08)", color: "#fff",
    borderRadius: 10, textAlign: "center", textDecoration: "none", fontSize: 13, fontWeight: 700,
    border: "1px solid rgba(255,255,255,0.1)",
  },

  mapCard: {
    borderRadius: 16, overflow: "hidden", border: "1px solid #e2e8f0",
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
  },
  mapPlaceholder: {
    background: STEEL, height: 140, display: "flex", alignItems: "center",
    justifyContent: "center", gap: 8, flexDirection: "column",
  },
  mapIcon: { fontSize: 28 },
  mapText: { fontSize: 13, color: "#94a3b8", fontWeight: 600 },

  formCard: {
    background: "#fff", borderRadius: 20, padding: "36px 32px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.04), 0 8px 32px rgba(0,0,0,0.08)",
    border: "1px solid #f1f5f9",
  },
  formHeader: { marginBottom: 24 },
  formTitle: { fontSize: 22, fontWeight: 800, color: DARK, margin: "0 0 6px" },
  formDesc: { fontSize: 14, color: "#64748b", margin: 0 },
  field: { marginBottom: 18 },
  fieldRow: { display: "flex", gap: 14 },
  fieldLabel: { display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 7 },
  req: { color: "#ef4444", fontWeight: 700 },
  input: {
    width: "100%", padding: "12px 14px", borderRadius: 10,
    border: "1.5px solid #e2e8f0", fontSize: 14, color: DARK,
    boxSizing: "border-box", outline: "none", background: "#f8fafc",
    transition: "border-color 0.2s ease",
  },
  inputErr: { borderColor: "#ef4444", background: "#fef2f2" },
  textarea: { height: 130, resize: "vertical" },
  errMsg: { display: "block", fontSize: 12, color: "#ef4444", marginTop: 5, fontWeight: 500 },
  submitBtn: {
    width: "100%", padding: "14px",
    background: `linear-gradient(135deg, ${PRIMARY}, #f97316)`,
    color: "#fff", borderRadius: 10, border: "none", fontSize: 15, fontWeight: 700,
    cursor: "pointer", marginTop: 6,
    boxShadow: "0 4px 16px rgba(249,115,22,0.25)",
  },
  formNote: { fontSize: 12, color: "#94a3b8", textAlign: "center", marginTop: 14, marginBottom: 0 },

  successMsg: { textAlign: "center", padding: "48px 0" },
  successCheck: { fontSize: 52, marginBottom: 8 },
  successTitle: { color: DARK, margin: "0 0 8px", fontSize: 22, fontWeight: 800 },
  successDesc: { color: "#64748b", fontSize: 14, margin: "0 0 24px", lineHeight: 1.6 },
  resetBtn: {
    padding: "12px 28px", background: "#f1f5f9", color: "#475569",
    borderRadius: 10, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 14,
  },
};
