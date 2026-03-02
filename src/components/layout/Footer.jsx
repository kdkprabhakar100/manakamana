import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer style={s.footer}>
      {/* Industrial accent bar */}
      <div style={s.topStripe} />

      {/* Newsletter / CTA strip */}
      <div style={s.ctaStrip}>
        <div style={s.ctaInner}>
          <div>
            <div style={s.ctaTitle}>Need Heavy Equipment Parts?</div>
            <div style={s.ctaDesc}>Get in touch with our experts for the best deals on genuine machinery parts.</div>
          </div>
          <Link to="/contact" style={s.ctaBtn}>Request a Quote &#8594;</Link>
        </div>
      </div>

      <div className="footer-inner" style={s.inner}>
        {/* Brand column */}
        <div style={s.col}>
          <div style={s.brandRow}>
            <div style={s.brandIcon}>
              <span>{"\u2699\uFE0F"}</span>
            </div>
            <div>
              <div style={s.brandName}>MANAKAMANA</div>
              <div style={s.brandSub}>HEAVY EQUIPMENTS</div>
            </div>
          </div>
          <p style={s.tagline}>
            Your trusted partner for heavy machinery parts & equipment solutions across Nepal. Quality, reliability, and value since day one.
          </p>
          <div style={s.socialRow}>
            <a href="https://wa.me/9779851068337" target="_blank" rel="noreferrer" style={s.socialBtn} title="WhatsApp">
              <span role="img" aria-label="whatsapp">💬</span>
            </a>
            <a href="tel:+9779851068337" style={s.socialBtn} title="Call Us">
              <span role="img" aria-label="phone">📞</span>
            </a>
            <a href="mailto:info@manakamana.com.np" style={s.socialBtn} title="Email">
              <span role="img" aria-label="email">✉️</span>
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div style={s.col}>
          <div style={s.colTitle}>Quick Links</div>
          {[["Home","/"],["Products","/products"],["About Us","/about"],["Contact","/contact"]].map(([l,to])=>(
            <Link key={to} to={to} style={s.footLink}>
              <span style={s.linkArrow}>&#9656;</span> {l}
            </Link>
          ))}
        </div>

        {/* Equipment Categories */}
        <div style={s.col}>
          <div style={s.colTitle}>Equipment</div>
          {["Excavators","Bulldozers","Wheel Loaders","Cranes","Dump Trucks","Spare Parts"].map(c=>(
            <Link key={c} to="/products" style={s.footLink}>
              <span style={s.linkArrow}>&#9656;</span> {c}
            </Link>
          ))}
        </div>

        {/* Contact Info */}
        <div style={s.col}>
          <div style={s.colTitle}>Contact Info</div>
          <div style={s.contactItem}>
            <span style={s.contactIcon}>📍</span>
            <span>Kathmandu, Bagmati Province, Nepal</span>
          </div>
          <div style={s.contactItem}>
            <span style={s.contactIcon}>📞</span>
            <a href="tel:+9779851068337" style={s.contactLink}>+977-9851068337</a>
          </div>
          <div style={s.contactItem}>
            <span style={s.contactIcon}>✉️</span>
            <a href="mailto:info@manakamana.com.np" style={s.contactLink}>info@manakamana.com.np</a>
          </div>
          <div style={s.contactItem}>
            <span style={s.contactIcon}>🕐</span>
            <span>Sun - Fri: 9 AM - 6 PM</span>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={s.bottomBar}>
        <div style={s.bottomInner}>
          <span>&copy; {new Date().getFullYear()} Manakamana Heavy Equipments Pvt. Ltd. All rights reserved.</span>
          <div style={s.bottomLinks}>
            <Link to="/about" style={s.bottomLink}>Privacy Policy</Link>
            <span style={s.bottomDot}>&bull;</span>
            <Link to="/about" style={s.bottomLink}>Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

const DARK = "#0f172a";
const DARKER = "#020617";

const s = {
  footer: { background: DARK, color: "#cbd5e1", marginTop: "auto", position: "relative" },
  topStripe: { height: 3, background: "linear-gradient(90deg, #ea580c, #f97316, #fbbf24, #f97316, #ea580c)" },

  ctaStrip: { background: "linear-gradient(135deg, #ea580c, #c2410c)", padding: "0" },
  ctaInner: {
    maxWidth: 1200, margin: "0 auto", padding: "28px 24px",
    display: "flex", alignItems: "center", justifyContent: "space-between",
    flexWrap: "wrap", gap: 16,
  },
  ctaTitle: { fontSize: 18, fontWeight: 800, color: "#fff", marginBottom: 4 },
  ctaDesc: { fontSize: 13, color: "rgba(255,255,255,0.8)" },
  ctaBtn: {
    background: "#fff", color: "#ea580c", padding: "12px 28px", borderRadius: 8,
    fontWeight: 700, fontSize: 14, textDecoration: "none",
    boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
  },

  inner: {
    maxWidth: 1200, margin: "0 auto", padding: "48px 24px 36px",
    display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1.2fr", gap: 40,
  },
  col: { display: "flex", flexDirection: "column", gap: 6 },
  brandRow: { display: "flex", alignItems: "center", gap: 12, marginBottom: 14 },
  brandIcon: {
    width: 42, height: 42, borderRadius: 10,
    background: "linear-gradient(135deg, #ea580c, #f97316)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 20, boxShadow: "0 2px 12px rgba(249,115,22,0.4)",
  },
  brandName: { fontSize: 16, fontWeight: 900, color: "#fff", letterSpacing: 1.5, lineHeight: 1.2 },
  brandSub: { fontSize: 8, color: "#f97316", fontWeight: 700, letterSpacing: 2, lineHeight: 1.2 },
  tagline: { fontSize: 13, color: "#94a3b8", lineHeight: 1.8, maxWidth: 320, margin: "0 0 16px" },
  socialRow: { display: "flex", gap: 8 },
  socialBtn: {
    width: 38, height: 38, borderRadius: 10,
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.08)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 16, textDecoration: "none", transition: "all 0.2s ease",
  },
  colTitle: {
    fontSize: 12, fontWeight: 700, letterSpacing: 1.5, color: "#f97316",
    textTransform: "uppercase", marginBottom: 10,
  },
  footLink: {
    fontSize: 13, color: "#94a3b8", textDecoration: "none", lineHeight: 2.4,
    display: "flex", alignItems: "center", gap: 6,
  },
  linkArrow: { color: "#ea580c", fontSize: 10 },
  contactItem: {
    display: "flex", alignItems: "flex-start", gap: 10,
    fontSize: 13, color: "#94a3b8", margin: "4px 0", lineHeight: 1.6,
  },
  contactIcon: { flexShrink: 0 },
  contactLink: { color: "#94a3b8", textDecoration: "none" },

  bottomBar: { borderTop: "1px solid rgba(255,255,255,0.06)", background: DARKER },
  bottomInner: {
    maxWidth: 1200, margin: "0 auto", padding: "18px 24px",
    display: "flex", justifyContent: "space-between", alignItems: "center",
    fontSize: 12, color: "#475569", flexWrap: "wrap", gap: 8,
  },
  bottomLinks: { display: "flex", alignItems: "center", gap: 8 },
  bottomLink: { color: "#475569", textDecoration: "none", fontSize: 12 },
  bottomDot: { color: "#334155" },
};
