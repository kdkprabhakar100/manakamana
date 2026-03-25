import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useNotifications } from "../../hooks/useNotifications"; // ← shared context
import AdminSidebar from "./AdminSidebar";

export default function AdminLayout({ children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications(); // ← single source of truth
  const [searchValue, setSearchValue] = useState("");
  const navigate = useNavigate();

  const sidebarW = sidebarCollapsed ? 72 : 260;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc", fontFamily: "'Inter','Segoe UI',system-ui,sans-serif" }}>
      <AdminSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(v => !v)} />

      <div
        className="admin-main-area"
        style={{ marginLeft: sidebarW, flex: 1, transition: "margin-left 0.25s cubic-bezier(0.4,0,0.2,1)", display: "flex", flexDirection: "column", minHeight: "100vh" }}
      >
        {/* Top header bar */}
        <header className="admin-topbar" style={st.topbar}>
          <div style={st.topInner}>

            {/* Search */}
            <div style={st.searchWrap}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                type="text"
                placeholder="Search anything..."
                value={searchValue}
                onChange={e => setSearchValue(e.target.value)}
                style={st.searchInput}
              />
              <kbd style={st.kbd}>⌘K</kbd>
            </div>

            {/* Right section */}
            <div style={st.topRight}>

              {/* Bell — navigates to /admin/notification, badge from shared context */}
              <button
                style={st.iconBtn}
                title="Notifications"
                onClick={() => navigate("/admin/notification")}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 01-3.46 0"/>
                </svg>
                {unreadCount > 0 && (
                  <span style={st.notifDot}>{unreadCount}</span>
                )}
              </button>

              {/* Divider */}
              <div style={st.topDivider} />

              {/* User info */}
              <div style={st.userArea}>
                <div style={st.avatar}>
                  {(user?.email || "A")[0].toUpperCase()}
                </div>
                <div className="admin-topbar-user-info" style={st.userInfo}>
                  <div style={st.userName}>Admin</div>
                  <div style={st.userEmail}>{user?.email || ""}</div>
                </div>
              </div>

              <button onClick={logout} style={st.logoutBtn} title="Sign out">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, overflow: "auto" }}>
          {children}
        </main>
      </div>
    </div>
  );
}

const st = {
  topbar: {
    background: "#fff",
    borderBottom: "1px solid #e5e7eb",
    position: "sticky", top: 0, zIndex: 40,
    height: 56,
  },
  topInner: {
    height: "100%", padding: "0 24px",
    display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
  },
  searchWrap: {
    display: "flex", alignItems: "center", gap: 10,
    background: "#f8fafc", border: "1px solid #e5e7eb", borderRadius: 10,
    padding: "8px 14px", width: 360, maxWidth: "100%",
  },
  searchInput: {
    border: "none", outline: "none", background: "none",
    fontSize: 13, color: "#0f172a", flex: 1, fontFamily: "inherit",
  },
  kbd: {
    fontSize: 10, color: "#94a3b8", background: "#f1f5f9",
    border: "1px solid #e2e8f0", borderRadius: 4,
    padding: "2px 6px", fontFamily: "inherit",
  },
  topRight: { display: "flex", alignItems: "center", gap: 12 },
  iconBtn: {
    position: "relative", background: "none", border: "none",
    cursor: "pointer", color: "#64748b", padding: 6, borderRadius: 8,
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  notifDot: {
    position: "absolute", top: 2, right: 2,
    background: "#ef4444", color: "#fff",
    fontSize: 9, fontWeight: 700,
    width: 16, height: 16, borderRadius: "50%",
    display: "flex", alignItems: "center", justifyContent: "center",
    border: "2px solid #fff",
  },
  topDivider: { width: 1, height: 24, background: "#e5e7eb" },
  userArea: { display: "flex", alignItems: "center", gap: 10 },
  avatar: {
    width: 32, height: 32, borderRadius: "50%",
    background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
    color: "#fff", fontSize: 13, fontWeight: 700,
    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  userInfo: { lineHeight: 1.3 },
  userName:  { fontSize: 13, fontWeight: 600, color: "#0f172a" },
  userEmail: { fontSize: 11, color: "#94a3b8" },
  logoutBtn: {
    background: "none", border: "none", cursor: "pointer",
    color: "#94a3b8", padding: 6, borderRadius: 8,
    display: "flex", alignItems: "center", justifyContent: "center",
  },
};