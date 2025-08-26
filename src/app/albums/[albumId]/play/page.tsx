"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
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
  backgroundColor,
}: {
  src: string;
  matConfig: { matWidth?: number; matColor?: string };
  containerMode?: boolean;
  gridInfo?: { rows: number; cols: number };
  backgroundColor?: string;
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
        background: isNoMat ? backgroundColor || "#374151" : matColor, // Use selected background color for no mat
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
  const params = useParams();
  const albumId = params?.albumId as string;
  const [album, setAlbum] = React.useState<Album | undefined>(undefined);
  const [current, setCurrent] = React.useState(0);
  const [gridImages, setGridImages] = React.useState<string[]>([]);
  const [nextSlotIndex, setNextSlotIndex] = React.useState(0);
  const [globalImageIndex, setGlobalImageIndex] = React.useState(3); // Start from image 3 (after initial 0,1,2)

  // Background color state
  const [backgroundColor, setBackgroundColor] = React.useState("#000000");
  const [showColorPicker, setShowColorPicker] = React.useState(false);

  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  // Sync background color with album's mat color when album loads
  React.useEffect(() => {
    if (album?.matConfig?.matColor) {
      setBackgroundColor(album.matConfig.matColor);
    }
  }, [album?.matConfig?.matColor]);

  // Load saved background color preference (only if no album mat color)
  React.useEffect(() => {
    if (!album?.matConfig?.matColor) {
      const savedColor = localStorage.getItem("chrono-lens-bg-color");
      if (savedColor) {
        setBackgroundColor(savedColor);
      }
    }
  }, [album?.matConfig?.matColor]);

  // Save background color preference
  React.useEffect(() => {
    localStorage.setItem("chrono-lens-bg-color", backgroundColor);
  }, [backgroundColor]);

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
        const data = await getAlbum(albumId);
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

  // Initialize grid with first images based on layout
  React.useEffect(() => {
    if (
      images.length > 0 &&
      (layout?.type === "grid" || layout?.type === "custom")
    ) {
      const requiredCount =
        (layout?.grid?.rows || 1) * (layout?.grid?.cols || 3);
      setGridImages(images.slice(0, requiredCount));
      setGlobalImageIndex(requiredCount); // Start next image index after initial set
      setNextSlotIndex(0); // Start with slot 0
    }
  }, [images, layout]);

  // Individual image cycling for grid layout
  React.useEffect(() => {
    if (layout?.type === "grid" || layout?.type === "custom") {
      const requiredCount =
        (layout?.grid?.rows || 1) * (layout?.grid?.cols || 3);

      // Only cycle if auto-advance is enabled and there are more images than grid slots
      const autoAdvanceEnabled =
        album?.timing?.interactive?.autoAdvance ?? false;
      const cycleDuration =
        album?.timing?.interactive?.autoAdvanceDuration ?? 5;

      if (images.length > requiredCount && autoAdvanceEnabled) {
        const timer = setInterval(() => {
          setGridImages((prevGrid) => {
            const newGrid = [...prevGrid];
            // Replace image at current slot with next global image
            newGrid[nextSlotIndex] = images[globalImageIndex % images.length];
            return newGrid;
          });
          setNextSlotIndex((prev) => (prev + 1) % requiredCount);
          setGlobalImageIndex((prev) => prev + 1);
        }, cycleDuration * 1000); // Convert seconds to milliseconds
        return () => clearInterval(timer);
      }
    }
  }, [
    images,
    layout,
    nextSlotIndex,
    globalImageIndex,
    album?.timing?.interactive?.autoAdvance,
    album?.timing?.interactive?.autoAdvanceDuration,
  ]);

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
    } catch (error) {
      console.log("Fullscreen not supported or failed:", error);
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

  // Background color picker component
  const ColorPicker = () => {
    return (
      <div className="absolute top-16 left-4 z-50">
        <div className="bg-gray-900/95 backdrop-blur-sm rounded-xl p-4 shadow-2xl border border-gray-700/50 min-w-[280px]">
          <h3 className="text-white text-sm font-medium mb-3 font-calligraphy">
            Mat Background Colors
          </h3>

          {/* Mat colors grid */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            {matColors.map((matOption) => (
              <button
                key={matOption.color}
                type="button"
                onClick={() => setBackgroundColor(matOption.color)}
                className={`w-12 h-12 rounded-lg border-2 transition-all duration-200 hover:scale-105 flex flex-col items-center justify-center ${
                  backgroundColor === matOption.color
                    ? "border-white shadow-lg ring-2 ring-white/30"
                    : "border-gray-600 hover:border-gray-400"
                }`}
                style={{ backgroundColor: matOption.color }}
                aria-label={`Set background to ${matOption.name}`}
              >
                {/* Show current mat selection indicator */}
                {album?.matConfig?.matColor === matOption.color && (
                  <div className="w-2 h-2 rounded-full bg-blue-400 border border-white shadow-sm" />
                )}
              </button>
            ))}
          </div>

          {/* Mat color names for selected color */}
          <div className="mb-3">
            <p className="text-white/80 text-xs font-calligraphy text-center">
              {matColors.find((c) => c.color === backgroundColor)?.name ||
                "Custom Color"}
              {album?.matConfig?.matColor === backgroundColor && (
                <span className="text-blue-400"> • Album Mat</span>
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
              value={backgroundColor}
              onChange={(e) => setBackgroundColor(e.target.value)}
              className="w-full h-10 rounded-lg border border-gray-600 bg-transparent cursor-pointer"
            />
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 mt-4">
            <button
              type="button"
              onClick={() =>
                setBackgroundColor(album?.matConfig?.matColor || "#000")
              }
              className="flex-1 px-3 py-2 bg-blue-800 hover:bg-blue-700 text-white text-xs rounded-lg transition-colors font-calligraphy"
            >
              Use Album Mat
            </button>
            <button
              type="button"
              onClick={() => setShowColorPicker(false)}
              className="flex-1 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white text-xs rounded-lg transition-colors font-calligraphy"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }; // Grid layout: 3 Portraits, 6 Portraits, or custom layouts like Mosaic
  if (layout?.type === "grid" || layout?.type === "custom") {
    const rows = layout?.grid?.rows || 1;
    const cols = layout?.grid?.cols || 3;
    const requiredCount = rows * cols;
    const hasMoreImages = images.length > requiredCount;
    const displayImages =
      gridImages.length > 0 ? gridImages : images.slice(0, requiredCount);
    const allPortrait =
      displayImages.length === requiredCount || !hasMoreImages;

    // Modern responsive grid design
    const is6Portrait = requiredCount === 6;

    return (
      <div
        className="fixed inset-0 flex flex-col items-center justify-center z-50"
        style={{ backgroundColor }}
      >
        {/* Fullscreen toggle button */}
        <button
          type="button"
          onClick={toggleFullscreen}
          aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          className="absolute top-2 sm:top-4 left-2 sm:left-4 bg-gray-900/80 hover:bg-gray-800 text-white p-2 rounded-lg shadow-lg transition-colors z-50"
        >
          {isFullscreen ? (
            <Minimize className="w-5 h-5" />
          ) : (
            <Maximize className="w-5 h-5" />
          )}
        </button>

        {/* Background color controls */}
        <button
          type="button"
          onClick={() => setShowColorPicker(!showColorPicker)}
          aria-label="Change background color"
          className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-gray-900/80 hover:bg-gray-800 text-white p-2 rounded-lg shadow-lg transition-colors z-50"
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

        {/* Color picker overlay */}
        {showColorPicker && <ColorPicker />}
        <style jsx>{`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .image-fade-transition {
            animation: fadeIn 0.6s ease-out;
          }

          /* Mobile-first approach for better viewing */
          @media (max-width: 640px) {
            .mobile-grid-6 {
              grid-template-columns: repeat(2, 1fr) !important;
              grid-template-rows: repeat(2, 1fr) !important;
              gap: 6px !important;
              padding: 6px !important;
              height: calc(100vh - 100px) !important;
            }
            .mobile-grid-6 > div:nth-child(n + 5) {
              display: none !important;
            }
            .mobile-grid-6 .group {
              transform: scale(1.1) !important;
            }
            .mobile-grid-3 {
              grid-template-columns: repeat(1, 1fr) !important;
              grid-template-rows: repeat(2, 1fr) !important;
              gap: 12px !important;
              padding: 8px !important;
              height: calc(100vh - 100px) !important;
            }
            .mobile-grid-3 > div:nth-child(n + 3) {
              display: none !important;
            }
          }

          @media (min-width: 641px) and (max-width: 768px) {
            .mobile-grid-6 {
              grid-template-columns: repeat(2, 1fr) !important;
              grid-template-rows: repeat(3, 1fr) !important;
              gap: 10px !important;
              padding: 12px !important;
            }
            .mobile-grid-3 {
              grid-template-columns: repeat(1, 1fr) !important;
              grid-template-rows: repeat(3, 1fr) !important;
              gap: 12px !important;
              padding: 12px !important;
            }
          }

          @media (min-width: 769px) and (max-width: 1024px) {
            .mobile-grid-6 {
              grid-template-columns: repeat(3, 1fr) !important;
              grid-template-rows: repeat(2, 1fr) !important;
              gap: 14px !important;
              padding: 16px !important;
            }
          }
        `}</style>

        <div
          className={`w-full h-full max-w-7xl mx-auto p-2 sm:p-4 md:p-6 lg:p-8 ${
            is6Portrait
              ? "mobile-grid-6"
              : requiredCount === 3
              ? "mobile-grid-3"
              : ""
          }`}
        >
          <div
            className="grid w-full h-full gap-2 sm:gap-3 md:gap-4 lg:gap-6 xl:gap-8 p-2 sm:p-4 lg:p-6 xl:p-8"
            style={{
              gridTemplateColumns: `repeat(${cols}, 1fr)`,
              gridTemplateRows: `repeat(${rows}, 1fr)`,
              height: "calc(100vh - 60px)",
              maxWidth: "100vw",
            }}
          >
            {displayImages.map((img: string, index: number) => {
              // Get the description for the current image - find the correct index in the original images array
              const originalImageIndex = images.indexOf(img);
              const description =
                originalImageIndex >= 0
                  ? imageDescriptions[originalImageIndex]
                  : "";

              // For debugging - let's also show some fallback info
              const fallbackCaption = `Image ${index + 1}`;
              const displayCaption =
                description && description.trim()
                  ? description
                  : fallbackCaption;

              // Get appropriate text color based on mat color
              const isNoMat = matConfig.matColor === "#000";

              // Calculate responsive caption styling based on grid layout
              const getCaptionStyling = () => {
                const totalCells = rows * cols;

                if (cols >= 8) {
                  // Very many small images (like Single Row 1x8)
                  return {
                    gradientHeight: "h-4",
                    spacing: "bottom-0.5 left-0.5 right-0.5",
                    padding: "px-1 py-0.5",
                    textSize: "text-xs",
                    rounded: "rounded",
                    show: totalCells <= 10, // Only show for reasonable number of items
                  };
                } else if (cols >= 4 || totalCells >= 9) {
                  // Many small images (like Mixed Grid 3x3, Mosaic 4x4)
                  return {
                    gradientHeight: "h-6",
                    spacing: "bottom-0.5 left-0.5 right-0.5",
                    padding: "px-1.5 py-0.5",
                    textSize: "text-xs",
                    rounded: "rounded",
                    show: true,
                  };
                } else if (cols >= 3 || totalCells >= 6) {
                  // Medium grids (like 3 Portraits, 6 Portraits, 3x2 Landscape)
                  return {
                    gradientHeight: "h-6",
                    spacing: "bottom-1 left-1 right-1",
                    padding: "px-2 py-1",
                    textSize: "text-xs",
                    rounded: "rounded",
                    show: true,
                  };
                } else if (cols === 1) {
                  // Column Stack (8x1) - tall images
                  return {
                    gradientHeight: "h-8",
                    spacing: "bottom-1 left-1 right-1",
                    padding: "px-2 py-1",
                    textSize: "text-xs",
                    rounded: "rounded",
                    show: true,
                  };
                } else {
                  // Large images (like 2x2 Grid)
                  return {
                    gradientHeight: "h-8",
                    spacing: "bottom-1 left-1 right-1",
                    padding: "px-2 py-1",
                    textSize: "text-xs",
                    rounded: "rounded",
                    show: true,
                  };
                }
              };

              const captionStyle = getCaptionStyling();

              return (
                <div
                  key={`${img}-${globalImageIndex}-${nextSlotIndex}`}
                  className="relative w-full h-full min-h-0 overflow-hidden group"
                >
                  <div className="relative w-full h-full transition-all duration-500 ease-out image-fade-transition">
                    {/* Mat board container with caption positioned on image */}
                    <div className="relative w-full h-full flex items-center justify-center">
                      <div className="relative">
                        <MatImage
                          src={img}
                          matConfig={matConfig}
                          containerMode={true}
                          gridInfo={{ rows, cols }}
                          backgroundColor={backgroundColor}
                        />

                        {/* Caption positioned directly on the MatImage */}
                        {captionStyle.show && (
                          <div className="absolute bottom-0 left-0 right-0 z-30 pointer-events-none">
                            <div className="relative">
                              {/* More subtle gradient overlay */}
                              <div
                                className={`${captionStyle.gradientHeight} bg-gradient-to-t from-black/30 via-black/15 to-transparent`}
                              ></div>
                              {/* More discreet caption design */}
                              <div
                                className={`absolute ${captionStyle.spacing}`}
                              >
                                <div
                                  className={`${captionStyle.padding} ${
                                    captionStyle.rounded
                                  } backdrop-blur-sm shadow-sm border transition-all duration-300 ${
                                    isLightColor(
                                      matConfig.matColor || "#000"
                                    ) && !isNoMat
                                      ? "bg-white/70 text-gray-800 border-gray-200/15"
                                      : "bg-gray-900/70 text-white/90 border-gray-600/15"
                                  }`}
                                >
                                  <p
                                    className={`${captionStyle.textSize} font-normal text-center font-calligraphy leading-tight overflow-hidden text-ellipsis whitespace-nowrap opacity-90`}
                                  >
                                    {displayCaption}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {!allPortrait && (
          <div className="absolute bottom-12 sm:bottom-16 w-full text-center z-50 px-4">
            <span className="text-red-500 bg-black bg-opacity-80 px-3 sm:px-4 py-2 rounded-lg text-sm sm:font-semibold font-calligraphy">
              All images must be portrait for this layout. Please update your
              album.
            </span>
          </div>
        )}

        <div className="absolute bottom-2 sm:bottom-4 w-full text-center z-40 px-4">
          <h1 className="text-sm sm:text-base font-medium text-white opacity-70 font-calligraphy">
            {album?.title || "Untitled Album"}
          </h1>
        </div>

        <button
          type="button"
          onClick={handleBack}
          aria-label="Back to albums"
          className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 bg-gray-900 bg-opacity-80 text-white p-2 rounded-lg shadow-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-white z-50"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>
    );
  }

  // Slideshow layout
  const isNoMat = matConfig.matColor === "#000";

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center z-50"
      style={{ backgroundColor }}
    >
      {/* Fullscreen toggle button */}
      <button
        type="button"
        onClick={toggleFullscreen}
        aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
        className="absolute top-2 sm:top-4 left-2 sm:left-4 bg-gray-900/80 hover:bg-gray-800 text-white p-2 rounded-lg shadow-lg transition-colors z-50"
      >
        {isFullscreen ? (
          <Minimize className="w-5 h-5" />
        ) : (
          <Maximize className="w-5 h-5" />
        )}
      </button>

      {/* Background color controls */}
      <button
        type="button"
        onClick={() => setShowColorPicker(!showColorPicker)}
        aria-label="Change background color"
        className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-gray-900/80 hover:bg-gray-800 text-white p-2 rounded-lg shadow-lg transition-colors z-50"
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

      {/* Color picker overlay */}
      {showColorPicker && <ColorPicker />}

      {images.length > 0 ? (
        <div className="w-screen h-screen flex items-center justify-center">
          <MatImage
            src={images[current]}
            matConfig={matConfig}
            containerMode={false}
            backgroundColor={backgroundColor}
          />
        </div>
      ) : (
        <div className="text-white font-calligraphy">No images in album.</div>
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
        className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 bg-gray-900 bg-opacity-80 text-white p-2 rounded-lg shadow-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-white z-50"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>
    </div>
  );
};

export default SlideshowPage;
