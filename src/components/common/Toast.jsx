import { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";

const ToastContext = createContext(null);

let _id = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef({});

  const removeToast = useCallback((id) => {
    if (timersRef.current[id]) clearTimeout(timersRef.current[id]);
    delete timersRef.current[id];
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const addToast = useCallback((message, type = "info", duration = 4000) => {
    const id = ++_id;
    setToasts(prev => [...prev, { id, message, type }]);
    if (duration > 0) {
      timersRef.current[id] = setTimeout(() => removeToast(id), duration);
    }
    return id;
  }, [removeToast]);

  const toast = useCallback({
    success: (msg, dur) => addToast(msg, "success", dur),
    error:   (msg, dur) => addToast(msg, "error", dur),
    warning: (msg, dur) => addToast(msg, "warning", dur),
    info:    (msg, dur) => addToast(msg, "info", dur),
  }, [addToast]);

  // Cleanup on unmount
  useEffect(() => {
    return () => Object.values(timersRef.current).forEach(clearTimeout);
  }, []);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {toasts.length > 0 && (
        <div style={styles.container}>
          {toasts.map(t => (
            <ToastItem key={t.id} toast={t} onClose={() => removeToast(t.id)} />
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onClose }) {
  const [exiting, setExiting] = useState(false);

  const handleClose = () => {
    setExiting(true);
    setTimeout(onClose, 250);
  };

  const cfg = typeConfig[toast.type] || typeConfig.info;

  return (
    <div
      style={{
        ...styles.toast,
        background: cfg.bg,
        borderLeft: `4px solid ${cfg.accent}`,
        animation: exiting ? "toastOut 0.25s ease forwards" : "toastIn 0.3s ease forwards",
      }}
      role="alert"
    >
      <span style={{ fontSize: 18, flexShrink: 0 }}>{cfg.icon}</span>
      <span style={styles.msg}>{toast.message}</span>
      <button style={styles.closeBtn} onClick={handleClose} aria-label="Close">×</button>
    </div>
  );
}

const typeConfig = {
  success: { icon: "✅", bg: "#f0fdf4", accent: "#22c55e" },
  error:   { icon: "❌", bg: "#fef2f2", accent: "#ef4444" },
  warning: { icon: "⚠️", bg: "#fffbeb", accent: "#f59e0b" },
  info:    { icon: "ℹ️", bg: "#eff6ff", accent: "#3b82f6" },
};

const styles = {
  container: {
    position: "fixed", top: 20, right: 20, zIndex: 99999,
    display: "flex", flexDirection: "column", gap: 10,
    maxWidth: 420, width: "calc(100% - 40px)",
    pointerEvents: "none",
  },
  toast: {
    display: "flex", alignItems: "center", gap: 12,
    padding: "14px 16px", borderRadius: 12,
    boxShadow: "0 8px 30px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)",
    fontFamily: "'Inter','Segoe UI',sans-serif",
    pointerEvents: "auto",
  },
  msg: { flex: 1, fontSize: 14, fontWeight: 500, color: "#1e293b", lineHeight: 1.5 },
  closeBtn: {
    background: "none", border: "none", fontSize: 20, cursor: "pointer",
    color: "#94a3b8", padding: "0 4px", fontWeight: 700, flexShrink: 0,
    lineHeight: 1,
  },
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // Fallback if used outside provider — return no-op functions
    return { success: () => {}, error: () => {}, warning: () => {}, info: () => {} };
  }
  return ctx;
};
