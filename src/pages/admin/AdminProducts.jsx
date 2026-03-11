import { useState, useRef } from "react";
import { useProducts } from "../../hooks/useProducts";
import { useCategories } from "../../hooks/useCategories";
import { useRacks } from "../../hooks/useRacks"; // ← NEW hook (see useRacks.js)
import { RackSelector } from "./RackSelector";   // ← NEW component

const EMPTY = {
  name: "", price: "", costPrice: "", unit: "Nos",
  category: "", hsCode: "", description: "", image: "",
  quantity: "",
  rack: "", section: "",           // ← NEW fields
};

export default function AdminProducts() {
  const { products, loading, addProduct, updateProduct, deleteProduct, useLocal } = useProducts();
  const { categories, addCategory, deleteCategory } = useCategories();
  const { racks, addRack, deleteRack, addSection, deleteSection } = useRacks(); // ← NEW

  /* ── Category dropdown ── */
  const [catDropOpen, setCatDropOpen] = useState(false);
  const [catSearch, setCatSearch] = useState("");
  const [addingCat, setAddingCat] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const catRef = useRef();

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [imagePreview, setImagePreview] = useState("");
  const [search, setSearch] = useState("");
  const [delConfirm, setDelConfirm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const fileRef = useRef();

  /* ── Filter ── */
  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.category || "").toLowerCase().includes(search.toLowerCase())
  );

  /* ── Modals ── */
  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY);
    setImagePreview("");
    setShowModal(true);
  };

  const openEdit = (p) => {
    setEditing(p);
    setForm({
      name: p.name,
      price: p.price || "",
      costPrice: p.costPrice || "",
      unit: p.unit || "Nos",
      category: p.category || "",
      hsCode: p.hsCode || "",
      description: p.description || "",
      image: p.image || "",
      quantity: p.quantity !== undefined ? String(p.quantity) : "",
      rack: p.rack || "",
      section: p.section || "",
    });
    setImagePreview(p.image || "");
    setShowModal(true);
  };

  /* ── Compress image ── */
  function compressImage(file) {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith("image/")) { reject(new Error("Please select an image file.")); return; }
      const img = new Image();
      const reader = new FileReader();
      reader.onerror = () => reject(new Error("Failed to read the image file."));
      reader.onload = (ev) => {
        img.onerror = () => reject(new Error("Failed to load image. The file may be corrupted."));
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
              if (!blob) { reject(new Error("Image compression failed.")); return; }
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
      reader.onload = () => resolve(reader.result);
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

  /* ── Save ── */
  const handleSave = async () => {
    if (!form.name.trim()) { alert("Product name is required."); return; }
    if (form.price !== "" && (isNaN(Number(form.price)) || Number(form.price) < 0)) { alert("Selling price cannot be negative."); return; }
    if (form.costPrice !== "" && (isNaN(Number(form.costPrice)) || Number(form.costPrice) < 0)) { alert("Cost price cannot be negative."); return; }
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
        description: form.description,
        image: imageUrl,
        quantity: form.quantity !== "" ? Number(form.quantity) : 0,
        rack: form.rack,           // ← NEW
        section: form.section,     // ← NEW
      };
      if (editing) await updateProduct(editing.id, productData);
      else await addProduct(productData);
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

  return (
    <div style={s.page}>
      <div style={s.inner}>

        {/* ── Header ── */}
        <div className="admin-products-header" style={s.header}>
          <div>
            <p style={s.label}>ADMIN · CATALOGUE</p>
            <h1 style={s.title}>Product Management</h1>
          </div>
          <div className="admin-header-right" style={s.headerRight}>
            <input
              className="admin-search" style={s.search}
              placeholder="🔍 Search products…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <button style={s.addBtn} onClick={openAdd}>+ Add Product</button>
          </div>
        </div>

        {/* Storage mode banner */}
        <div style={{ ...s.banner, ...(useLocal ? s.bannerLocal : s.bannerFire) }}>
          {useLocal
            ? "⚠️ Firebase not configured — products are saved in browser localStorage. Configure Firebase to persist across devices."
            : `✅ Connected to Firebase — ${products.length} products in catalogue. Changes sync instantly.`}
        </div>

        {/* Low stock notification */}
        {(() => {
          const lowStock = products.filter(p => p.quantity !== undefined && p.quantity < 5);
          return lowStock.length > 0 && (
            <div style={s.lowStockBanner}>
              ⚠️ Low Stock Alert — {lowStock.length} product{lowStock.length > 1 ? "s" : ""} {lowStock.length > 1 ? "have" : "has"} less than 5 units:{" "}
              <strong>{lowStock.map(p => `${p.name} (${p.quantity ?? 0})`).join(", ")}</strong>
            </div>
          );
        })()}

        {/* ── Loading ── */}
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
            {!search && (
              <button style={{ ...s.addBtn, marginTop: 16 }} onClick={openAdd}>+ Add Your First Product</button>
            )}
          </div>

        ) : (
          <div className="admin-products-grid" style={s.grid}>
            {filtered.map(product => (
              <div key={product.id} style={s.card}>
                <div style={s.imageWrap}>
                  {product.image
                    ? <img src={product.image} alt={product.name} style={s.image} onError={e => { e.target.style.display = "none"; }} />
                    : <div style={s.imagePlaceholder}>⚙️</div>
                  }
                  {product.category && <span style={s.badge}>{product.category}</span>}
                </div>
                <div style={s.cardBody}>
                  <h3 style={s.productName}>{product.name}</h3>
                  {product.description && <p style={s.productDesc}>{product.description}</p>}
                  {product.unit && <span style={s.unitTag}>📦 per {product.unit}</span>}

                  {/* ── Rack location chip ── */}
                  {(product.rack || product.section) && (
                    <div style={s.rackChip}>
                      🗄 {[product.rack, product.section].filter(Boolean).join(" › ")}
                    </div>
                  )}

                  <p style={s.price}>
                    SP: {product.price ? `Rs ${Number(product.price).toLocaleString("en-IN")}` : "—"}
                  </p>
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

      {/* ══ Add / Edit Modal ══ */}
      {showModal && (
        <div style={s.overlay} onClick={() => setShowModal(false)}>
          <div className="modal-box" style={s.modal} onClick={e => e.stopPropagation()}>
            <h2 style={s.modalTitle}>{editing ? "✏️ Edit Product" : "➕ Add New Product"}</h2>

            <label style={s.fieldLabel}>Product Name <span style={{ color: "#ef4444", fontWeight: 700 }}>*</span></label>
            <input style={s.input} placeholder="e.g. Annulus Ring Gear Set" value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />

            <div className="modal-two-col" style={s.twoCol}>
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

            <div className="modal-two-col" style={s.twoCol}>
              <div>
                <label style={s.fieldLabel}>Unit</label>
                <select style={s.input} value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}>
                  {["Nos", "Set", "Kit", "Pcs"].map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
              <div>
                <label style={s.fieldLabel}>Quantity in Stock</label>
                <input
                  type="number" min="0"
                  style={{ ...s.input, ...(form.quantity !== "" && Number(form.quantity) < 5 ? { borderColor: "#ef4444", background: "#fef2f2" } : {}) }}
                  placeholder="e.g. 25" value={form.quantity}
                  onChange={e => { const v = e.target.value; if (v === "" || Number(v) >= 0) setForm(f => ({ ...f, quantity: v })); }}
                />
                {form.quantity !== "" && Number(form.quantity) < 5 && (
                  <p style={{ color: "#ef4444", fontSize: 11, fontWeight: 600, margin: "-10px 0 10px" }}>⚠️ Low stock! Less than 5 units.</p>
                )}
              </div>
            </div>

            <div className="modal-two-col" style={s.twoCol}>
              <div>
                <label style={s.fieldLabel}>HS Code</label>
                <input style={s.input} placeholder="e.g. 84314990" value={form.hsCode}
                  onChange={e => setForm(f => ({ ...f, hsCode: e.target.value }))} />
              </div>
              <div />
            </div>

            {/* ── Category ── */}
            <label style={s.fieldLabel}>Category</label>
            <div style={{ position: "relative", marginBottom: 14 }} ref={catRef}>
              <div
                style={{ ...s.input, marginBottom: 0, display: "flex", alignItems: "center", cursor: "pointer", gap: 6 }}
                onClick={() => { setCatDropOpen(o => !o); setCatSearch(""); setAddingCat(false); }}
              >
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
                      <span style={{ fontWeight: form.category === c.name ? 700 : 400, color: "#0f172a" }}>
                        {form.category === c.name && "✓ "}{c.name}
                      </span>
                      <button style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: 12, padding: "2px 4px" }}
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

            {/* ══ RACK SELECTOR ══ */}
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

            {/* Description */}
            <label style={s.fieldLabel}>Description</label>
            <textarea style={{ ...s.input, height: 72, resize: "vertical" }}
              placeholder="Short product description (optional)"
              value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />

            {/* Image */}
            <label style={s.fieldLabel}>Product Image</label>
            <div style={s.imgRow}>
              <input style={{ ...s.input, flex: 1, marginBottom: 0 }} placeholder="Paste image URL…"
                value={form._imageBlob ? "" : form.image}
                onChange={e => { setForm(f => ({ ...f, image: e.target.value, _imageBlob: null, _imageName: "" })); setImagePreview(e.target.value); }} />
              <button style={{ ...s.btn, ...s.btnSecondary, flexShrink: 0 }} onClick={() => fileRef.current.click()}>
                📁 Upload
              </button>
              <input ref={fileRef} type="file" accept="image/*" capture="environment"
                style={{ display: "none" }} onChange={handleImageFile} />
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

      {/* ══ Delete Confirm ══ */}
      {delConfirm && (
        <div style={s.overlay} onClick={() => setDelConfirm(null)}>
          <div style={{ ...s.modal, maxWidth: 360 }} onClick={e => e.stopPropagation()}>
            <h2 style={{ ...s.modalTitle, color: "#ef4444" }}>Delete Product?</h2>
            <p style={{ color: "#64748b", marginBottom: 24, fontSize: 14 }}>This will permanently remove it. This cannot be undone.</p>
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

const PRIMARY = "#ea580c";
const PRIMARY_LIGHT = "#f97316";

const s = {
  page: { fontFamily: "'Inter','Segoe UI',system-ui,sans-serif", background: "#f8fafc", minHeight: "100vh" },
  inner: { maxWidth: 1200, margin: "0 auto", padding: "28px 24px" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 14, flexWrap: "wrap", gap: 12 },
  label: { color: PRIMARY_LIGHT, fontWeight: 700, fontSize: 11, letterSpacing: 2, margin: 0, textTransform: "uppercase" },
  title: { fontSize: 28, fontWeight: 800, color: "#0f172a", margin: "4px 0 0" },
  headerRight: { display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" },
  search: { padding: "9px 14px", borderRadius: 9, border: "1.5px solid #e2e8f0", fontSize: 14, outline: "none", width: 240, boxSizing: "border-box" },
  addBtn: { background: `linear-gradient(135deg,${PRIMARY},${PRIMARY_LIGHT})`, color: "#fff", border: "none", borderRadius: 9, padding: "10px 20px", fontSize: 14, fontWeight: 700, cursor: "pointer", boxShadow: "0 2px 8px rgba(234,88,12,0.25)" },
  banner: { borderRadius: 10, padding: "10px 16px", marginBottom: 24, fontSize: 13, fontWeight: 500 },
  bannerFire: { background: "#ecfdf5", border: "1px solid #6ee7b7", color: "#065f46" },
  bannerLocal: { background: "#fffbeb", border: "1px solid #fcd34d", color: "#92400e" },
  lowStockBanner: { borderRadius: 10, padding: "10px 16px", marginBottom: 24, fontSize: 13, fontWeight: 500, background: "#fef2f2", border: "1px solid #fca5a5", color: "#991b1b" },
  loading: { textAlign: "center", padding: "60px 0", color: "#64748b" },
  spinnerWrap: { display: "flex", justifyContent: "center", marginBottom: 12 },
  spinner: { width: 36, height: 36, border: "3px solid #e2e8f0", borderTop: `3px solid ${PRIMARY}`, borderRadius: "50%", animation: "spin 0.8s linear infinite" },
  empty: { textAlign: "center", padding: "60px 0" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 24 },
  card: { background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)", border: "1px solid #f1f5f9" },
  imageWrap: { position: "relative", background: "#f8f4f0", height: 200, overflow: "hidden" },
  image: { width: "100%", height: "100%", objectFit: "cover" },
  imagePlaceholder: { width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 52 },
  badge: { position: "absolute", top: 10, right: 10, background: PRIMARY, color: "#fff", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20 },
  cardBody: { padding: 16 },
  productName: { fontSize: 15, fontWeight: 700, color: "#0f172a", margin: "0 0 4px", lineHeight: 1.3 },
  productDesc: { fontSize: 12, color: "#64748b", margin: "0 0 6px", lineHeight: 1.5 },
  unitTag: { display: "inline-block", background: "#fff7ed", color: PRIMARY, fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 6, marginBottom: 8 },
  rackChip: { display: "inline-block", background: "#f0f9ff", color: "#0369a1", fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 6, marginBottom: 8, border: "1px solid #bae6fd" },
  price: { color: PRIMARY, fontWeight: 700, fontSize: 18, margin: "0 0 12px" },
  cardActions: { display: "flex", gap: 8 },
  btn: { padding: "9px 14px", borderRadius: 8, border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" },
  btnPrimary: { background: `linear-gradient(135deg,${PRIMARY},${PRIMARY_LIGHT})`, color: "#fff", boxShadow: "0 2px 8px rgba(234,88,12,0.2)" },
  btnSecondary: { background: "#f1f5f9", color: "#334155" },
  btnDanger: { background: "#fee2e2", color: "#b91c1c" },
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, padding: 16, backdropFilter: "blur(4px)" },
  modal: { background: "#fff", borderRadius: 18, padding: 28, width: "100%", maxWidth: 500, boxShadow: "0 20px 60px rgba(0,0,0,0.2)", maxHeight: "90vh", overflowY: "auto" },
  modalTitle: { fontSize: 20, fontWeight: 800, color: "#0f172a", marginTop: 0, marginBottom: 20 },
  twoCol: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  fieldLabel: { display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6, marginTop: 2 },
  input: { width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #e2e8f0", fontSize: 14, color: "#0f172a", marginBottom: 14, boxSizing: "border-box", outline: "none" },
  imgRow: { display: "flex", gap: 8, alignItems: "center", marginBottom: 4 },
};