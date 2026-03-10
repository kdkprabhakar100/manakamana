import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useProducts } from "../../hooks/useProducts";
import { useInvoices } from "../../hooks/useInvoices";
import { useContacts } from "../../hooks/useContacts";

/* ── SVG Icons (Lucide-style) ────────────────────────────────────────── */
const ICON = {
  package: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
  fileText: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  dollar: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>,
  mail: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22 6 12 13 2 6"/></svg>,
  plus: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>,
  box: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>,
  msgSquare: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>,
  download: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  eye: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
};

/* ── Revenue mini-chart (pure SVG) ───────────────────────────────────── */
function RevenueChart({ invoices }) {
  const monthlyData = useMemo(() => {
    const months = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      months[key] = { label: d.toLocaleString("en-US", { month: "short" }), total: 0 };
    }
    invoices.forEach(inv => {
      let date = null;
      if (inv.createdAt?.toDate) date = inv.createdAt.toDate();
      else if (inv.invoiceDate) date = new Date(inv.invoiceDate);
      if (!date) return;
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      if (months[key]) months[key].total += inv.total || 0;
    });
    return Object.values(months);
  }, [invoices]);

  const maxVal = Math.max(...monthlyData.map(d => d.total), 1);
  const chartW = 100;
  const chartH = 40;
  const points = monthlyData.map((d, i) => {
    const x = (i / (monthlyData.length - 1)) * chartW;
    const y = chartH - (d.total / maxVal) * (chartH - 4);
    return `${x},${y}`;
  });
  const areaPoints = `0,${chartH} ${points.join(" ")} ${chartW},${chartH}`;

  return (
    <div className="admin-card" style={st.chartCard}>
      <div style={st.chartHeader}>
        <div>
          <h3 style={st.chartTitle}>Revenue Overview</h3>
          <p style={st.chartSub}>Last 6 months</p>
        </div>
        <div style={st.chartTotal}>
          <span style={st.chartTotalValue}>₹{invoices.reduce((s, inv) => s + (inv.total || 0), 0).toLocaleString("en-IN")}</span>
          <span style={st.chartTotalLabel}>Total Revenue</span>
        </div>
      </div>
      <div style={{ padding: "16px 0 0" }}>
        <svg viewBox={`0 0 ${chartW} ${chartH + 2}`} style={{ width: "100%", height: 160 }} preserveAspectRatio="none">
          <defs>
            <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.01" />
            </linearGradient>
          </defs>
          <polygon points={areaPoints} fill="url(#chartGrad)" />
          <polyline points={points.join(" ")} fill="none" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          {monthlyData.map((d, i) => {
            const x = (i / (monthlyData.length - 1)) * chartW;
            const y = chartH - (d.total / maxVal) * (chartH - 4);
            return <circle key={i} cx={x} cy={y} r="1.8" fill="#fff" stroke="#6366f1" strokeWidth="1.2" />;
          })}
        </svg>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 4px 0" }}>
          {monthlyData.map((d, i) => (
            <span key={i} style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500 }}>{d.label}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Activity Feed ───────────────────────────────────────────────────── */
function ActivityFeed({ invoices, contacts }) {
  const items = useMemo(() => {
    const list = [];
    invoices.slice(0, 3).forEach(inv => {
      list.push({
        type: "invoice",
        text: `Invoice #${inv.invoiceNo || "—"} created for ${inv.clientName || "a client"}`,
        detail: `₹${(inv.total || 0).toLocaleString("en-IN")}`,
        time: inv.createdAt?.toDate ? inv.createdAt.toDate() : inv.invoiceDate ? new Date(inv.invoiceDate) : null,
        color: "#6366f1",
        bg: "#eef2ff",
      });
    });
    contacts.slice(0, 2).forEach(c => {
      list.push({
        type: "message",
        text: `New message from ${c.name}`,
        detail: c.message?.slice(0, 50) + (c.message?.length > 50 ? "…" : ""),
        time: c.createdAt?.toDate ? c.createdAt.toDate() : null,
        color: "#10b981",
        bg: "#ecfdf5",
      });
    });
    list.sort((a, b) => (b.time?.getTime() || 0) - (a.time?.getTime() || 0));
    return list.slice(0, 5);
  }, [invoices, contacts]);

  const timeAgo = (d) => {
    if (!d) return "";
    const diff = Date.now() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  return (
    <div className="admin-card" style={st.activityCard}>
      <h3 style={st.sectionTitle}>Recent Activity</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        {items.length === 0 && <p style={{ color: "#94a3b8", fontSize: 13, padding: 12 }}>No recent activity</p>}
        {items.map((item, i) => (
          <div key={i} style={{ ...st.actItem, borderBottom: i < items.length - 1 ? "1px solid #f1f5f9" : "none" }}>
            <div style={{ ...st.actDot, background: item.bg }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: item.color }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={st.actText}>{item.text}</div>
              {item.detail && <div style={st.actDetail}>{item.detail}</div>}
            </div>
            <div style={st.actTime}>{timeAgo(item.time)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Main Dashboard ──────────────────────────────────────────────────── */
export default function AdminDashboard() {
  const { products } = useProducts();
  const { invoices } = useInvoices();
  const { contacts, unreadCount } = useContacts();

  const totalRevenue = invoices.reduce((s, inv) => s + (inv.total || 0), 0);
  const recentInvoices = invoices.slice(0, 6);
  const lowStockProducts = products.filter(p => p.quantity !== undefined && p.quantity < 5);

  const stats = [
    { icon: ICON.package, label: "Total Products", value: products.length, change: `${products.length}`, color: "#6366f1", bg: "#eef2ff" },
    { icon: ICON.fileText, label: "Total Invoices", value: invoices.length, change: `${invoices.length}`, color: "#f59e0b", bg: "#fffbeb" },
    { icon: ICON.dollar, label: "Total Revenue", value: `₹${totalRevenue.toLocaleString("en-IN")}`, change: "all time", color: "#10b981", bg: "#ecfdf5" },
    { icon: ICON.mail, label: "Messages", value: contacts.length, change: unreadCount > 0 ? `${unreadCount} new` : "All read", color: unreadCount > 0 ? "#ef4444" : "#8b5cf6", bg: unreadCount > 0 ? "#fef2f2" : "#f5f3ff" },
  ];

  const quickActions = [
    { to: "/admin/invoice/new", icon: ICON.plus, label: "Create Invoice", color: "#6366f1" },
    { to: "/admin/products", icon: ICON.box, label: "Add Product", color: "#f59e0b" },
    { to: "/admin/messages", icon: ICON.msgSquare, label: "View Messages", color: "#10b981" },
    { to: "/admin/invoices", icon: ICON.download, label: "All Invoices", color: "#8b5cf6" },
  ];

  const getStatusBadge = (inv) => {
    if (inv.status === "paid") return { text: "Paid", bg: "#ecfdf5", color: "#059669" };
    if (inv.status === "overdue") return { text: "Overdue", bg: "#fef2f2", color: "#dc2626" };
    if (inv.docType === "Invoice") return { text: "Pending", bg: "#fffbeb", color: "#d97706" };
    return { text: inv.docType || "Estimate", bg: "#f0f9ff", color: "#0284c7" };
  };

  return (
    <div style={st.page}>
      {/* Page heading */}
      <div className="admin-page-head" style={st.pageHead}>
        <div>
          <h1 style={st.pageTitle}>Dashboard</h1>
          <p style={st.pageSub}>Welcome back. Here's what's happening today.</p>
        </div>
        <div style={st.headActions}>
          <Link to="/admin/invoice/new" className="admin-cta-btn" style={st.primaryBtn}>
            {ICON.plus}
            <span>New Invoice</span>
          </Link>
        </div>
      </div>

      {/* Stats Row */}
      <div className="admin-stats-grid" style={st.statsGrid}>
        {stats.map(s => (
          <div key={s.label} className="admin-stat-card" style={st.statCard}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ ...st.statIconWrap, background: s.bg }}>
                <span style={{ color: s.color, display: "flex" }}>{s.icon}</span>
              </div>
              <span style={{ ...st.statChange, color: s.color }}>{s.change}</span>
            </div>
            <div style={st.statValue}>{s.value}</div>
            <div style={st.statLabel}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Notifications (low stock) */}
      {lowStockProducts.length > 0 && (
        <div style={st.alertBanner}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={st.alertIcon}>⚠️</span>
            <div>
              <strong style={{ fontSize: 13, color: "#92400e" }}>Low Stock Alert</strong>
              <span style={{ fontSize: 13, color: "#a16207", marginLeft: 8 }}>
                {lowStockProducts.map(p => `${p.name} (${p.quantity} left)`).join(", ")}
              </span>
            </div>
          </div>
          <Link to="/admin/products" style={st.alertLink}>Manage Stock →</Link>
        </div>
      )}

      {/* Chart + Activity Row */}
      <div className="admin-chart-row" style={st.chartRow}>
        <RevenueChart invoices={invoices} />
        <ActivityFeed invoices={invoices} contacts={contacts} />
      </div>

      {/* Quick Actions */}
      <div style={st.qaSection}>
        <h3 style={st.sectionTitle}>Quick Actions</h3>
        <div className="admin-qa-grid" style={st.qaGrid}>
          {quickActions.map(qa => (
            <Link key={qa.label} to={qa.to} className="admin-qa-card" style={st.qaCard}>
              <div style={{ ...st.qaIconWrap, background: qa.color + "14", color: qa.color }}>
                {qa.icon}
              </div>
              <span style={st.qaLabel}>{qa.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Invoices Table */}
      {recentInvoices.length > 0 && (
        <div className="admin-card" style={st.tableCard}>
          <div style={st.tableHeader}>
            <h3 style={st.sectionTitle}>Recent Invoices</h3>
            <Link to="/admin/invoices" style={st.viewAll}>View all →</Link>
          </div>
          <div className="table-wrap" style={{ overflowX: "auto" }}>
            <table style={st.table}>
              <thead>
                <tr>
                  {["Invoice", "Client", "Status", "Date", "Amount", ""].map(h => (
                    <th key={h} style={st.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentInvoices.map((inv) => {
                  const badge = getStatusBadge(inv);
                  return (
                    <tr key={inv.id} className="admin-table-row" style={st.tr}>
                      <td style={st.td}>
                        <span style={st.invNo}>{inv.invoiceNo || "—"}</span>
                      </td>
                      <td style={st.td}>
                        <div style={st.clientCell}>
                          <div style={st.clientAvatar}>{(inv.clientName || "?")[0].toUpperCase()}</div>
                          <span>{inv.clientName || "—"}</span>
                        </div>
                      </td>
                      <td style={st.td}>
                        <span style={{ ...st.statusBadge, background: badge.bg, color: badge.color }}>
                          {badge.text}
                        </span>
                      </td>
                      <td style={{ ...st.td, color: "#64748b" }}>{inv.invoiceDate || "—"}</td>
                      <td style={{ ...st.td, fontWeight: 600, color: "#0f172a" }}>₹{(inv.total || 0).toLocaleString("en-IN")}</td>
                      <td style={st.td}>
                        <Link to={`/admin/invoice/${inv.id}`} className="admin-view-btn" style={st.viewBtn}>
                          {ICON.eye}
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent Messages */}
      {contacts.length > 0 && (
        <div className="admin-card" style={{ ...st.tableCard, marginBottom: 32 }}>
          <div style={st.tableHeader}>
            <h3 style={st.sectionTitle}>Recent Messages</h3>
            <Link to="/admin/messages" style={st.viewAll}>View all →</Link>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {contacts.slice(0, 4).map((c, i) => (
              <div key={c.id} className="admin-msg-row" style={{ ...st.msgRow, borderBottom: i < 3 ? "1px solid #f1f5f9" : "none" }}>
                <div style={{ ...st.msgAvatar, background: c.read ? "#e2e8f0" : "linear-gradient(135deg,#6366f1,#8b5cf6)", color: c.read ? "#64748b" : "#fff" }}>
                  {(c.name || "?")[0].toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontWeight: 600, fontSize: 13, color: "#0f172a" }}>{c.name}</span>
                    {!c.read && <span style={st.newBadge}>NEW</span>}
                  </div>
                  <div style={{ fontSize: 12, color: "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.message}</div>
                </div>
                <div style={{ fontSize: 11, color: "#94a3b8", whiteSpace: "nowrap", flexShrink: 0 }}>
                  {c.createdAt?.toDate ? c.createdAt.toDate().toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : ""}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Styles ──────────────────────────────────────────────────────────── */
const st = {
  page: { padding: "28px 32px 48px", maxWidth: 1200, margin: "0 auto", fontFamily: "'Inter',system-ui,sans-serif" },

  /* Page head */
  pageHead: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28, flexWrap: "wrap", gap: 16 },
  pageTitle: { fontSize: 28, fontWeight: 800, color: "#0f172a", margin: 0, letterSpacing: -0.5, fontFamily: "'Space Grotesk','Inter',sans-serif" },
  pageSub: { fontSize: 14, color: "#64748b", margin: "6px 0 0" },
  headActions: { display: "flex", gap: 10 },
  primaryBtn: {
    display: "inline-flex", alignItems: "center", gap: 8,
    background: "linear-gradient(135deg, #6366f1, #4f46e5)", color: "#fff",
    padding: "11px 22px", borderRadius: 12, fontSize: 13, fontWeight: 600,
    textDecoration: "none", border: "none",
    boxShadow: "0 4px 16px rgba(99,102,241,0.3)",
  },

  /* Stats */
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 20, marginBottom: 24 },
  statCard: {
    background: "#fff", borderRadius: 18, padding: "22px 24px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 6px 24px rgba(0,0,0,0.03)",
    border: "1px solid #f1f5f9",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
  },
  statIconWrap: {
    width: 48, height: 48, borderRadius: 14,
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  statChange: { fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 2 },
  statValue: { fontSize: 28, fontWeight: 800, color: "#0f172a", margin: "16px 0 4px", letterSpacing: -0.5, fontFamily: "'Space Grotesk','Inter',sans-serif" },
  statLabel: { fontSize: 13, color: "#64748b", fontWeight: 500 },

  /* Alert */
  alertBanner: {
    display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12,
    background: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)", border: "1px solid #fde68a", borderRadius: 16,
    padding: "14px 20px", marginBottom: 24,
  },
  alertIcon: { fontSize: 20 },
  alertLink: { color: "#92400e", fontWeight: 600, fontSize: 13, textDecoration: "none" },

  /* Chart row */
  chartRow: { display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 20, marginBottom: 24 },
  chartCard: {
    background: "#fff", borderRadius: 18, padding: "24px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 6px 24px rgba(0,0,0,0.03)",
    border: "1px solid #f1f5f9",
  },
  chartHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start" },
  chartTitle: { fontSize: 16, fontWeight: 700, color: "#0f172a", margin: 0, fontFamily: "'Space Grotesk','Inter',sans-serif" },
  chartSub: { fontSize: 12, color: "#94a3b8", margin: "2px 0 0" },
  chartTotal: { textAlign: "right" },
  chartTotalValue: { display: "block", fontSize: 22, fontWeight: 800, color: "#0f172a", letterSpacing: -0.5, fontFamily: "'Space Grotesk','Inter',sans-serif" },
  chartTotalLabel: { fontSize: 11, color: "#94a3b8", fontWeight: 500 },

  /* Activity */
  activityCard: {
    background: "#fff", borderRadius: 18, padding: "24px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 6px 24px rgba(0,0,0,0.03)",
    border: "1px solid #f1f5f9",
  },
  actItem: { display: "flex", alignItems: "flex-start", gap: 12, padding: "14px 0" },
  actDot: { width: 32, height: 32, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 },
  actText: { fontSize: 13, color: "#0f172a", fontWeight: 500, lineHeight: 1.4 },
  actDetail: { fontSize: 12, color: "#94a3b8", marginTop: 2 },
  actTime: { fontSize: 11, color: "#cbd5e1", whiteSpace: "nowrap", flexShrink: 0, marginTop: 2 },

  /* Quick actions */
  qaSection: { marginBottom: 24 },
  qaGrid: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginTop: 14 },
  qaCard: {
    display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
    background: "#fff", borderRadius: 18, padding: "24px 16px",
    textDecoration: "none",
    boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 6px 24px rgba(0,0,0,0.03)",
    border: "1px solid #f1f5f9",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
  },
  qaIconWrap: {
    width: 52, height: 52, borderRadius: 16,
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  qaLabel: { fontSize: 13, fontWeight: 600, color: "#334155" },

  /* Section */
  sectionTitle: { fontSize: 16, fontWeight: 700, color: "#0f172a", margin: "0 0 4px", fontFamily: "'Space Grotesk','Inter',sans-serif" },

  /* Table */
  tableCard: {
    background: "#fff", borderRadius: 18,
    boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 6px 24px rgba(0,0,0,0.03)",
    border: "1px solid #f1f5f9",
    marginBottom: 24, overflow: "hidden",
  },
  tableHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px 16px" },
  viewAll: { fontSize: 13, color: "#6366f1", fontWeight: 600, textDecoration: "none" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: {
    padding: "10px 24px", fontSize: 11, fontWeight: 600, color: "#94a3b8",
    textTransform: "uppercase", letterSpacing: 0.8,
    borderBottom: "1px solid #f1f5f9", textAlign: "left",
    background: "#f8fafc",
  },
  tr: { transition: "background 0.15s ease" },
  td: { padding: "14px 24px", fontSize: 13, borderBottom: "1px solid #f8fafc", color: "#334155" },
  invNo: { fontWeight: 700, color: "#0f172a", fontFamily: "'Space Grotesk','Inter',monospace" },
  clientCell: { display: "flex", alignItems: "center", gap: 10 },
  clientAvatar: {
    width: 32, height: 32, borderRadius: 10,
    background: "linear-gradient(135deg, #e0e7ff, #c7d2fe)", color: "#6366f1",
    fontSize: 12, fontWeight: 700,
    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  statusBadge: {
    display: "inline-block", padding: "4px 12px", borderRadius: 20,
    fontSize: 11, fontWeight: 600, letterSpacing: 0.3,
  },
  viewBtn: {
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    width: 32, height: 32, borderRadius: 10,
    color: "#6366f1", background: "#eef2ff",
    textDecoration: "none",
    transition: "background 0.15s ease",
  },

  /* Messages */
  msgRow: { display: "flex", alignItems: "center", gap: 14, padding: "14px 24px" },
  msgAvatar: {
    width: 40, height: 40, borderRadius: 12,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 14, fontWeight: 700, flexShrink: 0,
  },
  newBadge: {
    background: "linear-gradient(135deg, #ef4444, #dc2626)", color: "#fff", fontSize: 9, fontWeight: 700,
    padding: "2px 8px", borderRadius: 8, letterSpacing: 0.5,
  },
};
