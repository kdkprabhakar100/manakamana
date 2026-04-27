import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { useProducts } from "../../hooks/useProducts";
import { useInvoices } from "../../hooks/useInvoices";
import { useCustomers } from "../../hooks/useCustomers";

import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase/config";

const TAX_RATE    = 0.13;
const ITEMS_PER_PAGE = 20; // max items before forcing a new page (A4 fills naturally below this)

/* ─────────────────────────────────────────────
   Helpers
───────────────────────────────────────────── */
function numberToWords(n) {
  if (n === 0) return "Zero";
  const ones = ["","One","Two","Three","Four","Five","Six","Seven","Eight","Nine",
    "Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen","Eighteen","Nineteen"];
  const tens = ["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"];
  function convert(num) {
    if (num < 20) return ones[num];
    if (num < 100) return tens[Math.floor(num/10)] + (num%10 ? " "+ones[num%10] : "");
    if (num < 1000) return ones[Math.floor(num/100)]+" Hundred"+(num%100 ? " "+convert(num%100) : "");
    if (num < 100000) return convert(Math.floor(num/1000))+" Thousand"+(num%1000 ? " "+convert(num%1000) : "");
    if (num < 10000000) return convert(Math.floor(num/100000))+" Lakh"+(num%100000 ? " "+convert(num%100000) : "");
    return convert(Math.floor(num/10000000))+" Crore"+(num%10000000 ? " "+convert(num%10000000) : "");
  }
  const rupees = Math.floor(n);
  const paisa  = Math.round((n - rupees) * 100);
  let words = convert(rupees) + " Rupees";
  if (paisa > 0) words += " And " + convert(paisa) + " Paisa";
  return words + " Only";
}

