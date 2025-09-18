/**
 * Storage cleanup utilities for album management
 * These utilities help maintain clean storage structure and remove orphaned files
 */

import { getFirestore, collection, getDocs } from "firebase/firestore";
import { getStorage, ref, listAll, deleteObject } from "firebase/storage";
import { getFirebaseApp } from "@/shared/lib/firebase";

export interface CleanupResult {
  albumsFoldersCleaned: number;
  orphanedFilesDeleted: number;
  totalBytesFreed: number;
  errors: string[];
}

/**
 * Clean up orphaned album folders that don't have corresponding Firestore documents
 * This is useful after manual data cleanup or when storage gets out of sync
 */
export async function cleanupOrphanedAlbumFolders(
  userId: string
): Promise<CleanupResult> {
  const result: CleanupResult = {
    albumsFoldersCleaned: 0,
    orphanedFilesDeleted: 0,
    totalBytesFreed: 0,
    errors: [],
  };

  try {
    const app = getFirebaseApp();
    if (!app) {
      throw new Error("Firebase app not initialized");
    }

    const db = getFirestore(app);
    const storage = getStorage(app);

    // 1. Get all album IDs from Firestore
    const albumsCollection = collection(db, "albums");
    const snapshot = await getDocs(albumsCollection);
    const validAlbumIds = new Set<string>();

    snapshot.docs.forEach((doc) => {
      const albumData = doc.data();
      if (albumData.userId === userId) {
        validAlbumIds.add(doc.id);
      }
    });

    // 2. List all album folders in storage for this user
    const userAlbumsRef = ref(storage, `users/${userId}/albums/`);

    try {
      const listResult = await listAll(userAlbumsRef);

      // 3. Check each folder against valid album IDs
      for (const folderRef of listResult.prefixes) {
        const folderName = folderRef.name; // This should be the album ID

        if (!validAlbumIds.has(folderName)) {
          // This is an orphaned folder - delete it
          try {
            const folderContents = await listAll(folderRef);

            // Delete all files in the orphaned folder
            const deletePromises = folderContents.items.map(async (itemRef) => {
              try {
                await deleteObject(itemRef);
                result.orphanedFilesDeleted += 1;
                // Estimate 2MB per file (rough average for photos)
                result.totalBytesFreed += 2 * 1024 * 1024;
              } catch (error) {
                result.errors.push(
                  `Failed to delete file ${itemRef.fullPath}: ${error}`
                );
              }
            });

            await Promise.all(deletePromises);
            result.albumsFoldersCleaned += 1;
          } catch (error) {
            result.errors.push(
              `Failed to clean folder ${folderRef.fullPath}: ${error}`
            );
          }
        }
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes("does not exist")) {
        // No albums folder exists yet - this is fine
        return result;
      }
      throw error;
    }

    return result;
  } catch (error) {
    result.errors.push(`Cleanup failed: ${error}`);
    return result;
  }
}

/**
 * Get storage usage summary for a user
 */
export async function getStorageUsageSummary(userId: string): Promise<{
  totalAlbumFolders: number;
  totalFiles: number;
  albumFolders: Array<{
    albumId: string;
    fileCount: number;
    hasCorrespondingDocument: boolean;
  }>;
}> {
  const app = getFirebaseApp();
  if (!app) {
    throw new Error("Firebase app not initialized");
  }

  const db = getFirestore(app);
  const storage = getStorage(app);

  // Get valid album IDs from Firestore
  const albumsCollection = collection(db, "albums");
  const snapshot = await getDocs(albumsCollection);
  const validAlbumIds = new Set<string>();

  snapshot.docs.forEach((doc) => {
    const albumData = doc.data();
    if (albumData.userId === userId) {
      validAlbumIds.add(doc.id);
    }
  });

  // Analyze storage structure
  const userAlbumsRef = ref(storage, `users/${userId}/albums/`);
  const summary = {
    totalAlbumFolders: 0,
    totalFiles: 0,
    albumFolders: [] as Array<{
      albumId: string;
      fileCount: number;
      hasCorrespondingDocument: boolean;
    }>,
  };

  try {
    const listResult = await listAll(userAlbumsRef);

    for (const folderRef of listResult.prefixes) {
      const albumId = folderRef.name;
      const folderContents = await listAll(folderRef);
      const fileCount = folderContents.items.length;

      summary.totalAlbumFolders += 1;
      summary.totalFiles += fileCount;
      summary.albumFolders.push({
        albumId,
        fileCount,
        hasCorrespondingDocument: validAlbumIds.has(albumId),
      });
    }
  } catch (error) {
    if (error instanceof Error && !error.message.includes("does not exist")) {
      throw error;
    }
  }

  return summary;
}

export default cleanupOrphanedAlbumFolders;
