"use client";

import React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Album } from "@/features/albums/types/Album";
import { getAlbum } from "@/shared/lib/firestore";
import { useAuth } from "@/context/AuthContext";
import { Maximize, Minimize, ArrowLeft } from "lucide-react";

// Imported components and hooks (the better approach)
import { MatImage, EnhancedColorPicker } from "@/features/albums/components";
import SlideshowErrorBoundary from "@/features/albums/components/SlideshowErrorBoundary";
import ImageErrorBoundary from "@/features/albums/components/ImageErrorBoundary";
import {
  useSlideshow,
  useColorPreferences,
  isLightColor,
} from "@/features/albums/hooks";
import { useFullscreen } from "@/shared/hooks/useFullscreen";
import { useAsyncErrorHandler } from "@/shared/hooks/useErrorHandler";

// Control buttons component
const ControlButtons: React.FC<{
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onToggleColorPicker: () => void;
}> = ({ isFullscreen, onToggleFullscreen, onToggleColorPicker }) => {
  return (
    <div className="absolute top-2 sm:top-4 right-2 sm:right-4 flex gap-2 z-50">
      {/* Fullscreen toggle button */}
      <button
        type="button"
        onClick={onToggleFullscreen}
        aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
        className={`bg-gray-900/80 hover:bg-gray-800 text-white p-2 rounded-lg shadow-lg transition-all duration-300 ${
          isFullscreen
            ? "opacity-30 hover:opacity-80"
            : "opacity-80 hover:opacity-100"
        }`}
      >
        {isFullscreen ? (
          <Minimize className="w-5 h-5" />
        ) : (
          <Maximize className="w-5 h-5" />
        )}
      </button>

      {/* Color picker toggle button */}
      <button
        type="button"
        onClick={onToggleColorPicker}
        aria-label="Change mat color"
        className={`bg-gray-900/80 hover:bg-gray-800 text-white p-2 rounded-lg shadow-lg transition-all duration-300 ${
          isFullscreen
            ? "opacity-30 hover:opacity-80"
            : "opacity-80 hover:opacity-100"
        }`}
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z"
          />
        </svg>
      </button>
    </div>
  );
};