function fmt(n) {
  return Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
//old invoce style
// let _counter = 1001;
// function newInvoiceNo() {
//   return `SB-${String(_counter++).padStart(5, "0")}`;
// }

//new invoice style
const INV_KEY = "manakaman_inv_counter";
function generateInvoiceNo(invoices) {
  if (!invoices || invoices.length === 0) return "SB-00001";

  const numbers = invoices.map(inv => {
    const num = parseInt((inv.invoiceNo || "").replace("SB-", ""));
    return isNaN(num) ? 0 : num;
  });

  const max = Math.max(...numbers);
  const next = max + 1;

  return `SB-${String(next).padStart(5, "0")}`;
}

/* ─────────────────────────────────────────────
   Shared CSS — used in both preview & print
───────────────────────────────────────────── */
const PRINT_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'Nunito', 'Segoe UI', sans-serif;
    color: #111;
    background: #fff;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  /* Each page is exactly A4 */
  .invoice-page {
    width: 210mm;
    height: 297mm;
    max-height: 297mm;
    overflow: hidden;
    padding: 10mm 13mm 10mm 13mm;
    background: #fff;
    display: flex;
    flex-direction: column;
  }

  /* page break between pages */
  .invoice-page + .invoice-page {
    page-break-before: always;
    break-before: page;
  }

  /* ── Company header ── */
  .inv-header {
    text-align: center;
    padding-bottom: 5pt;
    border-bottom: 2px solid #1a1a2e;
    margin-bottom: 5pt;
    flex-shrink: 0;
  }
  .inv-header .co-name {
    font-size: 15pt;
    font-weight: 800;
    letter-spacing: 0.4px;
    line-height: 1.2;
    color: #1a1a2e;
  }
  .inv-header .co-sub {
    font-size: 8.5pt;
    font-weight: 600;
    color: #444;
    margin-top: 1.5pt;
  }

  /* ── page label (Page X of Y) ── */
  .page-label {
    font-size: 8pt;
    color: #666;
    text-align: right;
    margin-bottom: 3pt;
    flex-shrink: 0;
  }

  /* ── Info grid (customer + invoice meta) ── */
  .info-grid {
    width: 100%;
    border-collapse: collapse;
    border: 1.5px solid #1a1a2e;
    flex-shrink: 0;
  }
  .info-grid td {
    padding: 4pt 6pt;
    vertical-align: top;
    font-size: 9pt;
    border: none;
  }
  .info-grid .left-col {
    width: 57%;
    border-right: 1.5px solid #1a1a2e;
  }
  .info-kv { width: 100%; border-collapse: collapse; }
  .info-kv td { padding: 1pt 2pt; vertical-align: top; font-size: 9pt; border: none; }
  .info-kv .lbl    { font-weight: 700; white-space: nowrap; padding-right: 3pt; }
  .info-kv .colon  { padding-right: 4pt; }
  .info-kv .val-bold { font-weight: 800; }

  /* ── Items table wrapper — grows to fill remaining page space ── */
  .items-table-wrap {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
  }

  /* ── Items table ── */
  .items-table {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
    flex: 1;
  }
  .items-table th {
    border: 1.5px solid #1a1a2e;
    border-top: none;
    padding: 4pt 4pt;
    font-size: 9pt;
    font-weight: 800;
    text-align: center;
    background: #f0f4ff;
    color: #1a1a2e;
  }
  .items-table th.left { text-align: left; }
  .items-table th:not(:first-child) { border-left: none; }
  .items-table td {
    border: 1.5px solid #1a1a2e;
    border-top: none;
    padding: 3.5pt 4pt;
    font-size: 9pt;
    vertical-align: middle;
  }
  .items-table td:not(:first-child) { border-left: none; }
  .items-table td.center { text-align: center; }
  .items-table td.right  { text-align: right; }
  .items-table td.bold   { font-weight: 700; }
  /* stretch-row expands to fill leftover vertical space */
  .items-table tr.stretch-row { height: 100%; }
  .items-table tr.stretch-row td { height: 100%; vertical-align: top; }
  .items-table tr.empty-row td { height: 16pt; }

  /* continued label shown on non-last pages */
  .continued-label {
    text-align: right;
    font-size: 8.5pt;
    font-style: italic;
    color: #555;
    padding: 4pt 2pt;
    flex-shrink: 0;
  }

  /* ── Totals section ── */
  .totals-table { width: 100%; border-collapse: collapse; flex-shrink: 0; }
  .totals-table td { border: 1.5px solid #1a1a2e; border-top: none; vertical-align: top; }
  .inwords-cell {
    width: 55%;
    padding: 5pt 7pt;
    font-size: 9pt;
    border-right: none;
  }
  .totals-cell { padding: 0; }
  .total-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 2.5pt 7pt;
    font-size: 9pt;
    border-bottom: 1px solid #1a1a2e;
  }
  .total-row:last-child { border-bottom: none; }
  .total-row.grand { font-weight: 800; background: #f0f4ff; }
  .total-row .t-val { display: flex; gap: 6pt; }
  .total-row .t-num { min-width: 70pt; text-align: right; }

  /* ── Remarks ── */
  .remarks { font-size: 9pt; margin-top: 7pt; flex-shrink: 0; }

  /* ── Signatures ── */
  .sig-grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    margin-top: 18pt;
    flex-shrink: 0;
  }
  .sig-col { text-align: center; padding: 0 5pt; }
  .sig-name { font-weight: 700; font-size: 9.5pt; height: 16pt; display: flex; align-items: flex-end; justify-content: center; }
  .sig-line { border-top: 1.5px solid #1a1a2e; margin-top: 2pt; margin-bottom: 2pt; }
  .sig-role { font-size: 8.5pt; color: #333; }

  /* ── Print date ── */
  .print-date { font-size: 8pt; color: #555; margin-top: 7pt; flex-shrink: 0; }

  /* ── Print media ── */
  @page { size: A4 portrait; margin: 0; }
  @media print {
    html, body { margin: 0; padding: 0; width: 210mm; }
    .invoice-page { box-shadow: none; }
  }
`;

/* ─────────────────────────────────────────────
   Main Component
───────────────────────────────────────────── */
export default function AdminInvoice() {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const printRef  = useRef();

  const { products }                             = useProducts();
  const { invoices, saveInvoice, updateInvoice } = useInvoices();
const { customers, upsertFromInvoice } = useCustomers();  
const today = () => new Date().toISOString().slice(0, 10);

  const DEFAULT_COMPANY = {
    name: "Manakamana Heavy Equipments Pvt. Ltd.",
    address: "Kritipur, Chovar, Bagmati Province, Nepal",
    city: "Kathmandu, Nepal",
    phone: "+977-9851068337",
    email: "mhektm@gmail.com",
    pan: "XXXXXXXXX",
    fy: "FY2082/083",
  };
  const EMPTY_CLIENT = { name: "", address: "", phone: "", gstin: "", payment: "Cash/Credit" };

  const [invoiceNo,   setInvoiceNo]   = useState("");
  const [invoiceDate, setInvoiceDate] = useState(today());
  const [dueDate,     setDueDate]     = useState("");
  const [docType,     setDocType]     = useState("Invoice");
  const [company,     setCompany]     = useState(DEFAULT_COMPANY);
  const [client,      setClient]      = useState(EMPTY_CLIENT);
  const [items,       setItems]       = useState([]);
  const [taxEnabled,  setTaxEnabled]  = useState(true);
  const [discountPct, setDiscountPct] = useState(0);
  const [notes,       setNotes]       = useState("");
  const [terms,       setTerms]       = useState("Payment due within 30 days.\nGoods once sold will not be taken back.");
  const [editCompany, setEditCompany] = useState(false);
  const [search,      setSearch]      = useState("");
  const [showDrop,    setShowDrop]    = useState(false);
  const [saving,      setSaving]      = useState(false);
  const [clientSearch, setClientSearch] = useState("");
const [showClientDrop, setShowClientDrop] = useState(false);

  // useEffect(() => {
  //   if (id && id !== "new") {
  //     const existing = invoices.find(i => i.id === id);
  //     if (existing) {
  //       setInvoiceNo(existing.invoiceNo || newInvoiceNo());
  //       setInvoiceDate(existing.invoiceDate || today());
  //       setDueDate(existing.dueDate || "");
  //       setDocType(existing.docType || "Invoice");
  //       setClient(existing.client || EMPTY_CLIENT);
  //       setItems(existing.items || []);
  //       setDiscountPct(existing.discountPct || 0);
  //       setTaxEnabled(existing.taxEnabled ?? true);
  //       setNotes(existing.notes || "");
  //       setTerms(existing.terms || "");
  //       setCompany(existing.company || DEFAULT_COMPANY);
  //     }
  //   }
  // // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [id, invoices]);

  useEffect(() => {
    if (!id || id =="new"){
      setInvoiceNo(generateInvoiceNo(invoices));
    }
  }, [invoices, id]);

  /* ── Calculations ── */
  const subtotal = items.reduce((s, i) => s + i.qty * i.rate, 0);
  const discount = subtotal * (discountPct / 100);
  const taxable  = subtotal - discount;
  const tax      = taxEnabled ? taxable * TAX_RATE : 0;
  const total    = taxable + tax;

  const totalRows = [
    ["Sub Total",     fmt(subtotal), false],
    ...(discountPct > 0 ? [[`Discount (${discountPct}%)`, fmt(discount), false]] : []),
    ["Taxable Value", fmt(taxable),  false],
    ...(taxEnabled    ? [["13% VAT", fmt(tax), false]] : []),
    ["Total Amount",  fmt(total),    true],
  ];

  /* ── Product search ── */
  const filtered = search.trim()
    ? products.filter(p => {
        const q = search.toLowerCase().trim();

        return [
          p.name,
          p.category,
          p.hsCode,
          p.productCode,
          p.unit,
          p.rack,
          p.section,
          p.quantity,
          p.price,
          p.sellingPrice,
          p.costPrice,
          p.description,
        ]
          .map(v => String(v || "").toLowerCase())
          .some(v => v.includes(q));
      })
    : products;

  function addProduct(product) {
    const exists = items.find(i => i.productId === product.id);
    if (exists) {
      setItems(prev => prev.map(i =>
        i.productId === product.id ? { ...i, qty: i.qty + 1 } : i
      ));
    } else {
      setItems(prev => [...prev, {
        id: Date.now() + Math.random(),
        productId: product.id,
        hsCode: product.hsCode || "",
        name:   product.name,
        unit:   product.unit || "NOS",
        qty:    1,
        rate:   Number(product.price) || 0,
      }]);
    }
    setSearch("");
    setShowDrop(false);
  }

  const removeItem = (id) => setItems(p => p.filter(i => i.id !== id));
  const updateItem = (id, field, value) =>
    setItems(prev => prev.map(i =>
      i.id === id
        ? { ...i, [field]: ["name","unit","hsCode"].includes(field) ? value : Number(value)||0 }
        : i
    ));
  const changeQty = (id, delta) =>
    setItems(prev => prev.map(i =>
      i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i
    ));

  /* ── Save ── */
 const handleSave = async () => {
  const missing = [];
  if (!client.name.trim())    missing.push("Client Name");
  if (!client.address.trim()) missing.push("Address");
  if (!invoiceDate)           missing.push("Date");
  if (!docType)               missing.push("Type");
  if (items.length === 0)     missing.push("At least one product/service");

  if (missing.length > 0) {
    alert(`Please fill all required fields before saving:\n\n• ${missing.join('\n• ')}`);
    return;
  }

  const duplicate = invoices.find(
    inv => inv.invoiceNo === invoiceNo && (!id || inv.id !== id)
  );

  if (duplicate) {
    alert(`Invoice number '${invoiceNo}' already exists.`);
    return;
  }

  const stockErrors = [];

  for (const item of items) {
    if (!item.productId) continue;

    const prod = products.find(p => p.id === item.productId);
    if (!prod) continue;

    const stock = prod.quantity !== undefined ? Number(prod.quantity) : 0;

    if (stock <= 0)
      stockErrors.push(`❌ ${prod.name} — out of stock`);

    else if (item.qty > stock)
      stockErrors.push(`⚠️ ${prod.name} — only ${stock} available`);
  }

  if (stockErrors.length > 0) {
    alert(`Stock issues:\n\n${stockErrors.join('\n')}`);
    return;
  }

  for (const item of items) {
    if (!item.productId) continue;

    const product = products.find(p => p.id === item.productId);

    if (product) {
      const newQty = Math.max(0, (product.quantity || 0) - item.qty);

      await updateDoc(doc(db, "products", product.id), {
        quantity: newQty
      });
    }
  }

  setSaving(true);

  const data = {
    invoiceNo,
    invoiceDate,
    dueDate,
    docType,
    company,
    client,
    items,
    taxEnabled,
    discountPct,
    notes,
    terms,
    subtotal,
    discount,
    tax,
    total,
    clientName: client.name
  };

  try {
    if (id && id !== "new") await updateInvoice(id, data);
    else await saveInvoice(data);

    // ⭐ THIS IS THE NEW LINE
    await upsertFromInvoice(client);

    navigate("/admin/invoices");
  } finally {
    setSaving(false);
  }
};

  /* ── Print ── */
  const handlePrint = () => {
    const safeTitle = `${docType} ${invoiceNo}`.replace(/[<>"'&]/g, "");
    const w = window.open("", "_blank");
    w.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>${safeTitle}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
  <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap" rel="stylesheet"/>
  <style>${PRINT_STYLES}</style>
</head>
<body>
  <div id="print-root"></div>
</body>
</html>`);
    w.document.close();
    const clone = printRef.current.cloneNode(true);
    clone.querySelectorAll("script").forEach(el => el.remove());
    clone.removeAttribute("style");
    w.document.getElementById("print-root").appendChild(clone);
    w.focus();
    // Use onafterprint to close the window after printing, to avoid blocking the main window
    w.onafterprint = function() {
      w.close();
    };
    // Some browsers require a delay before calling print
    setTimeout(() => { w.print(); }, 400);
  };

  const nowStr = () => {
    const d = new Date();
    return `${d.toLocaleDateString("en-IN")} ${d.toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit", hour12:true })}`;
  };

  const dateTimeStr = invoiceDate ? `${invoiceDate} 12:00:00PM` : "—";

  /* ══════════════════════════════════════════════════
     BUILD PAGES
     — Split items into chunks of ITEMS_PER_PAGE
     — Each page repeats header + customer info
     — Only the last page shows totals + signatures
  ══════════════════════════════════════════════════ */
  const chunks = [];
  if (items.length === 0) {
    chunks.push([]);
  } else {
    for (let i = 0; i < items.length; i += ITEMS_PER_PAGE) {
      chunks.push(items.slice(i, i + ITEMS_PER_PAGE));
    }
  }
  const totalPages = chunks.length;

  /* ── shared: company header ── */
  const HeaderBlock = () => (
    <div className="inv-header">
      <div className="co-name">{company.name} [{company.fy || "FY2082/083"}]</div>
      <div className="co-sub">Phone : {company.phone}&nbsp;&nbsp;|&nbsp;&nbsp;PAN NO : {company.pan || "XXXXXXXXX"}</div>
    </div>
  );

  /* ── shared: customer + invoice meta ── */
  const InfoBlock = ({ pageNum }) => (
    <table className="info-grid">
      <tbody>
        <tr>
          <td className="left-col">
            <table className="info-kv">
              <tbody>
                {[
                  ["Customer",    client.name || "—",                    true],
                  ["Address",     client.address || "—",                 false],
                  ["Contact No.", client.phone || "—",                   false],
                  ["VAT/PAN No.", client.gstin || "—",                   false],
                  ["Payment",     client.payment || "Cash/Credit",       false],
                ].map(([lbl, val, bold]) => (
                  <tr key={lbl}>
                    <td className="lbl">{lbl}</td>
                    <td className="colon">:</td>
                    <td className={bold ? "val-bold" : ""}>{val}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </td>
          <td>
            <table className="info-kv">
              <tbody>
                {[
                  ["Invoice No",    invoiceNo,      true],
                  ["Date & Time",   dateTimeStr,    false],
                  ["Miti",          dueDate || "—", false],
                  ["Order No & Dt", "",             false],
                  ["Transport",     "",             false],
                ].map(([lbl, val, bold]) => (
                  <tr key={lbl}>
                    <td className="lbl">{lbl}</td>
                    <td className="colon">:</td>
                    <td className={bold ? "val-bold" : ""}>{val}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  );

  /* ── shared: items table header row ── */
  const TableHead = () => (
    <thead>
      <tr>
        <th style={{width:"5%"}}>SNo</th>
        <th style={{width:"11%"}}>HS Code</th>
        <th className="left" style={{width:"32%"}}>Product</th>
        <th style={{width:"10%"}}>Quantity</th>
        <th style={{width:"8%"}}>Uom</th>
        <th style={{width:"14%"}}>Rate</th>
        <th style={{width:"20%"}}>Net Amount</th>
      </tr>
    </thead>
  );

  /* ── Build the full multi-page invoice JSX ── */
  const InvoiceDoc = (
    <div ref={printRef}>
      {chunks.map((pageItems, pageIdx) => {
        const isLastPage  = pageIdx === totalPages - 1;
        const globalStart = pageIdx * ITEMS_PER_PAGE;

        return (
          <div className="invoice-page" key={pageIdx}>

            {/* Header */}
            <HeaderBlock />

            {/* Page X of Y label */}
            {totalPages > 1 && (
              <div className="page-label">Page {pageIdx + 1} of {totalPages}</div>
            )}

            {/* Customer + Invoice meta */}
            <InfoBlock pageNum={pageIdx + 1} />

            {/* Items table — wrapped in flex-grow div so it fills remaining page height */}
            <div className="items-table-wrap">
              <table className="items-table">
                <TableHead />
                <tbody>
                  {pageItems.map((item, idx) => (
                    <tr key={item.id}>
                      <td className="center">{globalStart + idx + 1}</td>
                      <td className="center">{item.hsCode || ""}</td>
                      <td className="bold">{item.name}</td>
                      <td className="center">{fmt(item.qty)}</td>
                      <td className="center">{item.unit}</td>
                      <td className="right">{fmt(item.rate)}</td>
                      <td className="right bold">{fmt(item.qty * item.rate)}</td>
                    </tr>
                  ))}
                  {/* One stretch row that grows to fill all remaining vertical space */}
                  <tr className="stretch-row">
                    <td></td><td></td><td></td><td></td><td></td><td></td><td></td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Non-last page: "Continued on next page" */}
            {!isLastPage && (
              <div className="continued-label">Continued on next page…</div>
            )}

            {/* Last page only: Totals + Remarks + Signatures + Date */}
            {isLastPage && (
              <>
                {/* Totals */}
                <table className="totals-table">
                  <tbody>
                    <tr>
                      <td className="inwords-cell">
                        <strong>In Words : </strong>{numberToWords(total)}
                      </td>
                      <td className="totals-cell">
                        {totalRows.map(([lbl, val, bold]) => (
                          <div key={lbl} className={`total-row${bold ? " grand" : ""}`}>
                            <span>{lbl}</span>
                            <span className="t-val">
                              <span>:</span>
                              <span className="t-num">{val}</span>
                            </span>
                          </div>
                        ))}
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* Remarks */}
                <div className="remarks">
                  <strong>Remarks :</strong> {notes}
                </div>

                {/* Signatures */}
                <div className="sig-grid">
                  {[
                    { name: "",      role: "Received By" },
                    { name: "admin", role: "Prepared" },
                    { name: "admin", role: "Printed By" },
                    { name: "",      role: "Authorize By." },
                  ].map(({ name, role }) => (
                    <div key={role} className="sig-col">
                      <div className="sig-name">{name}</div>
                      <div className="sig-line" />
                      <div className="sig-role">{role}</div>
                    </div>
                  ))}
                </div>

                {/* Printed date */}
                <div className="print-date">Printed Date &amp; Time : {nowStr()}</div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );

  /* ── A4 scale for sidebar preview ── */
  const PREVIEW_W = 450;
  const A4_PX     = 210 * (96 / 25.4); // ~794px
  const SCALE     = PREVIEW_W / A4_PX;

  /* ══ RENDER ══ */
  return (
    <>
      <style>{PRINT_STYLES}</style>

      <div style={s.page}>

        {/* ── Top Bar ── */}
        <div style={s.topBar}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <button style={s.backBtn} onClick={() => navigate("/admin/invoices")}>← Back</button>
            <div>
              <h1 style={s.pageTitle}>{id && id !== "new" ? "Edit" : "New"} {docType}</h1>
              <p style={s.pageSub}>#{invoiceNo}</p>
            </div>
          </div>
          <div style={s.topActions}>
            <select style={s.docSel} value={docType} onChange={e => setDocType(e.target.value)}>
              {["Invoice","Estimate","Proforma Invoice","Quotation"].map(o => <option key={o}>{o}</option>)}
            </select>
            <button style={{ ...s.btn, ...s.btnGhost }} onClick={handlePrint}>🖨 Print / PDF</button>
            <button style={{ ...s.btn, ...s.btnSave }} onClick={handleSave} disabled={saving}>
              {saving ? "Saving…" : "💾 Save"}
            </button>
          </div>
        </div>

        <div style={s.layout}>

          {/* ════ LEFT EDITOR ════ */}
          <div style={s.editor}>

            <Card title="Your Company">
              {editCompany ? (
                <div style={s.fGrid}>
                  {[["name","Company Name"],["pan","PAN Number"],["fy","Fiscal Year"],["phone","Phone"],["email","Email"],["address","Address"],["city","City"]].map(([k, lbl]) => (
                    <div key={k} style={k === "name" || k === "address" ? { gridColumn:"1/-1" } : {}}>
                      <label style={s.lbl}>{lbl}</label>
                      <input style={s.inp} value={company[k] || ""} onChange={e => setCompany(p => ({ ...p, [k]: e.target.value }))} />
                    </div>
                  ))}
                  <button style={{ ...s.btn, ...s.btnPrimary, gridColumn:"1/-1" }} onClick={() => setEditCompany(false)}>✓ Done</button>
                </div>
              ) : (
                <div>
                  <div style={{ fontWeight:700, fontSize:14, color:"#0f172a" }}>{company.name}</div>
                  <div style={s.infoLine}>PAN: {company.pan} · FY: {company.fy}</div>
                  <div style={s.infoLine}>📞 {company.phone} · ✉ {company.email}</div>
                  <div style={s.infoLine}>{company.address}, {company.city}</div>
                  <button style={{ ...s.btn, ...s.btnGhost, marginTop:8 }} onClick={() => setEditCompany(true)}>✏️ Edit</button>
                </div>
              )}
            </Card>

          <Card title="Bill To (Client)">

<label style={s.lbl}>
Client Name <span style={{color:"#ef4444"}}>*</span>
</label>

<div style={{position:"relative",marginBottom:12}}>

<input
style={{...s.inp,marginBottom:0}}
placeholder="Type name to search or add new…"
value={client.name}
onChange={(e)=>{
const val = e.target.value;
setClient(p=>({...p,name:val}));
setClientSearch(val);
setShowClientDrop(true);
}}
onFocus={()=>{
setClientSearch(client.name);
setShowClientDrop(true);
}}
onBlur={()=>setTimeout(()=>setShowClientDrop(false),180)}
/>

{showClientDrop && (
<div style={s.drop} onMouseDown={(e)=>e.preventDefault()}>

{customers
.filter(c =>
!clientSearch.trim() ||
c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
(c.company||"").toLowerCase().includes(clientSearch.toLowerCase())
)
.slice(0,8)
.map(c=>(
<div
key={c.id}
style={s.dropItem}
onClick={()=>{

setClient({
name:c.name,
company:c.company||"",
phone:c.phone||"",
address:c.address||"",
gstin:c.gstin||"",
payment:client.payment||"Cash/Credit"
});

setShowClientDrop(false);
}}
>

<div>
<div style={s.dropName}>{c.name}</div>

{c.company && (
<div style={s.dropMeta}>{c.company}</div>
)}

{c.phone && (
<div style={s.dropMeta}>📞 {c.phone}</div>
)}

</div>

{c.gstin && (
<span style={{
fontSize:10,
color:"#a16207",
background:"#fefce8",
padding:"2px 6px",
borderRadius:4,
fontFamily:"monospace"
}}>
{c.gstin}
</span>
)}

</div>
))
}

{clientSearch.trim() &&
!customers.find(c=>c.name.toLowerCase()===clientSearch.toLowerCase()) && (

<div
style={{
padding:"9px 12px",
cursor:"pointer",
fontSize:13,
fontWeight:600,
color:"#0369a1",
borderTop:"1px solid #f1f5f9",
background:"#f0f9ff"
}}
onClick={()=>{
setClient(p=>({...p,name:clientSearch.trim()}));
setShowClientDrop(false);
}}
>

➕ Use "<strong>{clientSearch.trim()}</strong>" as new customer

</div>

)}

</div>
)}

</div>

<div style={s.fGrid}>

{[
["company","Company / Firm"],
["phone","Contact No."],
["address","Address"],
["gstin","VAT/PAN No"],
["payment","Payment Method"]
].map(([k,lbl])=>(

<div key={k} style={k==="address"?{gridColumn:"1/-1"}:{}}>

<label style={s.lbl}>{lbl}</label>

{k==="payment"
?
<select
style={s.inp}
value={client[k]||"Cash/Credit"}
onChange={(e)=>setClient(p=>({...p,[k]:e.target.value}))}
>
{["Cash/Credit","Cash","Credit","Cheque","Online Transfer"].map(o=>(
<option key={o}>{o}</option>
))}
</select>
:
<input
style={s.inp}
placeholder={lbl}
value={client[k]||""}
onChange={(e)=>setClient(p=>({...p,[k]:e.target.value}))}
/>
}

</div>

))}

</div>

</Card>

            <Card title="Document Details">
              <div style={s.fGrid}>
                <div>
                  <label style={s.lbl}>Invoice No.</label>
                  <input style={s.inp} value={invoiceNo} onChange={e => setInvoiceNo(e.target.value)} />
                </div>
                <div>
                  <label style={s.lbl}>Date</label>
                  <input type="date" style={s.inp} value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)} />
                </div>
                <div>
                  <label style={s.lbl}>Miti (BS Date)</label>
                  <input style={s.inp} placeholder="e.g. 10/10/2082" value={dueDate} onChange={e => setDueDate(e.target.value)} />
                </div>
                <div>
                  <label style={s.lbl}>Type</label>
                  <select style={s.inp} value={docType} onChange={e => setDocType(e.target.value)}>
                    {["Invoice","Estimate","Proforma Invoice","Quotation"].map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
              </div>
            </Card>

            <Card title="Products / Services">
              <div style={s.searchWrap}>
                <input
                  style={{ ...s.inp, marginBottom:0 }}
                  placeholder={products.length === 0 ? "⏳ Loading products…" : `🔍 Search ${products.length} products…`}
                  value={search}
                  onChange={e => { setSearch(e.target.value); setShowDrop(true); }}
                  onFocus={() => setShowDrop(true)}
                  onBlur={() => setTimeout(() => setShowDrop(false), 150)}
                  disabled={products.length === 0}
                />
                {showDrop && (
                  <div style={s.drop} onMouseDown={e => e.preventDefault()}>
                    {filtered.length === 0
                      ? <div style={s.dropEmpty}>No products found</div>
                      : filtered.map(p => (
                        <div key={p.id} style={s.dropItem} onClick={() => addProduct(p)}>
                          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                            {p.image
                              ? <img src={p.image} alt={p.name} style={s.dropImg} onError={e => e.target.style.display="none"} />
                              : <div style={s.dropImgPlaceholder}>⚙️</div>
                            }
                              <div>
                                <div style={s.dropName}>
                                  {p.name}
                                  {p.productCode && (
                                    <span style={s.dropCode}> | {p.productCode}</span>
                                  )}
                                  {p.category && (
                                    <span style={s.dropCat}> | {p.category}</span>
                                  )}
                                </div>

                                <div style={s.dropMeta}>
                                  <span style={{
                                    color: Number(p.quantity) < 5 ? "#dc2626" : "#16a34a",
                                    fontWeight: 700,
                                  }}>
                                    Stock: {p.quantity ?? 0}
                                  </span>

                                  {p.description && (
                                    <span style={{ marginLeft: 10 }}>
                                      {p.description}
                                    </span>
                                  )}
                                </div>
                              </div>
                          </div>
                          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                            <span style={s.dropPrice}>{p.price ? "Rs " + fmt(Number(p.price)) : "On request"}</span>
                            <span style={s.addTag}>+ Add</span>
                          </div>
                        </div>
                      ))
                    }
                    <div style={s.dropClose} onClick={() => setShowDrop(false)}>✕ Close</div>
                  </div>
                )}
              </div>

              {items.length > 0 && (
                <div style={s.tableWrap}>
                  <table style={s.table}>
                    <thead>
                      <tr style={s.thead}>
                        <th style={s.th}>HS Code</th>
                        <th style={{ ...s.th, width:"35%" }}>Product</th>
                        <th style={s.th}>Unit</th>
                        <th style={s.th}>Qty</th>
                        <th style={s.th}>Rate (Rs)</th>
                        <th style={{ ...s.th, textAlign:"right" }}>Amount</th>
                        <th style={s.th}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, idx) => (
                        <tr key={item.id} style={idx % 2 === 0 ? s.trEven : s.trOdd}>
                          <td style={s.td}>
                            <input style={{ ...s.cellInp, width:72 }} value={item.hsCode || ""} onChange={e => updateItem(item.id, "hsCode", e.target.value)} placeholder="—" />
                          </td>
                          <td style={s.td}>
                            <input style={s.cellInp} value={item.name} onChange={e => updateItem(item.id, "name", e.target.value)} />
                          </td>
                          <td style={s.td}>
                            <input style={{ ...s.cellInp, width:44 }} value={item.unit} onChange={e => updateItem(item.id, "unit", e.target.value)} />
                          </td>
                          <td style={s.td}>
                            <div style={s.stepper}>
                              <button style={s.stepBtn} onClick={() => changeQty(item.id, -1)}>−</button>
                              <input type="number" min="1" style={{ ...s.cellInp, width:36, textAlign:"center", fontWeight:700 }} value={item.qty} onChange={e => updateItem(item.id, "qty", e.target.value)} />
                              <button style={s.stepBtn} onClick={() => changeQty(item.id, +1)}>+</button>
                            </div>
                          </td>
                          <td style={s.td}>
                            <input type="number" min="0" style={{ ...s.cellInp, width:88 }} value={item.rate} onChange={e => updateItem(item.id, "rate", e.target.value)} />
                          </td>
                          <td style={{ ...s.td, textAlign:"right", fontWeight:700, color:"#0f172a" }}>
                            Rs {fmt(item.qty * item.rate)}
                          </td>
                          <td style={s.td}>
                            <button style={s.remBtn} onClick={() => removeItem(item.id)}>✕</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {items.length === 0 && <div style={s.emptyItems}>Search above to add products</div>}

              {/* Item count badge */}
              {items.length > 0 && (
                <div style={s.itemBadge}>
                  {items.length} item{items.length !== 1 ? "s" : ""} —
                  will print on <strong>{Math.ceil(items.length / ITEMS_PER_PAGE)} page{Math.ceil(items.length / ITEMS_PER_PAGE) > 1 ? "s" : ""}</strong>
                </div>
              )}

              <button style={{ ...s.btn, ...s.btnGhost, marginTop:10 }}
                onClick={() => setItems(p => [...p, { id:Date.now()+Math.random(), productId:null, hsCode:"", name:"Custom Item", unit:"NOS", qty:1, rate:0 }])}>
                + Add Custom Line
              </button>
            </Card>

            <Card title="Tax & Discount">
              <div style={s.fGrid}>
                <div>
                  <label style={s.lbl}>Discount (%)</label>
                  <input type="number" min="0" max="100" style={s.inp} value={discountPct} onChange={e => setDiscountPct(Number(e.target.value))} />
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:10, paddingTop:20 }}>
                  <input type="checkbox" id="vat" checked={taxEnabled} onChange={e => setTaxEnabled(e.target.checked)} style={{ width:18, height:18, cursor:"pointer" }} />
                  <label htmlFor="vat" style={{ ...s.lbl, marginBottom:0, cursor:"pointer" }}>Apply 13% VAT</label>
                </div>
              </div>
            </Card>

            <Card title="Remarks">
              <label style={s.lbl}>Remarks (printed on invoice)</label>
              <textarea style={{ ...s.inp, height:64, resize:"vertical" }} value={notes} onChange={e => setNotes(e.target.value)} />
            </Card>
          </div>

          {/* ════ RIGHT: LIVE PREVIEW ════ */}
          <div style={s.previewCol}>
            <div style={s.previewLabel}>
              LIVE PREVIEW
              {totalPages > 1 && (
                <span style={{ marginLeft:8, color:"#f59e0b", fontWeight:700 }}>
                  {totalPages} PAGES
                </span>
              )}
            </div>

            {/* Scrollable preview showing all pages stacked */}
            <div style={s.previewScroll}>
              <div style={{ transformOrigin:"top left", transform:`scale(${SCALE})`, width: A4_PX }}>
                {InvoiceDoc}
              </div>
            </div>

            <button style={{ ...s.btn, ...s.btnPrint, width:"100%", marginTop:12 }} onClick={handlePrint}>
              🖨 Print / Save as PDF
              {totalPages > 1 && ` (${totalPages} pages)`}
            </button>
            <button style={{ ...s.btn, ...s.btnSave, width:"100%", marginTop:8 }} onClick={handleSave} disabled={saving}>
              {saving ? "Saving…" : "💾 Save"}
            </button>
          </div>

        </div>
      </div>
    </>
  );
}

function Card({ title, children }) {
  return (
    <div style={{ background:"#fff", borderRadius:12, padding:"18px 20px", boxShadow:"0 1px 4px rgba(0,0,0,0.06)" }}>
      <h3 style={{ fontSize:11, fontWeight:700, letterSpacing:1.2, color:"#0369a1", textTransform:"uppercase", margin:"0 0 12px" }}>{title}</h3>
      {children}
    </div>
  );
}

const PREVIEW_W = 450;
const A4_PX     = 210 * (96 / 25.4);
const SCALE     = PREVIEW_W / A4_PX;

const s = {
  page:        { fontFamily:"'Segoe UI',sans-serif", background:"#f1f5f9", minHeight:"100vh", padding:"24px 16px" },
  topBar:      { display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20, flexWrap:"wrap", gap:12 },
  backBtn:     { background:"#e0f2fe", border:"1.5px solid #bae6fd", borderRadius:8, padding:"8px 14px", fontSize:13, fontWeight:600, cursor:"pointer", color:"#0369a1" },
  pageTitle:   { fontSize:22, fontWeight:800, color:"#0f172a", margin:0 },
  pageSub:     { fontSize:12, color:"#64748b", margin:"2px 0 0" },
  topActions:  { display:"flex", gap:10, flexWrap:"wrap", alignItems:"center" },
  docSel:      { padding:"9px 12px", borderRadius:8, border:"1.5px solid #e2e8f0", fontSize:13, fontWeight:600, background:"#fff", color:"#0f172a", cursor:"pointer" },
  layout:      { display:"grid", gridTemplateColumns:"1fr 470px", gap:20, alignItems:"start", maxWidth:1360, margin:"0 auto" },
  editor:      { display:"flex", flexDirection:"column", gap:14 },
  fGrid:       { display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 14px" },
  lbl:         { display:"block", fontSize:12, fontWeight:600, color:"#374151", marginBottom:5 },
  inp:         { width:"100%", padding:"8px 11px", borderRadius:7, border:"1.5px solid #e2e8f0", fontSize:13, color:"#0f172a", marginBottom:12, boxSizing:"border-box", outline:"none" },
  infoLine:    { fontSize:12, color:"#64748b", marginTop:3 },
  searchWrap:  { position:"relative", marginBottom:10 },
  drop:        { position:"absolute", top:"100%", left:0, right:0, zIndex:50, background:"#fff", borderRadius:10, border:"1.5px solid #e2e8f0", boxShadow:"0 8px 28px rgba(0,0,0,0.12)", maxHeight:280, overflowY:"auto" },
  dropItem:    { display:"flex", justifyContent:"space-between", alignItems:"center", padding:"9px 12px", cursor:"pointer", borderBottom:"1px solid #f1f5f9" },
  dropImg:     { width:34, height:34, borderRadius:6, objectFit:"cover", flexShrink:0 },
  dropImgPlaceholder: { width:34, height:34, background:"#f0f9ff", borderRadius:6, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 },
  dropName:    { fontSize:13, fontWeight:600, color:"#0f172a" },
  dropMeta:    { fontSize:11, color:"#94a3b8", marginTop:1 },
  dropPrice:   { fontSize:13, fontWeight:700, color:"#0369a1" },
  addTag:      { background:"#0369a1", color:"#fff", fontSize:11, fontWeight:700, padding:"2px 8px", borderRadius:5 },
  dropEmpty:   { padding:14, textAlign:"center", color:"#94a3b8", fontSize:13 },
  dropClose:   { padding:"7px 12px", textAlign:"center", fontSize:12, color:"#94a3b8", borderTop:"1px solid #f1f5f9", cursor:"pointer" },
  tableWrap:   { overflowX:"auto", borderRadius:8, border:"1px solid #e2e8f0", marginTop:10, marginBottom:4 },
  table:       { width:"100%", borderCollapse:"collapse" },
  thead:       { background:"#f8fafc" },
  th:          { padding:"8px 8px", fontSize:10, fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:0.6, borderBottom:"1px solid #e2e8f0", textAlign:"center" },
  td:          { padding:"7px 8px", fontSize:12, borderBottom:"1px solid #f1f5f9", textAlign:"center" },
  trEven:      { background:"#f8fafc" },
  trOdd:       { background:"#fff" },
  cellInp:     { border:"1px solid transparent", borderRadius:4, padding:"3px 4px", fontSize:12, width:"100%", background:"transparent", outline:"none", color:"#0f172a" },
  stepper:     { display:"flex", alignItems:"center", gap:3, justifyContent:"center" },
  stepBtn:     { width:22, height:22, borderRadius:4, border:"1px solid #bae6fd", background:"#e0f2fe", cursor:"pointer", fontSize:13, fontWeight:700, color:"#0369a1" },
  remBtn:      { background:"#fee2e2", color:"#dc2626", border:"none", borderRadius:4, width:22, height:22, cursor:"pointer", fontSize:11, fontWeight:700 },
  emptyItems:  { textAlign:"center", padding:"18px 0", color:"#94a3b8", fontSize:13, border:"2px dashed #bae6fd", borderRadius:8, marginTop:8 },
  itemBadge:   { fontSize:12, color:"#64748b", marginTop:8, padding:"6px 10px", background:"#f0f9ff", borderRadius:6, border:"1px solid #bae6fd" },
  btn:         { padding:"9px 16px", borderRadius:8, border:"none", fontSize:13, fontWeight:700, cursor:"pointer" },
  btnPrimary:  { background:"#0ea5e9", color:"#fff" },
  btnGhost:    { background:"#f1f5f9", color:"#475569" },
  btnSave:     { background:"#10b981", color:"#fff" },
  btnPrint:    { background:"#0369a1", color:"#fff" },
  previewCol:  { position:"sticky", top:20 },
  previewLabel:{ fontSize:10, fontWeight:700, letterSpacing:1.5, color:"#94a3b8", textTransform:"uppercase", marginBottom:6 },
  previewScroll: {
    width: PREVIEW_W,
    height: Math.round(A4_PX * (297/210) * SCALE) + 4,
    overflow: "hidden",
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    background: "#f8fafc",
    boxShadow: "0 4px 20px rgba(0,0,0,0.10)",
  },
  dropCode: {
  fontSize: 12,
  fontWeight: 600,
  color: "#64748b",
},

dropCat: {
  fontSize: 12,
  fontWeight: 500,
  color: "#94a3b8",
},
};