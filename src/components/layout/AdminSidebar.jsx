import { Link, useLocation } from "react-router-dom";
import { useContacts } from "../../hooks/useContacts";

const NAV_ITEMS = [
  { to: "/admin", icon: "dashboard", label: "Dashboard", exact: true },
  { to: "/admin/products", icon: "products", label: "Products" },
  { to: "/admin/inventory", icon: "inventory", label: "Inventory" },
  { to: "/admin/invoices", icon: "invoices", label: "Invoices" },
  { to: "/admin/invoice/new", icon: "newInvoice", label: "New Invoice" },
  { to: "/admin/users", icon: "user", label: "Users" },
  { to: "/admin/messages", icon: "messages", label: "Messages" },
  { to: "/admin/customers", icon: "user", label: "Client List" },
];

const ICONS = {
  dashboard: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
  products: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  ),
  inventory: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
      <line x1="12" y1="22" x2="12" y2="12" /><line x1="3.27" y1="6.96" x2="12" y2="12.01" /><line x1="20.73" y1="6.96" x2="12" y2="12.01" />
      <path d="M12 22V12" />
    </svg>
  ),
  invoices: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
    </svg>
  ),
  newInvoice: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  ),
  messages: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </svg>
  ),
user: (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="2"
       strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
),
  home: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" y1="12" x2="3" y2="12" />
    </svg>
  ),
  chevronLeft: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  ),
  chevronRight: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  ),
};

export default function AdminSidebar({ collapsed, onToggle }) {
  const location = useLocation();
  const { unreadCount } = useContacts();

  const isActive = (item) => {
    if (item.exact) return location.pathname === item.to;
    return location.pathname.startsWith(item.to);
  };

  return (
    <aside className="admin-sidebar" style={{ ...st.sidebar, width: collapsed ? 72 : 260 }}>
      {/* Logo */}
      <div style={st.logoArea}>
        <div style={st.logoIcon}>
          <span style={{ fontSize: 18 }}>⚙️</span>
        </div>
        {!collapsed && (
          <div style={st.logoText}>
            <div style={st.logoName}>Manakamana</div>
            <div style={st.logoSub}>Admin Panel</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav style={st.nav}>
        {!collapsed && <div style={st.navLabel}>MENU</div>}
        {NAV_ITEMS.map(item => {
          const active = isActive(item);
          return (
            <Link
              key={item.to}
              to={item.to}
              className="admin-sidebar-link"
              style={{
                ...st.navItem,
                ...(active ? st.navItemActive : {}),
                justifyContent: collapsed ? "center" : "flex-start",
                padding: collapsed ? "11px 0" : "11px 16px",
              }}
              title={collapsed ? item.label : undefined}
            >
              <span style={{ ...st.navIcon, color: active ? "#6366f1" : "#64748b" }}>
                {ICONS[item.icon]}
              </span>
              {!collapsed && (
                <span style={{ ...st.navText, color: active ? "#0f172a" : "#475569", fontWeight: active ? 600 : 500 }}>
                  {item.label}
                </span>
              )}
              {item.icon === "messages" && unreadCount > 0 && (
                <span style={{ ...st.badge, marginLeft: collapsed ? 0 : "auto", position: collapsed ? "absolute" : "static", top: collapsed ? 6 : "auto", right: collapsed ? 10 : "auto" }}>
                  {unreadCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div style={st.bottom}>
        <div style={st.divider} />
        <Link
          to="/"
          className="admin-sidebar-link"
          style={{ ...st.navItem, justifyContent: collapsed ? "center" : "flex-start", padding: collapsed ? "11px 0" : "11px 16px" }}
        >
          <span style={st.navIcon}>{ICONS.home}</span>
          {!collapsed && <span style={st.navText}>Back to Site</span>}
        </Link>
        <button
          onClick={onToggle}
          className="admin-sidebar-toggle"
          style={{ ...st.toggleBtn, justifyContent: collapsed ? "center" : "flex-end" }}
        >
          {collapsed ? ICONS.chevronRight : ICONS.chevronLeft}
        </button>
      </div>
    </aside>
  );
}

const st = {
  sidebar: {
    position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 50,
    background: "#fff",
    borderRight: "1px solid #e5e7eb",
    display: "flex", flexDirection: "column",
    transition: "width 0.25s cubic-bezier(0.4,0,0.2,1)",
    overflow: "hidden",
    flexShrink: 0,
  },
  logoArea: {
    display: "flex", alignItems: "center", gap: 12,
    padding: "20px 20px 16px", borderBottom: "1px solid #f1f5f9",
    minHeight: 64,
  },
  logoIcon: {
    width: 36, height: 36, borderRadius: 10,
    background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
    display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  },
  logoText: { overflow: "hidden", whiteSpace: "nowrap" },
  logoName: { fontSize: 15, fontWeight: 700, color: "#0f172a", lineHeight: 1.2 },
  logoSub: { fontSize: 11, color: "#94a3b8", fontWeight: 500 },
  nav: { flex: 1, padding: "16px 12px", display: "flex", flexDirection: "column", gap: 2, overflowY: "auto" },
  navLabel: { fontSize: 10, fontWeight: 700, color: "#94a3b8", letterSpacing: 1.5, padding: "4px 16px 10px", textTransform: "uppercase" },
  navItem: {
    display: "flex", alignItems: "center", gap: 12,
    borderRadius: 10, textDecoration: "none",
    fontSize: 14, position: "relative",
    transition: "all 0.15s ease",
  },
  navItemActive: {
    background: "#eef2ff",
  },
  navIcon: { display: "flex", alignItems: "center", color: "#64748b", flexShrink: 0 },
  navText: { overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" },
  badge: {
    background: "#ef4444", color: "#fff", fontSize: 10, fontWeight: 700,
    padding: "2px 7px", borderRadius: 10, minWidth: 18, textAlign: "center",
  },
  bottom: { padding: "8px 12px 16px" },
  divider: { height: 1, background: "#f1f5f9", margin: "0 4px 8px" },
  toggleBtn: {
    display: "flex", alignItems: "center", width: "100%",
    padding: "8px 16px", background: "none", border: "none",
    cursor: "pointer", color: "#94a3b8", borderRadius: 8,
  },
};
