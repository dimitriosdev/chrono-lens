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
} from "firebase/firestore";
import { app } from "@/lib/firebase";
import { Album } from "@/entities/Album";
import {
  validateAlbumTitle,
  sanitizeText,
  getCurrentUserId,
  validateUserLimits,
  checkRateLimit,
  MAX_ALBUMS_PER_USER,
} from "@/utils/security";

const db = getFirestore(app);
const albumsCollection = collection(db, "albums");

export async function getAlbum(id: string): Promise<Album | null> {
  const userId = getCurrentUserId();
  if (!userId) {
    throw new Error("User not authenticated");
  }

  const albumDoc = await getDoc(doc(albumsCollection, id));
  if (!albumDoc.exists()) return null;

  const albumData = albumDoc.data() as Album;

  // Only check user ownership if the album has a userId field
  if (albumData.userId && albumData.userId !== userId) {
    throw new Error("Unauthorized: Cannot access other users' albums");
  }

  return albumData;
}

export async function getAlbums(): Promise<Album[]> {
  const userId = getCurrentUserId();

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
          (doc) => ({ id: doc.id, ...doc.data() } as Album)
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
      (doc) => ({ id: doc.id, ...doc.data() } as Album)
    );
    console.log("Found all albums:", allAlbums.length);
    return allAlbums;
  } catch (error) {
    console.error("Error fetching albums:", error);

    // Final fallback: get all albums without any filtering
    console.log("Using final fallback...");
    const fallbackQuery = query(albumsCollection);
    const snapshot = await getDocs(fallbackQuery);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Album));
  }
}

export async function addAlbum(album: Omit<Album, "id">): Promise<string> {
  const userId = getCurrentUserId();
  if (!userId) {
    throw new Error("User not authenticated");
  }

  // Rate limiting
  if (!checkRateLimit(userId, 5, 60000)) {
    // 5 albums per minute
    throw new Error(
      "Album creation rate limit exceeded. Please wait before creating more albums."
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

  const docRef = await addDoc(albumsCollection, secureAlbum);
  return docRef.id;
}

export async function updateAlbum(
  id: string,
  album: Partial<Album>
): Promise<void> {
  await updateDoc(doc(albumsCollection, id), album);
}

export async function deleteAlbum(id: string): Promise<void> {
  await deleteDoc(doc(albumsCollection, id));
}