const SlideshowPage: React.FC = () => {
  const { isSignedIn, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const albumId = searchParams.get("id");
  const [album, setAlbum] = React.useState<Album | undefined>(undefined);
  const [showColorPicker, setShowColorPicker] = React.useState(false);

  // Custom hooks (the better approach!)
  const slideshow = useSlideshow({ album });
  const colorPrefs = useColorPreferences(album);
  const fullscreen = useFullscreen();
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

  const matConfig = album?.matConfig || { matWidth: 5, matColor: "#000" };

  // Grid layout: 3 Portraits, 6 Portraits, or custom layouts like Mosaic
  if (
    slideshow.layout?.type === "grid" ||
    slideshow.layout?.type === "custom"
  ) {
    const rows = slideshow.layout?.grid?.rows || 1;
    const cols = slideshow.layout?.grid?.cols || 3;
    const requiredCount = rows * cols;
    const displayImages = slideshow.images.slice(0, requiredCount);
    const displayDescriptions = slideshow.imageDescriptions.slice(
      0,
      requiredCount
    );

    return (
      <div
        className="fixed inset-0 flex flex-col items-center justify-center z-50"
        style={{ backgroundColor: colorPrefs.effectiveBackgroundColor }}
      >
        {/* Control buttons */}
        <ControlButtons
          isFullscreen={fullscreen.isFullscreen}
          onToggleFullscreen={fullscreen.toggleFullscreen}
          onToggleColorPicker={handleToggleColorPicker}
        />

        {/* Color picker overlay */}
        {showColorPicker && (
          <EnhancedColorPicker
            effectiveMatColor={colorPrefs.effectiveMatColor}
            selectedMatColor={colorPrefs.selectedMatColor}
            albumMatColor={album?.matConfig?.matColor}
            effectiveBackgroundColor={colorPrefs.effectiveBackgroundColor}
            selectedBackgroundColor={colorPrefs.selectedBackgroundColor}
            albumBackgroundColor={colorPrefs.albumBackgroundColor}
            onMatColorSelect={colorPrefs.selectMatColor}
            onBackgroundColorSelect={colorPrefs.selectBackgroundColor}
            onMatReset={colorPrefs.resetMatColor}
            onBackgroundReset={colorPrefs.resetBackgroundColor}
            showAlbumTitle={colorPrefs.showAlbumTitle}
            onToggleAlbumTitle={colorPrefs.toggleAlbumTitle}
            onClose={handleCloseColorPicker}
          />
        )}

        {/* Grid container */}
        <div
          className="w-full h-full flex items-center justify-center p-4"
          style={{ backgroundColor: colorPrefs.effectiveBackgroundColor }}
        >
          <div
            className="grid gap-2 sm:gap-4"
            style={{
              gridTemplateRows: `repeat(${rows}, 1fr)`,
              gridTemplateColumns: `repeat(${cols}, 1fr)`,
              maxWidth: "90vw",
              maxHeight: "80vh",
            }}
          >
            {displayImages.map((image, index) => (
              <MatImage
                key={index}
                src={image}
                matConfig={{
                  ...matConfig,
                  matColor: colorPrefs.effectiveMatColor,
                }}
                containerMode={true}
                gridInfo={{ rows, cols }}
                description={displayDescriptions[index]}
              />
            ))}

            {/* Fill empty slots if we have fewer images than grid slots */}
            {Array.from({
              length: Math.max(0, requiredCount - displayImages.length),
            }).map((_, index) => (
              <div
                key={`empty-${index}`}
                className="bg-gray-800 rounded-xl flex items-center justify-center"
                style={{
                  minHeight: "150px",
                  border: "2px dashed #4B5563",
                }}
              >
                <span className="text-gray-500 text-sm">No image</span>
              </div>
            ))}
          </div>
        </div>

        {/* Album title */}
        {colorPrefs.showAlbumTitle && (
          <div className="absolute bottom-16 sm:bottom-20 w-full text-center z-40">
            <h1 className="text-lg sm:text-xl font-bold tracking-wide font-calligraphy drop-shadow-lg text-white">
              {album?.title || "Untitled Album"}
            </h1>
          </div>
        )}

        <button
          type="button"
          onClick={handleBack}
          aria-label="Back to albums"
          className={`absolute top-2 sm:top-4 left-2 sm:left-4 bg-gray-900 text-white p-2 rounded-lg shadow-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-white z-50 transition-all duration-300 ${
            fullscreen.isFullscreen
              ? "bg-opacity-40 opacity-30 hover:opacity-80"
              : "bg-opacity-80 opacity-80 hover:opacity-100"
          }`}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>
    );
  }

  // Slideshow layout
  const isNoMat = colorPrefs.effectiveMatColor === "#000";

  return (
    <SlideshowErrorBoundary>
      <div
        className="fixed inset-0 flex flex-col items-center justify-center z-50"
        style={{ backgroundColor: colorPrefs.effectiveBackgroundColor }}
      >
        {/* Control buttons */}
        <ControlButtons
          isFullscreen={fullscreen.isFullscreen}
          onToggleFullscreen={fullscreen.toggleFullscreen}
          onToggleColorPicker={handleToggleColorPicker}
        />

        {/* Color picker overlay */}
        {showColorPicker && (
          <EnhancedColorPicker
            effectiveMatColor={colorPrefs.effectiveMatColor}
            selectedMatColor={colorPrefs.selectedMatColor}
            albumMatColor={album?.matConfig?.matColor}
            effectiveBackgroundColor={colorPrefs.effectiveBackgroundColor}
            selectedBackgroundColor={colorPrefs.selectedBackgroundColor}
            albumBackgroundColor={colorPrefs.albumBackgroundColor}
            onMatColorSelect={colorPrefs.selectMatColor}
            onBackgroundColorSelect={colorPrefs.selectBackgroundColor}
            onMatReset={colorPrefs.resetMatColor}
            onBackgroundReset={colorPrefs.resetBackgroundColor}
            showAlbumTitle={colorPrefs.showAlbumTitle}
            onToggleAlbumTitle={colorPrefs.toggleAlbumTitle}
            onClose={handleCloseColorPicker}
          />
        )}

        {slideshow.images.length > 0 ? (
          <div
            className="w-screen h-screen flex items-center justify-center"
            style={{ backgroundColor: colorPrefs.effectiveBackgroundColor }}
          >
            <ImageErrorBoundary
              src={slideshow.currentImage || undefined}
              alt={slideshow.currentDescription || "Album image"}
            >
              <MatImage
                src={slideshow.currentImage!}
                matConfig={{
                  ...matConfig,
                  matColor: colorPrefs.effectiveMatColor,
                }}
                containerMode={false}
                description={slideshow.currentDescription}
              />
            </ImageErrorBoundary>
          </div>
        ) : (
          <div
            className="text-white font-calligraphy w-screen h-screen flex items-center justify-center"
            style={{ backgroundColor: colorPrefs.effectiveBackgroundColor }}
          >
            No images in album.
          </div>
        )}

        <div className="absolute bottom-4 sm:bottom-6 w-full text-center z-40 px-6">
          {/* Album title with elegant styling */}
          {colorPrefs.showAlbumTitle && (
            <div className="mb-4">
              <h1
                className={`text-lg sm:text-xl font-bold tracking-wide font-calligraphy drop-shadow-lg ${
                  isLightColor(matConfig.matColor || "#000") && !isNoMat
                    ? "text-gray-900"
                    : "text-white"
                }`}
              >
                {album?.title || "Untitled Album"}
              </h1>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleBack}
          aria-label="Back to albums"
          className={`absolute top-2 sm:top-4 left-2 sm:left-4 bg-gray-900 text-white p-2 rounded-lg shadow-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-white z-50 transition-all duration-300 ${
            fullscreen.isFullscreen
              ? "bg-opacity-40 opacity-30 hover:opacity-80"
              : "bg-opacity-80 opacity-80 hover:opacity-100"
          }`}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>
    </SlideshowErrorBoundary>
  );
};

export default SlideshowPage;
