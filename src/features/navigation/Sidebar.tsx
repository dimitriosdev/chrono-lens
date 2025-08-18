import { PlusIcon } from "@heroicons/react/24/solid";
import { UserCircleIcon } from "@heroicons/react/24/solid";

interface SidebarProps {
  navLinks: Array<{ href: string; label: string; icon?: React.ReactNode }>;
  onSignOut?: () => void;
}

import React from "react";

const Sidebar = React.memo(function Sidebar({
  navLinks,
  onSignOut,
}: SidebarProps) {
  // Separate About link from others
  const aboutLink = navLinks.find((link) => link.label === "About");
  const otherLinks = navLinks.filter((link) => link.label !== "About");

  return (
    <aside className="hidden sm:flex flex-col h-screen w-20 bg-gray-900 text-white items-center py-4 space-y-8">
      {otherLinks.map((link) => (
        <div className="relative group" key={link.href + "-" + link.label}>
          <a
            href={link.href}
            className="bg-gray-800 rounded-full p-3 hover:bg-gray-700 block"
            aria-label={link.label}
          >
            {link.icon ? link.icon : <PlusIcon className="h-6 w-6" />}
          </a>
          <span className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 text-xs bg-gray-800 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-[100] pointer-events-none">
            {link.label}
          </span>
        </div>
      ))}
      <div className="flex-1" />
      {/* About link at the bottom */}
      {aboutLink && (
        <div
          className="relative group mb-4"
          key={aboutLink.href + "-" + aboutLink.label}
        >
          <a
            href={aboutLink.href}
            className="bg-gray-800 rounded-full p-3 hover:bg-gray-700 block"
            aria-label={aboutLink.label}
          >
            {aboutLink.icon}
          </a>
          <span className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 text-xs bg-gray-800 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-[100] pointer-events-none">
            {aboutLink.label}
          </span>
        </div>
      )}
      {/* Sign Out button only if signed in */}
      {onSignOut && (
        <div className="relative group mb-4">
          <button
            className="bg-gray-800 rounded-full p-3 hover:bg-gray-700 block"
            onClick={onSignOut}
            aria-label="Sign Out"
          >
            <UserCircleIcon className="h-6 w-6 text-white" />
          </button>
          <span className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 text-xs bg-gray-800 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-[100] pointer-events-none">
            Sign Out
          </span>
        </div>
      )}
    </aside>
  );
});

export default Sidebar;
