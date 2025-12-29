/**
 * Color Palette
 * WCAG AA/AAA compliant color tokens
 */

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
    500: "#22c55e",
    600: "#16a34a",
    700: "#15803d",
    800: "#166534",
    900: "#14532d",
    contrast: "#047857",
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
    contrast: "#b45309",
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
    contrast: "#991b1b",
  },

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
    background: "#ffffff",
    foreground: "#000000",
    primary: "#fafafa",
    secondary: "#f5f5f5",
    muted: "#f1f5f9",
    accent: "#f8fafc",
    dark: {
      background: "#0a0a0a",
      foreground: "#fafafa",
      primary: "#111111",
      secondary: "#1a1a1a",
      muted: "#262626",
      accent: "#171717",
    },
  },

  // Border colors
  border: {
    light: "#e2e8f0",
    default: "#cbd5e1",
    medium: "#94a3b8",
    strong: "#64748b",
    dark: "#475569",
  },
} as const;

export type Colors = typeof colors;
