"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  HomeIcon,
  PhotoIcon,
  PlusCircleIcon,
  InformationCircleIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";
import {
  HomeIcon as HomeIconSolid,
  PhotoIcon as PhotoIconSolid,
  InformationCircleIcon as InformationCircleIconSolid,
} from "@heroicons/react/24/solid";
import { useAuth } from "@/shared/context";
import { signOutUser } from "@/shared/lib/auth";

// Navigation configuration - single source of truth
const NAV_ITEMS = [
  {
    href: "/",
    label: "Home",
    icon: HomeIcon,
    iconActive: HomeIconSolid,
    authRequired: true,
  },
  {
    href: "/albums",
    label: "Albums",
    icon: PhotoIcon,
    iconActive: PhotoIconSolid,
    authRequired: true,
  },
  {
    href: "/albums/new",
    label: "Create",
    icon: PlusCircleIcon,
    iconActive: PlusCircleIcon,
    authRequired: true,
    isAction: true, // Special styling for primary action
  },
  {
    href: "/about",
    label: "About",
    icon: InformationCircleIcon,
    iconActive: InformationCircleIconSolid,
    authRequired: false,
  },
];

export { NAV_ITEMS as NAV_LINKS };

// Shared nav item component
interface NavItemProps {
  href: string;
  label: string;
  icon: React.ElementType;
  iconActive: React.ElementType;
  isActive: boolean;
  isAction?: boolean;
  variant: "mobile" | "desktop";
  onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({
  href,
  label,
  icon: Icon,
  iconActive: IconActive,
  isActive,
  variant,
}) => {
  const CurrentIcon = isActive ? IconActive : Icon;

  if (variant === "mobile") {
    return (
      <Link
        href={href}
        className={`
          relative flex flex-col items-center justify-center flex-1 py-2 min-w-0
          transition-colors duration-200
          ${isActive ? "text-blue-500" : "text-neutral-400"}
        `}
        aria-label={label}
        aria-current={isActive ? "page" : undefined}
      >
        <CurrentIcon
          className={`w-6 h-6 ${
            isActive ? "scale-110" : ""
          } transition-transform duration-200`}
        />
        <span
          className={`text-[10px] mt-0.5 font-medium ${
            isActive ? "text-blue-500" : ""
          }`}
        >
          {label}
        </span>
        {/* Active indicator */}
        {isActive && (
          <motion.div
            layoutId="mobileActiveIndicator"
            className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-blue-500"
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />
        )}
      </Link>
    );
  }

  // Desktop variant
  return (
    <Link
      href={href}
      className={`
        group relative flex items-center justify-center w-12 h-12 rounded-xl
        transition-all duration-200 ease-out
        ${
          isActive
            ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25"
            : "text-neutral-400 hover:text-white hover:bg-neutral-800"
        }
      `}
      aria-label={label}
      aria-current={isActive ? "page" : undefined}
    >
      <CurrentIcon
        className={`w-5 h-5 transition-transform duration-200 ${
          !isActive ? "group-hover:scale-110" : ""
        }`}
      />

      {/* Tooltip */}
      <div
        className="
        absolute left-full ml-3 px-2.5 py-1.5 
        bg-neutral-800 text-white text-xs font-medium rounded-lg
        opacity-0 invisible group-hover:opacity-100 group-hover:visible
        transition-all duration-200 whitespace-nowrap
        shadow-lg pointer-events-none z-50
      "
      >
        {label}
        <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-neutral-800" />
      </div>

      {/* Active indicator bar */}
      {isActive && (
        <motion.div
          layoutId="desktopActiveIndicator"
          className="absolute -right-0.5 w-1 h-5 bg-blue-400 rounded-full"
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      )}
    </Link>
  );
};

// Sign out button component
const SignOutButton: React.FC<{
  variant: "mobile" | "desktop";
  onClick: () => void;
}> = ({ variant, onClick }) => {
  if (variant === "mobile") {
    return (
      <button
        onClick={onClick}
        className="flex flex-col items-center justify-center flex-1 py-2 text-red-400"
        aria-label="Sign out"
      >
        <ArrowRightOnRectangleIcon className="w-6 h-6" />
        <span className="text-[10px] mt-0.5 font-medium">Sign Out</span>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className="
        group relative flex items-center justify-center w-12 h-12 rounded-xl
        text-red-400 hover:text-red-300 hover:bg-red-500/10
        transition-all duration-200
      "
      aria-label="Sign out"
    >
      <ArrowRightOnRectangleIcon className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />

      {/* Tooltip */}
      <div
        className="
        absolute left-full ml-3 px-2.5 py-1.5 
        bg-neutral-800 text-white text-xs font-medium rounded-lg
        opacity-0 invisible group-hover:opacity-100 group-hover:visible
        transition-all duration-200 whitespace-nowrap
        shadow-lg pointer-events-none z-50
      "
      >
        Sign Out
        <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-neutral-800" />
      </div>
    </button>
  );
};

// Main Navigation Component
export default function Navigation() {
  const pathname = usePathname();
  const { isSignedIn, setIsSignedIn } = useAuth();

  const handleSignOut = async () => {
    await signOutUser();
    if (typeof window !== "undefined") {
      localStorage.removeItem("isSignedIn");
      setIsSignedIn(false);
      window.location.href = "/";
    }
  };

  // Filter visible nav items based on auth state
  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.authRequired || isSignedIn
  );

  return (
    <>
      {/* ============ MOBILE BOTTOM TAB BAR ============ */}
      <nav
        className="
          sm:hidden fixed bottom-0 left-0 right-0 z-50
          bg-neutral-900/95 backdrop-blur-lg
          border-t border-neutral-800
          safe-area-bottom
        "
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="flex items-end justify-around px-2 pb-1 pt-1">
          {visibleItems.map((item) => (
            <NavItem
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              iconActive={item.iconActive}
              isActive={pathname === item.href}
              isAction={item.isAction}
              variant="mobile"
            />
          ))}
          {isSignedIn && (
            <SignOutButton variant="mobile" onClick={handleSignOut} />
          )}
        </div>
      </nav>

      {/* ============ DESKTOP LEFT SIDEBAR ============ */}
      <aside
        className="
          hidden sm:flex fixed inset-y-0 left-0 z-40
          w-16 flex-col items-center py-4
          bg-neutral-900/95 backdrop-blur-lg
          border-r border-neutral-800
        "
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Logo */}

        {/* Main nav items */}
        <nav className="flex flex-col items-center gap-2 flex-1">
          {visibleItems
            .filter((item) => item.label !== "About")
            .map((item) => (
              <NavItem
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
                iconActive={item.iconActive}
                isActive={pathname === item.href}
                variant="desktop"
              />
            ))}
        </nav>

        {/* Bottom section */}
        <div className="flex flex-col items-center gap-2">
          {/* About link */}
          {visibleItems
            .filter((item) => item.label === "About")
            .map((item) => (
              <NavItem
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
                iconActive={item.iconActive}
                isActive={pathname === item.href}
                variant="desktop"
              />
            ))}

          {/* Sign out */}
          {isSignedIn && (
            <SignOutButton variant="desktop" onClick={handleSignOut} />
          )}
        </div>
      </aside>
    </>
  );
}
