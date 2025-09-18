/**
 * Simple utility to create test albums with different layouts
 * This helps test the slideshow and grid layouts functionality
 */

import { getAlbums, updateAlbum } from "@/shared/lib/firestore";
import {
  createLayout,
  LayoutType,
} from "@/features/albums/constants/AlbumLayout";

/**
 * Update an existing album's layout
 */
export async function setAlbumLayout(
  albumId: string,
  layoutType: LayoutType,
  imageCount: number = 4
) {
  try {
    const layout = createLayout(layoutType, imageCount);
    await updateAlbum(albumId, {
      layout,
      updatedAt: new Date(),
    });
    console.log(`Album ${albumId} layout updated to: ${layout.name}`);
    return true;
  } catch (error) {
    console.error("Failed to update album layout:", error);
    return false;
  }
}

/**
 * Set the first album to use a grid layout for testing
 */
export async function setFirstAlbumToGrid() {
  try {
    const albums = await getAlbums();
    if (albums.length === 0) {
      console.log("No albums found");
      return false;
    }

    const firstAlbum = albums[0];
    const imageCount = firstAlbum.images?.length || 4;
    await setAlbumLayout(firstAlbum.id, "grid", imageCount);
    console.log(`Set album "${firstAlbum.title}" to use grid layout`);
    return true;
  } catch (error) {
    console.error("Failed to set first album to grid:", error);
    return false;
  }
}

/**
 * Set the first album to use a slideshow layout for testing
 */
export async function setFirstAlbumToSlideshow() {
  try {
    const albums = await getAlbums();
    if (albums.length === 0) {
      console.log("No albums found");
      return false;
    }

    const firstAlbum = albums[0];
    const imageCount = firstAlbum.images?.length || 1;
    await setAlbumLayout(firstAlbum.id, "slideshow", imageCount);
    console.log(`Set album "${firstAlbum.title}" to use slideshow layout`);
    return true;
  } catch (error) {
    console.error("Failed to set first album to slideshow:", error);
    return false;
  }
}

// Expose functions globally for console testing (development only)
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  interface WindowWithTestUtils extends Window {
    setAlbumLayout?: typeof setAlbumLayout;
    setFirstAlbumToGrid?: typeof setFirstAlbumToGrid;
    setFirstAlbumToSlideshow?: typeof setFirstAlbumToSlideshow;
  }

  const win = window as WindowWithTestUtils;
  win.setAlbumLayout = setAlbumLayout;
  win.setFirstAlbumToGrid = setFirstAlbumToGrid;
  win.setFirstAlbumToSlideshow = setFirstAlbumToSlideshow;
}
