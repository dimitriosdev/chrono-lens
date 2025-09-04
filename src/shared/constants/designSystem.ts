/**
 * Design System Constants
 * Centralized theming and design tokens
 */

// Color Palette
export const colors = {
  // Brand colors
  brand: {
    50: "#f0f9ff",
    100: "#e0f2fe",
    200: "#bae6fd",
    300: "#7dd3fc",
    400: "#38bdf8",
    500: "#0ea5e9",
    600: "#0284c7",
    700: "#0369a1",
    800: "#075985",
    900: "#0c4a6e",
    950: "#082f49",
  },

  // Semantic colors
  success: {
    50: "#f0fdf4",
    100: "#dcfce7",
    200: "#bbf7d0",
    300: "#86efac",
    400: "#4ade80",
    500: "#22c55e",
    600: "#16a34a",
    700: "#15803d",
    800: "#166534",
    900: "#14532d",
  },

  warning: {
    50: "#fffbeb",
    100: "#fef3c7",
    200: "#fde68a",
    300: "#fcd34d",
    400: "#fbbf24",
    500: "#f59e0b",
    600: "#d97706",
    700: "#b45309",
    800: "#92400e",
    900: "#78350f",
  },

  danger: {
    50: "#fef2f2",
    100: "#fee2e2",
    200: "#fecaca",
    300: "#fca5a5",
    400: "#f87171",
    500: "#ef4444",
    600: "#dc2626",
    700: "#b91c1c",
    800: "#991b1b",
    900: "#7f1d1d",
  },

  // Specialized colors
  orientation: {
    portrait: "#3b82f6",
    landscape: "#10b981",
    square: "#8b5cf6",
  },

  confidence: {
    high: "#10b981",
    medium: "#f59e0b",
    low: "#ef4444",
  },

  score: {
    excellent: "#10b981",
    good: "#f59e0b",
    fair: "#fb923c",
    poor: "#ef4444",
  },
} as const;

// Typography Scale
export const typography = {
  fontSizes: {
    xs: "0.75rem",
    sm: "0.875rem",
    base: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
    "2xl": "1.5rem",
    "3xl": "1.875rem",
    "4xl": "2.25rem",
    "5xl": "3rem",
    "6xl": "3.75rem",
  },

  lineHeights: {
    xs: "1rem",
    sm: "1.25rem",
    base: "1.5rem",
    lg: "1.75rem",
    xl: "1.75rem",
    "2xl": "2rem",
    "3xl": "2.25rem",
    "4xl": "2.5rem",
    "5xl": "1",
    "6xl": "1",
  },

  fontWeights: {
    light: "300",
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
  },

  letterSpacing: {
    tighter: "-0.05em",
    tight: "-0.025em",
    normal: "0em",
    wide: "0.025em",
    wider: "0.05em",
    widest: "0.1em",
  },
} as const;

// Spacing Scale
export const spacing = {
  0: "0px",
  px: "1px",
  0.5: "0.125rem",
  1: "0.25rem",
  1.5: "0.375rem",
  2: "0.5rem",
  2.5: "0.625rem",
  3: "0.75rem",
  3.5: "0.875rem",
  4: "1rem",
  5: "1.25rem",
  6: "1.5rem",
  7: "1.75rem",
  8: "2rem",
  9: "2.25rem",
  10: "2.5rem",
  11: "2.75rem",
  12: "3rem",
  14: "3.5rem",
  16: "4rem",
  18: "4.5rem",
  20: "5rem",
  24: "6rem",
  28: "7rem",
  32: "8rem",
  36: "9rem",
  40: "10rem",
  44: "11rem",
  48: "12rem",
  52: "13rem",
  56: "14rem",
  60: "15rem",
  64: "16rem",
  72: "18rem",
  80: "20rem",
  96: "24rem",
} as const;

