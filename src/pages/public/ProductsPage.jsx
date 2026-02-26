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
      <div style={s.inner}>

        {/* Header */}
        <div style={s.header}>
          <div>
            <p style={s.label}>OUR CATALOGUE</p>
            <h1 style={s.title}>All Products</h1>
            <p style={s.subtitle}>{products.length} products available</p>
          </div>
        </div>

        {/* Filters */}
        <div style={s.filters}>
          <input
            style={s.search}
            placeholder="🔍 Search products..."
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

        {/* Grid */}
        {loading ? (
          <div style={s.loading}>Loading products…</div>
        ) : filtered.length === 0 ? (
          <div style={s.empty}>No products found. Try a different search.</div>
        ) : (
          <div style={s.grid}>
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
                  <p style={s.price}>
                    {p.price ? `₹${Number(p.price).toLocaleString("en-IN")}` : "Get Latest Price"}
                  </p>
                  <div style={s.cardActions}>
                    <a href="tel:+977XXXXXXXX" style={s.callBtn}>📞 Call Now</a>
                    <a href="https://wa.me/977XXXXXXXXXX" target="_blank" rel="noreferrer" style={s.waBtn}>💬 WhatsApp</a>
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

const s = {
  page: { background: "#f8fafc", minHeight: "100vh", fontFamily: "'Segoe UI', sans-serif" },
  inner: { maxWidth: 1200, margin: "0 auto", padding: "40px 24px" },
  header: { marginBottom: 28 },
  label: { fontSize: 11, fontWeight: 800, letterSpacing: 2, color: "#0ea5e9", textTransform: "uppercase", margin: 0 },
  title: { fontSize: 32, fontWeight: 800, color: "#0f172a", margin: "4px 0 4px" },
  subtitle: { color: "#64748b", fontSize: 14, margin: 0 },
  filters: { marginBottom: 28, display: "flex", flexDirection: "column", gap: 12 },
  search: { padding: "10px 14px", borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 14, outline: "none", maxWidth: 400 },
  cats: { display: "flex", gap: 8, flexWrap: "wrap" },
  catBtn: { padding: "6px 16px", borderRadius: 20, border: "1.5px solid #e2e8f0", fontSize: 13, fontWeight: 600, cursor: "pointer", background: "#fff", color: "#475569" },
  catActive: { background: "#0ea5e9", color: "#fff", border: "1.5px solid #0ea5e9" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px,1fr))", gap: 24 },
  card: { background: "#fff", borderRadius: 14, overflow: "hidden", boxShadow: "0 2px 10px rgba(0,0,0,0.07)" },
  imgWrap: { position: "relative", height: 200, background: "#f1f5f9" },
  img: { width: "100%", height: "100%", objectFit: "cover" },
  imgPlaceholder: { display: "flex", alignItems: "center", justifyContent: "center", height: "100%", fontSize: 52 },
  badge: { position: "absolute", top: 10, right: 10, background: "#0ea5e9", color: "#fff", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20 },
  cardBody: { padding: "16px" },
  name: { fontSize: 15, fontWeight: 700, color: "#0f172a", margin: "0 0 6px" },
  desc: { fontSize: 12, color: "#64748b", margin: "0 0 8px", lineHeight: 1.5 },
  price: { fontSize: 18, fontWeight: 700, color: "#0ea5e9", margin: "0 0 12px" },
  cardActions: { display: "flex", gap: 8 },
  callBtn: { flex: 1, padding: "8px", borderRadius: 8, border: "1.5px solid #0ea5e9", color: "#0ea5e9", fontSize: 13, fontWeight: 600, textDecoration: "none", textAlign: "center" },
  waBtn: { flex: 1, padding: "8px", borderRadius: 8, background: "#dcfce7", color: "#16a34a", fontSize: 13, fontWeight: 600, textDecoration: "none", textAlign: "center" },
  loading: { textAlign: "center", padding: 60, color: "#64748b" },
  empty: { textAlign: "center", padding: 60, color: "#94a3b8", fontSize: 15 },
};
