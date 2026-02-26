import { useState, useEffect, useRef } from "react";
import {
  collection, onSnapshot, addDoc, updateDoc,
  deleteDoc, doc, serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/config";

const COL    = "invoices";
const LS_KEY = "manakamana_invoices";

function getLocal() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || "[]"); }
  catch { return []; }
}
function saveLocal(list) {
  localStorage.setItem(LS_KEY, JSON.stringify(list));
}

function firebaseReady() {
  try { return !db.app.options.projectId.includes("YOUR_PROJECT_ID"); }
  catch { return false; }
}

export function useInvoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [useLocal, setUseLocal] = useState(false);
  const unsubRef = useRef(null);

  useEffect(() => {
    if (!firebaseReady()) {
      setInvoices(getLocal());
      setUseLocal(true);
      setLoading(false);
      return;
    }

    const timeout = setTimeout(() => {
      if (unsubRef.current) { unsubRef.current(); unsubRef.current = null; }
      setInvoices(getLocal());
      setUseLocal(true);
      setLoading(false);
    }, 5000);

    try {
      const unsub = onSnapshot(
        collection(db, COL),
        (snap) => {
          clearTimeout(timeout);
          const list = snap.docs
            .map(d => ({ id: d.id, ...d.data() }))
            .sort((a, b) => {
              const ta = a.createdAt?.seconds ?? 0;
              const tb = b.createdAt?.seconds ?? 0;
              return tb - ta;
            });
          setInvoices(list);
          setUseLocal(false);
          setLoading(false);
        },
        (err) => {
          clearTimeout(timeout);
          console.warn("Firestore invoices error:", err.message);
          setInvoices(getLocal());
          setUseLocal(true);
          setLoading(false);
        }
      );
      unsubRef.current = unsub;
    } catch (err) {
      clearTimeout(timeout);
      setInvoices(getLocal());
      setUseLocal(true);
      setLoading(false);
    }

    return () => {
      clearTimeout(timeout);
      if (unsubRef.current) unsubRef.current();
    };
  }, []);

  const saveInvoice = async (data) => {
    if (useLocal) {
      const inv = { ...data, id: Date.now().toString(), createdAt: new Date().toISOString() };
      const updated = [inv, ...getLocal()];
      saveLocal(updated);
      setInvoices(updated);
      return inv;
    }
    return addDoc(collection(db, COL), { ...data, createdAt: serverTimestamp() });
  };

  const updateInvoice = async (id, data) => {
    if (useLocal) {
      const updated = getLocal().map(i => i.id === id ? { ...i, ...data } : i);
      saveLocal(updated);
      setInvoices(updated);
      return;
    }
    return updateDoc(doc(db, COL, id), { ...data, updatedAt: serverTimestamp() });
  };

  const deleteInvoice = async (id) => {
    if (useLocal) {
      const updated = getLocal().filter(i => i.id !== id);
      saveLocal(updated);
      setInvoices(updated);
      return;
    }
    return deleteDoc(doc(db, COL, id));
  };

  return { invoices, loading, saveInvoice, updateInvoice, deleteInvoice, useLocal };
}