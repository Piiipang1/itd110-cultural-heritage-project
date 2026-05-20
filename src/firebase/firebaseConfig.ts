import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAAoczK-j6fbpC6qZGDEe5Z1c1QXusNMEc",
  authDomain: "oway-f8661.firebaseapp.com",
  projectId: "oway-f8661",
  storageBucket: "oway-f8661.firebasestorage.app",
  messagingSenderId: "476806512418",
  appId: "1:476806512418:web:5d58f7523f6e8215a06f7b",
  measurementId: "G-3B5PGXFY02"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);