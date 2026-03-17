import { useState, useEffect } from "react";

export default function BackToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!show) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Back to top"
      style={{
        position: "fixed", bottom: 28, right: 28, zIndex: 9990,
        width: 48, height: 48, borderRadius: "50%",
        background: "linear-gradient(135deg, #ea580c, #f97316)",
        color: "#fff", border: "none", cursor: "pointer",
        fontSize: 20, fontWeight: 700,
        boxShadow: "0 4px 20px rgba(234,88,12,0.35)",
        display: "flex", alignItems: "center", justifyContent: "center",
        animation: "fadeInUp 0.3s ease",
        transition: "transform 0.2s ease",
      }}
      onMouseEnter={e => e.currentTarget.style.transform = "scale(1.1)"}
      onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
    >
      ↑
    </button>
  );
}



