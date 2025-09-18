// AlbumLayout.ts - Simplified layout system
export type LayoutType = "slideshow" | "grid";

export type AlbumLayout = {
  type: LayoutType;
  name: string;
  description: string;
  grid?: { rows: number; cols: number }; // Only for grid layouts
};

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
  imageCount: number
): AlbumLayout {
  if (type === "slideshow") {
    return {
      type: "slideshow",
      name: "Slideshow",
      description: "One image at a time with smooth transitions",
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
