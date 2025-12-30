/**
 * Album Preview Component
 * Live preview of album layout and styling
 */
"use client";

import React from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { AlbumLayout } from "@/features/albums/constants/AlbumLayout";

interface PreviewImage {
  id: string;
  url: string;
  thumbnailUrl?: string;
  description?: string;
}

interface AlbumPreviewProps {
  images: PreviewImage[];
  layout: AlbumLayout;
  customization: {
    backgroundColor: string;
    textColor: string;
    matColor?: string;
  };
  title: string;
  previewIndex: number;
  onPreviewIndexChange: (index: number) => void;
}

export const AlbumPreview: React.FC<AlbumPreviewProps> = ({
  images,
  layout,
  customization,
  title,
  previewIndex,
  onPreviewIndexChange,
}) => {
  if (images.length === 0) return null;

  const handlePrevImage = () => {
    onPreviewIndexChange((previewIndex - 1 + images.length) % images.length);
  };

  const handleNextImage = () => {
    onPreviewIndexChange((previewIndex + 1) % images.length);
  };

  return (
    <div className="rounded-xl overflow-hidden shadow-lg">
      {/* Preview Container */}
      <div
        className="relative"
        style={{
          backgroundColor: customization.backgroundColor,
          minHeight: "200px",
          height: "min(50vh, 320px)",
        }}
      >
        {/* Slideshow Layout Preview */}
        {layout.type === "slideshow" && (
          <SlideshowPreview
            images={images}
            customization={customization}
            previewIndex={previewIndex}
            onPrev={handlePrevImage}
            onNext={handleNextImage}
          />
        )}

        {/* Grid Layout Preview */}
        {layout.type === "grid" && (
          <GridPreview images={images} customization={customization} />
        )}

        {/* Album Title */}
        <div
          className="absolute bottom-2 left-1/2 -translate-x-1/2 text-center z-10"
          style={{ color: customization.textColor }}
        >
          <h2 className="text-sm font-semibold drop-shadow-lg px-3 py-1 rounded-full bg-black/20 backdrop-blur-sm">
            {title || "Album Title"}
          </h2>
        </div>
      </div>

      {/* Thumbnail Strip - Only for slideshow */}
      {layout.type === "slideshow" && images.length > 1 && (
        <ThumbnailStrip
          images={images}
          previewIndex={previewIndex}
          onSelect={onPreviewIndexChange}
        />
      )}
    </div>
  );
};

// Slideshow preview sub-component
interface SlideshowPreviewProps {
  images: PreviewImage[];
  customization: { matColor?: string };
  previewIndex: number;
  onPrev: () => void;
  onNext: () => void;
}

const SlideshowPreview: React.FC<SlideshowPreviewProps> = ({
  images,
  customization,
  previewIndex,
  onPrev,
  onNext,
}) => (
  <>
    {/* Current Image with Mat */}
    <div className="absolute inset-0 flex items-center justify-center p-3">
      <div
        className="relative flex items-center justify-center rounded-lg shadow-2xl max-w-[85%] max-h-[85%]"
        style={{
          backgroundColor: customization.matColor || "#000000",
          padding: "6px",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={images[previewIndex]?.thumbnailUrl || images[previewIndex]?.url}
          alt={images[previewIndex]?.description || "Preview"}
          className="max-w-full max-h-[calc(min(50vh,320px)-80px)] object-contain rounded"
          style={{ display: "block" }}
        />
      </div>
    </div>

    {/* Navigation Arrows */}
    {images.length > 1 && (
      <>
        <button
          onClick={onPrev}
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-1.5 rounded-full transition-colors"
          aria-label="Previous image"
        >
          <ChevronLeftIcon className="w-4 h-4" />
        </button>
        <button
          onClick={onNext}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-1.5 rounded-full transition-colors"
          aria-label="Next image"
        >
          <ChevronRightIcon className="w-4 h-4" />
        </button>
      </>
    )}

    {/* Image counter badge */}
    {images.length > 1 && (
      <div className="absolute top-2 right-2 bg-black/40 text-white text-xs px-2 py-0.5 rounded-full backdrop-blur-sm">
        {previewIndex + 1} / {images.length}
      </div>
    )}
  </>
);

// Grid preview sub-component
interface GridPreviewProps {
  images: PreviewImage[];
  customization: { matColor?: string };
}

const GridPreview: React.FC<GridPreviewProps> = ({ images, customization }) => {
  const getGridClass = () => {
    if (images.length === 1) return "grid-cols-1";
    if (images.length === 2) return "grid-cols-2";
    if (images.length <= 4) return "grid-cols-2 grid-rows-2";
    return "grid-cols-3 grid-rows-2";
  };

  return (
    <div className="absolute inset-0 p-3 overflow-hidden">
      <div className={`grid gap-1.5 h-full ${getGridClass()}`}>
        {images.slice(0, 6).map((image, index) => (
          <div
            key={image.id}
            className="relative rounded-lg overflow-hidden"
            style={{
              backgroundColor: customization.matColor || "#000000",
              padding: "3px",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image.thumbnailUrl || image.url}
              alt={image.description || `Image ${index + 1}`}
              className="w-full h-full object-cover rounded"
            />
            {/* Show "+X more" on the last visible image if there are more */}
            {index === 5 && images.length > 6 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded">
                <span className="text-white font-semibold text-lg">
                  +{images.length - 6}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Thumbnail strip sub-component
interface ThumbnailStripProps {
  images: PreviewImage[];
  previewIndex: number;
  onSelect: (index: number) => void;
}

const ThumbnailStrip: React.FC<ThumbnailStripProps> = ({
  images,
  previewIndex,
  onSelect,
}) => (
  <div className="flex gap-1 overflow-x-auto p-2 bg-neutral-100 dark:bg-neutral-800">
    {images.map((image, index) => (
      <button
        key={image.id}
        onClick={() => onSelect(index)}
        className={`flex-shrink-0 w-10 h-10 rounded overflow-hidden border-2 transition-all ${
          index === previewIndex
            ? "border-blue-500"
            : "border-transparent opacity-50 hover:opacity-100"
        }`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image.thumbnailUrl || image.url}
          alt=""
          className="w-full h-full object-cover"
        />
      </button>
    ))}
  </div>
);

export default AlbumPreview;
