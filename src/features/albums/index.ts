/**
 * Albums Feature Barrel Export
 *
 * Centralized export point for all album-related functionality.
 */

// Components
export { AlbumForm } from "./components/AlbumForm";
export { default as AlbumGrid } from "./components/AlbumGrid";
export { ImageGrid } from "./components/ImageGrid";
export { default as ImageProcessingStatus } from "./components/ImageProcessingStatus";

// Layout Components
export { LayoutViewer } from "./components";

// Form Components
export * from "./components/forms";

// Hooks
export * from "./hooks/useAlbumForm";

// Types (re-export from shared for convenience)
export type {
  Album,
  AlbumImage,
  MatConfig,
  AlbumPrivacy,
} from "@/shared/types/album";

// Constants
export * from "./constants/AlbumLayout";
