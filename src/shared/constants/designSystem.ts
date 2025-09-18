/**
 * Design System Constants
 * Centralized theming and design tokens
 */

// Color Palette - Enhanced for accessibility and contrast
export const colors = {
  // Brand colors - Enhanced contrast
  brand: {
    50: "#f0f9ff",
    100: "#e0f2fe",
    200: "#bae6fd",
    300: "#7dd3fc",
    400: "#38bdf8",
    500: "#0ea5e9", // Primary brand color
    600: "#0284c7", // Preferred for interactive elements
    700: "#0369a1", // Enhanced contrast
    800: "#075985",
    900: "#0c4a6e",
    950: "#082f49",
  },

  // Neutral grays - WCAG AA compliant
  neutral: {
    0: "#ffffff",
    50: "#fafafa",
    100: "#f5f5f5",
    200: "#e5e5e5",
    300: "#d4d4d4",
    400: "#a3a3a3",
    500: "#737373",
    600: "#525252",
    700: "#404040",
    800: "#262626",
    900: "#171717",
    950: "#0a0a0a",
  },

  // Semantic colors - High contrast variants
  success: {
    50: "#f0fdf4",
    100: "#dcfce7",
    200: "#bbf7d0",
    300: "#86efac",
    400: "#4ade80",
    500: "#22c55e", // WCAG AA on white
    600: "#16a34a", // WCAG AA on light backgrounds
    700: "#15803d", // WCAG AAA
    800: "#166534",
    900: "#14532d",
    contrast: "#047857", // Maximum contrast variant
  },

  warning: {
    50: "#fffbeb",
    100: "#fef3c7",
    200: "#fde68a",
    300: "#fcd34d",
    400: "#fbbf24",
    500: "#f59e0b", // WCAG AA
    600: "#d97706", // Enhanced contrast
    700: "#b45309", // WCAG AAA
    800: "#92400e",
    900: "#78350f",
    contrast: "#b45309", // Maximum contrast variant
  },

  danger: {
    50: "#fef2f2",
    100: "#fee2e2",
    200: "#fecaca",
    300: "#fca5a5",
    400: "#f87171",
    500: "#ef4444", // WCAG AA
    600: "#dc2626", // Enhanced contrast
    700: "#b91c1c", // WCAG AAA
    800: "#991b1b",
    900: "#7f1d1d",
    contrast: "#991b1b", // Maximum contrast variant
  },

  // Information and status
  info: {
    50: "#eff6ff",
    100: "#dbeafe",
    200: "#bfdbfe",
    300: "#93c5fd",
    400: "#60a5fa",
    500: "#3b82f6",
    600: "#2563eb",
    700: "#1d4ed8",
    800: "#1e40af",
    900: "#1e3a8a",
    contrast: "#1e40af",
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

  // Theme-aware surface colors
  surface: {
    // Light theme surfaces
    background: "#ffffff",
    foreground: "#000000",
    primary: "#fafafa",
    secondary: "#f5f5f5",
    muted: "#f1f5f9",
    accent: "#f8fafc",

    // Dark theme surfaces
    dark: {
      background: "#0a0a0a",
      foreground: "#fafafa",
      primary: "#111111",
      secondary: "#1a1a1a",
      muted: "#262626",
      accent: "#171717",
    },
  },

  // Border colors with better contrast
  border: {
    light: "#e2e8f0",
    default: "#cbd5e1",
    medium: "#94a3b8",
    strong: "#64748b",
    dark: "#475569",
  },
} as const;

// Typography Scale - Enhanced hierarchy and readability
export const typography = {
  fontSizes: {
    xs: "0.75rem", // 12px
    sm: "0.875rem", // 14px
    base: "1rem", // 16px
    lg: "1.125rem", // 18px
    xl: "1.25rem", // 20px
    "2xl": "1.5rem", // 24px
    "3xl": "1.875rem", // 30px
    "4xl": "2.25rem", // 36px
    "5xl": "3rem", // 48px
    "6xl": "3.75rem", // 60px
    "7xl": "4.5rem", // 72px
    "8xl": "6rem", // 96px
  },

  lineHeights: {
    xs: "1rem", // 16px
    sm: "1.25rem", // 20px
    base: "1.5rem", // 24px
    lg: "1.75rem", // 28px
    xl: "1.75rem", // 28px
    "2xl": "2rem", // 32px
    "3xl": "2.375rem", // 38px
    "4xl": "2.5rem", // 40px
    "5xl": "3.75rem", // 60px
    "6xl": "4.5rem", // 72px
    "7xl": "5.25rem", // 84px
    "8xl": "7.5rem", // 120px
    tight: "1.25",
    snug: "1.375",
    normal: "1.5",
    relaxed: "1.625",
    loose: "2",
  },

  fontWeights: {
    thin: "100",
    extralight: "200",
    light: "300",
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
    extrabold: "800",
    black: "900",
  },

  letterSpacing: {
    tighter: "-0.05em",
    tight: "-0.025em",
    normal: "0em",
    wide: "0.025em",
    wider: "0.05em",
    widest: "0.1em",
  },

  // Typography scale for semantic usage
  scale: {
    display: {
      large: "text-6xl font-bold leading-tight tracking-tight",
      medium: "text-5xl font-bold leading-tight tracking-tight",
      small: "text-4xl font-bold leading-tight tracking-tight",
    },
    heading: {
      h1: "text-3xl font-bold leading-tight tracking-tight",
      h2: "text-2xl font-semibold leading-snug tracking-tight",
      h3: "text-xl font-semibold leading-snug",
      h4: "text-lg font-medium leading-normal",
      h5: "text-base font-medium leading-normal",
      h6: "text-sm font-medium leading-normal",
    },
    body: {
      large: "text-lg font-normal leading-relaxed",
      medium: "text-base font-normal leading-normal",
      small: "text-sm font-normal leading-normal",
    },
    caption: {
      large: "text-sm font-medium leading-normal",
      medium: "text-xs font-medium leading-normal",
      small: "text-xs font-normal leading-tight",
    },
    overline: "text-xs font-medium leading-normal tracking-wider uppercase",
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

// Component variants - Enhanced accessibility and visual hierarchy
export const componentVariants = {
  button: {
    // Primary buttons with better contrast
    primary:
      "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 focus:ring-2 focus:ring-offset-2 font-medium transition-all duration-200 shadow-sm hover:shadow-md",
    secondary:
      "bg-neutral-100 text-neutral-900 hover:bg-neutral-200 focus:ring-neutral-500 focus:ring-2 focus:ring-offset-2 border border-neutral-300 font-medium transition-all duration-200",
    tertiary:
      "bg-transparent text-blue-600 hover:bg-blue-50 focus:ring-blue-500 focus:ring-2 focus:ring-offset-2 border border-blue-600 font-medium transition-all duration-200",
    danger:
      "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 focus:ring-2 focus:ring-offset-2 font-medium transition-all duration-200 shadow-sm hover:shadow-md",
    success:
      "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 focus:ring-2 focus:ring-offset-2 font-medium transition-all duration-200 shadow-sm hover:shadow-md",
    ghost:
      "bg-transparent text-neutral-700 hover:bg-neutral-100 focus:ring-neutral-500 focus:ring-2 focus:ring-offset-2 font-medium transition-all duration-200",
    outline:
      "border border-neutral-300 text-neutral-700 hover:bg-neutral-50 focus:ring-neutral-500 focus:ring-2 focus:ring-offset-2 font-medium transition-all duration-200",

    // Dark theme variants
    primaryDark:
      "bg-blue-600 text-white hover:bg-blue-500 focus:ring-blue-400 focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-900 font-medium transition-all duration-200",
    secondaryDark:
      "bg-neutral-800 text-neutral-100 hover:bg-neutral-700 focus:ring-neutral-500 focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-900 border border-neutral-700 font-medium transition-all duration-200",
    ghostDark:
      "bg-transparent text-neutral-300 hover:bg-neutral-800 focus:ring-neutral-500 focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-900 font-medium transition-all duration-200",
  },

  input: {
    default:
      "bg-white text-neutral-900 border border-neutral-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder:text-neutral-500",
    error:
      "bg-white text-neutral-900 border border-red-500 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 placeholder:text-neutral-500",
    success:
      "bg-white text-neutral-900 border border-green-500 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 placeholder:text-neutral-500",

    // Dark theme inputs
    dark: "bg-neutral-800 text-neutral-100 border border-neutral-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder:text-neutral-400",
    darkError:
      "bg-neutral-800 text-neutral-100 border border-red-500 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 placeholder:text-neutral-400",
  },

  card: {
    default:
      "bg-white rounded-lg border border-neutral-200 shadow-sm hover:shadow-md transition-all duration-200",
    elevated:
      "bg-white rounded-lg border border-neutral-200 shadow-md hover:shadow-lg transition-all duration-200",
    interactive:
      "bg-white rounded-lg border border-neutral-200 hover:border-neutral-300 hover:shadow-md transition-all duration-200 cursor-pointer focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2",
    glass: "glass-panel rounded-lg backdrop-blur-sm border border-white/20",

    // Dark theme cards
    dark: "bg-neutral-800 rounded-lg border border-neutral-700 shadow-sm hover:shadow-md transition-all duration-200",
    darkElevated:
      "bg-neutral-800 rounded-lg border border-neutral-700 shadow-lg hover:shadow-xl transition-all duration-200",
    darkInteractive:
      "bg-neutral-800 rounded-lg border border-neutral-700 hover:border-neutral-600 hover:shadow-md transition-all duration-200 cursor-pointer focus-within:ring-2 focus-within:ring-blue-400 focus-within:ring-offset-2 focus-within:ring-offset-neutral-900",
  },

  badge: {
    default:
      "bg-neutral-100 text-neutral-800 px-2 py-1 rounded-full text-xs font-medium",
    primary:
      "bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium",
    success:
      "bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium",
    warning:
      "bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium",
    danger:
      "bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium",
    info: "bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium",
    outline:
      "border border-neutral-300 text-neutral-700 px-2 py-1 rounded-full text-xs font-medium bg-white",

    // Dark theme badges
    defaultDark:
      "bg-neutral-800 text-neutral-200 px-2 py-1 rounded-full text-xs font-medium",
    primaryDark:
      "bg-blue-900/50 text-blue-300 px-2 py-1 rounded-full text-xs font-medium",
    successDark:
      "bg-green-900/50 text-green-300 px-2 py-1 rounded-full text-xs font-medium",
    warningDark:
      "bg-yellow-900/50 text-yellow-300 px-2 py-1 rounded-full text-xs font-medium",
    dangerDark:
      "bg-red-900/50 text-red-300 px-2 py-1 rounded-full text-xs font-medium",
  },

  text: {
    // Semantic text colors with proper contrast
    heading: "text-neutral-900 font-semibold",
    headingDark: "text-neutral-100 font-semibold",
    body: "text-neutral-700",
    bodyDark: "text-neutral-300",
    muted: "text-neutral-500",
    mutedDark: "text-neutral-400",
    caption: "text-neutral-500 text-sm",
    captionDark: "text-neutral-400 text-sm",

    // Status text colors
    error: "text-red-600",
    errorDark: "text-red-400",
    success: "text-green-600",
    successDark: "text-green-400",
    warning: "text-yellow-600",
    warningDark: "text-yellow-400",
    info: "text-blue-600",
    infoDark: "text-blue-400",

    // Links with better accessibility
    link: "text-blue-600 hover:text-blue-700 underline underline-offset-2 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded",
    linkDark:
      "text-blue-400 hover:text-blue-300 underline underline-offset-2 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-neutral-900 rounded",
  },

  alert: {
    info: "bg-blue-50 border border-blue-200 text-blue-800 rounded-lg p-4",
    success:
      "bg-green-50 border border-green-200 text-green-800 rounded-lg p-4",
    warning:
      "bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg p-4",
    error: "bg-red-50 border border-red-200 text-red-800 rounded-lg p-4",

    // Dark theme alerts
    infoDark:
      "bg-blue-900/20 border border-blue-800/30 text-blue-300 rounded-lg p-4",
    successDark:
      "bg-green-900/20 border border-green-800/30 text-green-300 rounded-lg p-4",
    warningDark:
      "bg-yellow-900/20 border border-yellow-800/30 text-yellow-300 rounded-lg p-4",
    errorDark:
      "bg-red-900/20 border border-red-800/30 text-red-300 rounded-lg p-4",
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
