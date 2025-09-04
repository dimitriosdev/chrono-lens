"use client";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import type { User } from "firebase/auth";

interface AuthContextType {
  isSignedIn: boolean;
  setIsSignedIn: (signedIn: boolean) => void;
  loading: boolean;
  user: User | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Initialize from localStorage first
    const storedSignInState = localStorage.getItem("isSignedIn") === "true";
    setIsSignedIn(storedSignInState);

    // Then check Firebase auth state
    const initializeFirebaseAuth = async () => {
      try {
        const { getFirebaseAuth } = await import("../lib/firebase");
        const auth = getFirebaseAuth();

        if (auth) {
          // Listen for auth state changes
          const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
            if (firebaseUser) {
              // User is signed in
              setUser(firebaseUser);
              setIsSignedIn(true);
              localStorage.setItem("isSignedIn", "true");

              if (process.env.NODE_ENV === "development") {
                console.log("Firebase auth: User signed in", firebaseUser.uid);
              }
            } else {
              // User is signed out
              setUser(null);
              setIsSignedIn(false);
              localStorage.setItem("isSignedIn", "false");

              if (process.env.NODE_ENV === "development") {
                console.log("Firebase auth: User signed out");
              }
            }
            setLoading(false);
          });

          // Return cleanup function
          return unsubscribe;
        } else {
          // Firebase not available, fall back to localStorage
          setLoading(false);
        }
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.warn("Failed to initialize Firebase auth:", error);
        }
        setLoading(false);
      }
    };

    const unsubscribePromise = initializeFirebaseAuth();

    // Cleanup on unmount
    return () => {
      unsubscribePromise?.then((unsubscribe) => {
        if (typeof unsubscribe === "function") {
          unsubscribe();
        }
      });
    };
  }, []);

  const handleSetIsSignedIn = (signedIn: boolean) => {
    setIsSignedIn(signedIn);
    localStorage.setItem("isSignedIn", signedIn.toString());
  };

  return (
    <AuthContext.Provider
      value={{
        isSignedIn,
        setIsSignedIn: handleSetIsSignedIn,
        loading,
        user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
