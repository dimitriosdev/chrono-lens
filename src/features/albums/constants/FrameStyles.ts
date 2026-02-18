import { FrameStyle } from "@/shared/types/album";
import React from "react";

/**
 * Predefined frame styles for photo wall layouts
 * Each style defines the visual appearance of the frame border
 * Designed to look realistic with wood grain textures and proper depth
 */
export const FRAME_STYLES: Record<string, FrameStyle> = {
  modern: {
    id: "modern",
    name: "Black Gallery",
    borderWidth: 20,
    borderColor: "#1a1a1a",
    shadowIntensity: "medium",
    cornerStyle: "sharp",
    imageUrl: "/frames/black-studio-frame.png",
    borderImageSlice: 20,
  },
  minimalist: {
    id: "minimalist",
    name: "White Gallery",
    borderWidth: 20,
    borderColor: "#ffffff",
    shadowIntensity: "light",
    cornerStyle: "sharp",
    imageUrl: "/frames/white-frame.png",
    borderImageSlice: 20,
  },
};

/**
 * Get frame style by ID
 */
export function getFrameStyle(id: string): FrameStyle {
  return FRAME_STYLES[id] || FRAME_STYLES.modern;
}

/**
 * Get all available frame styles as an array
 */
export function getAllFrameStyles(): FrameStyle[] {
  return Object.values(FRAME_STYLES);
}

/**
 * Generate realistic CSS shadow based on intensity
 * Includes multiple layers for depth
 */
export function getFrameShadow(
  intensity: FrameStyle["shadowIntensity"],
): string {
  switch (intensity) {
    case "none":
      return "none";
    case "light":
      return "0 2px 4px rgba(0, 0, 0, 0.1), 0 4px 8px rgba(0, 0, 0, 0.05)";
    case "medium":
      return "0 4px 8px rgba(0, 0, 0, 0.15), 0 8px 16px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.2)";
    case "heavy":
      return "0 8px 16px rgba(0, 0, 0, 0.2), 0 12px 32px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.25)";
    default:
      return "none";
  }
}

/**
 * Generate CSS border radius based on corner style
 */
export function getFrameCornerRadius(
  cornerStyle: FrameStyle["cornerStyle"],
  borderWidth: number,
): string {
  switch (cornerStyle) {
    case "sharp":
      return "0";
    case "rounded":
      return `${borderWidth / 2}px`;
    case "beveled":
      return `${borderWidth / 4}px`;
    default:
      return "0";
  }
}

/**
 * Get frame border style with realistic textures
 */
export function getFrameBorderStyle(
  frameStyle: FrameStyle,
): React.CSSProperties {
  const baseStyle: React.CSSProperties = {
    position: "relative",
  };

  // If frame has an image, use border-image for photorealistic frames
  if (frameStyle.imageUrl && frameStyle.borderImageSlice) {
    return {
      ...baseStyle,
      borderStyle: "solid",
      borderWidth: `${frameStyle.borderWidth}px`,
      borderImage: `url(${frameStyle.imageUrl}) ${frameStyle.borderImageSlice} fill stretch`,
    };
  }

  // Fallback styles
  if (frameStyle.id === "modern") {
    return {
      ...baseStyle,
      background: "#1a1a1a",
      boxShadow: `
        inset 0 0 0 1px rgba(0, 0, 0, 0.3),
        inset 2px 2px 4px rgba(0, 0, 0, 0.4)
      `,
    };
  }

  if (frameStyle.id === "minimalist") {
    return {
      ...baseStyle,
      background: "#ffffff",
      boxShadow: `
        inset 0 0 0 1px rgba(0, 0, 0, 0.08),
        inset 2px 2px 3px rgba(0, 0, 0, 0.06)
      `,
    };
  }

  return baseStyle;
}
