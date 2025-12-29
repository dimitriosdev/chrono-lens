/**
 * Animation Tokens
 * Durations and easing functions
 */

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

export const easings = {
  linear: "linear",
  in: "cubic-bezier(0.4, 0, 1, 1)",
  out: "cubic-bezier(0, 0, 0.2, 1)",
  "in-out": "cubic-bezier(0.4, 0, 0.2, 1)",
  "bounce-soft": "cubic-bezier(0.34, 1.56, 0.64, 1)",
} as const;

export type Durations = typeof durations;
export type Easings = typeof easings;
