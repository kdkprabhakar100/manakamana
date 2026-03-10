import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useProducts } from "../../hooks/useProducts";
import { useInvoices } from "../../hooks/useInvoices";

const TAX_RATE = 0.13;

function fmt(n) {
  return Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/* ── Convert number to words (Nepali style) ── */
function numberToWords(n) {
  if (n === 0) return "Zero";
  const ones = ["","One","Two","Three","Four","Five","Six","Seven","Eight","Nine",
    "Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen","Eighteen","Nineteen"];
  const tens = ["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"];
  function convert(num) {
    if (num < 20) return ones[num];
    if (num < 100) return tens[Math.floor(num/10)] + (num%10?" "+ones[num%10]:"");
    if (num < 1000) return ones[Math.floor(num/100)]+" Hundred"+(num%100?" "+convert(num%100):"");
    if (num < 100000) return convert(Math.floor(num/1000))+" Thousand"+(num%1000?" "+convert(num%1000):"");
    if (num < 10000000) return convert(Math.floor(num/100000))+" Lakh"+(num%100000?" "+convert(num%100000):"");
    return convert(Math.floor(num/10000000))+" Crore"+(num%10000000?" "+convert(num%10000000):"");
  }
  const rupees = Math.floor(n);
  const paisa  = Math.round((n - rupees) * 100);
  let words = convert(rupees) + " Rupees";
  if (paisa > 0) words += " And " + convert(paisa) + " Paisa";
  return words + " Only";
}

/* ── Nepali fiscal year: starts mid-July (Shrawan 1) ── */
function getFiscalYear() {
  const now  = new Date();
  const year = now.getFullYear();
  const bsYear = year + 56; // approximate BS year
  const cutoff = new Date(year, 6, 16); // ~July 16
  if (now >= cutoff) return `FY${bsYear}/${(bsYear+1).toString().slice(-3)}`;
  return `FY${bsYear-1}/${bsYear.toString().slice(-3)}`;
}

const INV_KEY = "manakamana_inv_counter";
function newInvoiceNo() {
  const n = parseInt(localStorage.getItem(INV_KEY) || "0", 10) + 1;
  localStorage.setItem(INV_KEY, String(n));
  return `SB-${String(n).padStart(5, "0")}`;
}

export default function AdminInvoice() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const printRef   = useRef();

  const { products }                            = useProducts();
  const { invoices, saveInvoice, updateInvoice } = useInvoices();

  const today = () => new Date().toISOString().slice(0,10);

  const DEFAULT_COMPANY = {
    name:    "Manakamana Heavy Equipments Pvt. Ltd.",
    fy:      getFiscalYear(),
    address: "Kritipur, Chovar, Bagmati Province, Nepal",
    city:    "Kathmandu, Nepal",
    phone:   "+977-9851068337",
    email:   "mhektm@gmail.com",
    pan:     "XXXXXXXXX",
    billNo:  "",
  };

  const EMPTY_CLIENT = { name:"", company:"", address:"", phone:"", email:"", gstin:"", payment:"Cash/Credit" };
  const DEFAULT_NOTES = "";
  const DEFAULT_TERMS = "Payment due within 30 days.\nGoods once sold will not be taken back.";

  const [invoiceNo,   setInvoiceNo]   = useState(newInvoiceNo);
  const [invoiceDate, setInvoiceDate] = useState(today());
  const [dueDate,     setDueDate]     = useState("");
  const [docType,     setDocType]     = useState("Invoice");
  const [company,     setCompany]     = useState(DEFAULT_COMPANY);
  const [client,      setClient]      = useState(EMPTY_CLIENT);
  const [items,       setItems]       = useState([]);
  const [taxEnabled,  setTaxEnabled]  = useState(true);
  const [discountPct, setDiscountPct] = useState(0);
  const [notes,       setNotes]       = useState(DEFAULT_NOTES);
  const [terms,       setTerms]       = useState(DEFAULT_TERMS);
  const [editCompany, setEditCompany] = useState(false);
  const [search,      setSearch]      = useState("");
  const [showDrop,    setShowDrop]    = useState(false);
  const [saving,      setSaving]      = useState(false);

  /* ── Load existing invoice ── */
  useEffect(() => {
    if (id && id !== "new") {
      const existing = invoices.find(i => i.id === id);
      if (existing) {
        setInvoiceNo(existing.invoiceNo || newInvoiceNo());
        setInvoiceDate(existing.invoiceDate || today());
        setDueDate(existing.dueDate || "");
        setDocType(existing.docType || "Invoice");
        setClient(existing.client || EMPTY_CLIENT);
        setItems(existing.items || []);
        setDiscountPct(existing.discountPct || 0);
        setTaxEnabled(existing.taxEnabled ?? true);
        setNotes(existing.notes || DEFAULT_NOTES);
        setTerms(existing.terms || DEFAULT_TERMS);
        setCompany(existing.company || DEFAULT_COMPANY);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, invoices]);

  /* ── Calculations ── */
  const subtotal = items.reduce((s,i) => s + i.qty * i.rate, 0);
  const discount = subtotal * (discountPct / 100);
  const taxable  = subtotal - discount;
  const tax      = taxEnabled ? taxable * TAX_RATE : 0;
  const total    = taxable + tax;

  /* ── Product search ── */
  const filtered = search.trim()
    ? products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.category||"").toLowerCase().includes(search.toLowerCase())
      )
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
        hsCode:    product.hsCode || "",
        name:      product.name,
        unit:      product.unit || "NOS",
        qty:       1,
        rate:      Number(product.price) || 0,
      }]);
    }
    setSearch("");
    setShowDrop(false);
  }

  const removeItem  = (id) => setItems(p => p.filter(i => i.id !== id));
  const updateItem  = (id, field, value) =>
    setItems(prev => prev.map(i =>
      i.id === id
        ? { ...i, [field]: ["name","unit","hsCode"].includes(field) ? value : Number(value)||0 }
        : i
    ));
  const changeQty   = (id, delta) =>
    setItems(prev => prev.map(i =>
      i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i
    ));

  /* ── Save ── */
  const handleSave = async () => {
    if (!client.name.trim() || items.length === 0) {
      alert("Please fill Client Name and add at least one product.");
      return;
    }
    setSaving(true);
    const data = {
      invoiceNo, invoiceDate, dueDate, docType,
      company, client, items,
      taxEnabled, discountPct, notes, terms,
      subtotal, discount, tax, total,
      clientName: client.name,
    };
    try {
      if (id && id !== "new") await updateInvoice(id, data);
      else await saveInvoice(data);
      navigate("/admin/invoices");
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = () => {
    const now = new Date();
    const printTime = now.toLocaleDateString("en-IN") + " " +
      now.toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit", hour12:true });
    const timeStr = now.toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit", hour12:false });

    const rows = items.map((item, idx) => `
      <tr>
        <td class="c">${idx + 1}</td>
        <td class="c">${item.hsCode || ""}</td>
        <td class="l">${item.name}</td>
        <td class="c">${fmt(item.qty)}</td>
        <td class="c">${item.unit}</td>
        <td class="r">${fmt(item.rate)}</td>
        <td class="r">${fmt(item.qty * item.rate)}</td>
      </tr>`).join("");

    const discountRow = discountPct > 0 ? `
      <tr class="trow">
        <td colspan="5" class="r tot-left"></td>
        <td class="r">Discount (${discountPct}%) :</td>
        <td class="r">${fmt(discount)}</td>
      </tr>` : "";

    const vatRow = taxEnabled ? `
      <tr class="trow">
        <td colspan="5" class="r tot-left"></td>
        <td class="r">13% VAT :</td>
        <td class="r">${fmt(tax)}</td>
      </tr>` : "";

    const totalsBlock = `
      <tr class="trow">
        <td colspan="5" class="r tot-left"><b>In Words:</b> ${numberToWords(total)}</td>
        <td class="r">Sub Total :</td>
        <td class="r"><b>${fmt(subtotal)}</b></td>
      </tr>
      ${discountRow}
      <tr class="trow">
        <td colspan="5" class="r tot-left"></td>
        <td class="r">Taxable Value :</td>
        <td class="r">${fmt(taxable)}</td>
      </tr>
      ${vatRow}
      <tr class="tgrand">
        <td colspan="5" class="r tot-left"></td>
        <td class="r">Total Amount :</td>
        <td class="r">${fmt(total)}</td>
      </tr>`;

    const w = window.open("", "_blank");
    w.document.write(`<!DOCTYPE html>
<html><head>
<meta charset="UTF-8"/>
<title>${docType} ${invoiceNo}</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Arial',sans-serif;font-size:11px;color:#000;background:#fff}
.wrap{width:210mm;margin:0 auto;padding:10mm 13mm 8mm}
.co-name{font-size:17px;font-weight:bold;text-align:center;text-transform:uppercase;letter-spacing:.5px}
.co-sub{font-size:11px;text-align:center;margin:3px 0 5px}
.hr1{border-top:2.5px solid #000;margin-bottom:1px}
.hr2{border-top:1px solid #000;margin-bottom:6px}
.info{width:100%;border-collapse:collapse;margin-bottom:6px;border:1px solid #000}
.info td{padding:3px 7px;font-size:11px;vertical-align:top}
.info .lbl{font-weight:bold;white-space:nowrap}
.info .bdl{border-left:1px solid #000}
.inv{width:100%;border-collapse:collapse;table-layout:fixed}
.inv th{border:1px solid #000;padding:5px 4px;text-align:center;font-size:11px;font-weight:bold}
.inv td{border:1px solid #000;padding:4px 5px;font-size:11px;vertical-align:middle}
.c{text-align:center}.r{text-align:right}.l{text-align:left;padding-left:6px}
.trow td{border:1px solid #000;padding:3px 6px;font-size:11px}
.tgrand td{border:1px solid #000;padding:4px 6px;font-size:12px;font-weight:bold;background:#f0f0f0}
.tot-left{border-right:1px solid #000 !important;text-align:left;font-size:10px;color:#333}
.remarks{margin-top:8px;font-size:11px}
.sig{width:100%;border-collapse:collapse;margin-top:40px}
.sig td{width:25%;text-align:center;padding:0 8px;vertical-align:bottom}
.sig-name{font-size:11px;font-weight:bold;min-height:20px}
.sig-line{border-top:1px solid #000;margin:2px 0 3px}
.sig-label{font-size:10px;color:#444}
.ptime{margin-top:10px;font-size:10px;color:#555}
@media print{
  body{margin:0;-webkit-print-color-adjust:exact;print-color-adjust:exact}
  .wrap{padding:7mm 10mm 5mm;width:100%}
  thead{display:table-header-group}
  tr{page-break-inside:avoid}
  .keep{page-break-inside:avoid}
}
</style>
</head><body>
<div class="wrap">
<div class="co-name">${company.name} [${company.fy || getFiscalYear()}]</div>
<div class="co-sub">Phone : ${company.phone}&nbsp;&nbsp;&nbsp;&nbsp;PAN NO : ${company.pan}</div>
<div class="hr1"></div><div class="hr2"></div>
<table class="info"><tr>
  <td style="width:50%">
    <table style="width:100%;border-collapse:collapse">
      <tr><td class="lbl">Customer&nbsp;</td><td>: ${client.company || client.name || "—"}</td></tr>
      <tr><td class="lbl">Address&nbsp;</td><td>: ${client.address || "—"}</td></tr>
      <tr><td class="lbl">Contact No&nbsp;</td><td>: ${client.phone || "—"}</td></tr>
      <tr><td class="lbl">VAT/PAN No&nbsp;</td><td>: ${client.gstin || "—"}</td></tr>
      <tr><td class="lbl">Payment&nbsp;</td><td>: ${client.payment || "Cash/Credit"}</td></tr>
    </table>
  </td>
  <td class="bdl" style="width:50%">
    <table style="width:100%;border-collapse:collapse">
      <tr><td class="lbl">Invoice No&nbsp;</td><td>: ${invoiceNo}</td></tr>
      <tr><td class="lbl">Date &amp; Time&nbsp;</td><td>: ${invoiceDate} ${timeStr}</td></tr>
      <tr><td class="lbl">Miti&nbsp;</td><td>: ${dueDate || ""}</td></tr>
      <tr><td class="lbl">Order No &amp; Dt&nbsp;</td><td>:</td></tr>
      <tr><td class="lbl">Transport&nbsp;</td><td>:</td></tr>
    </table>
  </td>
</tr></table>
<table class="inv">
  <thead><tr>
    <th style="width:4%">SNo</th>
    <th style="width:10%">HS Code</th>
    <th style="width:35%">Product</th>
    <th style="width:9%">Quantity</th>
    <th style="width:8%">Uom</th>
    <th style="width:17%">Rate</th>
    <th style="width:17%">Net Amount</th>
  </tr></thead>
  <tbody>
    ${rows}
    ${totalsBlock}
  </tbody>
</table>
<div class="remarks keep">Remarks : ${notes || ""}</div>
<table class="sig keep"><tr>
  <td><div class="sig-name"></div><div class="sig-line"></div><div class="sig-label">Received By</div></td>
  <td><div class="sig-name">admin</div><div class="sig-line"></div><div class="sig-label">Prepared</div></td>
  <td><div class="sig-name">admin</div><div class="sig-line"></div><div class="sig-label">Printed By</div></td>
  <td><div class="sig-name"></div><div class="sig-line"></div><div class="sig-label">Authorize By.</div></td>
</tr></table>
<div class="ptime keep">Printed Date &amp; Time : ${printTime}</div>
</div></body></html>`);
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); w.close(); }, 700);
  };

  /* ══ RENDER ══ */
  return (
    <div style={s.page}>

      {/* Top bar */}
      <div style={s.topBar}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <button style={s.backBtn} onClick={() => navigate("/admin/invoices")}>← Back</button>
          <div>
            <h1 style={s.pageTitle}>{id&&id!=="new"?"Edit":"New"} {docType}</h1>
            <p style={s.pageSub}>#{invoiceNo}</p>
          </div>
        </div>
        <div style={s.topActions}>
          <select style={s.docSel} value={docType} onChange={e=>setDocType(e.target.value)}>
            {["Invoice","Estimate","Proforma Invoice","Quotation"].map(o=><option key={o}>{o}</option>)}
          </select>
          <button style={{...s.btn,...s.btnGhost}} onClick={handlePrint}>🖨 Print / PDF</button>
          <button style={{...s.btn,...s.btnSave}} onClick={handleSave} disabled={saving}>
            {saving?"Saving…":"💾 Save"}
          </button>
        </div>
      </div>

      <div style={s.layout}>
        <div style={s.editor}>

          {/* Company */}
          <Card title="Your Company">
            {editCompany ? (
              <div style={s.fGrid}>
                {[["name","Company Name"],["pan","PAN Number"],["phone","Phone"],["email","Email"],["address","Address"],["city","City"],["fy","Fiscal Year"]].map(([k,lbl])=>(
                  <div key={k} style={k==="name"||k==="address"?{gridColumn:"1/-1"}:{}}>
                    <label style={s.lbl}>{lbl}</label>
                    <input style={s.inp} value={company[k]||""}
                      onChange={e=>setCompany(p=>({...p,[k]:e.target.value}))} />
                  </div>
                ))}
                <button style={{...s.btn,...s.btnPrimary,gridColumn:"1/-1"}}
                  onClick={()=>setEditCompany(false)}>✓ Done</button>
              </div>
            ) : (
              <div>
                <div style={{fontWeight:700,fontSize:14,color:"#0f172a"}}>{company.name}</div>
                <div style={s.infoLine}>PAN: {company.pan} · FY: {company.fy}</div>
                <div style={s.infoLine}>📞 {company.phone} · ✉ {company.email}</div>
                <div style={s.infoLine}>{company.address}, {company.city}</div>
                <button style={{...s.btn,...s.btnGhost,marginTop:8}} onClick={()=>setEditCompany(true)}>✏️ Edit</button>
              </div>
            )}
          </Card>

          {/* Client */}
          <Card title="Bill To (Client)">
            <div style={s.fGrid}>
              {[["name","Client Name",true],["company","Company / Firm",true],["phone","Phone"],["email","Email"],["address","Address",true],["gstin","VAT/PAN No"],["payment","Payment Method"]].map(([k,lbl,req])=>(
                <div key={k} style={k==="address"?{gridColumn:"1/-1"}:{}}>
                  <label style={s.lbl}>{lbl}{req&&<span style={{color:"#ef4444"}}> *</span>}</label>
                  {k==="payment"
                    ? <select style={s.inp} value={client[k]||"Cash/Credit"} onChange={e=>setClient(p=>({...p,[k]:e.target.value}))}>
                        {["Cash/Credit","Cash","Credit","Cheque","Online Transfer"].map(o=><option key={o}>{o}</option>)}
                      </select>
                    : <input style={s.inp} placeholder={lbl} value={client[k]||""}
                        onChange={e=>setClient(p=>({...p,[k]:e.target.value}))} />
                  }
                </div>
              ))}
            </div>
          </Card>

          {/* Document Details */}
          <Card title="Document Details">
            <div style={s.fGrid}>
              <div>
                <label style={s.lbl}>Invoice No.</label>
                <input style={{...s.inp,background:"#f8fafc",color:"#94a3b8"}} value={invoiceNo} readOnly />
              </div>
              <div>
                <label style={s.lbl}>Date</label>
                <input type="date" style={s.inp} value={invoiceDate} onChange={e=>setInvoiceDate(e.target.value)} />
              </div>
              <div>
                <label style={s.lbl}>Miti (BS Date)</label>
                <input style={s.inp} placeholder="e.g. 10/10/2082" value={dueDate} onChange={e=>setDueDate(e.target.value)} />
              </div>
              <div>
                <label style={s.lbl}>Type</label>
                <select style={s.inp} value={docType} onChange={e=>setDocType(e.target.value)}>
                  {["Invoice","Estimate","Proforma Invoice","Quotation"].map(o=><option key={o}>{o}</option>)}
                </select>
              </div>
            </div>
          </Card>

          {/* Products */}
          <Card title="Products / Services">
            <div style={s.searchWrap}>
              <input
                style={{...s.inp,marginBottom:0}}
                placeholder={products.length===0?"⏳ Loading products…":`🔍 Search ${products.length} products…`}
                value={search}
                onChange={e=>{setSearch(e.target.value);setShowDrop(true);}}
                onFocus={()=>setShowDrop(true)}
                onBlur={()=>setTimeout(()=>setShowDrop(false),150)}
                disabled={products.length===0}
              />
              {showDrop && (
                <div style={s.drop} onMouseDown={e=>e.preventDefault()}>
                  {filtered.length===0
                    ? <div style={s.dropEmpty}>No products found</div>
                    : filtered.map(p=>(
                      <div key={p.id} style={s.dropItem} onClick={()=>addProduct(p)}>
                        <div style={{display:"flex",alignItems:"center",gap:10}}>
                          {p.image
                            ? <img src={p.image} alt={p.name} style={s.dropImg} onError={e=>e.target.style.display="none"} />
                            : <div style={s.dropImgPlaceholder}>⚙️</div>
                          }
                          <div>
                            <div style={s.dropName}>{p.name}</div>
                            <div style={s.dropMeta}>{p.category||""}{p.unit?" · "+p.unit:""}</div>
                          </div>
                        </div>
                        <div style={{display:"flex",alignItems:"center",gap:8}}>
                          <span style={s.dropPrice}>{p.price?"Rs "+fmt(Number(p.price)):"On request"}</span>
                          <span style={s.addTag}>+ Add</span>
                        </div>
                      </div>
                    ))
                  }
                  <div style={s.dropClose} onClick={()=>setShowDrop(false)}>✕ Close</div>
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div style={s.tableWrap}>
                <table style={s.table}>
                  <thead><tr style={s.thead}>
                    <th style={s.th}>HS Code</th>
                    <th style={{...s.th,width:"35%"}}>Product</th>
                    <th style={s.th}>Unit</th>
                    <th style={s.th}>Qty</th>
                    <th style={s.th}>Rate (Rs)</th>
                    <th style={{...s.th,textAlign:"right"}}>Amount</th>
                    <th style={s.th}></th>
                  </tr></thead>
                  <tbody>
                    {items.map((item,idx)=>(
                      <tr key={item.id} style={idx%2===0?s.trEven:s.trOdd}>
                        <td style={s.td}>
                          <input style={{...s.cellInp,width:72}} value={item.hsCode||""}
                            onChange={e=>updateItem(item.id,"hsCode",e.target.value)} placeholder="—" />
                        </td>
                        <td style={s.td}>
                          <input style={s.cellInp} value={item.name}
                            onChange={e=>updateItem(item.id,"name",e.target.value)} />
                        </td>
                        <td style={s.td}>
                          <input style={{...s.cellInp,width:44}} value={item.unit}
                            onChange={e=>updateItem(item.id,"unit",e.target.value)} />
                        </td>
                        <td style={s.td}>
                          <div style={s.stepper}>
                            <button style={s.stepBtn} onClick={()=>changeQty(item.id,-1)}>−</button>
                            <input type="number" min="1" style={{...s.cellInp,width:36,textAlign:"center",fontWeight:700}}
                              value={item.qty} onChange={e=>updateItem(item.id,"qty",e.target.value)} />
                            <button style={s.stepBtn} onClick={()=>changeQty(item.id,+1)}>+</button>
                          </div>
                        </td>
                        <td style={s.td}>
                          <input type="number" min="0" style={{...s.cellInp,width:88}}
                            value={item.rate} onChange={e=>updateItem(item.id,"rate",e.target.value)} />
                        </td>
                        <td style={{...s.td,textAlign:"right",fontWeight:700,color:"#0f172a"}}>
                          Rs {fmt(item.qty*item.rate)}
                        </td>
                        <td style={s.td}>
                          <button style={s.remBtn} onClick={()=>removeItem(item.id)}>✕</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {items.length===0 && (
              <div style={s.emptyItems}>Search above to add products</div>
            )}

            <button style={{...s.btn,...s.btnGhost,marginTop:10}}
              onClick={()=>setItems(p=>[...p,{id:Date.now()+Math.random(),productId:null,hsCode:"",name:"Custom Item",unit:"NOS",qty:1,rate:0}])}>
              + Add Custom Line
            </button>
          </Card>

          {/* Tax */}
          <Card title="Tax & Discount">
            <div style={s.fGrid}>
              <div>
                <label style={s.lbl}>Discount (%)</label>
                <input type="number" min="0" max="100" style={s.inp} value={discountPct}
                  onChange={e=>setDiscountPct(Number(e.target.value))} />
              </div>
              <div style={{display:"flex",alignItems:"center",gap:10,paddingTop:20}}>
                <input type="checkbox" id="vat" checked={taxEnabled}
                  onChange={e=>setTaxEnabled(e.target.checked)} style={{width:18,height:18,cursor:"pointer"}} />
                <label htmlFor="vat" style={{...s.lbl,marginBottom:0,cursor:"pointer"}}>Apply 13% VAT</label>
              </div>
            </div>
          </Card>

          {/* Notes */}
          <Card title="Remarks">
            <label style={s.lbl}>Remarks (printed on invoice)</label>
            <textarea style={{...s.inp,height:64,resize:"vertical"}} value={notes}
              onChange={e=>setNotes(e.target.value)} />
          </Card>
        </div>

        {/* ═══ RIGHT PREVIEW ═══ */}
        <div style={s.previewCol}>
          <div style={s.previewLabel}>LIVE PREVIEW</div>
          <div ref={printRef} style={s.doc}>

            {/* Header */}
            <div style={{textAlign:"center",marginBottom:4}}>
              <div style={{fontSize:15,fontWeight:900,textTransform:"uppercase",letterSpacing:0.5}}>{company.name} [{company.fy}]</div>
              <div style={{fontSize:10,color:"#444",marginTop:2}}>Phone : {company.phone} &nbsp;&nbsp; PAN NO : {company.pan}</div>
            </div>
            <div style={{borderTop:"2px solid #000",margin:"6px 0"}} />

            {/* Info grid */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",border:"1px solid #000",marginBottom:6,fontSize:10}}>
              <div style={{padding:"6px 8px",borderRight:"1px solid #000"}}>
                <div><b>Customer :</b> {client.company||client.name||"—"}</div>
                <div><b>Address :</b> {client.address||"—"}</div>
                <div><b>Contact No :</b> {client.phone||"—"}</div>
                <div><b>VAT/PAN No :</b> {client.gstin||"—"}</div>
                <div><b>Payment :</b> {client.payment||"Cash/Credit"}</div>
              </div>
              <div style={{padding:"6px 8px"}}>
                <div><b>Invoice No :</b> {invoiceNo}</div>
                <div><b>Date &amp; Time :</b> {invoiceDate}</div>
                <div><b>Miti :</b> {dueDate||"—"}</div>
                <div><b>Order No &amp; Dt :</b></div>
                <div><b>Transport :</b></div>
              </div>
            </div>

            {/* Items table */}
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:10,marginBottom:0}}>
              <thead>
                <tr style={{background:"#f8fafc"}}>
                  {["SNo","HS Code","Product","Quantity","Uom","Rate","Net Amount"].map(h=>(
                    <th key={h} style={{border:"1px solid #000",padding:"4px 5px",textAlign:h==="Product"?"left":"center",fontSize:9,fontWeight:700}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.length===0
                  ? <tr><td colSpan={7} style={{border:"1px solid #000",padding:"16px",textAlign:"center",color:"#94a3b8"}}>No items yet</td></tr>
                  : items.map((item,idx)=>(
                    <tr key={item.id}>
                      <td style={{border:"1px solid #000",padding:"3px 5px",textAlign:"center"}}>{idx+1}</td>
                      <td style={{border:"1px solid #000",padding:"3px 5px",textAlign:"center"}}>{item.hsCode||""}</td>
                      <td style={{border:"1px solid #000",padding:"3px 5px"}}><b>{item.name}</b></td>
                      <td style={{border:"1px solid #000",padding:"3px 5px",textAlign:"center"}}>{fmt(item.qty)}</td>
                      <td style={{border:"1px solid #000",padding:"3px 5px",textAlign:"center"}}>{item.unit}</td>
                      <td style={{border:"1px solid #000",padding:"3px 5px",textAlign:"right"}}>{fmt(item.rate)}</td>
                      <td style={{border:"1px solid #000",padding:"3px 5px",textAlign:"right",fontWeight:700}}>{fmt(item.qty*item.rate)}</td>
                    </tr>
                  ))
                }
              </tbody>
            </table>

            {/* Totals */}
            <div style={{display:"grid",gridTemplateColumns:"1fr auto",border:"1px solid #000",borderTop:"none",fontSize:10}}>
              <div style={{padding:"6px 8px",borderRight:"1px solid #000"}}>
                <div style={{fontWeight:700,fontSize:9}}>In Words :</div>
                <div style={{marginTop:3}}>{numberToWords(total)}</div>
              </div>
              <div style={{minWidth:200}}>
                {[["Sub Total", fmt(subtotal)],
                  ...(discountPct>0?[[`Discount (${discountPct}%)`, fmt(discount)]]:[]),
                  ["Taxable Value", fmt(taxable)],
                  ...(taxEnabled?[["13% VAT", fmt(tax)]]:[]),
                  ["Total Amount", fmt(total)]
                ].map(([l,v],i,arr)=>(
                  <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"3px 8px",borderBottom:i<arr.length-1?"1px solid #000":"none",fontWeight:l==="Total Amount"?700:400}}>
                    <span>{l}</span><span>: {v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Remarks */}
            {notes && <div style={{fontSize:10,marginTop:6}}>Remarks : {notes}</div>}

            {/* Signatures */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",marginTop:28,gap:0}}>
              {[["","Received By"],["admin","Prepared"],["admin","Printed By"],["","Authorize By."]].map(([name,role])=>(
                <div key={role} style={{textAlign:"center",padding:"0 4px"}}>
                  <div style={{fontSize:10,fontWeight:700,height:16}}>{name}</div>
                  <div style={{borderTop:"1px solid #000",marginBottom:3}}/>
                  <div style={{fontSize:9,color:"#555"}}>{role}</div>
                </div>
              ))}
            </div>

            <div style={{fontSize:9,color:"#888",marginTop:10}}>
              Printed Date & Time : {new Date().toLocaleDateString("en-IN")} {new Date().toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",hour12:true})}
            </div>
          </div>

          <button style={{...s.btn,...s.btnPrint,width:"100%",marginTop:12}} onClick={handlePrint}>
            🖨 Print / Save as PDF
          </button>
          <button style={{...s.btn,...s.btnSave,width:"100%",marginTop:8}} onClick={handleSave} disabled={saving}>
            {saving?"Saving…":"💾 Save to Firebase"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div style={{background:"#fff",borderRadius:12,padding:"18px 20px",boxShadow:"0 1px 4px rgba(0,0,0,0.06)"}}>
      <h3 style={{fontSize:11,fontWeight:700,letterSpacing:1.2,color:"#0369a1",textTransform:"uppercase",margin:"0 0 12px"}}>{title}</h3>
      {children}
    </div>
  );
}

const s = {
  page:       { fontFamily:"'Segoe UI',sans-serif", background:"#f1f5f9", minHeight:"100vh", padding:"24px 16px" },
  topBar:     { display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20, flexWrap:"wrap", gap:12 },
  backBtn:    { background:"#e0f2fe", border:"1.5px solid #bae6fd", borderRadius:8, padding:"8px 14px", fontSize:13, fontWeight:600, cursor:"pointer", color:"#0369a1" },
  pageTitle:  { fontSize:22, fontWeight:800, color:"#0f172a", margin:0 },
  pageSub:    { fontSize:12, color:"#64748b", margin:"2px 0 0" },
  topActions: { display:"flex", gap:10, flexWrap:"wrap", alignItems:"center" },
  docSel:     { padding:"9px 12px", borderRadius:8, border:"1.5px solid #e2e8f0", fontSize:13, fontWeight:600, background:"#fff", color:"#0f172a", cursor:"pointer" },
  layout:     { display:"grid", gridTemplateColumns:"1fr 420px", gap:20, alignItems:"start", maxWidth:1280, margin:"0 auto" },
  editor:     { display:"flex", flexDirection:"column", gap:14 },
  fGrid:      { display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 14px" },
  lbl:        { display:"block", fontSize:12, fontWeight:600, color:"#374151", marginBottom:5 },
  inp:        { width:"100%", padding:"8px 11px", borderRadius:7, border:"1.5px solid #e2e8f0", fontSize:13, color:"#0f172a", marginBottom:12, boxSizing:"border-box", outline:"none" },
  infoLine:   { fontSize:12, color:"#64748b", marginTop:3 },
  searchWrap: { position:"relative", marginBottom:10 },
  drop:       { position:"absolute", top:"100%", left:0, right:0, zIndex:50, background:"#fff", borderRadius:10, border:"1.5px solid #e2e8f0", boxShadow:"0 8px 28px rgba(0,0,0,0.12)", maxHeight:280, overflowY:"auto" },
  dropItem:   { display:"flex", justifyContent:"space-between", alignItems:"center", padding:"9px 12px", cursor:"pointer", borderBottom:"1px solid #f1f5f9" },
  dropImg:    { width:34, height:34, borderRadius:6, objectFit:"cover", flexShrink:0 },
  dropImgPlaceholder: { width:34, height:34, background:"#f0f9ff", borderRadius:6, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 },
  dropName:   { fontSize:13, fontWeight:600, color:"#0f172a" },
  dropMeta:   { fontSize:11, color:"#94a3b8", marginTop:1 },
  dropPrice:  { fontSize:13, fontWeight:700, color:"#0369a1" },
  addTag:     { background:"#0369a1", color:"#fff", fontSize:11, fontWeight:700, padding:"2px 8px", borderRadius:5 },
  dropEmpty:  { padding:14, textAlign:"center", color:"#94a3b8", fontSize:13 },
  dropClose:  { padding:"7px 12px", textAlign:"center", fontSize:12, color:"#94a3b8", borderTop:"1px solid #f1f5f9", cursor:"pointer" },
  tableWrap:  { overflowX:"auto", borderRadius:8, border:"1px solid #e2e8f0", marginTop:10, marginBottom:4 },
  table:      { width:"100%", borderCollapse:"collapse" },
  thead:      { background:"#f8fafc" },
  th:         { padding:"8px 8px", fontSize:10, fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:0.6, borderBottom:"1px solid #e2e8f0", textAlign:"center" },
  td:         { padding:"7px 8px", fontSize:12, borderBottom:"1px solid #f1f5f9", textAlign:"center" },
  trEven:     { background:"#f8fafc" },
  trOdd:      { background:"#fff" },
  cellInp:    { border:"1px solid transparent", borderRadius:4, padding:"3px 4px", fontSize:12, width:"100%", background:"transparent", outline:"none", color:"#0f172a" },
  stepper:    { display:"flex", alignItems:"center", gap:3, justifyContent:"center" },
  stepBtn:    { width:22, height:22, borderRadius:4, border:"1px solid #bae6fd", background:"#e0f2fe", cursor:"pointer", fontSize:13, fontWeight:700, color:"#0369a1" },
  remBtn:     { background:"#fee2e2", color:"#dc2626", border:"none", borderRadius:4, width:22, height:22, cursor:"pointer", fontSize:11, fontWeight:700 },
  emptyItems: { textAlign:"center", padding:"18px 0", color:"#94a3b8", fontSize:13, border:"2px dashed #bae6fd", borderRadius:8, marginTop:8 },
  btn:        { padding:"9px 16px", borderRadius:8, border:"none", fontSize:13, fontWeight:700, cursor:"pointer" },
  btnPrimary: { background:"#0ea5e9", color:"#fff" },
  btnGhost:   { background:"#f1f5f9", color:"#475569" },
  btnSave:    { background:"#10b981", color:"#fff" },
  btnPrint:   { background:"#0369a1", color:"#fff" },
  previewCol: { position:"sticky", top:20 },
  previewLabel: { fontSize:10, fontWeight:700, letterSpacing:1.5, color:"#94a3b8", textTransform:"uppercase", marginBottom:6 },
  doc:        { background:"#fff", borderRadius:10, padding:"16px", boxShadow:"0 2px 12px rgba(0,0,0,0.08)", fontSize:11, maxHeight:"calc(100vh - 180px)", overflowY:"auto" },
};