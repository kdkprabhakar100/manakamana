import { useState, useEffect, useRef, createContext, useContext, createElement } from "react";
import {
  collection, onSnapshot, addDoc, updateDoc,
  deleteDoc, doc, serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/config";

const COL    = "contacts";
const LS_KEY = "manakamana_contacts";

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

/* ── Shared Context so every component sees the same contacts state ── */
const ContactsContext = createContext(null);

export function ContactsProvider({ children }) {
  const [contacts, setContacts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [useLocal, setUseLocal] = useState(false);
  const unsubRef = useRef(null);

  useEffect(() => {
    if (!firebaseReady()) {
      setContacts(getLocal());
      setUseLocal(true);
      setLoading(false);
      return;
    }

    const timeout = setTimeout(() => {
      if (unsubRef.current) { unsubRef.current(); unsubRef.current = null; }
      setContacts(getLocal());
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
          setContacts(list);
          setUseLocal(false);
          setLoading(false);
        },
        (err) => {
          clearTimeout(timeout);
          console.warn("Firestore contacts error:", err.message);
          setContacts(getLocal());
          setUseLocal(true);
          setLoading(false);
        }
      );
      unsubRef.current = unsub;
    } catch (err) {
      clearTimeout(timeout);
      setContacts(getLocal());
      setUseLocal(true);
      setLoading(false);
    }

    return () => {
      clearTimeout(timeout);
      if (unsubRef.current) unsubRef.current();
    };
  }, []);

  const addContact = async (data) => {
    if (useLocal) {
      const c = { ...data, id: Date.now().toString(), createdAt: new Date().toISOString(), read: false };
      const updated = [c, ...getLocal()];
      saveLocal(updated);
      setContacts(updated);
      return c;
    }
    return addDoc(collection(db, COL), { ...data, createdAt: serverTimestamp(), read: false });
  };

  const markRead = async (id) => {
    if (useLocal) {
      const updated = getLocal().map(c => c.id === id ? { ...c, read: true } : c);
      saveLocal(updated);
      setContacts(updated);
      return;
    }
    return updateDoc(doc(db, COL, id), { read: true });
  };

  const deleteContact = async (id) => {
    if (useLocal) {
      const updated = getLocal().filter(c => c.id !== id);
      saveLocal(updated);
      setContacts(updated);
      return;
    }
    return deleteDoc(doc(db, COL, id));
  };

  const unreadCount = contacts.filter(c => !c.read).length;

  const value = { contacts, loading, addContact, markRead, deleteContact, unreadCount, useLocal };

  return createElement(ContactsContext.Provider, { value }, children);
}

export function useContacts() {
  const ctx = useContext(ContactsContext);
  if (!ctx) throw new Error("useContacts must be used within <ContactsProvider>");
  return ctx;
}
