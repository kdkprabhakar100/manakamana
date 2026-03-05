import { useState } from "react";
import { useContacts } from "../../hooks/useContacts";
import { useToast } from "../../components/common/Toast";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", phone: "", email: "", message: "" });
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const { addContact } = useContacts();
  const toast = useToast();

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

  const handle = async (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    setTouched({ name: true, phone: true, email: true, message: true });
    if (Object.keys(errs).length > 0) return;
    setSubmitting(true);
    try {
      await addContact({
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        message: form.message.trim(),
      });
      setSent(true);
      toast.success("Message sent successfully! We'll get back to you soon.");
    } catch (err) {
      console.error("Failed to send message:", err);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setSubmitting(false);
    }
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
                  {"\uD83D\uDCAC"} WhatsApp Us
                </a>
                <a href="tel:+9779851068337" style={s.callBtn}>
                  {"\uD83D\uDCDE"} Call Now
                </a>
              </div>
            </div>

            {/* Map placeholder */}
            <div style={s.mapCard}>
              <div style={s.mapPlaceholder}>
                <span style={s.mapIcon}>{"\uD83D\uDCCD"}</span>
                <span style={s.mapText}>Kathmandu, Nepal</span>
              </div>
            </div>
          </div>

          {/* Form Side */}
          <div style={s.formCard}>
            {sent ? (
              <div style={s.successMsg}>
                <div style={s.successCheck}>{"\u2705"}</div>
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

                <button type="submit" style={{ ...s.submitBtn, opacity: submitting ? 0.7 : 1 }} disabled={submitting}>
                  {submitting ? "Sending…" : "Send Message →"}
                </button>
                <p style={s.formNote}>&#128274; Your information is safe and will never be shared.</p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const PRIMARY = "#b45309";
const ACCENT = "#d97706";
const DARK = "#0a0a0a";
const STEEL = "#171717";

const s = {
  page: { background: "#fafafa", minHeight: "100vh", fontFamily: "'Inter',system-ui,sans-serif" },

  hero: {
    position: "relative", background: DARK,
    padding: "80px 32px 64px", overflow: "hidden",
  },
  heroOverlay: {
    position: "absolute", inset: 0,
    background: "radial-gradient(circle at 60% 50%, rgba(217,119,6,0.05) 0%, transparent 50%)",
  },
  heroInner: { position: "relative", maxWidth: 1280, margin: "0 auto" },
  heroBadge: {
    display: "inline-block", background: "rgba(217,119,6,0.08)", color: "#f59e0b",
    fontSize: 11, fontWeight: 700, padding: "8px 20px", borderRadius: 100,
    letterSpacing: 3, marginBottom: 20, border: "1px solid rgba(217,119,6,0.15)",
  },
  heroTitle: { fontSize: 48, fontWeight: 800, color: "#fff", margin: "0 0 16px", lineHeight: 1.1, letterSpacing: "-0.03em", fontFamily: "'Space Grotesk','Inter',sans-serif" },
  heroDesc: { fontSize: 16, color: "#a3a3a3", lineHeight: 1.8, maxWidth: 600, margin: 0 },

  contentWrap: { maxWidth: 1280, margin: "0 auto", padding: "48px 32px 80px" },
  grid: { display: "grid", gridTemplateColumns: "1fr 1.3fr", gap: 36, alignItems: "start" },

  infoSide: { display: "flex", flexDirection: "column", gap: 24 },
  infoCard: {
    background: DARK, borderRadius: 28, padding: "36px 32px", color: "#fff",
  },
  infoCardTitle: { fontSize: 22, fontWeight: 700, margin: "0 0 8px", color: "#fff", fontFamily: "'Space Grotesk','Inter',sans-serif" },
  infoCardDesc: { fontSize: 14, color: "#737373", margin: "0 0 28px" },
  contactList: { display: "flex", flexDirection: "column", gap: 20 },
  contactItem: { display: "flex", gap: 16, alignItems: "flex-start" },
  contactIconWrap: {
    width: 44, height: 44, borderRadius: 14, flexShrink: 0,
    background: "rgba(217,119,6,0.08)", display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 18,
  },
  contactLabel: { fontSize: 11, fontWeight: 700, color: "#d97706", textTransform: "uppercase", letterSpacing: 2, marginBottom: 4 },
  contactDetail: { fontSize: 15, color: "#d4d4d4", lineHeight: 1.6, whiteSpace: "pre-line" },
  divider: { height: 1, background: "rgba(255,255,255,0.06)", margin: "28px 0" },
  quickActions: { display: "flex", gap: 10 },
  waBtn: {
    flex: 1, padding: "14px", background: "#22c55e", color: "#fff", borderRadius: 14,
    textAlign: "center", textDecoration: "none", fontSize: 13, fontWeight: 700,
  },
  callBtn: {
    flex: 1, padding: "14px", background: "rgba(255,255,255,0.04)", color: "#fff",
    borderRadius: 14, textAlign: "center", textDecoration: "none", fontSize: 13, fontWeight: 700,
    border: "1px solid rgba(255,255,255,0.08)",
  },

  mapCard: {
    borderRadius: 20, overflow: "hidden", border: "1px solid #e5e5e5",
  },
  mapPlaceholder: {
    background: STEEL, height: 160, display: "flex", alignItems: "center",
    justifyContent: "center", gap: 10, flexDirection: "column",
  },
  mapIcon: { fontSize: 28 },
  mapText: { fontSize: 13, color: "#737373", fontWeight: 600 },

  formCard: {
    background: "#fff", borderRadius: 28, padding: "44px 36px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 40px rgba(0,0,0,0.06)",
    border: "1px solid #f5f5f5",
  },
  formHeader: { marginBottom: 32 },
  formTitle: { fontSize: 24, fontWeight: 800, color: DARK, margin: "0 0 8px", fontFamily: "'Space Grotesk','Inter',sans-serif" },
  formDesc: { fontSize: 15, color: "#737373", margin: 0 },
  field: { marginBottom: 22 },
  fieldRow: { display: "flex", gap: 16 },
  fieldLabel: { display: "block", fontSize: 13, fontWeight: 600, color: "#262626", marginBottom: 8, letterSpacing: 0.3 },
  req: { color: "#dc2626", fontWeight: 700 },
  input: {
    width: "100%", padding: "14px 16px", borderRadius: 14,
    border: "1.5px solid #e5e5e5", fontSize: 15, color: DARK,
    boxSizing: "border-box", outline: "none", background: "#fafafa",
    transition: "all 0.3s cubic-bezier(0.16,1,0.3,1)",
  },
  inputErr: { borderColor: "#dc2626", background: "#fef2f2" },
  textarea: { height: 140, resize: "vertical" },
  errMsg: { display: "block", fontSize: 12, color: "#dc2626", marginTop: 6, fontWeight: 500 },
  submitBtn: {
    width: "100%", padding: "16px",
    background: DARK,
    color: "#fff", borderRadius: 14, border: "none", fontSize: 15, fontWeight: 600,
    cursor: "pointer", marginTop: 8,
    letterSpacing: 0.3,
    boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
  },
  formNote: { fontSize: 12, color: "#a3a3a3", textAlign: "center", marginTop: 16, marginBottom: 0 },

  successMsg: { textAlign: "center", padding: "60px 0" },
  successCheck: { fontSize: 52, marginBottom: 10 },
  successTitle: { color: DARK, margin: "0 0 10px", fontSize: 24, fontWeight: 800, fontFamily: "'Space Grotesk','Inter',sans-serif" },
  successDesc: { color: "#737373", fontSize: 15, margin: "0 0 28px", lineHeight: 1.7 },
  resetBtn: {
    padding: "14px 32px", background: "#fafafa", color: "#525252",
    borderRadius: 14, border: "1px solid #e5e5e5", cursor: "pointer", fontWeight: 600, fontSize: 14,
  },
};
