// AlbumLayout.ts - Simplified layout system
import { PhotoWallItem, AlbumLayout, LayoutType } from "@/shared/types/album";
import { getWallLayoutPreset } from "./WallLayoutPresets";

// Re-export types from shared types for convenience
export type { AlbumLayout, LayoutType };

/**
 * Calculate optimal grid dimensions based on image count
 */
export function getOptimalGridLayout(imageCount: number): {
  rows: number;
  cols: number;
} {
  if (imageCount <= 1) return { rows: 1, cols: 1 };
  if (imageCount === 2) return { rows: 1, cols: 2 };
  if (imageCount === 3) return { rows: 1, cols: 3 };
  if (imageCount === 4) return { rows: 2, cols: 2 };
  if (imageCount <= 6) return { rows: 2, cols: 3 };
  if (imageCount <= 9) return { rows: 3, cols: 3 };
  if (imageCount <= 12) return { rows: 3, cols: 4 };
  if (imageCount <= 16) return { rows: 4, cols: 4 };
  if (imageCount <= 20) return { rows: 4, cols: 5 };
  // For larger collections, use a reasonable max grid
  return { rows: 5, cols: 6 };
}

/**
 * Create a layout based on type and image count
 */
export function createLayout(
  type: LayoutType,
  imageCount: number,
  presetId?: string,
): AlbumLayout {
  if (type === "slideshow") {
    return {
      type: "slideshow",
      name: "Slideshow",
      description: "One image at a time with smooth transitions",
    };
  }

  if (type === "wall") {
    const preset = presetId
      ? getWallLayoutPreset(presetId)
      : getWallLayoutPreset("gallery-wall");

    if (!preset) {
      // Fallback to slideshow if preset not found
      return createLayout("slideshow", imageCount);
    }

    // Assign images to wall positions (cycle if more positions than images)
    const items: PhotoWallItem[] = preset.items.map((template, index) => ({
      ...template,
      imageIndex: index % imageCount,
    }));

    return {
      type: "wall",
      name: preset.name,
      description: preset.description,
      wall: {
        presetId: preset.id,
        items,
      },
    };
  }

  const grid = getOptimalGridLayout(imageCount);
  return {
    type: "grid",
    name: `Grid (${grid.rows}×${grid.cols})`,
    description: `${imageCount} images in a ${grid.rows}×${grid.cols} grid layout`,
    grid,
  };
}
