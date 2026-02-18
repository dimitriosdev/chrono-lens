"use client";

import React from "react";
import Image from "next/image";
import { MatConfig } from "@/shared/types/album";

/**
 * Grid dimensions for layout calculations
 */
interface GridInfo {
  rows: number;
  cols: number;
}

/**
 * Props for MatImage component
 */
interface MatImageProps {
  src: string;
  matConfig: Partial<MatConfig>;
  containerMode?: boolean;
  gridInfo?: GridInfo;
  alt?: string;
  description?: string;
  textColor?: string;
}

/**
 * Screen dimensions for responsive calculations
 */
interface ScreenSize {
  width: number;
  height: number;
}

/**
 * Calculated frame dimensions
 */
interface FrameDimensions {
  width: number;
  height: number;
}

// Hook to track screen size (optimized version)
function useScreenSize(): ScreenSize {
  const [screenSize, setScreenSize] = React.useState<ScreenSize>(() => {
    // Initialize with actual dimensions if available (client-side)
    if (typeof window !== "undefined") {
      return {
        width: window.innerWidth,
        height: window.innerHeight,
      };
    }
    // SSR fallback - use reasonable defaults
    return {
      width: 1200,
      height: 800,
    };
  });

  React.useEffect(() => {
    function updateSize() {
      setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    // Immediate update on mount
    updateSize();

    // Throttle resize events for better performance
    let timeoutId: NodeJS.Timeout;
    function throttledUpdate() {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateSize, 100);
    }

    window.addEventListener("resize", throttledUpdate);
    // Also listen for orientation changes on mobile
    window.addEventListener("orientationchange", () => {
      // Delay to allow browser to update dimensions
      setTimeout(updateSize, 250);
    });

    return () => {
      window.removeEventListener("resize", throttledUpdate);
      window.removeEventListener("orientationchange", updateSize);
      clearTimeout(timeoutId);
    };
  }, []);

  return screenSize;
}

// Utility functions
const getFrameDimensions = (
  containerMode: boolean,
  screenWidth: number,
  screenHeight: number,
  gridInfo?: GridInfo,
): FrameDimensions => {
  if (!containerMode) {
    // Slideshow mode - use full screen with better fallbacks
    // Prefer actual screen dimensions but use more reasonable fallbacks
    const width =
      screenWidth || (typeof window !== "undefined" ? window.innerWidth : 1200);
    const height =
      screenHeight ||
      (typeof window !== "undefined" ? window.innerHeight : 800);
    return {
      width,
      height,
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
      const optimalHeight = Math.min(maxWidthPerItem * 1.2, 200);

      return {
        width: Math.min(maxWidthPerItem, 180),
        height: optimalHeight,
      };
    }

    // Special handling for Column Stack layout (8×1)
    if (cols === 1 && rows >= 6) {
      const availableHeight = (screenHeight || 800) * 0.8;
      const maxHeightPerItem = availableHeight / rows;
      const optimalWidth = Math.min(screenWidth * 0.4, 300);

      return {
        width: optimalWidth,
        height: Math.min(maxHeightPerItem, 150),
      };
    }

    if (screenWidth >= 1300) {
      // Large screens
      const availableWidth = screenWidth * 0.9;
      const availableHeight = (screenHeight || 800) * 0.8;
      const maxWidthPerItem = availableWidth / cols;
      const maxHeightPerItem = availableHeight / rows;
      const itemSize = Math.min(maxWidthPerItem, maxHeightPerItem);

      return {
        width: Math.min(itemSize, 600),
        height: Math.min(itemSize, 500),
      };
    } else if (screenWidth >= 768) {
      // Medium screens
      const availableWidth = screenWidth * 0.85;

      if (rows === 1 && cols >= 6) {
        const maxWidthPerItem = availableWidth / cols;
        return {
          width: Math.min(maxWidthPerItem, 140),
          height: Math.min(maxWidthPerItem * 1.2, 160),
        };
      }

      if (cols === 1 && rows >= 6) {
        return {
          width: Math.min(screenWidth * 0.4, 250),
          height: Math.min(((screenHeight || 600) * 0.8) / rows, 120),
        };
      }

      const maxWidthPerItem = availableWidth / cols;
      return {
        width: Math.min(maxWidthPerItem, 350),
        height: Math.min(maxWidthPerItem * 0.8, 280),
      };
    } else {
      // Small screens
      return {
        width: Math.min(screenWidth * 0.9, 280),
        height: Math.min(screenWidth * 0.7, 350),
      };
    }
  }

  // Fallback for SSR
  return { width: 280, height: 350 };
};

const calculateMatDimensions = (
  frameW: number,
  frameH: number,
  imgAspect: number,
  matPercent: number,
) => {
  const artworkArea = Math.min(frameW, frameH) * (1 - matPercent / 100);
  let artworkWidth = artworkArea;
  let artworkHeight = artworkArea;

  if (frameW / frameH > imgAspect) {
    artworkHeight = frameH * (1 - matPercent / 100);
    artworkWidth = artworkHeight * imgAspect;
  } else {
    artworkWidth = frameW * (1 - matPercent / 100);
    artworkHeight = artworkWidth / imgAspect;
  }

  const matHorizontal = (frameW - artworkWidth) / 2;
  const matVertical = (frameH - artworkHeight) / 2;

  return {
    artworkWidth,
    artworkHeight,
    matHorizontal,
    matVertical,
  };
};

