import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

const fallbackConfig = {
  apiKey: "AIzaSyDummyKeyForBuildPurposes",
  authDomain: "carebridge-dummy.firebaseapp.com",
  projectId: "carebridge-dummy",
  storageBucket: "carebridge-dummy.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:1234567890abcdef",
  measurementId: "G-DUMMYMEASURE"
};

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || fallbackConfig.apiKey,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || fallbackConfig.authDomain,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || fallbackConfig.projectId,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || fallbackConfig.storageBucket,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || fallbackConfig.messagingSenderId,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || fallbackConfig.appId,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || fallbackConfig.measurementId
};

let app: FirebaseApp = null as unknown as FirebaseApp;
let auth: Auth = null as unknown as Auth;
let db: Firestore = null as unknown as Firestore;
let firebaseInitializationError: string | null = null;

try {
  // Early check for obviously invalid key lengths to avoid native Firebase crash
  if (firebaseConfig.apiKey !== fallbackConfig.apiKey) {
    if (!firebaseConfig.apiKey.startsWith("AIzaSy") || firebaseConfig.apiKey.length < 20) {
      throw new Error("API Key format is invalid. A valid Firebase API key must start with 'AIzaSy' and be at least 30 characters long.");
    }
  }

  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  auth = getAuth(app);
  db = getFirestore(app);
} catch (error: unknown) {
  const err = error as Error;
  console.warn("Firebase real initialization failed, falling back to dummy config:", err);
  firebaseInitializationError = err.message || "Failed to initialize Firebase with real credentials.";
  
  // Clean initialization with fallback config so typescript-level objects remain valid
  try {
    // Clear out any half-initialized app
    app = initializeApp(fallbackConfig, "fallback");
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (fallbackError: unknown) {
    console.error("Firebase fallback initialization also failed:", fallbackError);
  }
}

export { auth, db, firebaseInitializationError };
export default app;
