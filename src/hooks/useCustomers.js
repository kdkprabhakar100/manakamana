import { useState, useEffect, useRef } from "react";
import {
  collection, onSnapshot, addDoc, updateDoc,
  deleteDoc, doc, serverTimestamp, query, where, getDocs,
} from "firebase/firestore";
import { db } from "../firebase/config";

const COL    = "customers";
const LS_KEY = "manakamana_customers";

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

export function useCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [useLocal,  setUseLocal]  = useState(false);
  const unsubRef = useRef(null);

  useEffect(() => {
    if (!firebaseReady()) {
      setCustomers(getLocal());
      setUseLocal(true);
      setLoading(false);
      return;
    }

    const timeout = setTimeout(() => {
      if (unsubRef.current) { unsubRef.current(); unsubRef.current = null; }
      setCustomers(getLocal());
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
            .sort((a, b) => (a.name || "").localeCompare(b.name || ""));
          setCustomers(list);
          setUseLocal(false);
          setLoading(false);
        },
        (err) => {
          clearTimeout(timeout);
          setCustomers(getLocal());
          setUseLocal(true);
          setLoading(false);
        }
      );
      unsubRef.current = unsub;
    } catch {
      clearTimeout(timeout);
      setCustomers(getLocal());
      setUseLocal(true);
      setLoading(false);
    }

    return () => {
      clearTimeout(timeout);
      if (unsubRef.current) unsubRef.current();
    };
  }, []);

  /* ── CRUD ── */
  const addCustomer = async (data) => {
    const clean = {
      name:    (data.name    || "").trim(),
      company: (data.company || "").trim(),
      phone:   (data.phone   || "").trim(),
      address: (data.address || "").trim(),
      gstin:   (data.gstin   || "").trim(),
      email:   (data.email   || "").trim(),
      notes:   (data.notes   || "").trim(),
    };
    if (useLocal) {
      const item = { ...clean, id: Date.now().toString(), createdAt: new Date().toISOString() };
      const updated = [...getLocal(), item].sort((a,b) => a.name.localeCompare(b.name));
      saveLocal(updated);
      setCustomers(updated);
      return item;
    }
    return addDoc(collection(db, COL), { ...clean, createdAt: serverTimestamp() });
  };

  const updateCustomer = async (id, data) => {
    const clean = {
      name:    (data.name    || "").trim(),
      company: (data.company || "").trim(),
      phone:   (data.phone   || "").trim(),
      address: (data.address || "").trim(),
      gstin:   (data.gstin   || "").trim(),
      email:   (data.email   || "").trim(),
      notes:   (data.notes   || "").trim(),
    };
    if (useLocal) {
      const updated = getLocal().map(c => c.id === id ? { ...c, ...clean } : c)
        .sort((a,b) => a.name.localeCompare(b.name));
      saveLocal(updated);
      setCustomers(updated);
      return;
    }
    return updateDoc(doc(db, COL, id), { ...clean, updatedAt: serverTimestamp() });
  };

  const deleteCustomer = async (id) => {
    if (useLocal) {
      const updated = getLocal().filter(c => c.id !== id);
      saveLocal(updated);
      setCustomers(updated);
      return;
    }
    return deleteDoc(doc(db, COL, id));
  };

  /**
   * upsertFromInvoice — called when an invoice is saved.
   * If a customer with the same name already exists → update their info (only fill blanks).
   * If no match → create a new customer record.
   */
  const upsertFromInvoice = async (clientData) => {
    if (!clientData?.name?.trim()) return;
    const nameLower = clientData.name.trim().toLowerCase();

    const existing = customers.find(c => c.name.toLowerCase() === nameLower);
    if (existing) {
      // Only fill in blanks — don't overwrite existing data
      const merged = {
        name:    existing.name,
        company: existing.company || clientData.company || "",
        phone:   existing.phone   || clientData.phone   || "",
        address: existing.address || clientData.address || "",
        gstin:   existing.gstin   || clientData.gstin   || "",
        email:   existing.email   || clientData.email   || "",
        notes:   existing.notes   || "",
      };
      await updateCustomer(existing.id, merged);
    } else {
      await addCustomer(clientData);
    }
  };

  return { customers, loading, useLocal, addCustomer, updateCustomer, deleteCustomer, upsertFromInvoice };
}