/**
 * CSS Container Query Utilities
 * Modern responsive design using container queries instead of viewport-based media queries
 */

// Container query breakpoints
export const containerBreakpoints = {
  xs: "320px",
  sm: "480px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1440px",
} as const;

// Grid layout configurations based on container size
export const gridLayouts = {
  singleRow: {
    base: "grid-cols-2 gap-1",
    sm: "grid-cols-4 gap-2",
    md: "grid-cols-6 gap-3",
    lg: "grid-cols-8 gap-4",
  },
  columnStack: {
    base: "grid-rows-4 gap-1",
    sm: "grid-rows-6 gap-2",
    md: "grid-rows-8 gap-3",
    lg: "grid-rows-8 gap-4",
  },
  grid: {
    base: "grid-cols-1 grid-rows-2 gap-2",
    sm: "grid-cols-2 grid-rows-2 gap-3",
    md: "grid-cols-3 grid-rows-2 gap-4",
    lg: "grid-cols-3 grid-rows-3 gap-4",
  },
} as const;

// Mat image sizing classes using container queries
export const matImageSizes = {
  slideshow: [
    "@container/slideshow",
    "w-full",
    "h-full",
    "max-w-[90cqw]",
    "max-h-[90cqh]",
  ],
  grid: [
    "@container/grid",
    "w-full",
    "h-full",
    "aspect-[4/3]",
    "@[480px]:aspect-[3/2]",
    "@[768px]:aspect-square",
    "@[1024px]:aspect-[4/3]",
  ],
  singleRow: [
    "@container/single-row",
    "w-full",
    "h-24",
    "@[480px]:h-32",
    "@[768px]:h-40",
    "@[1024px]:h-48",
  ],
  columnStack: [
    "@container/column-stack",
    "w-32",
    "h-full",
    "@[480px]:w-40",
    "@[768px]:w-48",
    "@[1024px]:w-56",
  ],
} as const;

// Utility function to generate container query classes
export const getContainerClasses = (
  layout: "slideshow" | "grid" | "singleRow" | "columnStack"
) => {
  return matImageSizes[layout]?.join(" ") || "";
};

// Dynamic sizing utilities for complex layouts
export const calculateContainerDimensions = (
  containerWidth: number,
  containerHeight: number,
  rows: number,
  cols: number
) => {
  const gap = containerWidth > 768 ? 16 : 8; // Gap size based on container
  const availableWidth = containerWidth - gap * (cols - 1);
  const availableHeight = containerHeight - gap * (rows - 1);

  const cellWidth = availableWidth / cols;
  const cellHeight = availableHeight / rows;

  // Use the smaller dimension to maintain aspect ratio
  const size = Math.min(cellWidth, cellHeight);

  return {
    cellWidth: Math.max(120, Math.min(size, 400)), // Min 120px, max 400px
    cellHeight: Math.max(120, Math.min(size, 400)),
    gap,
  };
};

export type ContainerLayout = keyof typeof matImageSizes;
export type ContainerBreakpoint = keyof typeof containerBreakpoints;
