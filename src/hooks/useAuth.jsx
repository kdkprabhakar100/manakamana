import { createContext, useContext, useState, useEffect } from "react";
import { signInWithEmailAndPassword, signInWithPopup,           // ← add this
  GoogleAuthProvider, signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/config";

// ─── Hardcoded admin credentials ─────────────────────────────────────────────
// Change these to your preferred email/password
const ADMIN_EMAIL    = "kdkprabhakar100@gmail.com";
const ADMIN_PASSWORD = "Admin@1234";
const googleProvider = new GoogleAuthProvider();
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const loginWithGoogle = () => signInWithPopup(auth, googleProvider);
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setIsAdmin(u?.email === ADMIN_EMAIL);
      setLoading(false);
    });
    return unsub;
  }, []);

  const login = (email, password) =>
    signInWithEmailAndPassword(auth, email, password);

  const logout = () => signOut(auth);

  return (
  <AuthContext.Provider value={{ user, isAdmin, loading, login, loginWithGoogle, logout }}>
    {!loading && children}
  </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
