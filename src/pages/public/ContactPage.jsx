import { useState } from "react";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", phone: "", email: "", message: "" });
  const [sent, setSent] = useState(false);

  const handle = (e) => {
    e.preventDefault();
    // In production connect to EmailJS / Firebase / your backend
    setSent(true);
  };

  return (
    <div style={s.page}>
      <div style={s.inner}>
        <p style={s.label}>GET IN TOUCH</p>
        <h1 style={s.title}>Contact Us</h1>
        <p style={s.subtitle}>Have a requirement? Send us a message or call directly.</p>

        <div style={s.grid}>
          {/* Info */}
          <div style={s.info}>
            {[
              { icon:"📍", t:"Address",  d:"Kathmandu, Bagmati Province, Nepal" },
              { icon:"📞", t:"Phone",    d:"+977-01-XXXXXXX\n+977-98XXXXXXXX" },
              { icon:"✉",  t:"Email",    d:"info@manakamana.com.np\nsales@manakamana.com.np" },
              { icon:"🕐", t:"Hours",    d:"Sun – Fri: 9:00 AM – 6:00 PM\nSaturday: 10:00 AM – 4:00 PM" },
            ].map(c => (
              <div key={c.t} style={s.contactCard}>
                <div style={s.contactIcon}>{c.icon}</div>
                <div>
                  <div style={s.contactTitle}>{c.t}</div>
                  <div style={s.contactDetail}>{c.d}</div>
                </div>
              </div>
            ))}

            <div style={s.socialRow}>
              <a href="#" style={s.socialBtn}>WhatsApp</a>
              <a href="#" style={s.socialBtn}>Viber</a>
            </div>
          </div>

          {/* Form */}
          <div style={s.formCard}>
            {sent ? (
              <div style={s.successMsg}>
                <div style={{ fontSize: 48 }}>✅</div>
                <h3 style={{ color: "#0f172a", margin: "12px 0 8px" }}>Message Sent!</h3>
                <p style={{ color: "#64748b", fontSize: 14 }}>We'll get back to you within 24 hours.</p>
                <button style={s.resetBtn} onClick={() => { setSent(false); setForm({ name:"",phone:"",email:"",message:"" }); }}>
                  Send Another
                </button>
              </div>
            ) : (
              <form onSubmit={handle}>
                <h2 style={s.formTitle}>Send a Message</h2>
                {[["name","Your Name","text"],["phone","Phone Number","tel"],["email","Email Address","email"]].map(([k,ph,type])=>(
                  <div key={k} style={s.field}>
                    <label style={s.fieldLabel}>{ph}</label>
                    <input
                      type={type} required style={s.input} placeholder={ph}
                      value={form[k]} onChange={e => setForm(p => ({...p,[k]:e.target.value}))}
                    />
                  </div>
                ))}
                <div style={s.field}>
                  <label style={s.fieldLabel}>Message / Requirement</label>
                  <textarea required style={{...s.input, height:120, resize:"vertical"}}
                    placeholder="Describe the parts you need or your query..."
                    value={form.message} onChange={e => setForm(p => ({...p, message:e.target.value}))} />
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

const s = {
  page: { background: "#f8fafc", minHeight: "100vh", fontFamily: "'Segoe UI', sans-serif" },
  inner: { maxWidth: 1100, margin: "0 auto", padding: "48px 24px" },
  label: { fontSize: 11, fontWeight: 800, letterSpacing: 2, color: "#0ea5e9", textTransform: "uppercase", marginBottom: 8 },
  title: { fontSize: 36, fontWeight: 800, color: "#0f172a", margin: "0 0 12px" },
  subtitle: { fontSize: 15, color: "#64748b", marginBottom: 40 },
  grid: { display: "grid", gridTemplateColumns: "1fr 1.3fr", gap: 40, alignItems: "start" },
  info: { display: "flex", flexDirection: "column", gap: 16 },
  contactCard: { display: "flex", gap: 14, alignItems: "flex-start", background: "#fff", borderRadius: 12, padding: "16px 18px", boxShadow: "0 1px 6px rgba(0,0,0,0.06)" },
  contactIcon: { fontSize: 22, flexShrink: 0, marginTop: 2 },
  contactTitle: { fontSize: 12, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4 },
  contactDetail: { fontSize: 14, color: "#334155", lineHeight: 1.6, whiteSpace: "pre-line" },
  socialRow: { display: "flex", gap: 10 },
  socialBtn: { flex: 1, padding: "10px", background: "#0ea5e9", color: "#fff", borderRadius: 8, textAlign: "center", textDecoration: "none", fontSize: 13, fontWeight: 700 },
  formCard: { background: "#fff", borderRadius: 16, padding: "32px 28px", boxShadow: "0 2px 16px rgba(0,0,0,0.08)" },
  formTitle: { fontSize: 20, fontWeight: 800, color: "#0f172a", margin: "0 0 20px" },
  field: { marginBottom: 16 },
  fieldLabel: { display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6 },
  input: { width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #e2e8f0", fontSize: 14, color: "#0f172a", boxSizing: "border-box", outline: "none" },
  submitBtn: { width: "100%", padding: "12px", background: "#0ea5e9", color: "#fff", borderRadius: 10, border: "none", fontSize: 15, fontWeight: 700, cursor: "pointer", marginTop: 4 },
  successMsg: { textAlign: "center", padding: "32px 0" },
  resetBtn: { marginTop: 16, padding: "10px 24px", background: "#f1f5f9", color: "#475569", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 600 },
};
