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

  const isHome = location.pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const active = (to) => location.pathname === to;

  // Transparent on home hero, solid when scrolled or on other pages
  const transparent = isHome && !scrolled;

  const navStyle = {
    ...s.nav,
    ...(transparent ? s.navTransparent : s.navSolid),
    ...(scrolled ? s.navScrolled : {}),
  };

  const linkColor = transparent ? "rgba(255,255,255,0.8)" : "#525252";
  const linkActiveColor = transparent ? "#fff" : DARK;
  const logoNameColor = transparent ? "#fff" : DARK;
  const barBg = transparent ? "rgba(255,255,255,0.7)" : "#525252";

  return (
    <nav style={navStyle}>
      {/* Top accent stripe */}
      <div style={s.topStripe} />
      <div style={s.inner}>
        <Link to="/" style={s.logo}>
          <div style={s.logoIcon}>
            <span style={s.logoGear}>{"\u2699\uFE0F"}</span>
          </div>
          <div>
            <div style={{ ...s.logoName, color: logoNameColor }}>MANAKAMANA</div>
            <div style={s.logoSub}>HEAVY EQUIPMENTS</div>
          </div>
        </Link>

        <div className="nav-links" style={s.links}>
          {LINKS.map(l => (
            <Link key={l.to} to={l.to}
              className="nav-link-item"
              style={{
                ...s.link,
                color: active(l.to) ? linkActiveColor : linkColor,
                ...(active(l.to) ? {
                  fontWeight: 600,
                  background: transparent ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.04)",
                } : {}),
              }}>
              {l.label}
              {active(l.to) && <span style={s.linkBar} />}
            </Link>
          ))}
          {isAdmin && (
            <Link to="/admin" className="nav-link-item" style={{
              ...s.link,
              color: location.pathname.startsWith("/admin") ? linkActiveColor : linkColor,
              ...(location.pathname.startsWith("/admin") ? {
                fontWeight: 600, background: transparent ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.04)",
              } : {}),
            }}>
              Admin
              {location.pathname.startsWith("/admin") && <span style={s.linkBar} />}
            </Link>
          )}
          {isAdmin && (
            <Link to="/admin/messages" className="nav-link-item" style={{
              ...s.link,
              color: location.pathname === "/admin/messages" ? linkActiveColor : linkColor,
              position: "relative",
            }}>
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
              <button onClick={handleLogout} className="nav-logout" style={{
                ...s.logoutBtn,
                color: transparent ? "rgba(255,255,255,0.7)" : "#737373",
                borderColor: transparent ? "rgba(255,255,255,0.15)" : "#e5e5e5",
              }}>Logout</button>
            </>
          ) : (
            <Link to="/login" className="nav-cta" style={s.loginBtn}>
              <span style={s.loginIcon}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
              </span>
              Admin Login
            </Link>
          )}

          <button className="nav-hamburger" style={s.hamburger} onClick={() => setMenuOpen(v => !v)}
            aria-label="Toggle menu">
            <span style={{ ...s.bar, background: barBg, ...(menuOpen ? { transform: "rotate(45deg) translate(5px,5px)" } : {}) }} />
            <span style={{ ...s.bar, background: barBg, ...(menuOpen ? { opacity: 0 } : {}) }} />
            <span style={{ ...s.bar, background: barBg, ...(menuOpen ? { transform: "rotate(-45deg) translate(5px,-5px)" } : {}) }} />
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
                <Link to="/admin/invoice/new" style={{ ...s.mobileLink, color: "#d97706", fontWeight: 700 }}
                  onClick={() => setMenuOpen(false)}>+ New Invoice</Link>
              )}
              <button onClick={handleLogout} style={s.mobileLinkBtn}>Logout</button>
            </>
          ) : (
            <Link to="/login" style={{ ...s.mobileLink, color: "#d97706", fontWeight: 700 }}
              onClick={() => setMenuOpen(false)}>Admin Login</Link>
          )}
        </div>
      )}
    </nav>
  );
}

const PRIMARY = "#b45309";
const ACCENT = "#d97706";
const DARK = "#0a0a0a";

