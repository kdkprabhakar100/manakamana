import { useState, useRef } from "react";
import { useProducts } from "../../hooks/useProducts";
import { useCategories } from "../../hooks/useCategories";
import { useRacks } from "../../hooks/useRacks";
import { RackSelector } from "./RackSelector";

/* ── Load SheetJS from CDN (only once) ── */
function loadSheetJS() {
  return new Promise((resolve, reject) => {
    if (window.XLSX) { resolve(window.XLSX); return; }
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
    s.onload  = () => resolve(window.XLSX);
    s.onerror = () => reject(new Error("Failed to load SheetJS"));
    document.head.appendChild(s);
  });
}

/* ── Normalise a header string for matching ── */
const norm = (s) => String(s || "").toLowerCase().replace(/[\s_\-./()]/g, "");
const normalize = (v) => String(v || "").toLowerCase().trim();

/* ── Map a raw row object → product fields ── */
function rowToProduct(row) {
  const keys = Object.keys(row);
  const find = (...terms) => {
    const k = keys.find(k => terms.some(t => norm(k).includes(t)));
    return k ? String(row[k] ?? "").trim() : "";
  };
  const findNum = (...terms) => {
    const v = find(...terms);
    const n = parseFloat(v);
    return isNaN(n) ? "" : String(Math.abs(n));
  };

  return {
    name:        find("partname","partsname","name","description","item","product"),
    
    hsCode:      find("hscode","code","hs"),
    quantity:    (() => {
      // prefer closing stock, then qty
      const closing = find("closingstock","closing","balance","currentstock");
      if (closing) { const n = parseInt(closing); return isNaN(n) ? 0 : Math.max(0,n); }
      const qty = find("qty","quantity","stock","openingstock");
      const n = parseInt(qty); return isNaN(n) ? 0 : Math.max(0,n);
    })(),
    unit:        find("unit","uom","uos") || "NOS",
    rack:        find("rack","location"),
    section:     find("bin","shelf", "section"),
    productCode: find("partno","partsno","partsnumber","partnumber", "modelnumber", "machine model", "machinmodels"),
    description: find("remarks","note","desc", "description"),
    price:       findNum("rate","price","sellingprice","sp","mrp","unitprice"),
    costPrice:   findNum("costprice","cp","cost","purchaseprice","pp"),
    category:    find("category","cat","group","type"),
    image:       "",
  };
}

const EMPTY = {
  name: "", price: "", costPrice: "", unit: "Nos",
  category: "", hsCode: "",productCode:"", description: "", image: "",
  quantity: "",
  rack: "", section: "",
};

