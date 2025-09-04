import React from "react";
import { PlusIcon } from "@heroicons/react/24/solid";
import { UserCircleIcon } from "@heroicons/react/24/solid";
import { Tooltip } from "@/shared/components";
import { helpers } from "@/shared/constants/designSystem";
import FullscreenButton from "./FullscreenButton";

interface SidebarProps {
  navLinks: Array<{ href: string; label: string; icon?: React.ReactNode }>;
  onSignOut?: () => void;
}

const Sidebar = React.memo(function Sidebar({
  navLinks,
  onSignOut,
}: SidebarProps) {
  // Separate About link from others
  const aboutLink = navLinks.find((link) => link.label === "About");
  const otherLinks = navLinks.filter((link) => link.label !== "About");

  const navButtonClasses = helpers.cn(
    "bg-gray-800 rounded-full p-3 block transition-smooth btn-scale-hover",
    "hover:bg-gray-700 hover:shadow-md",
    "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
  );

  return (
    <aside className="hidden sm:flex flex-col h-screen w-20 bg-gray-900 text-white items-center py-4 space-y-8 border-r border-gray-800">
      {/* Navigation Links */}
      {otherLinks.map((link) => (
        <Tooltip
          key={link.href + "-" + link.label}
          content={link.label}
          position="right"
        >
          <a
            href={link.href}
            className={navButtonClasses}
            aria-label={link.label}
          >
            {link.icon ? link.icon : <PlusIcon className="h-6 w-6" />}
          </a>
        </Tooltip>
      ))}

      {/* Spacer */}
      <div className="flex-1" />

      {/* About link at the bottom */}
      {aboutLink && (
        <Tooltip content={aboutLink.label} position="right">
          <a
            href={aboutLink.href}
            className={helpers.cn(navButtonClasses, "mb-4")}
            aria-label={aboutLink.label}
          >
            {aboutLink.icon}
          </a>
        </Tooltip>
      )}

      {/* Fullscreen button */}
      <FullscreenButton className="mb-4" />

      {/* Sign Out button only if signed in */}
      {onSignOut && (
        <Tooltip content="Sign Out" position="right">
          <button
            className={helpers.cn(navButtonClasses, "mb-4")}
            onClick={onSignOut}
            aria-label="Sign Out"
          >
            <UserCircleIcon className="h-6 w-6 text-white" />
          </button>
        </Tooltip>
      )}
    </aside>
  );
});

export default Sidebar;
