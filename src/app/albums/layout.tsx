"use client";
import React from "react";
import { usePathname } from "next/navigation";
import "../globals.css";
import Navigation from "../../features/navigation/components/Navigation";
import { useAuth } from "@/context/AuthContext";

type AlbumsLayoutProps = {
  children: React.ReactNode;
};

const AlbumsLayout: React.FC<AlbumsLayoutProps> = ({ children }) => {
  const { isSignedIn, loading } = useAuth();
  const pathname = usePathname();

  // Hide navigation on play page for immersive fullscreen experience
  const isPlayPage = pathname?.startsWith("/albums/play");

  if (loading) return null;
  if (!isSignedIn) return null;

  // Play page gets no wrapper at all - full immersive experience
  // The play page has its own layout that handles everything
  if (isPlayPage) {
    return <div className="fixed inset-0 z-50 bg-gray-950">{children}</div>;
  }

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
