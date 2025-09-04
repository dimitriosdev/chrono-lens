/**
 * User Migration Utilities
 * Helps merge data from anonymous users to authenticated users
 */

import { getAlbums, addAlbum } from "@/lib/firestore";
import { getCurrentUserId } from "./security";
import type { Album } from "@/entities/Album";

export interface UserMigrationResult {
  success: boolean;
  migratedAlbums: number;
  errors: string[];
}

/**
 * Debug function to identify potential user ID conflicts
 */
export async function debugUserIdentity(): Promise<{
  currentUserId: string;
  isFirebaseAuth: boolean;
  localStorageUserId: string | null;
  isSignedIn: boolean;
}> {
  const currentUserId = await getCurrentUserId();
  const localStorageUserId = localStorage.getItem("userId");
  const isSignedIn = localStorage.getItem("isSignedIn") === "true";
  const isFirebaseAuth = !currentUserId.startsWith("user_");

  if (process.env.NODE_ENV === "development") {
    console.log("🔍 User Identity Debug:", {
      currentUserId,
      isFirebaseAuth,
      localStorageUserId,
      isSignedIn,
      domain: window.location.hostname,
    });
  }

  return {
    currentUserId,
    isFirebaseAuth,
    localStorageUserId,
    isSignedIn,
  };
}

/**
 * Migrate albums from an anonymous user ID to the current authenticated user
 * This can help resolve the issue where users have separate accounts on different domains
 */
export async function migrateFromAnonymousUser(
  anonymousUserId: string
): Promise<UserMigrationResult> {
  const result: UserMigrationResult = {
    success: false,
    migratedAlbums: 0,
    errors: [],
  };

  try {
    const currentUserId = await getCurrentUserId();

    // Don't migrate if we're still anonymous or migrating to the same user
    if (
      currentUserId.startsWith("user_") ||
      currentUserId === anonymousUserId
    ) {
      result.errors.push(
        "Cannot migrate: current user is anonymous or same as source"
      );
      return result;
    }

    // Get all albums (this will include albums from the current user context)
    // We need to temporarily override the user context to get albums from the anonymous user
    const originalGetItem = localStorage.getItem;
    localStorage.getItem = (key: string) => {
      if (key === "userId") return anonymousUserId;
      return originalGetItem.call(localStorage, key);
    };

    let albumsToMigrate: Album[] = [];
    try {
      albumsToMigrate = await getAlbums();
    } finally {
      // Restore original localStorage.getItem
      localStorage.getItem = originalGetItem;
    }

    // Filter out albums that already belong to the current user
    const albumsFromAnonymousUser = albumsToMigrate.filter(
      (album) => album.userId === anonymousUserId
    );

    if (albumsFromAnonymousUser.length === 0) {
      result.success = true;
      result.errors.push("No albums found for the anonymous user to migrate");
      return result;
    }

    // Migrate each album
    for (const album of albumsFromAnonymousUser) {
      try {
        // Create a copy of the album with the new user ID
        const newAlbum = {
          ...album,
          userId: currentUserId,
          createdAt: album.createdAt || new Date(),
          updatedAt: new Date(),
        };

        // Remove the ID to create a new album
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, ...albumWithoutId } = newAlbum;

        // Add the album under the new user
        await addAlbum(albumWithoutId);
        result.migratedAlbums++;

        if (process.env.NODE_ENV === "development") {
          console.log(`✅ Migrated album: ${album.title}`);
        }
      } catch (error) {
        const errorMsg = `Failed to migrate album "${album.title}": ${error}`;
        result.errors.push(errorMsg);
        console.error(errorMsg);
      }
    }

    result.success = result.migratedAlbums > 0;

    // Optionally clean up anonymous user albums (commented out for safety)
    // for (const album of albumsFromAnonymousUser) {
    //   try {
    //     await deleteAlbum(album.id);
    //   } catch (error) {
    //     console.warn(`Failed to delete original album ${album.id}:`, error);
    //   }
    // }
  } catch (error) {
    result.errors.push(`Migration failed: ${error}`);
  }

  return result;
}

/**
 * Check if there are potential albums from anonymous users that could be migrated
 */
export async function checkForMigratableData(): Promise<string[]> {
  const potentialAnonymousUserIds: string[] = [];

  // Check localStorage for any user IDs that look like anonymous IDs
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const value = localStorage.getItem(key || "");

      if (value && typeof value === "string" && value.startsWith("user_")) {
        potentialAnonymousUserIds.push(value);
      }
    }
  } catch (error) {
    console.warn("Failed to check localStorage for anonymous users:", error);
  }

  // Remove duplicates and current user
  const currentUserId = await getCurrentUserId();
  return [...new Set(potentialAnonymousUserIds)].filter(
    (id) => id !== currentUserId
  );
}

// Add to global window object in development for easy debugging
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  interface DevWindow extends Window {
    debugUserIdentity?: typeof debugUserIdentity;
    migrateFromAnonymousUser?: typeof migrateFromAnonymousUser;
    checkForMigratableData?: typeof checkForMigratableData;
  }

  const devWindow = window as DevWindow;
  devWindow.debugUserIdentity = debugUserIdentity;
  devWindow.migrateFromAnonymousUser = migrateFromAnonymousUser;
  devWindow.checkForMigratableData = checkForMigratableData;
}
