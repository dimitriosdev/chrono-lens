import { AlbumLayout } from "@/features/albums/AlbumLayout";

export interface AlbumImage {
  url: string;
  description?: string;
}

export interface Album {
  id: string; // Firestore document ID
  title: string;
  description?: string;
  coverUrl?: string;
  images: AlbumImage[];
  layout?: AlbumLayout;
  matConfig?: import("@/components/MatBoard").MatConfig;
  userId?: string; // Owner user ID for security and isolation (optional for backward compatibility)
  createdAt?: Date;
  updatedAt?: Date;
  // Timing configuration for different layout types
  timing?: {
    slideshow?: {
      cycleDuration: number; // seconds between slides
    };
    interactive?: {
      autoAdvance: boolean; // enable auto-advance in non-slideshow layouts
      autoAdvanceDuration: number; // seconds before auto-advance
      transitionSpeed: "fast" | "normal" | "smooth"; // animation speed
    };
  };
  // Add more fields as needed (e.g., tags, etc.)
}
