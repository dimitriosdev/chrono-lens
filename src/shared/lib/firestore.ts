import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  DocumentData,
  QuerySnapshot,
  Firestore,
  CollectionReference,
  QueryDocumentSnapshot,
} from "firebase/firestore";
import { getFirebaseApp } from "@/shared/lib/firebase";
import { firebaseUsageMonitor } from "@/shared/lib/firebaseUsageMonitor";
import { Album } from "@/features/albums/types/Album";
import {
  validateAlbumTitle,
  sanitizeText,
  getCurrentUserId,
  validateUserLimits,
  MAX_ALBUMS_PER_USER,
  checkRateLimit,
} from "@/shared/utils/security";

// Initialize Firestore lazily
let db: Firestore | null = null;
let albumsCollection: CollectionReference<DocumentData> | null = null;

const getDB = () => {
  if (!db) {
    const app = getFirebaseApp();
    if (!app) {
      throw new Error("Firebase app not initialized");
    }
    db = getFirestore(app);
    albumsCollection = collection(db, "albums");
  }
  return { db, albumsCollection: albumsCollection! };
};

export async function getAlbum(id: string): Promise<Album | null> {
  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error("User not authenticated");
  }

  // Check if read operation is allowed
  const canRead = firebaseUsageMonitor.canPerformOperation("read", 1);
  if (!canRead.allowed) {
    throw new Error(`Firebase quota exceeded: ${canRead.reason}`);
  }

  const { albumsCollection } = getDB();
  const albumDoc = await getDoc(doc(albumsCollection, id));

  // Record the read operation
  firebaseUsageMonitor.recordOperation("read", 1);

  if (!albumDoc.exists()) return null;

  const albumData = albumDoc.data() as Album;

  // For single-user scenarios: only allow access if album has userId mismatch
  if (albumData.userId && albumData.userId !== userId) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        `Album ${id} has different userId (${albumData.userId}) than current user (${userId}), but allowing access for single-user scenario`
      );
    }
  }

  return albumData;
}

export async function getAlbums(): Promise<Album[]> {
  const userId = await getCurrentUserId();
  const { albumsCollection } = getDB();

  // Check if read operation is allowed (estimate up to 20 reads for safety)
  const canRead = firebaseUsageMonitor.canPerformOperation("read", 20);
  if (!canRead.allowed) {
    throw new Error(`Firebase quota exceeded: ${canRead.reason}`);
  }

  if (process.env.NODE_ENV === "development") {
    console.log("Current userId:", userId);
  }

  try {
    // If user is authenticated, try to get their albums first
    if (userId) {
      const userQuery = query(
        albumsCollection,
        where("userId", "==", userId),
        orderBy("createdAt", "desc"),
        limit(MAX_ALBUMS_PER_USER)
      );

      const snapshot: QuerySnapshot<DocumentData> = await getDocs(userQuery);

      // Record actual reads performed
      firebaseUsageMonitor.recordOperation("read", snapshot.docs.length);

      const userAlbums = snapshot.docs.map(
        (doc: QueryDocumentSnapshot<DocumentData>) => {
          const albumData = { id: doc.id, ...doc.data() } as Album;
          return albumData;
        }
      );

      if (process.env.NODE_ENV === "development") {
        console.log("Found user albums:", userAlbums.length);
      }

      // If we found user-specific albums, return them
      if (userAlbums.length > 0) {
        return userAlbums;
      }
    }

    // Fallback: Get all albums (for single-user scenarios or legacy data)
    if (process.env.NODE_ENV === "development") {
      console.log("Fetching all albums as fallback...");
    }

    const allQuery = query(
      albumsCollection,
      orderBy("createdAt", "desc"),
      limit(MAX_ALBUMS_PER_USER * 2) // Slightly higher limit for fallback
    );
    const snapshot = await getDocs(allQuery);

    // Record actual reads performed
    firebaseUsageMonitor.recordOperation("read", snapshot.docs.length);

    const allAlbums = snapshot.docs.map(
      (doc: QueryDocumentSnapshot<DocumentData>) => {
        const albumData = { id: doc.id, ...doc.data() } as Album;
        return albumData;
      }
    );

    if (process.env.NODE_ENV === "development") {
      console.log("Found all albums:", allAlbums.length);
    }

    return allAlbums;
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error fetching albums:", error);
    }

    // Final fallback: get all albums without filtering
    if (process.env.NODE_ENV === "development") {
      console.log("Using final fallback...");
    }

    try {
      const fallbackQuery = query(albumsCollection);
      const snapshot = await getDocs(fallbackQuery);

      // Record actual reads performed
      firebaseUsageMonitor.recordOperation("read", snapshot.docs.length);

      return snapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => {
        const albumData = { id: doc.id, ...doc.data() } as Album;
        return albumData;
      });
    } catch (fallbackError) {
      if (process.env.NODE_ENV === "development") {
        console.error("Final fallback also failed:", fallbackError);
      }
      return [];
    }
  }
}

