// Album and image related types
export interface AlbumImage {
  url: string;
  description?: string;
  file?: File;
  id?: string;
}

export interface MatConfig {
  matWidth: number;
  matColor: string;
  backgroundColor?: string; // Optional background color separate from mat
}

export interface ViewerSettings {
  backgroundColor: string;
  matColor?: string; // Override for album mat color
}

export interface Album {
  id: string;
  title: string;
  description?: string;
  coverUrl?: string;
  images: AlbumImage[];
  layout?: AlbumLayout;
  matConfig?: MatConfig;
  userId?: string;
  createdAt?: Date;
  updatedAt?: Date;
  cycleDuration?: number;
}

export interface AlbumLayout {
  name: string;
  description: string;
  grid: { rows: number; cols: number };
  orientation?: "portrait" | "landscape" | "mixed";
  type: "grid" | "slideshow" | "custom" | "smart";
  isSmartLayout?: boolean;
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
