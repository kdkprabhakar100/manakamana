import { useState, useRef } from "react";
import { useProducts } from "../../hooks/useProducts";

const EMPTY = { name: "", price: "", unit: "Nos", category: "", description: "", image: "" };

export default function AdminProducts() {
  const { products, loading, addProduct, updateProduct, deleteProduct, useLocal } = useProducts();

  const [showModal,    setShowModal]    = useState(false);
  const [editing,      setEditing]      = useState(null);
  const [form,         setForm]         = useState(EMPTY);
  const [imagePreview, setImagePreview] = useState("");
  const [search,       setSearch]       = useState("");
  const [delConfirm,   setDelConfirm]   = useState(null);
  const [saving,       setSaving]       = useState(false);
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
      unit: p.unit || "Nos",
      category: p.category || "",
      description: p.description || "",
      image: p.image || "",
    });
    setImagePreview(p.image || "");
    setShowModal(true);
  };

  /* ── Image file upload ── */
  const handleImageFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setImagePreview(ev.target.result);
      setForm(f => ({ ...f, image: ev.target.result }));
    };
    reader.readAsDataURL(file);
  };

  /* ── Save ── */
  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      if (editing) {
        await updateProduct(editing.id, form);
      } else {
        await addProduct(form);
      }
      setShowModal(false);
    } finally {
      setSaving(false);
    }
  };

  /* ── Delete ── */
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
            : `✅ Connected to Firebase — ${products.length} products in catalogue. Changes sync instantly.`
          }
        </div>

        {/* ── Loading ── */}
        {loading ? (
          <div style={s.loading}>
            <div style={s.spinnerWrap}>
              <div style={s.spinner} />
            </div>
            <p>Loading products…</p>
          </div>

        /* ── Empty ── */
        ) : filtered.length === 0 ? (
          <div style={s.empty}>
            <div style={{ fontSize: 56 }}>📦</div>
            <p style={{ color: "#64748b", fontSize: 16, marginTop: 12 }}>
              {search ? `No products match "${search}"` : "No products yet."}
            </p>
            {!search && (
              <button style={{ ...s.addBtn, marginTop: 16 }} onClick={openAdd}>
                + Add Your First Product
              </button>
            )}
          </div>

        /* ── Card Grid ── */
        ) : (
          <div className="admin-products-grid" style={s.grid}>
            {filtered.map(product => (
              <div key={product.id} style={s.card}>

                {/* Image */}
                <div style={s.imageWrap}>
                  {product.image
                    ? <img src={product.image} alt={product.name} style={s.image}
                        onError={e => { e.target.style.display = "none"; }} />
                    : <div style={s.imagePlaceholder}>⚙️</div>
                  }
                  {product.category && (
                    <span style={s.badge}>{product.category}</span>
                  )}
                </div>

                {/* Body */}
                <div style={s.cardBody}>
                  <h3 style={s.productName}>{product.name}</h3>
                  {product.description && (
                    <p style={s.productDesc}>{product.description}</p>
                  )}
                  {product.unit && (
                    <span style={s.unitTag}>📦 per {product.unit}</span>
                  )}
                  <p style={s.price}>
                    {product.price
                      ? `₹${Number(product.price).toLocaleString("en-IN")}`
                      : "Get Latest Price"
                    }
                  </p>

                  {/* Public actions */}
                  <div style={s.cardActions}>
                    <button style={{ ...s.btn, ...s.btnOutline, flex: 1 }}>📞 Call Now</button>
                    <button style={{ ...s.btn, ...s.btnWa, flex: 1 }}>💬 WhatsApp</button>
                  </div>

                  {/* Admin actions */}
                  <div style={{ ...s.cardActions, marginTop: 8 }}>
                    <button style={{ ...s.btn, ...s.btnSecondary, flex: 1 }} onClick={() => openEdit(product)}>
                      ✏️ Edit
                    </button>
                    <button style={{ ...s.btn, ...s.btnDanger, flex: 1 }} onClick={() => setDelConfirm(product.id)}>
                      🗑 Delete
                    </button>
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
            <h2 style={s.modalTitle}>
              {editing ? "✏️ Edit Product" : "➕ Add New Product"}
            </h2>

            <label style={s.fieldLabel}>Product Name *</label>
            <input
              style={s.input}
              placeholder="e.g. Annulus Ring Gear Set"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            />

            <div className="modal-two-col" style={s.twoCol}>
              <div>
                <label style={s.fieldLabel}>Price (₹)</label>
                <input
                  type="number"
                  style={s.input}
                  placeholder="e.g. 4500"
                  value={form.price}
                  onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                />
              </div>
              <div>
                <label style={s.fieldLabel}>Unit</label>
                <input
                  style={s.input}
                  placeholder="Nos / Set / Kit / Pcs"
                  value={form.unit}
                  onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
                />
              </div>
            </div>

            <label style={s.fieldLabel}>Category</label>
            <input
              style={s.input}
              placeholder="e.g. Gears, Pins, Seals"
              value={form.category}
              onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
            />

            <label style={s.fieldLabel}>Description</label>
            <textarea
              style={{ ...s.input, height: 72, resize: "vertical" }}
              placeholder="Short product description (optional)"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            />

            <label style={s.fieldLabel}>Product Image</label>
            <div style={s.imgRow}>
              <input
                style={{ ...s.input, flex: 1, marginBottom: 0 }}
                placeholder="Paste image URL…"
                value={form.image.startsWith("data:") ? "" : form.image}
                onChange={e => {
                  setForm(f => ({ ...f, image: e.target.value }));
                  setImagePreview(e.target.value);
                }}
              />
              <button style={{ ...s.btn, ...s.btnSecondary, flexShrink: 0 }}
                onClick={() => fileRef.current.click()}>
                📁 Upload
              </button>
              <input ref={fileRef} type="file" accept="image/*"
                style={{ display: "none" }} onChange={handleImageFile} />
            </div>

            {imagePreview && (
              <img src={imagePreview} alt="preview"
                style={{ width: "100%", height: 160, objectFit: "cover", borderRadius: 10, marginTop: 10, marginBottom: 4 }}
                onError={() => setImagePreview("")} />
            )}

            <div style={{ ...s.cardActions, marginTop: 20 }}>
              <button style={{ ...s.btn, ...s.btnSecondary, flex: 1 }} onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button
                style={{ ...s.btn, ...s.btnPrimary, flex: 1, opacity: saving ? 0.7 : 1 }}
                onClick={handleSave} disabled={saving}
              >
                {saving ? "Saving…" : editing ? "Save Changes" : "Add Product"}
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
            <p style={{ color: "#64748b", marginBottom: 24, fontSize: 14 }}>
              This will permanently remove it. This cannot be undone.
            </p>
            <div style={s.cardActions}>
              <button style={{ ...s.btn, ...s.btnSecondary, flex: 1 }} onClick={() => setDelConfirm(null)}>
                Cancel
              </button>
              <button style={{ ...s.btn, flex: 1, background: "#ef4444", color: "#fff" }}
                onClick={() => handleDelete(delConfirm)}>
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const s = {
  page: { fontFamily: "'Segoe UI', sans-serif", background: "#f8fafc", minHeight: "100vh" },
  inner: { maxWidth: 1200, margin: "0 auto", padding: "36px 24px" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 14, flexWrap: "wrap", gap: 12 },
  label: { color: "#0ea5e9", fontWeight: 700, fontSize: 11, letterSpacing: 2, margin: 0, textTransform: "uppercase" },
  title: { fontSize: 28, fontWeight: 800, color: "#0f172a", margin: "4px 0 0" },
  headerRight: { display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" },
  search: { padding: "9px 14px", borderRadius: 9, border: "1.5px solid #e2e8f0", fontSize: 14, outline: "none", width: 240, boxSizing: "border-box" },
  addBtn: { background: "#0ea5e9", color: "#fff", border: "none", borderRadius: 9, padding: "10px 20px", fontSize: 14, fontWeight: 700, cursor: "pointer" },
  banner: { borderRadius: 10, padding: "10px 16px", marginBottom: 24, fontSize: 13, fontWeight: 500 },
  bannerFire: { background: "#ecfdf5", border: "1px solid #6ee7b7", color: "#065f46" },
  bannerLocal: { background: "#fffbeb", border: "1px solid #fcd34d", color: "#92400e" },
  loading: { textAlign: "center", padding: "60px 0", color: "#64748b" },
  spinnerWrap: { display: "flex", justifyContent: "center", marginBottom: 12 },
  spinner: { width: 36, height: 36, border: "3px solid #e2e8f0", borderTop: "3px solid #0ea5e9", borderRadius: "50%" },
  empty: { textAlign: "center", padding: "60px 0" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 24 },
  card: { background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.07)" },
  imageWrap: { position: "relative", background: "#f1f5f9", height: 200, overflow: "hidden" },
  image: { width: "100%", height: "100%", objectFit: "cover" },
  imagePlaceholder: { width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 52 },
  badge: { position: "absolute", top: 10, right: 10, background: "#0ea5e9", color: "#fff", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20 },
  cardBody: { padding: 16 },
  productName: { fontSize: 15, fontWeight: 700, color: "#0f172a", margin: "0 0 4px", lineHeight: 1.3 },
  productDesc: { fontSize: 12, color: "#64748b", margin: "0 0 6px", lineHeight: 1.5 },
  unitTag: { display: "inline-block", background: "#f1f5f9", color: "#475569", fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 6, marginBottom: 8 },
  price: { color: "#0ea5e9", fontWeight: 700, fontSize: 18, margin: "0 0 12px" },
  cardActions: { display: "flex", gap: 8 },
  btn: { padding: "9px 14px", borderRadius: 8, border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" },
  btnPrimary:   { background: "#0ea5e9", color: "#fff" },
  btnSecondary: { background: "#e2e8f0", color: "#334155" },
  btnDanger:    { background: "#fee2e2", color: "#b91c1c" },
  btnOutline:   { background: "#fff", color: "#0ea5e9", border: "1.5px solid #0ea5e9" },
  btnWa:        { background: "#dcfce7", color: "#16a34a" },
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, padding: 16 },
  modal: { background: "#fff", borderRadius: 18, padding: 28, width: "100%", maxWidth: 500, boxShadow: "0 20px 60px rgba(0,0,0,0.2)", maxHeight: "90vh", overflowY: "auto" },
  modalTitle: { fontSize: 20, fontWeight: 800, color: "#0f172a", marginTop: 0, marginBottom: 20 },
  twoCol: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  fieldLabel: { display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6, marginTop: 2 },
  input: { width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #e2e8f0", fontSize: 14, color: "#0f172a", marginBottom: 14, boxSizing: "border-box", outline: "none" },
  imgRow: { display: "flex", gap: 8, alignItems: "center", marginBottom: 4 },
};