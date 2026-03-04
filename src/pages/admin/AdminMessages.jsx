import { useState } from "react";
import { useContacts } from "../../hooks/useContacts";
import { useToast } from "../../components/common/Toast";

export default function AdminMessages() {
  const { contacts, loading, markRead, deleteContact } = useContacts();
  const toast = useToast();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all"); // all, unread, read
  const [selected, setSelected] = useState(null);
  const [delId, setDelId] = useState(null);

  const filtered = contacts
    .filter(c => {
      if (filter === "unread") return !c.read;
      if (filter === "read") return c.read;
      return true;
    })
    .filter(c =>
      (c.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (c.email || "").toLowerCase().includes(search.toLowerCase()) ||
      (c.phone || "").toLowerCase().includes(search.toLowerCase()) ||
      (c.message || "").toLowerCase().includes(search.toLowerCase())
    );

  const unreadCount = contacts.filter(c => !c.read).length;

  const handleOpen = async (msg) => {
    setSelected(msg);
    if (!msg.read) {
      try { await markRead(msg.id); } catch {}
    }
  };

  const handleDelete = async () => {
    if (!delId) return;
    try {
      await deleteContact(delId);
      toast.success("Message deleted");
      if (selected?.id === delId) setSelected(null);
    } catch {
      toast.error("Failed to delete message");
    }
    setDelId(null);
  };

  const formatDate = (d) => {
    if (!d) return "—";
    const date = d.seconds ? new Date(d.seconds * 1000) : new Date(d);
    return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div style={s.page}>
      <div style={s.inner}>
        {/* Header */}
        <div className="admin-messages-header" style={s.header}>
          <div>
            <p style={s.label}>ADMIN · INBOX</p>
            <h1 style={s.title}>Messages & Inquiries</h1>
            <p style={s.sub}>{contacts.length} messages · {unreadCount} unread</p>
          </div>
        </div>

        {/* Filters */}
        <div className="admin-messages-filters" style={s.filterRow}>
          <input className="admin-search" style={s.search} placeholder="🔍 Search messages..."
            value={search} onChange={e => setSearch(e.target.value)} />
          <div style={s.tabs}>
            {[
              { key: "all", label: `All (${contacts.length})` },
              { key: "unread", label: `Unread (${unreadCount})` },
              { key: "read", label: "Read" },
            ].map(t => (
              <button key={t.key} style={{ ...s.tab, ...(filter === t.key ? s.tabActive : {}) }}
                onClick={() => setFilter(t.key)}>{t.label}</button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={s.loading}>Loading messages…</div>
        ) : filtered.length === 0 ? (
          <div style={s.empty}>
            <div style={{ fontSize: 48 }}>📭</div>
            <p style={{ color: "#64748b", marginTop: 12 }}>
              {contacts.length === 0 ? "No messages yet. They'll appear here when customers contact you." : "No messages match your filter."}
            </p>
          </div>
        ) : (
          <div className="messages-layout" style={s.layout}>
            {/* Message List */}
            <div style={s.list}>
              {filtered.map(msg => (
                <div key={msg.id}
                  style={{ ...s.msgCard, ...(selected?.id === msg.id ? s.msgCardActive : {}), ...(!msg.read ? s.msgCardUnread : {}) }}
                  onClick={() => handleOpen(msg)}>
                  <div style={s.msgTop}>
                    <div style={s.msgName}>
                      {!msg.read && <span style={s.dot} />}
                      {msg.name || "Unknown"}
                    </div>
                    <span style={s.msgDate}>{formatDate(msg.createdAt)}</span>
                  </div>
                  <div style={s.msgPhone}>{msg.phone || ""} {msg.email ? `· ${msg.email}` : ""}</div>
                  <div style={s.msgPreview}>{(msg.message || "").slice(0, 80)}{(msg.message || "").length > 80 ? "…" : ""}</div>
                </div>
              ))}
            </div>

            {/* Detail Panel */}
            {selected ? (
              <div style={s.detail}>
                <div style={s.detailHeader}>
                  <h2 style={s.detailName}>{selected.name}</h2>
                  <button style={s.delBtnSmall} onClick={() => setDelId(selected.id)}>🗑 Delete</button>
                </div>
                <div style={s.detailMeta}>
                  {selected.phone && <span style={s.metaChip}>📞 {selected.phone}</span>}
                  {selected.email && <span style={s.metaChip}>✉️ {selected.email}</span>}
                  <span style={s.metaChip}>🕐 {formatDate(selected.createdAt)}</span>
                </div>
                <div style={s.detailDivider} />
                <div style={s.detailMsg}>{selected.message}</div>
                <div style={s.detailActions}>
                  {selected.phone && (
                    <a href={`tel:${selected.phone}`} style={s.actionBtn}>📞 Call</a>
                  )}
                  {selected.phone && (
                    <a href={`https://wa.me/${selected.phone.replace(/[^0-9]/g, "")}`}
                      target="_blank" rel="noreferrer" style={{ ...s.actionBtn, background: "#22c55e", color: "#fff" }}>
                      💬 WhatsApp
                    </a>
                  )}
                  {selected.email && (
                    <a href={`mailto:${selected.email}`} style={s.actionBtn}>✉️ Email</a>
                  )}
                </div>
              </div>
            ) : (
              <div style={s.detailEmpty}>
                <div style={{ fontSize: 48 }}>📩</div>
                <p style={{ color: "#94a3b8", marginTop: 12 }}>Select a message to view details</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete confirm */}
      {delId && (
        <div style={s.overlay} onClick={() => setDelId(null)}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "#ef4444", margin: "0 0 12px" }}>Delete Message?</h2>
            <p style={{ color: "#64748b", marginBottom: 24, fontSize: 14 }}>This action cannot be undone.</p>
            <div style={{ display: "flex", gap: 10 }}>
              <button style={s.cancelBtn} onClick={() => setDelId(null)}>Cancel</button>
              <button style={s.confirmDelBtn} onClick={handleDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const PRIMARY = "#ea580c";

const s = {
  page: { background: "#f8fafc", minHeight: "100vh", fontFamily: "'Inter','Segoe UI',system-ui,sans-serif" },
  inner: { maxWidth: 1200, margin: "0 auto", padding: "28px 24px" },
  header: { marginBottom: 20 },
  label: { fontSize: 11, fontWeight: 800, letterSpacing: 3, color: PRIMARY, margin: "0 0 4px", textTransform: "uppercase" },
  title: { fontSize: 26, fontWeight: 800, color: "#0f172a", margin: "0 0 4px" },
  sub: { fontSize: 13, color: "#64748b", margin: 0 },

  filterRow: { display: "flex", gap: 16, alignItems: "center", marginBottom: 20, flexWrap: "wrap" },
  search: { flex: 1, minWidth: 200, maxWidth: 360, padding: "10px 14px", borderRadius: 9, border: "1.5px solid #e2e8f0", fontSize: 14, outline: "none", boxSizing: "border-box" },
  tabs: { display: "flex", gap: 6 },
  tab: { padding: "7px 16px", borderRadius: 20, border: "1.5px solid #e2e8f0", fontSize: 13, fontWeight: 600, cursor: "pointer", background: "#fff", color: "#475569" },
  tabActive: { background: PRIMARY, color: "#fff", border: `1.5px solid ${PRIMARY}` },

  loading: { textAlign: "center", padding: 60, color: "#64748b" },
  empty: { textAlign: "center", padding: 60 },

  layout: { display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 20, alignItems: "start" },
  list: { display: "flex", flexDirection: "column", gap: 8, maxHeight: "70vh", overflowY: "auto", paddingRight: 4 },
  msgCard: {
    background: "#fff", borderRadius: 12, padding: "16px 18px", cursor: "pointer",
    border: "1.5px solid #f1f5f9", transition: "all 0.15s ease",
  },
  msgCardActive: { borderColor: PRIMARY, background: "#fff7ed" },
  msgCardUnread: { borderLeft: `4px solid ${PRIMARY}` },
  msgTop: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  msgName: { fontSize: 14, fontWeight: 700, color: "#0f172a", display: "flex", alignItems: "center", gap: 8 },
  dot: { width: 8, height: 8, borderRadius: "50%", background: PRIMARY, flexShrink: 0 },
  msgDate: { fontSize: 11, color: "#94a3b8", fontWeight: 500, flexShrink: 0 },
  msgPhone: { fontSize: 12, color: "#64748b", marginBottom: 6 },
  msgPreview: { fontSize: 13, color: "#94a3b8", lineHeight: 1.4 },

  detail: { background: "#fff", borderRadius: 16, padding: "28px 24px", border: "1px solid #f1f5f9", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" },
  detailHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  detailName: { fontSize: 20, fontWeight: 800, color: "#0f172a", margin: 0 },
  delBtnSmall: { background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: 8, padding: "7px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer" },
  detailMeta: { display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 },
  metaChip: { background: "#f1f5f9", color: "#475569", padding: "5px 12px", borderRadius: 8, fontSize: 12, fontWeight: 500 },
  detailDivider: { height: 1, background: "#e2e8f0", margin: "0 0 16px" },
  detailMsg: { fontSize: 15, color: "#334155", lineHeight: 1.8, whiteSpace: "pre-wrap", marginBottom: 24 },
  detailActions: { display: "flex", gap: 10, flexWrap: "wrap" },
  actionBtn: { padding: "10px 20px", borderRadius: 9, border: "1.5px solid #e2e8f0", color: "#334155", fontSize: 13, fontWeight: 600, textDecoration: "none", background: "#fff", cursor: "pointer" },

  detailEmpty: { background: "#fff", borderRadius: 16, padding: "60px 24px", textAlign: "center", border: "1px solid #f1f5f9" },

  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, padding: 16, backdropFilter: "blur(4px)" },
  modal: { background: "#fff", borderRadius: 16, padding: "28px", maxWidth: 360, width: "100%", boxShadow: "0 16px 50px rgba(0,0,0,0.18)" },
  cancelBtn: { flex: 1, padding: "10px", background: "#f1f5f9", color: "#334155", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer" },
  confirmDelBtn: { flex: 1, padding: "10px", background: "#ef4444", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer" },
};
