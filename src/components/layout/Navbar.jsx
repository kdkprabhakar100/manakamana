import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useContacts } from "../../hooks/useContacts";

const LINKS = [
  { to: "/", label: "Home" },
  { to: "/products", label: "Products" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const { unreadCount } = useContacts();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const active = (to) => location.pathname === to;

  return (
    <nav style={{ ...s.nav, ...(scrolled ? s.navScrolled : {}) }}>
      {/* Top accent stripe */}
      <div style={s.topStripe} />
      <div style={s.inner}>
        <Link to="/" style={s.logo}>
          <div style={s.logoIcon}>
            <span style={s.logoGear}>{"\u2699\uFE0F"}</span>
          </div>
          <div>
            <div style={s.logoName}>MANAKAMANA</div>
            <div style={s.logoSub}>HEAVY EQUIPMENTS</div>
          </div>
        </Link>

        <div className="nav-links" style={s.links}>
          {LINKS.map(l => (
            <Link key={l.to} to={l.to}
              style={{ ...s.link, ...(active(l.to) ? s.linkActive : {}) }}>
              {l.label}
              {active(l.to) && <span style={s.linkBar} />}
            </Link>
          ))}
          {isAdmin && (
            <Link to="/admin" style={{ ...s.link, ...(location.pathname.startsWith("/admin") ? s.linkActive : {}) }}>
              Admin
              {location.pathname.startsWith("/admin") && <span style={s.linkBar} />}
            </Link>
          )}
          {isAdmin && (
            <Link to="/admin/messages" style={{ ...s.link, ...(location.pathname === "/admin/messages" ? s.linkActive : {}), position: "relative" }}>
              Messages
              {unreadCount > 0 && <span style={s.unreadBadge}>{unreadCount}</span>}
              {location.pathname === "/admin/messages" && <span style={s.linkBar} />}
            </Link>
          )}
        </div>

        <div style={s.authArea}>
          {user ? (
            <>
              {isAdmin && (
                <Link to="/admin/invoice/new" className="nav-cta" style={s.ctaBtn}>
                  + New Invoice
                </Link>
              )}
              <button onClick={handleLogout} className="nav-logout" style={s.logoutBtn}>Logout</button>
            </>
          ) : (
            <Link to="/login" className="nav-cta" style={s.ctaBtn}>Admin Login</Link>
          )}

          <button className="nav-hamburger" style={s.hamburger} onClick={() => setMenuOpen(v => !v)}
            aria-label="Toggle menu">
            <span style={{ ...s.bar, ...(menuOpen ? { transform: "rotate(45deg) translate(5px,5px)" } : {}) }} />
            <span style={{ ...s.bar, ...(menuOpen ? { opacity: 0 } : {}) }} />
            <span style={{ ...s.bar, ...(menuOpen ? { transform: "rotate(-45deg) translate(5px,-5px)" } : {}) }} />
          </button>
        </div>
      </div>

      {menuOpen && (
        <div style={s.mobileMenu}>
          {LINKS.map(l => (
            <Link key={l.to} to={l.to}
              style={{ ...s.mobileLink, ...(active(l.to) ? s.mobileLinkActive : {}) }}
              onClick={() => setMenuOpen(false)}>{l.label}</Link>
          ))}
          {isAdmin && (
            <Link to="/admin" style={s.mobileLink} onClick={() => setMenuOpen(false)}>Admin Dashboard</Link>
          )}
          {isAdmin && (
            <Link to="/admin/messages" style={{ ...s.mobileLink, position: "relative", display: "flex", alignItems: "center", gap: 8 }} onClick={() => setMenuOpen(false)}>
              Messages
              {unreadCount > 0 && <span style={s.unreadBadgeMobile}>{unreadCount}</span>}
            </Link>
          )}
          <div style={s.mobileDivider} />
          {user ? (
            <>
              {isAdmin && (
                <Link to="/admin/invoice/new" style={{ ...s.mobileLink, color: "#f97316", fontWeight: 700 }}
                  onClick={() => setMenuOpen(false)}>+ New Invoice</Link>
              )}
              <button onClick={handleLogout} style={s.mobileLinkBtn}>Logout</button>
            </>
          ) : (
            <Link to="/login" style={{ ...s.mobileLink, color: "#f97316", fontWeight: 700 }}
              onClick={() => setMenuOpen(false)}>Admin Login</Link>
          )}
        </div>
      )}
    </nav>
  );
}

const PRIMARY = "#ea580c";
const DARK = "#0f172a";

const s = {
  nav: {
    position: "sticky", top: 0, zIndex: 100,
    background: "rgba(15,23,42,0.97)",
    backdropFilter: "blur(16px)",
    transition: "all 0.3s ease",
  },
  navScrolled: { boxShadow: "0 4px 24px rgba(0,0,0,0.3)" },
  topStripe: { height: 3, background: "linear-gradient(90deg, #ea580c, #f97316, #fbbf24, #f97316, #ea580c)" },
  inner: {
    maxWidth: 1200, margin: "0 auto", padding: "0 24px",
    height: 72, display: "flex", alignItems: "center",
    justifyContent: "space-between", gap: 16,
  },
  logo: { display: "flex", alignItems: "center", gap: 12, textDecoration: "none", flexShrink: 0 },
  logoIcon: {
    width: 44, height: 44, borderRadius: 10,
    background: "linear-gradient(135deg, #ea580c, #f97316)",
    display: "flex", alignItems: "center", justifyContent: "center",
    boxShadow: "0 2px 12px rgba(249,115,22,0.4)",
  },
  logoGear: { fontSize: 22 },
  logoName: { fontSize: 17, fontWeight: 900, color: "#fff", lineHeight: 1.2, letterSpacing: 1.5 },
  logoSub: { fontSize: 9, color: "#f97316", lineHeight: 1.2, fontWeight: 700, letterSpacing: 2 },
  links: { display: "flex", alignItems: "center", gap: 2, flex: 1, justifyContent: "center" },
  link: {
    position: "relative", padding: "8px 18px", borderRadius: 8, fontSize: 14, fontWeight: 500,
    color: "#94a3b8", textDecoration: "none", transition: "all 0.2s ease",
    display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
  },
  linkActive: { color: "#f97316", fontWeight: 700 },
  linkBar: {
    position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)",
    width: 20, height: 3, borderRadius: 2,
    background: "linear-gradient(90deg, #ea580c, #f97316)",
  },
  authArea: { display: "flex", alignItems: "center", gap: 10, flexShrink: 0 },
  ctaBtn: {
    background: "linear-gradient(135deg, #ea580c, #f97316)", color: "#fff",
    padding: "9px 20px", borderRadius: 8, fontSize: 13, fontWeight: 700,
    textDecoration: "none", border: "none", cursor: "pointer",
    boxShadow: "0 2px 12px rgba(249,115,22,0.3)",
  },
  logoutBtn: {
    background: "rgba(255,255,255,0.08)", color: "#94a3b8", padding: "9px 16px",
    borderRadius: 8, fontSize: 13, fontWeight: 600, border: "1px solid rgba(255,255,255,0.1)",
    cursor: "pointer",
  },
  hamburger: {
    display: "none", flexDirection: "column", gap: 5,
    background: "none", border: "none", cursor: "pointer", padding: 6,
  },
  bar: { display: "block", width: 22, height: 2.5, background: "#94a3b8", borderRadius: 2, transition: "all 0.3s ease" },
  mobileMenu: {
    background: DARK, borderTop: "1px solid rgba(255,255,255,0.06)",
    padding: "8px 24px 16px", display: "flex", flexDirection: "column", gap: 2,
    boxShadow: "0 12px 24px rgba(0,0,0,0.3)",
  },
  mobileLink: {
    padding: "13px 14px", borderRadius: 10, fontSize: 15, fontWeight: 500,
    color: "#94a3b8", textDecoration: "none",
  },
  mobileLinkActive: { background: "rgba(249,115,22,0.1)", color: "#f97316", fontWeight: 700 },
  mobileDivider: { height: 1, background: "rgba(255,255,255,0.06)", margin: "6px 0" },
  mobileLinkBtn: {
    padding: "13px 14px", borderRadius: 10, fontSize: 15, fontWeight: 500,
    color: "#ef4444", background: "none", border: "none", cursor: "pointer", textAlign: "left",
  },
  unreadBadge: {
    position: "absolute", top: 2, right: 2,
    background: "#ef4444", color: "#fff", fontSize: 10, fontWeight: 800,
    minWidth: 18, height: 18, borderRadius: 9, display: "flex",
    alignItems: "center", justifyContent: "center", lineHeight: 1,
    boxShadow: "0 2px 6px rgba(239,68,68,0.4)",
  },
  unreadBadgeMobile: {
    background: "#ef4444", color: "#fff", fontSize: 11, fontWeight: 800,
    padding: "2px 8px", borderRadius: 10, lineHeight: 1,
  },
};
