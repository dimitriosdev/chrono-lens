/**
 * Albums Feature Hooks
 *
 * Custom React hooks for album-related functionality.
 */

// Slideshow management
export { useSlideshow } from "./useSlideshow";
export type { SlideshowOptions, SlideshowHookReturn } from "./useSlideshow";

// Color preferences
export { useColorPreferences, matColors } from "./useColorPreferences";
export type {
  ColorPreferences,
  ColorActions,
  ColorPreferencesHookReturn,
} from "./useColorPreferences";
