import { createContext, useContext, useState, useEffect, useMemo } from "react";
import { useProducts } from "./useProducts";
import { useContacts } from "./useContacts";

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

const NotificationsContext = createContext(null);

export function NotificationsProvider({ children }) {
  const { products = [], loading: pLoading } = useProducts();
  const { contacts = [], loading: cLoading }  = useContacts();

  const [deletedIds, setDeletedIds] = useState(() => loadSet(LS_DELETED));
  const [readIds,    setReadIds]    = useState(() => loadSet(LS_READ));
  const [unreadIds,  setUnreadIds]  = useState(new Set());

  const loading = pLoading || cLoading;

  useEffect(() => { saveSet(LS_DELETED, deletedIds); }, [deletedIds]);
  useEffect(() => { saveSet(LS_READ,    readIds);    }, [readIds]);

  // Build all notifications from live Firebase data
  const allNotifications = useMemo(() => {
    const list = [];

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

    STATIC_NOTIFICATIONS.forEach((n) => list.push({ ...n, defaultRead: n.read }));
    return list;
  }, [products, contacts]);

  // Apply deleted + read overrides
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

  // This is what the bell icon shows
  const unreadCount = notifications.filter((n) => !n.read).length;

  const toggleRead = (id, isRead) => {
    if (isRead) {
      setReadIds((p)   => { const s = new Set(p); s.delete(id); return s; });
      setUnreadIds((p) => new Set([...p, id]));
    } else {
      setUnreadIds((p) => { const s = new Set(p); s.delete(id); return s; });
      setReadIds((p)   => new Set([...p, id]));
    }
  };

  const removeNotif = (id) => {
    setDeletedIds((p) => new Set([...p, id]));
  };

  const markAllRead = () => {
    setUnreadIds(new Set());
    setReadIds((p) => {
      const next = new Set(p);
      notifications.filter((n) => !n.read).forEach((n) => next.add(n.id));
      return next;
    });
  };

  const clearAll = () => {
    const allIds = new Set([...deletedIds, ...allNotifications.map((n) => n.id)]);
    setDeletedIds(allIds);
    saveSet(LS_DELETED, allIds);
  };

  return (
    <NotificationsContext.Provider value={{
      notifications,
      unreadCount,
      loading,
      toggleRead,
      removeNotif,
      markAllRead,
      clearAll,
    }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error("useNotifications must be used inside NotificationsProvider");
  return ctx;
}