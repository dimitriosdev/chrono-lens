// Barrel export for albums feature components
export { default as MatImage } from "./MatImage";
export { default as EnhancedColorPicker } from "./EnhancedColorPicker";
export { default as SlideshowErrorBoundary } from "./SlideshowErrorBoundary";
export { default as ImageErrorBoundary } from "./ImageErrorBoundary";

// Layout Components
export { LayoutViewer } from "./LayoutViewer";

// Advanced Frame Components
export { FrameTexturePicker } from "./FrameTexturePicker";

// Enhanced Form Components
export { default as AlbumForm } from "./AlbumForm";
export { default as AlbumCreationWizard } from "./AlbumCreationWizard";
export { default as WizardBasicInfo } from "./WizardBasicInfo";
export { default as WizardImages } from "./WizardImages";

// Re-export types
export type { MatImageProps, MatConfig, GridInfo } from "./MatImage";
export type { EnhancedColorPickerProps } from "./EnhancedColorPicker";
export type {
  SlideshowErrorBoundaryProps,
  ErrorFallbackProps as SlideshowErrorFallbackProps,
} from "./SlideshowErrorBoundary";
export type {
  ImageErrorBoundaryProps,
  ImageErrorFallbackProps,
} from "./ImageErrorBoundary";