export default function AdminProducts() {
  const { products, loading, addProduct, updateProduct, deleteProduct, useLocal } = useProducts();
  const { categories, addCategory, deleteCategory } = useCategories();
  const { racks, addRack, deleteRack, addSection, deleteSection } = useRacks();

  const [catDropOpen, setCatDropOpen] = useState(false);
  const [catSearch,   setCatSearch]   = useState("");
  const [addingCat,   setAddingCat]   = useState(false);
  const [newCatName,  setNewCatName]  = useState("");
  const catRef = useRef();

  const [showModal,       setShowModal]       = useState(false);
  const [editing,         setEditing]         = useState(null);
  const [form,            setForm]            = useState(EMPTY);
  const [imagePreview,    setImagePreview]    = useState("");
  const [search,          setSearch]          = useState("");
  const [delConfirm,      setDelConfirm]      = useState(null);
  const [saving,          setSaving]          = useState(false);
  const [uploadProgress,  setUploadProgress]  = useState("");
  const fileRef = useRef();

  // Excel import state
  const [showXL,       setShowXL]       = useState(false);
  const [xlRows,       setXlRows]       = useState([]);    // parsed preview rows
  const [xlSelected,   setXlSelected]   = useState([]);    // indices of selected rows
  const [xlImporting,  setXlImporting]  = useState(false);
  const [xlProgress,   setXlProgress]   = useState(0);
  const [xlDone,       setXlDone]       = useState(false);
  const [xlError,      setXlError]      = useState("");
  const [xlFileName,   setXlFileName]   = useState("");
  const xlFileRef = useRef();

  const filtered = products.filter(p => {
    const q = search.toLowerCase().trim();

    return [
      p.name,
      p.category,
      p.hsCode,
      p.productCode,
      p.rack,
      p.section,
      p.unit,
      p.description,
      p.price,
      p.costPrice,
      p.quantity,
    ]
      .map(v => String(v || "").toLowerCase())
      .some(v => v.includes(q));
  });

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY);
    setImagePreview("");
    setShowModal(true);
  };

  const openEdit = (p) => {
    setEditing(p);
    setForm({
      name:        p.name,
      price:       p.price || "",
      costPrice:   p.costPrice || "",
      unit:        p.unit || "Nos",
      category:    p.category || "",
      hsCode:      p.hsCode || "",
      productCode:  p.productCode || "",
      description: p.description || "",
      image:       p.image || "",
      quantity:    p.quantity !== undefined ? String(p.quantity) : "",
      rack:        p.rack || "",
      section:     p.section || "",
    });
    setImagePreview(p.image || "");
    setShowModal(true);
  };

  function compressImage(file) {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith("image/")) { reject(new Error("Please select an image file.")); return; }
      const img = new Image();
      const reader = new FileReader();
      reader.onerror = () => reject(new Error("Failed to read the image file."));
      reader.onload = (ev) => {
        img.onerror = () => reject(new Error("Failed to load image."));
        img.onload = () => {
          const MAX_DIM = 600;
          let { width, height } = img;
          if (width > MAX_DIM || height > MAX_DIM) {
            const scale = MAX_DIM / Math.max(width, height);
            width = Math.round(width * scale);
            height = Math.round(height * scale);
          }
          const canvas = document.createElement("canvas");
          canvas.width = width; canvas.height = height;
          canvas.getContext("2d").drawImage(img, 0, 0, width, height);
          const tryCompress = (quality) => {
            canvas.toBlob((blob) => {
              if (!blob) { reject(new Error("Compression failed.")); return; }
              if (blob.size > 200 * 1024 && quality > 0.15) tryCompress(quality - 0.1);
              else resolve(blob);
            }, "image/jpeg", quality);
          };
          tryCompress(0.5);
        };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload  = () => resolve(reader.result);
      reader.onerror = () => reject(new Error("Failed to convert image."));
      reader.readAsDataURL(blob);
    });
  }

  const handleImageFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setUploadProgress("Compressing image...");
      const blob = await compressImage(file);
      setImagePreview(URL.createObjectURL(blob));
      setForm(f => ({ ...f, _imageBlob: blob, _imageName: file.name, image: "" }));
      setUploadProgress("");
    } catch (err) {
      alert("Failed to process image: " + err.message);
      setUploadProgress("");
    }
  };

    const handleSave = async () => {
  // 🔥 VALIDATION
  if (!form.name.trim()) {
    alert("Product name is required.");
    return;
  }

  if (!form.productCode.trim()) {
    alert("Product model is required.");
    return;
  }

  setSaving(true);

  try {
    let imageUrl = form.image;

    if (form._imageBlob) {
      setUploadProgress("Preparing image...");
      imageUrl = await blobToBase64(form._imageBlob);
    }

    const productData = {
      name: form.name.trim(),
      price: form.price ? Math.abs(Number(form.price)).toString() : "",
      costPrice: form.costPrice ? Math.abs(Number(form.costPrice)).toString() : "",
      unit: form.unit,
      category: form.category,
      hsCode: form.hsCode.trim(),
      productCode: form.productCode.trim(), // ✅ FIXED
      description: form.description,
      image: imageUrl,
      quantity: form.quantity !== "" ? Number(form.quantity) : 0,
      rack: form.rack,
      section: form.section,
    };

    // 🔍 CHECK EXISTING PRODUCT (ONLY BY productCode)
    const existing = products.find(p =>
      normalize(p.productCode) === normalize(productData.productCode)
    );

    // 🔥 HS CODE VALIDATION
    const hsConflict = productData.hsCode.trim() && products.find(p =>
    normalize(p.hsCode) === normalize(productData.hsCode) &&
    normalize(p.productCode) !== normalize(productData.productCode)
    );

  if (hsConflict) {
    alert(`❌ HS Code ${productData.hsCode} already used by ${hsConflict.name}`);
    setSaving(false);
    return;
  }

    if (editing) {
      await updateProduct(editing.id, productData);

    } else if (existing) {
      // ✅ MERGE STOCK
      await updateProduct(existing.id, {
        ...existing,
        quantity: (existing.quantity || 0) + productData.quantity,
        price: productData.price || existing.price,
        costPrice: productData.costPrice || existing.costPrice,
      });

      alert("✅ Product exists → Stock updated");

    } else {
      // ✅ NEW PRODUCT
      await addProduct(productData);
    }

    setShowModal(false);

  } catch (err) {
    alert("Failed to save product: " + err.message);
  } finally {
    setSaving(false);
    setUploadProgress("");
  }
};

  const handleDelete = async (id) => {
    await deleteProduct(id);
    setDelConfirm(null);
  };

  /* ══════════════════════════════════════
     EXCEL IMPORT HANDLERS
  ══════════════════════════════════════ */
  const handleXLFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setXlError("");
    setXlRows([]);
    setXlSelected([]);
    setXlDone(false);
    setXlFileName(file.name);
    try {
      const XLSX = await loadSheetJS();
      const buf  = await file.arrayBuffer();
      const wb   = XLSX.read(buf, { type: "array" });
      // Use first sheet
      const ws   = wb.Sheets[wb.SheetNames[0]];
      const raw  = XLSX.utils.sheet_to_json(ws, { defval: "" });
      if (raw.length === 0) { setXlError("No data rows found in this sheet."); return; }
      const parsed = raw
        .map(rowToProduct)
        .filter(p => p.name.trim() !== "");
      if (parsed.length === 0) { setXlError("Could not find a 'Name' or 'Parts Name' column. Check your file has correct headers."); return; }
      setXlRows(parsed);
      setXlSelected(parsed.map((_, i) => i)); // select all by default
    } catch (err) {
      setXlError("Failed to read file: " + err.message);
    }
    // reset input so same file can be re-selected
    e.target.value = "";
  };

