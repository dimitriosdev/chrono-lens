"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navigation from "../components/Navigation";
import Image from "next/image";
import Layout from "../components/Layout";
import { signInWithGoogle } from "../features/auth";

export default function RootPage() {
  // Simulated auth state (replace with real logic)
  const [isSignedIn, setIsSignedIn] = useState(false);

  // Sign in handler
  const handleSignIn = async () => {
    const user = await signInWithGoogle();
    if (user) {
      localStorage.setItem("isSignedIn", "true");
      setIsSignedIn(true);
    }
  };
  // Sync with localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const signedIn = localStorage.getItem("isSignedIn") === "true";
      setIsSignedIn(signedIn);
    }
  }, []);
  const router = useRouter();

  if (isSignedIn) {
    // Show grid layout when signed in, with sign out button in nav
    return (
      <Layout isLoggedIn={isSignedIn} onSignOut={() => setIsSignedIn(false)} />
    );
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background image covers all space */}
      <div className="fixed inset-0 w-full h-full z-0">
        <Image
          src="/bg-img.jpg"
          alt="Background Image"
          fill
          className="object-cover w-full h-full"
          priority
        />
      </div>
      <div className="flex min-h-screen w-full relative z-10">
        <Navigation />
        <main className="flex-1 flex items-center justify-center pt-0">
          <div className="bg-gray-900 rounded-xl p-8 text-center shadow-lg">
            <h1 className="text-3xl font-bold text-cyan-400 mb-4">
              Chrono Lens
            </h1>
            {!isSignedIn && (
              <div className=" w-40">
                <button
                  onClick={handleSignIn}
                  className="w-full bg-white text-gray-900 font-semibold px-4 py-2 rounded shadow hover:bg-gray-100"
                  aria-label="Sign in with Google"
                >
                  Sign in with Google
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
