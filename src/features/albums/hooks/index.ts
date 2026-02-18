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

// Radio player
export { useRadioPlayer } from "./useRadioPlayer";
export type {
  RadioPlaybackStatus,
  RadioPlayerState,
  RadioPlayerActions,
  UseRadioPlayerReturn,
} from "./useRadioPlayer";

// Auto-hide behavior
export { useAutoHide } from "./useAutoHide";
