"use client";
import React, { useState, useEffect } from "react";
import Sidebar from "../features/navigation/Sidebar";
import MobileMenu from "../features/navigation/MobileMenu";

// Shared navigation links
export const NAV_LINKS = [
  {
    href: "/",
    label: "Home",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="h-6 w-6 text-white"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.5 12.75l7.5-7.5 7.5 7.5"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19.5 10.5V19a2.5 2.5 0 01-2.5 2.5h-10A2.5 2.5 0 014.5 19v-8.5"
        />
      </svg>
    ),
  },
  {
    href: "/albums",
    label: "Albums",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="h-6 w-6 text-white"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 12l9-9 9 9M4.5 10.5V19a2.5 2.5 0 002.5 2.5h10a2.5 2.5 0 002.5-2.5V10.5"
        />
      </svg>
    ),
  },
  {
    href: "/about",
    label: "About",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="h-6 w-6 text-white"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 6v6m0 6h.01M12 4.5a7.5 7.5 0 1 1 0 15 7.5 7.5 0 0 1 0-15z"
        />
      </svg>
    ),
  },
  {
    href: "/albums/new",
    label: "Add new album",
    icon: null,
  },
];

export default function Navigation() {
  // Local sign-in state
  const [menuOpen, setMenuOpen] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false); // Always false on first render

  // Sync sign-in state on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsSignedIn(localStorage.getItem("isSignedIn") === "true");
    }
  }, []);

  // Sign in handler
  const handleSignIn = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("isSignedIn", "true");
      setIsSignedIn(true);
    }
  };

  // Sign out handler
  const handleSignOut = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("isSignedIn");
      setIsSignedIn(false);
      window.location.href = "/";
    }
  };

  // Home link is always visible
  const homeLink = NAV_LINKS.find((link) => link.label === "Home");
  const aboutLink = NAV_LINKS.find((link) => link.label === "About");
  const otherLinks = NAV_LINKS.filter(
    (link) => link.label !== "Home" && link.label !== "About"
  );
  const visibleLinks = [
    homeLink,
    ...(isSignedIn ? otherLinks : []),
    ...(aboutLink ? [aboutLink] : []),
  ].filter(Boolean);

  return (
    <>
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
        <Sidebar
          navLinks={visibleLinks.filter((link) => link !== undefined)}
          onSignOut={isSignedIn ? handleSignOut : undefined}
        />
      </div>
      {/* Mobile menu overlay */}
      <MobileMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        navLinks={visibleLinks.map((link) => ({
          href: link!.href,
          label: link!.label,
        }))}
        isLoggedIn={isSignedIn}
        onSignOut={isSignedIn ? handleSignOut : undefined}
      />
    </>
  );
}
