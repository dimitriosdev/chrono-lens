import { PlusIcon } from "@heroicons/react/24/solid";
import { Bars3Icon } from "@heroicons/react/24/solid";
import { UserCircleIcon } from "@heroicons/react/24/solid";

interface SidebarProps {
  onSignOut?: () => void;
}

export default function Sidebar({ onSignOut }: SidebarProps) {
  return (
    <>
      {/* Hamburger for mobile */}
      <button
        className="sm:hidden fixed top-4 left-4 z-50 bg-gray-900 rounded-full p-2 shadow-lg"
        aria-label="Open menu"
      >
        <Bars3Icon className="h-7 w-7 text-white" />
      </button>
      {/* Sidebar for desktop */}
      <aside className="hidden sm:flex flex-col h-screen w-20 bg-gray-900 text-white items-center py-4 space-y-8">
        <div className="relative group">
          <button className="bg-gray-800 rounded-full p-3 hover:bg-gray-700">
            <PlusIcon className="h-6 w-6" />
          </button>
          <span className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 text-xs bg-gray-800 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
            Add new album
          </span>
        </div>
        <div className="flex-1" />
        <div className="relative group mb-4">
          <button className="flex flex-col items-center" onClick={onSignOut}>
            <UserCircleIcon className="h-8 w-8 text-cyan-400" />
            <span className="text-xs mt-1 block text-cyan-400">Sign Out</span>
          </button>
          <span className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 text-xs bg-gray-800 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
            Sign out
          </span>
        </div>
      </aside>
    </>
  );
}
