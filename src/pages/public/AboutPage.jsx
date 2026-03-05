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

const PRIMARY = "#b45309";
const ACCENT = "#d97706";
const DARK = "#0a0a0a";
const STEEL = "#171717";

const s = {
  page: { background: "#fff", minHeight: "100vh", fontFamily: "'Inter',system-ui,sans-serif" },

  /* Hero */
  hero: {
    position: "relative", background: DARK,
    padding: "100px 32px 80px", overflow: "hidden",
  },
  heroOverlay: {
    position: "absolute", inset: 0,
    background: "radial-gradient(circle at 30% 70%, rgba(217,119,6,0.06) 0%, transparent 50%)",
  },
  heroInner: { position: "relative", maxWidth: 1280, margin: "0 auto" },
  heroBadge: {
    display: "inline-block", background: "rgba(217,119,6,0.08)", color: "#f59e0b",
    fontSize: 11, fontWeight: 700, padding: "8px 20px", borderRadius: 100,
    letterSpacing: 3, marginBottom: 24, border: "1px solid rgba(217,119,6,0.15)",
  },
  heroTitle: { fontSize: 52, fontWeight: 800, color: "#fff", margin: "0 0 20px", lineHeight: 1.1, maxWidth: 650, letterSpacing: "-0.03em", fontFamily: "'Space Grotesk','Inter',sans-serif" },
  heroDesc: { fontSize: 17, color: "#a3a3a3", lineHeight: 1.8, maxWidth: 640, margin: "0 0 48px" },
  heroStats: { display: "flex", gap: 20, flexWrap: "wrap" },
  heroStat: {
    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 20, padding: "24px 32px", minWidth: 140, textAlign: "center",
  },
  heroStatNum: { fontSize: 36, fontWeight: 800, color: "#f59e0b", letterSpacing: -1, fontFamily: "'Space Grotesk','Inter',sans-serif" },
  heroStatLabel: { fontSize: 11, color: "#737373", fontWeight: 600, marginTop: 6, letterSpacing: 1, textTransform: "uppercase" },

  /* Sections */
  section: { padding: "100px 32px" },
  darkSection: { background: DARK, padding: "100px 32px" },
  sectionInner: { maxWidth: 1280, margin: "0 auto" },
  sectionBadge: {
    display: "inline-block", background: "#fffbeb", color: PRIMARY, fontSize: 11,
    fontWeight: 700, padding: "6px 18px", borderRadius: 100, letterSpacing: 3,
    marginBottom: 16, border: "1px solid #fde68a",
  },
  sectionBadgeDark: {
    display: "inline-block", background: "rgba(217,119,6,0.08)", color: "#f59e0b",
    fontSize: 11, fontWeight: 700, padding: "6px 18px", borderRadius: 100,
    letterSpacing: 3, marginBottom: 16, border: "1px solid rgba(217,119,6,0.15)",
  },
  h2: { fontSize: 36, fontWeight: 800, color: DARK, margin: "0 0 28px", letterSpacing: "-0.02em", fontFamily: "'Space Grotesk','Inter',sans-serif" },
  darkH2: { fontSize: 36, fontWeight: 800, color: "#fff", margin: "0", letterSpacing: "-0.02em", fontFamily: "'Space Grotesk','Inter',sans-serif" },
  p: { fontSize: 16, color: "#525252", lineHeight: 1.9, margin: "0 0 16px" },

  /* Story Grid */
  storyGrid: { display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 60, alignItems: "start" },
  missionCard: {
    background: DARK, borderRadius: 28, padding: "44px 32px",
    color: "#fff",
  },
  missionIcon: { fontSize: 28, marginBottom: 10 },
  missionTitle: { fontSize: 20, fontWeight: 700, margin: "0 0 10px", color: "#fff", fontFamily: "'Space Grotesk','Inter',sans-serif" },
  missionDesc: { fontSize: 15, lineHeight: 1.8, margin: 0, color: "#a3a3a3" },
  missionDivider: { height: 1, background: "rgba(255,255,255,0.06)", margin: "28px 0" },

  /* Why Cards */
  whyGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px,1fr))", gap: 24 },
  whyCard: {
    background: "rgba(255,255,255,0.03)", borderRadius: 24, padding: "32px 24px",
    border: "1px solid rgba(255,255,255,0.06)",
  },
  whyIconWrap: {
    fontSize: 24, marginBottom: 16, width: 52, height: 52, borderRadius: 16,
    background: "rgba(217,119,6,0.08)", display: "flex", alignItems: "center", justifyContent: "center",
    color: "#f59e0b",
  },
  whyTitle: { fontSize: 17, fontWeight: 700, color: "#fff", margin: "0 0 10px" },
  whyDesc: { fontSize: 14, color: "#a3a3a3", lineHeight: 1.8, margin: 0 },

  /* Brands */
  brandsGrid: {
    display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center",
  },
  brandChip: {
    background: "#fafafa", border: "1px solid #f5f5f5", borderRadius: 100,
    padding: "14px 28px", fontSize: 14, fontWeight: 700, color: DARK,
  },

  /* Process */
  processGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px,1fr))", gap: 24 },
  processCard: {
    background: "#fafafa", borderRadius: 24, padding: "36px 24px",
    border: "1px solid #f5f5f5", position: "relative",
  },
  processStep: {
    fontSize: 36, fontWeight: 800, color: "rgba(217,119,6,0.08)",
    marginBottom: 10, letterSpacing: -1, fontFamily: "'Space Grotesk','Inter',sans-serif",
  },
  processTitle: { fontSize: 17, fontWeight: 700, color: DARK, margin: "0 0 10px" },
  processDesc: { fontSize: 14, color: "#737373", lineHeight: 1.8, margin: 0 },
};
