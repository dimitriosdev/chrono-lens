"use client";
import React from "react";
import { usePathname } from "next/navigation";
import "../globals.css";
import { Navigation } from "@/features/navigation";
import { useAuth } from "@/shared/context";

type AlbumsLayoutProps = {
  children: React.ReactNode;
};

const AlbumsLayout: React.FC<AlbumsLayoutProps> = ({ children }) => {
  const { isSignedIn, loading } = useAuth();
  const pathname = usePathname();

  // Hide navigation on play page for immersive fullscreen experience
  const isPlayPage = pathname?.startsWith("/albums/play");
  const isPublicPage = pathname?.startsWith("/albums/public");

  // For play and public pages, allow access without authentication
  // These pages handle their own auth requirements (public albums, shared links, etc.)
  if (isPlayPage || isPublicPage) {
    return <div className="fixed inset-0 z-50 bg-gray-950">{children}</div>;
  }

  // For other album pages, require authentication
  if (loading) return null;
  if (!isSignedIn) return null;

  return (
    <div className="flex min-h-screen bg-gray-950 w-full h-screen overflow-hidden">
      {/* Unified Navigation - handles both mobile and desktop */}
      <Navigation />

      {/* Main content area */}
      <main className="flex-1 h-full overflow-y-auto pb-16 sm:pb-0 sm:pl-16">
        {children}
      </main>
    </div>
  );
};

export default AlbumsLayout;
