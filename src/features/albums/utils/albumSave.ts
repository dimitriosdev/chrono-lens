/**
 * Album Save Utilities
 *
 * Shared logic for uploading album pages and images.
 * Used by both create and edit album flows.
 */

import { AlbumPage, AlbumImage, TemplateSlot } from "@/shared/types/album";
import { uploadImage } from "@/shared/lib/storage";

/**
 * Result of processing album pages for upload
 */
export interface ProcessedAlbumData {
  pages: AlbumPage[];
  images: AlbumImage[];
  coverUrl?: string;
}

/**
 * Options for processing album pages
 */
export interface ProcessAlbumPagesOptions {
  pages: AlbumPage[];
  albumId: string;
  onProgress?: (current: number, total: number) => void;
}

/**
 * Check if a URL is a local blob or data URL that needs uploading
 */
function isLocalUrl(url: string): boolean {
  return url.startsWith("blob:") || url.startsWith("data:");
}

/**
 * Convert a blob/data URL to a File object
 */
async function urlToFile(
  url: string,
  pageId: string,
  slotIndex: number,
): Promise<File> {
  const response = await fetch(url);
  const blob = await response.blob();
  return new File([blob], `page-${pageId}-slot-${slotIndex}.jpg`, {
    type: blob.type || "image/jpeg",
  });
}

/**
 * Process album pages, uploading any local images to storage
 *
 * @param options - Processing options
 * @returns Processed pages with uploaded image URLs
 */
export async function processAlbumPages({
  pages,
  albumId,
  onProgress,
}: ProcessAlbumPagesOptions): Promise<ProcessedAlbumData> {
  const uploadedPages: AlbumPage[] = [];
  const albumImages: AlbumImage[] = [];
  let imageIndex = 0;

  // Count total images for progress
  const totalImages = pages.reduce(
    (sum, page) => sum + page.slots.filter((s) => s.imageId).length,
    0,
  );
  let processedImages = 0;

  for (const page of pages) {
    const uploadedSlots: TemplateSlot[] = [];

    for (let i = 0; i < page.slots.length; i++) {
      const slot = page.slots[i];

      if (slot.imageId) {
        let imageUrl = slot.imageId;

        // Upload local blob/data URLs to storage
        if (isLocalUrl(slot.imageId)) {
          const file = await urlToFile(slot.imageId, page.id, i);
          imageUrl = await uploadImage(file, albumId, imageIndex++);
        }

        uploadedSlots.push({
          ...slot,
          imageId: imageUrl,
        });

        albumImages.push({
          url: imageUrl,
          description: "",
        });

        processedImages++;
        onProgress?.(processedImages, totalImages);
      } else {
        uploadedSlots.push(slot);
      }
    }

    uploadedPages.push({
      ...page,
      slots: uploadedSlots,
    });
  }

  return {
    pages: uploadedPages,
    images: albumImages,
    coverUrl: albumImages[0]?.url,
  };
}

/**
 * Create album layout metadata from pages
 */
export function createAlbumLayoutMetadata(pageCount: number) {
  return {
    type: "slideshow" as const,
    name: `${pageCount} Page Slideshow`,
    description: `Multi-page slideshow with ${pageCount} pages`,
  };
}

/**
 * Create default mat config from first page
 */
export function createMatConfigFromPages(pages: AlbumPage[]) {
  const firstPage = pages[0];
  return {
    matWidth: firstPage?.matWidth ?? 8,
    matColor: firstPage?.matColor ?? "#FFFFFF",
    backgroundColor: "#f3f4f6",
    textColor: "#000000",
  };
}
