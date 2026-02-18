"use client";

import React from "react";
import { Album, PhotoWallItem } from "@/shared/types/album";
import PhotoFrame from "./PhotoFrame";

export interface WallLayoutViewerProps {
  album: Album;
  wallItems: PhotoWallItem[];
  backgroundColor: string;
  matColor: string;
  textColor?: string;
  showTitle?: boolean;
}

/**
 * WallLayoutViewer - Renders a complete photo wall layout
 * Displays multiple photos arranged in a preset gallery-style layout
 */
export function WallLayoutViewer({
  album,
  wallItems,
  backgroundColor,
  matColor,
  textColor = "#333333",
  showTitle = true,
}: WallLayoutViewerProps) {
  const images = album.images || [];

  if (images.length === 0) {
    return (
      <div
        className="fixed inset-0 flex items-center justify-center"
        style={{ backgroundColor }}
      >
        <div style={{ color: textColor }} className="text-center">
          <p className="text-lg">No images in this album</p>
        </div>
      </div>
    );
  }

  // Filter items to only those with valid image indices
  const validItems = wallItems.filter(
    (item) => item.imageIndex >= 0 && item.imageIndex < images.length,
  );

  if (validItems.length === 0) {
    return (
      <div
        className="fixed inset-0 flex items-center justify-center"
        style={{ backgroundColor }}
      >
        <div style={{ color: textColor }} className="text-center">
          <p className="text-lg">Invalid wall layout configuration</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 overflow-hidden" style={{ backgroundColor }}>
      {/* Wall container with relative positioning for absolute photo frames */}
      <div className="relative w-full h-full">
        {validItems.map((item, index) => {
          const image = images[item.imageIndex];
          return (
            <PhotoFrame
              key={`wall-photo-${index}-${item.imageIndex}`}
              src={image.url}
              alt={`${album.title} - Photo ${item.imageIndex + 1}`}
              item={item}
              matColor={matColor}
              textColor={textColor}
              description={image.description}
            />
          );
        })}
      </div>

      {/* Album title overlay */}
      {showTitle && (
        <div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center z-50 px-4"
          style={{ color: textColor }}
        >
          <h1 className="text-2xl font-bold tracking-wide drop-shadow-lg">
            {album.title}
          </h1>
          {album.description && (
            <p className="text-sm mt-2 opacity-80 drop-shadow-md">
              {album.description}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
