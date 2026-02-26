import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer style={s.footer}>
      <div style={s.inner}>
        <div style={s.col}>
          <div style={s.brand}>Manakamana Heavy Equipments Pvt. Ltd.</div>
          <p style={s.tagline}>
            Your trusted partner for heavy machinery parts & equipment solutions in Nepal.
          </p>
        </div>
        <div style={s.col}>
          <div style={s.colTitle}>Quick Links</div>
          {[["Home","/"],["Products","/products"],["About","/about"],["Contact","/contact"]].map(([l,to])=>(
            <Link key={to} to={to} style={s.footLink}>{l}</Link>
          ))}
        </div>
        <div style={s.col}>
          <div style={s.colTitle}>Contact</div>
          <p style={s.contactLine}>📍 Kathmandu, Nepal</p>
          <p style={s.contactLine}>📞 +977-01-XXXXXXX</p>
          <p style={s.contactLine}>✉ info@manakamana.com.np</p>
        </div>
      </div>
      <div style={s.bottom}>
        © {new Date().getFullYear()} Manakamana Heavy Equipments Pvt. Ltd. All rights reserved.
      </div>
    </footer>
  );
}

const s = {
  footer: { background: "#0f172a", color: "#cbd5e1", marginTop: "auto" },
  inner: {
    maxWidth: 1200, margin: "0 auto", padding: "48px 24px 32px",
    display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 40,
  },
  brand: { fontSize: 16, fontWeight: 800, color: "#fff", marginBottom: 10 },
  tagline: { fontSize: 13, color: "#94a3b8", lineHeight: 1.7, maxWidth: 280 },
  col: { display: "flex", flexDirection: "column", gap: 6 },
  colTitle: { fontSize: 12, fontWeight: 700, letterSpacing: 1.2, color: "#64748b", textTransform: "uppercase", marginBottom: 8 },
  footLink: { fontSize: 13, color: "#94a3b8", textDecoration: "none", lineHeight: 2 },
  contactLine: { fontSize: 13, color: "#94a3b8", margin: "2px 0" },
  bottom: {
    borderTop: "1px solid #1e293b", padding: "16px 24px",
    textAlign: "center", fontSize: 12, color: "#475569",
    maxWidth: 1200, margin: "0 auto",
  },
};
