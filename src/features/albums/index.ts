/**
 * Albums Feature Barrel Export
 *
 * Centralized export point for all album-related functionality.
 */

// Components
export { AlbumForm } from "./components/AlbumForm";
export { default as AlbumGrid } from "./components/AlbumGrid";
export { EnhancedMatBoard } from "./components/EnhancedMatBoard";
export { MatBoard } from "./components/MatBoard";
export { ImageGrid } from "./components/ImageGrid";
export { default as ImageProcessingStatus } from "./components/ImageProcessingStatus";
export { SmartLayoutSelector } from "./components/SmartLayoutSelector";

// Form Components
export * from "./components/forms";

// Hooks
export * from "./hooks/useAlbumForm";

// Types (Album entity is now here)
export * from "./types/Album";

// Constants
export * from "./constants/AlbumLayout";