const handleXLImport = async () => {
  const toImport = xlSelected.map(i => xlRows[i]).filter(Boolean);
  if (toImport.length === 0) return;

  setXlImporting(true);
  setXlProgress(0);

  try {
    for (let i = 0; i < toImport.length; i++) {
      const newProduct = toImport[i];

      if (!newProduct.productCode) {
        console.warn("Skipping product without product code");
        continue;
      }

      const existing = products.find(p =>
        normalize(p.productCode) === normalize(newProduct.productCode)
      );

    const hsConflict = newProduct.hsCode?.trim() && products.find(p =>
     normalize(p.hsCode) === normalize(newProduct.hsCode) &&
     normalize(p.productCode) !== normalize(newProduct.productCode)
    );

      if (hsConflict) {
        setXlError(`❌ HS Code ${newProduct.hsCode} already used by ${hsConflict.name}`);
        setXlImporting(false);
        return;
      }

      if (existing) {
        // ✅ MERGE STOCK
        await updateProduct(existing.id, {
          ...existing,
          quantity: (existing.quantity || 0) + (newProduct.quantity || 0),
          price: newProduct.price || existing.price,
          costPrice: newProduct.costPrice || existing.costPrice,
        });

      } else {
        // ✅ NEW PRODUCT
        await addProduct(newProduct);
      }

      setXlProgress(i + 1);
    }

    setXlDone(true);

  } catch (err) {
    setXlError("Import failed: " + err.message);
  } finally {
    setXlImporting(false);
  }
};

  const toggleXlRow = (i) =>
    setXlSelected(prev =>
      prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]
    );

  const toggleAllXl = () =>
    setXlSelected(xlSelected.length === xlRows.length ? [] : xlRows.map((_,i)=>i));

  return (
    <div style={s.page}>
      <div style={s.inner}>

        {/* Header */}
        <div style={s.header}>
          <div>
            <p style={s.label}>ADMIN · CATALOGUE</p>
            <h1 style={s.title}>Product Management</h1>
          </div>
          <div style={s.headerRight}>
            <input style={s.search} placeholder="🔍 Search products…"
              value={search} onChange={e => setSearch(e.target.value)} />
            <button style={s.xlBtn} onClick={() => { setShowXL(true); setXlRows([]); setXlSelected([]); setXlDone(false); setXlError(""); setXlFileName(""); }}>
              📥 Import Excel
            </button>
            <button style={s.addBtn} onClick={openAdd}>+ Add Product</button>
          </div>
        </div>

        {/* Firebase/Local banner */}
        <div style={{ ...s.banner, ...(useLocal ? s.bannerLocal : s.bannerFire) }}>
          {useLocal
            ? "⚠️ Firebase not configured — products saved in browser localStorage."
            : `✅ Connected to Firebase — ${products.length} products in catalogue.`}
        </div>

        {loading ? (
          <div style={s.loading}>
            <div style={s.spinnerWrap}><div style={s.spinner} /></div>
            <p>Loading products…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={s.empty}>
            <div style={{ fontSize: 56 }}>📦</div>
            <p style={{ color: "#64748b", fontSize: 16, marginTop: 12 }}>
              {search ? `No products match "${search}"` : "No products yet."}
            </p>
            {!search && <button style={{ ...s.addBtn, marginTop: 16 }} onClick={openAdd}>+ Add Your First Product</button>}
          </div>
        ) : (
          <div style={s.grid}>
            {filtered.map(product => (
              <div key={product.id} style={s.card}>
                <div style={s.imageWrap}>
                  {product.image
                    ? <img src={product.image} alt={product.name} style={s.image} onError={e => { e.target.style.display = "none"; }} />
                    : <div style={s.imagePlaceholder}>⚙️</div>
                  }
                  {product.category && <span style={s.badge}>{product.category}</span>}
                  {product.quantity !== undefined && product.quantity < 5 && (
                    <span style={s.lowBadge}>⚠️ Low</span>
                  )}
                </div>
                <div style={s.cardBody}>
                  <h3 style={s.productName}>{product.name}</h3>
                  {product.description && <p style={s.productDesc}>{product.description}</p>}
                  {product.hsCode && <p style={{ fontSize: 11, color: "#94a3b8", margin: "0 0 4px" }}>HS: {product.hsCode}</p>}
                  {product.productCode && <p style={{ fontSize: 11, color: "#94a3b8", margin: "0 0 4px" }}>Product-code: {product.productCode}</p>}
                  {product.unit && <span style={s.unitTag}>📦 per {product.unit}</span>}
                  {(product.rack || product.section) && (
                    <div style={s.rackChip}>🗄 {[product.rack, product.section].filter(Boolean).join(" › ")}</div>
                  )}
                  <div style={{ display: "flex", gap: 8, alignItems: "baseline", margin: "6px 0" }}>
                    <p style={s.price}>Rs {product.price ? Number(product.price).toLocaleString("en-IN") : "—"}</p>
                    {product.quantity !== undefined && (
                      <span style={{ fontSize: 12, color: product.quantity < 5 ? "#ef4444" : "#64748b", fontWeight: 600 }}>
                        Stock: {product.quantity}
                      </span>
                    )}
                  </div>
                  {product.costPrice && (
                    <p style={{ fontSize: 12, color: "#64748b", margin: "0 0 6px", fontWeight: 600 }}>
                      CP: Rs {Number(product.costPrice).toLocaleString("en-IN")}
                    </p>
                  )}
                  <div style={s.cardActions}>
                    <button style={{ ...s.btn, ...s.btnSecondary, flex: 1 }} onClick={() => openEdit(product)}>✏️ Edit</button>
                    <button style={{ ...s.btn, ...s.btnDanger, flex: 1 }} onClick={() => setDelConfirm(product.id)}>🗑 Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ══ Excel Import Modal ══ */}
      {showXL && (
        <div style={s.overlay} onClick={() => !xlImporting && setShowXL(false)}>
          <div style={{ ...s.modal, maxWidth: 720 }} onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom: 18 }}>
              <h2 style={{ ...s.modalTitle, marginBottom: 0 }}>📥 Import from Excel</h2>
              {!xlImporting && <button style={{ background:"none", border:"none", fontSize:20, cursor:"pointer", color:"#94a3b8" }} onClick={() => setShowXL(false)}>✕</button>}
            </div>

            {/* Done state */}
            {xlDone ? (
              <div style={{ textAlign:"center", padding:"24px 0" }}>
                <div style={{ fontSize:52 }}>✅</div>
                <div style={{ fontSize:18, fontWeight:800, color:"#0f172a", margin:"10px 0 6px" }}>Import Complete!</div>
                <div style={{ color:"#64748b", marginBottom:20 }}>{xlSelected.length} products added to your catalogue.</div>
                <div style={{ display:"flex", gap:10, justifyContent:"center" }}>
                  <button style={{ ...s.btn, ...s.btnSecondary }} onClick={() => { setShowXL(false); }}>Close</button>
                  <button style={{ ...s.btn, ...s.btnPrimary }} onClick={() => { setXlRows([]); setXlSelected([]); setXlDone(false); setXlError(""); setXlFileName(""); }}>Import Another File</button>
                </div>
              </div>
            ) : (
              <>
                {/* Drop zone */}
                {xlRows.length === 0 && (
                  <div
                    style={{ border: "2px dashed #e2e8f0", borderRadius: 12, padding:"36px 24px", textAlign:"center", cursor:"pointer", marginBottom:16, background:"#f8fafc", transition:"border-color .2s" }}
                    onClick={() => xlFileRef.current.click()}
                    onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = PRIMARY; }}
                    onDragLeave={e => { e.currentTarget.style.borderColor = "#e2e8f0"; }}
                    onDrop={e => {
                      e.preventDefault();
                      e.currentTarget.style.borderColor = "#e2e8f0";
                      const f = e.dataTransfer.files[0];
                      if (f) { const dt = new DataTransfer(); dt.items.add(f); xlFileRef.current.files = dt.files; handleXLFile({ target: xlFileRef.current }); }
                    }}
                  >
                    <div style={{ fontSize:44, marginBottom:10 }}>📊</div>
                    <div style={{ fontWeight:700, fontSize:15, color:"#0f172a", marginBottom:6 }}>Drop your Excel file here</div>
                    <div style={{ fontSize:13, color:"#64748b", marginBottom:14 }}>or click to browse — supports <strong>.xlsx</strong> and <strong>.xls</strong></div>
                    <button style={{ ...s.btn, ...s.btnPrimary, display:"inline-block" }}>📁 Choose File</button>
                    <input ref={xlFileRef} type="file" accept=".xlsx,.xls,.csv" style={{ display:"none" }} onChange={handleXLFile} />
                  </div>
                )}

                {/* Column mapping hint */}
                {xlRows.length === 0 && !xlError && (
                  <div style={{ background:"#f0f9ff", border:"1px solid #bae6fd", borderRadius:10, padding:"12px 16px", fontSize:12, color:"#0369a1", marginBottom:0 }}>
                    <strong>Auto-detected columns:</strong> Parts Name/Name → <em>Product Name</em> &nbsp;·&nbsp; HS Code → <em>HS Code</em> &nbsp;·&nbsp; Rate/Price → <em>Price</em> &nbsp;·&nbsp; Closing Stock/Qty → <em>Quantity</em> &nbsp;·&nbsp; Unit, Rack, Machine Model also supported
                  </div>
                )}

                {/* Error */}
                {xlError && (
                  <div style={{ background:"#fef2f2", border:"1px solid #fca5a5", borderRadius:10, padding:"12px 16px", color:"#b91c1c", fontSize:13, marginBottom:12 }}>
                    ❌ {xlError}
                    <button style={{ marginLeft:12, background:"none", border:"none", color:"#0369a1", cursor:"pointer", fontSize:12, fontWeight:600 }} onClick={() => xlFileRef.current.click()}>Try another file</button>
                    <input ref={xlFileRef} type="file" accept=".xlsx,.xls,.csv" style={{ display:"none" }} onChange={handleXLFile} />
                  </div>
                )}

                {/* Preview table */}
                {xlRows.length > 0 && (
                  <>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                      <div style={{ fontSize:13, color:"#64748b" }}>
                        <strong style={{ color:"#0f172a" }}>{xlFileName}</strong> — {xlRows.length} products found
                      </div>
                      <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                        <button style={{ fontSize:12, color:"#0369a1", background:"none", border:"none", cursor:"pointer", fontWeight:600 }} onClick={toggleAllXl}>
                          {xlSelected.length === xlRows.length ? "Deselect All" : "Select All"}
                        </button>
                        <span style={{ fontSize:12, color:"#64748b" }}>{xlSelected.length} selected</span>
                        <button style={{ fontSize:12, color:"#64748b", background:"none", border:"none", cursor:"pointer" }} onClick={() => { setXlRows([]); setXlSelected([]); setXlError(""); setXlFileName(""); xlFileRef.current.click(); }}>
                          📁 Change File
                        </button>
                        <input ref={xlFileRef} type="file" accept=".xlsx,.xls,.csv" style={{ display:"none" }} onChange={handleXLFile} />
                      </div>
                    </div>

                    {/* Scrollable table */}
                    <div style={{ maxHeight: 320, overflowY:"auto", border:"1px solid #e2e8f0", borderRadius:10, marginBottom:14 }}>
                      <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
                        <thead style={{ position:"sticky", top:0, background:"#f8fafc", zIndex:1 }}>
                          <tr>
                            <th style={th}>
                              <input type="checkbox" checked={xlSelected.length === xlRows.length && xlRows.length > 0}
                                onChange={toggleAllXl} style={{ cursor:"pointer" }} />
                            </th>
                            {["#","HS", "Product code","Product Name","Qty","Unit","Price","Description"].map(h => (
                              <th key={h} style={th}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {xlRows.map((row, i) => {
                            const sel = xlSelected.includes(i);
                            return (
                              <tr key={i} style={{ background: sel ? "#f0f9ff" : "#fff", opacity: sel ? 1 : 0.45 }}
                                onClick={() => toggleXlRow(i)}>
                                <td style={td}>
                                  <input type="checkbox" checked={sel} onChange={() => toggleXlRow(i)} style={{ cursor:"pointer" }} onClick={e => e.stopPropagation()} />
                                </td>
                                <td style={{ ...td, color:"#94a3b8" }}>{i+1}</td>
                                <td style={{ ...td, fontFamily:"monospace", fontSize:10, color:"#0369a1", maxWidth:90, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{row.hsCode||"—"}</td>
                                <td style={{ ...td, fontFamily:"monospace", fontSize:10, color:"#0369a1", maxWidth:90, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{row.productCode||"—"}</td>                                <td style={{ ...td, fontWeight:600, color:"#0f172a", maxWidth:160, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{row.name}</td>
                                <td style={{ ...td, textAlign:"center", fontWeight:700, color: row.quantity > 0 ? "#16a34a" : "#94a3b8" }}>{row.quantity}</td>
                                <td style={{ ...td, textAlign:"center", color:"#64748b" }}>{row.unit}</td>
                                <td style={{ ...td, textAlign:"right", fontWeight:700 }}>{row.price ? `Rs ${Number(row.price).toLocaleString("en-IN")}` : "—"}</td>
                                <td style={{ ...td, color:"#64748b", maxWidth:120, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{row.description||"—"}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Progress bar */}
                    {xlImporting && (
                      <div style={{ marginBottom:12 }}>
                        <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, color:"#64748b", marginBottom:4 }}>
                          <span>Importing…</span>
                          <span>{xlProgress} / {xlSelected.length}</span>
                        </div>
                        <div style={{ height:8, background:"#f1f5f9", borderRadius:6, overflow:"hidden" }}>
                          <div style={{ height:"100%", background:`linear-gradient(90deg,${PRIMARY},${PRIMARY_LIGHT})`, borderRadius:6, width:`${Math.round((xlProgress/xlSelected.length)*100)}%`, transition:"width .2s" }} />
                        </div>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div style={{ display:"flex", gap:10 }}>
                      <button style={{ ...s.btn, ...s.btnSecondary, flex:1 }} onClick={() => setShowXL(false)} disabled={xlImporting}>Cancel</button>
                      <button
                        style={{ ...s.btn, ...s.btnPrimary, flex:2, opacity: xlImporting || xlSelected.length===0 ? 0.7 : 1 }}
                        onClick={handleXLImport}
                        disabled={xlImporting || xlSelected.length === 0}
                      >
                        {xlImporting ? `⏳ Importing ${xlProgress}/${xlSelected.length}…` : `📥 Import ${xlSelected.length} Product${xlSelected.length!==1?"s":""}`}
                      </button>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* ══ Add / Edit Modal ══ */}
      {showModal && (
        <div style={s.overlay} onClick={() => setShowModal(false)}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            <h2 style={s.modalTitle}>{editing ? "✏️ Edit Product" : "➕ Add New Product"}</h2>

            <label style={s.fieldLabel}>Product Name <span style={{ color: "#ef4444" }}>*</span></label>
            <input style={s.input} placeholder="e.g. Annulus Ring Gear Set" value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />

            <div style={s.twoCol}>
              <div>
                <label style={s.fieldLabel}>Selling Price - SP (Rs)</label>
                <input type="number" min="0" style={s.input} placeholder="e.g. 4500" value={form.price}
                  onChange={e => { const v = e.target.value; if (v === "" || Number(v) >= 0) setForm(f => ({ ...f, price: v })); }} />
              </div>
              <div>
                <label style={s.fieldLabel}>Cost Price - CP (Rs)</label>
                <input type="number" min="0" style={s.input} placeholder="e.g. 3000" value={form.costPrice}
                  onChange={e => { const v = e.target.value; if (v === "" || Number(v) >= 0) setForm(f => ({ ...f, costPrice: v })); }} />
              </div>
            </div>

            <div style={s.twoCol}>
              <div>
                <label style={s.fieldLabel}>Unit</label>
                <select style={s.input} value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}>
                  {["Nos", "Set", "Kit", "Pcs", "NOS"].map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
              <div>
                <label style={s.fieldLabel}>Quantity in Stock</label>
                <input type="number" min="0" style={{ ...s.input, ...(form.quantity !== "" && Number(form.quantity) < 5 ? { borderColor: "#ef4444", background: "#fef2f2" } : {}) }}
                  placeholder="e.g. 25" value={form.quantity}
                  onChange={e => { const v = e.target.value; if (v === "" || Number(v) >= 0) setForm(f => ({ ...f, quantity: v })); }} />
                {form.quantity !== "" && Number(form.quantity) < 5 && (
                  <p style={{ color: "#ef4444", fontSize: 11, fontWeight: 600, margin: "-10px 0 10px" }}>⚠️ Low stock!</p>
                )}
              </div>
            </div>

            <div style={s.twoCol}>
              <div>
                <label style={s.fieldLabel}>HS Code</label>
                <input style={s.input} placeholder="e.g. 84314990" value={form.hsCode}
                  onChange={e => setForm(f => ({ ...f, hsCode: e.target.value }))} />
                <label style={s.fieldLabel}>Product Model <span style={{ color: "#ef4444" }}>*</span></label>                <input style={s.input} placeholder="part-model-no" value={form.productCode}
                  onChange={e => setForm(f => ({ ...f, productCode: e.target.value }))} />
              </div>
              <div />
            </div>

            {/* Category dropdown */}
            <label style={s.fieldLabel}>Category</label>
            <div style={{ position: "relative", marginBottom: 14 }} ref={catRef}>
              <div style={{ ...s.input, marginBottom: 0, display: "flex", alignItems: "center", cursor: "pointer", gap: 6 }}
                onClick={() => { setCatDropOpen(o => !o); setCatSearch(""); setAddingCat(false); }}>
                <span style={{ flex: 1, color: form.category ? "#0f172a" : "#94a3b8" }}>
                  {form.category || "Select category…"}
                </span>
                <span style={{ fontSize: 10, color: "#94a3b8" }}>{catDropOpen ? "▲" : "▼"}</span>
              </div>
              {catDropOpen && (
                <div style={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 60, background: "#fff", borderRadius: 10, border: "1.5px solid #e2e8f0", boxShadow: "0 8px 28px rgba(0,0,0,0.12)", maxHeight: 240, overflowY: "auto", marginTop: 4 }}>
                  <div style={{ padding: "8px 10px", borderBottom: "1px solid #f1f5f9" }}>
                    <input autoFocus style={{ ...s.input, marginBottom: 0, fontSize: 12 }} placeholder="🔍 Search categories…"
                      value={catSearch} onChange={e => setCatSearch(e.target.value)} onClick={e => e.stopPropagation()} />
                  </div>
                  <div style={{ padding: "8px 12px", cursor: "pointer", fontSize: 13, color: "#94a3b8", borderBottom: "1px solid #f8fafc" }}
                    onMouseDown={e => e.preventDefault()} onClick={() => { setForm(f => ({ ...f, category: "" })); setCatDropOpen(false); }}>
                    — None —
                  </div>
                  {categories.filter(c => c.name.toLowerCase().includes(catSearch.toLowerCase())).map(c => (
                    <div key={c.id}
                      style={{ padding: "8px 12px", cursor: "pointer", fontSize: 13, display: "flex", justifyContent: "space-between", alignItems: "center", background: form.category === c.name ? "#f0f9ff" : "transparent", borderBottom: "1px solid #f8fafc" }}
                      onMouseDown={e => e.preventDefault()} onClick={() => { setForm(f => ({ ...f, category: c.name })); setCatDropOpen(false); }}>
                      <span style={{ fontWeight: form.category === c.name ? 700 : 400 }}>
                        {form.category === c.name && "✓ "}{c.name}
                      </span>
                      <button style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: 12 }}
                        onClick={e => { e.stopPropagation(); if (window.confirm(`Delete category "${c.name}"?`)) { deleteCategory(c.id); if (form.category === c.name) setForm(f => ({ ...f, category: "" })); } }}>
                        🗑
                      </button>
                    </div>
                  ))}
                  {!addingCat ? (
                    <div style={{ padding: "9px 12px", cursor: "pointer", fontSize: 13, fontWeight: 600, color: PRIMARY, borderTop: "1px solid #f1f5f9" }}
                      onMouseDown={e => e.preventDefault()} onClick={() => { setAddingCat(true); setNewCatName(catSearch); }}>
                      ➕ Add New Category
                    </div>
                  ) : (
                    <div style={{ padding: "8px 10px", display: "flex", gap: 6, borderTop: "1px solid #f1f5f9" }}>
                      <input autoFocus style={{ ...s.input, marginBottom: 0, flex: 1, fontSize: 12 }} placeholder="New category name"
                        value={newCatName} onChange={e => setNewCatName(e.target.value)}
                        onKeyDown={async e => { if (e.key === "Enter" && newCatName.trim()) { await addCategory(newCatName.trim()); setForm(f => ({ ...f, category: newCatName.trim() })); setAddingCat(false); setNewCatName(""); setCatDropOpen(false); } }}
                        onClick={e => e.stopPropagation()} />
                      <button style={{ background: PRIMARY, color: "#fff", border: "none", borderRadius: 6, padding: "4px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
                        onClick={async () => { if (newCatName.trim()) { await addCategory(newCatName.trim()); setForm(f => ({ ...f, category: newCatName.trim() })); setAddingCat(false); setNewCatName(""); setCatDropOpen(false); } }}>
                        Add
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Rack Selector */}
            <div style={{ marginBottom: 14 }}>
              <RackSelector
                racks={racks}
                value={{ rack: form.rack, section: form.section }}
                onChange={({ rack, section }) => setForm(f => ({ ...f, rack, section }))}
                onAddRack={addRack}
                onAddSection={addSection}
                onDeleteRack={deleteRack}
                onDeleteSection={deleteSection}
              />
            </div>

            <label style={s.fieldLabel}>Description</label>
            <textarea style={{ ...s.input, height: 72, resize: "vertical" }}
              placeholder="Short product description (optional)"
              value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />

            <label style={s.fieldLabel}>Product Image</label>
            <div style={s.imgRow}>
              <input style={{ ...s.input, flex: 1, marginBottom: 0 }} placeholder="Paste image URL…"
                value={form._imageBlob ? "" : form.image}
                onChange={e => { setForm(f => ({ ...f, image: e.target.value, _imageBlob: null, _imageName: "" })); setImagePreview(e.target.value); }} />
              <button style={{ ...s.btn, ...s.btnSecondary, flexShrink: 0 }} onClick={() => fileRef.current.click()}>
                📁 Upload
              </button>
              <input ref={fileRef} type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={handleImageFile} />
            </div>
            {uploadProgress && !saving && (
              <div style={{ fontSize: 12, color: PRIMARY, marginTop: 6, fontWeight: 600 }}>⏳ {uploadProgress}</div>
            )}
            {imagePreview && (
              <img src={imagePreview} alt="preview"
                style={{ width: "100%", height: 160, objectFit: "cover", borderRadius: 10, marginTop: 10, marginBottom: 4 }}
                onError={() => setImagePreview("")} />
            )}

            <div style={{ ...s.cardActions, marginTop: 20 }}>
              <button style={{ ...s.btn, ...s.btnSecondary, flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
              <button style={{ ...s.btn, ...s.btnPrimary, flex: 1, opacity: saving ? 0.7 : 1 }}
                onClick={handleSave} disabled={saving}>
                {saving ? (uploadProgress || "Saving…") : editing ? "Save Changes" : "Add Product"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {delConfirm && (
        <div style={s.overlay} onClick={() => setDelConfirm(null)}>
          <div style={{ ...s.modal, maxWidth: 360 }} onClick={e => e.stopPropagation()}>
            <h2 style={{ ...s.modalTitle, color: "#ef4444" }}>Delete Product?</h2>
            <p style={{ color: "#64748b", marginBottom: 24, fontSize: 14 }}>This will permanently remove it and cannot be undone.</p>
            <div style={s.cardActions}>
              <button style={{ ...s.btn, ...s.btnSecondary, flex: 1 }} onClick={() => setDelConfirm(null)}>Cancel</button>
              <button style={{ ...s.btn, flex: 1, background: "#ef4444", color: "#fff" }} onClick={() => handleDelete(delConfirm)}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const PRIMARY       = "#ea580c";
const PRIMARY_LIGHT = "#f97316";

const s = {
  page:         { fontFamily: "'Inter','Segoe UI',system-ui,sans-serif", background: "#f8fafc", minHeight: "100vh" },
  inner:        { maxWidth: 1200, margin: "0 auto", padding: "28px 24px" },
  header:       { display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 14, flexWrap: "wrap", gap: 12 },
  label:        { color: PRIMARY_LIGHT, fontWeight: 700, fontSize: 11, letterSpacing: 2, margin: 0, textTransform: "uppercase" },
  title:        { fontSize: 28, fontWeight: 800, color: "#0f172a", margin: "4px 0 0" },
  headerRight:  { display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" },
  search:       { padding: "9px 14px", borderRadius: 9, border: "1.5px solid #e2e8f0", fontSize: 14, outline: "none", width: 240, boxSizing: "border-box" },
  addBtn:       { background: `linear-gradient(135deg,${PRIMARY},${PRIMARY_LIGHT})`, color: "#fff", border: "none", borderRadius: 9, padding: "10px 20px", fontSize: 14, fontWeight: 700, cursor: "pointer", boxShadow: "0 2px 8px rgba(234,88,12,0.25)" },
  xlBtn:        { background: "#f0f9ff", color: "#0369a1", border: "1.5px solid #bae6fd", borderRadius: 9, padding: "10px 18px", fontSize: 14, fontWeight: 700, cursor: "pointer" },
  banner:       { borderRadius: 10, padding: "10px 16px", marginBottom: 16, fontSize: 13, fontWeight: 500 },
  bannerFire:   { background: "#ecfdf5", border: "1px solid #6ee7b7", color: "#065f46" },
  bannerLocal:  { background: "#fffbeb", border: "1px solid #fcd34d", color: "#92400e" },
  loading:      { textAlign: "center", padding: "60px 0", color: "#64748b" },
  spinnerWrap:  { display: "flex", justifyContent: "center", marginBottom: 12 },
  spinner:      { width: 36, height: 36, border: "3px solid #e2e8f0", borderTop: `3px solid ${PRIMARY}`, borderRadius: "50%", animation: "spin 0.8s linear infinite" },
  empty:        { textAlign: "center", padding: "60px 0" },
  grid:         { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 24 },
  card:         { background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)", border: "1px solid #f1f5f9" },
  imageWrap:    { position: "relative", background: "#f8f4f0", height: 200, overflow: "hidden" },
  image:        { width: "100%", height: "100%", objectFit: "cover" },
  imagePlaceholder: { width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 52 },
  badge:        { position: "absolute", top: 10, right: 10, background: PRIMARY, color: "#fff", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20 },
  lowBadge:     { position: "absolute", top: 10, left: 10, background: "#ef4444", color: "#fff", fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 20 },
  cardBody:     { padding: 16 },
  productName:  { fontSize: 15, fontWeight: 700, color: "#0f172a", margin: "0 0 4px", lineHeight: 1.3 },
  productDesc:  { fontSize: 12, color: "#64748b", margin: "0 0 6px", lineHeight: 1.5 },
  unitTag:      { display: "inline-block", background: "#fff7ed", color: PRIMARY, fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 6, marginBottom: 6 },
  rackChip:     { display: "inline-block", background: "#f0f9ff", color: "#0369a1", fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 6, marginBottom: 6, border: "1px solid #bae6fd" },
  price:        { color: PRIMARY, fontWeight: 700, fontSize: 18, margin: "0 0 4px" },
  cardActions:  { display: "flex", gap: 8 },
  btn:          { padding: "9px 14px", borderRadius: 8, border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" },
  btnPrimary:   { background: `linear-gradient(135deg,${PRIMARY},${PRIMARY_LIGHT})`, color: "#fff", boxShadow: "0 2px 8px rgba(234,88,12,0.2)" },
  btnSecondary: { background: "#f1f5f9", color: "#334155" },
  btnDanger:    { background: "#fee2e2", color: "#b91c1c" },
  overlay:      { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, padding: 16, backdropFilter: "blur(4px)" },
  modal:        { background: "#fff", borderRadius: 18, padding: 28, width: "100%", maxWidth: 500, boxShadow: "0 20px 60px rgba(0,0,0,0.2)", maxHeight: "90vh", overflowY: "auto" },
  modalTitle:   { fontSize: 20, fontWeight: 800, color: "#0f172a", marginTop: 0, marginBottom: 20 },
  twoCol:       { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  fieldLabel:   { display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6, marginTop: 2 },
  input:        { width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #e2e8f0", fontSize: 14, color: "#0f172a", marginBottom: 14, boxSizing: "border-box", outline: "none" },
  imgRow:       { display: "flex", gap: 8, alignItems: "center", marginBottom: 4 },
};

/* ── Shared table cell styles for Excel preview ── */
const th = { padding: "8px 10px", fontSize: 11, fontWeight: 700, color: "#64748b", textAlign: "left", borderBottom: "1px solid #e2e8f0", whiteSpace: "nowrap" };
const td = { padding: "7px 10px", borderBottom: "1px solid #f8fafc", cursor: "pointer", verticalAlign: "middle" };