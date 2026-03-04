
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, setPersistence, browserSessionPersistence } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBrXcoTk-pTPUUtDiJS7r8Fxc2v5jiWK2k",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "manakamana-17aa3.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "manakamana-17aa3",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "manakamana-17aa3.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "263670243532",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:263670243532:web:f9011afffe606a0e916269",
};

const app = initializeApp(firebaseConfig);

export const db      = getFirestore(app);
export const auth    = getAuth(app);
export const storage = getStorage(app);

// Force login on every new browser session (closing browser clears auth)
setPersistence(auth, browserSessionPersistence);

export default app;
