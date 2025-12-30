"use client";

import React, { Suspense } from "react";
import { AuthProvider, FullscreenProvider } from "@/shared/context";
import {
  ErrorBoundary,
  VersionLogger,
  UserDebugPanel,
} from "@/shared/components";

/**
 * Custom layout for the play/slideshow page
 * This keeps the essential providers but bypasses the main layout's
 * padding and navigation to provide a full-screen slideshow experience
 */
export default function PlayLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <FullscreenProvider>
        <ErrorBoundary>
          <VersionLogger />
          <div className="w-full h-full bg-gray-950">
            <Suspense
              fallback={
                <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
                  Loading...
                </div>
              }
            >
              {children}
            </Suspense>
            <UserDebugPanel />
          </div>
        </ErrorBoundary>
      </FullscreenProvider>
    </AuthProvider>
  );
}
