import {
  ChevronLeftIcon,
  PresentationChartLineIcon,
} from "@heroicons/react/24/solid";
import { motion, AnimatePresence } from "framer-motion";

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
  navLinks: Array<{ href: string; label: string }>;
  isLoggedIn?: boolean;
  onSignOut?: () => void;
}

export default function MobileMenu({
  open,
  onClose,
  navLinks,
  isLoggedIn,
  onSignOut,
}: MobileMenuProps) {
  // Separate About link from others
  const aboutLink = navLinks.find((link) => link.label === "About");
  const otherLinks = navLinks.filter((link) => link.label !== "About");

  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          initial={{ x: "-100%" }}
          animate={{ x: 0 }}
          exit={{ x: "-100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed top-0 left-0 h-full w-64 bg-gray-900 z-50 shadow-lg flex flex-col"
        >
          <div className="flex items-center p-4 border-b border-gray-800">
            <PresentationChartLineIcon className="h-7 w-7 text-white mr-auto" />
            <button onClick={onClose} className="ml-2">
              <ChevronLeftIcon className="h-7 w-7 text-white" />
            </button>
          </div>
          <nav className="flex-1 flex flex-col gap-4 p-4">
            {otherLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-white text-base"
              >
                {link.label}
              </a>
            ))}
            {/* About link at the bottom */}
            {aboutLink && (
              <a
                key={aboutLink.href}
                href={aboutLink.href}
                className="text-white text-base mb-4"
              >
                {aboutLink.label}
              </a>
            )}
            {/* Sign Out button only if signed in */}
            {isLoggedIn && onSignOut && (
              <div className="mt-auto">
                <button
                  className="w-full bg-cyan-500 hover:bg-cyan-400 text-gray-900 font-bold py-3 px-4 rounded-xl text-base flex items-center justify-center mb-2 shadow-lg transition"
                  onClick={onSignOut}
                  aria-label="Sign Out"
                >
                  Sign Out
                </button>
              </div>
            )}
          </nav>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
