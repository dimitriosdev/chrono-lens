/**
 * Responsive Design Utilities
 * Enhanced responsive patterns using modern CSS and container queries
 */

import { breakpoints } from "../constants/designSystem";

// Responsive grid patterns
export const responsiveGrids = {
  // Auto-fit grids that adapt to container width
  autoFit: {
    sm: "grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-2",
    md: "grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-3",
    lg: "grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-4",
  },

  // Auto-fill grids for consistent sizing
  autoFill: {
    sm: "grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-2",
    md: "grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3",
    lg: "grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4",
  },

  // Standard responsive grids
  standard: {
    photos:
      "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4",
    cards: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6",
    features: "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8",
    list: "grid grid-cols-1 gap-4",
  },

  // Specialized album layout grids
  album: {
    single: "grid grid-cols-1 place-items-center",
    pair: "grid grid-cols-1 sm:grid-cols-2 gap-4",
    triple: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4",
    quad: "grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4",
    masonry:
      "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4",
  },
} as const;

// Responsive spacing patterns
export const responsiveSpacing = {
  container: {
    padding: "px-4 sm:px-6 lg:px-8",
    maxWidth: "max-w-7xl mx-auto",
    section: "py-8 sm:py-12 lg:py-16",
  },

  component: {
    padding: "p-3 sm:p-4 lg:p-6",
    margin: "m-3 sm:m-4 lg:m-6",
    gap: "gap-3 sm:gap-4 lg:gap-6",
  },

  typography: {
    heading: "text-lg sm:text-xl lg:text-2xl",
    subheading: "text-base sm:text-lg lg:text-xl",
    body: "text-sm sm:text-base",
    caption: "text-xs sm:text-sm",
  },
} as const;

// Mobile-first responsive utilities
export const mobileFirst = {
  hidden: {
    mobile: "hidden sm:block",
    tablet: "hidden md:block",
    desktop: "hidden lg:block",
  },

  visible: {
    mobileOnly: "block sm:hidden",
    tabletOnly: "hidden sm:block lg:hidden",
    desktopOnly: "hidden lg:block",
  },

  flex: {
    mobileStack: "flex flex-col sm:flex-row",
    tabletStack: "flex flex-col md:flex-row",
    mobileCenter: "flex flex-col items-center sm:flex-row sm:items-start",
  },

  sizes: {
    mobileFullWidth: "w-full sm:w-auto",
    tabletHalfWidth: "w-full md:w-1/2",
    desktopThirdWidth: "w-full lg:w-1/3",
  },
} as const;

// Container query utilities (for modern browsers)
export const containerQueries = {
  // Container types
  containerTypes: {
    inline: "@container/inline",
    block: "@container/block",
    size: "@container/size",
  },

  // Container query classes (these would need to be added to Tailwind config)
  queries: {
    xs: "@container (min-width: 20rem)",
    sm: "@container (min-width: 24rem)",
    md: "@container (min-width: 28rem)",
    lg: "@container (min-width: 32rem)",
    xl: "@container (min-width: 36rem)",
  },
} as const;

// Responsive image utilities
export const responsiveImages = {
  aspect: {
    square: "aspect-square object-cover",
    photo: "aspect-[4/3] object-cover",
    portrait: "aspect-[3/4] object-cover",
    wide: "aspect-[16/9] object-cover",
    panorama: "aspect-[21/9] object-cover",
  },

  sizes: {
    thumbnail: "w-16 h-16 sm:w-20 sm:h-20",
    small: "w-24 h-24 sm:w-32 sm:h-32",
    medium: "w-48 h-48 sm:w-64 sm:h-64",
    large: "w-full max-w-md sm:max-w-lg lg:max-w-xl",
    hero: "w-full h-64 sm:h-80 lg:h-96",
  },

  responsive: {
    gallery: "w-full h-48 sm:h-56 md:h-64 lg:h-72 object-cover",
    card: "w-full h-32 sm:h-40 md:h-48 object-cover",
    avatar: "w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full object-cover",
  },
} as const;

// Touch-friendly sizing for mobile
export const touchFriendly = {
  // Minimum 44px touch targets
  minTouch: "min-h-[44px] min-w-[44px]",
  button: "h-11 px-4 sm:h-10 sm:px-4", // 44px on mobile, 40px on desktop
  iconButton: "h-11 w-11 sm:h-10 sm:w-10",
  input: "h-11 sm:h-10",

  // Touch-friendly spacing
  touchSpacing: "p-3 sm:p-2",
  touchGap: "gap-4 sm:gap-3",
} as const;

// Dark mode responsive utilities
export const darkModeResponsive = {
  backgrounds: {
    primary: "bg-white dark:bg-gray-900",
    secondary: "bg-gray-50 dark:bg-gray-800",
    elevated: "bg-white dark:bg-gray-800 shadow-lg dark:shadow-gray-900/20",
  },

  text: {
    primary: "text-gray-900 dark:text-gray-100",
    secondary: "text-gray-600 dark:text-gray-300",
    muted: "text-gray-500 dark:text-gray-400",
  },

  borders: {
    light: "border-gray-200 dark:border-gray-700",
    medium: "border-gray-300 dark:border-gray-600",
    heavy: "border-gray-400 dark:border-gray-500",
  },
} as const;

// Animation preferences
export const motionPreferences = {
  respectsReducedMotion: {
    animate: "motion-safe:animate-bounce",
    transition: "motion-safe:transition-all motion-safe:duration-300",
    transform: "motion-safe:hover:scale-105",
  },

  reducedMotion: {
    static: "motion-reduce:animate-none",
    fastTransition: "motion-reduce:transition-none",
  },
} as const;

// Utility functions
export const responsiveUtils = {
  // Get responsive classes based on breakpoint
  getResponsiveClasses: (classes: Record<string, string>) => {
    return Object.entries(classes)
      .map(([breakpoint, className]) =>
        breakpoint === "base" ? className : `${breakpoint}:${className}`
      )
      .join(" ");
  },

  // Generate responsive grid columns
  generateGridCols: (cols: Record<string, number>) => {
    return Object.entries(cols)
      .map(([breakpoint, colCount]) =>
        breakpoint === "base"
          ? `grid-cols-${colCount}`
          : `${breakpoint}:grid-cols-${colCount}`
      )
      .join(" ");
  },

  // Check if current viewport matches breakpoint
  matchesBreakpoint: (breakpoint: keyof typeof breakpoints) => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(`(min-width: ${breakpoints[breakpoint]})`).matches;
  },

  // Get container query support
  supportsContainerQueries: () => {
    if (typeof window === "undefined") return false;
    return "container" in document.documentElement.style;
  },
} as const;

export default {
  responsiveGrids,
  responsiveSpacing,
  mobileFirst,
  containerQueries,
  responsiveImages,
  touchFriendly,
  darkModeResponsive,
  motionPreferences,
  responsiveUtils,
} as const;
