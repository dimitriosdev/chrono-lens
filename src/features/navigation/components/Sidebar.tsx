import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { PlusIcon } from "@heroicons/react/24/solid";
import { UserCircleIcon } from "@heroicons/react/24/solid";
import { Tooltip, PressEffect } from "@/shared/components";
import { helpers } from "@/shared/constants/designSystem";

interface SidebarProps {
  navLinks: Array<{ href: string; label: string; icon?: React.ReactNode }>;
  onSignOut?: () => void;
}

const Sidebar = React.memo(function Sidebar({
  navLinks,
  onSignOut,
}: SidebarProps) {
  const pathname = usePathname();
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);

  // Separate About link from others
  const aboutLink = navLinks.find((link) => link.label === "About");
  const otherLinks = navLinks.filter((link) => link.label !== "About");

  const getNavButtonClasses = (href: string, isActive = false) => {
    return helpers.cn(
      // Base styles
      "relative group flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-300 ease-out",
      // Default state
      "bg-neutral-800/50 border border-neutral-700/50",
      // Hover state - enhanced visual feedback
      "hover:bg-blue-600/20 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/20",
      "hover:scale-105 hover:-translate-y-0.5",
      // Active state - clear visual indication
      isActive && "bg-blue-600 border-blue-500 shadow-lg shadow-blue-500/30",
      // Focus state - accessibility
      "focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-neutral-900",
      // Interaction states
      "active:scale-95 active:translate-y-0",
      // Smooth animations
      "transform-gpu will-change-transform"
    );
  };

  const getIconClasses = (href: string, isActive = false) => {
    return helpers.cn(
      "h-6 w-6 transition-all duration-300",
      isActive ? "text-white" : "text-neutral-300",
      "group-hover:text-white group-hover:scale-110",
      "group-active:scale-95"
    );
  };

  const renderNavLink = (link: {
    href: string;
    label: string;
    icon?: React.ReactNode;
  }) => {
    const isActive = pathname === link.href;
    const isHovered = hoveredLink === link.href;

    return (
      <div key={link.href + "-" + link.label} className="relative">
        <Tooltip content={link.label} position="right" delay={300}>
          <PressEffect scale={0.9}>
            <a
              href={link.href}
              className={getNavButtonClasses(link.href, isActive)}
              aria-label={link.label}
              aria-current={isActive ? "page" : undefined}
              onMouseEnter={() => setHoveredLink(link.href)}
              onMouseLeave={() => setHoveredLink(null)}
              onFocus={() => setHoveredLink(link.href)}
              onBlur={() => setHoveredLink(null)}
            >
              {/* Background glow effect */}
              {(isActive || isHovered) && (
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-blue-400/20 rounded-xl blur-sm -z-10" />
              )}

              {/* Icon */}
              <span className={getIconClasses(link.href, isActive)}>
                {link.icon ? link.icon : <PlusIcon />}
              </span>

              {/* Active indicator */}
              {isActive && (
                <div className="absolute -right-1 top-1/2 w-1 h-6 bg-blue-400 rounded-full transform -translate-y-1/2" />
              )}
            </a>
          </PressEffect>
        </Tooltip>
      </div>
    );
  };

  return (
    <aside
      className="hidden sm:flex flex-col h-screen w-20 bg-neutral-900/95 backdrop-blur-sm text-white items-center py-6 border-r border-neutral-700/50"
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Navigation Links */}
      <nav className="flex flex-col space-y-4 flex-1">
        {otherLinks.map((link) => renderNavLink(link))}
      </nav>

      {/* Bottom section */}
      <div className="flex flex-col space-y-4">
        {/* About link */}
        {aboutLink && renderNavLink(aboutLink)}

        {/* Sign Out button */}
        {onSignOut && (
          <div className="relative">
            <Tooltip content="Sign Out" position="right" delay={300}>
              <PressEffect scale={0.9}>
                <button
                  className={helpers.cn(
                    "relative group flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-300 ease-out",
                    "bg-red-600/20 border border-red-500/50",
                    "hover:bg-red-600/30 hover:border-red-500/70 hover:shadow-lg hover:shadow-red-500/20",
                    "hover:scale-105 hover:-translate-y-0.5",
                    "focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-neutral-900",
                    "active:scale-95 active:translate-y-0",
                    "transform-gpu will-change-transform"
                  )}
                  onClick={onSignOut}
                  aria-label="Sign Out"
                >
                  <UserCircleIcon className="h-6 w-6 text-red-400 group-hover:text-red-300 group-hover:scale-110 transition-all duration-300" />
                </button>
              </PressEffect>
            </Tooltip>
          </div>
        )}
      </div>
    </aside>
  );
});

export default Sidebar;
