
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBrXcoTk-pTPUUtDiJS7r8Fxc2v5jiWK2k",
  authDomain: "manakamana-17aa3.firebaseapp.com",
  projectId: "manakamana-17aa3",
  storageBucket: "manakamana-17aa3.appspot.com",
  messagingSenderId: "263670243532",
  appId: "1:263670243532:web:f9011afffe606a0e916269",
};

const app = initializeApp(firebaseConfig);

export const db      = getFirestore(app);
export const auth    = getAuth(app);
export const storage = getStorage(app);
export default app;
