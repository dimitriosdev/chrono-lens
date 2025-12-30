"use client";
import React from "react";
import "../globals.css";
import Navigation from "../../features/navigation/components/Navigation";
import { useAuth } from "@/context/AuthContext";

type AlbumsLayoutProps = {
  children: React.ReactNode;
};

const AlbumsLayout: React.FC<AlbumsLayoutProps> = ({ children }) => {
  const { isSignedIn, loading } = useAuth();

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
