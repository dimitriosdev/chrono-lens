"use client";

import React from "react";
import { Album } from "@/shared/types/album";
import { AlbumLayout } from "@/features/albums/constants/AlbumLayout";
import { FrameAssembly } from "@/shared/types/frameTextures";
import MatImage from "./MatImage";

interface LayoutViewerProps {
  album: Album;
  layout: AlbumLayout;
  backgroundColor: string;
  matColor: string;
  textColor?: string;
  showTitle: boolean;
  currentIndex?: number;
  onNext?: () => void;
  onPrevious?: () => void;
  frameAssembly?: FrameAssembly; // Advanced frame texture system
}

export function LayoutViewer({
  album,
  layout,
  backgroundColor,
  matColor,
  textColor = "#ffffff",
  showTitle,
  currentIndex = 0,
  onNext,
  onPrevious,
  frameAssembly,
}: LayoutViewerProps) {
  const images = album.images || [];
  const totalImages = images.length;

  // Use provided navigation handlers or create default ones
  const goToNext = onNext || (() => {});
  const goToPrevious = onPrevious || (() => {});

  if (totalImages === 0) {
    return (
      <div
        className="fixed inset-0 flex items-center justify-center"
        style={{ backgroundColor }}
      >
        <div className="text-white text-center">
          <p className="text-lg">No images in this album</p>
        </div>
      </div>
    );
  }

  // Slideshow Layout
  if (layout.type === "slideshow") {
    const currentImage = images[currentIndex];

    return (
      <div
        className="fixed inset-0 flex flex-col items-center justify-center"
        style={{ backgroundColor }}
      >
        {/* Main image - covers all available space */}
        <div className="absolute inset-0 flex items-center justify-center">
          <MatImage
            src={currentImage.url}
            matConfig={
              frameAssembly
                ? {
                    matWidth: 5,
                    matColor,
                    frameAssembly,
                    useAdvancedFraming: true,
                  }
                : { matWidth: 5, matColor }
            }
            containerMode={false}
            description={currentImage.description}
            alt={`${album.title} - Image ${currentIndex + 1}`}
            textColor={textColor}
          />
        </div>

        {/* Invisible navigation areas */}
        {totalImages > 1 && (
          <>
            {/* Left click area for previous */}
            <button
              onClick={goToPrevious}
              className="absolute left-0 top-0 bottom-0 w-1/3 bg-transparent cursor-pointer z-20"
              aria-label="Previous image"
              style={{ background: "transparent" }}
            />

            {/* Right click area for next */}
            <button
              onClick={goToNext}
              className="absolute right-0 top-0 bottom-0 w-1/3 bg-transparent cursor-pointer z-20"
              aria-label="Next image"
              style={{ background: "transparent" }}
            />
          </>
        )}

        {/* Album title */}
        {showTitle && (
          <div
            className="absolute bottom-16 left-1/2 transform -translate-x-1/2 text-center z-10"
            style={{ color: textColor }}
          >
            <h1 className="text-xl font-bold tracking-wide drop-shadow-lg">
              {album.title}
            </h1>
          </div>
        )}
      </div>
    );
  }

  // Grid Layout
  if (layout.type === "grid" && layout.grid) {
    const { rows, cols } = layout.grid;
    const gridSize = rows * cols;

    // Show images starting from current index, cycling through if needed
    const displayImages = Array.from({ length: gridSize }, (_, i) => {
      const imageIndex = (currentIndex + i) % totalImages;
      return images[imageIndex];
    });

    return (
      <div
        className="fixed inset-0 flex items-center justify-center p-4"
        style={{ backgroundColor }}
      >
        {/* Grid container */}
        <div
          className="grid gap-4 place-items-center"
          style={{
            gridTemplateRows: `repeat(${rows}, 1fr)`,
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            width: "90vw",
            height: "85vh",
          }}
        >
          {displayImages.map((image, index) => (
            <MatImage
              key={`${currentIndex}-${index}`}
              src={image.url}
              matConfig={
                frameAssembly
                  ? {
                      matWidth: 3,
                      matColor,
                      frameAssembly,
                      useAdvancedFraming: true,
                    }
                  : { matWidth: 3, matColor }
              }
              containerMode={true}
              gridInfo={{ rows, cols }}
              description={image.description}
              alt={`${album.title} - Image ${
                ((currentIndex + index) % totalImages) + 1
              }`}
              textColor={textColor}
            />
          ))}
        </div>

        {/* Controls for cycling through images if more images than grid slots */}
        {totalImages > gridSize && (
          <>
            {/* Left invisible click area for previous */}
            <button
              onClick={goToPrevious}
              className="absolute left-0 top-0 bottom-0 w-1/4 bg-transparent cursor-pointer z-20"
              aria-label="Previous set of images"
              style={{ background: "transparent" }}
            />

            {/* Right invisible click area for next */}
            <button
              onClick={goToNext}
              className="absolute right-0 top-0 bottom-0 w-1/4 bg-transparent cursor-pointer z-20"
              aria-label="Next set of images"
              style={{ background: "transparent" }}
            />

            <div
              className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-sm z-10"
              style={{ color: textColor }}
            >
              Showing {Math.min(gridSize, totalImages)} of {totalImages} images
            </div>
          </>
        )}

        {/* Album title */}
        {showTitle && (
          <div
            className="absolute bottom-16 left-1/2 transform -translate-x-1/2 text-center z-10"
            style={{ color: textColor }}
          >
            <h1 className="text-xl font-bold tracking-wide drop-shadow-lg">
              {album.title}
            </h1>
          </div>
        )}
      </div>
    );
  }

  return null;
}
