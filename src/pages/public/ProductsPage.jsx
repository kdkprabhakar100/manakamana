import { useState } from "react";
import { useProducts } from "../../hooks/useProducts";

export default function ProductsPage() {
  const { products, loading } = useProducts();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

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
              <div key={p.id} style={s.card}>
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
                    <a href="tel:+9779851068337" style={s.callBtn}>&#128222; Call Now</a>
                    <a href="https://wa.me/9779851068337" target="_blank" rel="noreferrer" style={s.waBtn}>&#128172; WhatsApp</a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const PRIMARY = "#ea580c";
const DARK = "#0f172a";
const STEEL = "#1e293b";

const s = {
  page: { background: "#f8fafc", minHeight: "100vh", fontFamily: "'Inter','Segoe UI',sans-serif" },

  hero: {
    position: "relative", background: `linear-gradient(135deg, ${DARK} 0%, ${STEEL} 50%, #0c1829 100%)`,
    padding: "56px 24px 52px", overflow: "hidden",
  },
  heroOverlay: {
    position: "absolute", inset: 0, opacity: 0.04,
    backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,0.05) 35px, rgba(255,255,255,0.05) 36px)",
  },
  heroInner: { position: "relative", maxWidth: 1200, margin: "0 auto" },
  heroBadge: {
    display: "inline-block", background: "rgba(249,115,22,0.12)", color: "#f97316",
    fontSize: 11, fontWeight: 700, padding: "6px 16px", borderRadius: 20,
    letterSpacing: 2, marginBottom: 16, border: "1px solid rgba(249,115,22,0.2)",
  },
  heroTitle: { fontSize: 38, fontWeight: 900, color: "#fff", margin: "0 0 12px", lineHeight: 1.15 },
  heroDesc: { fontSize: 15, color: "#94a3b8", lineHeight: 1.7, maxWidth: 640, margin: 0 },

  contentWrap: { maxWidth: 1200, margin: "0 auto", padding: "28px 24px 56px" },

  filterBar: {
    background: "#fff", borderRadius: 16, padding: "20px 22px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)",
    border: "1px solid #f1f5f9", marginBottom: 20,
    display: "flex", flexDirection: "column", gap: 14,
  },
  searchWrap: { position: "relative", maxWidth: 480 },
  searchIcon: { position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 16, opacity: 0.4 },
  search: {
    width: "100%", padding: "12px 16px 12px 40px", borderRadius: 10,
    border: "1.5px solid #e2e8f0", fontSize: 14, outline: "none",
    background: "#f8fafc", boxSizing: "border-box",
  },
  cats: { display: "flex", gap: 8, flexWrap: "wrap" },
  catBtn: {
    padding: "7px 18px", borderRadius: 20, border: "1.5px solid #e2e8f0",
    fontSize: 13, fontWeight: 600, cursor: "pointer", background: "#fff", color: "#475569",
    transition: "all 0.2s ease",
  },
  catActive: { background: PRIMARY, color: "#fff", border: `1.5px solid ${PRIMARY}` },

  resultBar: { marginBottom: 16 },
  resultCount: { fontSize: 13, color: "#64748b", fontWeight: 500 },

  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px,1fr))", gap: 22 },

  card: {
    background: "#fff", borderRadius: 16, overflow: "hidden",
    boxShadow: "0 1px 4px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)",
    border: "1px solid #f1f5f9", transition: "all 0.3s ease",
    display: "flex", flexDirection: "column",
  },
  imgWrap: { position: "relative", height: 210, background: "#f1f5f9" },
  img: { width: "100%", height: "100%", objectFit: "cover" },
  imgPlaceholder: {
    display: "flex", alignItems: "center", justifyContent: "center",
    height: "100%", fontSize: 52, background: STEEL, color: "#475569",
  },
  catBadge: {
    position: "absolute", top: 12, left: 12, background: DARK, color: "#fff",
    fontSize: 10, fontWeight: 700, padding: "4px 12px", borderRadius: 20, letterSpacing: 0.5,
  },
  lowBadge: {
    position: "absolute", top: 12, right: 12, background: "#fbbf24", color: "#78350f",
    fontSize: 10, fontWeight: 700, padding: "4px 10px", borderRadius: 20,
  },
  outBadge: {
    position: "absolute", top: 12, right: 12, background: "#ef4444", color: "#fff",
    fontSize: 10, fontWeight: 700, padding: "4px 10px", borderRadius: 20,
  },
  cardBody: { padding: "16px 18px 20px", display: "flex", flexDirection: "column", flex: 1 },
  name: { fontSize: 16, fontWeight: 700, color: DARK, margin: "0 0 6px" },
  desc: { fontSize: 13, color: "#64748b", margin: "0 0 10px", lineHeight: 1.5, flex: 1 },
  meta: { display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 },
  unitTag: {
    display: "inline-block", background: "#fff7ed", color: "#c2410c",
    fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 6,
  },
  stockTag: {
    display: "inline-block", background: "#f0fdf4", color: "#15803d",
    fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 6,
  },
  stockLow: { background: "#fffbeb", color: "#b45309" },
  priceRow: { marginBottom: 12 },
  price: { fontSize: 22, fontWeight: 900, color: PRIMARY, margin: 0 },
  cardActions: { display: "flex", gap: 8 },
  callBtn: {
    flex: 1, padding: "10px", borderRadius: 8, border: `1.5px solid ${DARK}`,
    color: DARK, fontSize: 13, fontWeight: 600, textDecoration: "none", textAlign: "center",
    background: "transparent",
  },
  waBtn: {
    flex: 1, padding: "10px", borderRadius: 8,
    background: "#22c55e", color: "#fff", fontSize: 13, fontWeight: 600,
    textDecoration: "none", textAlign: "center", border: "none",
  },

  loadingWrap: { display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: 60, color: "#64748b" },
  spinner: { width: 32, height: 32, border: "3px solid #e2e8f0", borderTop: `3px solid ${PRIMARY}`, borderRadius: "50%", animation: "spin 0.8s linear infinite" },
  emptyWrap: { textAlign: "center", padding: 60, color: "#94a3b8" },
};