/**
 * Get caption styles based on layout mode
 */
const getCaptionStyles = (
  containerMode?: boolean,
  gridInfo?: GridInfo,
): string => {
  const isMultiImageLayout =
    containerMode && gridInfo && (gridInfo.rows > 1 || gridInfo.cols > 1);

  const baseStyles =
    "font-medium text-center overflow-hidden text-ellipsis whitespace-nowrap drop-shadow-lg";

  if (isMultiImageLayout) {
    return `${baseStyles} text-[10px] px-2 py-1`;
  }

  return `${baseStyles} text-xs px-3 py-2`;
};

// Main MatImage component
const MatImage: React.FC<MatImageProps> = ({
  src,
  matConfig,
  containerMode = false,
  gridInfo,
  alt = "Artwork",
  description,
  textColor = "#ffffff",
}) => {
  const matPercent = matConfig?.matWidth ?? 5;
  const matColor = matConfig?.matColor ?? "#000";
  const isNoMat = matColor === "#000";

  const [imgDims, setImgDims] = React.useState({ width: 1, height: 1 });
  const { width: screenWidth, height: screenHeight } = useScreenSize();

  const handleImgLoad = React.useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const img = e.target as HTMLImageElement;
      setImgDims({ width: img.naturalWidth, height: img.naturalHeight });
    },
    [],
  );

  const { width: frameW, height: frameH } = React.useMemo(
    () =>
      getFrameDimensions(containerMode, screenWidth, screenHeight, gridInfo),
    [containerMode, screenWidth, screenHeight, gridInfo],
  );

  const adjustedMatPercent = React.useMemo(
    () => (containerMode ? Math.min(matPercent, 10) : matPercent),
    [containerMode, matPercent],
  );

  const imgAspect = imgDims.width / imgDims.height;

  const { artworkWidth, artworkHeight, matHorizontal, matVertical } =
    React.useMemo(() => {
      if (isNoMat) {
        // When there's no mat, use full frame dimensions
        return {
          artworkWidth: frameW,
          artworkHeight: frameH,
          matHorizontal: 0,
          matVertical: 0,
        };
      }
      return calculateMatDimensions(
        frameW,
        frameH,
        imgAspect,
        adjustedMatPercent,
      );
    }, [frameW, frameH, imgAspect, adjustedMatPercent, isNoMat]);

  const containerStyle = React.useMemo(
    () => ({
      background: isNoMat ? "#000000" : matColor,
      width: containerMode ? `${frameW}px` : "100vw",
      height: containerMode ? `${frameH}px` : "100vh",
      maxWidth: containerMode ? `${frameW}px` : "100vw",
      maxHeight: containerMode ? `${frameH}px` : "100vh",
      border: "none",
      boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
      flexShrink: 0,
    }),
    [isNoMat, matColor, frameW, frameH, containerMode],
  );

  const matStyle = React.useMemo(
    () => ({
      top: 0,
      left: 0,
      width: containerMode ? `${frameW}px` : "100%",
      height: containerMode ? `${frameH}px` : "100%",
      background: matColor,
      boxSizing: "border-box" as const,
      boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
      zIndex: 2,
      border: "none",
    }),
    [frameW, frameH, matColor, containerMode],
  );

  const artworkStyle = React.useMemo(
    () => ({
      top: `${matVertical}px`,
      left: `${matHorizontal}px`,
      width: `${artworkWidth}px`,
      height: `${artworkHeight}px`,
      background: isNoMat ? "#000" : "#fff",
      boxShadow: !isNoMat ? "0 0 0 1px #ccc" : undefined,
      zIndex: 4,
    }),
    [matVertical, matHorizontal, artworkWidth, artworkHeight, isNoMat],
  );

  return (
    <div
      className="relative flex items-center justify-center"
      style={containerStyle}
    >
      {/* Outer mat */}
      {!isNoMat && (
        <div
          className="absolute rounded-xl"
          style={matStyle}
          aria-hidden="true"
        />
      )}

      {/* Artwork area */}
      <div
        className="absolute flex items-center justify-center rounded-xl overflow-hidden"
        style={artworkStyle}
      >
        <Image
          src={src}
          alt={alt}
          className="object-contain w-full h-full rounded"
          onLoad={handleImgLoad}
          style={{ maxWidth: "100%", maxHeight: "100%", border: "none" }}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={!containerMode} // Prioritize slideshow images
        />

        {/* Caption overlay */}
        {description?.trim() && (
          <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
            <div className="bg-black/25 backdrop-blur-sm">
              <p
                className={getCaptionStyles(containerMode, gridInfo)}
                style={{
                  textShadow: "1px 1px 2px rgba(0,0,0,0.8)",
                  color: textColor,
                }}
              >
                {description}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MatImage;
export type { MatImageProps, GridInfo };
// MatConfig is imported from @/shared/types/album
