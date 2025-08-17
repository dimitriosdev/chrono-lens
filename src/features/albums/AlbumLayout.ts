// AlbumLayout.ts
export type AlbumLayout = {
  name: string;
  description: string;
  grid: { rows: number; cols: number };
  orientation?: "portrait" | "landscape";
  type: "grid" | "slideshow" | "custom";
};

export const ALBUM_LAYOUTS: AlbumLayout[] = [
  {
    name: "Grid 2x3",
    description: "Six images in a 2x3 grid",
    grid: { rows: 2, cols: 3 },
    type: "grid",
  },
  {
    name: "Three Portraits",
    description: "Three images in portrait mode",
    grid: { rows: 1, cols: 3 },
    orientation: "portrait",
    type: "grid",
  },
  {
    name: "Slideshow",
    description: "Single image at a time, auto-advancing",
    grid: { rows: 1, cols: 1 },
    type: "slideshow",
  },
];
