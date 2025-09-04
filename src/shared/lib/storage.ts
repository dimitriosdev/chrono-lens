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
  getCurrentUserId,
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
  // Security validations
  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error("User not authenticated");
  }

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

      // Log processing results in development
      if (process.env.NODE_ENV === "development") {
        console.log(`Image processing completed for ${file.name}:`, {
          originalSize: processedImage.originalSize,
          processedSize: processedImage.processedSize,
          wasConverted: processedImage.wasConverted,
          wasOptimized: processedImage.wasOptimized,
          compressionRatio: Math.round(
            ((processedImage.originalSize - processedImage.processedSize) /
              processedImage.originalSize) *
              100
          ),
        });
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
  } catch (error) {
    console.warn("Image processing failed, uploading original file:", error);
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
  // Security check
  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error("User not authenticated");
  }

  // Skip empty or invalid URLs
  if (!url || typeof url !== "string") {
    if (process.env.NODE_ENV === "development") {
      console.warn("Skipping deletion of invalid URL:", url);
    }
    return;
  }

  // Convert download URL to storage path
  // Example: https://firebasestorage.googleapis.com/v0/b/<bucket>/o/users%2FuserId%2Falbums%2FalbumId%2Ffilename?alt=media
  try {
    const matches = url.match(/\/o\/(.+)\?/);
    if (!matches || !matches[1]) {
      if (process.env.NODE_ENV === "development") {
        console.warn("Invalid storage URL format:", url);
      }
      return;
    }

    const path = decodeURIComponent(matches[1]);

    // For single-user scenarios: attempt to delete files even if they don't match current userId
    if (!path.startsWith(`users/${userId}/`)) {
      if (process.env.NODE_ENV === "development") {
        console.warn(
          `Attempting to delete file from different user path: ${path} (current user: ${userId})`
        );
      }
      // Continue with deletion attempt instead of returning early
    }

    const storage = getFirebaseStorage();
    if (!storage) {
      throw new Error("Firebase storage not initialized");
    }

    const storageRef = ref(storage, path);
    await deleteObject(storageRef);

    if (process.env.NODE_ENV === "development") {
      console.log("Successfully deleted image from storage:", path);
    }
  } catch (error) {
    // Log the error but don't throw to avoid breaking the entire deletion process
    if (process.env.NODE_ENV === "development") {
      console.warn("Failed to delete image from storage:", url, error);
    }

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
