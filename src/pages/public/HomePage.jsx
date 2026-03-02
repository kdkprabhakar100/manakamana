import { Link } from "react-router-dom";
import { useProducts } from "../../hooks/useProducts";

export default function HomePage() {
  const { products, loading } = useProducts();

  return (
    <div style={s.page}>

      {/* ── Hero ── */}
      <section style={s.hero}>
        <div style={s.heroOverlay} />
        <div className="hero-inner" style={s.heroInner}>
          <div style={s.heroLeft}>
            <div className="hero-badge" style={s.heroBadge}>⚙️ Nepal's Trusted Heavy Equipment Supplier</div>
            <h1 className="hero-title" style={s.heroTitle}>
              Power Your<br />
              <span style={s.heroAccent}>Construction</span> Projects
            </h1>
            <p className="hero-desc" style={s.heroDesc}>
              Premium quality spare parts and components for excavators, bulldozers,
              cranes, and all heavy machinery. Serving Nepal's infrastructure since day one.
            </p>
            <div className="hero-btns" style={s.heroBtns}>
              <Link to="/products" style={s.heroBtnPrimary}>Browse Products →</Link>
              <Link to="/contact"  style={s.heroBtnSecondary}>Get a Quote</Link>
            </div>
          </div>
          <div className="hero-right" style={s.heroRight}>
            {[
              { icon:"⚙️",  val:"5000+", label:"Parts in Stock" },
              { icon:"🏗️", val:"200+",  label:"Happy Clients" },
              { icon:"🚚",  val:"Fast",  label:"Delivery Nepal-wide" },
              { icon:"✅",  val:"100%",  label:"Genuine Parts" },
            ].map(c => (
              <div key={c.label} className="hero-card" style={s.heroCard}>
                <div style={s.heroCardIcon}>{c.icon}</div>
                <div className="hero-card-val" style={s.heroCardVal}>{c.val}</div>
                <div className="hero-card-label" style={s.heroCardLabel}>{c.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why choose us ── */}
      <section style={s.section}>
        <div style={s.sectionInner}>
          <p style={s.sectionLabel}>WHY CHOOSE US</p>
          <h2 className="section-title" style={s.sectionTitle}>Built for Nepal's Toughest Jobs</h2>
          <div style={s.featureGrid}>
            {[
              { icon:"🔧", title:"Genuine OEM Parts",   desc:"All parts sourced directly from certified manufacturers ensuring quality and compatibility." },
              { icon:"💰", title:"Best Market Price",   desc:"Competitive pricing with no compromise on quality. Best value for your investment." },
              { icon:"⚡", title:"Quick Availability",  desc:"Large inventory means most parts are available immediately for urgent repairs." },
              { icon:"🤝", title:"Expert Consultation", desc:"Our team helps you find the exact right part for your specific machine and model." },
            ].map(f => (
              <div key={f.title} style={s.featureCard}>
                <div style={s.featureIcon}>{f.icon}</div>
                <h3 style={s.featureTitle}>{f.title}</h3>
                <p style={s.featureDesc}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Products section ── */}
      <section style={{ ...s.section, background: "#fafafa" }}>
        <div style={s.sectionInner}>
          <p style={s.sectionLabel}>OUR CATALOGUE</p>
          <h2 className="section-title" style={s.sectionTitle}>Our Products</h2>

          {loading ? (
            <div style={s.loadingRow}>
              <div style={s.spinner} />
              <span>Loading products…</span>
            </div>

          ) : products.length === 0 ? (
            <div style={s.noProducts}>
              <div style={{ fontSize: 48 }}>🔩</div>
              <p>Products coming soon. Check back shortly!</p>
            </div>

          ) : (
            <>
              <div className="products-grid" style={s.productGrid}>
                {products.map(p => (
                  <div key={p.id} style={s.productCard}>
                    <div style={s.productImgWrap}>
                      {p.image
                        ? <img src={p.image} alt={p.name} style={s.productImg}
                            onError={e => { e.target.style.display = "none"; }} />
                        : <div style={s.productImgPlaceholder}>⚙️</div>
                      }
                      {p.category && <span style={s.badge}>{p.category}</span>}
                    </div>
                    <div style={s.productBody}>
                      <h3 style={s.productName}>{p.name}</h3>
                      {p.description && <p style={s.productDesc}>{p.description}</p>}
                      {p.unit && <span style={s.unitTag}>📦 per {p.unit}</span>}
                      <p style={s.productPrice}>
                        {p.price
                          ? `₹${Number(p.price).toLocaleString("en-IN")}`
                          : "Get Latest Price"
                        }
                      </p>
                      <div className="product-card-actions" style={s.productActions}>
                        <a href="tel:+9779851068337" style={s.callBtn}>📞 Call Now</a>
                        <a href="https://wa.me/9779851068337" target="_blank" rel="noreferrer" style={s.waBtn}>💬 WhatsApp</a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ textAlign: "center", marginTop: 40 }}>
                <Link to="/products" style={s.heroBtnPrimary}>View Full Catalogue →</Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={s.cta}>
        <div style={s.ctaInner}>
          <h2 className="cta-title" style={s.ctaTitle}>Need a Custom Estimate?</h2>
          <p className="cta-desc" style={s.ctaDesc}>Contact us and our team will prepare a detailed quotation for your requirements.</p>
          <Link to="/contact" className="cta-btn" style={s.ctaBtn}>Contact Us Now →</Link>
        </div>
      </section>

    </div>
  );
}

/* ── Color palette ── */
const PRIMARY = "#ea580c";
const PRIMARY_LIGHT = "#f97316";
const DARK = "#0f172a";

const s = {
  page: { fontFamily: "'Inter', 'Segoe UI', sans-serif" },
  /* Hero */
  hero: {
    position: "relative",
    background: `linear-gradient(135deg, ${DARK} 0%, #1e293b 50%, #0f2030 100%)`,
    color: "#fff", padding: "80px 24px 88px",
    overflow: "hidden",
  },
  heroOverlay: {
    position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
    backgroundImage: "radial-gradient(circle at 80% 20%, rgba(249,115,22,0.08) 0%, transparent 50%)",
    pointerEvents: "none",
  },
  heroInner: {
    maxWidth: 1200, margin: "0 auto", display: "grid",
    gridTemplateColumns: "1.2fr 1fr", gap: 64, alignItems: "center",
    position: "relative", zIndex: 1,
  },
  heroLeft: {},
  heroBadge: {
    display: "inline-block",
    background: "rgba(249,115,22,0.12)", color: "#fb923c",
    border: "1px solid rgba(249,115,22,0.25)",
    borderRadius: 24, padding: "7px 18px", fontSize: 13, fontWeight: 600, marginBottom: 22,
  },
  heroTitle: { fontSize: 54, fontWeight: 900, lineHeight: 1.08, margin: "0 0 18px", letterSpacing: "-0.02em" },
  heroAccent: { color: PRIMARY_LIGHT, display: "inline" },
  heroDesc: { fontSize: 16, color: "#94a3b8", lineHeight: 1.8, maxWidth: 500, marginBottom: 36 },
  heroBtns: { display: "flex", gap: 14, flexWrap: "wrap" },
  heroBtnPrimary: {
    background: `linear-gradient(135deg, ${PRIMARY}, ${PRIMARY_LIGHT})`,
    color: "#fff", padding: "14px 32px", borderRadius: 10, fontSize: 15, fontWeight: 700,
    textDecoration: "none", display: "inline-block",
    boxShadow: "0 4px 16px rgba(249,115,22,0.3)",
    transition: "all 0.2s ease",
  },
  heroBtnSecondary: {
    background: "rgba(255,255,255,0.06)", color: "#fff", padding: "14px 32px",
    borderRadius: 10, fontSize: 15, fontWeight: 700, textDecoration: "none",
    border: "1.5px solid rgba(255,255,255,0.15)", display: "inline-block",
    transition: "all 0.2s ease",
  },
  heroRight: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
  heroCard: {
    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 16, padding: "26px 20px", textAlign: "center",
    backdropFilter: "blur(8px)", transition: "all 0.3s ease",
  },
  heroCardIcon: { fontSize: 30, marginBottom: 10 },
  heroCardVal: { fontSize: 30, fontWeight: 900, color: "#fff", letterSpacing: "-0.01em" },
  heroCardLabel: { fontSize: 12, color: "#94a3b8", marginTop: 4, fontWeight: 500 },
  /* Sections */
  section: { padding: "80px 24px" },
  sectionInner: { maxWidth: 1200, margin: "0 auto" },
  sectionLabel: {
    fontSize: 12, fontWeight: 800, letterSpacing: 3, color: PRIMARY,
    textTransform: "uppercase", marginBottom: 8,
  },
  sectionTitle: { fontSize: 36, fontWeight: 800, color: DARK, margin: "0 0 40px", letterSpacing: "-0.01em" },
  /* Features */
  featureGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 },
  featureCard: {
    background: "#fff", borderRadius: 16, padding: "28px 24px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)",
    border: "1px solid #f1f5f9",
    transition: "all 0.3s ease",
  },
  featureIcon: {
    fontSize: 28, marginBottom: 14,
    width: 52, height: 52, borderRadius: 12,
    background: "#fff7ed", display: "flex", alignItems: "center", justifyContent: "center",
  },
  featureTitle: { fontSize: 16, fontWeight: 700, color: DARK, margin: "0 0 8px" },
  featureDesc: { fontSize: 13, color: "#64748b", lineHeight: 1.8, margin: 0 },
  /* Products */
  loadingRow: { display: "flex", alignItems: "center", gap: 12, justifyContent: "center", padding: "48px 0", color: "#64748b", fontSize: 14 },
  spinner: { width: 28, height: 28, border: "3px solid #e2e8f0", borderTop: `3px solid ${PRIMARY}`, borderRadius: "50%", flexShrink: 0, animation: "spin 0.8s linear infinite" },
  noProducts: { textAlign: "center", padding: "48px 0", color: "#94a3b8", fontSize: 15, lineHeight: 2 },
  productGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))", gap: 24 },
  productCard: {
    background: "#fff", borderRadius: 16, overflow: "hidden",
    boxShadow: "0 1px 4px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)",
    transition: "all 0.3s ease",
    border: "1px solid #f1f5f9",
  },
  productImgWrap: { position: "relative", height: 200, background: "#f8fafc" },
  productImg: { width: "100%", height: "100%", objectFit: "cover" },
  productImgPlaceholder: { display: "flex", alignItems: "center", justifyContent: "center", height: "100%", fontSize: 52, background: "#f8fafc" },
  badge: {
    position: "absolute", top: 12, right: 12,
    background: PRIMARY, color: "#fff", fontSize: 11, fontWeight: 700,
    padding: "4px 12px", borderRadius: 20,
  },
  productBody: { padding: "16px 18px 18px" },
  productName: { fontSize: 15, fontWeight: 700, color: DARK, margin: "0 0 6px" },
  productDesc: { fontSize: 13, color: "#64748b", margin: "0 0 8px", lineHeight: 1.5 },
  unitTag: {
    display: "inline-block", background: "#fff7ed", color: "#c2410c",
    fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 6, marginBottom: 10,
  },
  productPrice: { fontSize: 20, fontWeight: 800, color: PRIMARY, margin: "0 0 14px" },
  productActions: { display: "flex", gap: 8 },
  callBtn: {
    flex: 1, padding: "9px", borderRadius: 8, border: `1.5px solid ${PRIMARY}`,
    color: PRIMARY, fontSize: 13, fontWeight: 600, textDecoration: "none", textAlign: "center",
    transition: "all 0.2s ease",
  },
  waBtn: {
    flex: 1, padding: "9px", borderRadius: 8, background: "#dcfce7",
    color: "#16a34a", fontSize: 13, fontWeight: 600, textDecoration: "none", textAlign: "center",
    transition: "all 0.2s ease",
  },
  /* CTA */
  cta: {
    background: `linear-gradient(135deg, ${PRIMARY}, #c2410c)`,
    padding: "72px 24px", textAlign: "center",
    position: "relative", overflow: "hidden",
  },
  ctaInner: { maxWidth: 600, margin: "0 auto", position: "relative", zIndex: 1 },
  ctaTitle: { fontSize: 34, fontWeight: 800, color: "#fff", margin: "0 0 14px" },
  ctaDesc: { fontSize: 16, color: "rgba(255,255,255,0.85)", marginBottom: 32, lineHeight: 1.7 },
  ctaBtn: {
    background: "#fff", color: PRIMARY, padding: "14px 36px", borderRadius: 10,
    fontSize: 15, fontWeight: 700, textDecoration: "none", display: "inline-block",
    boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
    transition: "all 0.2s ease",
  },
};