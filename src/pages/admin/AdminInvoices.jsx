import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useInvoices } from "../../hooks/useInvoices";
import { useToast } from "../../components/common/Toast";

function exportCSV(invoices) {
  const headers = ["Invoice No", "Client", "Company", "Type", "Date", "Items", "Subtotal", "Discount", "Tax", "Total"];
  const rows = invoices.map(inv => [
    inv.invoiceNo || "",
    (inv.clientName || "").replace(/,/g, " "),
    (inv.client?.company || "").replace(/,/g, " "),
    inv.docType || "",
    inv.invoiceDate || "",
    (inv.items || []).length,
    (inv.subtotal || 0).toFixed(2),
    (inv.discount || 0).toFixed(2),
    (inv.tax || 0).toFixed(2),
    (inv.total || 0).toFixed(2),
  ]);
  const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `invoices_${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AdminInvoices() {
  const { invoices, loading, deleteInvoice } = useInvoices();
  const navigate = useNavigate();
  const toast = useToast();
  const [search,  setSearch]  = useState("");
  const [delId,   setDelId]   = useState(null);

  const filtered = invoices.filter(inv =>
    (inv.invoiceNo||"").toLowerCase().includes(search.toLowerCase()) ||
    (inv.clientName||"").toLowerCase().includes(search.toLowerCase()) ||
    (inv.docType||"").toLowerCase().includes(search.toLowerCase())
  );

  const typeColor = (t) => ({
    Invoice:          { bg:"#eff6ff", color:"#1d4ed8" },
    Estimate:         { bg:"#fefce8", color:"#92400e" },
    "Proforma Invoice":{ bg:"#f0fdf4", color:"#166534" },
    Quotation:        { bg:"#faf5ff", color:"#7e22ce" },
  }[t] || { bg:"#f1f5f9", color:"#475569" });

  return (
    <div style={s.page}>
      <div style={s.inner}>

        <div className="admin-invoices-header" style={s.header}>
          <div>
            <h1 style={s.title}>All Invoices & Estimates</h1>
            <p style={s.sub}>{invoices.length} documents total</p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            {invoices.length > 0 && (
              <button style={s.exportBtn} onClick={() => { exportCSV(invoices); toast.success(`Exported ${invoices.length} invoices to CSV`); }}>
                📥 Export CSV
              </button>
            )}
            <Link to="/admin/invoice/new" style={s.newBtn}>+ New Invoice</Link>
          </div>
        </div>

        <input className="admin-invoices-search" style={s.search} placeholder="🔍 Search by invoice no., client, type…"
          value={search} onChange={e=>setSearch(e.target.value)} />

        {loading ? (
          <div style={s.loading}>Loading…</div>
        ) : filtered.length === 0 ? (
          <div style={s.empty}>
            <p style={{fontSize:40}}>🧾</p>
            <p>No invoices yet. <Link to="/admin/invoice/new" style={{color:"#ea580c",fontWeight:600}}>Create your first one →</Link></p>
          </div>
        ) : (
          <div className="table-wrap" style={s.tableWrap}>
            <table style={s.table}>
              <thead><tr style={s.thead}>
                {["Invoice No","Client","Type","Date","Items","Total",""].map(h=>(
                  <th key={h} style={s.th}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {filtered.map((inv,i)=>{
                  const tc = typeColor(inv.docType);
                  return (
                    <tr key={inv.id} style={i%2===0?s.trEven:s.trOdd}>
                      <td style={s.td}><span style={s.invNo}>{inv.invoiceNo||"—"}</span></td>
                      <td style={s.td}>
                        <div style={{fontWeight:600,color:"#0f172a"}}>{inv.clientName||"—"}</div>
                        {inv.client?.company&&<div style={{fontSize:11,color:"#94a3b8"}}>{inv.client.company}</div>}
                      </td>
                      <td style={s.td}>
                        <span style={{...s.badge,...tc}}>{inv.docType||"—"}</span>
                      </td>
                      <td style={s.td}>{inv.invoiceDate||"—"}</td>
                      <td style={s.td}>{(inv.items||[]).length} items</td>
                      <td style={{...s.td,fontWeight:700,color:"#ea580c"}}>
                        ₹{(inv.total||0).toLocaleString("en-IN",{minimumFractionDigits:2})}
                      </td>
                      <td style={s.td}>
                        <div style={s.rowActs}>
                          <button style={s.editBtn} onClick={()=>navigate(`/admin/invoice/${inv.id}`)}>✏️ Edit</button>
                          <button style={s.delBtn}  onClick={()=>setDelId(inv.id)}>🗑</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {delId && (
        <div style={s.overlay} onClick={()=>setDelId(null)}>
          <div style={s.modal} onClick={e=>e.stopPropagation()}>
            <h2 style={{fontSize:18,fontWeight:800,color:"#ef4444",marginTop:0,marginBottom:12}}>Delete Invoice?</h2>
            <p style={{color:"#64748b",marginBottom:24,fontSize:14}}>This action cannot be undone.</p>
            <div style={{display:"flex",gap:10}}>
              <button style={s.cancelBtn} onClick={()=>setDelId(null)}>Cancel</button>
              <button style={s.confirmDelBtn} onClick={async()=>{await deleteInvoice(delId);setDelId(null);toast.success("Invoice deleted successfully");}}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const s = {
  page: { background:"#f8fafc", minHeight:"100vh", fontFamily:"'Inter','Segoe UI',system-ui,sans-serif" },
  inner: { maxWidth:1200, margin:"0 auto", padding:"28px 24px" },
  header: { display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20 },
  title: { fontSize:26, fontWeight:800, color:"#0f172a", margin:0 },
  sub: { fontSize:13, color:"#64748b", marginTop:4 },
  newBtn: { background:"linear-gradient(135deg,#ea580c,#f97316)", color:"#fff", padding:"10px 20px", borderRadius:9, fontSize:14, fontWeight:700, textDecoration:"none", boxShadow:"0 2px 8px rgba(234,88,12,0.25)" },
  exportBtn: { background:"#fff", color:"#334155", padding:"10px 20px", borderRadius:9, fontSize:14, fontWeight:700, border:"1.5px solid #e2e8f0", cursor:"pointer" },
  search: { width:"100%", maxWidth:440, padding:"10px 14px", borderRadius:9, border:"1.5px solid #e2e8f0", fontSize:14, marginBottom:20, outline:"none", boxSizing:"border-box" },
  tableWrap: { background:"#fff", borderRadius:14, overflow:"hidden", boxShadow:"0 1px 4px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)" },
  table: { width:"100%", borderCollapse:"collapse" },
  thead: { background:"#fafaf9" },
  th: { padding:"11px 14px", fontSize:11, fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:0.8, borderBottom:"1px solid #e2e8f0", textAlign:"left" },
  td: { padding:"13px 14px", fontSize:13, borderBottom:"1px solid #f1f5f9", verticalAlign:"middle" },
  trEven: { background:"#fff" },
  trOdd:  { background:"#fafaf9" },
  invNo: { fontWeight:700, color:"#334155", fontFamily:"monospace", fontSize:13 },
  badge: { padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:700 },
  rowActs: { display:"flex", gap:6 },
  editBtn: { background:"#fff7ed", color:"#ea580c", border:"1px solid #fed7aa", borderRadius:6, padding:"6px 12px", fontSize:12, fontWeight:600, cursor:"pointer" },
  delBtn:  { background:"#fee2e2", color:"#dc2626", border:"none", borderRadius:6, padding:"6px 10px", fontSize:12, cursor:"pointer" },
  loading: { textAlign:"center", padding:60, color:"#64748b" },
  empty:   { textAlign:"center", padding:60, color:"#94a3b8", fontSize:15, lineHeight:2 },
  overlay: { position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:999, padding:16, backdropFilter:"blur(4px)" },
  modal:   { background:"#fff", borderRadius:16, padding:"28px", maxWidth:360, width:"100%", boxShadow:"0 16px 50px rgba(0,0,0,0.18)" },
  cancelBtn: { flex:1, padding:"10px", background:"#f1f5f9", color:"#334155", border:"none", borderRadius:8, fontWeight:600, cursor:"pointer" },
  confirmDelBtn: { flex:1, padding:"10px", background:"#ef4444", color:"#fff", border:"none", borderRadius:8, fontWeight:700, cursor:"pointer" },
};
