// Barrel export for albums feature components
export { default as MatImage } from "./MatImage";
export { default as EnhancedColorPicker } from "./EnhancedColorPicker";
export { default as ResponsiveMatImage } from "./ResponsiveMatImage";
export { default as SlideshowDebugInfo } from "./SlideshowDebugInfo";
export { default as SlideshowErrorBoundary } from "./SlideshowErrorBoundary";
export { default as ImageErrorBoundary } from "./ImageErrorBoundary";

// Re-export types
export type { MatImageProps, MatConfig, GridInfo } from "./MatImage";
export type { EnhancedColorPickerProps } from "./EnhancedColorPicker";
export type { ResponsiveMatImageProps } from "./ResponsiveMatImage";
export type {
  SlideshowErrorBoundaryProps,
  ErrorFallbackProps as SlideshowErrorFallbackProps,
} from "./SlideshowErrorBoundary";
export type {
  ImageErrorBoundaryProps,
  ImageErrorFallbackProps,
} from "./ImageErrorBoundary";
