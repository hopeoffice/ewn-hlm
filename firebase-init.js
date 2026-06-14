// ============================================================
// firebase-init.js  —  Central Firebase Initialization
// Firebase SDK v10 (modular) via CDN
// ============================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth }       from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore }  from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ── Your Firebase project config ──────────────────────────────
// Replace these values with the ones from your Firebase console:
// Project Settings → General → Your apps → Firebase SDK snippet
const firebaseConfig = {
  apiKey:            "YOUR_API_KEY",
  authDomain:        "YOUR_PROJECT_ID.firebaseapp.com",
  projectId:         "YOUR_PROJECT_ID",
  storageBucket:     "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId:             "YOUR_APP_ID",
  // databaseURL is intentionally removed — we are using Firestore now
};

// ── Initialize Firebase ───────────────────────────────────────
const app = initializeApp(firebaseConfig);

// ── Firebase Auth (kept from original setup) ──────────────────
const auth = getAuth(app);

// ── Cloud Firestore (replaces Realtime Database) ──────────────
const db = getFirestore(app);

// ── Exports ───────────────────────────────────────────────────
export { auth, db };
