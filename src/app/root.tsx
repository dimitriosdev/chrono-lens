"use client";

import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
// import { useRouter } from "next/navigation";
import Navigation from "../components/Navigation";
import BackgroundImage from "../components/BackgroundImage";
// import Layout from "../components/Layout";
import { signInWithGoogle } from "../features/auth";

const Root = () => {
  const { isSignedIn, setIsSignedIn } = useAuth();

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
    // Only run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // const router = useRouter();

  if (isSignedIn) {
    // Show a simple dashboard when signed in, with background image and consistent box styling
    return (
      <div className="relative min-h-screen w-full overflow-hidden">
        <BackgroundImage imageUrl="/bg-img.jpg" />
        <div className="flex min-h-screen w-full relative z-10">
          <Navigation />
          <main className="flex-1 flex flex-col items-center justify-center pt-0">
            <div className="w-full max-w-xl bg-gray-900 rounded-2xl shadow-2xl p-8 text-center">
              <h1 className="text-3xl font-bold text-cyan-400 mb-4">
                Welcome!
              </h1>
              <p className="text-white mb-6">
                You are signed in. Use the navigation to explore your albums and
                more.
              </p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <BackgroundImage imageUrl="/bg-img.jpg" />
      <div className="flex min-h-screen w-full relative z-10">
        <Navigation />
        <main className="flex-1 flex items-center justify-center pt-0">
          <div className="w-full max-w-xl bg-gray-900 rounded-2xl shadow-2xl p-8 text-center">
            <h1 className="text-3xl font-bold text-cyan-400 mb-4">
              Chrono Lens
            </h1>
            {!isSignedIn && (
              <div className="w-40 mx-auto">
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
};

export default Root;
