import { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { signInWithEmailAndPassword, signInWithPopup,
  GoogleAuthProvider, signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/config";

// ─── Admin email (password is NEVER stored client-side) ─────────────────────
const ADMIN_EMAIL    = import.meta.env.VITE_ADMIN_EMAIL || "kdkprabhakar100@gmail.com";
const googleProvider = new GoogleAuthProvider();
const AuthContext = createContext(null);

// ─── Login rate-limiting ─────────────────────────────────────────────────────
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION   = 5 * 60 * 1000; // 5 minutes
const ATTEMPT_KEY        = "manakamana_login_attempts";
const LOCKOUT_KEY        = "manakamana_lockout_until";

function getLoginAttempts() {
  try { return Number(sessionStorage.getItem(ATTEMPT_KEY) || 0); }
  catch { return 0; }
}
function setLoginAttempts(n) {
  sessionStorage.setItem(ATTEMPT_KEY, String(n));
}
function getLockoutUntil() {
  try { return Number(sessionStorage.getItem(LOCKOUT_KEY) || 0); }
  catch { return 0; }
}
function setLockoutUntil(ts) {
  sessionStorage.setItem(LOCKOUT_KEY, String(ts));
}

// ─── Session config ──────────────────────────────────────────────────────────
const SESSION_DURATION  = 2 * 60 * 60 * 1000; // 2 hours
const WARNING_BEFORE    = 5 * 60 * 1000;      // warn 5 min before expiry
const ACTIVITY_EVENTS   = ["mousedown", "keydown", "scroll", "touchstart"];
const SESSION_KEY       = "manakamana_session_start";

export function AuthProvider({ children }) {
  const loginWithGoogle = () => signInWithPopup(auth, googleProvider);
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [sessionWarning, setSessionWarning] = useState(false);
  const [sessionRemaining, setSessionRemaining] = useState("");

  const logoutTimerRef  = useRef(null);
  const warningTimerRef = useRef(null);
  const countdownRef    = useRef(null);

  /* ── Clear all session timers ── */
  const clearSessionTimers = useCallback(() => {
    if (logoutTimerRef.current)  clearTimeout(logoutTimerRef.current);
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    if (countdownRef.current)    clearInterval(countdownRef.current);
    logoutTimerRef.current  = null;
    warningTimerRef.current = null;
    countdownRef.current    = null;
    setSessionWarning(false);
  }, []);

  /* ── Force logout ── */
  const forceLogout = useCallback(async () => {
    clearSessionTimers();
    sessionStorage.removeItem(SESSION_KEY);
    try { await signOut(auth); } catch {}
  }, [clearSessionTimers]);

  /* ── Start session timer ── */
  const startSessionTimer = useCallback((remainingMs) => {
    clearSessionTimers();
    if (remainingMs <= 0) { forceLogout(); return; }

    // Warning timer
    const warnIn = Math.max(remainingMs - WARNING_BEFORE, 0);
    warningTimerRef.current = setTimeout(() => {
      setSessionWarning(true);
      // Start countdown display
      const endTime = Date.now() + WARNING_BEFORE;
      const tick = () => {
        const left = Math.max(0, endTime - Date.now());
        const m = Math.floor(left / 60000);
        const sec = Math.floor((left % 60000) / 1000);
        setSessionRemaining(`${m}:${sec.toString().padStart(2, "0")}`);
        if (left <= 0) clearInterval(countdownRef.current);
      };
      tick();
      countdownRef.current = setInterval(tick, 1000);
    }, warnIn);

    // Logout timer
    logoutTimerRef.current = setTimeout(() => {
      forceLogout();
      // Alert will show after signOut triggers onAuthStateChanged  
      alert("Your session has expired. Please log in again.");
    }, remainingMs);
  }, [clearSessionTimers, forceLogout]);

  /* ── Extend session on user activity ── */
  const extendSession = useCallback(() => {
    if (!isAdmin || !user) return;
    sessionStorage.setItem(SESSION_KEY, Date.now().toString());
    startSessionTimer(SESSION_DURATION);
  }, [isAdmin, user, startSessionTimer]);

  /* ── Auth state listener ── */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      const admin = u?.email === ADMIN_EMAIL;
      setIsAdmin(admin);
      setLoading(false);

      if (u && admin) {
        // Restore or start session
        const stored = sessionStorage.getItem(SESSION_KEY);
        const start  = stored ? Number(stored) : Date.now();
        if (!stored) sessionStorage.setItem(SESSION_KEY, start.toString());
        const elapsed   = Date.now() - start;
        const remaining = SESSION_DURATION - elapsed;
        startSessionTimer(remaining);
      } else {
        clearSessionTimers();
        sessionStorage.removeItem(SESSION_KEY);
      }
    });
    return () => { unsub(); clearSessionTimers(); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Activity listeners (reset session on interaction) ── */
  useEffect(() => {
    if (!isAdmin || !user) return;
    const handler = () => extendSession();
    // Throttle: only reset every 60s of activity
    let last = 0;
    const throttled = () => {
      const now = Date.now();
      if (now - last > 60000) { last = now; handler(); }
    };
    ACTIVITY_EVENTS.forEach(e => window.addEventListener(e, throttled, { passive: true }));
    return () => ACTIVITY_EVENTS.forEach(e => window.removeEventListener(e, throttled));
  }, [isAdmin, user, extendSession]);

  const login = async (email, password) => {
    // Rate-limiting: check lockout
    const lockoutUntil = getLockoutUntil();
    if (lockoutUntil && Date.now() < lockoutUntil) {
      const remaining = Math.ceil((lockoutUntil - Date.now()) / 60000);
      throw new Error(`Too many login attempts. Try again in ${remaining} minute(s).`);
    }
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      setLoginAttempts(0); // reset on success
      sessionStorage.removeItem(LOCKOUT_KEY);
      return result;
    } catch (err) {
      const attempts = getLoginAttempts() + 1;
      setLoginAttempts(attempts);
      if (attempts >= MAX_LOGIN_ATTEMPTS) {
        setLockoutUntil(Date.now() + LOCKOUT_DURATION);
        setLoginAttempts(0);
        throw new Error(`Too many failed attempts. Account locked for 5 minutes.`);
      }
      throw err;
    }
  };

  const logout = async () => {
    clearSessionTimers();
    sessionStorage.removeItem(SESSION_KEY);
    return signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, login, loginWithGoogle, logout, sessionWarning, sessionRemaining, extendSession }}>
      {!loading && children}
      {/* Session expiry warning banner */}
      {sessionWarning && (
        <div style={warningStyles.overlay}>
          <div style={warningStyles.box}>
            <div style={warningStyles.icon}>⏰</div>
            <h3 style={warningStyles.title}>Session Expiring Soon</h3>
            <p style={warningStyles.text}>
              Your admin session will expire in <strong>{sessionRemaining}</strong>.<br />
              Click below to stay logged in.
            </p>
            <div style={warningStyles.actions}>
              <button style={warningStyles.btnStay} onClick={extendSession}>
                Stay Logged In
              </button>
              <button style={warningStyles.btnLogout} onClick={forceLogout}>
                Logout Now
              </button>
            </div>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

/* ── Warning popup styles ── */
const warningStyles = {
  overlay: {
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 10000, backdropFilter: "blur(4px)",
  },
  box: {
    background: "#fff", borderRadius: 18, padding: 32, textAlign: "center",
    maxWidth: 400, width: "90%", boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
  },
  icon: { fontSize: 48, marginBottom: 8 },
  title: { fontSize: 20, fontWeight: 800, color: "#0f172a", margin: "0 0 8px" },
  text: { fontSize: 14, color: "#64748b", lineHeight: 1.6, margin: "0 0 20px" },
  actions: { display: "flex", gap: 10, justifyContent: "center" },
  btnStay: {
    padding: "10px 24px", borderRadius: 9, border: "none", fontSize: 14,
    fontWeight: 700, cursor: "pointer", color: "#fff",
    background: "linear-gradient(135deg,#ea580c,#f97316)",
    boxShadow: "0 2px 8px rgba(234,88,12,0.25)",
  },
  btnLogout: {
    padding: "10px 24px", borderRadius: 9, border: "none", fontSize: 14,
    fontWeight: 700, cursor: "pointer", background: "#f1f5f9", color: "#334155",
  },
};
