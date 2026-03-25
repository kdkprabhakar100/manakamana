import { useState, useMemo, useEffect } from "react";
import { useProducts } from "../../hooks/useProducts";
import { useContacts } from "../../hooks/useContacts";

// ── Persist deleted IDs in localStorage so they survive re-renders ───
const LS_DELETED = "admin_notif_deleted";
const LS_READ    = "admin_notif_read";

function loadSet(key) {
  try { return new Set(JSON.parse(localStorage.getItem(key) || "[]")); }
  catch { return new Set(); }
}
function saveSet(key, set) {
  try { localStorage.setItem(key, JSON.stringify([...set])); }
  catch {}
}

// ─────────────────────────────────────────────────────────────────────
const TYPE_META = {
  system:   { label: "System",        icon: "⚙️",  accent: "#6366f1", soft: "#eef2ff" },
  user:     { label: "User Activity", icon: "👤",  accent: "#0ea5e9", soft: "#e0f2fe" },
  message:  { label: "Message",       icon: "💬",  accent: "#f59e0b", soft: "#fef3c7" },
  lowstock: { label: "Low Stock",     icon: "📦",  accent: "#ef4444", soft: "#fee2e2" },
};

const FILTERS = ["all", "lowstock", "message", "system", "user"];

const STATIC_NOTIFICATIONS = [
  {
    id: "sys-1", type: "system", read: false,
    title: "Backup Completed Successfully",
    body: "Daily database backup finished with no errors. All data stored to cloud.",
    time: "Today",
  },
  {
    id: "usr-1", type: "user", read: false,
    title: "Admin Session Started",
    body: "Admin account accessed from a new browser session.",
    time: "Today",
  },
];

