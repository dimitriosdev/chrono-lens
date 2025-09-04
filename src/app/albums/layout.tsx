"use client";
import React, { useState } from "react";
import type { Metadata } from "next";
import "../globals.css";
import Navigation, {
  NAV_LINKS,
} from "../../features/navigation/components/Navigation";
import MobileMenu from "../../features/navigation/components/MobileMenu";
import { useAuth } from "@/context/AuthContext";

type AlbumsLayoutProps = {
  children: React.ReactNode;
};

const AlbumsLayout: React.FC<AlbumsLayoutProps> = ({ children }) => {
  const { isSignedIn, loading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  if (loading) return null;
  if (!isSignedIn) return null;

  // Add mobile hamburger and MobileMenu for mobile navigation
  return (
    <div className="flex min-h-screen bg-gray-950 w-full h-screen overflow-hidden">
      {/* Mobile hamburger */}
      <div className="sm:hidden fixed top-0 left-0 w-full h-14 bg-gray-950 z-40 flex items-center px-4 border-b border-gray-800">
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
      <div className="hidden sm:fixed sm:inset-y-0 sm:left-0 sm:w-20 sm:block">
        <Navigation />
      </div>
      {/* Mobile menu overlay */}
      <MobileMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        navLinks={NAV_LINKS.map(({ href, label }) => ({ href, label }))}
      />
      {/* Main content area - always scrollable */}
      <main className="flex-1 h-full overflow-y-auto">{children}</main>
    </div>
  );
};

export default AlbumsLayout;
