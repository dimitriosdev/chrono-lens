"use client";

import React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Album } from "@/entities/Album";
import { getAlbum } from "@/lib/firestore";
import { useAuth } from "@/context/AuthContext";
import { AlbumLayout } from "@/features/albums/AlbumLayout";
import Image from "next/image";
import { Maximize, Minimize, ArrowLeft } from "lucide-react";

// Hook to track screen size
function useScreenSize() {
  const [screenSize, setScreenSize] = React.useState({ width: 0, height: 0 });

  React.useEffect(() => {
    function updateSize() {
      setScreenSize({ width: window.innerWidth, height: window.innerHeight });
    }

    window.addEventListener("resize", updateSize);
    updateSize();

    return () => window.removeEventListener("resize", updateSize);
  }, []);

  return screenSize;
}

// Enhanced Color picker component with both mat and background color support
const EnhancedColorPicker: React.FC<{
  effectiveMatColor: string;
  selectedMatColor: string | null;
  albumMatColor?: string;
  effectiveBackgroundColor: string;
  selectedBackgroundColor: string | null;
  albumBackgroundColor?: string;
  onMatColorSelect: (color: string) => void;
  onBackgroundColorSelect: (color: string) => void;
  onMatReset: () => void;
  onBackgroundReset: () => void;
  onClose: () => void;
}> = ({
  effectiveMatColor,
  selectedMatColor,
  albumMatColor,
  effectiveBackgroundColor,
  selectedBackgroundColor,
  albumBackgroundColor,
  onMatColorSelect,
  onBackgroundColorSelect,
  onMatReset,
  onBackgroundReset,
  onClose,
}) => {
  const [activeTab, setActiveTab] = React.useState<"mat" | "background">("mat");

  return (
    <div className="absolute top-16 left-4 z-50">
      <div className="bg-gray-900/95 backdrop-blur-sm rounded-xl p-4 shadow-2xl border border-gray-700/50 min-w-[280px]">
        {/* Tab selection */}
        <div className="flex mb-4 bg-gray-800 rounded-lg p-1">
          <button
            type="button"
            onClick={() => setActiveTab("mat")}
            className={`flex-1 px-3 py-2 text-xs rounded-md transition-colors font-calligraphy ${
              activeTab === "mat"
                ? "bg-blue-600 text-white"
                : "text-gray-300 hover:text-white"
            }`}
          >
            Mat Color
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("background")}
            className={`flex-1 px-3 py-2 text-xs rounded-md transition-colors font-calligraphy ${
              activeTab === "background"
                ? "bg-blue-600 text-white"
                : "text-gray-300 hover:text-white"
            }`}
          >
            Background
          </button>
        </div>

        <h3 className="text-white text-sm font-medium mb-3 font-calligraphy">
          {activeTab === "mat" ? "Mat Colors" : "Background Colors"}
        </h3>

        {/* Colors grid */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {matColors.map((colorOption) => {
            const effectiveColor =
              activeTab === "mat"
                ? effectiveMatColor
                : effectiveBackgroundColor;
            const albumColor =
              activeTab === "mat" ? albumMatColor : albumBackgroundColor;

            return (
              <button
                key={colorOption.color}
                type="button"
                onClick={() =>
                  activeTab === "mat"
                    ? onMatColorSelect(colorOption.color)
                    : onBackgroundColorSelect(colorOption.color)
                }
                className={`w-12 h-12 rounded-lg border-2 transition-all duration-200 hover:scale-105 flex flex-col items-center justify-center ${
                  effectiveColor === colorOption.color
                    ? "border-white shadow-lg ring-2 ring-white/30"
                    : "border-gray-600 hover:border-gray-400"
                }`}
                style={{ backgroundColor: colorOption.color }}
                aria-label={`Set ${activeTab} to ${colorOption.name}`}
              >
                {/* Show current album default indicator */}
                {albumColor === colorOption.color && (
                  <div className="w-2 h-2 rounded-full bg-blue-400 border border-white shadow-sm" />
                )}
              </button>
            );
          })}
        </div>

        {/* Color names for selected color */}
        <div className="mb-3">
          <p className="text-white/80 text-xs font-calligraphy text-center">
            {matColors.find(
              (c) =>
                c.color ===
                (activeTab === "mat"
                  ? effectiveMatColor
                  : effectiveBackgroundColor)
            )?.name || "Custom Color"}
            {activeTab === "mat" &&
              albumMatColor === effectiveMatColor &&
              !selectedMatColor && (
                <span className="text-blue-400"> • Album Default</span>
              )}
            {activeTab === "background" &&
              albumBackgroundColor === effectiveBackgroundColor &&
              !selectedBackgroundColor && (
                <span className="text-blue-400"> • Album Default</span>
              )}
            {activeTab === "mat" && selectedMatColor && (
              <span className="text-green-400"> • Custom Selection</span>
            )}
            {activeTab === "background" && selectedBackgroundColor && (
              <span className="text-green-400"> • Custom Selection</span>
            )}
          </p>
        </div>

        {/* Custom color picker */}
        <div className="space-y-3">
          <label className="text-white text-xs font-medium font-calligraphy">
            Custom Color:
          </label>
          <input
            type="color"
            value={
              activeTab === "mat" ? effectiveMatColor : effectiveBackgroundColor
            }
            onChange={(e) =>
              activeTab === "mat"
                ? onMatColorSelect(e.target.value)
                : onBackgroundColorSelect(e.target.value)
            }
            className="w-full h-10 rounded-lg border border-gray-600 bg-transparent cursor-pointer"
          />
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 mt-4">
          <button
            type="button"
            onClick={activeTab === "mat" ? onMatReset : onBackgroundReset}
            className="flex-1 px-3 py-2 bg-blue-800 hover:bg-blue-700 text-white text-xs rounded-lg transition-colors font-calligraphy"
          >
            Use Album Default
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white text-xs rounded-lg transition-colors font-calligraphy"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

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
        className="bg-gray-900/80 hover:bg-gray-800 text-white p-2 rounded-lg shadow-lg transition-colors"
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
        className="bg-gray-900/80 hover:bg-gray-800 text-white p-2 rounded-lg shadow-lg transition-colors"
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

// Mat colors definition (same as in EnhancedMatBoard)
const matColors = [
  { name: "No Mat", color: "#000" },
  { name: "Classic White", color: "#f8f8f8" },
  { name: "Soft Yellow", color: "#ffe88a" },
  { name: "Modern Grey", color: "#bfc2c3" },
  { name: "Blush Pink", color: "#f8e1ea" },
  { name: "Deep Black", color: "#1a1a1a" },
  { name: "Cream", color: "#f5f5dc" },
  { name: "Sage Green", color: "#9caf88" },
];

// Utility function to determine if a color is light or dark
function isLightColor(color: string): boolean {
  // Remove # if present
  const hex = color.replace("#", "");

  // Convert to RGB
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  // Calculate relative luminance using W3C formula
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Return true if light (luminance > 0.5)
  return luminance > 0.5;
}

function MatImage({
  src,
  matConfig,
  containerMode = false,
  gridInfo,
}: {
  src: string;
  matConfig: { matWidth?: number; matColor?: string };
  containerMode?: boolean;
  gridInfo?: { rows: number; cols: number };
}) {
  const matPercent = matConfig?.matWidth ?? 5;
  const matColor = matConfig?.matColor ?? "#000";
  const isNoMat = matColor === "#000";
  const [imgDims, setImgDims] = React.useState({ width: 1, height: 1 });
  const { width: screenWidth, height: screenHeight } = useScreenSize();

  // Use different sizing for grid vs slideshow
  const getFrameDimensions = () => {
    if (!containerMode) {
      // Slideshow mode - use full screen
      return {
        width: screenWidth || 400,
        height: screenHeight || 600,
      };
    }

    // Grid mode - responsive sizing based on screen width and grid layout
    if (screenWidth) {
      const cols = gridInfo?.cols || 3;
      const rows = gridInfo?.rows || 2;

      // Special handling for Single Row layout (1×8)
      if (rows === 1 && cols >= 6) {
        const availableWidth = screenWidth * 0.9;
        const maxWidthPerItem = availableWidth / cols;

        // For single row, keep height proportional to width, not screen height
        const optimalHeight = Math.min(maxWidthPerItem * 1.2, 200); // Max 200px height

        return {
          width: Math.min(maxWidthPerItem, 180), // Max 180px width for single row
          height: optimalHeight,
        };
      }

      // Special handling for Column Stack layout (8×1)
      if (cols === 1 && rows >= 6) {
        const availableHeight = (screenHeight || 800) * 0.8;
        const maxHeightPerItem = availableHeight / rows;

        // For column stack, keep width proportional and reasonable
        const optimalWidth = Math.min(screenWidth * 0.4, 300); // Max 300px width

        return {
          width: optimalWidth,
          height: Math.min(maxHeightPerItem, 150), // Max 150px height per item
        };
      }

      if (screenWidth >= 1300) {
        // Large screens: maximize space usage based on grid size
        const availableWidth = screenWidth * 0.9; // 90% of screen
        const availableHeight = (screenHeight || 800) * 0.8; // 80% of height

        // Calculate optimal size based on grid layout
        const maxWidthPerItem = availableWidth / cols;
        const maxHeightPerItem = availableHeight / rows;

        // Use smaller dimension to maintain aspect ratio
        const itemSize = Math.min(maxWidthPerItem, maxHeightPerItem);

        return {
          width: Math.min(itemSize, 600), // Cap at 600px for very large screens
          height: Math.min(itemSize, 500), // Cap at 500px
        };
      } else if (screenWidth >= 768) {
        // Medium screens: moderate sizing with special handling
        const availableWidth = screenWidth * 0.85;

        // Special handling for Single Row on medium screens
        if (rows === 1 && cols >= 6) {
          const maxWidthPerItem = availableWidth / cols;
          return {
            width: Math.min(maxWidthPerItem, 140),
            height: Math.min(maxWidthPerItem * 1.2, 160),
          };
        }

        // Special handling for Column Stack on medium screens
        if (cols === 1 && rows >= 6) {
          return {
            width: Math.min(screenWidth * 0.4, 250),
            height: Math.min(((screenHeight || 600) * 0.8) / rows, 120),
          };
        }

        // Regular grid handling
        const maxWidthPerItem = availableWidth / cols;
        return {
          width: Math.min(maxWidthPerItem, 350),
          height: Math.min(maxWidthPerItem * 0.8, 280),
        };
      } else {
        // Small screens: compact sizing
        return {
          width: Math.min(screenWidth * 0.9, 280),
          height: Math.min(screenWidth * 0.7, 350),
        };
      }
    }

    // Fallback for SSR
    return { width: 280, height: 350 };
  };

  const { width: frameW, height: frameH } = getFrameDimensions();

  const handleImgLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.target as HTMLImageElement;
    setImgDims({ width: img.naturalWidth, height: img.naturalHeight });
  };

  // Adaptive mat calculation - reduce mat percentage for grid mode
  const adjustedMatPercent = containerMode
    ? Math.min(matPercent, 10)
    : matPercent;
  const imgAspect = imgDims.width / imgDims.height;
  const artworkArea = Math.min(frameW, frameH) * (1 - adjustedMatPercent / 100);
  let artworkWidth = artworkArea;
  let artworkHeight = artworkArea;
  if (frameW / frameH > imgAspect) {
    artworkHeight = frameH * (1 - adjustedMatPercent / 100);
    artworkWidth = artworkHeight * imgAspect;
  } else {
    artworkWidth = frameW * (1 - adjustedMatPercent / 100);
    artworkHeight = artworkWidth / imgAspect;
  }
  const matHorizontal = (frameW - artworkWidth) / 2;
  const matVertical = (frameH - artworkHeight) / 2;

  return (
    <div
      className="relative flex items-center justify-center"
      style={{
        background: isNoMat ? "#374151" : matColor, // Use mat color or dark background for no mat
        width: `${frameW}px`,
        height: `${frameH}px`,
        border: "none",
        boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
        flexShrink: 0,
      }}
    >
      {/* Outer mat (skip if No Mat) */}
      {!isNoMat && (
        <div
          className="absolute rounded-xl"
          style={{
            top: 0,
            left: 0,
            width: `${frameW}px`,
            height: `${frameH}px`,
            background: matColor,
            boxSizing: "border-box",
            boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
            zIndex: 2,
            border: "none",
          }}
          aria-hidden="true"
        />
      )}
      {/* Artwork area */}
      <div
        className="absolute flex items-center justify-center rounded-xl overflow-hidden"
        style={{
          top: `${matVertical}px`,
          left: `${matHorizontal}px`,
          width: `${artworkWidth}px`,
          height: `${artworkHeight}px`,
          background: isNoMat ? "#000" : "#fff",
          boxShadow: !isNoMat ? "0 0 0 1px #ccc" : undefined,
          zIndex: 4,
        }}
      >
        <Image
          src={src}
          alt="Artwork"
          className="object-contain w-full h-full rounded"
          onLoad={handleImgLoad}
          style={{ maxWidth: "100%", maxHeight: "100%", border: "none" }}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
    </div>
  );
}

const SlideshowPage: React.FC = () => {
  const { isSignedIn, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const albumId = searchParams.get("id");
  const [album, setAlbum] = React.useState<Album | undefined>(undefined);
  const [current, setCurrent] = React.useState(0);

  // Mat color state (this will override the album's mat color)
  const [selectedMatColor, setSelectedMatColor] = React.useState<string | null>(
    null
  );

  // Background color state (separate from mat color)
  const [selectedBackgroundColor, setSelectedBackgroundColor] = React.useState<
    string | null
  >(null);

  const [showColorPicker, setShowColorPicker] = React.useState(false);
  const [colorInitialized, setColorInitialized] = React.useState(false);

  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  // Initialize mat color when album loads (only once)
  React.useEffect(() => {
    if (album?.matConfig?.matColor && !colorInitialized) {
      // Check if user has a saved preference first
      const savedMatColor = localStorage.getItem("chrono-lens-mat-color");
      if (savedMatColor) {
        setSelectedMatColor(savedMatColor);
      }

      // Initialize background color from localStorage or album default
      const savedBackgroundColor = localStorage.getItem(
        "chrono-lens-background-color"
      );
      if (savedBackgroundColor) {
        setSelectedBackgroundColor(savedBackgroundColor);
      }

      // If no saved color, use album's default (selectedMatColor stays null)
      setColorInitialized(true);
    }
  }, [album?.matConfig?.matColor, colorInitialized]);

  // Save mat color preference when it changes (but only after initialization)
  React.useEffect(() => {
    if (colorInitialized && selectedMatColor) {
      localStorage.setItem("chrono-lens-mat-color", selectedMatColor);
    }
  }, [selectedMatColor, colorInitialized]);

  // Save background color preference when it changes (but only after initialization)
  React.useEffect(() => {
    if (colorInitialized && selectedBackgroundColor) {
      localStorage.setItem(
        "chrono-lens-background-color",
        selectedBackgroundColor
      );
    }
  }, [selectedBackgroundColor, colorInitialized]);

  // Use selected colors or fall back to album's colors
  const effectiveMatColor =
    selectedMatColor || album?.matConfig?.matColor || "#000";

  // For background color, we use a fallback since albums might not have backgroundColor yet
  const albumBackgroundColor = (
    album?.matConfig as { backgroundColor?: string }
  )?.backgroundColor;
  const effectiveBackgroundColor =
    selectedBackgroundColor || albumBackgroundColor || "#1a1a1a";

  // Callback handlers for mat color
  const handleMatColorSelect = React.useCallback((color: string) => {
    setSelectedMatColor(color);
  }, []);

  const handleMatResetColor = React.useCallback(() => {
    setSelectedMatColor(null);
  }, []);

  // Callback handlers for background color
  const handleBackgroundColorSelect = React.useCallback((color: string) => {
    setSelectedBackgroundColor(color);
  }, []);

  const handleBackgroundResetColor = React.useCallback(() => {
    setSelectedBackgroundColor(null);
  }, []);

  const handleCloseColorPicker = React.useCallback(() => {
    setShowColorPicker(false);
  }, []);

  const handleToggleColorPicker = React.useCallback(() => {
    setShowColorPicker(!showColorPicker);
  }, [showColorPicker]);

  // Fullscreen change handler
  React.useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  React.useEffect(() => {
    if (!loading && !isSignedIn) {
      router.replace("/");
    }
  }, [isSignedIn, loading, router]);

  React.useEffect(() => {
    async function fetchAlbum() {
      try {
        const data = await getAlbum(albumId!);
        setAlbum(data || undefined);
      } catch {
        setAlbum(undefined);
      }
    }
    if (albumId) fetchAlbum();
  }, [albumId]);

  const images = React.useMemo(() => {
    const albumImages = album?.images || [];
    // Handle both old format (string[]) and new format (AlbumImage[])
    return albumImages.map((img) => (typeof img === "string" ? img : img.url));
  }, [album?.images]);

  const imageDescriptions = React.useMemo(() => {
    const albumImages = album?.images || [];
    // Get descriptions for new format, empty string for old format
    const descriptions = albumImages.map((img) =>
      typeof img === "string" ? "" : img.description || ""
    );
    return descriptions;
  }, [album?.images]);

  const currentImageDescription = imageDescriptions[current] || "";
  const matConfig = album?.matConfig || { matWidth: 5, matColor: "#000" };
  const layout: AlbumLayout = React.useMemo(
    () =>
      album?.layout || {
        type: "slideshow",
        name: "Default",
        description: "Default slideshow",
        grid: { rows: 1, cols: 1 },
      },
    [album?.layout]
  );

  const handleBack = React.useCallback(() => {
    router.push("/albums");
  }, [router]);

  // Fullscreen toggle function
  const toggleFullscreen = async () => {
    try {
      if (!isFullscreen) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      // Silently handle fullscreen API errors (some browsers don't support it)
    }
  };

  // Slideshow interval effect (hook placement fix)
  React.useEffect(() => {
    if (layout?.type === "slideshow" && images.length > 1) {
      const slideshowDuration = album?.timing?.slideshow?.cycleDuration ?? 5;
      const timer = setInterval(() => {
        setCurrent((prev) => (prev + 1) % images.length);
      }, slideshowDuration * 1000); // Convert seconds to milliseconds
      return () => clearInterval(timer);
    }
    // No interval for other layouts
    return undefined;
  }, [layout?.type, images.length, album?.timing?.slideshow?.cycleDuration]);

  if (loading || !isSignedIn) return null;

  // Show error if no album ID
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

  // Grid layout: 3 Portraits, 6 Portraits, or custom layouts like Mosaic
  if (layout?.type === "grid" || layout?.type === "custom") {
    const rows = layout?.grid?.rows || 1;
    const cols = layout?.grid?.cols || 3;
    const requiredCount = rows * cols;
    const displayImages = images.slice(0, requiredCount);

    return (
      <div
        className="fixed inset-0 flex flex-col items-center justify-center z-50"
        style={{ backgroundColor: effectiveBackgroundColor }}
      >
        {/* Control buttons */}
        <ControlButtons
          isFullscreen={isFullscreen}
          onToggleFullscreen={toggleFullscreen}
          onToggleColorPicker={handleToggleColorPicker}
        />

        {/* Color picker overlay */}
        {showColorPicker && (
          <EnhancedColorPicker
            effectiveMatColor={effectiveMatColor}
            selectedMatColor={selectedMatColor}
            albumMatColor={album?.matConfig?.matColor}
            effectiveBackgroundColor={effectiveBackgroundColor}
            selectedBackgroundColor={selectedBackgroundColor}
            albumBackgroundColor={albumBackgroundColor}
            onMatColorSelect={handleMatColorSelect}
            onBackgroundColorSelect={handleBackgroundColorSelect}
            onMatReset={handleMatResetColor}
            onBackgroundReset={handleBackgroundResetColor}
            onClose={handleCloseColorPicker}
          />
        )}

        {/* Grid container */}
        <div
          className="w-full h-full flex items-center justify-center p-4"
          style={{ backgroundColor: effectiveBackgroundColor }}
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
                matConfig={{ ...matConfig, matColor: effectiveMatColor }}
                containerMode={true}
                gridInfo={{ rows, cols }}
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
        <div className="absolute bottom-16 sm:bottom-20 w-full text-center z-40">
          <h1 className="text-lg sm:text-xl font-bold tracking-wide font-calligraphy drop-shadow-lg text-white">
            {album?.title || "Untitled Album"}
          </h1>
        </div>

        <button
          type="button"
          onClick={handleBack}
          aria-label="Back to albums"
          className="absolute top-2 sm:top-4 left-2 sm:left-4 bg-gray-900 bg-opacity-80 text-white p-2 rounded-lg shadow-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-white z-50"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>
    );
  }

  // Slideshow layout
  const isNoMat = effectiveMatColor === "#000";

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center z-50"
      style={{ backgroundColor: effectiveBackgroundColor }}
    >
      {/* Control buttons */}
      <ControlButtons
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        onToggleColorPicker={handleToggleColorPicker}
      />

      {/* Color picker overlay */}
      {showColorPicker && (
        <EnhancedColorPicker
          effectiveMatColor={effectiveMatColor}
          selectedMatColor={selectedMatColor}
          albumMatColor={album?.matConfig?.matColor}
          effectiveBackgroundColor={effectiveBackgroundColor}
          selectedBackgroundColor={selectedBackgroundColor}
          albumBackgroundColor={albumBackgroundColor}
          onMatColorSelect={handleMatColorSelect}
          onBackgroundColorSelect={handleBackgroundColorSelect}
          onMatReset={handleMatResetColor}
          onBackgroundReset={handleBackgroundResetColor}
          onClose={handleCloseColorPicker}
        />
      )}

      {images.length > 0 ? (
        <div
          className="w-screen h-screen flex items-center justify-center"
          style={{ backgroundColor: effectiveBackgroundColor }}
        >
          <MatImage
            src={images[current]}
            matConfig={{ ...matConfig, matColor: effectiveMatColor }}
            containerMode={false}
          />
        </div>
      ) : (
        <div
          className="text-white font-calligraphy w-screen h-screen flex items-center justify-center"
          style={{ backgroundColor: effectiveBackgroundColor }}
        >
          No images in album.
        </div>
      )}
      <div className="absolute bottom-4 sm:bottom-6 w-full text-center z-40 px-6">
        {/* Album title with elegant styling */}
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

        {/* Image description with premium design */}
        {currentImageDescription && currentImageDescription.trim() && (
          <div className="flex justify-center">
            <div
              className={`px-6 py-4 backdrop-blur-lg rounded-2xl shadow-2xl border max-w-3xl ${
                isLightColor(matConfig.matColor || "#000") && !isNoMat
                  ? "bg-white/95 text-gray-900 border-white/30"
                  : "bg-black/95 text-white border-white/20"
              }`}
            >
              <p className="text-base sm:text-lg leading-relaxed font-medium font-calligraphy tracking-wide">
                {currentImageDescription}
              </p>
            </div>
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={handleBack}
        aria-label="Back to albums"
        className="absolute top-2 sm:top-4 left-2 sm:left-4 bg-gray-900 bg-opacity-80 text-white p-2 rounded-lg shadow-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-white z-50"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>
    </div>
  );
};

export default SlideshowPage;
