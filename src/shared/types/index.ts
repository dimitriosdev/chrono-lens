/**
 * Shared Types Barrel Export
 *
 * Re-exports all shared type definitions for easy importing.
 */

export * from "./album";
export * from "./layout";
export * from "./form";
export * from "./ui";
export * from "./auth";

// Frame texture types (avoid conflicts by explicit export)
export type {
  FrameTexture,
  FrameConfig,
  FrameAssembly,
  TextureCategory,
  CornerJointType,
  WearPattern,
  AgingEffect,
  MatThickness,
  MatOpening,
  MatOpeningStyle,
  WoodTexture,
  MetalTexture,
  FabricTexture,
  PaperTexture,
  SpecialtyTexture,
  FramePreset,
  TextureLibrary,
  MatConfig as AdvancedMatConfig, // Renamed to avoid conflict
} from "./frameTextures";
