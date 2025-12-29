"use client";

import React from "react";
import { useSearchParams, useRouter } from "next/navigation";
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
import { useAuth, useGlobalFullscreen } from "@/context";
import { useAsyncErrorHandler } from "@/shared/hooks/useErrorHandler";
import { useSlideshow, useColorPreferences } from "@/features/albums/hooks";

// Components
import {
  LayoutViewer,
  EnhancedColorPicker,
} from "@/features/albums/components";
import SlideshowErrorBoundary from "@/features/albums/components/SlideshowErrorBoundary";

/**
 * Props for the ControlButtons component
 */
interface ControlButtonsProps {
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onToggleColorPicker: () => void;
}

/**
 * Common button styles for control buttons
 */
const getControlButtonStyles = (isFullscreen: boolean): string => {
  const baseStyles =
    "bg-gray-900/80 hover:bg-gray-800 text-white p-2 rounded-lg shadow-lg transition-all duration-300";
  const opacityStyles = isFullscreen
    ? "opacity-30 hover:opacity-80"
    : "opacity-80 hover:opacity-100";

  return `${baseStyles} ${opacityStyles}`;
};

/**
 * Control buttons component for slideshow interface
 */
const ControlButtons: React.FC<ControlButtonsProps> = ({
  isFullscreen,
  onToggleFullscreen,
  onToggleColorPicker,
}) => (
  <div className="absolute top-4 right-4 flex gap-2 z-50">
    {/* Fullscreen toggle button */}
    <button
      type="button"
      onClick={onToggleFullscreen}
      aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
      className={getControlButtonStyles(isFullscreen)}
    >
      {isFullscreen ? (
        <ArrowsPointingInIcon className="w-5 h-5" />
      ) : (
        <ArrowsPointingOutIcon className="w-5 h-5" />
      )}
    </button>

    {/* Configuration toggle button */}
    <button
      type="button"
      onClick={onToggleColorPicker}
      aria-label="Open configuration"
      className={getControlButtonStyles(isFullscreen)}
    >
      <Cog6ToothIcon className="w-5 h-5" />
    </button>
  </div>
);

const SlideshowPage: React.FC = () => {
  const { isSignedIn, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const albumId = searchParams.get("id");
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
      } catch (error) {
        handleAsyncError(error);
        setAlbum(undefined);
      }
    }
    if (albumId) fetchAlbum();
  }, [albumId, handleAsyncError]);

  // Authentication check
  React.useEffect(() => {
    if (!loading && !isSignedIn) {
      router.replace("/");
    }
  }, [isSignedIn, loading, router]);

  // Handlers
  const handleBack = React.useCallback(() => {
    router.push("/albums");
  }, [router]);

  const handleToggleColorPicker = React.useCallback(() => {
    setShowColorPicker(!showColorPicker);
  }, [showColorPicker]);

  const handleCloseColorPicker = React.useCallback(() => {
    setShowColorPicker(false);
  }, []);

  // Early returns
  if (loading || !isSignedIn) return null;

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
        />

        {/* Back button */}
        <button
          type="button"
          onClick={handleBack}
          aria-label="Back to albums"
          className={`absolute top-4 left-4 bg-gray-900 text-white p-2 rounded-lg shadow-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-white z-50 transition-all duration-300 ${
            fullscreen.isFullscreen
              ? "bg-opacity-40 opacity-30 hover:opacity-80"
              : "bg-opacity-80 opacity-80 hover:opacity-100"
          }`}
        >
          <ChevronLeftIcon className="w-5 h-5" />
        </button>

        {/* Color picker overlay */}
        {showColorPicker && album?.id && (
          <EnhancedColorPicker
            effectiveMatColor={colorPrefs.effectiveMatColor}
            effectiveBackgroundColor={colorPrefs.effectiveBackgroundColor}
            onMatColorSelect={colorPrefs.selectMatColor}
            onBackgroundColorSelect={colorPrefs.selectBackgroundColor}
            onSave={colorPrefs.saveColors}
            onClose={handleCloseColorPicker}
            hideBackgroundColor={album?.layout?.type === "slideshow"}
          />
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
          frameAssembly={album.matConfig?.frameAssembly}
        />
      </div>
    </SlideshowErrorBoundary>
  );
};

export default SlideshowPage;
