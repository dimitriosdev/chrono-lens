import { getFirebaseStorage } from "./firebase";
import { firebaseUsageMonitor } from "./firebaseUsageMonitor";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import {
  validateFile,
  sanitizeText,
  checkRateLimit,
} from "@/shared/utils/security";
import {
  processImage,
  ProcessedImage,
} from "../../features/albums/utils/imageProcessing";

export async function uploadImage(
  file: File,
  albumId: string,
  idx: number
): Promise<string> {
  // Ensure Firebase Auth is properly initialized and user is authenticated
  const { getFirebaseAuth } = await import("@/shared/lib/firebase");
  const auth = getFirebaseAuth();

  if (!auth?.currentUser) {
    throw new Error(
      "User must be authenticated with Firebase to upload images"
    );
  }

  const userId = auth.currentUser.uid;

  // Validate original file
  const validation = validateFile(file);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  // Check storage limits before processing
  const storageCheck = firebaseUsageMonitor.recordFileUpload(file.size);
  if (!storageCheck.allowed) {
    throw new Error(storageCheck.reason);
  }

  // Rate limiting check
  if (!checkRateLimit(userId, 20, 60000)) {
    // 20 uploads per minute
    throw new Error(
      "Upload rate limit exceeded. Please wait before uploading more images."
    );
  }

  // Process image (convert HEIC, optimize size) - only in browser
  let processedImage: ProcessedImage;
  try {
    // Check if we're in a browser environment before processing
    if (typeof window !== "undefined") {
      processedImage = await processImage(file);

      // Update storage tracking with actual processed size
      const sizeDifference = processedImage.processedSize - file.size;
      if (sizeDifference !== 0) {
        if (sizeDifference > 0) {
          // File got bigger (rare), check if we still have space
          const additionalCheck =
            firebaseUsageMonitor.recordFileUpload(sizeDifference);
          if (!additionalCheck.allowed) {
            throw new Error(
              `Storage limit would be exceeded after processing: ${additionalCheck.reason}`
            );
          }
        } else {
          // File got smaller (common), free up the saved space
          firebaseUsageMonitor.recordFileDeletion(-sizeDifference);
        }
      }
    } else {
      // Server-side fallback: use original file
      processedImage = {
        file,
        originalSize: file.size,
        processedSize: file.size,
        wasOptimized: false,
        wasConverted: false,
        originalFormat: file.type,
        processedFormat: file.type,
      };
    }
  } catch {
    // Fallback to original file if processing fails
    processedImage = {
      file,
      originalSize: file.size,
      processedSize: file.size,
      wasOptimized: false,
      wasConverted: false,
      originalFormat: file.type,
      processedFormat: file.type,
    };
  }

  const finalFile = processedImage.file;

  // Sanitize filename
  const sanitizedName = sanitizeText(
    finalFile.name.replace(/[^a-zA-Z0-9.-]/g, "_")
  );

  // Generate secure path with user ID for isolation
  const securePath = `users/${userId}/albums/${albumId}/${Date.now()}_${idx}_${sanitizedName}`;

  const storage = getFirebaseStorage();
  if (!storage) {
    throw new Error("Firebase storage not initialized");
  }

  const storageRef = ref(storage, securePath);

  await uploadBytes(storageRef, finalFile);
  return await getDownloadURL(storageRef);
}

export async function deleteImage(url: string): Promise<void> {
  // Ensure Firebase Auth is properly initialized and user is authenticated
  const { getFirebaseAuth } = await import("@/shared/lib/firebase");
  const auth = getFirebaseAuth();

  if (!auth?.currentUser) {
    throw new Error(
      "User must be authenticated with Firebase to delete images"
    );
  }

  const userId = auth.currentUser.uid;

  // Skip empty or invalid URLs
  if (!url || typeof url !== "string") {
    return;
  }

  // Convert download URL to storage path
  // Example: https://firebasestorage.googleapis.com/v0/b/<bucket>/o/users%2FuserId%2Falbums%2FalbumId%2Ffilename?alt=media
  try {
    const matches = url.match(/\/o\/(.+)\?/);
    if (!matches || !matches[1]) {
      return;
    }

    const path = decodeURIComponent(matches[1]);

    // Verify that the user owns the file they're trying to delete
    if (!path.startsWith(`users/${userId}/`)) {
      throw new Error("Permission denied: You can only delete your own images");
    }

    const storage = getFirebaseStorage();
    if (!storage) {
      throw new Error("Firebase storage not initialized");
    }

    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  } catch (error) {
    // Only throw if it's a critical error (not authorization or file not found)
    if (
      error instanceof Error &&
      !error.message.includes("Unauthorized") &&
      !error.message.includes("not found") &&
      !error.message.includes("does not exist")
    ) {
      throw error;
    }
  }
}
