/**
 * Design System
 * Centralized theming and design tokens
 *
 * Usage:
 *   import { colors, typography, helpers } from '@/shared/constants/design';
 *   // or
 *   import designSystem from '@/shared/constants/design';
 */

export { colors } from "./colors";
export { typography } from "./typography";
export { spacing, borderRadius, shadows, breakpoints } from "./spacing";
export { durations, easings } from "./animation";
export { componentVariants } from "./components";
export { layout } from "./layout";
export { helpers } from "./helpers";

// Re-export types
export type { Colors } from "./colors";
export type { Typography } from "./typography";
export type { Spacing, BorderRadius, Shadows, Breakpoints } from "./spacing";
export type { Durations, Easings } from "./animation";
export type { ComponentVariants } from "./components";
export type { Layout } from "./layout";
export type { Helpers } from "./helpers";

// Default export for convenience
import { colors } from "./colors";
import { typography } from "./typography";
import { spacing, borderRadius, shadows, breakpoints } from "./spacing";
import { durations, easings } from "./animation";
import { componentVariants } from "./components";
import { layout } from "./layout";
import { helpers } from "./helpers";

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
