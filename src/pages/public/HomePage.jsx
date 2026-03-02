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

const PRIMARY = "#ea580c";
const PRIMARY_LIGHT = "#f97316";
const DARK = "#0f172a";
const DARKER = "#020617";
const STEEL = "#1e293b";

const s = {
  page: { fontFamily: "'Inter','Segoe UI',sans-serif" },
  hero: { position:"relative", background: "linear-gradient(145deg, "+DARKER+" 0%, "+DARK+" 40%, #0c1a2e 100%)", color:"#fff", padding:"100px 24px 108px", overflow:"hidden" },
  heroPattern: { position:"absolute", top:0, left:0, right:0, bottom:0, backgroundImage:"repeating-linear-gradient(90deg,rgba(255,255,255,0.02) 0px,rgba(255,255,255,0.02) 1px,transparent 1px,transparent 80px),repeating-linear-gradient(0deg,rgba(255,255,255,0.02) 0px,rgba(255,255,255,0.02) 1px,transparent 1px,transparent 80px)", pointerEvents:"none" },
  heroOverlay: { position:"absolute", top:0, left:0, right:0, bottom:0, backgroundImage:"radial-gradient(ellipse at 20% 80%,rgba(234,88,12,0.12) 0%,transparent 50%),radial-gradient(ellipse at 80% 20%,rgba(249,115,22,0.08) 0%,transparent 50%)", pointerEvents:"none" },
  heroInner: { maxWidth:1200, margin:"0 auto", display:"grid", gridTemplateColumns:"1.3fr 1fr", gap:64, alignItems:"center", position:"relative", zIndex:1 },
  heroLeft: {},
  heroBadge: { display:"inline-flex", alignItems:"center", gap:8, background:"rgba(249,115,22,0.1)", color:"#fb923c", border:"1px solid rgba(249,115,22,0.2)", borderRadius:24, padding:"8px 20px", fontSize:13, fontWeight:600, marginBottom:24 },
  badgeDot: { width:8, height:8, borderRadius:"50%", background:"#22c55e", boxShadow:"0 0 8px rgba(34,197,94,0.6)", display:"inline-block" },
  heroTitle: { fontSize:56, fontWeight:900, lineHeight:1.05, margin:"0 0 20px", letterSpacing:"-0.03em" },
  heroAccent: { color:PRIMARY_LIGHT, display:"inline" },
  heroDesc: { fontSize:17, color:"#94a3b8", lineHeight:1.8, maxWidth:520, marginBottom:32 },
  heroBtns: { display:"flex", gap:14, flexWrap:"wrap", marginBottom:28 },
  heroBtnPrimary: { background:"linear-gradient(135deg,"+PRIMARY+","+PRIMARY_LIGHT+")", color:"#fff", padding:"15px 34px", borderRadius:10, fontSize:15, fontWeight:700, textDecoration:"none", display:"inline-flex", alignItems:"center", gap:8, boxShadow:"0 4px 20px rgba(249,115,22,0.35),0 0 0 1px rgba(249,115,22,0.3)" },
  heroBtnSecondary: { background:"rgba(255,255,255,0.06)", color:"#fff", padding:"15px 34px", borderRadius:10, fontSize:15, fontWeight:700, textDecoration:"none", border:"1.5px solid rgba(255,255,255,0.15)", display:"inline-block" },
  trustRow: { display:"flex", gap:12, alignItems:"center", flexWrap:"wrap" },
  trustItem: { fontSize:13, color:"#64748b", fontWeight:500 },
  trustDivider: { color:"#334155", fontSize:13 },
  heroRight: { display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 },
  heroCard: { background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:16, padding:"28px 20px", textAlign:"center", backdropFilter:"blur(8px)" },
  heroCardIcon: { fontSize:28, marginBottom:12, width:52, height:52, borderRadius:14, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 12px" },
  heroCardVal: { fontSize:32, fontWeight:900, letterSpacing:"-0.02em" },
  heroCardLabel: { fontSize:12, color:"#94a3b8", marginTop:4, fontWeight:500 },
  brandsBar: { background:STEEL, borderTop:"3px solid "+PRIMARY, padding:"18px 24px" },
  brandsInner: { maxWidth:1200, margin:"0 auto", display:"flex", alignItems:"center", gap:24, flexWrap:"wrap", justifyContent:"center" },
  brandsLabel: { fontSize:11, fontWeight:800, letterSpacing:2, color:"#64748b", textTransform:"uppercase", flexShrink:0 },
  brandsList: { display:"flex", gap:20, flexWrap:"wrap", justifyContent:"center" },
  brandItem: { fontSize:13, fontWeight:700, color:"#94a3b8", letterSpacing:1, textTransform:"uppercase", padding:"4px 12px", border:"1px solid rgba(148,163,184,0.15)", borderRadius:6 },
  catSection: { padding:"80px 24px", background:"#f8fafc" },
  catGrid: { display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:16 },
  catCard: { background:"#fff", borderRadius:14, padding:"28px 22px", textAlign:"center", border:"1px solid #e2e8f0", boxShadow:"0 1px 3px rgba(0,0,0,0.04)" },
  catIconWrap: { fontSize:36, marginBottom:14, width:64, height:64, borderRadius:16, background:"#fff7ed", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto", border:"2px solid #fed7aa" },
  catName: { fontSize:15, fontWeight:700, color:DARK, margin:"0 0 6px" },
  catDesc: { fontSize:12, color:"#64748b", lineHeight:1.6, margin:0 },
  sectionInner: { maxWidth:1200, margin:"0 auto" },
  sectionLabel: { fontSize:12, fontWeight:800, letterSpacing:3, color:PRIMARY, textTransform:"uppercase", marginBottom:8 },
  sectionTitle: { fontSize:36, fontWeight:800, color:DARK, margin:"0 0 40px", letterSpacing:"-0.01em" },
  sectionLabelLight: { fontSize:12, fontWeight:800, letterSpacing:3, color:"#fb923c", textTransform:"uppercase", marginBottom:8 },
  sectionTitleLight: { fontSize:36, fontWeight:800, color:"#fff", margin:"0 0 40px", letterSpacing:"-0.01em" },
  whySection: { padding:"80px 24px", background:"linear-gradient(145deg,"+DARK+" 0%,"+STEEL+" 100%)" },
  featureGrid: { display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(250px,1fr))", gap:20 },
  featureCard: { background:"rgba(255,255,255,0.04)", borderRadius:16, padding:"32px 24px", border:"1px solid rgba(255,255,255,0.06)", position:"relative", overflow:"hidden" },
  featureIcon: { fontSize:28, marginBottom:18, width:58, height:58, borderRadius:14, display:"flex", alignItems:"center", justifyContent:"center" },
  featureTitle: { fontSize:17, fontWeight:700, color:"#fff", margin:"0 0 10px" },
  featureDesc: { fontSize:13, color:"#94a3b8", lineHeight:1.8, margin:0 },
  featureBar: { position:"absolute", bottom:0, left:0, right:0, height:3 },
  prodSection: { padding:"80px 24px", background:"#f8fafc" },
  prodHeader: { display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:32, flexWrap:"wrap", gap:16 },
  viewAllBtn: { color:PRIMARY, fontWeight:700, fontSize:14, textDecoration:"none", padding:"10px 20px", borderRadius:8, border:"2px solid "+PRIMARY },
  loadingRow: { display:"flex", alignItems:"center", gap:12, justifyContent:"center", padding:"48px 0", color:"#64748b", fontSize:14 },
  spinner: { width:28, height:28, border:"3px solid #e2e8f0", borderTop:"3px solid "+PRIMARY, borderRadius:"50%", flexShrink:0, animation:"spin 0.8s linear infinite" },
  noProducts: { textAlign:"center", padding:"48px 0", color:"#94a3b8", fontSize:15, lineHeight:2 },
  productGrid: { display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(270px,1fr))", gap:24 },
  productCard: { background:"#fff", borderRadius:14, overflow:"hidden", boxShadow:"0 1px 3px rgba(0,0,0,0.05),0 4px 16px rgba(0,0,0,0.04)", border:"1px solid #e2e8f0" },
  productImgWrap: { position:"relative", height:200, background:"#f1f5f9" },
  productImg: { width:"100%", height:"100%", objectFit:"cover" },
  productImgPlaceholder: { display:"flex", alignItems:"center", justifyContent:"center", height:"100%", fontSize:52, background:"#f1f5f9" },
  badge: { position:"absolute", top:12, right:12, background:PRIMARY, color:"#fff", fontSize:11, fontWeight:700, padding:"4px 12px", borderRadius:20 },
  productBody: { padding:"16px 18px 18px" },
  productName: { fontSize:15, fontWeight:700, color:DARK, margin:"0 0 6px" },
  productDesc: { fontSize:13, color:"#64748b", margin:"0 0 8px", lineHeight:1.5 },
  unitTag: { display:"inline-block", background:"#fff7ed", color:"#c2410c", fontSize:11, fontWeight:600, padding:"3px 10px", borderRadius:6, marginBottom:10 },
  productPrice: { fontSize:20, fontWeight:800, color:PRIMARY, margin:"0 0 14px" },
  productActions: { display:"flex", gap:8 },
  callBtn: { flex:1, padding:"9px", borderRadius:8, border:"1.5px solid "+PRIMARY, color:PRIMARY, fontSize:13, fontWeight:600, textDecoration:"none", textAlign:"center" },
  waBtn: { flex:1, padding:"9px", borderRadius:8, background:"#dcfce7", color:"#16a34a", fontSize:13, fontWeight:600, textDecoration:"none", textAlign:"center" },
  processSection: { padding:"80px 24px", background:"linear-gradient(145deg,"+DARK+" 0%,"+STEEL+" 100%)" },
  processGrid: { display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))", gap:24, position:"relative" },
  processCard: { background:"rgba(255,255,255,0.04)", borderRadius:16, padding:"32px 24px", border:"1px solid rgba(255,255,255,0.06)", textAlign:"center", position:"relative" },
  processStep: { fontSize:36, fontWeight:900, color:"rgba(249,115,22,0.15)", position:"absolute", top:12, right:16, letterSpacing:-2 },
  processIcon: { fontSize:32, marginBottom:14 },
  processTitle: { fontSize:16, fontWeight:700, color:"#fff", margin:"0 0 8px" },
  processDesc: { fontSize:13, color:"#94a3b8", lineHeight:1.6, margin:0 },
  cta: { background:"linear-gradient(135deg,#7c2d12,"+PRIMARY+",#c2410c)", padding:"88px 24px", textAlign:"center", position:"relative", overflow:"hidden" },
  ctaPattern: { position:"absolute", top:0, left:0, right:0, bottom:0, backgroundImage:"repeating-linear-gradient(90deg,rgba(255,255,255,0.03) 0px,rgba(255,255,255,0.03) 1px,transparent 1px,transparent 60px),repeating-linear-gradient(0deg,rgba(255,255,255,0.03) 0px,rgba(255,255,255,0.03) 1px,transparent 1px,transparent 60px)", pointerEvents:"none" },
  ctaInner: { maxWidth:640, margin:"0 auto", position:"relative", zIndex:1 },
  ctaBadge: { display:"inline-block", background:"rgba(255,255,255,0.15)", color:"#fff", padding:"8px 20px", borderRadius:24, fontSize:13, fontWeight:800, letterSpacing:2, marginBottom:20 },
  ctaTitle: { fontSize:38, fontWeight:900, color:"#fff", margin:"0 0 16px", letterSpacing:"-0.02em" },
  ctaDesc: { fontSize:16, color:"rgba(255,255,255,0.85)", lineHeight:1.7, margin:"0 0 36px" },
  ctaBtns: { display:"flex", gap:14, justifyContent:"center", flexWrap:"wrap" },
  ctaBtn: { background:"#fff", color:PRIMARY, padding:"15px 40px", borderRadius:10, fontSize:15, fontWeight:700, textDecoration:"none", display:"inline-block", boxShadow:"0 4px 20px rgba(0,0,0,0.2)" },
  ctaBtnCall: { background:"rgba(255,255,255,0.15)", color:"#fff", padding:"15px 32px", borderRadius:10, fontSize:15, fontWeight:700, textDecoration:"none", border:"1.5px solid rgba(255,255,255,0.3)", display:"inline-block" },
};
