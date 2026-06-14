import { useState, useEffect, useRef } from "react";
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/config";

const COL = "customers";
const LS_KEY = "manakamana_customers";

function getLocal() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveLocal(list) {
  localStorage.setItem(LS_KEY, JSON.stringify(list));
}

function firebaseReady() {
  try {
    return !db.app.options.projectId.includes("YOUR_PROJECT_ID");
  } catch {
    return false;
  }
}

function cleanCustomer(data = {}) {
  return {
    name: (data.name || "").trim(),
    company: (data.company || "").trim(),
    phone: (data.phone || "").trim(),
    address: (data.address || "").trim(),
    gstin: (data.gstin || "").trim(),
    email: (data.email || "").trim(),
    notes: (data.notes || "").trim(),
    payment: (data.payment || "").trim(),
  };
}

function normalizeName(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function normalizePhone(value) {
  return String(value || "").replace(/\D/g, "");
}

function normalizePan(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function findCustomerMatch(customers, clientData) {
  const clean = cleanCustomer(clientData);

  const clientPan = normalizePan(clean.gstin);
  const clientPhone = normalizePhone(clean.phone);
  const clientName = normalizeName(clean.name);

  // If someone accidentally types phone/PAN in the name box,
  // this still helps match an old customer.
  const nameAsPhone = normalizePhone(clean.name);
  const nameAsPan = normalizePan(clean.name);

  if (clientPan) {
    const byPan = customers.find(
      (customer) => normalizePan(customer.gstin) === clientPan
    );

    if (byPan) return byPan;
  }

  if (clientPhone) {
    const byPhone = customers.find(
      (customer) => normalizePhone(customer.phone) === clientPhone
    );

    if (byPhone) return byPhone;
  }

  if (nameAsPhone) {
    const byNamePhone = customers.find(
      (customer) => normalizePhone(customer.phone) === nameAsPhone
    );

    if (byNamePhone) return byNamePhone;
  }

  if (nameAsPan) {
    const byNamePan = customers.find(
      (customer) => normalizePan(customer.gstin) === nameAsPan
    );

    if (byNamePan) return byNamePan;
  }

  if (clientName) {
    const byName = customers.find(
      (customer) => normalizeName(customer.name) === clientName
    );

    if (byName) return byName;
  }

  return null;
}

function mergeCustomer(existing, incoming) {
  const clean = cleanCustomer(incoming);

  return {
    name: existing.name || clean.name,
    company: existing.company || clean.company,
    phone: existing.phone || clean.phone,
    address: existing.address || clean.address,
    gstin: existing.gstin || clean.gstin,
    email: existing.email || clean.email,
    notes: existing.notes || clean.notes || "",
    payment: existing.payment || clean.payment || "",
  };
}

export function useCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [useLocal, setUseLocal] = useState(false);
  const unsubRef = useRef(null);

  useEffect(() => {
    if (!firebaseReady()) {
      setCustomers(getLocal());
      setUseLocal(true);
      setLoading(false);
      return;
    }

    const timeout = setTimeout(() => {
      if (unsubRef.current) {
        unsubRef.current();
        unsubRef.current = null;
      }

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
            .map((item) => ({ id: item.id, ...item.data() }))
            .sort((a, b) => (a.name || "").localeCompare(b.name || ""));

          setCustomers(list);
          setUseLocal(false);
          setLoading(false);
        },
        () => {
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

  const addCustomer = async (data) => {
    const clean = cleanCustomer(data);

    if (!clean.name) {
      throw new Error("Customer name is required.");
    }

    if (useLocal) {
      const item = {
        ...clean,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };

      const updated = [...getLocal(), item].sort((a, b) =>
        a.name.localeCompare(b.name)
      );

      saveLocal(updated);
      setCustomers(updated);

      return item;
    }

    return addDoc(collection(db, COL), {
      ...clean,
      createdAt: serverTimestamp(),
    });
  };

  const updateCustomer = async (id, data) => {
    const clean = cleanCustomer(data);

    if (!clean.name) {
      throw new Error("Customer name is required.");
    }

    if (useLocal) {
      const updated = getLocal()
        .map((customer) =>
          customer.id === id ? { ...customer, ...clean } : customer
        )
        .sort((a, b) => a.name.localeCompare(b.name));

      saveLocal(updated);
      setCustomers(updated);

      return;
    }

    return updateDoc(doc(db, COL, id), {
      ...clean,
      updatedAt: serverTimestamp(),
    });
  };

  const deleteCustomer = async (id) => {
    if (useLocal) {
      const updated = getLocal().filter((customer) => customer.id !== id);

      saveLocal(updated);
      setCustomers(updated);

      return;
    }

    return deleteDoc(doc(db, COL, id));
  };

  /**
   * upsertFromInvoice — called when an invoice is saved.
   *
   * Match priority:
   * 1. VAT/PAN
   * 2. Phone number
   * 3. Phone/PAN typed inside name field
   * 4. Customer name
   *
   * If matched, it fills missing customer details without overwriting old data.
   * If no match, it creates a new customer record.
   */
  const upsertFromInvoice = async (clientData) => {
    const clean = cleanCustomer(clientData);

    if (!clean.name) return;

    const existing = findCustomerMatch(customers, clean);

    if (existing) {
      const merged = mergeCustomer(existing, clean);
      await updateCustomer(existing.id, merged);
      return;
    }

    await addCustomer(clean);
  };

  return {
    customers,
    loading,
    useLocal,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    upsertFromInvoice,
  };
}
