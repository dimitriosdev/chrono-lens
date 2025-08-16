"use client";
import React, { useState } from "react";
import Navigation, { NAV_LINKS } from "../../components/Navigation";
import MobileMenu from "../../features/navigation/MobileMenu";

type AlbumsLayoutProps = {
  children: React.ReactNode;
  onSignOut?: () => void;
  isLoggedIn?: boolean;
};

const AlbumsLayout: React.FC<AlbumsLayoutProps> = ({
  children,
  onSignOut,
  isLoggedIn,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  // Add mobile hamburger and MobileMenu for mobile navigation
  return (
    <div className="flex min-h-screen bg-gray-950">
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
        <Navigation onSignOut={onSignOut} />
      </div>
      {/* Mobile menu overlay */}
      <MobileMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        navLinks={NAV_LINKS.map(({ href, label }) => ({ href, label }))}
        onSignOut={onSignOut}
      />
      {/* Main content area - centered, reduced margins */}
      <main className="flex-1 sm:ml-20">{children}</main>
    </div>
  );
};

export default AlbumsLayout;
