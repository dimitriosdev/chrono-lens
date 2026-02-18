/**
 * Albums Feature
 *
 * Centralized export point for all album-related functionality.
 * This module provides components, hooks, utilities, and types
 * for managing photo albums and slideshows.
 */

// Components
export { default as AlbumGrid } from "./components/AlbumGrid";
export { LayoutViewer } from "./components/LayoutViewer";
export { MultiPageLayoutStep } from "./components/MultiPageLayoutStep";
export {
  AlbumPageHeader,
  TitleValidationMessage,
} from "./components/AlbumPageHeader";

// Hooks
export * from "./hooks";

// Utilities
export {
  processAlbumPages,
  createAlbumLayoutMetadata,
  createMatConfigFromPages,
} from "./utils/albumSave";

// Types (re-export from shared for convenience)
export type {
  Album,
  AlbumImage,
  AlbumPage,
  MatConfig,
  AlbumPrivacy,
  AlbumLayout,
  LayoutType,
} from "@/shared/types/album";

// Constants
export * from "./constants";
