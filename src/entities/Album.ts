import { AlbumLayout } from "@/features/albums/AlbumLayout";

export interface Album {
  id: string; // Firestore document ID
  title: string;
  description?: string;
  coverUrl?: string;
  images: string[];
  layout?: AlbumLayout;
  matConfig?: import("@/components/MatBoard").MatConfig;
  userId?: string; // Owner user ID for security and isolation (optional for backward compatibility)
  createdAt?: Date;
  updatedAt?: Date;
  // Add more fields as needed (e.g., tags, etc.)
}
