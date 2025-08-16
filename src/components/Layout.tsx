"use client";
import Navigation, { NAV_LINKS } from "./Navigation";
import AlbumGrid from "../features/albums/AlbumGrid";

interface LayoutProps {
  isLoggedIn?: boolean;
  onSignOut?: () => void;
}

export default function Layout({ isLoggedIn, onSignOut }: LayoutProps) {
  return (
    <div className="flex min-h-screen bg-gray-950">
      <Navigation isLoggedIn={isLoggedIn} onSignOut={onSignOut} />
      <main className="flex-1 px-2 sm:ml-20 sm:px-12 lg:px-32 xl:px-48 2xl:px-64 max-w-screen-2xl mx-auto pt-14 sm:pt-0">
        <AlbumGrid />
      </main>
    </div>
  );
}
