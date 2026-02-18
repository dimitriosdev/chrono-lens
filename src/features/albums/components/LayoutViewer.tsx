"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Album } from "@/shared/types/album";
import { AlbumLayout } from "@/features/albums/constants/AlbumLayout";
import MatImage from "./MatImage";
import { WallLayoutViewer } from "./WallLayoutViewer";
import { TemplateLayoutViewer } from "./TemplateLayoutViewer";

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
}: LayoutViewerProps) {
  const images = album.images || [];
  const totalImages = images.length;
  const pages = album.pages || [];
  const cycleDuration = album.cycleDuration || 10;

  // Multi-page slideshow state
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-advance pages for multi-page slideshow
  useEffect(() => {
    if (pages.length <= 1 || !isAutoPlaying) return;

    const timer = setInterval(() => {
      setCurrentPageIndex((prev) => (prev + 1) % pages.length);
    }, cycleDuration * 1000);

    return () => clearInterval(timer);
  }, [pages.length, cycleDuration, isAutoPlaying]);

  // Navigation handlers for multi-page slideshow
  const goToNextPage = useCallback(() => {
    setCurrentPageIndex((prev) => (prev + 1) % pages.length);
  }, [pages.length]);

  const goToPrevPage = useCallback(() => {
    setCurrentPageIndex((prev) => (prev - 1 + pages.length) % pages.length);
  }, [pages.length]);

  // Use provided navigation handlers or create default ones
  const goToNext = onNext || (() => {});
  const goToPrevious = onPrevious || (() => {});

  // Multi-page slideshow layout
  if (pages.length > 0) {
    const currentPage = pages[currentPageIndex];
    const isSinglePhoto = currentPage.photoCount === 1;

    return (
      <div
        className="fixed inset-0 flex items-center justify-center"
        style={{ backgroundColor }}
        onClick={() => setIsAutoPlaying(!isAutoPlaying)}
      >
        {/* Current page template */}
        <div className="relative flex h-full w-full items-center justify-center">
          {isSinglePhoto ? (
            /* Single photo - fill entire screen */
            <div className="relative h-full w-full p-2">
              <TemplateLayoutViewer
                slots={currentPage.slots}
                frameWidth={currentPage.frameWidth}
                frameColor={currentPage.frameColor}
                matWidth={currentPage.matWidth}
                matColor={currentPage.matColor}
                useAbsoluteSize
                fillContainer
              />
            </div>
          ) : (
            /* Multiple photos - maintain 16:9 aspect ratio */
            <div
              className="relative"
              style={{
                width: "min(100vw, calc(100vh * 16 / 9))",
                height: "min(100vh, calc(100vw * 9 / 16))",
              }}
            >
              <TemplateLayoutViewer
                slots={currentPage.slots}
                frameWidth={currentPage.frameWidth}
                frameColor={currentPage.frameColor}
                matWidth={currentPage.matWidth}
                matColor={currentPage.matColor}
                useAbsoluteSize
              />
            </div>
          )}
        </div>

        {/* Navigation areas for manual control */}
        {pages.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToPrevPage();
              }}
              className="absolute left-0 top-0 bottom-0 w-1/4 cursor-pointer bg-transparent z-20"
              aria-label="Previous page"
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToNextPage();
              }}
              className="absolute right-0 top-0 bottom-0 w-1/4 cursor-pointer bg-transparent z-20"
              aria-label="Next page"
            />
          </>
        )}

        {/* Page indicator */}
        {pages.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-30">
            <div className="flex gap-1.5 rounded-full bg-black/30 px-3 py-2 backdrop-blur-sm">
              {pages.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentPageIndex(idx);
                  }}
                  className={`h-2 w-2 rounded-full transition-all ${
                    idx === currentPageIndex
                      ? "bg-white scale-125"
                      : "bg-white/50 hover:bg-white/75"
                  }`}
                  aria-label={`Go to page ${idx + 1}`}
                />
              ))}
            </div>
            {/* Play/pause indicator */}
            <div className="rounded-full bg-black/30 px-2 py-1 text-xs text-white/70 backdrop-blur-sm">
              {isAutoPlaying ? `${cycleDuration}s` : "Paused"}
            </div>
          </div>
        )}

        {/* Album title */}
        {showTitle && (
          <div
            className="absolute bottom-16 left-1/2 -translate-x-1/2 text-center z-10"
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
            matConfig={{ matWidth: 5, matColor }}
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

  // Wall Layout
  if (layout.type === "wall" && layout.wall) {
    return (
      <WallLayoutViewer
        album={album}
        wallItems={layout.wall.items}
        backgroundColor={backgroundColor}
        matColor={matColor}
        textColor={textColor}
        showTitle={showTitle}
      />
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
              matConfig={{ matWidth: 3, matColor }}
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

  // Template Layout (legacy single-page)
  if (layout.type === "template" && layout.template) {
    return (
      <div
        className="fixed inset-0 flex items-center justify-center p-4"
        style={{ backgroundColor }}
      >
        <div className="w-full max-w-6xl">
          <TemplateLayoutViewer
            slots={layout.template.slots}
            frameWidth={0}
            frameColor="#1a1a1a"
            matWidth={album.matConfig?.matWidth || 0}
            matColor={album.matConfig?.matColor || matColor}
          />
        </div>

        {/* Album title */}
        {showTitle && (
          <div
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center z-10"
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
