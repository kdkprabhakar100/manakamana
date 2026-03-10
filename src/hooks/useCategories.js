import { useState, useEffect, useRef } from "react";
import {
    collection, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/config";

const COL = "categories";
const LS_KEY = "manakamana_categories";

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

export function useCategories() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [useLocal, setUseLocal] = useState(false);
    const unsubRef = useRef(null);

    useEffect(() => {
        if (!firebaseReady()) {
            setCategories(getLocal());
            setUseLocal(true);
            setLoading(false);
            return;
        }

        const timeout = setTimeout(() => {
            console.warn("Categories: Firestore timeout — switching to localStorage");
            if (unsubRef.current) { unsubRef.current(); unsubRef.current = null; }
            setCategories(getLocal());
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
                    setCategories(list);
                    setUseLocal(false);
                    setLoading(false);
                },
                (err) => {
                    clearTimeout(timeout);
                    console.warn("Categories: Firestore error — using localStorage:", err.message);
                    setCategories(getLocal());
                    setUseLocal(true);
                    setLoading(false);
                }
            );
            unsubRef.current = unsub;
        } catch (err) {
            clearTimeout(timeout);
            console.warn("Categories: Firebase crash — using localStorage:", err.message);
            setCategories(getLocal());
            setUseLocal(true);
            setLoading(false);
        }

        return () => {
            clearTimeout(timeout);
            if (unsubRef.current) unsubRef.current();
        };
    }, []);

    const addCategory = async (name) => {
        const trimmed = name.trim();
        if (!trimmed) return null;
        // Prevent duplicates (case-insensitive)
        const existing = categories.find(c => c.name.toLowerCase() === trimmed.toLowerCase());
        if (existing) return existing;

        if (useLocal) {
            const c = { id: Date.now().toString(), name: trimmed, createdAt: new Date().toISOString() };
            const updated = [...getLocal(), c].sort((a, b) => a.name.localeCompare(b.name));
            saveLocal(updated);
            setCategories(updated);
            return c;
        }
        const ref = await addDoc(collection(db, COL), { name: trimmed, createdAt: serverTimestamp() });
        return { id: ref.id, name: trimmed };
    };

    const deleteCategory = async (id) => {
        if (useLocal) {
            const updated = getLocal().filter(c => c.id !== id);
            saveLocal(updated);
            setCategories(updated);
            return;
        }
        return deleteDoc(doc(db, COL, id));
    };

    return { categories, loading, addCategory, deleteCategory, useLocal };
}