const s = {
  nav: {
    position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
    transition: "all 0.4s cubic-bezier(0.16,1,0.3,1)",
  },
  navTransparent: {
    background: "transparent",
    borderBottom: "1px solid transparent",
  },
  navSolid: {
    background: "rgba(255,255,255,0.85)",
    backdropFilter: "blur(24px) saturate(180%)",
    WebkitBackdropFilter: "blur(24px) saturate(180%)",
    borderBottom: "1px solid rgba(0,0,0,0.06)",
  },
  navScrolled: {
    boxShadow: "0 4px 30px rgba(0,0,0,0.08)",
    background: "rgba(255,255,255,0.92)",
    backdropFilter: "blur(24px) saturate(180%)",
    WebkitBackdropFilter: "blur(24px) saturate(180%)",
  },
  topStripe: {
    height: 3,
    background: "linear-gradient(90deg, #92400e, #b45309, #d97706, #f59e0b, #d97706, #b45309, #92400e)",
    backgroundSize: "200% 100%",
    animation: "gradientMove 4s ease infinite",
  },
  inner: {
    maxWidth: 1280, margin: "0 auto", padding: "0 32px",
    height: 72, display: "flex", alignItems: "center",
    justifyContent: "space-between", gap: 20,
  },
  logo: { display: "flex", alignItems: "center", gap: 14, textDecoration: "none", flexShrink: 0 },
  logoIcon: {
    width: 44, height: 44, borderRadius: 14,
    background: "linear-gradient(135deg, #92400e, #d97706)",
    display: "flex", alignItems: "center", justifyContent: "center",
    boxShadow: "0 4px 20px rgba(217,119,6,0.35)",
  },
  logoGear: { fontSize: 22 },
  logoName: { fontSize: 16, fontWeight: 800, color: DARK, lineHeight: 1.2, letterSpacing: 2, fontFamily: "'Space Grotesk','Inter',sans-serif", transition: "color 0.3s ease" },
  logoSub: { fontSize: 9, color: ACCENT, lineHeight: 1.2, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase" },
  links: { display: "flex", alignItems: "center", gap: 4, flex: 1, justifyContent: "center" },
  link: {
    position: "relative", padding: "8px 20px", borderRadius: 100, fontSize: 14, fontWeight: 500,
    color: "#525252", textDecoration: "none", transition: "all 0.3s ease",
    display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
  },
  linkBar: {
    position: "absolute", bottom: 2, left: "50%", transform: "translateX(-50%)",
    width: 16, height: 2, borderRadius: 1,
    background: ACCENT,
  },
  authArea: { display: "flex", alignItems: "center", gap: 10, flexShrink: 0 },
  ctaBtn: {
    background: DARK, color: "#fff",
    padding: "10px 22px", borderRadius: 100, fontSize: 13, fontWeight: 600,
    textDecoration: "none", border: "none", cursor: "pointer",
    letterSpacing: 0.3,
    boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
  },
  loginBtn: {
    background: "linear-gradient(135deg, #92400e, #d97706)",
    color: "#fff",
    padding: "10px 24px", borderRadius: 100, fontSize: 13, fontWeight: 600,
    textDecoration: "none", border: "none", cursor: "pointer",
    letterSpacing: 0.3,
    boxShadow: "0 4px 20px rgba(217,119,6,0.3)",
    display: "inline-flex", alignItems: "center", gap: 8,
  },
  loginIcon: { display: "flex", alignItems: "center" },
  logoutBtn: {
    background: "transparent", color: "#737373", padding: "10px 18px",
    borderRadius: 100, fontSize: 13, fontWeight: 500, border: "1px solid #e5e5e5",
    cursor: "pointer", transition: "all 0.3s ease",
  },
  hamburger: {
    display: "none", flexDirection: "column", gap: 5,
    background: "none", border: "none", cursor: "pointer", padding: 6,
  },
  bar: { display: "block", width: 20, height: 2, background: "#525252", borderRadius: 2, transition: "all 0.3s ease" },
  mobileMenu: {
    background: "rgba(255,255,255,0.97)", backdropFilter: "blur(24px)",
    WebkitBackdropFilter: "blur(24px)",
    borderTop: "1px solid rgba(0,0,0,0.04)",
    padding: "10px 24px 20px", display: "flex", flexDirection: "column", gap: 2,
    boxShadow: "0 20px 60px rgba(0,0,0,0.1)",
    animation: "slideDown 0.3s cubic-bezier(0.16,1,0.3,1)",
  },
  mobileLink: {
    padding: "14px 16px", borderRadius: 12, fontSize: 15, fontWeight: 500,
    color: "#525252", textDecoration: "none",
  },
  mobileLinkActive: { background: "rgba(217,119,6,0.06)", color: DARK, fontWeight: 600 },
  mobileDivider: { height: 1, background: "rgba(0,0,0,0.04)", margin: "8px 0" },
  mobileLinkBtn: {
    padding: "14px 16px", borderRadius: 12, fontSize: 15, fontWeight: 500,
    color: "#dc2626", background: "none", border: "none", cursor: "pointer", textAlign: "left",
  },
  unreadBadge: {
    position: "absolute", top: 2, right: 2,
    background: "#dc2626", color: "#fff", fontSize: 10, fontWeight: 800,
    minWidth: 18, height: 18, borderRadius: 9, display: "flex",
    alignItems: "center", justifyContent: "center", lineHeight: 1,
    boxShadow: "0 2px 8px rgba(220,38,38,0.4)",
  },
  unreadBadgeMobile: {
    background: "#dc2626", color: "#fff", fontSize: 11, fontWeight: 800,
    padding: "2px 8px", borderRadius: 10, lineHeight: 1,
  },
};
