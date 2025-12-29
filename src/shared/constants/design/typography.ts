/**
 * Typography Scale
 * Font sizes, weights, and semantic text styles
 */

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
    "7xl": "4.5rem",
    "8xl": "6rem",
  },

  lineHeights: {
    xs: "1rem",
    sm: "1.25rem",
    base: "1.5rem",
    lg: "1.75rem",
    xl: "1.75rem",
    "2xl": "2rem",
    "3xl": "2.375rem",
    "4xl": "2.5rem",
    "5xl": "3.75rem",
    "6xl": "4.5rem",
    "7xl": "5.25rem",
    "8xl": "7.5rem",
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

  // Semantic typography scale (Tailwind classes)
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

export type Typography = typeof typography;
