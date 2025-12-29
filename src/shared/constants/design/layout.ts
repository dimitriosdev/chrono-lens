/**
 * Layout Utilities
 * Common layout patterns as Tailwind class combinations
 */

export const layout = {
  container: {
    center: "mx-auto",
    padding: "px-4 sm:px-6 lg:px-8",
    maxWidth: "max-w-7xl",
  },

  flex: {
    center: "flex items-center justify-center",
    between: "flex items-center justify-between",
    start: "flex items-center justify-start",
    end: "flex items-center justify-end",
    col: "flex flex-col",
    colCenter: "flex flex-col items-center justify-center",
  },

  grid: {
    auto: "grid grid-cols-auto",
    fit: "grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))]",
    fill: "grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))]",
    responsive: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
  },
} as const;

export type Layout = typeof layout;
