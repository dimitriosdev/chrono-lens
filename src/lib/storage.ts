import { getFirebaseStorage } from "./firebase";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import {
  validateFile,
  sanitizeText,
  getCurrentUserId,
  checkRateLimit,
} from "@/utils/security";

export async function uploadImage(
  file: File,
  albumId: string,
  idx: number
): Promise<string> {
  // Security validations
  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error("User not authenticated");
  }

  // Rate limiting check
  if (!checkRateLimit(userId, 20, 60000)) {
    // 20 uploads per minute
    throw new Error(
      "Upload rate limit exceeded. Please wait before uploading more images."
    );
  }

  // Validate file
  const validation = validateFile(file);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  // Sanitize filename
  const sanitizedName = sanitizeText(file.name.replace(/[^a-zA-Z0-9.-]/g, "_"));

  // Generate secure path with user ID for isolation
  const securePath = `users/${userId}/albums/${albumId}/${Date.now()}_${idx}_${sanitizedName}`;

  const storage = getFirebaseStorage();
  if (!storage) {
    throw new Error("Firebase storage not initialized");
  }

  const storageRef = ref(storage, securePath);

  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
}

export async function deleteImage(url: string): Promise<void> {
  // Security check
  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error("User not authenticated");
  }

  // Skip empty or invalid URLs
  if (!url || typeof url !== "string") {
    console.warn("Skipping deletion of invalid URL:", url);
    return;
  }

  // Convert download URL to storage path
  // Example: https://firebasestorage.googleapis.com/v0/b/<bucket>/o/users%2FuserId%2Falbums%2FalbumId%2Ffilename?alt=media
  try {
    const matches = url.match(/\/o\/(.+)\?/);
    if (!matches || !matches[1]) {
      console.warn("Invalid storage URL format:", url);
      return;
    }

    const path = decodeURIComponent(matches[1]);

    // Ensure user can only delete their own files
    if (!path.startsWith(`users/${userId}/`)) {
      throw new Error("Unauthorized: Cannot delete files from other users");
    }

    const storage = getFirebaseStorage();
    if (!storage) {
      throw new Error("Firebase storage not initialized");
    }

    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
    console.log("Successfully deleted image from storage:", path);
  } catch (error) {
    console.warn("Failed to delete image from storage:", url, error);
    // Don't throw error to avoid breaking UI when file doesn't exist
  }
}
