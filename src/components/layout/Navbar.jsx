import { useState } from "react";
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

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const active = (to) => location.pathname === to;

  return (
    <nav style={s.nav}>
      <div style={s.inner}>
        {/* Logo */}
        <Link to="/" style={s.logo}>
          <div style={s.logoIcon}>M</div>
          <div>
            <div style={s.logoName}>Manakamana</div>
            <div style={s.logoSub}>Heavy Equipments Pvt. Ltd.</div>
          </div>
        </Link>

        {/* Desktop links */}
        <div className="nav-links" style={s.links}>
          {LINKS.map(l => (
            <Link key={l.to} to={l.to}
              style={{ ...s.link, ...(active(l.to) ? s.linkActive : {}) }}>
              {l.label}
            </Link>
          ))}
          {isAdmin && (
            <Link to="/admin" style={{ ...s.link, ...(location.pathname.startsWith("/admin") ? s.linkActive : {}) }}>
              Admin
            </Link>
          )}
        </div>

        {/* Auth */}
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

          {/* Hamburger */}
          <button className="nav-hamburger" style={s.hamburger} onClick={() => setMenuOpen(v => !v)}>
            <span style={s.bar} />
            <span style={s.bar} />
            <span style={s.bar} />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={s.mobileMenu}>
          {LINKS.map(l => (
            <Link key={l.to} to={l.to} style={s.mobileLink}
              onClick={() => setMenuOpen(false)}>{l.label}</Link>
          ))}
          {isAdmin && (
            <Link to="/admin" style={s.mobileLink} onClick={() => setMenuOpen(false)}>Admin Dashboard</Link>
          )}
          {user
            ? <button onClick={handleLogout} style={s.mobileLinkBtn}>Logout</button>
            : <Link to="/login" style={s.mobileLink} onClick={() => setMenuOpen(false)}>Admin Login</Link>
          }
        </div>
      )}
    </nav>
  );
}

const s = {
  nav: {
    position: "sticky", top: 0, zIndex: 100,
    background: "#fff",
    borderBottom: "1px solid #e2e8f0",
    boxShadow: "0 1px 8px rgba(0,0,0,0.06)",
  },
  inner: {
    maxWidth: 1200, margin: "0 auto", padding: "0 24px",
    height: 64, display: "flex", alignItems: "center",
    justifyContent: "space-between", gap: 16,
  },
  logo: {
    display: "flex", alignItems: "center", gap: 10,
    textDecoration: "none", flexShrink: 0,
  },
  logoIcon: {
    width: 40, height: 40, borderRadius: 10,
    background: "linear-gradient(135deg, #0ea5e9, #0369a1)",
    color: "#fff", fontWeight: 900, fontSize: 20,
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  logoName: { fontSize: 15, fontWeight: 800, color: "#0f172a", lineHeight: 1.2 },
  logoSub:  { fontSize: 10, color: "#64748b", lineHeight: 1.2 },
  links: { display: "flex", alignItems: "center", gap: 4, flex: 1, justifyContent: "center" },
  link: {
    padding: "6px 14px", borderRadius: 8, fontSize: 14, fontWeight: 500,
    color: "#475569", textDecoration: "none", transition: "all 0.15s",
  },
  linkActive: { background: "#eff6ff", color: "#0ea5e9", fontWeight: 700 },
  authArea: { display: "flex", alignItems: "center", gap: 10, flexShrink: 0 },
  ctaBtn: {
    background: "#0ea5e9", color: "#fff", padding: "8px 16px",
    borderRadius: 8, fontSize: 13, fontWeight: 700,
    textDecoration: "none", border: "none", cursor: "pointer",
  },
  logoutBtn: {
    background: "#f1f5f9", color: "#475569", padding: "8px 14px",
    borderRadius: 8, fontSize: 13, fontWeight: 600,
    border: "none", cursor: "pointer",
  },
  hamburger: {
    display: "none", flexDirection: "column", gap: 4,
    background: "none", border: "none", cursor: "pointer", padding: 4,
  },
  bar: { display: "block", width: 22, height: 2, background: "#475569", borderRadius: 2 },
  mobileMenu: {
    background: "#fff", borderTop: "1px solid #e2e8f0",
    padding: "12px 24px 16px", display: "flex", flexDirection: "column", gap: 4,
  },
  mobileLink: {
    padding: "10px 12px", borderRadius: 8, fontSize: 15, fontWeight: 500,
    color: "#334155", textDecoration: "none",
  },
  mobileLinkBtn: {
    padding: "10px 12px", borderRadius: 8, fontSize: 15, fontWeight: 500,
    color: "#ef4444", background: "none", border: "none", cursor: "pointer",
    textAlign: "left",
  },
};