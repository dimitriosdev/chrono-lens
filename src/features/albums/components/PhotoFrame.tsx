"use client";

import React from "react";
import Image from "next/image";
import { PhotoWallItem } from "@/shared/types/album";
import {
  getFrameStyle,
  getFrameShadow,
  getFrameCornerRadius,
  getFrameBorderStyle,
} from "@/features/albums/constants/FrameStyles";

export interface PhotoFrameProps {
  src: string;
  alt: string;
  item: PhotoWallItem;
  matColor?: string;
  textColor?: string;
  description?: string;
}

/**
 * PhotoFrame - Renders a single photo with customizable frame and mat
 * Used in wall layouts to display photos with various frame styles
 */
export default function PhotoFrame({
  src,
  alt,
  item,
  matColor = "#ffffff",
  textColor = "#333333",
  description,
}: PhotoFrameProps) {
  const frameStyle = getFrameStyle(item.frameStyle);
  const matWidth = item.matWidth || 15; // Default 15px mat
  const finalMatColor = item.matColor || matColor;

  // Calculate styles
  const shadow = getFrameShadow(frameStyle.shadowIntensity);
  const borderRadius = getFrameCornerRadius(
    frameStyle.cornerStyle,
    frameStyle.borderWidth,
  );
  const rotation = item.rotation || 0;
  const frameBorderStyle = getFrameBorderStyle(frameStyle);

  // Check if using border-image technique
  const useBorderImage = frameStyle.imageUrl && frameBorderStyle.borderImage;

  return (
    <div
      className="absolute"
      style={{
        left: `${item.x}%`,
        top: `${item.y}%`,
        width: `${item.width}%`,
        height: `${item.height}%`,
        transform: `rotate(${rotation}deg)`,
        zIndex: item.zIndex || 1,
      }}
    >
      {/* Outer shadow container */}
      <div
        className="relative w-full h-full"
        style={{
          boxShadow: shadow,
        }}
      >
        {useBorderImage ? (
          /* Border-image approach for SVG frames */
          <div
            className="relative w-full h-full"
            style={{
              ...frameBorderStyle,
            }}
          >
            {/* Mat */}
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{
                margin: `${frameStyle.borderWidth}px`,
                backgroundColor: finalMatColor,
                padding: `${matWidth}px`,
                boxShadow: "inset 0 0 0 1px rgba(0, 0, 0, 0.03)",
              }}
            >
              {/* Image */}
              <div className="relative w-full h-full overflow-hidden">
                <Image
                  src={src}
                  alt={alt}
                  fill
                  className="object-cover"
                  sizes={`${item.width}vw`}
                  priority={item.zIndex !== undefined && item.zIndex > 1}
                />
              </div>

              {/* Optional description overlay */}
              {description && (
                <div
                  className="absolute bottom-0 left-0 right-0 p-2 text-xs text-center"
                  style={{
                    color: textColor,
                    backgroundColor: `${finalMatColor}dd`,
                  }}
                >
                  <p className="line-clamp-2">{description}</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Padding approach for gradient/solid frames */
          <div
            className="relative w-full h-full"
            style={{
              ...frameBorderStyle,
              padding: `${frameStyle.borderWidth}px`,
              borderRadius,
            }}
          >
            {/* Mat */}
            <div
              className="relative w-full h-full"
              style={{
                backgroundColor: finalMatColor,
                padding: `${matWidth}px`,
                boxShadow: "inset 0 0 0 1px rgba(0, 0, 0, 0.03)",
              }}
            >
              {/* Image */}
              <div className="relative w-full h-full overflow-hidden">
                <Image
                  src={src}
                  alt={alt}
                  fill
                  className="object-cover"
                  sizes={`${item.width}vw`}
                  priority={item.zIndex !== undefined && item.zIndex > 1}
                />
              </div>

              {/* Optional description overlay */}
              {description && (
                <div
                  className="absolute bottom-0 left-0 right-0 p-2 text-xs text-center"
                  style={{
                    color: textColor,
                    backgroundColor: `${finalMatColor}dd`,
                  }}
                >
                  <p className="line-clamp-2">{description}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
