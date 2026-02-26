import { useState, useEffect, useRef } from "react";
import {
  collection, onSnapshot, addDoc, updateDoc,
  deleteDoc, doc, serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/config";

const COL    = "products";
const LS_KEY = "manakamana_products";

/* ── localStorage helpers ── */
function getLocal() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || "[]"); }
  catch { return []; }
}
function saveLocal(list) {
  localStorage.setItem(LS_KEY, JSON.stringify(list));
}

/* ── Is Firebase actually configured? ── */
function firebaseReady() {
  try { return !db.app.options.projectId.includes("YOUR_PROJECT_ID"); }
  catch { return false; }
}

export function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [useLocal, setUseLocal] = useState(false);
  const unsubRef = useRef(null);

  useEffect(() => {
    /* ── If Firebase not configured, use localStorage immediately ── */
    if (!firebaseReady()) {
      setProducts(getLocal());
      setUseLocal(true);
      setLoading(false);
      return;
    }

    /* ── Safety timeout: if Firestore doesn't respond in 5s, fall back ── */
    const timeout = setTimeout(() => {
      console.warn("Firestore timeout — switching to localStorage");
      if (unsubRef.current) { unsubRef.current(); unsubRef.current = null; }
      setProducts(getLocal());
      setUseLocal(true);
      setLoading(false);
    }, 5000);

    /* ── Try Firestore — NO orderBy so no index needed ── */
    try {
      const unsub = onSnapshot(
        collection(db, COL),
        (snap) => {
          clearTimeout(timeout);
          // Sort by createdAt client-side so no Firestore index required
          const list = snap.docs
            .map(d => ({ id: d.id, ...d.data() }))
            .sort((a, b) => {
              const ta = a.createdAt?.seconds ?? 0;
              const tb = b.createdAt?.seconds ?? 0;
              return tb - ta;
            });
          setProducts(list);
          setUseLocal(false);
          setLoading(false);
        },
        (err) => {
          clearTimeout(timeout);
          console.warn("Firestore error — using localStorage:", err.message);
          setProducts(getLocal());
          setUseLocal(true);
          setLoading(false);
        }
      );
      unsubRef.current = unsub;
    } catch (err) {
      clearTimeout(timeout);
      console.warn("Firebase crash — using localStorage:", err.message);
      setProducts(getLocal());
      setUseLocal(true);
      setLoading(false);
    }

    return () => {
      clearTimeout(timeout);
      if (unsubRef.current) unsubRef.current();
    };
  }, []);

  /* ══ CRUD ══ */

  const addProduct = async (data) => {
    if (useLocal) {
      const p = { ...data, id: Date.now().toString(), createdAt: new Date().toISOString() };
      const updated = [p, ...getLocal()];
      saveLocal(updated);
      setProducts(updated);
      return p;
    }
    return addDoc(collection(db, COL), { ...data, createdAt: serverTimestamp() });
  };

  const updateProduct = async (id, data) => {
    if (useLocal) {
      const updated = getLocal().map(p => p.id === id ? { ...p, ...data } : p);
      saveLocal(updated);
      setProducts(updated);
      return;
    }
    return updateDoc(doc(db, COL, id), { ...data, updatedAt: serverTimestamp() });
  };

  const deleteProduct = async (id) => {
    if (useLocal) {
      const updated = getLocal().filter(p => p.id !== id);
      saveLocal(updated);
      setProducts(updated);
      return;
    }
    return deleteDoc(doc(db, COL, id));
  };

  return { products, loading, addProduct, updateProduct, deleteProduct, useLocal };
}