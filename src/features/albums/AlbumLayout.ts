// AlbumLayout.ts
export type AlbumLayout = {
  name: string;
  description: string;
  grid: { rows: number; cols: number };
  orientation?: "portrait" | "landscape" | "mixed";
  type: "grid" | "slideshow" | "custom" | "smart";
  isSmartLayout?: boolean;
};

export const ALBUM_LAYOUTS: AlbumLayout[] = [
  {
    name: "Smart Layout",
    description: "Automatically selects the best layout based on your images",
    grid: { rows: 1, cols: 1 }, // Placeholder, will be determined dynamically
    type: "smart",
    isSmartLayout: true,
  },
  {
    name: "3 Portraits",
    description: "Three images in portrait mode - perfect for vertical photos",
    grid: { rows: 1, cols: 3 },
    orientation: "portrait",
    type: "grid",
  },
  {
    name: "6 Portraits",
    description:
      "Six images in portrait mode (2x3 grid) - ideal for gallery walls",
    grid: { rows: 2, cols: 3 },
    orientation: "portrait",
    type: "grid",
  },
  {
    name: "Single Row",
    description: "All images in a horizontal line - great for timelines",
    grid: { rows: 1, cols: 8 },
    orientation: "mixed",
    type: "grid",
  },
  {
    name: "2x2 Grid",
    description: "Four images in a square grid - balanced and versatile",
    grid: { rows: 2, cols: 2 },
    orientation: "mixed",
    type: "grid",
  },
  {
    name: "3x2 Landscape",
    description: "Six images optimized for landscape orientation",
    grid: { rows: 2, cols: 3 },
    orientation: "landscape",
    type: "grid",
  },
  {
    name: "Column Stack",
    description: "Images stacked vertically - perfect for mobile viewing",
    grid: { rows: 8, cols: 1 },
    orientation: "mixed",
    type: "grid",
  },
  {
    name: "Mixed Grid",
    description: "Flexible 3x3 grid for mixed image orientations",
    grid: { rows: 3, cols: 3 },
    orientation: "mixed",
    type: "grid",
  },
  {
    name: "Mosaic",
    description: "Dynamic asymmetric layout for large collections",
    grid: { rows: 4, cols: 4 },
    orientation: "mixed",
    type: "custom",
  },
  {
    name: "Slideshow",
    description: "Classic single image presentation with auto-advance",
    grid: { rows: 1, cols: 1 },
    type: "slideshow",
  },
];
