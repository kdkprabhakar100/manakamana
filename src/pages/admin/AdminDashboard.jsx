import { Link } from "react-router-dom";
import { useProducts } from "../../hooks/useProducts";
import { useInvoices } from "../../hooks/useInvoices";
import { useAuth } from "../../hooks/useAuth";

export default function AdminDashboard() {
  const { products } = useProducts();
  const { invoices } = useInvoices();
  const { logout }   = useAuth();

  const totalRevenue = invoices.reduce((s, inv) => s + (inv.total || 0), 0);
  const recentInvoices = invoices.slice(0, 5);

  return (
    <div style={s.page}>
      <div style={s.inner}>

        {/* Header */}
        <div style={s.header}>
          <div>
            <h1 style={s.title}>Admin Dashboard</h1>
            <p style={s.subtitle}>Manakamana Heavy Equipments Pvt. Ltd.</p>
          </div>
          <button onClick={logout} style={s.logoutBtn}>🚪 Logout</button>
        </div>

        {/* Stats */}
        <div style={s.statsGrid}>
          {[
            { icon:"📦", label:"Total Products",  value: products.length, color:"#0ea5e9" },
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

        {/* Quick actions */}
        <div style={s.quickGrid}>
          <QuickAction to="/admin/products"     icon="📦" title="Manage Products"  desc="Add, edit or delete products from catalogue" color="#eff6ff" border="#bfdbfe" />
          <QuickAction to="/admin/invoice/new"  icon="➕" title="New Invoice"      desc="Create a new estimate or invoice for a client" color="#f0fdf4" border="#bbf7d0" />
          <QuickAction to="/admin/invoices"     icon="🧾" title="All Invoices"     desc="View and manage all saved invoices" color="#faf5ff" border="#ddd6fe" />
        </div>

        {/* Recent invoices */}
        {recentInvoices.length > 0 && (
          <div style={s.section}>
            <div style={s.sectionHeader}>
              <h2 style={s.sectionTitle}>Recent Invoices</h2>
              <Link to="/admin/invoices" style={s.viewAll}>View All →</Link>
            </div>
            <div style={s.tableWrap}>
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
                      <td style={s.td}><span style={{...s.typeBadge, background: inv.docType==="Invoice"?"#eff6ff":"#fefce8", color: inv.docType==="Invoice"?"#1d4ed8":"#92400e"}}>{inv.docType}</span></td>
                      <td style={s.td}>{inv.invoiceDate || "—"}</td>
                      <td style={{...s.td, fontWeight:700, color:"#0ea5e9"}}>₹{(inv.total||0).toLocaleString("en-IN")}</td>
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

function QuickAction({ to, icon, title, desc, color, border }) {
  return (
    <Link to={to} style={{ ...s.qaCard, background: color, border: `1.5px solid ${border}` }}>
      <div style={s.qaIcon}>{icon}</div>
      <h3 style={s.qaTitle}>{title}</h3>
      <p style={s.qaDesc}>{desc}</p>
    </Link>
  );
}

const s = {
  page: { background: "#f8fafc", minHeight: "100vh", fontFamily: "'Segoe UI', sans-serif" },
  inner: { maxWidth: 1200, margin: "0 auto", padding: "36px 24px" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 },
  title: { fontSize: 28, fontWeight: 800, color: "#0f172a", margin: 0 },
  subtitle: { fontSize: 13, color: "#64748b", marginTop: 4 },
  logoutBtn: { background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: 8, padding: "9px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer" },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 16, marginBottom: 24 },
  statCard: { background: "#fff", borderRadius: 14, padding: "22px 20px", boxShadow: "0 1px 6px rgba(0,0,0,0.06)" },
  statIcon: { fontSize: 24, marginBottom: 10 },
  statValue: { fontSize: 28, fontWeight: 800, margin: "0 0 4px" },
  statLabel: { fontSize: 12, color: "#64748b", fontWeight: 600 },
  quickGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 16, marginBottom: 28 },
  qaCard: { borderRadius: 14, padding: "22px 20px", textDecoration: "none", display: "block", transition: "transform 0.15s" },
  qaIcon: { fontSize: 28, marginBottom: 10 },
  qaTitle: { fontSize: 16, fontWeight: 700, color: "#0f172a", margin: "0 0 6px" },
  qaDesc: { fontSize: 13, color: "#475569", margin: 0, lineHeight: 1.5 },
  section: { background: "#fff", borderRadius: 14, padding: "20px 22px", boxShadow: "0 1px 6px rgba(0,0,0,0.06)" },
  sectionHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  sectionTitle: { fontSize: 17, fontWeight: 700, color: "#0f172a", margin: 0 },
  viewAll: { fontSize: 13, color: "#0ea5e9", fontWeight: 600, textDecoration: "none" },
  tableWrap: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse" },
  thead: { background: "#f8fafc" },
  th: { padding: "10px 12px", fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.8, borderBottom: "1px solid #e2e8f0", textAlign: "left" },
  td: { padding: "11px 12px", fontSize: 13, borderBottom: "1px solid #f8fafc" },
  trEven: { background: "#fff" },
  trOdd:  { background: "#fafafa" },
  invNo: { fontWeight: 700, color: "#334155" },
  typeBadge: { padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700 },
  viewBtn: { color: "#0ea5e9", fontWeight: 600, fontSize: 13, textDecoration: "none" },
};