// Border Radius
export const borderRadius = {
  none: "0px",
  sm: "0.125rem",
  base: "0.25rem",
  md: "0.375rem",
  lg: "0.5rem",
  xl: "0.75rem",
  "2xl": "1rem",
  "3xl": "1.5rem",
  full: "9999px",
} as const;

// Shadows
export const shadows = {
  sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
  base: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
  md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
  lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
  "2xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)",
  inner: "inset 0 2px 4px 0 rgb(0 0 0 / 0.05)",
  none: "0 0 #0000",
  glow: "0 0 20px rgba(59, 130, 246, 0.15)",
  "glow-sm": "0 0 10px rgba(59, 130, 246, 0.1)",
} as const;

// Breakpoints
export const breakpoints = {
  xs: "475px",
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
} as const;

// Animation durations
export const durations = {
  75: "75ms",
  100: "100ms",
  150: "150ms",
  200: "200ms",
  300: "300ms",
  500: "500ms",
  700: "700ms",
  1000: "1000ms",
} as const;

// Easing functions
export const easings = {
  linear: "linear",
  in: "cubic-bezier(0.4, 0, 1, 1)",
  out: "cubic-bezier(0, 0, 0.2, 1)",
  "in-out": "cubic-bezier(0.4, 0, 0.2, 1)",
  "bounce-soft": "cubic-bezier(0.34, 1.56, 0.64, 1)",
} as const;

// Component variants
export const componentVariants = {
  button: {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    secondary: "bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    success: "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500",
    ghost:
      "bg-transparent text-gray-300 hover:bg-gray-700 focus:ring-gray-500 border border-gray-600",
    outline:
      "border border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-500",
  },

  input: {
    default:
      "bg-gray-700 text-white border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500",
    error:
      "bg-gray-700 text-white border border-red-500 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500",
    success:
      "bg-gray-700 text-white border border-green-500 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500",
  },

  card: {
    default: "bg-gray-800 rounded-lg border border-gray-700",
    elevated: "bg-gray-800 rounded-lg border border-gray-700 shadow-lg",
    glass: "glass-panel rounded-lg",
    interactive:
      "bg-gray-800 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors cursor-pointer",
  },

  badge: {
    default: "bg-gray-600 text-gray-100 px-2 py-1 rounded-full text-xs",
    primary: "bg-blue-600 text-white px-2 py-1 rounded-full text-xs",
    success: "bg-green-600 text-white px-2 py-1 rounded-full text-xs",
    warning: "bg-yellow-600 text-white px-2 py-1 rounded-full text-xs",
    danger: "bg-red-600 text-white px-2 py-1 rounded-full text-xs",
    outline:
      "border border-gray-600 text-gray-300 px-2 py-1 rounded-full text-xs",
  },

  text: {
    heading: "text-white font-semibold",
    body: "text-gray-200",
    muted: "text-gray-400",
    caption: "text-gray-500 text-sm",
    error: "text-red-400",
    success: "text-green-400",
    warning: "text-yellow-400",
  },
} as const;

// Layout utilities
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

// Helper functions
export const helpers = {
  // Get color with opacity
  withOpacity: (color: string, opacity: number) =>
    `${color}/${Math.round(opacity * 100)}`,

  // Get responsive classes
  responsive: (classes: Record<string, string>) =>
    Object.entries(classes)
      .map(([breakpoint, className]) =>
        breakpoint === "base" ? className : `${breakpoint}:${className}`
      )
      .join(" "),

  // Conditional classes
  cn: (...classes: (string | undefined | null | boolean)[]) =>
    classes.filter(Boolean).join(" "),

  // Get variant classes
  variant: <T extends keyof typeof componentVariants>(
    component: T,
    variant: keyof (typeof componentVariants)[T],
    additional?: string
  ) => {
    const base = componentVariants[component][variant] as string;
    return additional ? `${base} ${additional}` : base;
  },
} as const;

export default {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  breakpoints,
  durations,
  easings,
  componentVariants,
  layout,
  helpers,
} as const;
