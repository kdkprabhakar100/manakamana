import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  browserSessionPersistence,
  GoogleAuthProvider,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  where,
} from "firebase/firestore";
import { auth, db } from "../firebase/config";

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || "kdkprabhakar100@gmail.com";

const googleProvider = new GoogleAuthProvider();
const AuthContext = createContext(null);

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 5 * 60 * 1000;
const ATTEMPT_KEY = "manakamana_login_attempts";
const LOCKOUT_KEY = "manakamana_lockout_until";

const SESSION_DURATION = 2 * 60 * 60 * 1000;
const WARNING_BEFORE = 5 * 60 * 1000;
const ACTIVITY_EVENTS = ["mousedown", "keydown", "scroll", "touchstart"];
const SESSION_KEY = "manakamana_session_start";

function getLoginAttempts() {
  try {
    return Number(sessionStorage.getItem(ATTEMPT_KEY) || 0);
  } catch {
    return 0;
  }
}

function setLoginAttempts(n) {
  try {
    sessionStorage.setItem(ATTEMPT_KEY, String(n));
  } catch {}
}

function getLockoutUntil() {
  try {
    return Number(sessionStorage.getItem(LOCKOUT_KEY) || 0);
  } catch {
    return 0;
  }
}

function setLockoutUntil(ts) {
  try {
    sessionStorage.setItem(LOCKOUT_KEY, String(ts));
  } catch {}
}

function clearLoginLockout() {
  try {
    sessionStorage.removeItem(LOCKOUT_KEY);
    sessionStorage.removeItem(ATTEMPT_KEY);
  } catch {}
}

async function getUserProfile(firebaseUser) {
  if (!firebaseUser) return null;

  const email = (firebaseUser.email || "").toLowerCase();

  try {
    const byUid = await getDoc(doc(db, "users", firebaseUser.uid));

    if (byUid.exists()) {
      return {
        id: byUid.id,
        uid: firebaseUser.uid,
        email,
        ...byUid.data(),
      };
    }

    const byEmail = await getDocs(
      query(collection(db, "users"), where("email", "==", email), limit(1))
    );

    if (!byEmail.empty) {
      const found = byEmail.docs[0];

      return {
        id: found.id,
        uid: firebaseUser.uid,
        email,
        ...found.data(),
      };
    }
  } catch (error) {
    console.error("Failed to load user profile:", error);
  }

  if (email === ADMIN_EMAIL.toLowerCase()) {
    return {
      id: firebaseUser.uid,
      uid: firebaseUser.uid,
      name: "Admin",
      email,
      role: "admin",
      active: true,
    };
  }

  return null;
}

