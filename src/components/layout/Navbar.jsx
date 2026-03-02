import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const LINKS = [
  { to: "/",         label: "Home" },
  { to: "/products", label: "Products" },
  { to: "/about",    label: "About" },
  { to: "/contact",  label: "Contact" },
];

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
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
      <div style={s.inner}>
        <Link to="/" style={s.logo}>
          <div style={s.logoIcon}>M</div>
          <div>
            <div style={s.logoName}>Manakamana</div>
            <div style={s.logoSub}>Heavy Equipments</div>
          </div>
        </Link>

        <div className="nav-links" style={s.links}>
          {LINKS.map(l => (
            <Link key={l.to} to={l.to}
              style={{ ...s.link, ...(active(l.to) ? s.linkActive : {}) }}>
              {l.label}
              {active(l.to) && <span style={s.linkDot} />}
            </Link>
          ))}
          {isAdmin && (
            <Link to="/admin" style={{ ...s.link, ...(location.pathname.startsWith("/admin") ? s.linkActive : {}) }}>
              Admin
              {location.pathname.startsWith("/admin") && <span style={s.linkDot} />}
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

const s = {
  nav: {
    position: "sticky", top: 0, zIndex: 100,
    background: "rgba(255,255,255,0.95)",
    backdropFilter: "blur(12px)",
    borderBottom: "1px solid rgba(226,232,240,0.8)",
    transition: "all 0.3s ease",
  },
  navScrolled: {
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
  },
  inner: {
    maxWidth: 1200, margin: "0 auto", padding: "0 24px",
    height: 68, display: "flex", alignItems: "center",
    justifyContent: "space-between", gap: 16,
  },
  logo: {
    display: "flex", alignItems: "center", gap: 10,
    textDecoration: "none", flexShrink: 0,
  },
  logoIcon: {
    width: 42, height: 42, borderRadius: 10,
    background: "linear-gradient(135deg, #ea580c, #f97316)",
    color: "#fff", fontWeight: 900, fontSize: 20,
    display: "flex", alignItems: "center", justifyContent: "center",
    boxShadow: "0 2px 8px rgba(249,115,22,0.35)",
  },
  logoName: { fontSize: 16, fontWeight: 800, color: "#0f172a", lineHeight: 1.2 },
  logoSub: { fontSize: 10, color: "#64748b", lineHeight: 1.2, fontWeight: 500 },
  links: {
    display: "flex", alignItems: "center", gap: 2,
    flex: 1, justifyContent: "center",
  },
  link: {
    position: "relative",
    padding: "8px 16px", borderRadius: 8, fontSize: 14, fontWeight: 500,
    color: "#475569", textDecoration: "none",
    transition: "all 0.2s ease",
    display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
  },
  linkActive: { color: "#ea580c", fontWeight: 700 },
  linkDot: {
    position: "absolute", bottom: 2,
    width: 5, height: 5, borderRadius: "50%",
    background: "#f97316",
  },
  authArea: { display: "flex", alignItems: "center", gap: 10, flexShrink: 0 },
  ctaBtn: {
    background: "linear-gradient(135deg, #ea580c, #f97316)", color: "#fff",
    padding: "9px 18px", borderRadius: 8, fontSize: 13, fontWeight: 700,
    textDecoration: "none", border: "none", cursor: "pointer",
    boxShadow: "0 2px 8px rgba(249,115,22,0.25)",
    transition: "all 0.2s ease",
  },
  logoutBtn: {
    background: "#f1f5f9", color: "#475569", padding: "9px 16px",
    borderRadius: 8, fontSize: 13, fontWeight: 600,
    border: "none", cursor: "pointer",
    transition: "all 0.2s ease",
  },
  hamburger: {
    display: "none", flexDirection: "column", gap: 5,
    background: "none", border: "none", cursor: "pointer", padding: 6,
  },
  bar: {
    display: "block", width: 22, height: 2.5, background: "#334155", borderRadius: 2,
    transition: "all 0.3s ease",
  },
  mobileMenu: {
    background: "#fff",
    borderTop: "1px solid #f1f5f9",
    padding: "8px 24px 16px",
    display: "flex", flexDirection: "column", gap: 2,
    boxShadow: "0 12px 24px rgba(0,0,0,0.08)",
  },
  mobileLink: {
    padding: "12px 14px", borderRadius: 10, fontSize: 15, fontWeight: 500,
    color: "#334155", textDecoration: "none",
    transition: "background 0.15s ease",
  },
  mobileLinkActive: {
    background: "#fff7ed", color: "#ea580c", fontWeight: 700,
  },
  mobileDivider: {
    height: 1, background: "#f1f5f9", margin: "6px 0",
  },
  mobileLinkBtn: {
    padding: "12px 14px", borderRadius: 10, fontSize: 15, fontWeight: 500,
    color: "#ef4444", background: "none", border: "none", cursor: "pointer",
    textAlign: "left",
  },
};