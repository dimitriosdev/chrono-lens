"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function NotFoundPage() {
  const router = useRouter();
  const [showRedirect, setShowRedirect] = useState(false);

  // Fun photo-related 404 message
  const message = "️ This picture fell out of the album somewhere";

  useEffect(() => {
    const path = window.location.pathname;

    // If it looks like an album route, try to navigate there
    if (path.match(/^\/albums\/[^\/]+\/(edit|play)$/)) {
      // Give user a chance to see the 404 page, then redirect
      setTimeout(() => {
        router.push(path);
      }, 2000);
      return;
    }

    // Show redirect option after a delay
    setTimeout(() => {
      setShowRedirect(true);
    }, 1500);
  }, [router]);

  const handleGoHome = () => {
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-blue-950 flex items-center justify-center p-4">
      <div className="max-w-md text-center">
        {/* Camera Icon Animation */}
        <div className="mb-8 relative">
          <div className="w-32 h-32 mx-auto bg-gray-800 rounded-2xl flex items-center justify-center shadow-2xl border border-gray-700">
            <div className="text-6xl animate-pulse">📷</div>
          </div>
          {/* Flash effect */}
          <div className="absolute inset-0 w-32 h-32 mx-auto bg-white rounded-2xl opacity-0 animate-ping"></div>
        </div>

        {/* Error Message */}
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold text-blue-400 mb-4 animate-bounce">
            404
          </h1>
          <p className="text-xl text-gray-300 mb-6 leading-relaxed">
            {message}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          {showRedirect && (
            <button
              onClick={handleGoHome}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transform transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              📱 Return to Photo Albums
            </button>
          )}
        </div>

        {/* Loading Animation for Album Routes */}
        {!showRedirect && (
          <div className="mt-6">
            <div className="flex items-center justify-center space-x-2 text-gray-400">
              <div
                className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                style={{ animationDelay: "0ms" }}
              ></div>
              <div
                className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                style={{ animationDelay: "150ms" }}
              ></div>
              <div
                className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                style={{ animationDelay: "300ms" }}
              ></div>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Developing this page...
            </p>
          </div>
        )}
      </div>

      {/* Floating Photo Frames */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-16 h-16 bg-gray-800 rounded-lg opacity-20 transform rotate-12 animate-float"></div>
        <div className="absolute top-40 right-20 w-12 h-12 bg-gray-700 rounded-lg opacity-15 transform -rotate-6 animate-float-delayed"></div>
        <div className="absolute bottom-32 left-20 w-20 h-16 bg-gray-800 rounded-lg opacity-10 transform rotate-45 animate-float-slow"></div>
        <div className="absolute bottom-20 right-16 w-14 h-14 bg-gray-700 rounded-lg opacity-20 transform -rotate-12 animate-float"></div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(12deg);
          }
          50% {
            transform: translateY(-20px) rotate(12deg);
          }
        }
        @keyframes float-delayed {
          0%,
          100% {
            transform: translateY(0px) rotate(-6deg);
          }
          50% {
            transform: translateY(-15px) rotate(-6deg);
          }
        }
        @keyframes float-slow {
          0%,
          100% {
            transform: translateY(0px) rotate(45deg);
          }
          50% {
            transform: translateY(-10px) rotate(45deg);
          }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 4s ease-in-out infinite;
        }
        .animate-float-slow {
          animation: float-slow 5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
