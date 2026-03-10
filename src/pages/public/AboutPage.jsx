import { useState, useRef, useEffect } from "react";

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

export default function AboutPage() {
  const [countYears] = useCounter(10);
  const [countParts] = useCounter(5000);
  const [countClients] = useCounter(200);
  const [countBrands, countRef] = useCounter(50);

  return (
    <div style={s.page}>
      {/* Hero Header */}
      <div style={s.hero}>
        <div style={s.heroOverlay} />
        <div style={s.heroGrid} />
        <div style={s.heroInner}>
          <span style={s.heroBadge}>⚙ ESTABLISHED IN NEPAL</span>
          <h1 className="page-title" style={s.heroTitle}>Built for the<br /><span style={{ color: "#f59e0b" }}>Toughest Jobs</span></h1>
          <p style={s.heroDesc}>
            Manakamana Heavy Equipments Pvt. Ltd. is Nepal's trusted supplier of genuine heavy machinery parts and equipment,
            serving contractors and fleet operators nationwide.
          </p>
          <div ref={countRef} style={s.heroStats}>
            {[
              { n: countYears + "+", l: "Years Experience" },
              { n: countParts.toLocaleString() + "+", l: "Parts Inventory" },
              { n: countClients + "+", l: "Happy Clients" },
              { n: countBrands + "+", l: "Brands Covered" },
            ].map(st => (
              <div key={st.l} style={s.heroStat}>
                <div style={s.heroStatNum}>{st.n}</div>
                <div style={s.heroStatLabel}>{st.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Story Section */}
      <div style={s.section}>
        <div style={s.sectionInner}>
          <div className="about-grid" style={s.storyGrid}>
            <div>
              <span style={s.sectionBadge}>OUR JOURNEY</span>
              <h2 style={s.h2}>The Manakamana Story</h2>
              <p style={s.p}>
                Manakamana Heavy Equipments Pvt. Ltd. was founded with a single mission:
                to provide Nepal's construction and infrastructure industry with genuine,
                high-quality spare parts for heavy machinery at the best possible prices.
              </p>
              <p style={s.p}>
                Over the years, we have grown into one of the most trusted suppliers in
                the country, serving contractors, fleet operators, and equipment dealers
                from Kathmandu to all major provinces.
              </p>
              <p style={s.p}>
                Our team of experienced professionals ensures that every part we supply
                meets strict quality standards, whether it's an excavator gear set,
                hydraulic seal kit, or track assembly.
              </p>
            </div>
            <div>
              <div style={s.missionCard}>
                <div style={s.missionIcon}>&#127919;</div>
                <h3 style={s.missionTitle}>Our Mission</h3>
                <p style={s.missionDesc}>
                  To be the most reliable and accessible source of heavy machinery components
                  in Nepal - bridging the gap between manufacturers and the professionals
                  who depend on their equipment every day.
                </p>
                <div style={s.missionDivider} />
                <div style={s.missionIcon}>&#128161;</div>
                <h3 style={s.missionTitle}>Our Vision</h3>
                <p style={s.missionDesc}>
                  To become the one-stop solution for all heavy equipment needs in South Asia,
                  expanding our reach while maintaining the quality and trust our customers rely on.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Voice of the Chairperson */}
      <div style={s.section}>
        <div style={s.sectionInner}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <span style={s.sectionBadge}>LEADERSHIP</span>
            <h2 style={s.h2}>Voice of the Chairperson</h2>
          </div>
          <div className="about-grid" style={s.chairGrid}>
            <div style={s.chairImageWrap}>
              <img
                src="/chairperson.jpg"
                alt="Khadga Karki - Chairperson"
                style={s.chairImage}
              />
              <div style={s.chairNameCard}>
                <h3 style={s.chairName}>Khadga Karki</h3>
                <p style={s.chairRole}>Founder & Chairperson</p>
              </div>
            </div>
            <div style={s.chairContent}>
              <div style={s.quoteIcon}>&ldquo;</div>
              <p style={s.chairQuote}>
                In the bustling landscape of Nepal's construction industry, we started our journey in 20** AD
                as <strong>Manakamana Heavy Equipment and Suppliers</strong>, initially focusing on supplying
                raw materials like sand and stones for construction.
              </p>
              <p style={s.chairQuote}>
                As the company grew, we quickly became a leader in the supply segment, overcoming
                the challenges posed by the scarcity of labor. We strategically invested in backhoe loaders
                to streamline our loading processes, which paved the way for our foray into the rental segment.
              </p>
              <p style={s.chairQuote}>
                Recognizing the monopoly in the parts market and the lack of quality products within an
                affordable range, we ventured into trading reliable goods — importing top-tier aftermarket
                parts to ensure customer satisfaction and reliability.
              </p>
              <p style={s.chairQuote}>
                Our vision has always been to build on resilience, innovation, and customer-centricity.
                Every step we've taken has been guided by a commitment to excellence in construction
                and services.
              </p>
              <div style={s.quoteIcon}>&rdquo;</div>
            </div>
          </div>
        </div>
      </div>

      {/* Why Choose Us */}
      <div style={s.darkSection}>
        <div style={s.sectionInner}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <span style={s.sectionBadgeDark}>WHY CHOOSE US</span>
            <h2 style={s.darkH2}>What Sets Us Apart</h2>
          </div>
          <div style={s.whyGrid}>
            {[
              { icon: "✅", t: "Quality First", d: "Every product is verified for authenticity and quality before it reaches you. We source directly from OEM and trusted aftermarket manufacturers." },
              { icon: "🤝", t: "Customer Trust", d: "We build long-term relationships based on honesty, transparency, and reliability. Your success is our success." },
              { icon: "⚡", t: "Fast Turnaround", d: "We understand downtime costs money. Our efficient logistics ensure your machines don't stay idle." },
              { icon: "🛠", t: "Expert Support", d: "Our team knows heavy machinery inside out and provides the right technical guidance every time." },
            ].map(v => (
              <div key={v.t} style={s.whyCard}>
                <div style={s.whyIconWrap}>{v.icon}</div>
                <h3 style={s.whyTitle}>{v.t}</h3>
                <p style={s.whyDesc}>{v.d}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Brands we serve */}
      <div style={s.section}>
        <div style={s.sectionInner}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <span style={s.sectionBadge}>TRUSTED BRANDS</span>
            <h2 style={s.h2}>Brands We Supply Parts For</h2>
          </div>
          <div style={s.brandsGrid}>
            {["Caterpillar","Komatsu","Hitachi","Volvo","Hyundai","JCB","Doosan","Kobelco","Liebherr","CASE"].map(b=>(
              <div key={b} style={s.brandChip}>{b}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Process / How we work */}
      <div style={s.section}>
        <div style={s.sectionInner}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <span style={s.sectionBadge}>HOW WE WORK</span>
            <h2 style={s.h2}>Simple, Transparent Process</h2>
          </div>
          <div className="process-grid" style={s.processGrid}>
            {[
              { step: "01", t: "Share Requirements", d: "Tell us what parts or equipment you need via call, WhatsApp, or our contact form." },
              { step: "02", t: "Get Expert Quote", d: "Our team checks availability, verifies compatibility, and provides a competitive quote." },
              { step: "03", t: "Confirm & Pay", d: "Approve the quote, choose your payment method, and we start processing your order." },
              { step: "04", t: "Fast Delivery", d: "We pack and ship your order with care, ensuring timely delivery to your location." },
            ].map(p => (
              <div key={p.step} style={s.processCard}>
                <div style={s.processStep}>{p.step}</div>
                <h3 style={s.processTitle}>{p.t}</h3>
                <p style={s.processDesc}>{p.d}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const PRIMARY = "#b45309";
const ACCENT = "#d97706";
const DARK = "#0a0a0a";
const STEEL = "#171717";

const s = {
  page: { background: "#fff", minHeight: "100vh", fontFamily: "'Inter',system-ui,sans-serif" },

  /* Hero */
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
  heroTitle: { fontSize: 52, fontWeight: 800, color: "#fff", margin: "0 0 20px", lineHeight: 1.1, maxWidth: 650, letterSpacing: "-0.03em", fontFamily: "'Space Grotesk','Inter',sans-serif" },
  heroDesc: { fontSize: 17, color: "#a3a3a3", lineHeight: 1.8, maxWidth: 640, margin: "0 0 48px" },
  heroStats: { display: "flex", gap: 16, flexWrap: "wrap" },
  heroStat: {
    background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 20, padding: "20px 28px", minWidth: 130, textAlign: "center",
    backdropFilter: "blur(8px)",
  },
  heroStatNum: { fontSize: 30, fontWeight: 800, color: "#f59e0b", letterSpacing: -1, fontFamily: "'Space Grotesk','Inter',sans-serif" },
  heroStatLabel: { fontSize: 11, color: "#737373", fontWeight: 600, marginTop: 4, letterSpacing: 1, textTransform: "uppercase" },

  /* Sections */
  section: { padding: "80px 32px" },
  darkSection: { background: `linear-gradient(135deg, ${DARK} 0%, ${STEEL} 100%)`, padding: "80px 32px", position: "relative", overflow: "hidden" },
  sectionInner: { maxWidth: 1280, margin: "0 auto" },
  sectionBadge: {
    display: "inline-block", background: "#fffbeb", color: PRIMARY, fontSize: 11,
    fontWeight: 700, padding: "6px 18px", borderRadius: 100, letterSpacing: 3,
    marginBottom: 16, border: "1px solid #fde68a",
  },
  sectionBadgeDark: {
    display: "inline-block", background: "rgba(217,119,6,0.1)", color: "#f59e0b",
    fontSize: 11, fontWeight: 700, padding: "6px 18px", borderRadius: 100,
    letterSpacing: 3, marginBottom: 16, border: "1px solid rgba(217,119,6,0.2)",
  },
  h2: { fontSize: 36, fontWeight: 800, color: DARK, margin: "0 0 28px", letterSpacing: "-0.02em", fontFamily: "'Space Grotesk','Inter',sans-serif" },
  darkH2: { fontSize: 36, fontWeight: 800, color: "#fff", margin: "0", letterSpacing: "-0.02em", fontFamily: "'Space Grotesk','Inter',sans-serif" },
  p: { fontSize: 16, color: "#525252", lineHeight: 1.9, margin: "0 0 16px" },

  /* Story Grid */
  storyGrid: { display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 60, alignItems: "start" },
  missionCard: {
    background: `linear-gradient(135deg, ${DARK} 0%, ${STEEL} 100%)`, borderRadius: 28, padding: "44px 32px",
    color: "#fff", boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
  },
  missionIcon: { fontSize: 28, marginBottom: 10 },
  missionTitle: { fontSize: 20, fontWeight: 700, margin: "0 0 10px", color: "#fff", fontFamily: "'Space Grotesk','Inter',sans-serif" },
  missionDesc: { fontSize: 15, lineHeight: 1.8, margin: 0, color: "#a3a3a3" },
  missionDivider: { height: 1, background: "rgba(255,255,255,0.06)", margin: "28px 0" },

  /* Chairperson */
  chairGrid: { display: "grid", gridTemplateColumns: "400px 1fr", gap: 60, alignItems: "center" },
  chairImageWrap: { position: "relative", textAlign: "center" },
  chairImage: {
    width: "100%", maxWidth: 360, borderRadius: 28, objectFit: "cover",
    aspectRatio: "3/4", boxShadow: "0 20px 60px rgba(0,0,0,0.12)",
    border: "4px solid #fff",
  },
  chairNameCard: {
    background: `linear-gradient(135deg, ${DARK} 0%, ${STEEL} 100%)`, borderRadius: 16, padding: "16px 24px",
    display: "inline-block", marginTop: -32, position: "relative", zIndex: 2,
    boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
  },
  chairName: {
    fontSize: 18, fontWeight: 700, color: "#fff", margin: 0,
    fontFamily: "'Space Grotesk','Inter',sans-serif",
  },
  chairRole: { fontSize: 13, color: "#f59e0b", margin: "4px 0 0", fontWeight: 600 },
  chairContent: { position: "relative" },
  quoteIcon: {
    fontSize: 64, color: "rgba(217,119,6,0.15)", fontFamily: "Georgia, serif",
    lineHeight: 0.8, fontWeight: 700,
  },
  chairQuote: {
    fontSize: 16, color: "#525252", lineHeight: 1.9, margin: "0 0 16px",
  },

  /* Why Cards */
  whyGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px,1fr))", gap: 24 },
  whyCard: {
    background: "rgba(255,255,255,0.04)", borderRadius: 24, padding: "32px 24px",
    border: "1px solid rgba(255,255,255,0.08)",
    transition: "all 0.4s cubic-bezier(0.16,1,0.3,1)",
  },
  whyIconWrap: {
    fontSize: 24, marginBottom: 16, width: 52, height: 52, borderRadius: 16,
    background: "rgba(217,119,6,0.1)", display: "flex", alignItems: "center", justifyContent: "center",
    color: "#f59e0b",
  },
  whyTitle: { fontSize: 17, fontWeight: 700, color: "#fff", margin: "0 0 10px" },
  whyDesc: { fontSize: 14, color: "#a3a3a3", lineHeight: 1.8, margin: 0 },

  /* Brands */
  brandsGrid: {
    display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center",
  },
  brandChip: {
    background: "#fafafa", border: "1.5px solid #f0f0f0", borderRadius: 100,
    padding: "14px 28px", fontSize: 14, fontWeight: 700, color: DARK,
    transition: "all 0.3s cubic-bezier(0.16,1,0.3,1)",
  },

  /* Process */
  processGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px,1fr))", gap: 24 },
  processCard: {
    background: "#fafafa", borderRadius: 24, padding: "36px 24px",
    border: "1.5px solid #f0f0f0", position: "relative",
    transition: "all 0.4s cubic-bezier(0.16,1,0.3,1)",
  },
  processStep: {
    fontSize: 36, fontWeight: 800, color: "rgba(217,119,6,0.12)",
    marginBottom: 10, letterSpacing: -1, fontFamily: "'Space Grotesk','Inter',sans-serif",
  },
  processTitle: { fontSize: 17, fontWeight: 700, color: DARK, margin: "0 0 10px" },
  processDesc: { fontSize: 14, color: "#737373", lineHeight: 1.8, margin: 0 },
};
