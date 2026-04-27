import { useState, useMemo } from "react";
import { useProducts } from "../../hooks/useProducts";
import { useInvoices } from "../../hooks/useInvoices";

export default function AdminInventory() {
    const { products, loading: pLoading } = useProducts();
    const { invoices, loading: iLoading } = useInvoices();
    const [search, setSearch] = useState("");

    const loading = pLoading || iLoading;

    const ledgerData = useMemo(() => {
        if (loading) return [];

        return products.map(product => {
            const quantity = Number(product.quantity) || 0;
            const sellingPrice = Number(product.sellingPrice || product.price || 0);
            const totalAmount = quantity * sellingPrice;

            return {
                ...product,
                quantity,
                sellingPrice,
                totalAmount,
            };
        });
    }, [products, invoices, loading]);

    const filtered = useMemo(() => {
        const q = search.toLowerCase().trim();

        if (!q) return ledgerData;

        return ledgerData.filter(item =>
            [
                item.name,
                item.category,
                item.hsCode,
                item.productCode,
                item.unit,
                item.rack,
                item.section,
                item.quantity,
                item.sellingPrice,
                item.totalAmount,
                item.price,
            ]
                .map(v => String(v || "").toLowerCase())
                .some(v => v.includes(q))
        );
    }, [search, ledgerData]);

    // Grand total
    const grandTotal = useMemo(
        () => filtered.reduce((sum, item) => sum + item.totalAmount, 0),
         [filtered]
    );

    if (loading) {
        return (
            <div style={s.page}>
                <div style={s.loading}>
                    <div style={s.spinnerWrap}><div style={s.spinner} /></div>
                    <p>Loading Stock Ledger...</p>
                </div>
            </div>
        );
    }

    return (
        <div style={s.page}>
            <div style={s.inner}>

                {/* Header */}
                <div style={s.header}>
                    <div>
                        <p style={s.label}>ADMIN · INVENTORY</p>
                        <h1 style={s.title}>Stock Ledger Detailed</h1>
                        <p style={s.subTitle}>Product Wise</p>
                    </div>
                    <div style={s.headerRight} className="no-print">
                        <input
                            style={s.search}
                            placeholder="🔍 Search products..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                        <button style={s.printBtn} onClick={() => window.print()}>
                            🖨 Print Ledger
                        </button>
                    </div>
                </div>

                {/* Ledger Table */}
                <div className="ledger-card" style={s.card}>
                    <div style={s.tableWrap}>
                        <table style={s.table}>
                            <thead>
                                <tr style={s.trHead}>
                                    <th style={s.th}>HS</th>
                                    <th style={s.th}>Product Code</th>
                                    <th style={{ ...s.th, textAlign: "left" }}>Product Name & Category</th>
                                    <th style={s.th}>Unit</th>
                                    <th style={s.th}>Rack</th>
                                    <th style={s.th}>Section</th>
                                    <th style={s.th}>Qty</th>
                                    <th style={{ ...s.th, ...s.thRight }}>Selling Price</th>
                                    <th style={{ ...s.th, ...s.thRight }}>Total Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={9} style={s.tdEmpty}>No products found in inventory.</td>
                                    </tr>
                                ) : (
                                    filtered.map((item, idx) => (
                                        <tr key={item.id} style={idx % 2 === 0 ? s.trEven : s.trOdd}>
                                            <td style={s.td}>{item.hsCode || "—"}</td>
                                            <td style={s.td}>{item.productCode || "—"}</td>
                                            <td style={{ ...s.td, textAlign: "left" }}>
                                                <div style={s.itemName}>{item.name}</div>
                                                {item.category && <div style={s.itemCat}>{item.category}</div>}
                                            </td>
                                            <td style={s.td}>{item.unit || "NOS"}</td>
                                            <td style={s.td}>{item.rack || "—"}</td>
                                            <td style={s.td}>{item.section || "—"}</td>
                                            <td style={{ ...s.td, fontWeight: 600, color: item.quantity < 5 ? "#dc2626" : "#0f172a" }}>
                                                {item.quantity}
                                            </td>
                                            <td style={{ ...s.td, ...s.tdRight }}>
                                                Rs {item.sellingPrice.toLocaleString("en-IN")}
                                            </td>
                                            <td style={{ ...s.td, ...s.tdRight, fontWeight: 700, color: "#0f172a" }}>
                                                Rs {item.totalAmount.toLocaleString("en-IN")}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>

                            {/* Grand Total Footer */}
                            {filtered.length > 0 && (
                                <tfoot>
                                    <tr style={s.tfootRow}>
                                        <td colSpan={8} style={s.tfootLabel}>Grand Total</td>
                                        <td style={{ ...s.tfootValue }}>
                                            Rs {grandTotal.toLocaleString("en-IN")}
                                        </td>
                                    </tr>
                                </tfoot>
                            )}
                        </table>
                    </div>
                </div>

            </div>

            {/* Print Styles */}
            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                @media print {
                    body { background: #fff; margin: 0; padding: 0; }
                    .no-print { display: none !important; }
                    .admin-sidebar, .admin-topbar, .ledger-card > div::-webkit-scrollbar { display: none !important; }
                    .admin-main-area { margin-left: 0 !important; }
                    .ledger-card { box-shadow: none !important; border: none !important; }
                    th { background: #059669 !important; color: #fff !important; font-size: 11px !important; }
                    td { font-size: 10px !important; border-bottom: 1px solid #e5e7eb !important; }
                    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                }
            `}</style>
        </div>
    );
}

const PRIMARY = "#059669";

const s = {
    page: { fontFamily: "'Inter','Segoe UI',system-ui,sans-serif", background: "#f8fafc", minHeight: "100vh" },
    inner: { maxWidth: 1280, margin: "0 auto", padding: "28px 24px" },
    header: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20, flexWrap: "wrap", gap: 16 },
    label: { color: PRIMARY, fontWeight: 700, fontSize: 11, letterSpacing: 2, margin: 0, textTransform: "uppercase" },
    title: { fontSize: 26, fontWeight: 800, color: "#0f172a", margin: "4px 0 2px" },
    subTitle: { fontSize: 13, color: "#64748b", margin: 0, fontWeight: 500 },
    headerRight: { display: "flex", gap: 12, alignItems: "center" },
    search: { padding: "9px 14px", borderRadius: 8, border: "1.5px solid #e2e8f0", fontSize: 14, outline: "none", width: 260 },
    printBtn: { background: `linear-gradient(135deg, ${PRIMARY}, #10b981)`, color: "#fff", border: "none", borderRadius: 8, padding: "10px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer", boxShadow: "0 2px 8px rgba(5,150,105,0.25)" },
    card: { background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.05)", border: "1px solid #e2e8f0" },
    tableWrap: { overflowX: "auto" },
    table: { width: "100%", borderCollapse: "collapse", minWidth: 900 },
    trHead: { background: "#f1f5f9", borderBottom: "2px solid #e2e8f0" },
    th: { padding: "14px 16px", textAlign: "center", fontSize: 12, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: 0.5 },
    thRight: { textAlign: "right" },
    trEven: { background: "#f8fafc" },
    trOdd: { background: "#fff" },
    td: { padding: "12px 16px", textAlign: "center", fontSize: 13, color: "#334155", borderBottom: "1px solid #f1f5f9" },
    tdRight: { textAlign: "right", fontFamily: "'Space Grotesk','Inter',monospace", fontWeight: 500 },
    tdEmpty: { padding: "40px", textAlign: "center", color: "#94a3b8", fontSize: 14 },
    itemName: { fontWeight: 600, color: "#0f172a" },
    itemCat: { fontSize: 11, color: "#94a3b8", marginTop: 2 },
    lowBadge: {
        display: "inline-block", marginLeft: 6,
        background: "#fee2e2", color: "#dc2626",
        fontSize: 9, fontWeight: 700, padding: "1px 6px",
        borderRadius: 999, letterSpacing: 0.5, textTransform: "uppercase",
        verticalAlign: "middle",
    },
    tfootRow: { background: "#f0fdf4", borderTop: "2px solid #bbf7d0" },
    tfootLabel: {
        padding: "14px 16px", textAlign: "right",
        fontSize: 13, fontWeight: 700, color: "#059669",
        textTransform: "uppercase", letterSpacing: 0.5,
    },
    tfootValue: {
        padding: "14px 16px", textAlign: "right",
        fontSize: 15, fontWeight: 800, color: "#059669",
        fontFamily: "'Space Grotesk','Inter',monospace",
    },
    loading: { textAlign: "center", padding: "80px 0", color: "#64748b" },
    spinnerWrap: { display: "flex", justifyContent: "center", marginBottom: 12 },
    spinner: { width: 36, height: 36, border: "3px solid #e2e8f0", borderTop: `3px solid ${PRIMARY}`, borderRadius: "50%", animation: "spin 0.8s linear infinite" },
};