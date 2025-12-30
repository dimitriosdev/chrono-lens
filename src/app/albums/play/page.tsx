"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeftIcon,
  ArrowsPointingInIcon,
  ArrowsPointingOutIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/solid";

// Types and API
import { Album } from "@/shared/types/album";
import { getAlbum } from "@/shared/lib/firestore";

// Context and hooks
import { useAuth, useGlobalFullscreen } from "@/shared/context";
import { useAsyncErrorHandler } from "@/shared/hooks/useErrorHandler";
import { useSlideshow, useColorPreferences } from "@/features/albums/hooks";

// Components
import { LayoutViewer, ColorPicker } from "@/features/albums/components";
import SlideshowErrorBoundary from "@/features/albums/components/SlideshowErrorBoundary";

/**
 * Props for the ControlButtons component
 */
interface ControlButtonsProps {
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onToggleColorPicker: () => void;
  showColorPicker: boolean; // Whether to show the color picker button
}

/**
 * Common button styles for control buttons - designed to be discreet but visible on any background
 */
const getControlButtonStyles = (isFullscreen: boolean): string => {
  const baseStyles =
    "text-white p-1.5 rounded bg-black/20 backdrop-blur-sm shadow-[0_0_8px_rgba(0,0,0,0.3)] transition-all duration-300";
  const opacityStyles = isFullscreen
    ? "opacity-20 hover:opacity-70"
    : "opacity-40 hover:opacity-90";

  return `${baseStyles} ${opacityStyles}`;
};

/**
 * Control buttons component for slideshow interface
 */
const ControlButtons: React.FC<ControlButtonsProps> = ({
  isFullscreen,
  onToggleFullscreen,
  onToggleColorPicker,
  showColorPicker,
}) => (
  <div className="absolute top-3 right-3 flex gap-1 z-50">
    {/* Fullscreen toggle button */}
    <button
      type="button"
      onClick={onToggleFullscreen}
      aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
      className={getControlButtonStyles(isFullscreen)}
    >
      {isFullscreen ? (
        <ArrowsPointingInIcon className="w-4 h-4" />
      ) : (
        <ArrowsPointingOutIcon className="w-4 h-4" />
      )}
    </button>

    {/* Configuration toggle button - only shown for authenticated users */}
    {showColorPicker && (
      <button
        type="button"
        onClick={onToggleColorPicker}
        aria-label="Open configuration"
        className={getControlButtonStyles(isFullscreen)}
      >
        <Cog6ToothIcon className="w-4 h-4" />
      </button>
    )}
  </div>
);

