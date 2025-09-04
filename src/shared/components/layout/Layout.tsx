"use client";
import Navigation from "../../../features/navigation/components/Navigation";
import AlbumGrid from "../../../features/albums/components/AlbumGrid";

export default function Layout() {
  return (
    <div className="flex min-h-screen bg-gray-950">
      <Navigation />
      <main className="flex-1 px-3 sm:px-6 sm:ml-20 lg:px-12 xl:px-32 2xl:px-48 max-w-screen-2xl mx-auto pt-14 sm:pt-0">
        <AlbumGrid />
      </main>
    </div>
  );
}
