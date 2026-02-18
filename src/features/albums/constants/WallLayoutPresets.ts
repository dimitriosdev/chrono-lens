import { WallLayoutPreset } from "@/shared/types/album";

/**
 * Triple Row - Three square photos in horizontal layout
 * Black frame with white mat
 */
const TRIPLE_ROW_PRESET: WallLayoutPreset = {
  id: "triple-row",
  name: "Triple Row",
  description: "Three square photos in a horizontal row with black frames",
  minImages: 3,
  maxImages: 3,
  items: [
    {
      x: 8,
      y: 25,
      width: 24,
      height: 50,
      frameStyle: "modern",
      matWidth: 8,
      matColor: "#FFFFFF",
      zIndex: 1,
    },
    {
      x: 38,
      y: 25,
      width: 24,
      height: 50,
      frameStyle: "modern",
      matWidth: 8,
      matColor: "#FFFFFF",
      zIndex: 1,
    },
    {
      x: 68,
      y: 25,
      width: 24,
      height: 50,
      frameStyle: "modern",
      matWidth: 8,
      matColor: "#FFFFFF",
      zIndex: 1,
    },
  ],
};

/**
 * Quad Grid - Four photos in 2x2 grid layout
 * White frame with white mat
 */
const QUAD_GRID_PRESET: WallLayoutPreset = {
  id: "quad-grid",
  name: "Quad Grid",
  description: "Four photos in a 2x2 grid with white frames",
  minImages: 4,
  maxImages: 4,
  items: [
    {
      x: 10,
      y: 15,
      width: 35,
      height: 30,
      frameStyle: "minimalist",
      matWidth: 8,
      matColor: "#FFFFFF",
      zIndex: 1,
    },
    {
      x: 55,
      y: 15,
      width: 35,
      height: 30,
      frameStyle: "minimalist",
      matWidth: 8,
      matColor: "#FFFFFF",
      zIndex: 1,
    },
    {
      x: 10,
      y: 55,
      width: 35,
      height: 30,
      frameStyle: "minimalist",
      matWidth: 8,
      matColor: "#FFFFFF",
      zIndex: 1,
    },
    {
      x: 55,
      y: 55,
      width: 35,
      height: 30,
      frameStyle: "minimalist",
      matWidth: 8,
      matColor: "#FFFFFF",
      zIndex: 1,
    },
  ],
};

/**
 * Quad Row - Four photos in horizontal layout with varied sizes
 * Black frame with white mat
 */
const QUAD_ROW_PRESET: WallLayoutPreset = {
  id: "quad-row",
  name: "Quad Row",
  description: "Four photos in a horizontal row with black frames",
  minImages: 4,
  maxImages: 4,
  items: [
    {
      x: 5,
      y: 20,
      width: 18,
      height: 60,
      frameStyle: "modern",
      matWidth: 8,
      matColor: "#FFFFFF",
      zIndex: 1,
    },
    {
      x: 28,
      y: 20,
      width: 18,
      height: 60,
      frameStyle: "modern",
      matWidth: 8,
      matColor: "#FFFFFF",
      zIndex: 1,
    },
    {
      x: 51,
      y: 25,
      width: 20,
      height: 50,
      frameStyle: "modern",
      matWidth: 8,
      matColor: "#FFFFFF",
      zIndex: 1,
    },
    {
      x: 76,
      y: 25,
      width: 19,
      height: 50,
      frameStyle: "modern",
      matWidth: 8,
      matColor: "#FFFFFF",
      zIndex: 1,
    },
  ],
};

/**
 * Gallery Grid - 24 small photos in 4x6 grid
 * White frame with white mat
 */
