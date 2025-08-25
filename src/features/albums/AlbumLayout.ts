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
    description: "Three images in portrait mode",
    grid: { rows: 1, cols: 3 },
    orientation: "portrait",
    type: "grid",
  },
  {
    name: "6 Portraits",
    description: "Six images in portrait mode (2x3 grid)",
    grid: { rows: 2, cols: 3 },
    orientation: "portrait",
    type: "grid",
  },
  {
    name: "2x2 Grid",
    description: "Four images in a square grid",
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
    name: "Mixed Grid",
    description: "Flexible grid for mixed image orientations",
    grid: { rows: 3, cols: 3 },
    orientation: "mixed",
    type: "grid",
  },
  {
    name: "Mosaic",
    description: "Dynamic layout for large image collections",
    grid: { rows: 4, cols: 4 },
    orientation: "mixed",
    type: "custom",
  },
  {
    name: "Slideshow",
    description: "Single image at a time, auto-advancing",
    grid: { rows: 1, cols: 1 },
    type: "slideshow",
  },
];
