import { useState, useRef, useEffect } from "react";

/**
 * RackSelector — two-level rack + section dropdown
 *
 * Props:
 *   racks        — array of { id, name, sections: string[] }
 *   value        — { rack: string, section: string }
 *   onChange     — (value) => void
 *   onAddRack    — async (name) => void
 *   onAddSection — async (rackId, sectionName) => void
 *   onDeleteRack — async (rackId) => void
 *   onDeleteSection — async (rackId, sectionName) => void
 *   PRIMARY      — brand colour string
 *   s            — style object (pass s.input / s.fieldLabel from parent)
 */

const PRIMARY = "#ea580c";
const PRIMARY_LIGHT = "#f97316";

export function RackSelector({
  racks = [],
  value = { rack: "", section: "" },
  onChange,
  onAddRack,
  onAddSection,
  onDeleteRack,
  onDeleteSection,
}) {
  /* ── Rack dropdown ── */
  const [rackOpen, setRackOpen] = useState(false);
  const [rackSearch, setRackSearch] = useState("");
  const [addingRack, setAddingRack] = useState(false);
  const [newRackName, setNewRackName] = useState("");
  const rackRef = useRef();

  /* ── Section dropdown ── */
  const [secOpen, setSecOpen] = useState(false);
  const [secSearch, setSecSearch] = useState("");
  const [addingSec, setAddingSec] = useState(false);
  const [newSecName, setNewSecName] = useState("");
  const secRef = useRef();

  /* Close on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (rackRef.current && !rackRef.current.contains(e.target)) {
        setRackOpen(false);
        setAddingRack(false);
      }
      if (secRef.current && !secRef.current.contains(e.target)) {
        setSecOpen(false);
        setAddingSec(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selectedRackObj = racks.find((r) => r.name === value.rack);

  const filteredRacks = racks.filter((r) =>
    r.name.toLowerCase().includes(rackSearch.toLowerCase())
  );

  const filteredSections = (selectedRackObj?.sections || []).filter((sec) =>
    sec.toLowerCase().includes(secSearch.toLowerCase())
  );

  /* ── Handlers ── */
  const selectRack = (name) => {
    onChange({ rack: name, section: "" });
    setRackOpen(false);
    setRackSearch("");
    setAddingRack(false);
  };

  const selectSection = (sec) => {
    onChange({ ...value, section: sec });
    setSecOpen(false);
    setSecSearch("");
    setAddingSec(false);
  };

  const doAddRack = async () => {
    const name = newRackName.trim();
    if (!name) return;
    await onAddRack(name);
    onChange({ rack: name, section: "" });
    setNewRackName("");
    setAddingRack(false);
    setRackOpen(false);
  };

  const doAddSection = async () => {
    const name = newSecName.trim();
    if (!name || !selectedRackObj) return;
    await onAddSection(selectedRackObj.id, name);
    onChange({ ...value, section: name });
    setNewSecName("");
    setAddingSec(false);
    setSecOpen(false);
  };

  /* ── Shared dropdown wrapper ── */
  const dropStyle = {
    position: "absolute",
    top: "calc(100% + 4px)",
    left: 0,
    right: 0,
    zIndex: 70,
    background: "#fff",
    borderRadius: 10,
    border: "1.5px solid #e2e8f0",
    boxShadow: "0 8px 28px rgba(0,0,0,0.12)",
    maxHeight: 220,
    overflowY: "auto",
  };

  const rowStyle = (active) => ({
    padding: "8px 12px",
    cursor: "pointer",
    fontSize: 13,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: active ? "#fff7ed" : "transparent",
    borderBottom: "1px solid #f8fafc",
    fontWeight: active ? 700 : 400,
    color: "#0f172a",
    transition: "background 0.15s",
  });

  const triggerStyle = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 8,
    border: "1.5px solid #e2e8f0",
    fontSize: 14,
    color: "#0f172a",
    marginBottom: 14,
    boxSizing: "border-box",
    outline: "none",
    display: "flex",
    alignItems: "center",
    cursor: "pointer",
    gap: 6,
    background: "#fff",
  };

  const inputStyle = {
    width: "100%",
    padding: "8px 10px",
    borderRadius: 7,
    border: "1.5px solid #e2e8f0",
    fontSize: 12,
    color: "#0f172a",
    boxSizing: "border-box",
    outline: "none",
  };

  return (
    <div>
      {/* ── RACK ── */}
      <label style={labelStyle}>Rack Location</label>
      <div style={{ position: "relative", marginBottom: 0 }} ref={rackRef}>
        <div
          style={triggerStyle}
          onClick={() => {
            setRackOpen((o) => !o);
            setRackSearch("");
            setAddingRack(false);
          }}
        >
          <span style={{ flex: 1, color: value.rack ? "#0f172a" : "#94a3b8" }}>
            {value.rack ? `🗄 ${value.rack}` : "Select rack…"}
          </span>
          <span style={{ fontSize: 10, color: "#94a3b8" }}>{rackOpen ? "▲" : "▼"}</span>
        </div>

        {rackOpen && (
          <div style={dropStyle}>
            {/* Search */}
            <div style={{ padding: "8px 10px", borderBottom: "1px solid #f1f5f9" }}>
              <input
                autoFocus
                style={inputStyle}
                placeholder="🔍 Search racks…"
                value={rackSearch}
                onChange={(e) => setRackSearch(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {/* None */}
            <div
              style={{ ...rowStyle(false), color: "#94a3b8" }}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => { onChange({ rack: "", section: "" }); setRackOpen(false); }}
            >
              — None —
            </div>

            {/* Rack list */}
            {filteredRacks.map((r) => (
              <div
                key={r.id}
                style={rowStyle(value.rack === r.name)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => selectRack(r.name)}
              >
                <span>{value.rack === r.name && "✓ "}🗄 {r.name}</span>
                <button
                  style={delBtnStyle}
                  title="Delete rack"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm(`Delete rack "${r.name}" and all its sections?`)) {
                      onDeleteRack(r.id);
                      if (value.rack === r.name) onChange({ rack: "", section: "" });
                    }
                  }}
                >
                  🗑
                </button>
              </div>
            ))}

            {/* Other */}
            <div
              style={{ ...rowStyle(value.rack === "Other"), borderTop: "1px solid #f1f5f9" }}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => selectRack("Other")}
            >
              <span>{value.rack === "Other" && "✓ "}📦 Other</span>
            </div>

            {/* Add new rack */}
            {!addingRack ? (
              <div
                style={{ padding: "9px 12px", cursor: "pointer", fontSize: 13, fontWeight: 600, color: PRIMARY, borderTop: "1px solid #f1f5f9" }}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => { setAddingRack(true); setNewRackName(rackSearch); }}
              >
                ➕ Add New Rack
              </div>
            ) : (
              <div style={{ padding: "8px 10px", display: "flex", gap: 6, borderTop: "1px solid #f1f5f9" }}>
                <input
                  autoFocus
                  style={{ ...inputStyle, flex: 1 }}
                  placeholder="New rack name (e.g. R-01)"
                  value={newRackName}
                  onChange={(e) => setNewRackName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") doAddRack(); }}
                  onClick={(e) => e.stopPropagation()}
                />
                <button style={addBtnStyle} onClick={doAddRack}>Add</button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── SECTION (only when rack selected and not "Other") ── */}
      {value.rack && value.rack !== "Other" && (
        <div style={{ marginTop: 10, marginBottom: 0 }} ref={secRef}>
          <label style={labelStyle}>
            Section in <span style={{ color: PRIMARY }}>{value.rack}</span>
          </label>
          <div style={{ position: "relative" }}>
            <div
              style={triggerStyle}
              onClick={() => {
                setSecOpen((o) => !o);
                setSecSearch("");
                setAddingSec(false);
              }}
            >
              <span style={{ flex: 1, color: value.section ? "#0f172a" : "#94a3b8" }}>
                {value.section ? `📍 ${value.section}` : "Select section…"}
              </span>
              <span style={{ fontSize: 10, color: "#94a3b8" }}>{secOpen ? "▲" : "▼"}</span>
            </div>

            {secOpen && (
              <div style={dropStyle}>
                {/* Search */}
                <div style={{ padding: "8px 10px", borderBottom: "1px solid #f1f5f9" }}>
                  <input
                    autoFocus
                    style={inputStyle}
                    placeholder="🔍 Search sections…"
                    value={secSearch}
                    onChange={(e) => setSecSearch(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>

                {/* None */}
                <div
                  style={{ ...rowStyle(false), color: "#94a3b8" }}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => { onChange({ ...value, section: "" }); setSecOpen(false); }}
                >
                  — None —
                </div>

                {/* Section list */}
                {filteredSections.length === 0 && !addingSec && (
                  <div style={{ padding: "10px 12px", fontSize: 12, color: "#94a3b8", textAlign: "center" }}>
                    No sections yet — add one below
                  </div>
                )}
                {filteredSections.map((sec) => (
                  <div
                    key={sec}
                    style={rowStyle(value.section === sec)}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => selectSection(sec)}
                  >
                    <span>{value.section === sec && "✓ "}📍 {sec}</span>
                    <button
                      style={delBtnStyle}
                      title="Delete section"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`Delete section "${sec}"?`)) {
                          onDeleteSection(selectedRackObj.id, sec);
                          if (value.section === sec) onChange({ ...value, section: "" });
                        }
                      }}
                    >
                      🗑
                    </button>
                  </div>
                ))}

                {/* Add new section */}
                {!addingSec ? (
                  <div
                    style={{ padding: "9px 12px", cursor: "pointer", fontSize: 13, fontWeight: 600, color: PRIMARY, borderTop: "1px solid #f1f5f9" }}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => { setAddingSec(true); setNewSecName(secSearch); }}
                  >
                    ➕ Add New Section
                  </div>
                ) : (
                  <div style={{ padding: "8px 10px", display: "flex", gap: 6, borderTop: "1px solid #f1f5f9" }}>
                    <input
                      autoFocus
                      style={{ ...inputStyle, flex: 1 }}
                      placeholder="e.g. Shelf A, Row 2"
                      value={newSecName}
                      onChange={(e) => setNewSecName(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") doAddSection(); }}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <button style={addBtnStyle} onClick={doAddSection}>Add</button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Summary chip ── */}
      {(value.rack || value.section) && (
        <div style={chipStyle}>
          <span>📍</span>
          <span>
            {[value.rack, value.section].filter(Boolean).join(" › ")}
          </span>
          <button
            style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", fontSize: 14, padding: 0, marginLeft: 4 }}
            onClick={() => onChange({ rack: "", section: "" })}
            title="Clear"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}

/* ── micro-styles ── */
const labelStyle = { display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6, marginTop: 2 };
const delBtnStyle = { background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: 12, padding: "2px 4px" };
const addBtnStyle = { background: PRIMARY, color: "#fff", border: "none", borderRadius: 6, padding: "4px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" };
const chipStyle = { display: "inline-flex", alignItems: "center", gap: 6, background: "#fff7ed", color: PRIMARY, fontSize: 12, fontWeight: 700, padding: "5px 10px", borderRadius: 20, border: `1px solid ${PRIMARY}`, marginBottom: 14, marginTop: 2 };