"use client";

import React from "react";
import Image from "next/image";
import {
  getContainerClasses,
  calculateContainerDimensions,
} from "@/shared/utils/containerQueries";
import type { MatConfig, GridInfo } from "./MatImage";

interface ResponsiveMatImageProps {
  src: string;
  matConfig: MatConfig;
  containerMode?: boolean;
  gridInfo?: GridInfo;
  alt?: string;
  className?: string;
}

// Hook for container size observation
function useContainerSize(ref: React.RefObject<HTMLDivElement | null>) {
  const [size, setSize] = React.useState({ width: 0, height: 0 });

  React.useEffect(() => {
    if (!ref.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setSize({ width, height });
      }
    });

    resizeObserver.observe(ref.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [ref]);

  return size;
}

const ResponsiveMatImage: React.FC<ResponsiveMatImageProps> = ({
  src,
  matConfig,
  containerMode = false,
  gridInfo,
  alt = "Artwork",
  className = "",
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const containerSize = useContainerSize(containerRef);
  const [imgDims, setImgDims] = React.useState({ width: 1, height: 1 });

  const matPercent = matConfig?.matWidth ?? 5;
  const matColor = matConfig?.matColor ?? "#000";
  const isNoMat = matColor === "#000";

  // Determine layout type for container queries
  const layoutType = React.useMemo(() => {
    if (!containerMode) return "slideshow";
    if (!gridInfo) return "grid";

    const { rows, cols } = gridInfo;
    if (rows === 1 && cols >= 6) return "singleRow";
    if (cols === 1 && rows >= 6) return "columnStack";
    return "grid";
  }, [containerMode, gridInfo]);

  // Get container query classes
  const containerClasses = getContainerClasses(layoutType);

  // Calculate dimensions using container size
  const dimensions = React.useMemo(() => {
    if (!containerMode || !gridInfo || !containerSize.width) {
      return {
        type: "slideshow" as const,
        width: containerSize.width || 400,
        height: containerSize.height || 600,
      };
    }

    const gridDims = calculateContainerDimensions(
      containerSize.width,
      containerSize.height,
      gridInfo.rows,
      gridInfo.cols
    );

    return {
      type: "grid" as const,
      ...gridDims,
    };
  }, [containerMode, gridInfo, containerSize]);

  const handleImgLoad = React.useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const img = e.target as HTMLImageElement;
      setImgDims({ width: img.naturalWidth, height: img.naturalHeight });
    },
    []
  );

  // Calculate mat dimensions
  const { frameW, frameH } = React.useMemo(() => {
    if (containerMode && gridInfo) {
      return {
        frameW: dimensions.type === "grid" ? dimensions.cellWidth : 300,
        frameH: dimensions.type === "grid" ? dimensions.cellHeight : 300,
      };
    }
    return {
      frameW: dimensions.type === "slideshow" ? dimensions.width : 300,
      frameH: dimensions.type === "slideshow" ? dimensions.height : 300,
    };
  }, [containerMode, gridInfo, dimensions]);

  const adjustedMatPercent = containerMode
    ? Math.min(matPercent, 10)
    : matPercent;
  const imgAspect = imgDims.width / imgDims.height;

  const matDimensions = React.useMemo(() => {
    const artworkArea =
      Math.min(frameW, frameH) * (1 - adjustedMatPercent / 100);
    let artworkWidth = artworkArea;
    let artworkHeight = artworkArea;

    if (frameW / frameH > imgAspect) {
      artworkHeight = frameH * (1 - adjustedMatPercent / 100);
      artworkWidth = artworkHeight * imgAspect;
    } else {
      artworkWidth = frameW * (1 - adjustedMatPercent / 100);
      artworkHeight = artworkWidth / imgAspect;
    }

    return {
      artworkWidth,
      artworkHeight,
      matHorizontal: (frameW - artworkWidth) / 2,
      matVertical: (frameH - artworkHeight) / 2,
    };
  }, [frameW, frameH, imgAspect, adjustedMatPercent]);

  const containerStyle = React.useMemo(
    () => ({
      background: isNoMat ? "#374151" : matColor,
      width: containerMode ? `${frameW}px` : "100%",
      height: containerMode ? `${frameH}px` : "100%",
      minWidth: containerMode ? "120px" : undefined,
      minHeight: containerMode ? "120px" : undefined,
    }),
    [isNoMat, matColor, frameW, frameH, containerMode]
  );

  return (
    <div
      ref={containerRef}
      className={`
        relative flex items-center justify-center rounded-xl
        ${containerClasses}
        ${className}
      `.trim()}
      style={containerStyle}
    >
      {/* Outer mat (skip if No Mat) */}
      {!isNoMat && (
        <div
          className="absolute inset-0 rounded-xl"
          style={{ background: matColor, zIndex: 2 }}
          aria-hidden="true"
        />
      )}

      {/* Artwork area */}
      <div
        className="absolute flex items-center justify-center rounded-xl overflow-hidden"
        style={{
          top: `${matDimensions.matVertical}px`,
          left: `${matDimensions.matHorizontal}px`,
          width: `${matDimensions.artworkWidth}px`,
          height: `${matDimensions.artworkHeight}px`,
          background: isNoMat ? "#000" : "#fff",
          boxShadow: !isNoMat ? "0 0 0 1px #ccc" : undefined,
          zIndex: 4,
        }}
      >
        <Image
          src={src}
          alt={alt}
          className="object-contain w-full h-full"
          onLoad={handleImgLoad}
          fill
          sizes={
            containerMode
              ? "(max-width: 768px) 50vw, 33vw"
              : "(max-width: 768px) 100vw, 100vw"
          }
          priority={!containerMode} // Prioritize slideshow images
        />
      </div>
    </div>
  );
};

export default ResponsiveMatImage;
export type { ResponsiveMatImageProps };
