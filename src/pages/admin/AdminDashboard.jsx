import { Link } from "react-router-dom";
import { useProducts } from "../../hooks/useProducts";
import { useInvoices } from "../../hooks/useInvoices";

const PRIMARY = "#ea580c";
const PRIMARY_LIGHT = "#f97316";

export default function AdminDashboard() {
  const { products } = useProducts();
  const { invoices } = useInvoices();

  const totalRevenue = invoices.reduce((s, inv) => s + (inv.total || 0), 0);
  const recentInvoices = invoices.slice(0, 5);
  const lowStockProducts = products.filter(p => p.quantity !== undefined && p.quantity < 5);
  const outOfStockProducts = products.filter(p => p.quantity !== undefined && p.quantity === 0);

  return (
    <div style={s.page}>
      {/* ── Dark header banner ── */}
      <div style={s.banner}>
        <div style={s.bannerInner}>
          <div className="admin-header">
            <p style={s.bannerLabel}>ADMIN PANEL</p>
            <h1 style={s.bannerTitle}>Dashboard</h1>
            <p style={s.bannerSub}>Manakamana Heavy Equipments Pvt. Ltd.</p>
          </div>
        </div>
      </div>

      <div style={s.inner}>

        {/* Stats */}
        <div className="admin-stats-grid" style={s.statsGrid}>
          {[
            { icon:"📦", label:"Total Products",  value: products.length,  color: PRIMARY },
            { icon:"🧾", label:"Total Invoices",   value: invoices.length, color:"#8b5cf6" },
            { icon:"💰", label:"Total Billed",     value:`₹${totalRevenue.toLocaleString("en-IN")}`, color:"#10b981" },
            { icon:"📋", label:"Pending Estimates", value: invoices.filter(i=>i.docType==="Estimate").length, color:"#f59e0b" },
          ].map(st => (
            <div key={st.label} style={{ ...s.statCard, borderTop: `4px solid ${st.color}` }}>
              <div style={s.statIcon}>{st.icon}</div>
              <div style={{ ...s.statValue, color: st.color }}>{st.value}</div>
              <div style={s.statLabel}>{st.label}</div>
            </div>
          ))}
        </div>

        {/* ── Notifications Section ── */}
        {(lowStockProducts.length > 0 || outOfStockProducts.length > 0) && (
          <div style={s.notifSection}>
            <div style={s.notifHeader}>
              <h2 style={s.notifTitle}>🔔 Notifications</h2>
              <span style={s.notifBadge}>{lowStockProducts.length}</span>
            </div>

            {outOfStockProducts.length > 0 && (
              <div style={s.notifCard_critical}>
                <div style={s.notifIcon}>🚨</div>
                <div style={{flex:1}}>
                  <strong style={{color:"#991b1b",fontSize:14}}>Out of Stock</strong>
                  <p style={{margin:"4px 0 0",fontSize:13,color:"#b91c1c"}}>
                    {outOfStockProducts.map(p => p.name).join(", ")} — <strong>0 units remaining</strong>
                  </p>
                </div>
                <Link to="/admin/products" style={s.notifAction}>Restock →</Link>
              </div>
            )}

            {lowStockProducts.filter(p => p.quantity > 0).length > 0 && (
              <div style={s.notifCard_warning}>
                <div style={s.notifIcon}>⚠️</div>
                <div style={{flex:1}}>
                  <strong style={{color:"#92400e",fontSize:14}}>Low Stock Warning</strong>
                  <p style={{margin:"4px 0 0",fontSize:13,color:"#a16207"}}>
                    {lowStockProducts.filter(p => p.quantity > 0).map(p => `${p.name} (${p.quantity} left)`).join(", ")}
                  </p>
                </div>
                <Link to="/admin/products" style={s.notifAction}>Manage →</Link>
              </div>
            )}
          </div>
        )}

        {/* Quick actions */}
        <div style={s.quickGrid}>
          <QuickAction to="/admin/products"    icon="📦" title="Manage Products" desc="Add, edit or delete products from catalogue" />
          <QuickAction to="/admin/invoice/new" icon="➕" title="New Invoice"     desc="Create a new estimate or invoice for a client" />
          <QuickAction to="/admin/invoices"    icon="🧾" title="All Invoices"    desc="View and manage all saved invoices" />
        </div>

        {/* Recent invoices */}
        {recentInvoices.length > 0 && (
          <div style={s.section}>
            <div style={s.sectionHeader}>
              <h2 style={s.sectionTitle}>Recent Invoices</h2>
              <Link to="/admin/invoices" style={s.viewAll}>View All →</Link>
            </div>
            <div className="table-wrap" style={s.tableWrap}>
              <table style={s.table}>
                <thead>
                  <tr style={s.thead}>
                    {["Invoice No","Client","Type","Date","Total",""].map(h=>(
                      <th key={h} style={s.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentInvoices.map((inv, i) => (
                    <tr key={inv.id} style={i%2===0?s.trEven:s.trOdd}>
                      <td style={s.td}><span style={s.invNo}>{inv.invoiceNo}</span></td>
                      <td style={s.td}>{inv.clientName || "—"}</td>
                      <td style={s.td}><span style={{...s.typeBadge, background: inv.docType==="Invoice"?"#fff7ed":"#fefce8", color: inv.docType==="Invoice"? PRIMARY :"#92400e"}}>{inv.docType}</span></td>
                      <td style={s.td}>{inv.invoiceDate || "—"}</td>
                      <td style={{...s.td, fontWeight:700, color: PRIMARY}}>₹{(inv.total||0).toLocaleString("en-IN")}</td>
                      <td style={s.td}>
                        <Link to={`/admin/invoice/${inv.id}`} style={s.viewBtn}>View</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

function QuickAction({ to, icon, title, desc }) {
  return (
    <Link to={to} style={s.qaCard}>
      <div style={s.qaIcon}>{icon}</div>
      <h3 style={s.qaTitle}>{title}</h3>
      <p style={s.qaDesc}>{desc}</p>
    </Link>
  );
}

const s = {
  page: { background: "#f8fafc", minHeight: "100vh", fontFamily: "'Inter','Segoe UI',system-ui,sans-serif" },
  banner: { background: "linear-gradient(135deg,#0f172a 0%,#1e293b 100%)", padding: "44px 24px 38px" },
  bannerInner: { maxWidth: 1200, margin: "0 auto" },
  bannerLabel: { color: PRIMARY_LIGHT, fontWeight: 700, fontSize: 11, letterSpacing: 2, margin: "0 0 6px", textTransform: "uppercase" },
  bannerTitle: { fontSize: 30, fontWeight: 800, color: "#fff", margin: 0 },
  bannerSub: { fontSize: 13, color: "#94a3b8", marginTop: 6 },
  inner: { maxWidth: 1200, margin: "0 auto", padding: "28px 24px" },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 16, marginBottom: 24 },
  statCard: { background: "#fff", borderRadius: 14, padding: "22px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)", transition: "box-shadow 0.2s" },
  statIcon: { fontSize: 24, marginBottom: 10 },
  statValue: { fontSize: 28, fontWeight: 800, margin: "0 0 4px" },
  statLabel: { fontSize: 12, color: "#64748b", fontWeight: 600 },
  quickGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 16, marginBottom: 28 },
  qaCard: { background: "#fff7ed", border: `1.5px solid #fed7aa`, borderRadius: 14, padding: "22px 20px", textDecoration: "none", display: "block", transition: "transform 0.15s, box-shadow 0.2s" },
  qaIcon: { fontSize: 28, marginBottom: 10 },
  qaTitle: { fontSize: 16, fontWeight: 700, color: "#0f172a", margin: "0 0 6px" },
  qaDesc: { fontSize: 13, color: "#475569", margin: 0, lineHeight: 1.5 },
  section: { background: "#fff", borderRadius: 14, padding: "20px 22px", boxShadow: "0 1px 4px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)" },
  sectionHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  sectionTitle: { fontSize: 17, fontWeight: 700, color: "#0f172a", margin: 0 },
  viewAll: { fontSize: 13, color: PRIMARY, fontWeight: 600, textDecoration: "none" },
  tableWrap: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse" },
  thead: { background: "#fafaf9" },
  th: { padding: "10px 12px", fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.8, borderBottom: "1px solid #e2e8f0", textAlign: "left" },
  td: { padding: "11px 12px", fontSize: 13, borderBottom: "1px solid #f8fafc" },
  trEven: { background: "#fff" },
  trOdd:  { background: "#fafaf9" },
  invNo: { fontWeight: 700, color: "#334155" },
  typeBadge: { padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700 },
  viewBtn: { color: PRIMARY, fontWeight: 600, fontSize: 13, textDecoration: "none" },
  // Notification styles
  notifSection: { background: "#fff", borderRadius: 14, padding: "20px 22px", marginBottom: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)", border: "1px solid #fecaca" },
  notifHeader: { display: "flex", alignItems: "center", gap: 10, marginBottom: 16 },
  notifTitle: { fontSize: 17, fontWeight: 700, color: "#0f172a", margin: 0 },
  notifBadge: { background: "#ef4444", color: "#fff", fontSize: 11, fontWeight: 800, padding: "2px 8px", borderRadius: 20, minWidth: 22, textAlign: "center" },
  notifCard_critical: { display: "flex", alignItems: "center", gap: 14, background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "14px 16px", marginBottom: 10 },
  notifCard_warning: { display: "flex", alignItems: "center", gap: 14, background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10, padding: "14px 16px", marginBottom: 10 },
  notifIcon: { fontSize: 24, flexShrink: 0 },
  notifAction: { color: PRIMARY, fontWeight: 700, fontSize: 13, textDecoration: "none", whiteSpace: "nowrap", flexShrink: 0 },
};
