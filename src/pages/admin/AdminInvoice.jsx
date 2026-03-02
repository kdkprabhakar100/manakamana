import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useProducts } from "../../hooks/useProducts";
import { useInvoices } from "../../hooks/useInvoices";

const TAX_RATE = 0.18;

function fmt(n) {
  return "₹" + Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2 });
}

let _counter = 1001;
function newInvoiceNo() {
  return `EST-${new Date().getFullYear()}-${_counter++}`;
}

export default function AdminInvoice() {
  const { id }        = useParams();              // if editing existing
  const navigate      = useNavigate();
  const printRef      = useRef();

  const { products, updateProduct }             = useProducts();   // ← Live from Firebase
  const { invoices, saveInvoice, updateInvoice } = useInvoices();

  /* ── Load existing invoice when editing ── */
  useEffect(() => {
    if (id && id !== "new") {
      const existing = invoices.find(i => i.id === id);
      if (existing) {
        setInvoiceNo(existing.invoiceNo || newInvoiceNo());
        setInvoiceDate(existing.invoiceDate || today());
        setDueDate(existing.dueDate || "");
        setDocType(existing.docType || "Estimate");
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

  const today = () => new Date().toISOString().slice(0, 10);

  const DEFAULT_COMPANY = {
    name: "Manakamana Heavy Equipments Pvt. Ltd.",
    address: "Kathmandu, Bagmati Province",
    city: "Kathmandu, Nepal",
    phone: "+977-01-XXXXXXX",
    email: "info@manakamana.com.np",
    gstin: "XXXXXXXXXXXXXXXXX",
    billNo: "",
  };
  const EMPTY_CLIENT = { name:"", company:"", address:"", phone:"", email:"", gstin:"" };
  const DEFAULT_NOTES = "Thank you for your business!\nAll prices are in NPR unless stated otherwise.";
  const DEFAULT_TERMS = "Payment due within 30 days.\nGoods once sold will not be taken back.";

  const [invoiceNo,   setInvoiceNo]   = useState(newInvoiceNo);
  const [invoiceDate, setInvoiceDate] = useState(today());
  const [dueDate,     setDueDate]     = useState("");
  const [docType,     setDocType]     = useState("Estimate");
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

  /* ── Filtered products (live from Firebase) ── */
  const filtered = search.trim()
    ? products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.category||"").toLowerCase().includes(search.toLowerCase())
      )
    : products;

  /* ── Add product to line items ── */
  function addProduct(product) {
    const stock = product.quantity !== undefined ? Number(product.quantity) : 0;
    if (stock <= 0) {
      alert(`❌ "${product.name}" is out of stock (0 units). Cannot add to invoice.`);
      return;
    }
    const exists = items.find(i => i.productId === product.id);
    if (exists) {
      if (exists.qty >= stock) {
        alert(`⚠️ Only ${stock} unit(s) of "${product.name}" available in stock.`);
        return;
      }
      setItems(prev => prev.map(i =>
        i.productId === product.id ? { ...i, qty: i.qty + 1 } : i
      ));
    } else {
      setItems(prev => [...prev, {
        id: Date.now() + Math.random(),
        productId: product.id,
        name: product.name,
        unit: product.unit || "Nos",
        qty: 1,
        rate: Number(product.price) || 0,
      }]);
    }
    setSearch("");
  }

  const removeItem = (id) => setItems(p => p.filter(i => i.id !== id));

  const updateItem = (id, field, value) =>
    setItems(prev => prev.map(i => {
      if (i.id !== id) return i;
      if (field === "qty" && i.productId) {
        const prod = products.find(p => p.id === i.productId);
        const stock = prod?.quantity !== undefined ? Number(prod.quantity) : Infinity;
        const newQty = Math.min(Math.max(1, Number(value) || 0), stock);
        return { ...i, qty: newQty };
      }
      return { ...i, [field]: field==="name"||field==="unit" ? value : Number(value)||0 };
    }));

  const changeQty = (id, delta) =>
    setItems(prev => prev.map(i => {
      if (i.id !== id) return i;
      const prod = i.productId ? products.find(p => p.id === i.productId) : null;
      const stock = prod?.quantity !== undefined ? Number(prod.quantity) : Infinity;
      const newQty = Math.min(Math.max(1, i.qty + delta), stock);
      if (newQty === i.qty && delta > 0) return i; // already at max
      return { ...i, qty: newQty };
    }
    ));

  /* ── Calculations ── */
  const subtotal = items.reduce((s,i) => s + i.qty*i.rate, 0);
  const discount = subtotal * (discountPct/100);
  const taxable  = subtotal - discount;
  const tax      = taxEnabled ? taxable * TAX_RATE : 0;
  const total    = taxable + tax;

  /* ── Save to Firebase ── */
  const handleSave = async () => {
    /* ── Validate required fields ── */
    const missing = [];
    if (!client.name.trim())    missing.push("Client Name");
    if (!client.company.trim()) missing.push("Company");
    if (!client.address.trim()) missing.push("Address");
    if (!invoiceDate)           missing.push("Date");
    if (!docType)               missing.push("Type");
    if (items.length === 0)     missing.push("At least one product/service");
    if (missing.length > 0) {
      alert(`Please fill all required fields before saving:\n\n• ${missing.join('\n• ')}`);
      return;
    }

    /* ── Validate stock before saving ── */
    const stockErrors = [];
    for (const item of items) {
      if (!item.productId) continue;
      const prod = products.find(p => p.id === item.productId);
      if (!prod) continue;
      const stock = prod.quantity !== undefined ? Number(prod.quantity) : 0;
      if (stock <= 0) {
        stockErrors.push(`❌ ${prod.name} — out of stock (0 units)`);
      } else if (item.qty > stock) {
        stockErrors.push(`⚠️ ${prod.name} — only ${stock} in stock, but ${item.qty} requested`);
      }
    }
    if (stockErrors.length > 0) {
      alert(`Cannot save invoice — stock issues:\n\n${stockErrors.join('\n')}\n\nPlease adjust quantities or restock.`);
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
      if (id && id !== "new") {
        await updateInvoice(id, data);
      } else {
        await saveInvoice(data);
      }

      /* ── Deduct stock quantity for each line item ── */
      const lowStockAlerts = [];
      for (const item of items) {
        if (!item.productId) continue;
        const prod = products.find(p => p.id === item.productId);
        if (!prod) continue;
        const currentQty = prod.quantity !== undefined ? Number(prod.quantity) : 0;
        const newQty = Math.max(0, currentQty - item.qty);
        try {
          await updateProduct(prod.id, { quantity: newQty });
          if (newQty < 5) {
            lowStockAlerts.push(`${prod.name} (${newQty} left)`);
          }
        } catch (err) {
          console.error(`Failed to deduct stock for ${prod.name}:`, err);
        }
      }

      if (lowStockAlerts.length > 0) {
        alert(`⚠️ Low Stock Alert!\n\nThe following products now have less than 5 units:\n• ${lowStockAlerts.join('\n• ')}\n\nPlease restock soon.`);
      }

      navigate("/admin/invoices");
    } finally {
      setSaving(false);
    }
  };

  /* ── Print ── */
  const handlePrint = () => {
    const html = printRef.current.innerHTML;
    const w = window.open("","_blank");
    w.document.write(`<html><head>
      <title>${docType} ${invoiceNo}</title>
      <style>
        *{box-sizing:border-box;margin:0;padding:0}
        body{font-family:'Inter','Segoe UI',sans-serif;color:#1e293b;background:#fff}
        .wrap{padding:40px 50px;max-width:900px;margin:0 auto}
        table{width:100%;border-collapse:collapse}
        th,td{padding:9px 11px;text-align:left;font-size:12px}
        @media print{body{margin:0}.wrap{padding:20px 30px}}
      </style>
    </head><body><div class="wrap">${html}</div></body></html>`);
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); w.close(); }, 500);
  };

  /* ══ RENDER ══ */
  return (
    <div style={s.page}>

      {/* Top bar */}
      <div className="invoice-top-bar" style={s.topBar}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <button style={s.backBtn} onClick={() => navigate("/admin/invoices")}>← Back</button>
          <div>
            <h1 style={s.pageTitle}>{id&&id!=="new"?"Edit":"New"} {docType}</h1>
            <p style={s.pageSub}>#{invoiceNo}</p>
          </div>
        </div>
        <div className="invoice-top-actions" style={s.topActions}>
          <select style={s.docSel} value={docType} onChange={e=>setDocType(e.target.value)}>
            {["Estimate","Invoice","Proforma Invoice","Quotation"].map(o=><option key={o}>{o}</option>)}
          </select>
          <button style={{...s.btn,...s.btnGhost}} onClick={handlePrint}>🖨 Print</button>
          <button style={{...s.btn,...s.btnSave}} onClick={handleSave} disabled={saving}>
            {saving?"Saving…":"💾 Save"}
          </button>
          <button style={{...s.btn,...s.btnPrimary}} onClick={handlePrint}>⬇ PDF</button>
        </div>
      </div>

      <div className="invoice-layout" style={s.layout}>

        {/* ═══ LEFT EDITOR ═══ */}
        <div style={s.editor}>

          {/* Company */}
          <Card title="Your Company">
            {editCompany ? (
              <div className="invoice-fgrid" style={s.fGrid}>
                {Object.entries(company).map(([k,v])=>(
                  <div key={k} style={k==="address"?{gridColumn:"1/-1"}:{}}>
                    <label style={s.lbl}>{k==="billNo"?"Bill No":k==="gstin"?"VAT/PAN":k.charAt(0).toUpperCase()+k.slice(1)}</label>
                    <input style={s.inp} value={v}
                      onChange={e=>setCompany(p=>({...p,[k]:e.target.value}))} />
                  </div>
                ))}
                <button style={{...s.btn,...s.btnPrimary,gridColumn:"1/-1"}}
                  onClick={()=>setEditCompany(false)}>Save</button>
              </div>
            ):(
              <div>
                <strong style={{fontSize:15,fontWeight:700,color:"#0f172a"}}>{company.name}</strong>
                <div style={s.infoLine}>{company.address}, {company.city}</div>
                <div style={s.infoLine}>📞 {company.phone} · ✉ {company.email}</div>
                <div style={s.infoLine}>VAT/PAN: {company.gstin}</div>
                {company.billNo && <div style={s.infoLine}>Bill No: {company.billNo}</div>}
                <button style={{...s.btn,...s.btnGhost,marginTop:8}}
                  onClick={()=>setEditCompany(true)}>✏️ Edit</button>
              </div>
            )}
          </Card>

          {/* Client */}
          <Card title="Bill To (Client)">
            <div className="invoice-fgrid" style={s.fGrid}>
              {[["name","Client Name",true],["company","Company",true],["phone","Phone"],["email","Email"],["address","Address",true],["gstin","VAT/PAN"]].map(([k,lbl,req])=>(
                <div key={k} style={k==="address"?{gridColumn:"1/-1"}:{}}>
                  <label style={s.lbl}>{lbl}{req && <span style={s.req}> *</span>}</label>
                  <input style={s.inp} value={client[k]} placeholder={lbl}
                    onChange={e=>setClient(p=>({...p,[k]:e.target.value}))} />
                </div>
              ))}
            </div>
          </Card>

          {/* Doc details */}
          <Card title="Document Details">
            <div className="invoice-fgrid" style={s.fGrid}>
              <div>
                <label style={s.lbl}>Document No.</label>
                <input style={{...s.inp,background:"#f8fafc",color:"#94a3b8"}} value={invoiceNo} readOnly />
              </div>
              <div>
                <label style={s.lbl}>Date<span style={s.req}> *</span></label>
                <input type="date" style={s.inp} value={invoiceDate} onChange={e=>setInvoiceDate(e.target.value)} />
              </div>
              <div>
                <label style={s.lbl}>Valid / Due Until</label>
                <input type="date" style={s.inp} value={dueDate} onChange={e=>setDueDate(e.target.value)} />
              </div>
              <div>
                <label style={s.lbl}>Type<span style={s.req}> *</span></label>
                <select style={s.inp} value={docType} onChange={e=>setDocType(e.target.value)}>
                  {["Estimate","Invoice","Proforma Invoice","Quotation"].map(o=><option key={o}>{o}</option>)}
                </select>
              </div>
            </div>
          </Card>

          {/* Products */}
          <Card title="Products / Services">

            {/* Search — fetches from Firebase */}
            <div style={s.searchWrap}>
              <div style={s.searchRow}>
                <input
                  style={{...s.inp,marginBottom:0,flex:1}}
                  placeholder={products.length===0 ? "⏳ Loading products from database…" : `🔍 Search ${products.length} products from catalogue…`}
                  value={search}
                  onChange={e=>{setSearch(e.target.value);setShowDrop(true);}}
                  onFocus={()=>setShowDrop(true)}
                  onBlur={()=>setShowDrop(false)}
                  disabled={products.length===0}
                />
              </div>

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
                            <div style={s.dropMeta}>{p.category||""} {p.unit?"· per "+p.unit:""}</div>
                          </div>
                        </div>
                        <div style={{display:"flex",alignItems:"center",gap:8}}>
                          <span style={s.dropPrice}>{p.price?fmt(Number(p.price)):"On request"}</span>
                          <span style={s.addTag}>+ Add</span>
                        </div>
                      </div>
                    ))
                  }
                  <div style={s.dropClose} onClick={()=>setShowDrop(false)}>✕ Close</div>
                </div>
              )}
            </div>

            {/* Line items */}
            {items.length > 0 && (
              <div style={s.tableWrap}>
                <table style={s.table}>
                  <thead><tr style={s.thead}>
                    <th style={{...s.th,width:"35%"}}>Product</th>
                    <th style={{...s.th,width:"10%"}}>Unit</th>
                    <th style={{...s.th,width:"18%"}}>Qty</th>
                    <th style={{...s.th,width:"18%"}}>Rate (₹)</th>
                    <th style={{...s.th,width:"14%",textAlign:"right"}}>Amount</th>
                    <th style={{...s.th,width:"5%"}}></th>
                  </tr></thead>
                  <tbody>
                    {items.map((item,idx)=>(
                      <tr key={item.id} style={idx%2===0?s.trEven:s.trOdd}>
                        <td style={s.td}>
                          <input style={s.cellInp} value={item.name}
                            onChange={e=>updateItem(item.id,"name",e.target.value)} />
                        </td>
                        <td style={s.td}>
                          <input style={{...s.cellInp,width:48}} value={item.unit}
                            onChange={e=>updateItem(item.id,"unit",e.target.value)} />
                        </td>
                        <td style={s.td}>
                          <div style={s.stepper}>
                            <button style={s.stepBtn} onClick={()=>changeQty(item.id,-1)}>−</button>
                            <input type="number" min="1"
                              style={{...s.cellInp,width:38,textAlign:"center",fontWeight:700}}
                              value={item.qty} onChange={e=>updateItem(item.id,"qty",e.target.value)} />
                            <button style={s.stepBtn} onClick={()=>changeQty(item.id,+1)}>+</button>
                          </div>
                        </td>
                        <td style={s.td}>
                          <input type="number" min="0" style={{...s.cellInp,width:90}}
                            value={item.rate} onChange={e=>updateItem(item.id,"rate",e.target.value)} />
                        </td>
                        <td style={{...s.td,textAlign:"right",fontWeight:700,color:"#0f172a"}}>
                          {fmt(item.qty*item.rate)}
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
              <div style={s.emptyItems}>
                Search above to add products from your Firebase catalogue
              </div>
            )}

            <button style={{...s.btn,...s.btnGhost,marginTop:10}}
              onClick={()=>setItems(p=>[...p,{id:Date.now()+Math.random(),productId:null,name:"Custom Item",unit:"Nos",qty:1,rate:0}])}>
              + Add Custom Line
            </button>
          </Card>

          {/* Tax & discount */}
          <Card title="Pricing & Tax">
            <div className="invoice-fgrid" style={s.fGrid}>
              <div>
                <label style={s.lbl}>Discount (%)</label>
                <input type="number" min="0" max="100" style={s.inp} value={discountPct}
                  onChange={e=>setDiscountPct(Number(e.target.value))} />
              </div>
              <div style={{display:"flex",alignItems:"center",gap:10,paddingTop:20}}>
                <input type="checkbox" id="gst" checked={taxEnabled}
                  onChange={e=>setTaxEnabled(e.target.checked)} style={{width:18,height:18,cursor:"pointer"}} />
                <label htmlFor="gst" style={{...s.lbl,marginBottom:0,cursor:"pointer"}}>Apply 13% VAT</label>
              </div>
            </div>
          </Card>

          {/* Notes */}
          <Card title="Notes & Terms">
            <label style={s.lbl}>Notes</label>
            <textarea style={{...s.inp,height:72,resize:"vertical"}} value={notes}
              onChange={e=>setNotes(e.target.value)} />
            <label style={{...s.lbl,marginTop:8}}>Terms & Conditions</label>
            <textarea style={{...s.inp,height:72,resize:"vertical"}} value={terms}
              onChange={e=>setTerms(e.target.value)} />
          </Card>
        </div>

        {/* ═══ RIGHT PREVIEW ═══ */}
        <div className="invoice-preview" style={s.previewCol}>
          <div style={s.previewLabel}>LIVE PREVIEW</div>

          <div ref={printRef} className="invoice-doc" style={s.doc}>
            {/* Header */}
            <div className="invoice-doc-header" style={s.docHeader}>
              <div>
                <div style={s.docCompany}>{company.name}</div>
                <div style={s.docSmall}>{company.address}, {company.city}</div>
                <div style={s.docSmall}>📞 {company.phone} · ✉ {company.email}</div>
                {company.gstin&&<div style={s.docSmall}>VAT/PAN: {company.gstin}</div>}
                {company.billNo&&<div style={s.docSmall}>Bill No: {company.billNo}</div>}
              </div>
              <div className="invoice-doc-type" style={{textAlign:"right"}}>
                <div style={s.docType}>{docType.toUpperCase()}</div>
                <div style={s.docSmall}><b>No:</b> {invoiceNo}</div>
                <div style={s.docSmall}><b>Date:</b> {invoiceDate}</div>
                {dueDate&&<div style={s.docSmall}><b>Valid Until:</b> {dueDate}</div>}
              </div>
            </div>

            <div style={s.docRule} />

            <div style={s.docBillBox}>
              <div style={s.docSectionTitle}>BILL TO</div>
              <div style={s.docClientName}>{client.name||"—"}</div>
              {client.company&&<div style={s.docSmall}>{client.company}</div>}
              {client.address&&<div style={s.docSmall}>{client.address}</div>}
              {client.phone&&<div style={s.docSmall}>📞 {client.phone}</div>}
              {client.email&&<div style={s.docSmall}>✉ {client.email}</div>}
              {client.gstin&&<div style={s.docSmall}>VAT/PAN: {client.gstin}</div>}
            </div>

            <table style={s.docTable}>
              <thead>
                <tr>
                  <th style={{...s.docTh,width:"5%"}}>#</th>
                  <th style={{...s.docTh,width:"42%"}}>Description</th>
                  <th style={{...s.docTh,width:"8%"}}>Unit</th>
                  <th style={{...s.docTh,width:"10%",textAlign:"center"}}>Qty</th>
                  <th style={{...s.docTh,width:"17%",textAlign:"right"}}>Rate</th>
                  <th style={{...s.docTh,width:"18%",textAlign:"right"}}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {items.length===0
                  ? <tr><td colSpan={6} style={{...s.docTd,textAlign:"center",color:"#94a3b8",padding:"20px 0"}}>No items yet</td></tr>
                  : items.map((item,idx)=>(
                    <tr key={item.id} style={{background:idx%2===0?"#f8fafc":"#fff"}}>
                      <td style={{...s.docTd,color:"#94a3b8"}}>{idx+1}</td>
                      <td style={s.docTd}><b>{item.name}</b></td>
                      <td style={{...s.docTd,color:"#64748b"}}>{item.unit}</td>
                      <td style={{...s.docTd,textAlign:"center"}}>{item.qty}</td>
                      <td style={{...s.docTd,textAlign:"right"}}>{fmt(item.rate)}</td>
                      <td style={{...s.docTd,textAlign:"right",fontWeight:700}}>{fmt(item.qty*item.rate)}</td>
                    </tr>
                  ))
                }
              </tbody>
            </table>

            {/* Totals */}
            <div style={s.docTotals}>
              <TRow l="Subtotal"             v={fmt(subtotal)} />
              {discountPct>0&&<TRow l={`Discount (${discountPct}%)`} v={`− ${fmt(discount)}`} color="#ef4444" />}
              {taxEnabled&&<TRow l="VAT (13%)" v={fmt(tax)} />}
              <div style={s.docTotalRule} />
              <TRow l="TOTAL" v={fmt(total)} bold accent />
            </div>

            {notes&&(
              <div style={s.docNotes}>
                <div style={s.docSectionTitle}>NOTES</div>
                <p style={{fontSize:11,color:"#475569",lineHeight:1.6,whiteSpace:"pre-line",margin:0}}>{notes}</p>
              </div>
            )}
            {terms&&(
              <div style={s.docNotes}>
                <div style={s.docSectionTitle}>TERMS & CONDITIONS</div>
                <p style={{fontSize:11,color:"#64748b",lineHeight:1.6,whiteSpace:"pre-line",margin:0}}>{terms}</p>
              </div>
            )}
            <div style={s.docFooter}>Computer-generated {docType.toLowerCase()} — no signature required.</div>
          </div>

          <div style={{display:"flex",gap:10,marginTop:14}}>
            <button style={{...s.btn,...s.btnGhost,flex:1}} onClick={handlePrint}>🖨 Print</button>
            <button style={{...s.btn,...s.btnPrimary,flex:1}} onClick={handlePrint}>⬇ PDF</button>
          </div>
          <button style={{...s.btn,...s.btnSave,width:"100%",marginTop:10}} onClick={handleSave} disabled={saving}>
            {saving?"Saving…":"💾 Save to Firebase"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div style={{ background:"#fff", borderRadius:14, padding:"20px 22px", boxShadow:"0 1px 4px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)" }}>
      <h3 style={{ fontSize:11, fontWeight:700, letterSpacing:1.2, color:"#ea580c", textTransform:"uppercase", margin:"0 0 14px" }}>{title}</h3>
      {children}
    </div>
  );
}

function TRow({ l, v, bold, accent, color }) {
  return (
    <div style={{ display:"flex", justifyContent:"space-between", width:230, fontSize: bold?15:13, fontWeight: bold?800:400, padding:"3px 0" }}>
      <span style={{ color: accent?"#ea580c":"#64748b" }}>{l}</span>
      <span style={{ color: color||(accent?"#ea580c":"#0f172a") }}>{v}</span>
    </div>
  );
}

const s = {
  page: { fontFamily:"'Inter','Segoe UI',system-ui,sans-serif", background:"#f1f5f9", minHeight:"100vh", padding:"28px 20px" },
  topBar: { display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24, flexWrap:"wrap", gap:12 },
  backBtn: { background:"#fff7ed", border:"1.5px solid #fed7aa", borderRadius:8, padding:"8px 14px", fontSize:13, fontWeight:600, cursor:"pointer", color:"#ea580c" },
  pageTitle: { fontSize:24, fontWeight:800, color:"#0f172a", margin:0 },
  pageSub: { fontSize:12, color:"#64748b", margin:"2px 0 0" },
  topActions: { display:"flex", gap:10, flexWrap:"wrap", alignItems:"center" },
  docSel: { padding:"9px 12px", borderRadius:8, border:"1.5px solid #e2e8f0", fontSize:13, fontWeight:600, background:"#fff", color:"#0f172a", cursor:"pointer" },
  layout: { display:"grid", gridTemplateColumns:"1fr 460px", gap:24, alignItems:"start", maxWidth:1300, margin:"0 auto" },
  editor: { display:"flex", flexDirection:"column", gap:16 },
  fGrid: { display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 16px" },
  lbl: { display:"block", fontSize:12, fontWeight:600, color:"#374151", marginBottom:5 },
  req: { color:"#ef4444", fontWeight:700 },
  inp: { width:"100%", padding:"9px 12px", borderRadius:8, border:"1.5px solid #e2e8f0", fontSize:13, color:"#0f172a", marginBottom:12, boxSizing:"border-box", outline:"none" },
  infoLine: { fontSize:12, color:"#64748b", marginTop:2 },
  /* Search */
  searchWrap: { position:"relative", marginBottom:12 },
  searchRow: { display:"flex", gap:10 },
  drop: { position:"absolute", top:"100%", left:0, right:0, zIndex:50, background:"#fff", borderRadius:10, border:"1.5px solid #e2e8f0", boxShadow:"0 8px 28px rgba(0,0,0,0.12)", maxHeight:300, overflowY:"auto" },
  dropItem: { display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 14px", cursor:"pointer", borderBottom:"1px solid #f1f5f9" },
  dropImg: { width:36, height:36, borderRadius:6, objectFit:"cover", flexShrink:0 },
  dropImgPlaceholder: { width:36, height:36, background:"#fff7ed", borderRadius:6, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 },
  dropName: { fontSize:13, fontWeight:600, color:"#0f172a" },
  dropMeta: { fontSize:11, color:"#94a3b8", marginTop:1 },
  dropPrice: { fontSize:13, fontWeight:700, color:"#ea580c" },
  addTag: { background:"#ea580c", color:"#fff", fontSize:11, fontWeight:700, padding:"2px 8px", borderRadius:5 },
  dropEmpty: { padding:16, textAlign:"center", color:"#94a3b8", fontSize:13 },
  dropClose: { padding:"8px 14px", textAlign:"center", fontSize:12, color:"#94a3b8", borderTop:"1px solid #f1f5f9", cursor:"pointer", background:"#fafafa" },
  /* Table */
  tableWrap: { overflowX:"auto", borderRadius:10, border:"1px solid #e2e8f0", marginBottom:6 },
  table: { width:"100%", borderCollapse:"collapse" },
  thead: { background:"#fafaf9" },
  th: { padding:"9px 10px", fontSize:10, fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:0.8, borderBottom:"1px solid #e2e8f0" },
  td: { padding:"8px 10px", fontSize:12, borderBottom:"1px solid #f8fafc" },
  trEven: { background:"#f8fafc" },
  trOdd:  { background:"#fff" },
  cellInp: { border:"1px solid transparent", borderRadius:5, padding:"3px 5px", fontSize:12, width:"100%", background:"transparent", outline:"none", color:"#0f172a" },
  stepper: { display:"flex", alignItems:"center", gap:4 },
  stepBtn: { width:24, height:24, borderRadius:5, border:"1.5px solid #fed7aa", background:"#fff7ed", cursor:"pointer", fontSize:14, fontWeight:700, color:"#ea580c", display:"flex", alignItems:"center", justifyContent:"center" },
  remBtn: { background:"#fee2e2", color:"#dc2626", border:"none", borderRadius:5, width:24, height:24, cursor:"pointer", fontSize:11, fontWeight:700 },
  emptyItems: { textAlign:"center", padding:"20px 0", color:"#94a3b8", fontSize:13, border:"2px dashed #fed7aa", borderRadius:8, marginTop:6 },
  /* Buttons */
  btn: { padding:"9px 16px", borderRadius:8, border:"none", fontSize:13, fontWeight:700, cursor:"pointer" },
  btnPrimary: { background:"linear-gradient(135deg,#ea580c,#f97316)", color:"#fff", boxShadow:"0 2px 8px rgba(234,88,12,0.2)" },
  btnGhost: { background:"#f1f5f9", color:"#475569" },
  btnSave: { background:"#10b981", color:"#fff" },
  /* Preview */
  previewCol: { position:"sticky", top:24 },
  previewLabel: { fontSize:10, fontWeight:700, letterSpacing:1.5, color:"#94a3b8", textTransform:"uppercase", marginBottom:8 },
  doc: { background:"#fff", borderRadius:14, padding:"28px 24px", boxShadow:"0 4px 20px rgba(0,0,0,0.09)", fontSize:12, color:"#1e293b", maxHeight:"calc(100vh - 200px)", overflowY:"auto" },
  docHeader: { display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:18 },
  docCompany: { fontSize:18, fontWeight:800, color:"#0f172a", marginBottom:3 },
  docSmall: { fontSize:10, color:"#64748b", lineHeight:1.7 },
  docType: { fontSize:22, fontWeight:900, color:"#ea580c", letterSpacing:1 },
  docRule: { height:2, background:"linear-gradient(90deg,#ea580c,#f97316 60%,transparent)", marginBottom:14, borderRadius:2 },
  docBillBox: { background:"#fff7ed", borderRadius:8, padding:"12px 14px", borderLeft:"3px solid #ea580c", marginBottom:16 },
  docSectionTitle: { fontSize:9, fontWeight:800, letterSpacing:1.5, color:"#94a3b8", textTransform:"uppercase", marginBottom:4 },
  docClientName: { fontSize:13, fontWeight:700, color:"#0f172a", marginBottom:2 },
  docTable: { width:"100%", borderCollapse:"collapse", marginBottom:14 },
  docTh: { background:"#0f172a", color:"#fff", padding:"8px 9px", fontSize:9, fontWeight:700, letterSpacing:0.8, textTransform:"uppercase" },
  docTd: { padding:"8px 9px", fontSize:11, borderBottom:"1px solid #f1f5f9" },
  docTotals: { display:"flex", flexDirection:"column", gap:3, alignItems:"flex-end", marginBottom:16 },
  docTotalRule: { width:230, height:1, background:"#e2e8f0", margin:"4px 0" },
  docNotes: { marginBottom:12, padding:"10px 12px", background:"#fafaf9", borderRadius:7 },
  docFooter: { textAlign:"center", fontSize:9, color:"#94a3b8", marginTop:16, paddingTop:10, borderTop:"1px solid #f1f5f9" },
};
