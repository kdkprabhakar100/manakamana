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
            <a href="mailto:mhektm@gmail.com" style={s.socialBtn} title="Email">
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
            <a href="mailto:mhektm@gmail.com" style={s.contactLink}>mhektm@gmail.com</a>
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

const DARK = "#0a0a0a";
const DARKER = "#000000";

const s = {
  footer: { background: DARK, color: "#a3a3a3", marginTop: "auto", position: "relative" },
  topStripe: {
    height: 2,
    background: "linear-gradient(90deg, #92400e, #b45309, #d97706, #f59e0b, #d97706, #b45309, #92400e)",
    backgroundSize: "200% 100%",
    animation: "gradientMove 4s ease infinite",
  },

  ctaStrip: { background: DARK, padding: "0", borderBottom: "1px solid rgba(255,255,255,0.06)" },
  ctaInner: {
    maxWidth: 1280, margin: "0 auto", padding: "36px 32px",
    display: "flex", alignItems: "center", justifyContent: "space-between",
    flexWrap: "wrap", gap: 20,
  },
  ctaTitle: { fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 6, fontFamily: "'Space Grotesk','Inter',sans-serif" },
  ctaDesc: { fontSize: 14, color: "#737373" },
  ctaBtn: {
    background: "#fff", color: DARK, padding: "14px 32px", borderRadius: 100,
    fontWeight: 600, fontSize: 14, textDecoration: "none",
    boxShadow: "0 4px 20px rgba(255,255,255,0.06)", letterSpacing: 0.3,
  },

  inner: {
    maxWidth: 1280, margin: "0 auto", padding: "56px 32px 44px",
    display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1.2fr", gap: 48,
  },
  col: { display: "flex", flexDirection: "column", gap: 8 },
  brandRow: { display: "flex", alignItems: "center", gap: 14, marginBottom: 16 },
  brandIcon: {
    width: 42, height: 42, borderRadius: 12,
    background: "linear-gradient(135deg, #92400e, #b45309)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 20, boxShadow: "0 4px 16px rgba(180,83,9,0.25)",
  },
  brandName: { fontSize: 15, fontWeight: 800, color: "#fff", letterSpacing: 2, lineHeight: 1.2, fontFamily: "'Space Grotesk','Inter',sans-serif" },
  brandSub: { fontSize: 8, color: "#d97706", fontWeight: 700, letterSpacing: 3, lineHeight: 1.2, textTransform: "uppercase" },
  tagline: { fontSize: 14, color: "#737373", lineHeight: 1.8, maxWidth: 320, margin: "0 0 20px" },
  socialRow: { display: "flex", gap: 8 },
  socialBtn: {
    width: 40, height: 40, borderRadius: 12,
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.06)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 16, textDecoration: "none", transition: "all 0.3s ease",
  },
  colTitle: {
    fontSize: 11, fontWeight: 700, letterSpacing: 3, color: "#d97706",
    textTransform: "uppercase", marginBottom: 14,
  },
  footLink: {
    fontSize: 14, color: "#737373", textDecoration: "none", lineHeight: 2.4,
    display: "flex", alignItems: "center", gap: 8, transition: "color 0.2s ease",
  },
  linkArrow: { color: "#525252", fontSize: 10 },
  contactItem: {
    display: "flex", alignItems: "flex-start", gap: 12,
    fontSize: 14, color: "#737373", margin: "5px 0", lineHeight: 1.7,
  },
  contactIcon: { flexShrink: 0 },
  contactLink: { color: "#737373", textDecoration: "none" },

  bottomBar: { borderTop: "1px solid rgba(255,255,255,0.04)", background: DARKER },
  bottomInner: {
    maxWidth: 1280, margin: "0 auto", padding: "20px 32px",
    display: "flex", justifyContent: "space-between", alignItems: "center",
    fontSize: 12, color: "#525252", flexWrap: "wrap", gap: 10,
  },
  bottomLinks: { display: "flex", alignItems: "center", gap: 10 },
  bottomLink: { color: "#525252", textDecoration: "none", fontSize: 12 },
  bottomDot: { color: "#404040" },
};
