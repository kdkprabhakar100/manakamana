export default function AboutPage() {
  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.pageHeader}>
        <div style={s.headerInner}>
          <p style={s.label}>WHO WE ARE</p>
          <h1 className="page-title" style={s.title}>About Manakamana Heavy Equipments</h1>
          <p style={s.subtitle}>
            A trusted name in heavy machinery parts and equipment supply across Nepal,
            committed to quality, reliability, and customer satisfaction.
          </p>
        </div>
      </div>

      <div style={s.inner}>
        <div className="about-grid" style={s.grid}>
          <div style={s.textCol}>
            <div style={s.storyBadge}>Our Journey</div>
            <h2 style={s.h2}>Our Story</h2>
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

            <div style={s.divider} />

            <h2 style={s.h2}>Our Mission</h2>
            <p style={s.p}>
              To be the most reliable and accessible source of heavy machinery components
              in Nepal — bridging the gap between manufacturers and the professionals
              who depend on their equipment every day.
            </p>
          </div>

          <div style={s.statsCol}>
            {[
              { n: "10+",  l: "Years of Experience", icon: "📅" },
              { n: "5000+", l: "Parts in Inventory", icon: "⚙️" },
              { n: "200+", l: "Satisfied Clients", icon: "🤝" },
              { n: "50+",  l: "Brands Supported", icon: "🏷️" },
            ].map(st => (
              <div key={st.l} style={s.statCard}>
                <div style={s.statIcon}>{st.icon}</div>
                <div style={s.statNum}>{st.n}</div>
                <div style={s.statLabel}>{st.l}</div>
              </div>
            ))}
          </div>
        </div>

        <section style={s.valuesSection}>
          <p style={s.valuesLabel}>WHAT DRIVES US</p>
          <h2 style={s.valuesH2}>Our Values</h2>
          <div style={s.valuesGrid}>
            {[
              { icon:"✅", t:"Quality First",       d:"Every product is verified for authenticity and quality before it reaches you." },
              { icon:"🤝", t:"Customer Trust",      d:"We build long-term relationships based on honesty, transparency, and reliability." },
              { icon:"⚡", t:"Fast Turnaround",     d:"We understand downtime costs money. We work fast so your machines don't stay idle." },
              { icon:"💡", t:"Expert Knowledge",    d:"Our team knows heavy machinery inside out and provides the right guidance every time." },
            ].map(v => (
              <div key={v.t} style={s.valueCard}>
                <div style={s.valueIconWrap}>{v.icon}</div>
                <h3 style={s.valueTitle}>{v.t}</h3>
                <p style={s.valueDesc}>{v.d}</p>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}

const PRIMARY = "#ea580c";

const s = {
  page: { background: "#fafafa", minHeight: "100vh", fontFamily: "'Inter', 'Segoe UI', sans-serif" },
  pageHeader: {
    background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
    padding: "48px 24px 52px", color: "#fff",
  },
  headerInner: { maxWidth: 1100, margin: "0 auto" },
  label: { fontSize: 12, fontWeight: 800, letterSpacing: 3, color: "#f97316", textTransform: "uppercase", marginBottom: 8 },
  title: { fontSize: 36, fontWeight: 800, color: "#fff", margin: "0 0 14px", lineHeight: 1.2, letterSpacing: "-0.01em" },
  subtitle: { fontSize: 16, color: "#94a3b8", lineHeight: 1.7, margin: 0, maxWidth: 640 },
  inner: { maxWidth: 1100, margin: "0 auto", padding: "48px 24px" },
  grid: { display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 48, marginBottom: 64, alignItems: "start" },
  textCol: {},
  storyBadge: {
    display: "inline-block", background: "#fff7ed", color: PRIMARY, fontSize: 12,
    fontWeight: 700, padding: "5px 14px", borderRadius: 20, marginBottom: 14,
    border: `1px solid #fed7aa`,
  },
  h2: { fontSize: 24, fontWeight: 800, color: "#0f172a", margin: "0 0 16px" },
  p: { fontSize: 15, color: "#475569", lineHeight: 1.8, margin: "0 0 14px" },
  divider: { height: 2, width: 48, background: `linear-gradient(90deg, ${PRIMARY}, #fb923c)`, borderRadius: 2, margin: "28px 0" },
  statsCol: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
  statCard: {
    background: "#fff", borderRadius: 16, padding: "28px 20px", textAlign: "center",
    boxShadow: "0 1px 4px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)",
    border: "1px solid #f1f5f9",
    transition: "all 0.3s ease",
  },
  statIcon: { fontSize: 24, marginBottom: 8 },
  statNum: { fontSize: 34, fontWeight: 900, color: PRIMARY, letterSpacing: "-0.02em" },
  statLabel: { fontSize: 12, color: "#64748b", marginTop: 4, fontWeight: 600 },
  valuesSection: { marginTop: 16 },
  valuesLabel: { fontSize: 12, fontWeight: 800, letterSpacing: 3, color: PRIMARY, textTransform: "uppercase", marginBottom: 8 },
  valuesH2: { fontSize: 28, fontWeight: 800, color: "#0f172a", marginBottom: 28, marginTop: 0 },
  valuesGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px,1fr))", gap: 20 },
  valueCard: {
    background: "#fff", borderRadius: 16, padding: "28px 22px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)",
    border: "1px solid #f1f5f9",
    transition: "all 0.3s ease",
  },
  valueIconWrap: {
    fontSize: 24, marginBottom: 12,
    width: 48, height: 48, borderRadius: 12,
    background: "#fff7ed", display: "flex", alignItems: "center", justifyContent: "center",
  },
  valueTitle: { fontSize: 16, fontWeight: 700, color: "#0f172a", margin: "0 0 8px" },
  valueDesc: { fontSize: 13, color: "#64748b", lineHeight: 1.7, margin: 0 },
};
