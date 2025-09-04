// Firebase initialization utility
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getStorage, FirebaseStorage } from "firebase/storage";

// Firebase config - requires environment variables
const getFirebaseConfig = () => {
  // Validate that all required environment variables are present
  const config = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  // Check for missing environment variables
  const missingVars = Object.entries(config)
    .filter(([, value]) => !value)
    .map(
      ([key]) =>
        `NEXT_PUBLIC_FIREBASE_${key.replace(/([A-Z])/g, "_$1").toUpperCase()}`
    );

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required Firebase environment variables: ${missingVars.join(
        ", "
      )}`
    );
  }

  return config as Required<typeof config>;
};

// Initialize Firebase only when needed (client-side)
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let storage: FirebaseStorage | null = null;

const initializeFirebase = () => {
  if (typeof window === "undefined") {
    // Server-side: return null or mock objects
    return { app: null, auth: null, storage: null };
  }

  if (!app) {
    const firebaseConfig = getFirebaseConfig();
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    storage = getStorage(app);
  }

  return { app, auth, storage };
};

// Export getters that initialize on first use
export const getFirebaseApp = () => initializeFirebase().app;
export const getFirebaseAuth = () => initializeFirebase().auth;
export const getFirebaseStorage = () => initializeFirebase().storage;

// Legacy exports for backward compatibility
export {
  getFirebaseApp as app,
  getFirebaseAuth as auth,
  getFirebaseStorage as storage,
};
