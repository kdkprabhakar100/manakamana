import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer style={s.footer}>
      <div style={s.topStripe} />
      <div className="footer-inner" style={s.inner}>
        <div style={s.col}>
          <div style={s.brandRow}>
            <div style={s.brandIcon}>M</div>
            <div style={s.brand}>Manakamana Heavy Equipments</div>
          </div>
          <p style={s.tagline}>
            Your trusted partner for heavy machinery parts & equipment solutions across Nepal. Quality, reliability, and value since day one.
          </p>
          <div style={s.socialRow}>
            <a href="https://wa.me/9779851068337" target="_blank" rel="noreferrer" style={s.socialBtn} title="WhatsApp">💬</a>
            <a href="tel:+9779851068337" style={s.socialBtn} title="Call Us">📞</a>
            <a href="mailto:info@manakamana.com.np" style={s.socialBtn} title="Email">✉️</a>
          </div>
        </div>
        <div style={s.col}>
          <div style={s.colTitle}>Quick Links</div>
          {[["Home","/"],["Products","/products"],["About Us","/about"],["Contact","/contact"]].map(([l,to])=>(
            <Link key={to} to={to} style={s.footLink}>{l}</Link>
          ))}
        </div>
        <div style={s.col}>
          <div style={s.colTitle}>Contact Info</div>
          <p style={s.contactLine}>📍 Kathmandu, Bagmati Province, Nepal</p>
          <p style={s.contactLine}>📞 +977-9851068337</p>
          <p style={s.contactLine}>✉️ info@manakamana.com.np</p>
          <p style={s.contactLine}>🕐 Sun – Fri: 9 AM – 6 PM</p>
        </div>
      </div>
      <div style={s.bottom}>
        <span>© {new Date().getFullYear()} Manakamana Heavy Equipments Pvt. Ltd.</span>
        <span style={s.bottomRight}>All rights reserved.</span>
      </div>
    </footer>
  );
}

const s = {
  footer: { background: "#0f172a", color: "#cbd5e1", marginTop: "auto", position: "relative" },
  topStripe: { height: 3, background: "linear-gradient(90deg, #ea580c, #f97316, #fb923c)" },
  inner: {
    maxWidth: 1200, margin: "0 auto", padding: "48px 24px 36px",
    display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 48,
  },
  brandRow: { display: "flex", alignItems: "center", gap: 10, marginBottom: 14 },
  brandIcon: {
    width: 36, height: 36, borderRadius: 8,
    background: "linear-gradient(135deg, #ea580c, #f97316)",
    color: "#fff", fontWeight: 900, fontSize: 18,
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  brand: { fontSize: 16, fontWeight: 800, color: "#fff" },
  tagline: { fontSize: 13, color: "#94a3b8", lineHeight: 1.8, maxWidth: 320, margin: "0 0 16px" },
  socialRow: { display: "flex", gap: 8 },
  socialBtn: {
    width: 38, height: 38, borderRadius: 10,
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.1)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 16, textDecoration: "none",
    transition: "all 0.2s ease",
  },
  col: { display: "flex", flexDirection: "column", gap: 6 },
  colTitle: {
    fontSize: 12, fontWeight: 700, letterSpacing: 1.5, color: "#f97316",
    textTransform: "uppercase", marginBottom: 10,
  },
  footLink: {
    fontSize: 14, color: "#94a3b8", textDecoration: "none", lineHeight: 2.2,
    transition: "color 0.2s ease",
  },
  contactLine: { fontSize: 13, color: "#94a3b8", margin: "3px 0", lineHeight: 1.6 },
  bottom: {
    borderTop: "1px solid #1e293b", padding: "18px 24px",
    display: "flex", justifyContent: "space-between", alignItems: "center",
    fontSize: 12, color: "#475569",
    maxWidth: 1200, margin: "0 auto",
    flexWrap: "wrap", gap: 8,
  },
  bottomRight: { color: "#475569" },
};
