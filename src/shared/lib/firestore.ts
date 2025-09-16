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
  // Ensure Firebase Auth is properly initialized and user is authenticated
  const { getFirebaseAuth } = await import("@/shared/lib/firebase");
  const auth = getFirebaseAuth();

  if (!auth?.currentUser) {
    throw new Error(
      "User must be authenticated with Firebase to access albums"
    );
  }

  const userId = auth.currentUser.uid;

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

  // Check ownership - only return albums owned by the current user for security
  if (albumData.userId && albumData.userId !== userId) {
    throw new Error("Permission denied: You can only access your own albums");
  }

  return albumData;
}

export async function getAlbums(): Promise<Album[]> {
  // Ensure Firebase Auth is properly initialized and user is authenticated
  const { getFirebaseAuth } = await import("@/shared/lib/firebase");
  const auth = getFirebaseAuth();

  if (!auth?.currentUser) {
    throw new Error(
      "User must be authenticated with Firebase to access albums"
    );
  }

  const userId = auth.currentUser.uid;
  const { albumsCollection } = getDB();

  // Check if read operation is allowed (estimate up to 20 reads for safety)
  const canRead = firebaseUsageMonitor.canPerformOperation("read", 20);
  if (!canRead.allowed) {
    throw new Error(`Firebase quota exceeded: ${canRead.reason}`);
  }

  try {
    // Get albums for the authenticated user only
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

    return userAlbums;
  } catch (error) {
    throw error;
  }
}

export async function addAlbum(album: Omit<Album, "id">): Promise<string> {
  // Ensure Firebase Auth is properly initialized and user is authenticated
  const { getFirebaseAuth } = await import("@/shared/lib/firebase");
  const auth = getFirebaseAuth();

  if (!auth?.currentUser) {
    throw new Error(
      "User must be authenticated with Firebase to create albums"
    );
  }

  const userId = auth.currentUser.uid;

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
  // Ensure Firebase Auth is properly initialized and user is authenticated
  const { getFirebaseAuth } = await import("@/shared/lib/firebase");
  const auth = getFirebaseAuth();

  if (!auth?.currentUser) {
    throw new Error(
      "User must be authenticated with Firebase to update albums"
    );
  }

  const userId = auth.currentUser.uid;

  // Check if write operation is allowed
  const canWrite = firebaseUsageMonitor.canPerformOperation("write", 1);
  if (!canWrite.allowed) {
    throw new Error(`Firebase quota exceeded: ${canWrite.reason}`);
  }

  // Verify ownership before updating
  const existingAlbum = await getAlbum(id);
  if (!existingAlbum) {
    throw new Error("Album not found");
  }

  // Check ownership - stricter validation for Firestore security rules
  if (existingAlbum.userId && existingAlbum.userId !== userId) {
    throw new Error("Permission denied: You can only update your own albums");
  }

  // Validate album title if it's being updated
  if (album.title) {
    const titleValidation = validateAlbumTitle(album.title);
    if (!titleValidation.isValid) {
      throw new Error(titleValidation.error);
    }
  }

  // Sanitize data and ensure user ownership
  const secureAlbum = {
    ...album,
    userId, // Ensure userId is always set for security rules
    updatedAt: new Date(),
  };

  // Sanitize text fields if they exist
  if (secureAlbum.title) {
    secureAlbum.title = sanitizeText(secureAlbum.title);
  }
  if (secureAlbum.description) {
    secureAlbum.description = sanitizeText(secureAlbum.description);
  }

  const { albumsCollection } = getDB();
  await updateDoc(doc(albumsCollection, id), secureAlbum);

  // Record the write operation
  firebaseUsageMonitor.recordOperation("write", 1);
}

export async function deleteAlbum(id: string): Promise<void> {
  // Ensure Firebase Auth is properly initialized and user is authenticated
  const { getFirebaseAuth } = await import("@/shared/lib/firebase");
  const auth = getFirebaseAuth();

  if (!auth?.currentUser) {
    throw new Error(
      "User must be authenticated with Firebase to delete albums"
    );
  }

  const userId = auth.currentUser.uid;

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

  // Check ownership - stricter validation for Firestore security rules
  if (albumData.userId && albumData.userId !== userId) {
    throw new Error("Permission denied: You can only delete your own albums");
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

  const deletionResults = await Promise.allSettled(
    validUrls.map((imageUrl) => deleteImage(imageUrl))
  );

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
