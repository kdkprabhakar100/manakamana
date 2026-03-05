import { Link } from "react-router-dom";
import { useProducts } from "../../hooks/useProducts";

export default function HomePage() {
  const { products, loading } = useProducts();

  return (
    <div style={s.page}>

      {/* Hero */}
      <section style={s.hero}>
        <div style={s.heroPattern} />
        <div style={s.heroOverlay} />
        <div className="hero-inner" style={s.heroInner}>
          <div style={s.heroLeft}>
            <div className="hero-badge" style={s.heroBadge}>
              <span style={s.badgeDot} /> Nepal's Trusted Heavy Equipment Supplier
            </div>
            <h1 className="hero-title" style={s.heroTitle}>
              Industrial Grade<br />
              <span style={s.heroAccent}>Heavy Equipment</span><br />
              Parts & Solutions
            </h1>
            <p className="hero-desc" style={s.heroDesc}>
              Powering Nepal's biggest construction projects with genuine OEM spare parts
              for excavators, bulldozers, loaders, and all heavy machinery.
            </p>
            <div className="hero-btns" style={s.heroBtns}>
              <Link to="/products" style={s.heroBtnPrimary}>Browse Catalogue</Link>
              <Link to="/contact" style={s.heroBtnSecondary}>Get a Quote &rarr;</Link>
            </div>
            <div className="hero-trust" style={s.trustRow}>
              <span style={s.trustItem}>&check; Genuine OEM Parts</span>
              <span style={s.trustDivider}>|</span>
              <span style={s.trustItem}>&check; Nepal-wide Delivery</span>
              <span style={s.trustDivider}>|</span>
              <span style={s.trustItem}>&check; Expert Support</span>
            </div>
          </div>
          <div className="hero-right" style={s.heroRight}>
            {[
              { icon:"\u{1F3D7}\uFE0F", val:"5000+", label:"Parts in Stock", accent:"#f97316" },
              { icon:"\u{1F477}", val:"200+", label:"Happy Clients", accent:"#fbbf24" },
              { icon:"\u{1F69A}", val:"Fast", label:"Delivery Nepal-wide", accent:"#34d399" },
              { icon:"\u{1F6E1}\uFE0F", val:"100%", label:"Genuine & Certified", accent:"#60a5fa" },
            ].map(c => (
              <div key={c.label} className="hero-card" style={s.heroCard}>
                <div style={{ ...s.heroCardIcon, background: c.accent + "15", border: "1px solid " + c.accent + "30" }}>{c.icon}</div>
                <div className="hero-card-val" style={{ ...s.heroCardVal, color: c.accent }}>{c.val}</div>
                <div className="hero-card-label" style={s.heroCardLabel}>{c.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Brands Bar */}
      <section style={s.brandsBar}>
        <div style={s.brandsInner}>
          <span style={s.brandsLabel}>BRANDS WE SUPPLY</span>
          <div style={s.brandsList}>
            {["Caterpillar","Komatsu","Hitachi","Volvo","JCB","Hyundai","Doosan","Kobelco"].map(b => (
              <span key={b} style={s.brandItem}>{b}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Equipment Categories */}
      <section style={s.catSection}>
        <div style={s.sectionInner}>
          <p style={s.sectionLabel}>EQUIPMENT WE SERVE</p>
          <h2 className="section-title" style={s.sectionTitle}>Parts for Every Heavy Machine</h2>
          <div style={s.catGrid}>
            {[
              { icon:"\u{1F69C}", name:"Excavators", desc:"Buckets, booms, hydraulics, tracks & more" },
              { icon:"\u{1F6A7}", name:"Bulldozers", desc:"Blades, sprockets, rollers, undercarriage" },
              { icon:"\u{1F3D7}\uFE0F", name:"Cranes", desc:"Cables, pulleys, hooks, boom sections" },
              { icon:"\u{1F69B}", name:"Loaders", desc:"Buckets, tires, axles, transmission parts" },
              { icon:"\u2699\uFE0F", name:"Gear Systems", desc:"Ring gears, pinions, planetary sets" },
              { icon:"\u{1F527}", name:"Hydraulic Parts", desc:"Pumps, cylinders, seals, hoses" },
            ].map(cat => (
              <div key={cat.name} style={s.catCard}>
                <div style={s.catIconWrap}>{cat.icon}</div>
                <h3 style={s.catName}>{cat.name}</h3>
                <p style={s.catDesc}>{cat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section style={s.whySection}>
        <div style={s.sectionInner}>
          <p style={s.sectionLabelLight}>WHY CHOOSE US</p>
          <h2 className="section-title" style={s.sectionTitleLight}>Built for Nepal's Toughest Jobs</h2>
          <div style={s.featureGrid}>
            {[
              { icon:"\u{1F6E1}\uFE0F", title:"Genuine OEM Parts", desc:"All parts sourced directly from certified manufacturers ensuring 100% quality and compatibility.", color:"#f97316" },
              { icon:"\u{1F4B0}", title:"Best Market Price", desc:"Competitive wholesale pricing with no compromise on quality. Maximum value for your investment.", color:"#fbbf24" },
              { icon:"\u26A1", title:"Immediate Availability", desc:"Massive inventory means most parts ship same-day. We know downtime costs you money.", color:"#34d399" },
              { icon:"\u{1F477}", title:"Expert Consultation", desc:"Our team of experienced engineers helps you find the exact right part for your machine.", color:"#60a5fa" },
            ].map(f => (
              <div key={f.title} style={s.featureCard}>
                <div style={{ ...s.featureIcon, background: f.color + "20", border: "2px solid " + f.color + "40" }}>
                  <span style={{ fontSize: 28 }}>{f.icon}</span>
                </div>
                <h3 style={s.featureTitle}>{f.title}</h3>
                <p style={s.featureDesc}>{f.desc}</p>
                <div style={{ ...s.featureBar, background: f.color }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products */}
      <section style={s.prodSection}>
        <div style={s.sectionInner}>
          <div style={s.prodHeader}>
            <div>
              <p style={s.sectionLabel}>OUR CATALOGUE</p>
              <h2 className="section-title" style={s.sectionTitle}>Featured Products</h2>
            </div>
            <Link to="/products" style={s.viewAllBtn}>View All Products &rarr;</Link>
          </div>

          {loading ? (
            <div style={s.loadingRow}><div style={s.spinner} /><span>Loading products&hellip;</span></div>
          ) : products.length === 0 ? (
            <div style={s.noProducts}><div style={{ fontSize: 48 }}>{"\u{1F529}"}</div><p>Products coming soon!</p></div>
          ) : (
            <div className="products-grid" style={s.productGrid}>
              {products.slice(0, 8).map(p => (
                <div key={p.id} style={s.productCard}>
                  <div style={s.productImgWrap}>
                    {p.image
                      ? <img src={p.image} alt={p.name} style={s.productImg} onError={e => { e.target.style.display = "none"; }} />
                      : <div style={s.productImgPlaceholder}>{"\u2699\uFE0F"}</div>
                    }
                    {p.category && <span style={s.badge}>{p.category}</span>}
                  </div>
                  <div style={s.productBody}>
                    <h3 style={s.productName}>{p.name}</h3>
                    {p.description && <p style={s.productDesc}>{p.description}</p>}
                    {p.unit && <span style={s.unitTag}>{"\u{1F4E6}"} per {p.unit}</span>}
                    <p style={s.productPrice}>{p.price ? "\u20B9" + Number(p.price).toLocaleString("en-IN") : "Get Latest Price"}</p>
                    <div className="product-card-actions" style={s.productActions}>
                      <a href="tel:+9779851068337" style={s.callBtn}>{"\u{1F4DE}"} Call Now</a>
                      <a href="https://wa.me/9779851068337" target="_blank" rel="noreferrer" style={s.waBtn}>{"\u{1F4AC}"} WhatsApp</a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Process */}
      <section style={s.processSection}>
        <div style={s.sectionInner}>
          <p style={s.sectionLabelLight}>HOW IT WORKS</p>
          <h2 className="section-title" style={s.sectionTitleLight}>Get Your Parts in 4 Simple Steps</h2>
          <div className="process-grid" style={s.processGrid}>
            {[
              { step:"01", title:"Identify Your Need", desc:"Tell us your machine model and the part you need", icon:"\u{1F50D}" },
              { step:"02", title:"Get a Quote", desc:"We provide competitive pricing within hours", icon:"\u{1F4CB}" },
              { step:"03", title:"Confirm Order", desc:"Approve the quote and confirm your order", icon:"\u2705" },
              { step:"04", title:"Fast Delivery", desc:"Parts delivered to your site across Nepal", icon:"\u{1F69A}" },
            ].map(p => (
              <div key={p.step} style={s.processCard}>
                <div style={s.processStep}>{p.step}</div>
                <div style={s.processIcon}>{p.icon}</div>
                <h3 style={s.processTitle}>{p.title}</h3>
                <p style={s.processDesc}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={s.cta}>
        <div style={s.ctaPattern} />
        <div style={s.ctaInner}>
          <div style={s.ctaBadge}>{"\u{1F3D7}\uFE0F"} READY TO BUILD?</div>
          <h2 className="cta-title" style={s.ctaTitle}>Need Parts for Your Heavy Equipment?</h2>
          <p className="cta-desc" style={s.ctaDesc}>
            Contact our team for competitive quotes, expert guidance, and fast delivery across Nepal.
          </p>
          <div style={s.ctaBtns}>
            <Link to="/contact" className="cta-btn" style={s.ctaBtn}>Get a Free Quote &rarr;</Link>
            <a href="tel:+9779851068337" style={s.ctaBtnCall}>{"\u{1F4DE}"} +977-9851068337</a>
          </div>
        </div>
      </section>
    </div>
  );
}

const PRIMARY = "#b45309";
const ACCENT = "#d97706";
const DARK = "#0a0a0a";
const DARKER = "#000000";
const STEEL = "#171717";

const s = {
  page: { fontFamily: "'Inter',system-ui,sans-serif" },
  hero: { position:"relative", background: DARK, color:"#fff", padding:"120px 32px 140px", overflow:"hidden" },
  heroPattern: { position:"absolute", top:0, left:0, right:0, bottom:0, background:"radial-gradient(circle at 20% 50%, rgba(217,119,6,0.08) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(245,158,11,0.04) 0%, transparent 40%)", pointerEvents:"none" },
  heroOverlay: { position:"absolute", top:0, left:0, right:0, bottom:0, background:"url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.015'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")", pointerEvents:"none" },
  heroInner: { maxWidth:1280, margin:"0 auto", display:"grid", gridTemplateColumns:"1.2fr 1fr", gap:80, alignItems:"center", position:"relative", zIndex:1 },
  heroLeft: {},
  heroBadge: { display:"inline-flex", alignItems:"center", gap:10, background:"rgba(217,119,6,0.08)", color:"#f59e0b", border:"1px solid rgba(217,119,6,0.15)", borderRadius:100, padding:"8px 24px", fontSize:12, fontWeight:600, marginBottom:32, letterSpacing:1 },
  badgeDot: { width:8, height:8, borderRadius:"50%", background:"#22c55e", boxShadow:"0 0 12px rgba(34,197,94,0.5)", display:"inline-block" },
  heroTitle: { fontSize:64, fontWeight:800, lineHeight:1.0, margin:"0 0 28px", letterSpacing:"-0.04em", fontFamily:"'Space Grotesk','Inter',sans-serif" },
  heroAccent: { background:"linear-gradient(135deg, #f59e0b, #d97706, #b45309)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text", display:"inline" },
  heroDesc: { fontSize:18, color:"#a3a3a3", lineHeight:1.8, maxWidth:540, marginBottom:40, fontWeight:400 },
  heroBtns: { display:"flex", gap:16, flexWrap:"wrap", marginBottom:36 },
  heroBtnPrimary: { background:"#fff", color:DARK, padding:"16px 40px", borderRadius:100, fontSize:15, fontWeight:600, textDecoration:"none", display:"inline-flex", alignItems:"center", gap:10, boxShadow:"0 4px 30px rgba(255,255,255,0.1)", letterSpacing:0.3 },
  heroBtnSecondary: { background:"transparent", color:"#fff", padding:"16px 40px", borderRadius:100, fontSize:15, fontWeight:600, textDecoration:"none", border:"1px solid rgba(255,255,255,0.15)", display:"inline-block", letterSpacing:0.3 },
  trustRow: { display:"flex", gap:16, alignItems:"center", flexWrap:"wrap" },
  trustItem: { fontSize:13, color:"#737373", fontWeight:500, letterSpacing:0.3 },
  trustDivider: { color:"#404040", fontSize:13 },
  heroRight: { display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 },
  heroCard: { background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:20, padding:"32px 24px", textAlign:"center", backdropFilter:"blur(12px)", transition:"all 0.4s ease" },
  heroCardIcon: { fontSize:28, marginBottom:16, width:56, height:56, borderRadius:16, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px" },
  heroCardVal: { fontSize:36, fontWeight:800, letterSpacing:"-0.03em", fontFamily:"'Space Grotesk','Inter',sans-serif" },
  heroCardLabel: { fontSize:11, color:"#737373", marginTop:6, fontWeight:500, letterSpacing:1, textTransform:"uppercase" },
  brandsBar: { background:"#fafafa", borderTop:"1px solid #f5f5f5", borderBottom:"1px solid #f5f5f5", padding:"20px 32px" },
  brandsInner: { maxWidth:1280, margin:"0 auto", display:"flex", alignItems:"center", gap:28, flexWrap:"wrap", justifyContent:"center" },
  brandsLabel: { fontSize:10, fontWeight:700, letterSpacing:3, color:"#a3a3a3", textTransform:"uppercase", flexShrink:0 },
  brandsList: { display:"flex", gap:16, flexWrap:"wrap", justifyContent:"center" },
  brandItem: { fontSize:13, fontWeight:600, color:"#737373", letterSpacing:0.5, padding:"6px 16px", background:"#fff", border:"1px solid #e5e5e5", borderRadius:100 },
  catSection: { padding:"120px 32px", background:"#fff" },
  catGrid: { display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:20 },
  catCard: { background:"#fafafa", borderRadius:20, padding:"36px 24px", textAlign:"center", border:"1px solid #f5f5f5", transition:"all 0.4s cubic-bezier(0.16,1,0.3,1)" },
  catIconWrap: { fontSize:36, marginBottom:16, width:72, height:72, borderRadius:20, background:"#fff", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto", border:"1px solid #e5e5e5", boxShadow:"0 2px 8px rgba(0,0,0,0.03)" },
  catName: { fontSize:16, fontWeight:700, color:DARK, margin:"0 0 8px" },
  catDesc: { fontSize:13, color:"#737373", lineHeight:1.6, margin:0 },
  sectionInner: { maxWidth:1280, margin:"0 auto" },
  sectionLabel: { fontSize:11, fontWeight:700, letterSpacing:4, color:ACCENT, textTransform:"uppercase", marginBottom:12 },
  sectionTitle: { fontSize:42, fontWeight:800, color:DARK, margin:"0 0 56px", letterSpacing:"-0.03em", fontFamily:"'Space Grotesk','Inter',sans-serif" },
  sectionLabelLight: { fontSize:11, fontWeight:700, letterSpacing:4, color:"#f59e0b", textTransform:"uppercase", marginBottom:12 },
  sectionTitleLight: { fontSize:42, fontWeight:800, color:"#fff", margin:"0 0 56px", letterSpacing:"-0.03em", fontFamily:"'Space Grotesk','Inter',sans-serif" },
  whySection: { padding:"120px 32px", background:DARK },
  featureGrid: { display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))", gap:24 },
  featureCard: { background:"rgba(255,255,255,0.03)", borderRadius:24, padding:"40px 28px", border:"1px solid rgba(255,255,255,0.06)", position:"relative", overflow:"hidden", transition:"all 0.5s cubic-bezier(0.16,1,0.3,1)" },
  featureIcon: { fontSize:28, marginBottom:24, width:64, height:64, borderRadius:18, display:"flex", alignItems:"center", justifyContent:"center" },
  featureTitle: { fontSize:18, fontWeight:700, color:"#fff", margin:"0 0 12px" },
  featureDesc: { fontSize:14, color:"#a3a3a3", lineHeight:1.8, margin:0 },
  featureBar: { position:"absolute", bottom:0, left:0, right:0, height:2 },
  prodSection: { padding:"120px 32px", background:"#fafafa" },
  prodHeader: { display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:48, flexWrap:"wrap", gap:20 },
  viewAllBtn: { color:DARK, fontWeight:600, fontSize:14, textDecoration:"none", padding:"12px 28px", borderRadius:100, border:"1px solid #e5e5e5", background:"#fff", letterSpacing:0.3 },
  loadingRow: { display:"flex", alignItems:"center", gap:12, justifyContent:"center", padding:"60px 0", color:"#737373", fontSize:14 },
  spinner: { width:28, height:28, border:"3px solid #f5f5f5", borderTop:"3px solid "+ACCENT, borderRadius:"50%", flexShrink:0, animation:"spin 0.8s linear infinite" },
  noProducts: { textAlign:"center", padding:"60px 0", color:"#a3a3a3", fontSize:15, lineHeight:2 },
  productGrid: { display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:24 },
  productCard: { background:"#fff", borderRadius:20, overflow:"hidden", boxShadow:"0 1px 3px rgba(0,0,0,0.04)", border:"1px solid #f5f5f5", transition:"all 0.5s cubic-bezier(0.16,1,0.3,1)" },
  productImgWrap: { position:"relative", height:220, background:"#f5f5f5" },
  productImg: { width:"100%", height:"100%", objectFit:"cover" },
  productImgPlaceholder: { display:"flex", alignItems:"center", justifyContent:"center", height:"100%", fontSize:52, background:"#f5f5f5" },
  badge: { position:"absolute", top:14, right:14, background:DARK, color:"#fff", fontSize:10, fontWeight:600, padding:"5px 14px", borderRadius:100, letterSpacing:0.5 },
  productBody: { padding:"20px 22px 24px" },
  productName: { fontSize:16, fontWeight:700, color:DARK, margin:"0 0 6px" },
  productDesc: { fontSize:13, color:"#737373", margin:"0 0 10px", lineHeight:1.6 },
  unitTag: { display:"inline-block", background:"#fffbeb", color:"#92400e", fontSize:11, fontWeight:600, padding:"4px 12px", borderRadius:100, marginBottom:12 },
  productPrice: { fontSize:22, fontWeight:800, color:PRIMARY, margin:"0 0 16px", fontFamily:"'Space Grotesk','Inter',sans-serif" },
  productActions: { display:"flex", gap:8 },
  callBtn: { flex:1, padding:"10px", borderRadius:100, border:"1px solid #e5e5e5", color:DARK, fontSize:13, fontWeight:600, textDecoration:"none", textAlign:"center" },
  waBtn: { flex:1, padding:"10px", borderRadius:100, background:"#22c55e", color:"#fff", fontSize:13, fontWeight:600, textDecoration:"none", textAlign:"center" },
  processSection: { padding:"120px 32px", background:DARK },
  processGrid: { display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))", gap:24, position:"relative" },
  processCard: { background:"rgba(255,255,255,0.03)", borderRadius:24, padding:"40px 28px", border:"1px solid rgba(255,255,255,0.06)", textAlign:"center", position:"relative", transition:"all 0.4s ease" },
  processStep: { fontSize:40, fontWeight:900, color:"rgba(217,119,6,0.1)", position:"absolute", top:16, right:20, letterSpacing:-2, fontFamily:"'Space Grotesk','Inter',sans-serif" },
  processIcon: { fontSize:36, marginBottom:18 },
  processTitle: { fontSize:17, fontWeight:700, color:"#fff", margin:"0 0 10px" },
  processDesc: { fontSize:14, color:"#a3a3a3", lineHeight:1.7, margin:0 },
  cta: { background:DARK, padding:"140px 32px", textAlign:"center", position:"relative", overflow:"hidden" },
  ctaPattern: { position:"absolute", top:0, left:0, right:0, bottom:0, background:"radial-gradient(circle at 50% 50%, rgba(217,119,6,0.08) 0%, transparent 60%)", pointerEvents:"none" },
  ctaInner: { maxWidth:700, margin:"0 auto", position:"relative", zIndex:1 },
  ctaBadge: { display:"inline-block", background:"rgba(217,119,6,0.1)", color:"#f59e0b", padding:"8px 24px", borderRadius:100, fontSize:12, fontWeight:700, letterSpacing:3, marginBottom:28, border:"1px solid rgba(217,119,6,0.15)" },
  ctaTitle: { fontSize:48, fontWeight:800, color:"#fff", margin:"0 0 20px", letterSpacing:"-0.03em", lineHeight:1.1, fontFamily:"'Space Grotesk','Inter',sans-serif" },
  ctaDesc: { fontSize:17, color:"#a3a3a3", lineHeight:1.8, margin:"0 0 48px" },
  ctaBtns: { display:"flex", gap:16, justifyContent:"center", flexWrap:"wrap" },
  ctaBtn: { background:"#fff", color:DARK, padding:"16px 48px", borderRadius:100, fontSize:15, fontWeight:600, textDecoration:"none", display:"inline-block", boxShadow:"0 4px 30px rgba(255,255,255,0.1)", letterSpacing:0.3 },
  ctaBtnCall: { background:"transparent", color:"#fff", padding:"16px 40px", borderRadius:100, fontSize:15, fontWeight:600, textDecoration:"none", border:"1px solid rgba(255,255,255,0.15)", display:"inline-block", letterSpacing:0.3 },
};
