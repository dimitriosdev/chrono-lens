"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/shared/context";
import { Navigation } from "@/features/navigation";
import { BackgroundImage } from "@/shared/components";
import { signInWithGoogle } from "@/shared/lib/auth";

const Root = () => {
  const { isSignedIn, setIsSignedIn } = useAuth();
  const [message, setMessage] = useState<string>("");

  // Sign in handler
  const handleSignIn = async () => {
    const user = await signInWithGoogle();
    if (user) {
      localStorage.setItem("isSignedIn", "true");
      setIsSignedIn(true);
    }
  };

  // Sync with localStorage on mount and check for message
  useEffect(() => {
    if (typeof window !== "undefined") {
      const signedIn = localStorage.getItem("isSignedIn") === "true";
      setIsSignedIn(signedIn);

      // Check for message in URL
      const params = new URLSearchParams(window.location.search);
      const urlMessage = params.get("message");
      if (urlMessage) {
        setMessage(urlMessage);
        // Clear message from URL after reading
        const newUrl = window.location.pathname;
        window.history.replaceState({}, "", newUrl);
      }
    }
    // Only run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // const router = useRouter();

  // Reusable button style
  const buttonClass =
    "w-full max-w-xs mx-auto bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-bold py-3 px-8 rounded-xl text-lg shadow-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 active:scale-95";

  if (isSignedIn) {
    // Show a simple dashboard when signed in, with background image and consistent box styling
    return (
      <div className="relative min-h-screen w-full overflow-hidden">
        <BackgroundImage imageUrl="/bg-img.jpg" />
        <div className="flex min-h-screen w-full relative z-10">
          <Navigation />
          <main className="flex-1 flex flex-col items-center justify-center pb-16 sm:pb-0 sm:pl-16"></main>
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
            {message && (
              <div className="mb-6 p-4 bg-yellow-900/50 border border-yellow-600 rounded-lg">
                <p className="text-yellow-200">{message}</p>
              </div>
            )}
            {!isSignedIn && (
              <button
                onClick={handleSignIn}
                className={buttonClass}
                aria-label="Sign in with Google"
              >
                <span className="inline-flex items-center justify-center gap-2">
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 48 48"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="inline-block align-middle"
                  >
                    <g>
                      <path
                        fill="#4285F4"
                        d="M24 9.5c3.54 0 6.72 1.22 9.22 3.22l6.9-6.9C36.62 2.36 30.7 0 24 0 14.82 0 6.44 5.06 1.96 12.44l8.06 6.27C12.36 13.06 17.74 9.5 24 9.5z"
                      />
                      <path
                        fill="#34A853"
                        d="M46.09 24.55c0-1.64-.15-3.22-.43-4.75H24v9.02h12.44c-.54 2.92-2.18 5.39-4.65 7.06l7.23 5.62C43.98 37.36 46.09 31.36 46.09 24.55z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M10.02 28.71c-1.02-2.98-1.02-6.18 0-9.16l-8.06-6.27C.34 16.36 0 20.09 0 24c0 3.91.34 7.64 1.96 10.72l8.06-6.27z"
                      />
                      <path
                        fill="#EA4335"
                        d="M24 46c6.7 0 12.62-2.36 16.12-6.45l-7.23-5.62c-2.01 1.36-4.59 2.17-7.39 2.17-6.26 0-11.64-3.56-14.02-8.72l-8.06 6.27C6.44 42.94 14.82 48 24 48z"
                      />
                    </g>
                  </svg>
                  Sign in with Google
                </span>
              </button>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Root;
