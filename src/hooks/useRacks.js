/**
 * useRacks — manages rack locations with nested sections
 *
 * Data shape (per rack doc in Firestore / localStorage):
 *   { id: string, name: string, sections: string[] }
 *
 * Mirrors the pattern of useCategories so it plugs in seamlessly.
 * Replace the localStorage implementation with Firestore calls to match
 * however useCategories connects to your backend.
 */

import { useState, useEffect } from "react";

const LS_KEY = "app_racks";

function loadFromLS() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveToLS(racks) {
  localStorage.setItem(LS_KEY, JSON.stringify(racks));
}

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export function useRacks() {
  const [racks, setRacks] = useState([]);

  /* ── Load ── */
  useEffect(() => {
    // 🔥 FIREBASE VERSION (replace localStorage block):
    // const unsub = onSnapshot(collection(db, "racks"), snap => {
    //   setRacks(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    // });
    // return unsub;

    setRacks(loadFromLS());
  }, []);

  /* ── Add rack ── */
  const addRack = async (name) => {
    // 🔥 FIREBASE: const ref = await addDoc(collection(db, "racks"), { name, sections: [] });
    const newRack = { id: uid(), name, sections: [] };
    const updated = [...racks, newRack];
    setRacks(updated);
    saveToLS(updated);
  };

  /* ── Delete rack ── */
  const deleteRack = async (id) => {
    // 🔥 FIREBASE: await deleteDoc(doc(db, "racks", id));
    const updated = racks.filter(r => r.id !== id);
    setRacks(updated);
    saveToLS(updated);
  };

  /* ── Add section to a rack ── */
  const addSection = async (rackId, sectionName) => {
    // 🔥 FIREBASE:
    // const ref = doc(db, "racks", rackId);
    // await updateDoc(ref, { sections: arrayUnion(sectionName) });
    const updated = racks.map(r =>
      r.id === rackId
        ? { ...r, sections: r.sections.includes(sectionName) ? r.sections : [...r.sections, sectionName] }
        : r
    );
    setRacks(updated);
    saveToLS(updated);
  };

  /* ── Delete section from a rack ── */
  const deleteSection = async (rackId, sectionName) => {
    // 🔥 FIREBASE:
    // const ref = doc(db, "racks", rackId);
    // await updateDoc(ref, { sections: arrayRemove(sectionName) });
    const updated = racks.map(r =>
      r.id === rackId
        ? { ...r, sections: r.sections.filter(s => s !== sectionName) }
        : r
    );
    setRacks(updated);
    saveToLS(updated);
  };

  return { racks, addRack, deleteRack, addSection, deleteSection };
}