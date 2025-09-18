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
import { ensureValidLayout } from "@/features/albums/utils/layoutDefaults";
import { cleanAlbumData } from "@/shared/utils/firebaseUtils";
import { getShareTokenFromUrl } from "@/shared/utils/albumSharing";

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

  const albumData = { id: albumDoc.id, ...albumDoc.data() } as Album;

  // For public albums, allow access without authentication
  if (albumData.privacy === "public") {
    return albumData;
  }

  // For private/shared albums, check authentication
  const { getFirebaseAuth } = await import("@/shared/lib/firebase");
  const auth = getFirebaseAuth();

  // For shared albums, also check share token
  if (albumData.privacy === "shared") {
    const shareToken = getShareTokenFromUrl();
    if (shareToken && shareToken === albumData.shareToken) {
      return albumData; // Allow access with valid share token
    }
  }

  // Require authentication for private albums and shared albums without token
  if (!auth?.currentUser) {
    throw new Error("User must be authenticated to access this album");
  }

  const userId = auth.currentUser.uid;

  // Check ownership for private albums
  if (albumData.privacy === "private" && albumData.userId !== userId) {
    throw new Error(
      "Permission denied: You can only access your own private albums"
    );
  }

  // Check ownership for shared albums without valid token
  if (albumData.privacy === "shared" && albumData.userId !== userId) {
    throw new Error("Permission denied: Invalid share token");
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

  // Generate share token for shared albums if not already provided
  const { generateShareToken } = await import("@/shared/utils/albumSharing");
  let shareToken = album.shareToken; // Use existing token if provided
  if (album.privacy === "shared" && !shareToken) {
    shareToken = generateShareToken(userId + "_" + Date.now());
  }

  // Sanitize data and add user ownership
  const imageCount = album.images?.length || 0;
  const secureAlbum = {
    ...album,
    userId,
    title: sanitizeText(album.title),
    description: sanitizeText(album.description || ""),
    layout: ensureValidLayout(album.layout, imageCount), // Ensure we have a valid layout
    privacy: album.privacy || "private", // Default to private if not specified
    shareToken,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Clean undefined values before sending to Firebase
  const cleanedAlbum = cleanAlbumData(secureAlbum);

  const { albumsCollection } = getDB();
  const docRef = await addDoc(albumsCollection, cleanedAlbum);

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

  // Clean undefined values before sending to Firebase
  const cleanedAlbum = cleanAlbumData(secureAlbum);

  const { albumsCollection } = getDB();
  await updateDoc(doc(albumsCollection, id), cleanedAlbum);

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

  // Import deleteAlbumFolder function
  const { deleteAlbumFolder } = await import("./storage");

  // Delete the entire album folder from storage
  // This is more efficient and ensures complete cleanup
  try {
    await deleteAlbumFolder(id);
  } catch (error) {
    console.warn("Failed to delete album folder from storage:", error);
    // Continue with album document deletion even if storage cleanup fails
  }

  // Finally, delete the album document
  await deleteDoc(doc(albumsCollection, id));

  // Record the write operation (delete)
  firebaseUsageMonitor.recordOperation("write", 1);
}