export default function AdminNotification() {
  const { products = [], loading: pLoading } = useProducts();
  const { contacts = [], loading: cLoading }  = useContacts();

  // Load persisted state from localStorage on first render
  const [deletedIds, setDeletedIds] = useState(() => loadSet(LS_DELETED));
  const [readIds,    setReadIds]    = useState(() => loadSet(LS_READ));
  const [unreadIds,  setUnreadIds]  = useState(new Set());
  const [removing,   setRemoving]   = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");

  const loading = pLoading || cLoading;

  // Sync deletedIds → localStorage whenever it changes
  useEffect(() => { saveSet(LS_DELETED, deletedIds); }, [deletedIds]);
  // Sync readIds → localStorage whenever it changes
  useEffect(() => { saveSet(LS_READ, readIds); }, [readIds]);

  // ── Build live notification list ─────────────────────────────────────
  const allNotifications = useMemo(() => {
    const list = [];

    // 1. Low stock — real Firebase products (quantity < 5)
    products.forEach((p) => {
      const qty = Number(p.quantity ?? 0);
      if (qty < 5) {
        list.push({
          id: `lowstock-${p.id}`,
          type: "lowstock",
          title: `Low Stock Alert: ${p.name}`,
          body: `Only ${qty} unit${qty !== 1 ? "s" : ""} remaining for "${p.name}"${p.category ? ` (${p.category})` : ""}. Restock soon to avoid stockout.`,
          time: "Now",
          defaultRead: false,
        });
      }
    });

    // 2. Messages — real Firebase contacts
    contacts.forEach((c) => {
      const msg = c.message || "";
      list.push({
        id: `msg-${c.id}`,
        type: "message",
        title: `Message from ${c.name || "Customer"}`,
        body: msg.length > 120 ? msg.slice(0, 120) + "…" : msg,
        time: c.createdAt?.toDate
          ? c.createdAt.toDate().toLocaleDateString("en-IN", { day: "numeric", month: "short" })
          : "Recent",
        defaultRead: !!c.read,
      });
    });

    // 3. Static system/user notifications
    STATIC_NOTIFICATIONS.forEach((n) => list.push({ ...n, defaultRead: n.read }));

    return list;
  }, [products, contacts]);

  // Apply deletedIds + read overrides
  const notifications = useMemo(() =>
    allNotifications
      .filter((n) => !deletedIds.has(n.id))
      .map((n) => ({
        ...n,
        read: readIds.has(n.id)   ? true
            : unreadIds.has(n.id) ? false
            : n.defaultRead,
      })),
    [allNotifications, deletedIds, readIds, unreadIds]
  );

  const unread   = notifications.filter((n) => !n.read).length;
  const visible  = notifications.filter((n) => activeFilter === "all" || n.type === activeFilter);
  const countFor = (f) => f === "all" ? notifications.length : notifications.filter((n) => n.type === f).length;

  // ── Actions ──────────────────────────────────────────────────────────
  const toggleRead = (id, isRead) => {
    if (isRead) {
      setReadIds((p)   => { const s = new Set(p); s.delete(id); return s; });
      setUnreadIds((p) => new Set([...p, id]));
    } else {
      setUnreadIds((p) => { const s = new Set(p); s.delete(id); return s; });
      setReadIds((p)   => new Set([...p, id]));
    }
  };

  const remove = (id) => {
    setRemoving(id);
    setTimeout(() => {
      setDeletedIds((p) => new Set([...p, id]));
      setRemoving(null);
    }, 300);
  };

  const markAllRead = () => {
    setUnreadIds(new Set());
    setReadIds((p) => {
      const next = new Set(p);
      notifications.filter((n) => !n.read).forEach((n) => next.add(n.id));
      return next;
    });
  };

  // Clear all: save every current notification ID as deleted → persists in localStorage
  const clearAll = () => {
    const allIds = new Set([...deletedIds, ...allNotifications.map((n) => n.id)]);
    setDeletedIds(allIds);
    saveSet(LS_DELETED, allIds); // write immediately, don't wait for useEffect
  };

  const lowStockUnread = notifications.filter((n) => n.type === "lowstock" && !n.read).length;
  const showBanner = lowStockUnread > 0 && (activeFilter === "all" || activeFilter === "lowstock");

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
        * { box-sizing: border-box; }
        .nr-root { font-family: 'DM Sans', sans-serif; }
        .nr-filter { transition: background 0.15s, color 0.15s, box-shadow 0.15s; }
        .nr-filter:hover { filter: brightness(0.93); }
        .nr-row { transition: opacity 0.3s, transform 0.3s, background 0.15s; }
        .nr-row:hover { background: #f8fafc !important; }
        .nr-row.exit { opacity: 0; transform: translateX(28px); }
        .nr-act { transition: transform 0.12s; border: none; cursor: pointer; }
        .nr-act:hover { transform: scale(1.13); }
        .nr-topbtn { transition: filter 0.12s; cursor: pointer; }
        .nr-topbtn:hover { filter: brightness(0.93); }
        .nr-pulse { animation: nrPulse 1.8s ease-in-out infinite; }
        @keyframes nrPulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        .nr-sk { background: linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%); background-size:200% 100%; animation:shimmer 1.2s infinite; border-radius:8px; }
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
      `}</style>

      <div className="nr-root" style={{ padding:"28px 32px 56px", maxWidth:860, margin:"0 auto" }}>

        {/* ── Header ── */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:26, flexWrap:"wrap", gap:14 }}>
          <div>
            <p style={{ fontFamily:"'Syne',sans-serif", color:"#6366f1", fontWeight:700, fontSize:10, letterSpacing:3, margin:0, textTransform:"uppercase" }}>
              ADMIN · NOTIFICATIONS
            </p>
            <h1 style={{ fontFamily:"'Syne',sans-serif", fontSize:30, fontWeight:800, color:"#0f172a", margin:"4px 0 0", letterSpacing:-0.8, display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
              Notifications
              {!loading && unread > 0 && (
                <span style={{ background:"#ef4444", color:"#fff", fontSize:12, fontWeight:700, borderRadius:20, padding:"2px 10px" }}>
                  {unread} new
                </span>
              )}
            </h1>
            <p style={{ fontSize:13, color:"#94a3b8", margin:"5px 0 0" }}>
              Live alerts from inventory, messages &amp; system
            </p>
          </div>

          {!loading && notifications.length > 0 && (
            <div style={{ display:"flex", gap:8, alignItems:"center", flexShrink:0 }}>
              {unread > 0 && (
                <button className="nr-topbtn" onClick={markAllRead}
                  style={{ padding:"8px 15px", borderRadius:10, border:"1.5px solid #e2e8f0", background:"#f8fafc", color:"#475569", fontSize:12, fontWeight:600 }}>
                  ✓ Mark all read
                </button>
              )}
              <button className="nr-topbtn" onClick={clearAll}
                style={{ padding:"8px 15px", borderRadius:10, border:"1.5px solid #fecdd3", background:"#fff1f2", color:"#e11d48", fontSize:12, fontWeight:600 }}>
                🗑 Clear all
              </button>
            </div>
          )}
        </div>

        {/* ── Filter Tabs ── */}
        <div style={{ display:"flex", gap:6, marginBottom:16, flexWrap:"wrap" }}>
          {FILTERS.map((f) => {
            const meta   = TYPE_META[f];
            const active = activeFilter === f;
            const accent = meta ? meta.accent : "#0f172a";
            return (
              <button key={f} className="nr-filter" onClick={() => setActiveFilter(f)}
                style={{
                  padding:"7px 14px", borderRadius:999, border:"none", cursor:"pointer",
                  fontSize:12, fontWeight:600, display:"flex", alignItems:"center", gap:6,
                  background: active ? accent : "#f1f5f9",
                  color:      active ? "#fff" : "#64748b",
                  boxShadow:  active ? `0 3px 10px ${accent}44` : "none",
                }}>
                <span>{meta ? meta.icon : "🔔"}</span>
                <span>{meta ? meta.label : "All"}</span>
                <span style={{
                  background: active ? "rgba(255,255,255,0.22)" : "#e2e8f0",
                  color:      active ? "#fff" : "#64748b",
                  borderRadius:999, fontSize:10, fontWeight:700, padding:"1px 7px",
                }}>{loading ? "…" : countFor(f)}</span>
              </button>
            );
          })}
        </div>

        {/* ── Low Stock Banner ── */}
        {!loading && showBanner && (
          <div style={{
            display:"flex", alignItems:"center", gap:12, padding:"12px 18px", marginBottom:14,
            background:"#fef2f2", border:"1.5px solid #fca5a5", borderRadius:12,
          }}>
            <span style={{ fontSize:22 }}>⚠️</span>
            <div>
              <p style={{ margin:0, fontSize:13, fontWeight:700, color:"#b91c1c" }}>
                {lowStockUnread} product{lowStockUnread > 1 ? "s are" : " is"} critically low on stock!
              </p>
              <p style={{ margin:0, fontSize:12, color:"#ef4444" }}>
                Go to Inventory and restock to avoid lost sales.
              </p>
            </div>
          </div>
        )}

        {/* ── Notification List ── */}
        <div style={{ background:"#fff", borderRadius:18, border:"1px solid #f1f5f9", boxShadow:"0 2px 16px rgba(0,0,0,0.04)", overflow:"hidden" }}>

          {loading && (
            <div style={{ padding:"16px 20px", display:"flex", flexDirection:"column", gap:18 }}>
              {[1,2,3].map((i) => (
                <div key={i} style={{ display:"flex", gap:14, alignItems:"flex-start" }}>
                  <div className="nr-sk" style={{ width:42, height:42, flexShrink:0 }} />
                  <div style={{ flex:1, display:"flex", flexDirection:"column", gap:8 }}>
                    <div className="nr-sk" style={{ height:13, width:"55%" }} />
                    <div className="nr-sk" style={{ height:11, width:"82%" }} />
                    <div className="nr-sk" style={{ height:10, width:"22%" }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && visible.length === 0 && (
            <div style={{ padding:"64px 24px", textAlign:"center" }}>
              <div style={{ fontSize:44, marginBottom:10 }}>🔔</div>
              <p style={{ color:"#94a3b8", fontSize:14, margin:0 }}>
                {notifications.length === 0
                  ? "All caught up! No notifications."
                  : "No notifications in this category."}
              </p>
            </div>
          )}

          {!loading && visible.map((n, i) => {
            const meta   = TYPE_META[n.type];
            const isExit = removing === n.id;
            return (
              <div key={n.id}
                className={`nr-row${isExit ? " exit" : ""}`}
                style={{
                  display:"flex", alignItems:"flex-start", gap:14, padding:"16px 20px",
                  borderBottom: i < visible.length - 1 ? "1px solid #f8fafc" : "none",
                  background: n.read ? "#fff" : "#fafbff",
                  position:"relative",
                }}>

                {!n.read && (
                  <div className="nr-pulse" style={{
                    position:"absolute", left:7, top:"50%", transform:"translateY(-50%)",
                    width:6, height:6, borderRadius:"50%", background:meta.accent,
                  }} />
                )}

                <div style={{
                  width:42, height:42, borderRadius:12, flexShrink:0,
                  background:meta.soft, display:"flex", alignItems:"center",
                  justifyContent:"center", fontSize:18,
                }}>
                  {meta.icon}
                </div>

                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:7, flexWrap:"wrap", marginBottom:2 }}>
                    <span style={{ fontSize:13, fontWeight:n.read ? 600 : 700, color:"#0f172a" }}>
                      {n.title}
                    </span>
                    <span style={{
                      fontSize:9, fontWeight:700, letterSpacing:0.8, textTransform:"uppercase",
                      background:meta.soft, color:meta.accent, padding:"2px 8px", borderRadius:999,
                    }}>
                      {meta.label}
                    </span>
                  </div>
                  <p style={{ fontSize:12, color:"#64748b", margin:"0 0 4px", lineHeight:1.55 }}>
                    {n.body}
                  </p>
                  <span style={{ fontSize:11, color:"#cbd5e1" }}>{n.time}</span>
                </div>

                <div style={{ display:"flex", gap:5, flexShrink:0, alignItems:"center" }}>
                  <button className="nr-act"
                    title={n.read ? "Mark as unread" : "Mark as read"}
                    onClick={() => toggleRead(n.id, n.read)}
                    style={{
                      width:30, height:30, borderRadius:8,
                      background: n.read ? "#f1f5f9" : meta.soft,
                      color:      n.read ? "#94a3b8" : meta.accent,
                      fontSize:13, fontWeight:700,
                      display:"flex", alignItems:"center", justifyContent:"center",
                    }}>
                    {n.read ? "○" : "✓"}
                  </button>
                  <button className="nr-act"
                    title="Delete"
                    onClick={() => remove(n.id)}
                    style={{
                      width:30, height:30, borderRadius:8,
                      background:"#fff1f2", color:"#e11d48",
                      fontSize:13, fontWeight:700,
                      display:"flex", alignItems:"center", justifyContent:"center",
                    }}>
                    ✕
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {!loading && visible.length > 0 && (
          <p style={{ textAlign:"center", fontSize:11, color:"#cbd5e1", marginTop:14 }}>
            Showing {visible.length} of {notifications.length} notification{notifications.length !== 1 ? "s" : ""}
          </p>
        )}
      </div>
    </>
  );
}