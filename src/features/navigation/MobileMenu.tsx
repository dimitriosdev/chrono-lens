import {
  ChevronLeftIcon,
  PresentationChartLineIcon,
} from "@heroicons/react/24/solid";
import { motion, AnimatePresence } from "framer-motion";

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
  isLoggedIn?: boolean;
  onSignOut?: () => void;
}

export default function MobileMenu({
  open,
  onClose,
  isLoggedIn,
  onSignOut,
}: MobileMenuProps) {
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
            {/* Show only About link when signed out */}
            {!isLoggedIn && (
              <a href="/about" className="text-white text-base">
                About
              </a>
            )}

            {/* Show other links and log out when signed in */}
            {isLoggedIn && (
              <>
                <a href="/albums/new" className="text-white text-base">
                  Add new album
                </a>
                <div className="mt-auto">
                  <button
                    className="w-full bg-cyan-400 text-gray-900 py-2 rounded font-semibold mb-2"
                    onClick={onSignOut}
                  >
                    Sign Out
                  </button>
                </div>
              </>
            )}
          </nav>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