function canAccessAdmin(profile) {
  if (!profile) return false;
  if (profile.active === false) return false;

  return ["admin", "staff"].includes(profile.role);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const [sessionWarning, setSessionWarning] = useState(false);
  const [sessionRemaining, setSessionRemaining] = useState("");

  const logoutTimerRef = useRef(null);
  const warningTimerRef = useRef(null);
  const countdownRef = useRef(null);

  const clearSessionTimers = useCallback(() => {
    if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);

    logoutTimerRef.current = null;
    warningTimerRef.current = null;
    countdownRef.current = null;

    setSessionWarning(false);
  }, []);

  const forceLogout = useCallback(async () => {
    clearSessionTimers();

    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch {}

    try {
      await signOut(auth);
    } catch {}
  }, [clearSessionTimers]);

  const startSessionTimer = useCallback(
    (remainingMs) => {
      clearSessionTimers();

      if (remainingMs <= 0) {
        forceLogout();
        return;
      }

      const warnIn = Math.max(remainingMs - WARNING_BEFORE, 0);

      warningTimerRef.current = setTimeout(() => {
        setSessionWarning(true);

        const endTime = Date.now() + WARNING_BEFORE;

        const tick = () => {
          const left = Math.max(0, endTime - Date.now());
          const minutes = Math.floor(left / 60000);
          const seconds = Math.floor((left % 60000) / 1000);

          setSessionRemaining(`${minutes}:${seconds.toString().padStart(2, "0")}`);

          if (left <= 0 && countdownRef.current) {
            clearInterval(countdownRef.current);
          }
        };

        tick();
        countdownRef.current = setInterval(tick, 1000);
      }, warnIn);

      logoutTimerRef.current = setTimeout(() => {
        forceLogout();
        alert("Your session has expired. Please log in again.");
      }, remainingMs);
    },
    [clearSessionTimers, forceLogout]
  );

  const extendSession = useCallback(() => {
    if (!isAdmin || !user) return;

    try {
      sessionStorage.setItem(SESSION_KEY, Date.now().toString());
    } catch {}

    startSessionTimer(SESSION_DURATION);
  }, [isAdmin, user, startSessionTimer]);

  useEffect(() => {
    setPersistence(auth, browserSessionPersistence).catch(() => {});

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);

      if (!firebaseUser) {
        setUser(null);
        setProfile(null);
        setIsAdmin(false);
        clearSessionTimers();

        try {
          sessionStorage.removeItem(SESSION_KEY);
        } catch {}

        setLoading(false);
        return;
      }

      const loadedProfile = await getUserProfile(firebaseUser);
      const allowed = canAccessAdmin(loadedProfile);

      setUser(firebaseUser);
      setProfile(loadedProfile);
      setIsAdmin(allowed);
      setLoading(false);

      if (allowed) {
        let start = Date.now();

        try {
          const stored = sessionStorage.getItem(SESSION_KEY);
          start = stored ? Number(stored) : Date.now();

          if (!stored) {
            sessionStorage.setItem(SESSION_KEY, start.toString());
          }
        } catch {}

        const elapsed = Date.now() - start;
        const remaining = SESSION_DURATION - elapsed;

        startSessionTimer(remaining);
      } else {
        clearSessionTimers();

        try {
          sessionStorage.removeItem(SESSION_KEY);
        } catch {}
      }
    });

    return () => {
      unsubscribe();
      clearSessionTimers();
    };
  }, [clearSessionTimers, startSessionTimer]);

  useEffect(() => {
    if (!isAdmin || !user) return;

    let last = 0;

    const throttled = () => {
      const now = Date.now();

      if (now - last > 60000) {
        last = now;
        extendSession();
      }
    };

    ACTIVITY_EVENTS.forEach((eventName) =>
      window.addEventListener(eventName, throttled, { passive: true })
    );

    return () => {
      ACTIVITY_EVENTS.forEach((eventName) =>
        window.removeEventListener(eventName, throttled)
      );
    };
  }, [isAdmin, user, extendSession]);

  const login = async (email, password) => {
    const lockoutUntil = getLockoutUntil();

    if (lockoutUntil && Date.now() < lockoutUntil) {
      const remaining = Math.ceil((lockoutUntil - Date.now()) / 60000);
      throw new Error(`Too many login attempts. Try again in ${remaining} minute(s).`);
    }

    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const loadedProfile = await getUserProfile(result.user);

      if (!canAccessAdmin(loadedProfile)) {
        await signOut(auth);
        throw new Error("You do not have admin access. Contact the main admin.");
      }

      clearLoginLockout();

      try {
        sessionStorage.setItem(SESSION_KEY, Date.now().toString());
      } catch {}

      return result;
    } catch (error) {
      if (error.message?.includes("admin access")) {
        throw error;
      }

      const attempts = getLoginAttempts() + 1;
      setLoginAttempts(attempts);

      if (attempts >= MAX_LOGIN_ATTEMPTS) {
        setLockoutUntil(Date.now() + LOCKOUT_DURATION);
        setLoginAttempts(0);
        throw new Error("Too many failed attempts. Account locked for 5 minutes.");
      }

      throw error;
    }
  };

  const loginWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    const loadedProfile = await getUserProfile(result.user);

    if (!canAccessAdmin(loadedProfile)) {
      await signOut(auth);
      throw new Error("You do not have admin access. Contact the main admin.");
    }

    return result;
  };

  const logout = async () => {
    clearSessionTimers();

    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch {}

    return signOut(auth);
  };

  const value = {
    user,
    profile,
    role: profile?.role || null,
    isAdmin,
    loading,
    login,
    loginWithGoogle,
    logout,
    extendSession,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}

      {sessionWarning && (
        <div style={warningStyles.overlay}>
          <div style={warningStyles.box}>
            <div style={warningStyles.icon}>⏰</div>
            <h3 style={warningStyles.title}>Session Expiring Soon</h3>
            <p style={warningStyles.text}>
              Your admin session will expire in {sessionRemaining}.
              <br />
              Click below to stay logged in.
            </p>

            <div style={warningStyles.actions}>
              <button style={warningStyles.btnStay} onClick={extendSession}>
                Stay Logged In
              </button>

              <button style={warningStyles.btnLogout} onClick={logout}>
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

const warningStyles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10000,
    backdropFilter: "blur(4px)",
  },
  box: {
    background: "#fff",
    borderRadius: 18,
    padding: 32,
    textAlign: "center",
    maxWidth: 400,
    width: "90%",
    boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
  },
  icon: {
    fontSize: 48,
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 800,
    color: "#0f172a",
    margin: "0 0 8px",
  },
  text: {
    fontSize: 14,
    color: "#64748b",
    lineHeight: 1.6,
    margin: "0 0 20px",
  },
  actions: {
    display: "flex",
    gap: 10,
    justifyContent: "center",
  },
  btnStay: {
    padding: "10px 24px",
    borderRadius: 9,
    border: "none",
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
    color: "#fff",
    background: "linear-gradient(135deg,#ea580c,#f97316)",
    boxShadow: "0 2px 8px rgba(234,88,12,0.25)",
  },
  btnLogout: {
    padding: "10px 24px",
    borderRadius: 9,
    border: "none",
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
    background: "#f1f5f9",
    color: "#334155",
  },
};