export async function addAlbum(album: Omit<Album, "id">): Promise<string> {
  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error("User not authenticated");
  }

  // Check if write operation is allowed
  const canWrite = firebaseUsageMonitor.canPerformOperation("write", 1);
  if (!canWrite.allowed) {
    throw new Error(`Firebase quota exceeded: ${canWrite.reason}`);
  }

  // Check album creation limits
  const albumCreationCheck = firebaseUsageMonitor.recordAlbumCreation();
  if (!albumCreationCheck.allowed) {
    throw new Error(albumCreationCheck.reason);
  }

  // Check rate limit (max 5 albums per minute per user, higher in development)
  const maxAlbums = process.env.NODE_ENV === "development" ? 20 : 5;
  if (!checkRateLimit(userId, maxAlbums, 60000)) {
    throw new Error(
      "Rate limit exceeded. Please wait before creating another album."
    );
  }

  // Validate album title
  const titleValidation = validateAlbumTitle(album.title);
  if (!titleValidation.isValid) {
    throw new Error(titleValidation.error);
  }

  // Check user limits
  const userAlbums = await getAlbums();
  const limitValidation = validateUserLimits(
    userAlbums.length,
    album.images?.length || 0
  );
  if (!limitValidation.isValid) {
    throw new Error(limitValidation.error);
  }

  // Sanitize data and add user ownership
  const secureAlbum = {
    ...album,
    userId,
    title: sanitizeText(album.title),
    description: sanitizeText(album.description || ""),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const { albumsCollection } = getDB();
  const docRef = await addDoc(albumsCollection, secureAlbum);

  // Record the write operation
  firebaseUsageMonitor.recordOperation("write", 1);

  return docRef.id;
}

export async function updateAlbum(
  id: string,
  album: Partial<Album>
): Promise<void> {
  // Check if write operation is allowed
  const canWrite = firebaseUsageMonitor.canPerformOperation("write", 1);
  if (!canWrite.allowed) {
    throw new Error(`Firebase quota exceeded: ${canWrite.reason}`);
  }

  const { albumsCollection } = getDB();
  await updateDoc(doc(albumsCollection, id), album);

  // Record the write operation
  firebaseUsageMonitor.recordOperation("write", 1);
}

export async function deleteAlbum(id: string): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error("User not authenticated");
  }

  // Check if read and write operations are allowed
  const canRead = firebaseUsageMonitor.canPerformOperation("read", 1);
  if (!canRead.allowed) {
    throw new Error(`Firebase quota exceeded: ${canRead.reason}`);
  }

  const canWrite = firebaseUsageMonitor.canPerformOperation("write", 1);
  if (!canWrite.allowed) {
    throw new Error(`Firebase quota exceeded: ${canWrite.reason}`);
  }

  const { albumsCollection } = getDB();

  // First, get the album data to retrieve image URLs and verify ownership
  const albumData = await getAlbum(id);

  if (!albumData) {
    throw new Error("Album not found");
  }

  // For single-user scenarios: only check ownership if album has a userId that doesn't match
  // This allows deletion of albums without userId (legacy) or with mismatched userId (auth changes)
  // For single-user scenarios: allow deletion even with userId mismatch
  if (albumData.userId && albumData.userId !== userId) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        `Album ${id} has different userId (${albumData.userId}) than current user (${userId}), but allowing deletion for single-user scenario`
      );
    }
  }

  // Import deleteImage function
  const { deleteImage } = await import("./storage");

  // Delete all images from storage
  const imagesToDelete: string[] = [];

  // Handle images array - now only in AlbumImage[] format
  if (albumData.images) {
    albumData.images.forEach((img) => {
      if (img && img.url) {
        imagesToDelete.push(img.url);
      }
    });
  }

  // Add cover image if it exists
  if (albumData.coverUrl) {
    imagesToDelete.push(albumData.coverUrl);
  }

  // Filter out any undefined/null URLs and delete images in parallel
  const validUrls = imagesToDelete.filter(
    (url) => url && typeof url === "string"
  );

  if (process.env.NODE_ENV === "development") {
    console.log(
      `Deleting ${validUrls.length} images from storage for album ${id}`
    );
  }

  const deletionResults = await Promise.allSettled(
    validUrls.map((imageUrl) => deleteImage(imageUrl))
  );

  // Log any failed deletions for debugging but don't throw
  const failedDeletions = deletionResults.filter(
    (result) => result.status === "rejected"
  );

  if (failedDeletions.length > 0 && process.env.NODE_ENV === "development") {
    console.warn(
      `Failed to delete ${failedDeletions.length} out of ${validUrls.length} images from storage`
    );
    failedDeletions.forEach((result, index) => {
      console.warn(
        `Failed to delete image ${validUrls[index]}:`,
        (result as PromiseRejectedResult).reason
      );
    });
  }

  // Calculate storage freed by successful deletions
  const successfulDeletions = deletionResults.filter(
    (result) => result.status === "fulfilled"
  );

  // Estimate storage freed (we don't have exact file sizes, so use average estimate)
  const estimatedBytesFreed = successfulDeletions.length * (2 * 1024 * 1024); // 2MB average
  if (estimatedBytesFreed > 0) {
    firebaseUsageMonitor.recordFileDeletion(estimatedBytesFreed);
  }

  // Finally, delete the album document
  await deleteDoc(doc(albumsCollection, id));

  // Record the write operation (delete)
  firebaseUsageMonitor.recordOperation("write", 1);
}
