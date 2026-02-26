import { Link } from "react-router-dom";
import { useProducts } from "../../hooks/useProducts";

export default function HomePage() {
  const { products, loading } = useProducts();

  return (
    <div style={s.page}>

      {/* ── Hero ── */}
      <section style={s.hero}>
        <div style={s.heroInner}>
          <div style={s.heroLeft}>
            <div style={s.heroBadge}>🔩 Nepal's Trusted Heavy Equipment Supplier</div>
            <h1 style={s.heroTitle}>
              Manakamana<br />
              <span style={s.heroAccent}>Heavy Equipments</span>
            </h1>
            <p style={s.heroDesc}>
              Premium quality spare parts and components for excavators, bulldozers,
              cranes, and all heavy machinery. Serving Nepal's construction industry.
            </p>
            <div style={s.heroBtns}>
              <Link to="/products" style={s.heroBtnPrimary}>Browse Products</Link>
              <Link to="/contact"  style={s.heroBtnSecondary}>Get a Quote</Link>
            </div>
          </div>
          <div style={s.heroRight}>
            {[
              { icon:"⚙️",  val:"5000+", label:"Parts in Stock" },
              { icon:"🏗️", val:"200+",  label:"Happy Clients" },
              { icon:"🚚",  val:"Fast",  label:"Delivery Nepal-wide" },
              { icon:"✅",  val:"100%",  label:"Genuine Parts" },
            ].map(c => (
              <div key={c.label} style={s.heroCard}>
                <div style={s.heroCardIcon}>{c.icon}</div>
                <div style={s.heroCardVal}>{c.val}</div>
                <div style={s.heroCardLabel}>{c.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why choose us ── */}
      <section style={s.section}>
        <div style={s.sectionInner}>
          <p style={s.sectionLabel}>WHY CHOOSE US</p>
          <h2 style={s.sectionTitle}>Built for Nepal's Toughest Jobs</h2>
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

      {/* ── Products section — shows everything admin added ── */}
      <section style={{ ...s.section, background: "#f8fafc" }}>
        <div style={s.sectionInner}>
          <p style={s.sectionLabel}>OUR CATALOGUE</p>
          <h2 style={s.sectionTitle}>Our Products</h2>

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
              <div style={s.productGrid}>
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
                      <div style={s.productActions}>
                        <a href="tel:+977XXXXXXXX" style={s.callBtn}>📞 Call Now</a>
                        <a href="https://wa.me/977XXXXXXXXXX" target="_blank" rel="noreferrer" style={s.waBtn}>💬 WhatsApp</a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ textAlign: "center", marginTop: 36 }}>
                <Link to="/products" style={s.heroBtnPrimary}>View Full Catalogue →</Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={s.cta}>
        <div style={s.ctaInner}>
          <h2 style={s.ctaTitle}>Need a custom estimate?</h2>
          <p style={s.ctaDesc}>Contact us and our team will prepare a detailed quotation for your requirements.</p>
          <Link to="/contact" style={s.ctaBtn}>Contact Us Now</Link>
        </div>
      </section>

    </div>
  );
}

const s = {
  page: { fontFamily: "'Segoe UI', sans-serif" },
  /* Hero */
  hero: {
    background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)",
    color: "#fff", padding: "72px 24px",
  },
  heroInner: { maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 60, alignItems: "center" },
  heroLeft: {},
  heroBadge: { display: "inline-block", background: "rgba(14,165,233,0.15)", color: "#38bdf8", border: "1px solid rgba(14,165,233,0.3)", borderRadius: 20, padding: "6px 16px", fontSize: 13, fontWeight: 600, marginBottom: 20 },
  heroTitle: { fontSize: 52, fontWeight: 900, lineHeight: 1.1, margin: "0 0 16px" },
  heroAccent: { color: "#38bdf8" },
  heroDesc: { fontSize: 16, color: "#94a3b8", lineHeight: 1.7, maxWidth: 480, marginBottom: 32 },
  heroBtns: { display: "flex", gap: 12, flexWrap: "wrap" },
  heroBtnPrimary: { background: "#0ea5e9", color: "#fff", padding: "12px 28px", borderRadius: 10, fontSize: 15, fontWeight: 700, textDecoration: "none", display: "inline-block" },
  heroBtnSecondary: { background: "rgba(255,255,255,0.1)", color: "#fff", padding: "12px 28px", borderRadius: 10, fontSize: 15, fontWeight: 700, textDecoration: "none", border: "1px solid rgba(255,255,255,0.2)", display: "inline-block" },
  heroRight: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
  heroCard: { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: "24px 20px", textAlign: "center" },
  heroCardIcon: { fontSize: 28, marginBottom: 8 },
  heroCardVal: { fontSize: 28, fontWeight: 900, color: "#fff" },
  heroCardLabel: { fontSize: 12, color: "#94a3b8", marginTop: 4 },
  /* Sections */
  section: { padding: "72px 24px" },
  sectionInner: { maxWidth: 1200, margin: "0 auto" },
  sectionLabel: { fontSize: 11, fontWeight: 800, letterSpacing: 2, color: "#0ea5e9", textTransform: "uppercase", marginBottom: 8 },
  sectionTitle: { fontSize: 36, fontWeight: 800, color: "#0f172a", margin: "0 0 36px" },
  /* Features */
  featureGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20 },
  featureCard: { background: "#fff", borderRadius: 16, padding: "24px", boxShadow: "0 2px 10px rgba(0,0,0,0.06)", border: "1px solid #f1f5f9" },
  featureIcon: { fontSize: 30, marginBottom: 12 },
  featureTitle: { fontSize: 16, fontWeight: 700, color: "#0f172a", margin: "0 0 8px" },
  featureDesc: { fontSize: 13, color: "#64748b", lineHeight: 1.7, margin: 0 },
  /* Products */
  loadingRow: { display: "flex", alignItems: "center", gap: 12, justifyContent: "center", padding: "40px 0", color: "#64748b", fontSize: 14 },
  spinner: { width: 28, height: 28, border: "3px solid #e2e8f0", borderTop: "3px solid #0ea5e9", borderRadius: "50%", flexShrink: 0 },
  noProducts: { textAlign: "center", padding: "40px 0", color: "#94a3b8", fontSize: 15, lineHeight: 2 },
  productGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 24 },
  productCard: { background: "#fff", borderRadius: 14, overflow: "hidden", boxShadow: "0 2px 10px rgba(0,0,0,0.07)" },
  productImgWrap: { position: "relative", height: 200, background: "#f1f5f9" },
  productImg: { width: "100%", height: "100%", objectFit: "cover" },
  productImgPlaceholder: { display: "flex", alignItems: "center", justifyContent: "center", height: "100%", fontSize: 52 },
  badge: { position: "absolute", top: 10, right: 10, background: "#0ea5e9", color: "#fff", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20 },
  productBody: { padding: 16 },
  productName: { fontSize: 15, fontWeight: 700, color: "#0f172a", margin: "0 0 4px" },
  productDesc: { fontSize: 12, color: "#64748b", margin: "0 0 6px", lineHeight: 1.5 },
  unitTag: { display: "inline-block", background: "#f1f5f9", color: "#475569", fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 6, marginBottom: 8 },
  productPrice: { fontSize: 18, fontWeight: 700, color: "#0ea5e9", margin: "0 0 12px" },
  productActions: { display: "flex", gap: 8 },
  callBtn: { flex: 1, padding: "8px", borderRadius: 8, border: "1.5px solid #0ea5e9", color: "#0ea5e9", fontSize: 13, fontWeight: 600, textDecoration: "none", textAlign: "center" },
  waBtn: { flex: 1, padding: "8px", borderRadius: 8, background: "#dcfce7", color: "#16a34a", fontSize: 13, fontWeight: 600, textDecoration: "none", textAlign: "center" },
  /* CTA */
  cta: { background: "linear-gradient(135deg, #0ea5e9, #0369a1)", padding: "64px 24px", textAlign: "center" },
  ctaInner: { maxWidth: 600, margin: "0 auto" },
  ctaTitle: { fontSize: 32, fontWeight: 800, color: "#fff", margin: "0 0 12px" },
  ctaDesc: { fontSize: 15, color: "rgba(255,255,255,0.85)", marginBottom: 28, lineHeight: 1.6 },
  ctaBtn: { background: "#fff", color: "#0369a1", padding: "12px 32px", borderRadius: 10, fontSize: 15, fontWeight: 700, textDecoration: "none", display: "inline-block" },
};