import { AlbumLayout } from "@/features/albums/constants/AlbumLayout";

export interface AlbumImage {
  url: string;
  description?: string;
  file?: File; // Optional file for upload process
  id?: string;
}

export interface MatConfig {
  matWidth: number;
  matColor: string;
  backgroundColor?: string;
  textColor?: string;
}

export type AlbumPrivacy = "public" | "private" | "shared";

export interface Album {
  id: string; // Firestore document ID
  title: string;
  description?: string;
  coverUrl?: string;
  images: AlbumImage[];
  layout?: AlbumLayout;
  matConfig?: MatConfig;
  userId?: string; // Owner user ID for security and isolation (optional for backward compatibility)
  createdAt?: Date;
  updatedAt?: Date;
  cycleDuration?: number; // Simplified: just one duration setting
  // Simple privacy settings
  privacy: AlbumPrivacy;
  shareToken?: string; // Simple share token for shared albums
  tags?: string[]; // Support for tags mentioned in the form
}
