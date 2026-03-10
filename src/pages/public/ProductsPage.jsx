import { useState, useRef, useEffect } from "react";
import { useProducts } from "../../hooks/useProducts";

/* Animated counter hook */
function useCounter(end, duration = 1800) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const num = parseInt(end) || 0;
    if (!num) return;
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      obs.disconnect();
      const start = performance.now();
      const step = (now) => {
        const p = Math.min((now - start) / duration, 1);
        setVal(Math.floor(p * num));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [end, duration]);
  return [val, ref];
}

export default function ProductsPage() {
  const { products, loading } = useProducts();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [selected, setSelected] = useState(null);
  const [view, setView] = useState("grid");

  const categories = ["All", ...new Set(products.map(p => p.category).filter(Boolean))];

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.category || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.description || "").toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "All" || p.category === category;
    return matchSearch && matchCat;
  });

  const [countProducts, countRef] = useCounter(products.length);
  const catCount = new Set(products.map(p => p.category).filter(Boolean)).size;

  return (
    <div style={s.page}>
      {/* Hero Header */}
      <div style={s.hero}>
        <div style={s.heroOverlay} />
        <div style={s.heroGrid} />
        <div style={s.heroInner}>
          <span style={s.heroBadge}>⚙ PRODUCT CATALOGUE</span>
          <h1 className="page-title" style={s.heroTitle}>Heavy Equipment<br /><span style={{ color: "#f59e0b" }}>Parts & Spares</span></h1>
          <p style={s.heroDesc}>
            Browse our extensive inventory of genuine parts and equipment for all major heavy machinery brands — sourced directly from OEM and trusted aftermarket manufacturers.
          </p>
          <div ref={countRef} style={s.heroStats}>
            {[
              { n: countProducts + "+", l: "Products Available" },
              { n: catCount + "+", l: "Categories" },
              { n: "50+", l: "Brands Covered" },
            ].map(st => (
              <div key={st.l} style={s.heroStat}>
                <div style={s.heroStatNum}>{st.n}</div>
                <div style={s.heroStatLabel}>{st.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={s.contentWrap}>
        {/* Filters Bar */}
        <div className="products-filters" style={s.filterBar}>
          <div style={s.filterTop}>
            <div style={s.searchWrap}>
              <span style={s.searchIcon}>🔍</span>
              <input className="products-search" style={s.search}
                placeholder="Search parts by name, model, or category..."
                value={search} onChange={e => setSearch(e.target.value)} />
              {search && (
                <button style={s.clearBtn} onClick={() => setSearch("")}>✕</button>
              )}
            </div>
            <div style={s.viewToggle}>
              <button style={{ ...s.viewBtn, ...(view === "grid" ? s.viewActive : {}) }} onClick={() => setView("grid")} title="Grid view">▦</button>
              <button style={{ ...s.viewBtn, ...(view === "list" ? s.viewActive : {}) }} onClick={() => setView("list")} title="List view">☰</button>
            </div>
          </div>
          <div style={s.cats}>
            {categories.map(c => {
              const count = c === "All" ? products.length : products.filter(p => p.category === c).length;
              return (
                <button key={c} style={{ ...s.catBtn, ...(category === c ? s.catActive : {}) }}
                  onClick={() => setCategory(c)}>
                  {c} <span style={{ opacity: 0.6, marginLeft: 4, fontSize: 11 }}>({count})</span>
                </button>
              );
            })}
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
            <span style={{ fontSize: 15, fontWeight: 500 }}>Loading inventory...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div style={s.emptyWrap}>
            <div style={s.emptyIcon}>🔍</div>
            <h3 style={s.emptyTitle}>No Products Found</h3>
            <p style={s.emptyDesc}>
              {search
                ? <>No results for &quot;<strong>{search}</strong>&quot;. Try a different search term or category.</>
                : "No products in this category yet. Check back soon!"}
            </p>
            {(search || category !== "All") && (
              <button style={s.emptyBtn} onClick={() => { setSearch(""); setCategory("All"); }}>
                Clear All Filters
              </button>
            )}
          </div>
        ) : (
          <div className="products-grid" style={view === "list" ? s.listGrid : s.grid}>
            {filtered.map(p => (
              view === "list" ? (
                <div key={p.id} className="product-card" style={s.listCard} onClick={() => setSelected(p)} role="button" tabIndex={0}>
                  <div style={s.listImgWrap}>
                    {p.image
                      ? <img src={p.image} alt={p.name} style={s.listImg} loading="lazy" />
                      : <div style={s.listImgPlaceholder}>⚙️</div>}
                  </div>
                  <div style={s.listBody}>
                    <div style={s.listTop}>
                      <div style={{ flex: 1 }}>
                        {p.category && <span style={s.listCatBadge}>{p.category}</span>}
                        <h3 style={s.listName}>{p.name}</h3>
                        {p.description && <p style={s.listDesc}>{p.description}</p>}
                      </div>
                      <div style={s.listRight}>
                        <p style={s.listPrice}>
                          {p.price ? `Rs ${Number(p.price).toLocaleString("en-IN")}` : "Get Price"}
                        </p>
                        {p.quantity !== undefined && (
                          <span style={{
                            ...s.stockTag,
                            ...(p.quantity < 5 && p.quantity > 0 ? s.stockLow : {}),
                            ...(p.quantity <= 0 ? s.stockOut : {}),
                          }}>
                            {p.quantity <= 0 ? "Out of Stock" : `${p.quantity} in stock`}
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={s.listActions}>
                      <a href="tel:+9779851068337" style={s.callBtn} onClick={e => e.stopPropagation()}>📞 Call</a>
                      <a href={`https://wa.me/9779851068337?text=${encodeURIComponent(`Hi, I'd like to inquire about: ${p.name}`)}`}
                        target="_blank" rel="noreferrer" style={s.waBtn} onClick={e => e.stopPropagation()}>💬 WhatsApp</a>
                    </div>
                  </div>
                </div>
              ) : (
                <div key={p.id} className="product-card" style={s.card} onClick={() => setSelected(p)} role="button" tabIndex={0}>
                  <div style={s.imgWrap}>
                    {p.image
                      ? <img src={p.image} alt={p.name} style={s.img} loading="lazy" />
                      : <div style={s.imgPlaceholder}>⚙️</div>}
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
                    <div style={s.cardMeta}>
                      {p.unit && <span style={s.unitTag}>📦 {p.unit}</span>}
                      {p.quantity !== undefined && p.quantity > 0 && (
                        <span style={{ ...s.stockTagSmall, ...(p.quantity < 5 ? s.stockLow : {}) }}>
                          {p.quantity} in stock
                        </span>
                      )}
                    </div>
                    <div style={s.priceRow}>
                      <p style={s.price}>
                        {p.price ? `Rs ${Number(p.price).toLocaleString("en-IN")}` : "Get Latest Price"}
                      </p>
                    </div>
                    <div className="product-card-actions" style={s.cardActions}>
                      <a href="tel:+9779851068337" style={s.callBtn} onClick={e => e.stopPropagation()}>📞 Call</a>
                      <a href={`https://wa.me/9779851068337?text=${encodeURIComponent(`Hi, I'd like to inquire about: ${p.name}`)}`}
                        target="_blank" rel="noreferrer" style={s.waBtn} onClick={e => e.stopPropagation()}>💬 WhatsApp</a>
                    </div>
                  </div>
                </div>
              )
            ))}
          </div>
        )}
      </div>

      {/* Floating WhatsApp Button */}
      <a href="https://wa.me/9779851068337?text=Hi%2C%20I%20need%20heavy%20equipment%20parts.%20Can%20you%20help%3F"
        target="_blank" rel="noreferrer" className="floating-wa-btn" style={s.floatingWa}>
        💬
      </a>

      {/* ── Product Detail Modal ── */}
      {selected && (
        <div style={s.modalOverlay} onClick={() => setSelected(null)}>
          <div className="product-modal" style={s.modal} onClick={e => e.stopPropagation()}>
            <button style={s.modalClose} onClick={() => setSelected(null)}>✕</button>
            <div className="product-modal-inner" style={s.modalInner}>
              <div style={s.modalImgWrap}>
                {selected.image
                  ? <img src={selected.image} alt={selected.name} style={s.modalImg} />
                  : <div style={s.modalImgPlaceholder}>⚙️</div>}
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
                  {selected.price ? `Rs ${Number(selected.price).toLocaleString("en-IN")}` : "Contact for Price"}
                </div>
                <div style={s.modalActions}>
                  <a href={`https://wa.me/9779851068337?text=${encodeURIComponent(`Hi, I'd like to inquire about: ${selected.name}${selected.price ? ` (Rs${selected.price})` : ""}. Please share availability and pricing details.`)}`}
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
    position: "relative", background: `linear-gradient(135deg, ${DARK} 0%, ${STEEL} 100%)`,
    padding: "100px 32px 100px", overflow: "hidden",
  },
  heroOverlay: {
    position: "absolute", inset: 0,
    background: "radial-gradient(circle at 20% 80%, rgba(217,119,6,0.08) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(217,119,6,0.04) 0%, transparent 50%)",
  },
  heroGrid: {
    position: "absolute", inset: 0, opacity: 0.03,
    backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
    backgroundSize: "60px 60px",
  },
  heroInner: { position: "relative", maxWidth: 1280, margin: "0 auto" },
  heroBadge: {
    display: "inline-block", background: "rgba(217,119,6,0.1)", color: "#f59e0b",
    fontSize: 11, fontWeight: 700, padding: "8px 20px", borderRadius: 100,
    letterSpacing: 3, marginBottom: 24, border: "1px solid rgba(217,119,6,0.2)",
  },
  heroTitle: { fontSize: 52, fontWeight: 800, color: "#fff", margin: "0 0 20px", lineHeight: 1.1, letterSpacing: "-0.03em", fontFamily: "'Space Grotesk','Inter',sans-serif" },
  heroDesc: { fontSize: 17, color: "#a3a3a3", lineHeight: 1.8, maxWidth: 640, margin: "0 0 40px" },
  heroStats: { display: "flex", gap: 16, flexWrap: "wrap" },
  heroStat: {
    background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 20, padding: "20px 28px", minWidth: 130, textAlign: "center",
    backdropFilter: "blur(8px)",
  },
  heroStatNum: { fontSize: 30, fontWeight: 800, color: "#f59e0b", letterSpacing: -1, fontFamily: "'Space Grotesk','Inter',sans-serif" },
  heroStatLabel: { fontSize: 11, color: "#737373", fontWeight: 600, marginTop: 4, letterSpacing: 1, textTransform: "uppercase" },

  contentWrap: { maxWidth: 1280, margin: "0 auto", padding: "32px 32px 80px" },

  filterBar: {
    background: "#fff", borderRadius: 20, padding: "24px 28px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 32px rgba(0,0,0,0.04)",
    border: "1px solid #f0f0f0", marginBottom: 24, marginTop: -48,
    position: "relative", zIndex: 10,
    display: "flex", flexDirection: "column", gap: 16,
  },
  filterTop: { display: "flex", gap: 12, alignItems: "center" },
  searchWrap: { position: "relative", flex: 1, maxWidth: 520 },
  searchIcon: { position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", fontSize: 15, opacity: 0.4, pointerEvents: "none" },
  search: {
    width: "100%", padding: "13px 40px 13px 44px", borderRadius: 14,
    border: "1.5px solid #e5e5e5", fontSize: 15, outline: "none",
    background: "#fafafa", boxSizing: "border-box",
    transition: "all 0.3s cubic-bezier(0.16,1,0.3,1)",
  },
  clearBtn: {
    position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
    background: "#e5e5e5", border: "none", borderRadius: "50%", width: 24, height: 24,
    fontSize: 11, cursor: "pointer", color: "#525252", display: "flex", alignItems: "center", justifyContent: "center",
  },
  viewToggle: { display: "flex", gap: 4, background: "#f5f5f5", borderRadius: 12, padding: 4 },
  viewBtn: {
    padding: "8px 12px", borderRadius: 8, border: "none", cursor: "pointer",
    fontSize: 16, background: "transparent", color: "#737373", lineHeight: 1,
  },
  viewActive: { background: "#fff", color: DARK, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" },
  cats: { display: "flex", gap: 8, flexWrap: "wrap" },
  catBtn: {
    padding: "8px 20px", borderRadius: 100, border: "1.5px solid #e5e5e5",
    fontSize: 13, fontWeight: 600, cursor: "pointer", background: "#fff", color: "#525252",
    transition: "all 0.3s cubic-bezier(0.16,1,0.3,1)", letterSpacing: 0.3,
  },
  catActive: { background: DARK, color: "#fff", border: `1.5px solid ${DARK}` },

  resultBar: { marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center" },
  resultCount: { fontSize: 13, color: "#737373", fontWeight: 500 },

  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px,1fr))", gap: 24 },

  listGrid: { display: "flex", flexDirection: "column", gap: 16 },
  listCard: {
    background: "#fff", borderRadius: 20, overflow: "hidden",
    boxShadow: "0 1px 3px rgba(0,0,0,0.03)", border: "1px solid #f0f0f0",
    display: "flex", cursor: "pointer",
    transition: "all 0.4s cubic-bezier(0.16,1,0.3,1)",
  },
  listImgWrap: { width: 200, minHeight: 140, background: "#f5f5f5", flexShrink: 0 },
  listImg: { width: "100%", height: "100%", objectFit: "cover" },
  listImgPlaceholder: { display: "flex", alignItems: "center", justifyContent: "center", height: "100%", fontSize: 40, color: "#d4d4d4" },
  listBody: { padding: "20px 24px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" },
  listTop: { display: "flex", gap: 20, marginBottom: 12 },
  listCatBadge: { display: "inline-block", background: "#fffbeb", color: PRIMARY, fontSize: 10, fontWeight: 700, padding: "3px 12px", borderRadius: 100, marginBottom: 8, letterSpacing: 0.5, border: "1px solid #fde68a" },
  listName: { fontSize: 17, fontWeight: 700, color: DARK, margin: "0 0 6px" },
  listDesc: { fontSize: 14, color: "#737373", margin: 0, lineHeight: 1.6 },
  listRight: { textAlign: "right", flexShrink: 0 },
  listPrice: { fontSize: 22, fontWeight: 800, color: PRIMARY, margin: "0 0 8px", fontFamily: "'Space Grotesk','Inter',sans-serif" },
  listActions: { display: "flex", gap: 8 },

  card: {
    background: "#fff", borderRadius: 24, overflow: "hidden",
    boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
    border: "1px solid #f0f0f0", transition: "all 0.5s cubic-bezier(0.16,1,0.3,1)",
    display: "flex", flexDirection: "column",
  },
  imgWrap: { position: "relative", height: 230, background: "#f5f5f5", overflow: "hidden" },
  img: { width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s cubic-bezier(0.16,1,0.3,1)" },
  imgPlaceholder: {
    display: "flex", alignItems: "center", justifyContent: "center",
    height: "100%", fontSize: 52, background: "linear-gradient(135deg, #f5f5f5 0%, #e5e5e5 100%)", color: "#d4d4d4",
  },
  catBadge: {
    position: "absolute", top: 14, left: 14, background: "rgba(10,10,10,0.85)", color: "#fff",
    fontSize: 10, fontWeight: 700, padding: "5px 14px", borderRadius: 100, letterSpacing: 0.5,
    backdropFilter: "blur(8px)",
  },
  lowBadge: {
    position: "absolute", top: 14, right: 14, background: "#fbbf24", color: "#78350f",
    fontSize: 10, fontWeight: 700, padding: "5px 12px", borderRadius: 100,
  },
  outBadge: {
    position: "absolute", top: 14, right: 14, background: "#dc2626", color: "#fff",
    fontSize: 10, fontWeight: 700, padding: "5px 12px", borderRadius: 100,
  },
  cardBody: { padding: "20px 22px 22px", display: "flex", flexDirection: "column", flex: 1 },
  name: { fontSize: 17, fontWeight: 700, color: DARK, margin: "0 0 6px", lineHeight: 1.3 },
  desc: { fontSize: 13, color: "#737373", margin: "0 0 12px", lineHeight: 1.7, flex: 1, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" },
  cardMeta: { display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 },
  unitTag: {
    display: "inline-block", background: "#fffbeb", color: "#92400e",
    fontSize: 11, fontWeight: 600, padding: "4px 12px", borderRadius: 100,
  },
  stockTag: {
    display: "inline-block", background: "#f0fdf4", color: "#15803d",
    fontSize: 11, fontWeight: 600, padding: "4px 12px", borderRadius: 100,
  },
  stockTagSmall: {
    display: "inline-block", background: "#f0fdf4", color: "#15803d",
    fontSize: 10, fontWeight: 600, padding: "3px 10px", borderRadius: 100,
  },
  stockLow: { background: "#fffbeb", color: "#92400e" },
  stockOut: { background: "#fef2f2", color: "#dc2626" },
  priceRow: { marginBottom: 14 },
  price: { fontSize: 22, fontWeight: 800, color: PRIMARY, margin: 0, fontFamily: "'Space Grotesk','Inter',sans-serif" },
  cardActions: { display: "flex", gap: 8 },
  callBtn: {
    flex: 1, padding: "11px", borderRadius: 12, border: "1.5px solid #e5e5e5",
    color: DARK, fontSize: 13, fontWeight: 600, textDecoration: "none", textAlign: "center",
    background: "#fff",
  },
  waBtn: {
    flex: 1, padding: "11px", borderRadius: 12,
    background: "#22c55e", color: "#fff", fontSize: 13, fontWeight: 600,
    textDecoration: "none", textAlign: "center", border: "none",
  },

  loadingWrap: { display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: "100px 32px", color: "#737373" },
  spinner: { width: 40, height: 40, border: "3px solid #f5f5f5", borderTop: `3px solid ${ACCENT}`, borderRadius: "50%", animation: "spin 0.8s linear infinite" },
  emptyWrap: { textAlign: "center", padding: "80px 32px", background: "#fff", borderRadius: 24, border: "1px solid #f0f0f0" },
  emptyIcon: { fontSize: 56, marginBottom: 16, filter: "grayscale(0.3)" },
  emptyTitle: { margin: "0 0 10px", color: DARK, fontSize: 22, fontWeight: 700, fontFamily: "'Space Grotesk','Inter',sans-serif" },
  emptyDesc: { margin: "0 0 24px", color: "#737373", fontSize: 15, lineHeight: 1.7, maxWidth: 400, marginLeft: "auto", marginRight: "auto" },
  emptyBtn: {
    padding: "12px 28px", borderRadius: 12, background: DARK, color: "#fff",
    border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer",
  },

  floatingWa: {
    position: "fixed", bottom: 28, right: 28, width: 60, height: 60, borderRadius: "50%",
    background: "#22c55e", color: "#fff", fontSize: 28, display: "flex", alignItems: "center",
    justifyContent: "center", boxShadow: "0 4px 20px rgba(34,197,94,0.4)",
    textDecoration: "none", zIndex: 999,
  },

  modalOverlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: 24, backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", animation: "fadeIn 0.2s ease" },
  modal: { background: "#fff", borderRadius: 28, maxWidth: 860, width: "100%", maxHeight: "90vh", overflow: "auto", position: "relative", boxShadow: "0 24px 80px rgba(0,0,0,0.25)", animation: "scaleIn 0.3s cubic-bezier(0.16,1,0.3,1)" },
  modalClose: { position: "absolute", top: 16, right: 18, background: "rgba(0,0,0,0.05)", border: "none", borderRadius: "50%", width: 40, height: 40, fontSize: 16, fontWeight: 700, cursor: "pointer", color: "#525252", zIndex: 1, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" },
  modalInner: { display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: 360 },
  modalImgWrap: { background: "linear-gradient(135deg, #f5f5f5, #e5e5e5)", display: "flex", alignItems: "center", justifyContent: "center", minHeight: 360, borderRadius: "28px 0 0 28px", overflow: "hidden" },
  modalImg: { width: "100%", height: "100%", objectFit: "cover", minHeight: 360, maxHeight: 500 },
  modalImgPlaceholder: { fontSize: 80, color: "#d4d4d4" },
  modalBody: { padding: "40px 36px", display: "flex", flexDirection: "column", justifyContent: "center" },
  modalCat: { display: "inline-block", background: "#fffbeb", color: PRIMARY, fontSize: 11, fontWeight: 700, padding: "5px 14px", borderRadius: 100, marginBottom: 16, letterSpacing: 1, border: "1px solid #fde68a", alignSelf: "flex-start" },
  modalName: { fontSize: 28, fontWeight: 800, color: DARK, margin: "0 0 14px", lineHeight: 1.2, fontFamily: "'Space Grotesk','Inter',sans-serif" },
  modalDesc: { fontSize: 15, color: "#525252", lineHeight: 1.8, margin: "0 0 20px" },
  modalMeta: { display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 },
  modalPrice: { fontSize: 34, fontWeight: 800, color: PRIMARY, marginBottom: 24, fontFamily: "'Space Grotesk','Inter',sans-serif" },
  modalActions: { display: "flex", gap: 12, flexWrap: "wrap" },
  modalWaBtn: { flex: 1, padding: "14px 24px", borderRadius: 14, background: "#22c55e", color: "#fff", fontSize: 14, fontWeight: 700, textDecoration: "none", textAlign: "center", minWidth: 140 },
  modalCallBtn: { flex: 1, padding: "14px 24px", borderRadius: 14, border: "1.5px solid #e5e5e5", color: DARK, fontSize: 14, fontWeight: 700, textDecoration: "none", textAlign: "center", background: "#fafafa", minWidth: 120 },
};
