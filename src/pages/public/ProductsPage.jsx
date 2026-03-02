import { useState } from "react";
import { useProducts } from "../../hooks/useProducts";

export default function ProductsPage() {
  const { products, loading } = useProducts();
  const [search,   setSearch]   = useState("");
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
      {/* Page Header */}
      <div style={s.pageHeader}>
        <div style={s.headerInner}>
          <p style={s.label}>OUR CATALOGUE</p>
          <h1 style={s.title}>All Products</h1>
          <p style={s.subtitle}>{products.length} products available for your heavy machinery needs</p>
        </div>
      </div>

      <div style={s.inner}>
        {/* Filters */}
        <div className="products-filters" style={s.filters}>
          <input
            className="products-search" style={s.search}
            placeholder="Search products by name or category..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <div style={s.cats}>
            {categories.map(c => (
              <button key={c} style={{ ...s.catBtn, ...(category === c ? s.catActive : {}) }}
                onClick={() => setCategory(c)}>{c}</button>
            ))}
          </div>
        </div>

        {/* Results count */}
        {!loading && (
          <p style={s.resultCount}>
            Showing {filtered.length} of {products.length} products
            {category !== "All" && <> in <strong>{category}</strong></>}
          </p>
        )}

        {/* Grid */}
        {loading ? (
          <div style={s.loading}>
            <div style={s.spinner} />
            <span>Loading products…</span>
          </div>
        ) : filtered.length === 0 ? (
          <div style={s.empty}>
            <div style={{ fontSize: 48 }}>🔍</div>
            <p style={{ marginTop: 12 }}>No products found. Try a different search or category.</p>
          </div>
        ) : (
          <div className="products-grid" style={s.grid}>
            {filtered.map(p => (
              <div key={p.id} style={s.card}>
                <div style={s.imgWrap}>
                  {p.image
                    ? <img src={p.image} alt={p.name} style={s.img} />
                    : <div style={s.imgPlaceholder}>⚙️</div>
                  }
                  {p.category && <span style={s.badge}>{p.category}</span>}
                </div>
                <div style={s.cardBody}>
                  <h3 style={s.name}>{p.name}</h3>
                  {p.description && <p style={s.desc}>{p.description}</p>}
                  {p.unit && <span style={s.unitTag}>📦 per {p.unit}</span>}
                  <p style={s.price}>
                    {p.price ? `₹${Number(p.price).toLocaleString("en-IN")}` : "Get Latest Price"}
                  </p>
                  <div className="product-card-actions" style={s.cardActions}>
                    <a href="tel:+9779851068337" style={s.callBtn}>📞 Call Now</a>
                    <a href="https://wa.me/9779851068337" target="_blank" rel="noreferrer" style={s.waBtn}>💬 WhatsApp</a>
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

const s = {
  page: { background: "#fafafa", minHeight: "100vh", fontFamily: "'Inter', 'Segoe UI', sans-serif" },
  pageHeader: {
    background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
    padding: "48px 24px 52px", color: "#fff",
  },
  headerInner: { maxWidth: 1200, margin: "0 auto" },
  label: { fontSize: 12, fontWeight: 800, letterSpacing: 3, color: "#f97316", textTransform: "uppercase", margin: 0 },
  title: { fontSize: 36, fontWeight: 800, color: "#fff", margin: "8px 0 8px", letterSpacing: "-0.01em" },
  subtitle: { color: "#94a3b8", fontSize: 15, margin: 0 },
  inner: { maxWidth: 1200, margin: "0 auto", padding: "28px 24px 48px" },
  filters: { marginBottom: 8, display: "flex", flexDirection: "column", gap: 14 },
  search: {
    padding: "12px 16px", borderRadius: 10,
    border: "1.5px solid #e2e8f0", fontSize: 14, outline: "none",
    maxWidth: 440, background: "#fff",
    transition: "border-color 0.2s ease",
  },
  cats: { display: "flex", gap: 8, flexWrap: "wrap" },
  catBtn: {
    padding: "7px 18px", borderRadius: 20, border: "1.5px solid #e2e8f0",
    fontSize: 13, fontWeight: 600, cursor: "pointer", background: "#fff", color: "#475569",
    transition: "all 0.2s ease",
  },
  catActive: { background: PRIMARY, color: "#fff", border: `1.5px solid ${PRIMARY}` },
  resultCount: { fontSize: 13, color: "#94a3b8", marginBottom: 20, fontWeight: 500 },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px,1fr))", gap: 24 },
  card: {
    background: "#fff", borderRadius: 16, overflow: "hidden",
    boxShadow: "0 1px 4px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)",
    border: "1px solid #f1f5f9", transition: "all 0.3s ease",
  },
  imgWrap: { position: "relative", height: 200, background: "#f8fafc" },
  img: { width: "100%", height: "100%", objectFit: "cover" },
  imgPlaceholder: { display: "flex", alignItems: "center", justifyContent: "center", height: "100%", fontSize: 52, background: "#f8fafc" },
  badge: { position: "absolute", top: 12, right: 12, background: PRIMARY, color: "#fff", fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 20 },
  cardBody: { padding: "16px 18px 18px" },
  name: { fontSize: 15, fontWeight: 700, color: "#0f172a", margin: "0 0 6px" },
  desc: { fontSize: 13, color: "#64748b", margin: "0 0 8px", lineHeight: 1.5 },
  unitTag: { display: "inline-block", background: "#fff7ed", color: "#c2410c", fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 6, marginBottom: 10 },
  price: { fontSize: 20, fontWeight: 800, color: PRIMARY, margin: "0 0 14px" },
  cardActions: { display: "flex", gap: 8 },
  callBtn: { flex: 1, padding: "9px", borderRadius: 8, border: `1.5px solid ${PRIMARY}`, color: PRIMARY, fontSize: 13, fontWeight: 600, textDecoration: "none", textAlign: "center", transition: "all 0.2s ease" },
  waBtn: { flex: 1, padding: "9px", borderRadius: 8, background: "#dcfce7", color: "#16a34a", fontSize: 13, fontWeight: 600, textDecoration: "none", textAlign: "center", transition: "all 0.2s ease" },
  loading: { display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: 60, color: "#64748b" },
  spinner: { width: 32, height: 32, border: "3px solid #e2e8f0", borderTop: `3px solid ${PRIMARY}`, borderRadius: "50%", animation: "spin 0.8s linear infinite" },
  empty: { textAlign: "center", padding: 60, color: "#94a3b8", fontSize: 15 },
};
