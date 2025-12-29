// Album and image related types
import { FrameAssembly } from "./frameTextures";

export interface AlbumImage {
  url: string;
  description?: string;
  file?: File;
  id?: string;
}

// Legacy mat config for backward compatibility
export interface MatConfig {
  matWidth: number;
  matColor: string;
  backgroundColor?: string; // Optional background color separate from mat
  textColor?: string; // Optional text color for captions and titles
}

// Enhanced mat config with advanced features
export interface EnhancedMatConfig extends MatConfig {
  frameAssembly?: FrameAssembly; // New frame texture system
  useAdvancedFraming?: boolean; // Flag to use new system
}

export interface ViewerSettings {
  backgroundColor: string;
  matColor?: string; // Override for album mat color
  frameAssemblyId?: string; // Reference to frame assembly
}

export type LayoutType = "slideshow" | "grid";

export type AlbumPrivacy = "public" | "private" | "shared";

export interface AlbumLayout {
  type: LayoutType;
  name: string;
  description: string;
  grid?: { rows: number; cols: number }; // Only for grid layouts
}

export interface Album {
  id: string;
  title: string;
  description?: string;
  coverUrl?: string;
  images: AlbumImage[];
  layout?: AlbumLayout;
  matConfig?: EnhancedMatConfig; // Updated to support advanced framing
  userId?: string;
  createdAt?: Date;
  updatedAt?: Date;
  cycleDuration?: number;
  // Simple privacy settings
  privacy: AlbumPrivacy;
  shareToken?: string; // Simple share token for shared albums
  tags?: string[]; // Support for tags mentioned in the form
}

export interface ImageAnalysis {
  aspectRatio: number;
  orientation: "portrait" | "landscape" | "square";
  width: number;
  height: number;
}

export interface LayoutRecommendation {
  layout: AlbumLayout;
  score: number;
  reason: string;
  analysis: {
    imageCount: number;
    orientationMatch: number;
    aspectRatioHarmony: number;
  };
}
