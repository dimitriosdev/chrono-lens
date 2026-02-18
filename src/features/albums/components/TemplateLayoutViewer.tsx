/**
 * Template Layout Viewer
 * Displays the final template layout for viewing
 */
"use client";

import React from "react";
import Image from "next/image";
import { TemplateSlot } from "@/shared/types/album";

/**
 * Calculate scale factor from object-contain to object-cover.
 * At zoom=1 with this scale, the image fills the slot like object-cover.
 * At zoom<1, more of the image is revealed.
 */
function calcCoverScale(
  imgW: number,
  imgH: number,
  containerAspect: number,
): number {
  const imgAspect = imgW / imgH;
  if (Math.abs(imgAspect - containerAspect) < 0.01) return 1;
  return imgAspect > containerAspect
    ? imgAspect / containerAspect
    : containerAspect / imgAspect;
}

interface TemplateLayoutViewerProps {
  slots: TemplateSlot[];
  frameWidth?: number;
  frameColor?: string;
  matWidth?: number;
  matColor?: string;
  aspectRatio?: number; // Percentage for padding-top (e.g., 56.25 for 16:9)
  useAbsoluteSize?: boolean; // If true, uses h-full instead of padding-based aspect ratio
  fillContainer?: boolean; // If true, single image fills entire container with object-contain
  className?: string;
}

export function TemplateLayoutViewer({
  slots,
  frameWidth = 0,
  frameColor = "#1a1a1a",
  matWidth = 0,
  matColor = "#FFFFFF",
  aspectRatio = 56.25,
  useAbsoluteSize = false,
  fillContainer = false,
  className = "",
}: TemplateLayoutViewerProps) {
  // Track natural image dimensions for proper zoom behavior
  const [imageDims, setImageDims] = React.useState<
    Record<string, { w: number; h: number }>
  >({});

  const handleImageLoad = React.useCallback(
    (slotId: string, e: React.SyntheticEvent<HTMLImageElement>) => {
      const img = e.currentTarget;
      setImageDims((prev) => ({
        ...prev,
        [slotId]: { w: img.naturalWidth, h: img.naturalHeight },
      }));
    },
    [],
  );

  // For single photo filling container
  if (fillContainer && slots.length === 1 && slots[0].imageId) {
    const slot = slots[0];
    const position = slot.position || { x: 0, y: 0, zoom: 1 };

    // Derive the photo's aspect ratio from slot dimensions (slot lives in a 16:9 wall)
    // e.g. portrait slot: width=25.3, height=80 → slotAspect = (25.3/80)*(16/9) ≈ 0.56 (9:16)
    const slotAspect = (slot.width / slot.height) * (16 / 9);
    const isPortrait = slotAspect < 1;

    const dims = imageDims[slot.id];
    const coverScale = dims ? calcCoverScale(dims.w, dims.h, slotAspect) : 1;

    return (
      <div
        className={`relative flex h-full w-full items-center justify-center ${className}`}
      >
        {/* For portrait photos, constrain to correct aspect ratio so object-cover + zoom/pan work correctly */}
        <div
          className="relative overflow-hidden"
          style={
            isPortrait
              ? { height: "100%", aspectRatio: String(slotAspect) }
              : { height: "100%", width: "100%" }
          }
        >
          {/* Mat layer */}
          <div
            className="relative h-full w-full overflow-hidden"
            style={{
              padding: matWidth > 0 ? `${matWidth * 0.5}%` : 0,
              backgroundColor: matColor,
            }}
          >
            {/* Frame layer */}
            <div
              className="relative h-full w-full overflow-hidden"
              style={{
                borderWidth: frameWidth > 0 ? `${frameWidth}px` : 0,
                borderColor: frameColor,
                borderStyle: frameWidth > 0 ? "solid" : "none",
              }}
            >
              {/* Image with zoom/pan — object-contain + coverScale fills the correctly-shaped container */}
              <div
                className="relative h-full w-full"
                style={{
                  transform: `translate(${position.x}%, ${position.y}%) scale(${coverScale * position.zoom})`,
                  transformOrigin: "center center",
                }}
              >
                <Image
                  src={slot.imageId!}
                  alt="Photo"
                  fill
                  className={dims ? "object-contain" : "object-cover"}
                  onLoad={(e) => handleImageLoad(slot.id, e)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative w-full ${useAbsoluteSize ? "h-full" : ""} ${className}`}
      style={useAbsoluteSize ? undefined : { paddingTop: `${aspectRatio}%` }}
    >
      <div className="absolute inset-0">
        {slots.map((slot) => {
          if (!slot.imageId) return null;

          const position = slot.position || { x: 0, y: 0, zoom: 1 };
          const slotAspect = (slot.width / slot.height) * (16 / 9);
          const dims = imageDims[slot.id];
          const coverScale = dims
            ? calcCoverScale(dims.w, dims.h, slotAspect)
            : 1;

          return (
            <div
              key={slot.id}
              className="absolute"
              style={{
                left: `${slot.x}%`,
                top: `${slot.y}%`,
                width: `${slot.width}%`,
                height: `${slot.height}%`,
              }}
            >
              {/* Mat */}
              <div
                className="relative h-full w-full overflow-hidden bg-white shadow-lg"
                style={{
                  padding: `${matWidth}%`,
                  backgroundColor: matColor,
                }}
              >
                {/* Frame Border */}
                <div
                  className="relative h-full w-full overflow-hidden"
                  style={{
                    borderWidth: `${frameWidth}px`,
                    borderColor: frameColor,
                    borderStyle: "solid",
                  }}
                >
                  <div
                    className="absolute inset-0"
                    style={{
                      transform: `translate(${position.x}%, ${position.y}%) scale(${coverScale * position.zoom})`,
                      transformOrigin: "center center",
                    }}
                  >
                    <Image
                      src={slot.imageId}
                      alt={`Photo ${slot.id}`}
                      fill
                      className={dims ? "object-contain" : "object-cover"}
                      onLoad={(e) => handleImageLoad(slot.id, e)}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