const GALLERY_GRID_PRESET: WallLayoutPreset = {
  id: "gallery-grid",
  name: "Gallery Grid",
  description: "24 small photos in a 4x6 grid with white frames",
  minImages: 24,
  maxImages: 24,
  items: [
    // Row 1
    {
      x: 4,
      y: 8,
      width: 13,
      height: 18,
      frameStyle: "minimalist",
      matWidth: 4,
      matColor: "#FFFFFF",
      zIndex: 1,
    },
    {
      x: 19,
      y: 8,
      width: 13,
      height: 18,
      frameStyle: "minimalist",
      matWidth: 4,
      matColor: "#FFFFFF",
      zIndex: 1,
    },
    {
      x: 34,
      y: 8,
      width: 13,
      height: 18,
      frameStyle: "minimalist",
      matWidth: 4,
      matColor: "#FFFFFF",
      zIndex: 1,
    },
    {
      x: 49,
      y: 8,
      width: 13,
      height: 18,
      frameStyle: "minimalist",
      matWidth: 4,
      matColor: "#FFFFFF",
      zIndex: 1,
    },
    {
      x: 64,
      y: 8,
      width: 13,
      height: 18,
      frameStyle: "minimalist",
      matWidth: 4,
      matColor: "#FFFFFF",
      zIndex: 1,
    },
    {
      x: 79,
      y: 8,
      width: 13,
      height: 18,
      frameStyle: "minimalist",
      matWidth: 4,
      matColor: "#FFFFFF",
      zIndex: 1,
    },
    // Row 2
    {
      x: 4,
      y: 30,
      width: 13,
      height: 18,
      frameStyle: "minimalist",
      matWidth: 4,
      matColor: "#FFFFFF",
      zIndex: 1,
    },
    {
      x: 19,
      y: 30,
      width: 13,
      height: 18,
      frameStyle: "minimalist",
      matWidth: 4,
      matColor: "#FFFFFF",
      zIndex: 1,
    },
    {
      x: 34,
      y: 30,
      width: 13,
      height: 18,
      frameStyle: "minimalist",
      matWidth: 4,
      matColor: "#FFFFFF",
      zIndex: 1,
    },
    {
      x: 49,
      y: 30,
      width: 13,
      height: 18,
      frameStyle: "minimalist",
      matWidth: 4,
      matColor: "#FFFFFF",
      zIndex: 1,
    },
    {
      x: 64,
      y: 30,
      width: 13,
      height: 18,
      frameStyle: "minimalist",
      matWidth: 4,
      matColor: "#FFFFFF",
      zIndex: 1,
    },
    {
      x: 79,
      y: 30,
      width: 13,
      height: 18,
      frameStyle: "minimalist",
      matWidth: 4,
      matColor: "#FFFFFF",
      zIndex: 1,
    },
    // Row 3
    {
      x: 4,
      y: 52,
      width: 13,
      height: 18,
      frameStyle: "minimalist",
      matWidth: 4,
      matColor: "#FFFFFF",
      zIndex: 1,
    },
    {
      x: 19,
      y: 52,
      width: 13,
      height: 18,
      frameStyle: "minimalist",
      matWidth: 4,
      matColor: "#FFFFFF",
      zIndex: 1,
    },
    {
      x: 34,
      y: 52,
      width: 13,
      height: 18,
      frameStyle: "minimalist",
      matWidth: 4,
      matColor: "#FFFFFF",
      zIndex: 1,
    },
    {
      x: 49,
      y: 52,
      width: 13,
      height: 18,
      frameStyle: "minimalist",
      matWidth: 4,
      matColor: "#FFFFFF",
      zIndex: 1,
    },
    {
      x: 64,
      y: 52,
      width: 13,
      height: 18,
      frameStyle: "minimalist",
      matWidth: 4,
      matColor: "#FFFFFF",
      zIndex: 1,
    },
    {
      x: 79,
      y: 52,
      width: 13,
      height: 18,
      frameStyle: "minimalist",
      matWidth: 4,
      matColor: "#FFFFFF",
      zIndex: 1,
    },
    // Row 4
    {
      x: 4,
      y: 74,
      width: 13,
      height: 18,
      frameStyle: "minimalist",
      matWidth: 4,
      matColor: "#FFFFFF",
      zIndex: 1,
    },
    {
      x: 19,
      y: 74,
      width: 13,
      height: 18,
      frameStyle: "minimalist",
      matWidth: 4,
      matColor: "#FFFFFF",
      zIndex: 1,
    },
    {
      x: 34,
      y: 74,
      width: 13,
      height: 18,
      frameStyle: "minimalist",
      matWidth: 4,
      matColor: "#FFFFFF",
      zIndex: 1,
    },
    {
      x: 49,
      y: 74,
      width: 13,
      height: 18,
      frameStyle: "minimalist",
      matWidth: 4,
      matColor: "#FFFFFF",
      zIndex: 1,
    },
    {
      x: 64,
      y: 74,
      width: 13,
      height: 18,
      frameStyle: "minimalist",
      matWidth: 4,
      matColor: "#FFFFFF",
      zIndex: 1,
    },
    {
      x: 79,
      y: 74,
      width: 13,
      height: 18,
      frameStyle: "minimalist",
      matWidth: 4,
      matColor: "#FFFFFF",
      zIndex: 1,
    },
  ],
};

/**
 * All available wall layout presets
 */
export const WALL_LAYOUT_PRESETS: Record<string, WallLayoutPreset> = {
  "triple-row": TRIPLE_ROW_PRESET,
  "quad-grid": QUAD_GRID_PRESET,
  "quad-row": QUAD_ROW_PRESET,
  "gallery-grid": GALLERY_GRID_PRESET,
};

/**
 * Get wall layout preset by ID
 */
export function getWallLayoutPreset(id: string): WallLayoutPreset | undefined {
  return WALL_LAYOUT_PRESETS[id];
}

/**
 * Get all available wall layout presets as an array
 */
export function getAllWallLayoutPresets(): WallLayoutPreset[] {
  return Object.values(WALL_LAYOUT_PRESETS);
}

/**
 * Find suitable presets for a given number of images
 */
export function getSuitablePresets(imageCount: number): WallLayoutPreset[] {
  return getAllWallLayoutPresets().filter(
    (preset) =>
      imageCount >= preset.minImages && imageCount <= preset.maxImages,
  );
}
