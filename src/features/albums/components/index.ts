/**
 * Albums Feature Components
 *
 * Barrel export for all album-related components.
 */

// Core Components
export { default as AlbumGrid } from "./AlbumGrid";
export { default as MatImage } from "./MatImage";
export { default as ColorPicker } from "./ColorPicker";
export { default as SlideshowErrorBoundary } from "./SlideshowErrorBoundary";
export { default as PhotoFrame } from "./PhotoFrame";

// Layout Components
export { LayoutViewer } from "./LayoutViewer";
export { WallLayoutViewer } from "./WallLayoutViewer";
export { TemplateEditor } from "./TemplateEditor";
export { TemplateLayoutViewer } from "./TemplateLayoutViewer";
export { MultiPageLayoutStep } from "./MultiPageLayoutStep";

// Page Components
export { AlbumPageHeader, TitleValidationMessage } from "./AlbumPageHeader";

// Re-export types
export type { MatImageProps, GridInfo } from "./MatImage";
export type { ColorPickerProps } from "./ColorPicker";
export type { AlbumPageHeaderProps } from "./AlbumPageHeader";
export type {
  SlideshowErrorBoundaryProps,
  ErrorFallbackProps as SlideshowErrorFallbackProps,
} from "./SlideshowErrorBoundary";
export type { PhotoFrameProps } from "./PhotoFrame";
export type { WallLayoutViewerProps } from "./WallLayoutViewer";
