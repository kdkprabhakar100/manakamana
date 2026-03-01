export default function AboutPage() {
  return (
    <div style={s.page}>
      <div style={s.inner}>

        <section style={s.hero}>
          <p style={s.label}>WHO WE ARE</p>
          <h1 className="page-title" style={s.title}>About Manakamana Heavy Equipments Pvt. Ltd.</h1>
          <p style={s.subtitle}>
            A trusted name in heavy machinery parts and equipment supply across Nepal,
            committed to quality, reliability, and customer satisfaction.
          </p>
        </section>

        <div className="about-grid" style={s.grid}>
          <div style={s.textCol}>
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

            <h2 style={{ ...s.h2, marginTop: 32 }}>Our Mission</h2>
            <p style={s.p}>
              To be the most reliable and accessible source of heavy machinery components
              in Nepal — bridging the gap between manufacturers and the professionals
              who depend on their equipment every day.
            </p>
          </div>

          <div style={s.statsCol}>
            {[
              { n: "10+",  l: "Years of Experience" },
              { n: "5000+",l: "Parts in Inventory" },
              { n: "200+", l: "Satisfied Clients" },
              { n: "50+",  l: "Brands Supported" },
            ].map(st => (
              <div key={st.l} style={s.statCard}>
                <div style={s.statNum}>{st.n}</div>
                <div style={s.statLabel}>{st.l}</div>
              </div>
            ))}
          </div>
        </div>

        <section style={s.valuesSection}>
          <h2 style={{ ...s.h2, marginBottom: 28 }}>Our Values</h2>
          <div style={s.valuesGrid}>
            {[
              { icon:"✅", t:"Quality First",       d:"Every product is verified for authenticity and quality before it reaches you." },
              { icon:"🤝", t:"Customer Trust",      d:"We build long-term relationships based on honesty, transparency, and reliability." },
              { icon:"⚡", t:"Fast Turnaround",     d:"We understand downtime costs money. We work fast so your machines don't stay idle." },
              { icon:"💡", t:"Expert Knowledge",    d:"Our team knows heavy machinery inside out and provides the right guidance every time." },
            ].map(v => (
              <div key={v.t} style={s.valueCard}>
                <div style={s.valueIcon}>{v.icon}</div>
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

const s = {
  page: { background: "#f8fafc", minHeight: "100vh", fontFamily: "'Segoe UI', sans-serif" },
  inner: { maxWidth: 1100, margin: "0 auto", padding: "48px 24px" },
  hero: { marginBottom: 48, maxWidth: 720 },
  label: { fontSize: 11, fontWeight: 800, letterSpacing: 2, color: "#0ea5e9", textTransform: "uppercase", marginBottom: 8 },
  title: { fontSize: 36, fontWeight: 800, color: "#0f172a", margin: "0 0 16px", lineHeight: 1.2 },
  subtitle: { fontSize: 16, color: "#64748b", lineHeight: 1.7, margin: 0 },
  grid: { display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 48, marginBottom: 56, alignItems: "start" },
  textCol: {},
  h2: { fontSize: 22, fontWeight: 800, color: "#0f172a", margin: "0 0 14px" },
  p: { fontSize: 14, color: "#475569", lineHeight: 1.8, margin: "0 0 14px" },
  statsCol: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
  statCard: { background: "#fff", borderRadius: 14, padding: "24px 20px", textAlign: "center", boxShadow: "0 2px 10px rgba(0,0,0,0.06)", border: "1px solid #f1f5f9" },
  statNum: { fontSize: 32, fontWeight: 900, color: "#0ea5e9" },
  statLabel: { fontSize: 12, color: "#64748b", marginTop: 4, fontWeight: 600 },
  valuesSection: {},
  valuesGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px,1fr))", gap: 20 },
  valueCard: { background: "#fff", borderRadius: 14, padding: "24px 20px", boxShadow: "0 2px 10px rgba(0,0,0,0.06)" },
  valueIcon: { fontSize: 28, marginBottom: 10 },
  valueTitle: { fontSize: 15, fontWeight: 700, color: "#0f172a", margin: "0 0 8px" },
  valueDesc: { fontSize: 13, color: "#64748b", lineHeight: 1.6, margin: 0 },
};
