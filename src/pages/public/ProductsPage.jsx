import { useState } from "react";
import { useProducts } from "../../hooks/useProducts";

export default function ProductsPage() {
  const { products, loading } = useProducts();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [selected, setSelected] = useState(null);

  const categories = ["All", ...new Set(products.map(p => p.category).filter(Boolean))];

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.category || "").toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "All" || p.category === category;
    return matchSearch && matchCat;
  });

  return (
    <div style={s.page}>
      {/* Hero Header */}
      <div style={s.hero}>
        <div style={s.heroOverlay} />
        <div style={s.heroInner}>
          <span style={s.heroBadge}>&#9881; OUR CATALOGUE</span>
          <h1 className="page-title" style={s.heroTitle}>Heavy Equipment & Parts</h1>
          <p style={s.heroDesc}>
            Browse our extensive inventory of {products.length}+ genuine parts and equipment for all major machinery brands.
          </p>
        </div>
      </div>

      <div style={s.contentWrap}>
        {/* Filters Bar */}
        <div className="products-filters" style={s.filterBar}>
          <div style={s.searchWrap}>
            <span style={s.searchIcon}>&#128269;</span>
            <input className="products-search" style={s.search}
              placeholder="Search parts by name, model, or category..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div style={s.cats}>
            {categories.map(c => (
              <button key={c} style={{ ...s.catBtn, ...(category === c ? s.catActive : {}) }}
                onClick={() => setCategory(c)}>{c}</button>
            ))}
          </div>
        </div>

        {/* Results Info */}
        {!loading && (
          <div style={s.resultBar}>
            <span style={s.resultCount}>
              Showing <strong>{filtered.length}</strong> of <strong>{products.length}</strong> products
              {category !== "All" && <> in <strong style={{ color: "#f97316" }}>{category}</strong></>}
            </span>
          </div>
        )}

        {/* Product Grid */}
        {loading ? (
          <div style={s.loadingWrap}>
            <div style={s.spinner} />
            <span>Loading inventory...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div style={s.emptyWrap}>
            <div style={{ fontSize: 52, marginBottom: 12 }}>&#128270;</div>
            <h3 style={{ margin: "0 0 8px", color: "#334155" }}>No Products Found</h3>
            <p style={{ margin: 0, color: "#64748b" }}>Try a different search term or category filter.</p>
          </div>
        ) : (
          <div className="products-grid" style={s.grid}>
            {filtered.map(p => (
              <div key={p.id} style={s.card} onClick={() => setSelected(p)} role="button" tabIndex={0}>
                <div style={s.imgWrap}>
                  {p.image
                    ? <img src={p.image} alt={p.name} style={s.img} loading="lazy" />
                    : <div style={s.imgPlaceholder}>&#9881;</div>
                  }
                  {p.category && <span style={s.catBadge}>{p.category}</span>}
                  {p.quantity !== undefined && p.quantity < 5 && p.quantity > 0 && (
                    <span style={s.lowBadge}>Low Stock</span>
                  )}
                  {p.quantity !== undefined && p.quantity <= 0 && (
                    <span style={s.outBadge}>Out of Stock</span>
                  )}
                </div>
                <div style={s.cardBody}>
                  <h3 style={s.name}>{p.name}</h3>
                  {p.description && <p style={s.desc}>{p.description}</p>}
                  <div style={s.meta}>
                    {p.unit && <span style={s.unitTag}>&#128230; per {p.unit}</span>}
                    {p.quantity !== undefined && (
                      <span style={{ ...s.stockTag, ...(p.quantity < 5 ? s.stockLow : {}) }}>
                        {p.quantity} in stock
                      </span>
                    )}
                  </div>
                  <div style={s.priceRow}>
                    <p style={s.price}>
                      {p.price ? `\u20B9${Number(p.price).toLocaleString("en-IN")}` : "Get Quote"}
                    </p>
                  </div>
                  <div className="product-card-actions" style={s.cardActions}>
                    <a href="tel:+9779851068337" style={s.callBtn} onClick={e => e.stopPropagation()}>&#128222; Call Now</a>
                    <a href={`https://wa.me/9779851068337?text=${encodeURIComponent(`Hi, I'm interested in: ${p.name}${p.price ? ` (₹${p.price})` : ""}. Please share details.`)}`}
                      target="_blank" rel="noreferrer" style={s.waBtn} onClick={e => e.stopPropagation()}>&#128172; WhatsApp</a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Product Detail Modal ── */}
      {selected && (
        <div style={s.modalOverlay} onClick={() => setSelected(null)}>
          <div className="product-modal" style={s.modal} onClick={e => e.stopPropagation()}>
            <button style={s.modalClose} onClick={() => setSelected(null)}>✕</button>
            <div className="product-modal-inner" style={s.modalInner}>
              <div style={s.modalImgWrap}>
                {selected.image
                  ? <img src={selected.image} alt={selected.name} style={s.modalImg} />
                  : <div style={s.modalImgPlaceholder}>⚙️</div>
                }
              </div>
              <div style={s.modalBody}>
                {selected.category && <span style={s.modalCat}>{selected.category}</span>}
                <h2 style={s.modalName}>{selected.name}</h2>
                {selected.description && <p style={s.modalDesc}>{selected.description}</p>}
                <div style={s.modalMeta}>
                  {selected.unit && <span style={s.unitTag}>📦 per {selected.unit}</span>}
                  {selected.quantity !== undefined && (
                    <span style={{
                      ...s.stockTag,
                      ...(selected.quantity < 5 ? s.stockLow : {}),
                      ...(selected.quantity <= 0 ? { background: "#fef2f2", color: "#dc2626" } : {}),
                    }}>
                      {selected.quantity <= 0 ? "Out of Stock" : `${selected.quantity} in stock`}
                    </span>
                  )}
                </div>
                <div style={s.modalPrice}>
                  {selected.price ? `₹${Number(selected.price).toLocaleString("en-IN")}` : "Contact for Price"}
                </div>
                <div style={s.modalActions}>
                  <a href={`https://wa.me/9779851068337?text=${encodeURIComponent(`Hi, I'd like to inquire about: ${selected.name}${selected.price ? ` (₹${selected.price})` : ""}. Please share availability and pricing details.`)}`}
                    target="_blank" rel="noreferrer" style={s.modalWaBtn}>💬 Inquire on WhatsApp</a>
                  <a href="tel:+9779851068337" style={s.modalCallBtn}>📞 Call Now</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const PRIMARY = "#b45309";
const ACCENT = "#d97706";
const DARK = "#0a0a0a";
const STEEL = "#171717";

const s = {
  page: { background: "#fafafa", minHeight: "100vh", fontFamily: "'Inter',system-ui,sans-serif" },

  hero: {
    position: "relative", background: DARK,
    padding: "80px 32px 64px", overflow: "hidden",
  },
  heroOverlay: {
    position: "absolute", inset: 0,
    background: "radial-gradient(circle at 70% 40%, rgba(217,119,6,0.05) 0%, transparent 50%)",
  },
  heroInner: { position: "relative", maxWidth: 1280, margin: "0 auto" },
  heroBadge: {
    display: "inline-block", background: "rgba(217,119,6,0.08)", color: "#f59e0b",
    fontSize: 11, fontWeight: 700, padding: "8px 20px", borderRadius: 100,
    letterSpacing: 3, marginBottom: 20, border: "1px solid rgba(217,119,6,0.15)",
  },
  heroTitle: { fontSize: 48, fontWeight: 800, color: "#fff", margin: "0 0 16px", lineHeight: 1.1, letterSpacing: "-0.03em", fontFamily: "'Space Grotesk','Inter',sans-serif" },
  heroDesc: { fontSize: 16, color: "#a3a3a3", lineHeight: 1.8, maxWidth: 640, margin: 0 },

  contentWrap: { maxWidth: 1280, margin: "0 auto", padding: "32px 32px 64px" },

  filterBar: {
    background: "#fff", borderRadius: 24, padding: "24px 28px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
    border: "1px solid #f5f5f5", marginBottom: 24,
    display: "flex", flexDirection: "column", gap: 16,
  },
  searchWrap: { position: "relative", maxWidth: 520 },
  searchIcon: { position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", fontSize: 16, opacity: 0.35 },
  search: {
    width: "100%", padding: "14px 18px 14px 44px", borderRadius: 14,
    border: "1.5px solid #e5e5e5", fontSize: 15, outline: "none",
    background: "#fafafa", boxSizing: "border-box",
    transition: "all 0.3s cubic-bezier(0.16,1,0.3,1)",
  },
  cats: { display: "flex", gap: 8, flexWrap: "wrap" },
  catBtn: {
    padding: "8px 22px", borderRadius: 100, border: "1px solid #e5e5e5",
    fontSize: 13, fontWeight: 600, cursor: "pointer", background: "#fff", color: "#525252",
    transition: "all 0.3s cubic-bezier(0.16,1,0.3,1)", letterSpacing: 0.3,
  },
  catActive: { background: DARK, color: "#fff", border: `1px solid ${DARK}` },

  resultBar: { marginBottom: 20 },
  resultCount: { fontSize: 13, color: "#737373", fontWeight: 500 },

  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px,1fr))", gap: 24 },

  card: {
    background: "#fff", borderRadius: 24, overflow: "hidden",
    boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
    border: "1px solid #f5f5f5", transition: "all 0.5s cubic-bezier(0.16,1,0.3,1)",
    display: "flex", flexDirection: "column",
  },
  imgWrap: { position: "relative", height: 230, background: "#f5f5f5" },
  img: { width: "100%", height: "100%", objectFit: "cover" },
  imgPlaceholder: {
    display: "flex", alignItems: "center", justifyContent: "center",
    height: "100%", fontSize: 52, background: "#f5f5f5", color: "#d4d4d4",
  },
  catBadge: {
    position: "absolute", top: 14, left: 14, background: DARK, color: "#fff",
    fontSize: 10, fontWeight: 700, padding: "5px 14px", borderRadius: 100, letterSpacing: 0.5,
  },
  lowBadge: {
    position: "absolute", top: 14, right: 14, background: "#fbbf24", color: "#78350f",
    fontSize: 10, fontWeight: 700, padding: "5px 12px", borderRadius: 100,
  },
  outBadge: {
    position: "absolute", top: 14, right: 14, background: "#dc2626", color: "#fff",
    fontSize: 10, fontWeight: 700, padding: "5px 12px", borderRadius: 100,
  },
  cardBody: { padding: "20px 22px 24px", display: "flex", flexDirection: "column", flex: 1 },
  name: { fontSize: 17, fontWeight: 700, color: DARK, margin: "0 0 8px" },
  desc: { fontSize: 14, color: "#737373", margin: "0 0 12px", lineHeight: 1.6, flex: 1 },
  meta: { display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 },
  unitTag: {
    display: "inline-block", background: "#fffbeb", color: "#92400e",
    fontSize: 11, fontWeight: 600, padding: "4px 12px", borderRadius: 100,
  },
  stockTag: {
    display: "inline-block", background: "#f0fdf4", color: "#15803d",
    fontSize: 11, fontWeight: 600, padding: "4px 12px", borderRadius: 100,
  },
  stockLow: { background: "#fffbeb", color: "#92400e" },
  priceRow: { marginBottom: 14 },
  price: { fontSize: 24, fontWeight: 800, color: PRIMARY, margin: 0, fontFamily: "'Space Grotesk','Inter',sans-serif" },
  cardActions: { display: "flex", gap: 8 },
  callBtn: {
    flex: 1, padding: "12px", borderRadius: 100, border: `1px solid #e5e5e5`,
    color: DARK, fontSize: 13, fontWeight: 600, textDecoration: "none", textAlign: "center",
    background: "transparent",
  },
  waBtn: {
    flex: 1, padding: "12px", borderRadius: 100,
    background: "#22c55e", color: "#fff", fontSize: 13, fontWeight: 600,
    textDecoration: "none", textAlign: "center", border: "none",
  },

  loadingWrap: { display: "flex", flexDirection: "column", alignItems: "center", gap: 14, padding: 80, color: "#737373" },
  spinner: { width: 32, height: 32, border: "3px solid #f5f5f5", borderTop: `3px solid ${ACCENT}`, borderRadius: "50%", animation: "spin 0.8s linear infinite" },
  emptyWrap: { textAlign: "center", padding: 80, color: "#a3a3a3" },

  /* Product Detail Modal */
  modalOverlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: 24, backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", animation: "fadeIn 0.2s ease" },
  modal: { background: "#fff", borderRadius: 28, maxWidth: 820, width: "100%", maxHeight: "90vh", overflow: "auto", position: "relative", boxShadow: "0 20px 80px rgba(0,0,0,0.2)", animation: "scaleIn 0.3s cubic-bezier(0.16,1,0.3,1)" },
  modalClose: { position: "absolute", top: 16, right: 18, background: "#f5f5f5", border: "none", borderRadius: "50%", width: 40, height: 40, fontSize: 16, fontWeight: 700, cursor: "pointer", color: "#525252", zIndex: 1, display: "flex", alignItems: "center", justifyContent: "center" },
  modalInner: { display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: 320 },
  modalImgWrap: { background: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center", minHeight: 320, borderRadius: "28px 0 0 28px", overflow: "hidden" },
  modalImg: { width: "100%", height: "100%", objectFit: "cover", minHeight: 320, maxHeight: 480 },
  modalImgPlaceholder: { fontSize: 72, color: "#d4d4d4" },
  modalBody: { padding: "40px 32px", display: "flex", flexDirection: "column", justifyContent: "center" },
  modalCat: { display: "inline-block", background: "#fffbeb", color: PRIMARY, fontSize: 11, fontWeight: 700, padding: "5px 14px", borderRadius: 100, marginBottom: 16, letterSpacing: 1, border: "1px solid #fde68a", alignSelf: "flex-start" },
  modalName: { fontSize: 26, fontWeight: 800, color: DARK, margin: "0 0 14px", lineHeight: 1.2, fontFamily: "'Space Grotesk','Inter',sans-serif" },
  modalDesc: { fontSize: 15, color: "#525252", lineHeight: 1.8, margin: "0 0 20px" },
  modalMeta: { display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 },
  modalPrice: { fontSize: 32, fontWeight: 800, color: PRIMARY, marginBottom: 24, fontFamily: "'Space Grotesk','Inter',sans-serif" },
  modalActions: { display: "flex", gap: 12, flexWrap: "wrap" },
  modalWaBtn: { flex: 1, padding: "14px 24px", borderRadius: 14, background: "#22c55e", color: "#fff", fontSize: 14, fontWeight: 700, textDecoration: "none", textAlign: "center", minWidth: 140 },
  modalCallBtn: { flex: 1, padding: "14px 24px", borderRadius: 14, border: `1px solid #e5e5e5`, color: DARK, fontSize: 14, fontWeight: 700, textDecoration: "none", textAlign: "center", background: "transparent", minWidth: 120 },
};
