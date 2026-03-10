import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useProducts } from "../../hooks/useProducts";

/* ── Animated Counter Hook ── */
function useCounter(target, duration = 2000) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const step = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return [count, ref];
}

/* ── Brand Carousel ── */
const BRANDS = ["Caterpillar", "Komatsu", "Hitachi", "Volvo", "JCB", "Hyundai", "Doosan", "Kobelco"];

function BrandCarousel() {
  const doubled = [...BRANDS, ...BRANDS];
  return (
    <section style={s.brandsSection}>
      <div style={s.sectionInner}>
        <p style={s.brandsSectionLabel}>TRUSTED BY INDUSTRY LEADERS</p>
      </div>
      <div style={s.brandsTrack}>
        <div className="brands-scroll" style={s.brandsScroll}>
          {doubled.map((b, i) => (
            <div key={i} className="brand-card" style={s.brandCard}>
              <div style={s.brandIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
              </div>
              <span style={s.brandName}>{b}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  const { products, loading } = useProducts();
  const [c1, r1] = useCounter(5000, 2200);
  const [c2, r2] = useCounter(200, 1800);
  const [c3, r3] = useCounter(50, 1600);
  const [c4, r4] = useCounter(10, 1400);

  return (
    <div style={s.page}>

      {/* ══════ HERO ══════ */}
      <section style={s.hero}>
        {/* Background layers */}
        <div style={s.heroBg} />
        <div style={s.heroGradient} />
        <div style={s.heroGrid} />

        <div className="hero-inner" style={s.heroInner}>
          <div style={s.heroLeft}>
            <div className="hero-badge" style={s.heroBadge}>
              <span style={s.badgeDot} />
              Nepal's #1 Heavy Equipment Supplier
            </div>
            <h1 className="hero-title" style={s.heroTitle}>
              Industrial Grade{" "}
              <span style={s.heroAccent}>Heavy Equipment</span>{" "}
              Parts & Solutions
            </h1>
            <p className="hero-desc" style={s.heroDesc}>
              Powering Nepal's biggest construction projects with genuine OEM &amp; aftermarket parts
              for excavators, bulldozers, loaders, and all heavy machinery.
            </p>
            <div className="hero-btns" style={s.heroBtns}>
              <Link to="/products" style={s.heroBtnPrimary}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                Browse Catalogue
              </Link>
              <Link to="/contact" style={s.heroBtnSecondary}>
                Get a Quote
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </Link>
            </div>
            <div className="hero-trust" style={s.trustRow}>
              {["Genuine OEM Parts", "Nepal-wide Delivery", "Expert Support"].map((t, i) => (
                <span key={t} style={s.trustItem}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="hero-right" style={s.heroRight}>
            {[
              { ref: r1, val: c1, suffix: "+", label: "Parts in Stock", icon: "📦", color: "#f97316" },
              { ref: r2, val: c2, suffix: "+", label: "Happy Clients", icon: "🤝", color: "#fbbf24" },
              { ref: r3, val: c3, suffix: "+", label: "Brands Covered", icon: "🏷️", color: "#34d399" },
              { ref: r4, val: c4, suffix: "+", label: "Years Experience", icon: "⭐", color: "#60a5fa" },
            ].map(c => (
              <div key={c.label} ref={c.ref} className="hero-card" style={s.heroCard}>
                <div style={{ ...s.heroCardGlow, background: `radial-gradient(circle at 50% 0%, ${c.color}15 0%, transparent 70%)` }} />
                <div style={{ ...s.heroCardIcon, background: c.color + "15", borderColor: c.color + "30" }}>{c.icon}</div>
                <div className="hero-card-val" style={{ ...s.heroCardVal, color: c.color }}>{c.val.toLocaleString()}{c.suffix}</div>
                <div className="hero-card-label" style={s.heroCardLabel}>{c.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Floating particles */}
        <div style={{ ...s.particle, top: "20%", left: "5%", animationDelay: "0s" }} />
        <div style={{ ...s.particle, top: "60%", left: "15%", animationDelay: "1s", width: 6, height: 6 }} />
        <div style={{ ...s.particle, top: "30%", right: "8%", animationDelay: "2s" }} />
        <div style={{ ...s.particle, top: "75%", right: "20%", animationDelay: "0.5s", width: 5, height: 5 }} />
      </section>

      {/* ══════ BRAND CAROUSEL ══════ */}
      <BrandCarousel />

      {/* ══════ EQUIPMENT CATEGORIES ══════ */}
      <section style={s.catSection}>
        <div style={s.sectionInner}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <p style={s.sectionLabel}>EQUIPMENT WE SERVE</p>
            <h2 className="section-title" style={s.sectionTitle}>Parts for Every Heavy Machine</h2>
            <p style={s.sectionSubtitle}>From excavators to cranes, we supply genuine parts for all major equipment categories.</p>
          </div>
          <div className="cat-grid" style={s.catGrid}>
            {[
              { icon: "🏗️", name: "Excavator Parts", desc: "Buckets, booms, hydraulics, tracks & undercarriage components" },
              { icon: "🚜", name: "Bulldozer Parts", desc: "Blades, sprockets, rollers, idlers & complete undercarriage" },
              { icon: "🔧", name: "Hydraulic Components", desc: "Pumps, cylinders, seals, hoses & valve assemblies" },
              { icon: "⚙️", name: "Engine Parts", desc: "Filters, gaskets, turbochargers, injectors & bearings" },
              { icon: "🚛", name: "Loader Parts", desc: "Buckets, tires, axles, transmission & drivetrain parts" },
              { icon: "🏭", name: "Crane Parts", desc: "Cables, pulleys, hooks, boom sections & outriggers" },
            ].map(cat => (
              <div key={cat.name} className="cat-card" style={s.catCard}>
                <div style={s.catIconWrap}>{cat.icon}</div>
                <h3 style={s.catName}>{cat.name}</h3>
                <p style={s.catDesc}>{cat.desc}</p>
                <Link to="/products" style={s.catLink}>
                  Explore Parts
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ WHY CHOOSE US ══════ */}
      <section style={s.whySection}>
        <div style={s.sectionInner}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <p style={s.sectionLabelLight}>WHY CHOOSE US</p>
            <h2 className="section-title" style={s.sectionTitleLight}>Built for Nepal's Toughest Jobs</h2>
            <p style={s.sectionSubtitleLight}>We combine quality, speed, and expertise to keep your machines running.</p>
          </div>
          <div className="feature-grid" style={s.featureGrid}>
            {[
              { icon: "🛡️", title: "Genuine OEM Parts", desc: "All parts sourced directly from certified manufacturers ensuring 100% quality and compatibility.", color: "#f97316" },
              { icon: "💰", title: "Best Market Price", desc: "Competitive wholesale pricing with no compromise on quality. Maximum value for your investment.", color: "#fbbf24" },
              { icon: "⚡", title: "Immediate Availability", desc: "Massive inventory means most parts ship same-day. We know downtime costs you money.", color: "#34d399" },
              { icon: "👷", title: "Expert Consultation", desc: "Our team of experienced engineers helps you find the exact right part for your machine.", color: "#60a5fa" },
            ].map(f => (
              <div key={f.title} className="feature-card" style={s.featureCard}>
                <div style={{ ...s.featureGlow, background: `radial-gradient(circle at 50% 0%, ${f.color}12 0%, transparent 60%)` }} />
                <div style={{ ...s.featureIconWrap, background: f.color + "15", borderColor: f.color + "35" }}>
                  <span style={{ fontSize: 28 }}>{f.icon}</span>
                </div>
                <h3 style={s.featureTitle}>{f.title}</h3>
                <p style={s.featureDesc}>{f.desc}</p>
                <div style={{ ...s.featureBar, background: `linear-gradient(90deg, ${f.color}, transparent)` }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ FEATURED PRODUCTS ══════ */}
      <section style={s.prodSection}>
        <div style={s.sectionInner}>
          <div style={s.prodHeader}>
            <div>
              <p style={s.sectionLabel}>OUR CATALOGUE</p>
              <h2 className="section-title" style={s.sectionTitle}>Featured Products</h2>
            </div>
            <Link to="/products" style={s.viewAllBtn}>
              View All Products
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </Link>
          </div>

          {loading ? (
            <div style={s.loadingRow}><div style={s.spinner} /><span>Loading products…</span></div>
          ) : products.length === 0 ? (
            <div style={s.noProducts}><div style={{ fontSize: 48 }}>🔩</div><p>Products coming soon!</p></div>
          ) : (
            <div className="products-grid" style={s.productGrid}>
              {products.slice(0, 8).map(p => (
                <div key={p.id} className="product-card" style={s.productCard}>
                  <div style={s.productImgWrap}>
                    {p.image
                      ? <img src={p.image} alt={p.name} style={s.productImg} onError={e => { e.target.style.display = "none"; }} />
                      : <div style={s.productImgPlaceholder}>⚙️</div>
                    }
                    {p.category && <span style={s.badge}>{p.category}</span>}
                  </div>
                  <div style={s.productBody}>
                    <h3 style={s.productName}>{p.name}</h3>
                    {p.description && <p style={s.productDesc}>{p.description}</p>}
                    {p.unit && <span style={s.unitTag}>📦 per {p.unit}</span>}
                    <p style={s.productPrice}>{p.price ? "₹" + Number(p.price).toLocaleString("en-IN") : "Get Latest Price"}</p>
                    <div className="product-card-actions" style={s.productActions}>
                      <a href="tel:+9779851068337" style={s.callBtn}>📞 Call Now</a>
                      <a href="https://wa.me/9779851068337" target="_blank" rel="noreferrer" style={s.waBtn}>💬 WhatsApp</a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ══════ HOW IT WORKS ══════ */}
      <section style={s.processSection}>
        <div style={s.sectionInner}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <p style={s.sectionLabelLight}>HOW IT WORKS</p>
            <h2 className="section-title" style={s.sectionTitleLight}>Get Your Parts in 3 Simple Steps</h2>
          </div>
          <div className="process-grid" style={s.processGrid}>
            {[
              { step: "01", title: "Browse Parts", desc: "Search our extensive catalogue or tell us what you need", icon: "🔍", color: "#f97316" },
              { step: "02", title: "Request Quote", desc: "We provide competitive pricing within hours", icon: "📋", color: "#fbbf24" },
              { step: "03", title: "Fast Delivery", desc: "Parts delivered securely to your site across Nepal", icon: "🚚", color: "#34d399" },
            ].map((p, i) => (
              <div key={p.step} className="process-card" style={s.processCard}>
                <div style={s.processStep}>{p.step}</div>
                <div style={{ ...s.processIconWrap, background: p.color + "15", borderColor: p.color + "30" }}>
                  <span style={{ fontSize: 32 }}>{p.icon}</span>
                </div>
                <h3 style={s.processTitle}>{p.title}</h3>
                <p style={s.processDesc}>{p.desc}</p>
                {i < 2 && <div className="process-connector" style={s.processConnector} />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ TESTIMONIALS ══════ */}
      <section style={s.testimonialSection}>
        <div style={s.sectionInner}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <p style={s.sectionLabel}>CLIENT TESTIMONIALS</p>
            <h2 className="section-title" style={s.sectionTitle}>What Our Clients Say</h2>
          </div>
          <div className="testimonial-grid" style={s.testimonialGrid}>
            {[
              { name: "Rajesh Shrestha", role: "Fleet Manager, KTM Construction", quote: "Manakamana has been our go-to supplier for 5+ years. Their parts quality and delivery speed are unmatched in Nepal.", rating: 5 },
              { name: "Sunil Thapa", role: "Site Engineer, Nepal Infra Pvt. Ltd.", quote: "The technical expertise of their team saved us thousands in downtime costs. They always recommend the right part.", rating: 5 },
              { name: "Prakash Gurung", role: "Owner, Himalaya Earthmovers", quote: "Best prices in the market with genuine quality. Their WhatsApp ordering makes everything so convenient.", rating: 5 },
            ].map(t => (
              <div key={t.name} className="testimonial-card" style={s.testimonialCard}>
                <div style={s.testimonialStars}>
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <span key={i} style={{ color: "#f59e0b", fontSize: 16 }}>★</span>
                  ))}
                </div>
                <p style={s.testimonialQuote}>"{t.quote}"</p>
                <div style={s.testimonialAuthor}>
                  <div style={s.testimonialAvatar}>{t.name[0]}</div>
                  <div>
                    <div style={s.testimonialName}>{t.name}</div>
                    <div style={s.testimonialRole}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ CTA ══════ */}
      <section style={s.cta}>
        <div style={s.ctaGlow} />
        <div style={s.ctaInner}>
          <div style={s.ctaBadge}>🏗️ READY TO BUILD?</div>
          <h2 className="cta-title" style={s.ctaTitle}>Need Heavy Equipment Parts?</h2>
          <p className="cta-desc" style={s.ctaDesc}>
            Request a quote today and get competitive pricing, expert guidance, and fast delivery across Nepal.
          </p>
          <div style={s.ctaBtns}>
            <Link to="/contact" className="cta-btn" style={s.ctaBtn}>
              Get a Free Quote
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </Link>
            <a href="tel:+9779851068337" style={s.ctaBtnCall}>
              📞 +977-9851068337
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ══════════════════════════════════════════
   STYLES
   ══════════════════════════════════════════ */
const PRIMARY = "#b45309";
const ACCENT = "#d97706";
const DARK = "#0a0a0a";
const STEEL = "#171717";

const s = {
  page: { fontFamily: "'Inter',system-ui,sans-serif", background: "#fff" },

  /* ── Hero ── */
  hero: {
    position: "relative", background: DARK, color: "#fff",
    padding: "160px 32px 120px", overflow: "hidden", minHeight: "100vh",
    display: "flex", alignItems: "center",
  },
  heroBg: {
    position: "absolute", inset: 0,
    background: `linear-gradient(135deg, ${DARK} 0%, #1a1a1a 50%, ${STEEL} 100%)`,
  },
  heroGradient: {
    position: "absolute", inset: 0,
    background: "radial-gradient(ellipse at 20% 50%, rgba(217,119,6,0.12) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(245,158,11,0.06) 0%, transparent 40%), radial-gradient(ellipse at 60% 80%, rgba(180,83,9,0.08) 0%, transparent 40%)",
  },
  heroGrid: {
    position: "absolute", inset: 0, opacity: 0.03,
    backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
    backgroundSize: "60px 60px",
  },
  heroInner: {
    maxWidth: 1280, margin: "0 auto", display: "grid",
    gridTemplateColumns: "1.3fr 1fr", gap: 80, alignItems: "center",
    position: "relative", zIndex: 2, width: "100%",
  },
  heroLeft: {},
  heroBadge: {
    display: "inline-flex", alignItems: "center", gap: 10,
    background: "rgba(217,119,6,0.1)", color: "#f59e0b",
    border: "1px solid rgba(217,119,6,0.2)", borderRadius: 100,
    padding: "10px 24px", fontSize: 12, fontWeight: 600,
    marginBottom: 32, letterSpacing: 1.5,
  },
  badgeDot: {
    width: 8, height: 8, borderRadius: "50%", background: "#22c55e",
    boxShadow: "0 0 12px rgba(34,197,94,0.6)", display: "inline-block",
    animation: "pulse 2s ease infinite",
  },
  heroTitle: {
    fontSize: 68, fontWeight: 800, lineHeight: 1.05, margin: "0 0 28px",
    letterSpacing: "-0.04em", fontFamily: "'Space Grotesk','Inter',sans-serif",
  },
  heroAccent: {
    background: "linear-gradient(135deg, #f59e0b, #d97706, #b45309)",
    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
    backgroundClip: "text", display: "inline",
  },
  heroDesc: {
    fontSize: 18, color: "#a3a3a3", lineHeight: 1.8,
    maxWidth: 520, marginBottom: 40, fontWeight: 400,
  },
  heroBtns: { display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 40 },
  heroBtnPrimary: {
    background: "linear-gradient(135deg, #f59e0b, #d97706)", color: DARK,
    padding: "16px 36px", borderRadius: 14, fontSize: 15, fontWeight: 700,
    textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 10,
    boxShadow: "0 4px 30px rgba(217,119,6,0.3)", letterSpacing: 0.3,
  },
  heroBtnSecondary: {
    background: "rgba(255,255,255,0.05)", color: "#fff",
    padding: "16px 36px", borderRadius: 14, fontSize: 15, fontWeight: 600,
    textDecoration: "none", border: "1px solid rgba(255,255,255,0.12)",
    display: "inline-flex", alignItems: "center", gap: 10, letterSpacing: 0.3,
    backdropFilter: "blur(8px)",
  },
  trustRow: { display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap" },
  trustItem: {
    fontSize: 13, color: "#a3a3a3", fontWeight: 500, letterSpacing: 0.3,
    display: "flex", alignItems: "center", gap: 8,
  },
  heroRight: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
  heroCard: {
    position: "relative", background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20,
    padding: "32px 20px", textAlign: "center", overflow: "hidden",
    backdropFilter: "blur(16px)", transition: "all 0.4s ease",
  },
  heroCardGlow: { position: "absolute", inset: 0, pointerEvents: "none" },
  heroCardIcon: {
    fontSize: 24, marginBottom: 14, width: 52, height: 52, borderRadius: 16,
    display: "flex", alignItems: "center", justifyContent: "center",
    margin: "0 auto 14px", border: "1px solid",
  },
  heroCardVal: {
    fontSize: 36, fontWeight: 800, letterSpacing: "-0.03em",
    fontFamily: "'Space Grotesk','Inter',sans-serif",
  },
  heroCardLabel: {
    fontSize: 11, color: "#737373", marginTop: 6, fontWeight: 600,
    letterSpacing: 1.5, textTransform: "uppercase",
  },
  particle: {
    position: "absolute", width: 4, height: 4, borderRadius: "50%",
    background: "rgba(217,119,6,0.3)", animation: "float 4s ease-in-out infinite",
    pointerEvents: "none", zIndex: 1,
  },

  /* ── Brands ── */
  brandsSection: { background: DARK, borderTop: "1px solid rgba(255,255,255,0.04)", padding: "40px 0", overflow: "hidden" },
  brandsSectionLabel: {
    fontSize: 10, fontWeight: 700, letterSpacing: 4, color: "#525252",
    textTransform: "uppercase", textAlign: "center", marginBottom: 20,
  },
  brandsTrack: { overflow: "hidden", position: "relative" },
  brandsScroll: {
    display: "flex", gap: 20, width: "max-content",
    animation: "scrollBrands 30s linear infinite",
  },
  brandCard: {
    display: "flex", alignItems: "center", gap: 12, padding: "14px 28px",
    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 12, flexShrink: 0,
  },
  brandIcon: { display: "flex", alignItems: "center" },
  brandName: { fontSize: 14, fontWeight: 700, color: "#a3a3a3", letterSpacing: 0.5, whiteSpace: "nowrap" },

  /* ── Section common ── */
  sectionInner: { maxWidth: 1280, margin: "0 auto", padding: "0 32px" },
  sectionLabel: {
    fontSize: 11, fontWeight: 700, letterSpacing: 4, color: ACCENT,
    textTransform: "uppercase", marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 44, fontWeight: 800, color: DARK, margin: "0 0 16px",
    letterSpacing: "-0.03em", fontFamily: "'Space Grotesk','Inter',sans-serif",
  },
  sectionSubtitle: {
    fontSize: 17, color: "#737373", lineHeight: 1.7, maxWidth: 560, margin: "0 auto",
  },
  sectionLabelLight: {
    fontSize: 11, fontWeight: 700, letterSpacing: 4, color: "#f59e0b",
    textTransform: "uppercase", marginBottom: 12,
  },
  sectionTitleLight: {
    fontSize: 44, fontWeight: 800, color: "#fff", margin: "0 0 16px",
    letterSpacing: "-0.03em", fontFamily: "'Space Grotesk','Inter',sans-serif",
  },
  sectionSubtitleLight: {
    fontSize: 17, color: "#a3a3a3", lineHeight: 1.7, maxWidth: 560, margin: "0 auto",
  },

  /* ── Categories ── */
  catSection: { padding: "120px 0", background: "#fafafa" },
  catGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 20 },
  catCard: {
    background: "#fff", borderRadius: 20, padding: "40px 28px", textAlign: "center",
    border: "1px solid #f0f0f0", transition: "all 0.4s cubic-bezier(0.16,1,0.3,1)",
    position: "relative", overflow: "hidden",
  },
  catIconWrap: {
    fontSize: 36, marginBottom: 18, width: 76, height: 76, borderRadius: 20,
    background: "linear-gradient(135deg, #fffbeb, #fef3c7)", display: "flex",
    alignItems: "center", justifyContent: "center", margin: "0 auto",
    border: "1px solid #fde68a",
  },
  catName: {
    fontSize: 17, fontWeight: 700, color: DARK, margin: "0 0 8px",
    fontFamily: "'Space Grotesk','Inter',sans-serif",
  },
  catDesc: { fontSize: 14, color: "#737373", lineHeight: 1.7, margin: "0 0 20px" },
  catLink: {
    fontSize: 13, fontWeight: 600, color: ACCENT, textDecoration: "none",
    display: "inline-flex", alignItems: "center", gap: 6,
    letterSpacing: 0.3,
  },

  /* ── Features ── */
  whySection: { padding: "120px 0", background: DARK },
  featureGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 24 },
  featureCard: {
    background: "rgba(255,255,255,0.03)", borderRadius: 24, padding: "44px 28px",
    border: "1px solid rgba(255,255,255,0.06)", position: "relative",
    overflow: "hidden", transition: "all 0.5s cubic-bezier(0.16,1,0.3,1)",
    textAlign: "center",
  },
  featureGlow: { position: "absolute", inset: 0, pointerEvents: "none" },
  featureIconWrap: {
    fontSize: 28, marginBottom: 24, width: 72, height: 72, borderRadius: 20,
    display: "flex", alignItems: "center", justifyContent: "center",
    margin: "0 auto 24px", border: "2px solid",
  },
  featureTitle: {
    fontSize: 19, fontWeight: 700, color: "#fff", margin: "0 0 12px",
    fontFamily: "'Space Grotesk','Inter',sans-serif",
  },
  featureDesc: { fontSize: 14, color: "#a3a3a3", lineHeight: 1.8, margin: 0 },
  featureBar: { position: "absolute", bottom: 0, left: 0, right: 0, height: 3 },

  /* ── Products ── */
  prodSection: { padding: "120px 0", background: "#fff" },
  prodHeader: {
    display: "flex", justifyContent: "space-between", alignItems: "flex-end",
    marginBottom: 48, flexWrap: "wrap", gap: 20, padding: "0 32px",
  },
  viewAllBtn: {
    color: DARK, fontWeight: 600, fontSize: 14, textDecoration: "none",
    padding: "12px 28px", borderRadius: 12, border: "1px solid #e5e5e5",
    background: "#fff", letterSpacing: 0.3, display: "inline-flex",
    alignItems: "center", gap: 8,
  },
  loadingRow: {
    display: "flex", alignItems: "center", gap: 12, justifyContent: "center",
    padding: "60px 0", color: "#737373", fontSize: 14,
  },
  spinner: {
    width: 28, height: 28, border: "3px solid #f5f5f5",
    borderTop: "3px solid " + ACCENT, borderRadius: "50%", flexShrink: 0,
    animation: "spin 0.8s linear infinite",
  },
  noProducts: { textAlign: "center", padding: "60px 0", color: "#a3a3a3", fontSize: 15, lineHeight: 2 },
  productGrid: {
    display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))",
    gap: 24, padding: "0 32px",
  },
  productCard: {
    background: "#fff", borderRadius: 20, overflow: "hidden",
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)", border: "1px solid #f0f0f0",
    transition: "all 0.5s cubic-bezier(0.16,1,0.3,1)",
  },
  productImgWrap: { position: "relative", height: 220, background: "#f5f5f5" },
  productImg: { width: "100%", height: "100%", objectFit: "cover" },
  productImgPlaceholder: {
    display: "flex", alignItems: "center", justifyContent: "center",
    height: "100%", fontSize: 52, background: "#f8f8f8",
  },
  badge: {
    position: "absolute", top: 14, right: 14, background: DARK, color: "#fff",
    fontSize: 10, fontWeight: 600, padding: "5px 14px", borderRadius: 100,
    letterSpacing: 0.5,
  },
  productBody: { padding: "20px 22px 24px" },
  productName: { fontSize: 16, fontWeight: 700, color: DARK, margin: "0 0 6px" },
  productDesc: { fontSize: 13, color: "#737373", margin: "0 0 10px", lineHeight: 1.6 },
  unitTag: {
    display: "inline-block", background: "#fffbeb", color: "#92400e",
    fontSize: 11, fontWeight: 600, padding: "4px 12px", borderRadius: 100,
    marginBottom: 12,
  },
  productPrice: {
    fontSize: 22, fontWeight: 800, color: PRIMARY, margin: "0 0 16px",
    fontFamily: "'Space Grotesk','Inter',sans-serif",
  },
  productActions: { display: "flex", gap: 8 },
  callBtn: {
    flex: 1, padding: "10px", borderRadius: 12, border: "1px solid #e5e5e5",
    color: DARK, fontSize: 13, fontWeight: 600, textDecoration: "none",
    textAlign: "center",
  },
  waBtn: {
    flex: 1, padding: "10px", borderRadius: 12, background: "#22c55e",
    color: "#fff", fontSize: 13, fontWeight: 600, textDecoration: "none",
    textAlign: "center",
  },

  /* ── Process ── */
  processSection: { padding: "120px 0", background: STEEL },
  processGrid: {
    display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 32, position: "relative",
  },
  processCard: {
    background: "rgba(255,255,255,0.03)", borderRadius: 24, padding: "48px 28px",
    border: "1px solid rgba(255,255,255,0.06)", textAlign: "center",
    position: "relative", transition: "all 0.4s ease",
  },
  processStep: {
    fontSize: 48, fontWeight: 900, color: "rgba(217,119,6,0.08)",
    position: "absolute", top: 16, right: 20, letterSpacing: -2,
    fontFamily: "'Space Grotesk','Inter',sans-serif",
  },
  processIconWrap: {
    width: 72, height: 72, borderRadius: 20, display: "flex",
    alignItems: "center", justifyContent: "center", margin: "0 auto 20px",
    border: "1px solid",
  },
  processTitle: {
    fontSize: 18, fontWeight: 700, color: "#fff", margin: "0 0 10px",
    fontFamily: "'Space Grotesk','Inter',sans-serif",
  },
  processDesc: { fontSize: 14, color: "#a3a3a3", lineHeight: 1.7, margin: 0 },
  processConnector: {
    position: "absolute", top: "50%", right: -16, width: 32, height: 2,
    background: "rgba(217,119,6,0.15)", display: "none",
  },

  /* ── Testimonials ── */
  testimonialSection: { padding: "120px 0", background: "#fafafa" },
  testimonialGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24 },
  testimonialCard: {
    background: "#fff", borderRadius: 20, padding: "36px 28px",
    border: "1px solid #f0f0f0", transition: "all 0.4s ease",
  },
  testimonialStars: { marginBottom: 16, display: "flex", gap: 2 },
  testimonialQuote: {
    fontSize: 15, color: "#525252", lineHeight: 1.8, margin: "0 0 24px",
    fontStyle: "italic",
  },
  testimonialAuthor: { display: "flex", alignItems: "center", gap: 14 },
  testimonialAvatar: {
    width: 44, height: 44, borderRadius: 14,
    background: "linear-gradient(135deg, #f59e0b, #d97706)",
    display: "flex", alignItems: "center", justifyContent: "center",
    color: "#fff", fontWeight: 700, fontSize: 16, flexShrink: 0,
  },
  testimonialName: {
    fontSize: 15, fontWeight: 700, color: DARK,
    fontFamily: "'Space Grotesk','Inter',sans-serif",
  },
  testimonialRole: { fontSize: 12, color: "#a3a3a3", marginTop: 2 },

  /* ── CTA ── */
  cta: {
    background: DARK, padding: "140px 32px", textAlign: "center",
    position: "relative", overflow: "hidden",
  },
  ctaGlow: {
    position: "absolute", inset: 0,
    background: "radial-gradient(ellipse at 50% 50%, rgba(217,119,6,0.12) 0%, transparent 60%)",
    pointerEvents: "none",
  },
  ctaInner: { maxWidth: 700, margin: "0 auto", position: "relative", zIndex: 1 },
  ctaBadge: {
    display: "inline-block", background: "rgba(217,119,6,0.1)", color: "#f59e0b",
    padding: "10px 24px", borderRadius: 100, fontSize: 12, fontWeight: 700,
    letterSpacing: 3, marginBottom: 28, border: "1px solid rgba(217,119,6,0.2)",
  },
  ctaTitle: {
    fontSize: 48, fontWeight: 800, color: "#fff", margin: "0 0 20px",
    letterSpacing: "-0.03em", lineHeight: 1.1,
    fontFamily: "'Space Grotesk','Inter',sans-serif",
  },
  ctaDesc: { fontSize: 17, color: "#a3a3a3", lineHeight: 1.8, margin: "0 0 48px" },
  ctaBtns: { display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" },
  ctaBtn: {
    background: "linear-gradient(135deg, #f59e0b, #d97706)", color: DARK,
    padding: "18px 48px", borderRadius: 14, fontSize: 15, fontWeight: 700,
    textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 10,
    boxShadow: "0 4px 30px rgba(217,119,6,0.3)", letterSpacing: 0.3,
  },
  ctaBtnCall: {
    background: "rgba(255,255,255,0.05)", color: "#fff",
    padding: "18px 40px", borderRadius: 14, fontSize: 15, fontWeight: 600,
    textDecoration: "none", border: "1px solid rgba(255,255,255,0.12)",
    display: "inline-block", letterSpacing: 0.3,
    backdropFilter: "blur(8px)",
  },
};
