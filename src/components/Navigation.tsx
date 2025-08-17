"use client";
import React, { useState } from "react";
import { HomeIcon } from "@heroicons/react/24/solid";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../features/navigation/Sidebar";
import MobileMenu from "../features/navigation/MobileMenu";
import { signOutUser } from "../features/auth";

// Shared navigation links
export const NAV_LINKS = [
  {
    href: "/",
    label: "Home",
    icon: <HomeIcon className="h-6 w-6 text-white" />,
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
        <rect
          x="3"
          y="5"
          width="18"
          height="14"
          rx="3"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
        />
        <circle
          cx="8.5"
          cy="10.5"
          r="2"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
        />
        <path
          d="M21 19l-5-5a2 2 0 0 0-2.8 0l-2.2 2.2"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
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
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
        />
        <line
          x1="12"
          y1="16"
          x2="12"
          y2="12"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle cx="12" cy="8.5" r="1" fill="currentColor" />
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
  const [menuOpen, setMenuOpen] = useState(false);
  const { isSignedIn, setIsSignedIn } = useAuth();

  // Sign out handler
  const handleSignOut = async () => {
    await signOutUser();
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
        {/* Google Sign-In button for desktop */}
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
