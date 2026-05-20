import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";

import { getFirestore } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

  const firebaseConfig = {
    apiKey: "AIzaSyA7auvj7YabiEkX97pcSFOJwDnSzQqWVL8",
    authDomain: "cultural-heritage-database.firebaseapp.com",
    projectId: "cultural-heritage-database",
    storageBucket: "cultural-heritage-database.firebasestorage.app",
    messagingSenderId: "776636247645",
    appId: "1:776636247645:web:ac34b9e2ef8b00524067b4"
  };

  const app = initializeApp(firebaseConfig);

  export const db = getFirestore(app);