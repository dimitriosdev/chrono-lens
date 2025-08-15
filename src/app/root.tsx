"use client";

import { useState, useEffect } from "react";
import Sidebar from "../features/navigation/Sidebar";
import MobileMenu from "../features/navigation/MobileMenu";
import Image from "next/image";
import Layout from "../components/Layout";

export default function RootPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  // Close mobile menu with Escape key
  useEffect(() => {
    if (!menuOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [menuOpen]);

  // Simulated auth state (replace with real logic)
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  if (isLoggedIn) {
    // Show grid layout when signed in, with sign out button in nav
    return (
      <Layout isLoggedIn={isLoggedIn} onSignOut={() => setIsLoggedIn(false)} />
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-900 relative">
      {/* Sticky row for mobile nav icon */}
      <div className="sm:hidden fixed top-0 left-0 w-full h-14 bg-gray-900 z-40 flex items-center px-4 border-b border-gray-800">
        <button
          onClick={() => setMenuOpen(true)}
          className="bg-gray-900 rounded-full p-2 shadow-lg"
          aria-label="Open menu"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="h-7 w-7 text-white"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 6.75h16.5m-16.5 5.5h16.5m-16.5 5.5h16.5"
            />
          </svg>
        </button>
      </div>
      {/* Sidebar for desktop */}
      <div className="hidden sm:block">
        <Sidebar />
      </div>
      {/* Mobile menu overlay */}
      <MobileMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        isLoggedIn={isLoggedIn}
      />
      {/* Main content with background */}
      <main className="flex-1 flex items-center justify-center pt-14 sm:pt-0">
        <div className="w-full h-full absolute inset-0">
          <Image
            src="/bg-img.jpg"
            alt="Background Image"
            fill
            className="object-cover w-full h-full"
            priority
          />
        </div>
        <div className="bg-gray-900 rounded-xl p-8 text-center shadow-lg relative z-10">
          <a href="/about">
            <h1 className="text-3xl font-bold text-cyan-400 mb-4 cursor-pointer hover:underline">
              Chrono Lens
            </h1>
          </a>

          <button
            className="bg-cyan-400 text-gray-900 font-semibold px-6 py-2 rounded shadow hover:bg-cyan-300 transition"
            onClick={() => setIsLoggedIn(true)}
          >
            Sign In
          </button>
        </div>
      </main>
    </div>
  );
}
