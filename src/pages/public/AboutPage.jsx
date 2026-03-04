export default function AboutPage() {
  return (
    <div style={s.page}>
      {/* Hero Header */}
      <div style={s.hero}>
        <div style={s.heroOverlay} />
        <div style={s.heroInner}>
          <span style={s.heroBadge}>&#9881; ESTABLISHED IN NEPAL</span>
          <h1 className="page-title" style={s.heroTitle}>Built for the Toughest Jobs</h1>
          <p style={s.heroDesc}>
            Manakamana Heavy Equipments Pvt. Ltd. is Nepal's trusted supplier of genuine heavy machinery parts and equipment,
            serving contractors and fleet operators nationwide.
          </p>
          <div style={s.heroStats}>
            {[
              { n: "10+", l: "Years Experience" },
              { n: "5000+", l: "Parts Inventory" },
              { n: "200+", l: "Happy Clients" },
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

const PRIMARY = "#ea580c";
const DARK = "#0f172a";
const STEEL = "#1e293b";

const s = {
  page: { background: "#f8fafc", minHeight: "100vh", fontFamily: "'Inter','Segoe UI',sans-serif" },

  /* Hero */
  hero: {
    position: "relative", background: `linear-gradient(135deg, ${DARK} 0%, ${STEEL} 50%, #0c1829 100%)`,
    padding: "72px 24px 64px", overflow: "hidden",
  },
  heroOverlay: {
    position: "absolute", inset: 0, opacity: 0.04,
    backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,0.05) 35px, rgba(255,255,255,0.05) 36px)",
  },
  heroInner: { position: "relative", maxWidth: 1100, margin: "0 auto" },
  heroBadge: {
    display: "inline-block", background: "rgba(249,115,22,0.12)", color: "#f97316",
    fontSize: 11, fontWeight: 700, padding: "6px 16px", borderRadius: 20,
    letterSpacing: 2, marginBottom: 20, border: "1px solid rgba(249,115,22,0.2)",
  },
  heroTitle: { fontSize: 42, fontWeight: 900, color: "#fff", margin: "0 0 16px", lineHeight: 1.15, maxWidth: 600 },
  heroDesc: { fontSize: 16, color: "#94a3b8", lineHeight: 1.7, maxWidth: 640, margin: "0 0 40px" },
  heroStats: { display: "flex", gap: 32, flexWrap: "wrap" },
  heroStat: {
    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 14, padding: "20px 28px", minWidth: 130, textAlign: "center",
  },
  heroStatNum: { fontSize: 32, fontWeight: 900, color: "#f97316", letterSpacing: -1 },
  heroStatLabel: { fontSize: 11, color: "#94a3b8", fontWeight: 600, marginTop: 4 },

  /* Sections */
  section: { padding: "64px 24px" },
  darkSection: { background: DARK, padding: "64px 24px" },
  sectionInner: { maxWidth: 1100, margin: "0 auto" },
  sectionBadge: {
    display: "inline-block", background: "#fff7ed", color: PRIMARY, fontSize: 11,
    fontWeight: 700, padding: "5px 14px", borderRadius: 20, letterSpacing: 2,
    marginBottom: 12, border: "1px solid #fed7aa",
  },
  sectionBadgeDark: {
    display: "inline-block", background: "rgba(249,115,22,0.1)", color: "#f97316",
    fontSize: 11, fontWeight: 700, padding: "5px 14px", borderRadius: 20,
    letterSpacing: 2, marginBottom: 12, border: "1px solid rgba(249,115,22,0.2)",
  },
  h2: { fontSize: 28, fontWeight: 800, color: DARK, margin: "0 0 20px" },
  darkH2: { fontSize: 28, fontWeight: 800, color: "#fff", margin: "0" },
  p: { fontSize: 15, color: "#475569", lineHeight: 1.8, margin: "0 0 14px" },

  /* Story Grid */
  storyGrid: { display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 48, alignItems: "start" },
  missionCard: {
    background: "linear-gradient(135deg, #ea580c, #c2410c)", borderRadius: 20, padding: "36px 28px",
    color: "#fff",
  },
  missionIcon: { fontSize: 28, marginBottom: 8 },
  missionTitle: { fontSize: 18, fontWeight: 800, margin: "0 0 8px", color: "#fff" },
  missionDesc: { fontSize: 14, lineHeight: 1.7, margin: 0, color: "rgba(255,255,255,0.85)" },
  missionDivider: { height: 1, background: "rgba(255,255,255,0.2)", margin: "24px 0" },

  /* Why Cards */
  whyGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px,1fr))", gap: 20 },
  whyCard: {
    background: STEEL, borderRadius: 16, padding: "28px 22px",
    border: "1px solid rgba(255,255,255,0.06)",
  },
  whyIconWrap: {
    fontSize: 24, marginBottom: 12, width: 48, height: 48, borderRadius: 12,
    background: "rgba(249,115,22,0.1)", display: "flex", alignItems: "center", justifyContent: "center",
    color: "#f97316",
  },
  whyTitle: { fontSize: 16, fontWeight: 700, color: "#fff", margin: "0 0 8px" },
  whyDesc: { fontSize: 13, color: "#94a3b8", lineHeight: 1.7, margin: 0 },

  /* Brands */
  brandsGrid: {
    display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center",
  },
  brandChip: {
    background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10,
    padding: "12px 24px", fontSize: 14, fontWeight: 700, color: DARK,
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
  },

  /* Process */
  processGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px,1fr))", gap: 20 },
  processCard: {
    background: "#fff", borderRadius: 16, padding: "28px 22px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)",
    border: "1px solid #f1f5f9", position: "relative",
  },
  processStep: {
    fontSize: 32, fontWeight: 900, color: "rgba(234,88,12,0.12)",
    marginBottom: 8, letterSpacing: -1,
  },
  processTitle: { fontSize: 16, fontWeight: 700, color: DARK, margin: "0 0 8px" },
  processDesc: { fontSize: 13, color: "#64748b", lineHeight: 1.7, margin: 0 },
};
