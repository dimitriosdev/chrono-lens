"use client";
import React, { useState } from "react";
import Sidebar from "../../features/navigation/Sidebar";
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
  return (
    <div className="flex min-h-screen bg-gray-950">
      {/* Sticky row for mobile nav icon */}
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
      <div className="hidden sm:fixed sm:inset-y-0 sm:left-0 sm:w-20 sm:block">
        <Sidebar onSignOut={onSignOut} />
      </div>
      <MobileMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onSignOut={onSignOut}
        isLoggedIn={isLoggedIn}
      />
      <main className="flex-1 px-2 sm:ml-20 sm:px-12 lg:px-32 xl:px-48 2xl:px-64 max-w-screen-2xl mx-auto pt-14 sm:pt-0">
        {children}
      </main>
    </div>
  );
};

export default AlbumsLayout;