// Get searchParams from URL directly using window.location
const SlideshowPageInner: React.FC = () => {
  const { isSignedIn, loading } = useAuth();
  const router = useRouter();

  // Get params from URL directly instead of useSearchParams
  const [albumId, setAlbumId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const id = params.get("id");
      setAlbumId(id);
    }
  }, []);

  const [album, setAlbum] = React.useState<Album | undefined>(undefined);
  const [showColorPicker, setShowColorPicker] = React.useState(false);

  // Custom hooks
  const slideshow = useSlideshow({ album });
  const colorPrefs = useColorPreferences(album);
  const fullscreen = useGlobalFullscreen();
  const { handleAsyncError } = useAsyncErrorHandler("Album Loading");

  // Load album data
  React.useEffect(() => {
    async function fetchAlbum() {
      try {
        const data = await getAlbum(albumId!);
        setAlbum(data || undefined);
      } catch (error: any) {
        // Handle specific error cases
        if (error?.message?.includes("private")) {
          // Private album - redirect to login
          router.replace(
            "/?redirect=" +
              encodeURIComponent(
                window.location.pathname + window.location.search
              ) +
              "&message=" +
              encodeURIComponent(
                "This album is private. Please sign in to view it."
              )
          );
          return;
        }
        handleAsyncError(error);
        setAlbum(undefined);
      }
    }
    if (albumId) fetchAlbum();
  }, [albumId, handleAsyncError, router]);

  // Authentication check - only redirect if album is private and user is not signed in
  React.useEffect(() => {
    // Wait for both auth and album to load
    if (loading || !album) {
      return;
    }

    // If album is public, allow access without auth
    if (album.privacy === "public") {
      return;
    }

    // For private albums, require authentication
    if (!isSignedIn) {
      router.replace(
        "/?redirect=" +
          encodeURIComponent(window.location.pathname + window.location.search)
      );
    }
  }, [isSignedIn, loading, router, album]);

  // Handlers
  const handleBack = React.useCallback(() => {
    // Go to user's albums if signed in, otherwise to home page
    router.push(isSignedIn ? "/albums" : "/");
  }, [router, isSignedIn]);

  const handleToggleColorPicker = React.useCallback(() => {
    setShowColorPicker(!showColorPicker);
  }, [showColorPicker]);

  const handleCloseColorPicker = React.useCallback(() => {
    setShowColorPicker(false);
  }, []);

  // Early returns
  if (!albumId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-center">
          <h1 className="text-2xl font-bold mb-4">Album Not Found</h1>
          <p className="mb-4">No album ID provided in the URL.</p>
          <button
            onClick={() => router.push("/albums")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Back to Albums
          </button>
        </div>
      </div>
    );
  }

  if (!album) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-center">
          <h1 className="text-2xl font-bold mb-4">Loading Album...</h1>
        </div>
      </div>
    );
  }

  return (
    <SlideshowErrorBoundary>
      <div className="fixed inset-0 z-40">
        {/* Control buttons */}
        <ControlButtons
          isFullscreen={fullscreen.isFullscreen}
          onToggleFullscreen={fullscreen.toggleFullscreen}
          onToggleColorPicker={handleToggleColorPicker}
          showColorPicker={isSignedIn}
        />

        {/* Back button - only show for authenticated users */}
        {isSignedIn && (
          <button
            type="button"
            onClick={handleBack}
            aria-label="Back to albums"
            className={`absolute top-3 left-3 text-white p-1.5 rounded bg-black/20 backdrop-blur-sm shadow-[0_0_8px_rgba(0,0,0,0.3)] z-50 transition-all duration-300 ${
              fullscreen.isFullscreen
                ? "opacity-20 hover:opacity-70"
                : "opacity-40 hover:opacity-90"
            }`}
          >
            <ChevronLeftIcon className="w-4 h-4" />
          </button>
        )}

        {/* Color picker panel */}
        {showColorPicker && album?.id && (
          <div className="absolute top-12 right-3 z-50">
            <div className="bg-gray-900/95 backdrop-blur-sm rounded-xl p-4 shadow-2xl border border-gray-700/50">
              {/* Header with close and save */}
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-700/50">
                <span className="text-white text-sm font-medium">Colors</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={async () => {
                      await colorPrefs.saveColors();
                      handleCloseColorPicker();
                    }}
                    className="text-xs text-green-400 hover:text-green-300 transition-colors"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseColorPicker}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                    aria-label="Close"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Color pickers - same as album edit/create */}
              <div className="flex justify-center gap-4">
                {album?.layout?.type !== "slideshow" && (
                  <ColorPicker
                    label="Background"
                    value={colorPrefs.effectiveBackgroundColor}
                    onChange={colorPrefs.selectBackgroundColor}
                    compact
                  />
                )}
                <ColorPicker
                  label="Mat"
                  value={colorPrefs.effectiveMatColor}
                  onChange={colorPrefs.selectMatColor}
                  compact
                />
              </div>
            </div>
          </div>
        )}

        {/* Main layout viewer */}
        <LayoutViewer
          album={album}
          layout={slideshow.layout}
          backgroundColor={colorPrefs.effectiveBackgroundColor}
          matColor={colorPrefs.effectiveMatColor}
          showTitle={colorPrefs.showAlbumTitle}
          currentIndex={slideshow.currentIndex}
          onNext={slideshow.goToNext}
          onPrevious={slideshow.goToPrevious}
        />
      </div>
    </SlideshowErrorBoundary>
  );
};

// Wrapper component with Suspense
const SlideshowPage: React.FC = () => {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
          Loading album...
        </div>
      }
    >
      <SlideshowPageInner />
    </React.Suspense>
  );
};

export default SlideshowPage;
