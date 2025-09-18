import { AlbumLayout, createLayout } from "../constants/AlbumLayout";

/**
 * Get default layout for albums
 */
export function getDefaultLayout(): AlbumLayout {
  return createLayout("slideshow", 1);
}

/**
 * Get a layout by type and image count
 */
export function getLayoutByType(
  type: "slideshow" | "grid",
  imageCount: number
): AlbumLayout {
  return createLayout(type, imageCount);
}

/**
 * Ensure an album has a valid layout
 */
export function ensureValidLayout(
  layout?: AlbumLayout,
  imageCount: number = 1
): AlbumLayout {
  if (!layout) {
    return getDefaultLayout();
  }

  // Check if the layout structure is valid
  if (!layout.name || !layout.type) {
    return getDefaultLayout();
  }

  // For grid layouts, ensure grid structure exists
  if (
    layout.type === "grid" &&
    (!layout.grid || !layout.grid.rows || !layout.grid.cols)
  ) {
    return createLayout("grid", imageCount);
  }

  return layout;
}

/**
 * Get optimal layout based on image count
 */
export function getOptimalLayout(imageCount: number): AlbumLayout {
  // For 1 image, always use slideshow
  if (imageCount <= 1) {
    return createLayout("slideshow", imageCount);
  }

  // For multiple images, suggest grid but let user choose
  return createLayout("grid", imageCount);
}
