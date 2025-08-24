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
  checkRateLimit,
  MAX_ALBUMS_PER_USER,
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

  // Only check user ownership if the album has a userId field
  if (albumData.userId && albumData.userId !== userId) {
    throw new Error("Unauthorized: Cannot access other users' albums");
  }

  // Normalize images for backward compatibility
  albumData.images = normalizeImages(albumData.images);

  return albumData;
}

export async function getAlbums(): Promise<Album[]> {
  const userId = await getCurrentUserId();
  const { albumsCollection } = getDB();

  // Temporary: Don't require authentication for debugging
  console.log("Current userId:", userId);

  try {
    // Try to get albums for the current user if userId exists
    if (userId) {
      const userQuery = query(
        albumsCollection,
        where("userId", "==", userId),
        orderBy("createdAt", "desc"),
        limit(MAX_ALBUMS_PER_USER)
      );

      const snapshot: QuerySnapshot<DocumentData> = await getDocs(userQuery);

      // If user-specific albums found, return them
      if (!snapshot.empty) {
        const userAlbums = snapshot.docs.map(
          (doc: QueryDocumentSnapshot<DocumentData>) => {
            const albumData = { id: doc.id, ...doc.data() } as Album;
            // Normalize images for backward compatibility
            albumData.images = normalizeImages(albumData.images);
            return albumData;
          }
        );
        console.log("Found user albums:", userAlbums.length);
        return userAlbums;
      }
    }

    // Fallback: get all albums (for backward compatibility)
    console.log("Fetching all albums as fallback...");
    const allQuery = query(
      albumsCollection,
      orderBy("createdAt", "desc"),
      limit(MAX_ALBUMS_PER_USER)
    );
    const snapshot = await getDocs(allQuery);
    const allAlbums = snapshot.docs.map(
      (doc: QueryDocumentSnapshot<DocumentData>) => {
        const albumData = { id: doc.id, ...doc.data() } as Album;
        // Normalize images for backward compatibility
        albumData.images = normalizeImages(albumData.images);
        return albumData;
      }
    );
    console.log("Found all albums:", allAlbums.length);
    return allAlbums;
  } catch (error) {
    console.error("Error fetching albums:", error);

    // Final fallback: get all albums without any filtering
    console.log("Using final fallback...");
    const fallbackQuery = query(albumsCollection);
    const snapshot = await getDocs(fallbackQuery);
    return snapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => {
      const albumData = { id: doc.id, ...doc.data() } as Album;
      // Normalize images for backward compatibility
      albumData.images = normalizeImages(albumData.images);
      return albumData;
    });
  }
}

export async function addAlbum(album: Omit<Album, "id">): Promise<string> {
  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error("User not authenticated");
  }

  // Rate limiting - more lenient in development
  const isDevelopment = process.env.NODE_ENV === "development";
  const maxAlbums = isDevelopment ? 50 : 5; // 50 in dev, 5 in prod
  const timeWindow = isDevelopment ? 60000 : 60000; // 1 minute in both

  if (!checkRateLimit(userId, maxAlbums, timeWindow)) {
    throw new Error(
      `Album creation rate limit exceeded. Please wait before creating more albums. (${maxAlbums} per minute allowed)`
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
  const { albumsCollection } = getDB();

  // First, get the album data to retrieve image URLs
  const albumData = await getAlbum(id);

  if (albumData) {
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

    // Log any failed deletions for debugging
    deletionResults.forEach((result, index) => {
      if (result.status === "rejected") {
        console.warn(
          `Failed to delete image ${validUrls[index]}:`,
          result.reason
        );
      }
    });
  }

  // Finally, delete the album document
  await deleteDoc(doc(albumsCollection, id));
}
