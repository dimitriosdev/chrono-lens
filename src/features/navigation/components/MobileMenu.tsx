import { ChevronLeftIcon } from "@heroicons/react/24/solid";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { PressEffect } from "@/shared/components";
import { helpers } from "@/shared/constants/designSystem";

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
  navLinks: Array<{ href: string; label: string }>;
  isLoggedIn?: boolean;
  onSignOut?: () => void;
}

const MobileMenu = React.memo(function MobileMenu({
  open,
  onClose,
  navLinks,
  isLoggedIn,
  onSignOut,
}: MobileMenuProps) {
  const pathname = usePathname();

  // Separate About link from others
  const aboutLink = navLinks.find((link) => link.label === "About");
  const otherLinks = navLinks.filter((link) => link.label !== "About");

  const chevronIcon = <ChevronLeftIcon className="h-7 w-7 text-white" />;

  const getLinkClasses = (href: string) => {
    const isActive = pathname === href;
    return helpers.cn(
      "flex items-center px-4 py-3 rounded-lg text-base font-medium transition-all duration-200",
      "focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-neutral-900",
      isActive
        ? "bg-blue-600 text-white shadow-lg"
        : "text-neutral-300 hover:text-white hover:bg-neutral-800/60"
    );
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Menu */}
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-0 left-0 h-full w-72 bg-neutral-900/95 backdrop-blur-md z-50 shadow-2xl flex flex-col border-r border-neutral-700/50"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation menu"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-neutral-700/50">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">C</span>
                </div>
                <span className="text-white font-semibold text-lg">
                  Chrono Lens
                </span>
              </div>
              <PressEffect scale={0.9}>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg bg-neutral-800/50 hover:bg-neutral-700/50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-neutral-900"
                  aria-label="Close menu"
                >
                  {chevronIcon}
                </button>
              </PressEffect>
            </div>

            {/* Navigation */}
            <nav
              className="flex-1 px-4 py-6"
              role="navigation"
              aria-label="Mobile navigation"
            >
              <div className="space-y-2">
                {otherLinks.map((link) => (
                  <PressEffect key={link.href + "-" + link.label} scale={0.98}>
                    <a
                      href={link.href}
                      className={getLinkClasses(link.href)}
                      onClick={onClose}
                      aria-current={pathname === link.href ? "page" : undefined}
                    >
                      <span>{link.label}</span>
                      {pathname === link.href && (
                        <div className="ml-auto w-2 h-2 bg-blue-300 rounded-full" />
                      )}
                    </a>
                  </PressEffect>
                ))}
              </div>

              {/* About link in separate section */}
              {aboutLink && (
                <div className="mt-8 pt-6 border-t border-neutral-700/50">
                  <PressEffect scale={0.98}>
                    <a
                      href={aboutLink.href}
                      className={getLinkClasses(aboutLink.href)}
                      onClick={onClose}
                      aria-current={
                        pathname === aboutLink.href ? "page" : undefined
                      }
                    >
                      <span>{aboutLink.label}</span>
                      {pathname === aboutLink.href && (
                        <div className="ml-auto w-2 h-2 bg-blue-300 rounded-full" />
                      )}
                    </a>
                  </PressEffect>
                </div>
              )}
            </nav>

            {/* Bottom section */}
            {isLoggedIn && onSignOut && (
              <div className="p-4 border-t border-neutral-700/50">
                <PressEffect scale={0.98}>
                  <button
                    className={helpers.cn(
                      "w-full flex items-center justify-center px-4 py-3 rounded-lg font-medium text-base",
                      "bg-red-600/20 text-red-400 border border-red-500/50",
                      "hover:bg-red-600/30 hover:text-red-300 hover:border-red-500/70",
                      "focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-neutral-900",
                      "transition-all duration-200"
                    )}
                    onClick={() => {
                      onSignOut();
                      onClose();
                    }}
                    aria-label="Sign Out"
                  >
                    Sign Out
                  </button>
                </PressEffect>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
});

export default MobileMenu;
