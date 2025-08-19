// Firebase initialization utility
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Validate that all required environment variables are present
const requiredEnvVars = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Debug logging for build time
console.log("Firebase Environment Variables Check:", {
  apiKey: !!requiredEnvVars.apiKey,
  authDomain: !!requiredEnvVars.authDomain,
  projectId: !!requiredEnvVars.projectId,
  storageBucket: !!requiredEnvVars.storageBucket,
  messagingSenderId: !!requiredEnvVars.messagingSenderId,
  appId: !!requiredEnvVars.appId,
});

// Debug actual values (safely)
console.log("Environment Variable Details:", {
  apiKeyLength: requiredEnvVars.apiKey?.length || 0,
  projectIdValue: requiredEnvVars.projectId || "undefined",
  authDomainValue: requiredEnvVars.authDomain || "undefined",
  nodeEnv: process.env.NODE_ENV,
  allFirebaseEnvVars: Object.keys(process.env).filter((key) =>
    key.includes("FIREBASE")
  ),
});

// Check for missing environment variables
const missingVars = Object.entries(requiredEnvVars)
  .filter(([, value]) => !value)
  .map(([key]) => {
    // Map to exact environment variable names
    const envVarMap: { [key: string]: string } = {
      apiKey: "NEXT_PUBLIC_FIREBASE_API_KEY",
      authDomain: "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
      projectId: "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
      storageBucket: "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
      messagingSenderId: "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
      appId: "NEXT_PUBLIC_FIREBASE_APP_ID",
    };
    return envVarMap[key] || `NEXT_PUBLIC_FIREBASE_${key.toUpperCase()}`;
  });

if (missingVars.length > 0) {
  throw new Error(
    `Missing required Firebase environment variables: ${missingVars.join(", ")}`
  );
}

const firebaseConfig = {
  apiKey: requiredEnvVars.apiKey!,
  authDomain: requiredEnvVars.authDomain!,
  projectId: requiredEnvVars.projectId!,
  storageBucket: requiredEnvVars.storageBucket!,
  messagingSenderId: requiredEnvVars.messagingSenderId!,
  appId: requiredEnvVars.appId!,
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const storage = getStorage(app);

export { app, auth, storage };
