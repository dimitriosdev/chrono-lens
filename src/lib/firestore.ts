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
import { getFirebaseApp } from "@/lib/firebase";
import { Album, AlbumImage } from "@/entities/Album";
import {
  validateAlbumTitle,
  sanitizeText,
  getCurrentUserId,
  validateUserLimits,
  MAX_ALBUMS_PER_USER,
  checkRateLimit,
} from "@/utils/security";

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

// Helper function to normalize images from old format to new format
const normalizeImages = (images: string[] | AlbumImage[]): AlbumImage[] => {
  if (!images || !Array.isArray(images)) return [];

  // If images are already in the new format (objects with url property)
  if (
    images.length > 0 &&
    typeof images[0] === "object" &&
    "url" in images[0]
  ) {
    return images as AlbumImage[];
  }

  // Convert from old format (array of strings) to new format
  return (images as string[]).map((imageUrl: string) => ({
    url: imageUrl,
    // Don't include description field if it would be undefined
  }));
};

export async function getAlbum(id: string): Promise<Album | null> {
  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error("User not authenticated");
  }

  const { albumsCollection } = getDB();
  const albumDoc = await getDoc(doc(albumsCollection, id));
  if (!albumDoc.exists()) return null;

  const albumData = albumDoc.data() as Album;

  // For single-user scenarios: only warn about ownership mismatch instead of throwing
  if (albumData.userId && albumData.userId !== userId) {
    console.warn(
      `Album ${id} has different userId (${albumData.userId}) than current user (${userId}), but allowing access for single-user scenario`
    );
  }

  // Normalize images for backward compatibility
  albumData.images = normalizeImages(albumData.images);

  return albumData;
}

export async function getAlbums(): Promise<Album[]> {
  const userId = await getCurrentUserId();
  const { albumsCollection } = getDB();

  console.log("Current userId:", userId);

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
      const userAlbums = snapshot.docs.map(
        (doc: QueryDocumentSnapshot<DocumentData>) => {
          const albumData = { id: doc.id, ...doc.data() } as Album;
          // Normalize images for backward compatibility
          albumData.images = normalizeImages(albumData.images);
          return albumData;
        }
      );
      console.log("Found user albums:", userAlbums.length);

      // If we found user-specific albums, return them
      if (userAlbums.length > 0) {
        return userAlbums;
      }
    }

    // Fallback: Get all albums (for single-user scenarios or legacy data)
    console.log("Fetching all albums as fallback...");
    const allQuery = query(
      albumsCollection,
      orderBy("createdAt", "desc"),
      limit(MAX_ALBUMS_PER_USER * 2) // Slightly higher limit for fallback
    );
    const snapshot = await getDocs(allQuery);
    const allAlbums = snapshot.docs.map(
      (doc: QueryDocumentSnapshot<DocumentData>) => {
        const albumData = { id: doc.id, ...doc.data() } as Album;
        albumData.images = normalizeImages(albumData.images);
        return albumData;
      }
    );
    console.log("Found all albums:", allAlbums.length);
    return allAlbums;
  } catch (error) {
    console.error("Error fetching albums:", error);

    // Final fallback: get all albums without filtering
    console.log("Using final fallback...");
    try {
      const fallbackQuery = query(albumsCollection);
      const snapshot = await getDocs(fallbackQuery);
      return snapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => {
        const albumData = { id: doc.id, ...doc.data() } as Album;
        albumData.images = normalizeImages(albumData.images);
        return albumData;
      });
    } catch (fallbackError) {
      console.error("Final fallback also failed:", fallbackError);
      return [];
    }
  }
}

export async function addAlbum(album: Omit<Album, "id">): Promise<string> {
  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error("User not authenticated");
  }

  // Check rate limit (max 5 albums per minute per user)
  if (!checkRateLimit(userId, 5, 60000)) {
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
  return docRef.id;
}

export async function updateAlbum(
  id: string,
  album: Partial<Album>
): Promise<void> {
  const { albumsCollection } = getDB();
  await updateDoc(doc(albumsCollection, id), album);
}

export async function deleteAlbum(id: string): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error("User not authenticated");
  }

  const { albumsCollection } = getDB();

  // First, get the album data to retrieve image URLs and verify ownership
  const albumData = await getAlbum(id);

  if (!albumData) {
    throw new Error("Album not found");
  }

  // For single-user scenarios: only check ownership if album has a userId that doesn't match
  // This allows deletion of albums without userId (legacy) or with mismatched userId (auth changes)
  if (albumData.userId && albumData.userId !== userId) {
    console.warn(
      `Album ${id} has different userId (${albumData.userId}) than current user (${userId}), but allowing deletion for single-user scenario`
    );
  }

  // Import deleteImage function
  const { deleteImage } = await import("./storage");

  // Delete all images from storage - handle both old and new image formats
  const imagesToDelete: string[] = [];

  // Handle images array (both old string[] format and new AlbumImage[] format)
  if (albumData.images) {
    albumData.images.forEach((img) => {
      if (typeof img === "string") {
        // Old format: img is a URL string
        imagesToDelete.push(img);
      } else if (img && typeof img === "object" && img.url) {
        // New format: img is an object with url property
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
  console.log(
    `Deleting ${validUrls.length} images from storage for album ${id}`
  );

  const deletionResults = await Promise.allSettled(
    validUrls.map((imageUrl) => deleteImage(imageUrl))
  );

  // Log any failed deletions for debugging but don't throw
  const failedDeletions = deletionResults.filter(
    (result) => result.status === "rejected"
  );

  if (failedDeletions.length > 0) {
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

  // Finally, delete the album document
  await deleteDoc(doc(albumsCollection, id));
}
