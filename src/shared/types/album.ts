// Album and image related types

export interface AlbumImage {
  url: string;
  description?: string;
  file?: File;
  id?: string;
}

// Simple mat config - only what's actually used
export interface MatConfig {
  matWidth: number;
  matColor: string;
  backgroundColor?: string; // Optional background color separate from mat
  textColor?: string; // Optional text color for captions and titles
}

export interface ViewerSettings {
  backgroundColor: string;
  matColor?: string; // Override for album mat color
}

// Frame styles for photo wall layouts
export type FrameStyleType = "modern" | "classic" | "rustic" | "minimalist";

export interface FrameStyle {
  id: FrameStyleType;
  name: string;
  borderWidth: number; // in pixels
  borderColor: string;
  shadowIntensity: "none" | "light" | "medium" | "heavy";
  cornerStyle: "sharp" | "rounded" | "beveled";
  imageUrl?: string; // Optional SVG frame image
  borderImageSlice?: number; // For border-image CSS
}

// Individual photo position in a wall layout
export interface PhotoWallItem {
  imageIndex: number; // Index in album.images array
  x: number; // Percentage (0-100)
  y: number; // Percentage (0-100)
  width: number; // Percentage (0-100)
  height: number; // Percentage (0-100)
  rotation?: number; // Degrees (-15 to 15 for slight tilts)
  frameStyle: FrameStyleType;
  matWidth?: number; // Optional mat override
  matColor?: string; // Optional mat color override
  zIndex?: number; // For overlapping frames
}

// Wall layout preset definition
export interface WallLayoutPreset {
  id: string;
  name: string;
  description: string;
  minImages: number;
  maxImages: number;
  items: Omit<PhotoWallItem, "imageIndex">[]; // Template without image assignments
}

// Image positioning within a frame (for pan and zoom)
export interface ImagePosition {
  x: number; // Percentage offset (-50 to 50)
  y: number; // Percentage offset (-50 to 50)
  zoom: number; // Scale factor (0.3 to 3.0)
}

// Template slot for the new UX
export interface TemplateSlot {
  id: string;
  x: number; // Percentage (0-100)
  y: number; // Percentage (0-100)
  width: number; // Percentage (0-100)
  height: number; // Percentage (0-100)
  imageId?: string; // Reference to uploaded image
  position?: ImagePosition; // Image pan/zoom state
  placeholder?: string; // Text placeholder like "BLEIB positiv"
}

// Layout template definition
export interface LayoutTemplate {
  id: string;
  name: string;
  photoCount: 1 | 2 | 3 | 4 | 6 | 12;
  slots: TemplateSlot[];
  orientation: "portrait" | "landscape";
  frameWidth?: number;
  frameColor?: string;
  matWidth?: number;
  matColor?: string;
}

// Album page for multi-page slideshow
export interface AlbumPage {
  id: string;
  templateId: string;
  photoCount: 1 | 2 | 3 | 4 | 6 | 12;
  orientation: "portrait" | "landscape";
  slots: TemplateSlot[];
  frameWidth?: number;
  frameColor?: string;
  matWidth?: number;
  matColor?: string;
  backgroundColor?: string;
}

export type LayoutType = "slideshow" | "grid" | "wall" | "template";

export type AlbumPrivacy = "public" | "private";

export interface AlbumLayout {
  type: LayoutType;
  name: string;
  description: string;
  grid?: { rows: number; cols: number }; // Only for grid layouts
  wall?: {
    presetId: string;
    items: PhotoWallItem[]; // Actual photo placements
  }; // Only for wall layouts
  template?: {
    templateId: string;
    slots: TemplateSlot[]; // User-configured slots with images
  }; // Only for template layouts
}

export interface Album {
  id: string;
  title: string;
  description?: string;
  coverUrl?: string;
  images: AlbumImage[];
  layout?: AlbumLayout;
  pages?: AlbumPage[]; // Multi-page slideshow support
  matConfig?: MatConfig; // Simple mat configuration
  userId?: string;
  createdAt?: Date;
  updatedAt?: Date;
  cycleDuration?: number; // Seconds between page transitions
  // Simple privacy settings
  privacy: AlbumPrivacy;
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
