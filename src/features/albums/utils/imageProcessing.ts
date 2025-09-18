/**
 * Image processing utilities for format conversion and optimization
 * Client-side only - requires browser APIs
 */

// Configuration constants
export const IMAGE_OPTIMIZATION_CONFIG = {
  // Maximum dimensions for optimized images
  MAX_WIDTH: process.env.NODE_ENV === "development" ? 1200 : 1920, // Lower in dev for testing
  MAX_HEIGHT: process.env.NODE_ENV === "development" ? 1200 : 1920, // Lower in dev for testing
  // JPEG quality (0.1 to 1.0)
  JPEG_QUALITY: 0.85,
  // Maximum file size before optimization (in bytes) - Made more aggressive
  MAX_FILE_SIZE_BEFORE_OPTIMIZATION:
    process.env.NODE_ENV === "development" ? 200 * 1024 : 800 * 1024, // 200KB in dev, 800KB in prod
  // Target file size after optimization (in bytes) - Made more aggressive to prevent payload limit issues
  TARGET_FILE_SIZE:
    process.env.NODE_ENV === "development" ? 150 * 1024 : 500 * 1024, // 150KB in dev, 500KB in prod
};

export interface ProcessedImage {
  file: File;
  originalSize: number;
  processedSize: number;
  wasOptimized: boolean;
  wasConverted: boolean;
  originalFormat: string;
  processedFormat: string;
}

/**
 * Check if we're running in a browser environment
 */
function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

/**
 * Check if a file is a HEIC/HEIF image
 */
export function isHEICImage(file: File): boolean {
  return (
    file.type === "image/heic" ||
    file.type === "image/heif" ||
    file.name.toLowerCase().endsWith(".heic") ||
    file.name.toLowerCase().endsWith(".heif")
  );
}

/**
 * Check if an image needs optimization based on size or dimensions
 */
export async function needsOptimization(file: File): Promise<boolean> {
  if (!isBrowser()) {
    return false;
  }

  // Always optimize images larger than target size or above size threshold
  if (
    file.size > IMAGE_OPTIMIZATION_CONFIG.TARGET_FILE_SIZE ||
    file.size > IMAGE_OPTIMIZATION_CONFIG.MAX_FILE_SIZE_BEFORE_OPTIMIZATION
  ) {
    return true;
  }

  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      const needsResize =
        img.naturalWidth > IMAGE_OPTIMIZATION_CONFIG.MAX_WIDTH ||
        img.naturalHeight > IMAGE_OPTIMIZATION_CONFIG.MAX_HEIGHT;

      resolve(needsResize);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(false);
    };

    img.src = url;
  });
}

/**
 * Convert HEIC image to JPEG using heic2any library
 * Dynamically imports heic2any to avoid SSR issues
 */
async function convertHEICToJPEG(file: File): Promise<File> {
  try {
    // Dynamic import to avoid SSR issues
    const { default: heic2any } = await import("heic2any");

    // Use heic2any for conversion
    const conversionResult = await heic2any({
      blob: file,
      toType: "image/jpeg",
      quality: IMAGE_OPTIMIZATION_CONFIG.JPEG_QUALITY,
    });

    // heic2any can return Blob or Blob[]
    const blob = Array.isArray(conversionResult)
      ? conversionResult[0]
      : conversionResult;

    // Create new filename with .jpg extension
    const newName = file.name.replace(/\.(heic|heif)$/i, "") + ".jpg";
    const convertedFile = new File([blob], newName, { type: "image/jpeg" });

    return convertedFile;
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "HEIC conversion failed, attempting fallback method:",
        error
      );
    }

    // Fallback: try to load HEIC using native browser support (very limited)
    try {
      const img = await createImageFromFile(file);
      return await convertImageToJPEG(img, file.name);
    } catch (fallbackError) {
      if (process.env.NODE_ENV === "development") {
        console.error("Both HEIC conversion methods failed:", fallbackError);
      }
      throw new Error(
        "HEIC conversion failed. Your browser may not support HEIC files. Please convert to JPEG manually."
      );
    }
  }
}

/**
 * Create an Image object from a file
 */
function createImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };

    img.src = url;
  });
}

/**
 * Convert an Image to JPEG format with optimization
 */
async function convertImageToJPEG(
  img: HTMLImageElement,
  originalName: string
): Promise<File> {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Canvas context not available");
  }

  // Calculate optimized dimensions
  const { width, height } = calculateOptimizedDimensions(
    img.naturalWidth,
    img.naturalHeight
  );

  canvas.width = width;
  canvas.height = height;

  // Draw and convert
  ctx.drawImage(img, 0, 0, width, height);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Failed to convert image"));
          return;
        }

        // Create new filename with .jpg extension
        const newName = originalName.replace(/\.[^/.]+$/, "") + ".jpg";
        const file = new File([blob], newName, { type: "image/jpeg" });
        resolve(file);
      },
      "image/jpeg",
      IMAGE_OPTIMIZATION_CONFIG.JPEG_QUALITY
    );
  });
}

/**
 * Calculate optimized dimensions while maintaining aspect ratio
 */
function calculateOptimizedDimensions(
  originalWidth: number,
  originalHeight: number
): { width: number; height: number } {
  const maxWidth = IMAGE_OPTIMIZATION_CONFIG.MAX_WIDTH;
  const maxHeight = IMAGE_OPTIMIZATION_CONFIG.MAX_HEIGHT;

  if (originalWidth <= maxWidth && originalHeight <= maxHeight) {
    return { width: originalWidth, height: originalHeight };
  }

  const aspectRatio = originalWidth / originalHeight;

  let width = originalWidth;
  let height = originalHeight;

  if (width > maxWidth) {
    width = maxWidth;
    height = width / aspectRatio;
  }

  if (height > maxHeight) {
    height = maxHeight;
    width = height * aspectRatio;
  }

  return { width: Math.round(width), height: Math.round(height) };
}

/**
 * Optimize an image by resizing and compressing
 */
async function optimizeImage(file: File): Promise<File> {
  const img = await createImageFromFile(file);

  // Check if optimization is needed
  const { width, height } = calculateOptimizedDimensions(
    img.naturalWidth,
    img.naturalHeight
  );
  const needsResize =
    width !== img.naturalWidth || height !== img.naturalHeight;
  const needsCompression =
    file.size > IMAGE_OPTIMIZATION_CONFIG.TARGET_FILE_SIZE;

  if (!needsResize && !needsCompression) {
    return file; // No optimization needed
  }

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Canvas context not available");
  }

  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(img, 0, 0, width, height);

  // Try different quality levels to achieve target file size
  let quality = IMAGE_OPTIMIZATION_CONFIG.JPEG_QUALITY;
  let attempts = 0;
  const maxAttempts = 5;

  while (attempts < maxAttempts) {
    const optimizedFile = await new Promise<File>((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Failed to optimize image"));
            return;
          }

          const outputType =
            file.type === "image/png" ? "image/png" : "image/jpeg";
          const optimizedFile = new File([blob], file.name, {
            type: outputType,
          });
          resolve(optimizedFile);
        },
        file.type === "image/png" ? "image/png" : "image/jpeg",
        quality
      );
    });

    // If size is acceptable or we've tried enough, return the result
    if (
      optimizedFile.size <= IMAGE_OPTIMIZATION_CONFIG.TARGET_FILE_SIZE ||
      attempts === maxAttempts - 1
    ) {
      return optimizedFile;
    }

    // Reduce quality for next attempt
    quality = Math.max(0.5, quality - 0.1);
    attempts++;
  }

  // This shouldn't be reached, but return the file anyway
  return file;
}

/**
 * Main image processing function
 * Handles HEIC conversion and image optimization
 */
export async function processImage(file: File): Promise<ProcessedImage> {
  // Ensure we're in a browser environment
  if (!isBrowser()) {
    throw new Error(
      "Image processing is only available in browser environments"
    );
  }

  const originalSize = file.size;
  const originalFormat = file.type;
  let processedFile = file;
  let wasConverted = false;
  let wasOptimized = false;

  try {
    // Step 1: Convert HEIC to JPEG if needed
    if (isHEICImage(file)) {
      processedFile = await convertHEICToJPEG(file);
      wasConverted = true;
    }

    // Step 2: Optimize image if needed
    if (await needsOptimization(processedFile)) {
      const optimizedFile = await optimizeImage(processedFile);
      if (optimizedFile.size < processedFile.size) {
        processedFile = optimizedFile;
        wasOptimized = true;
      }
    }

    return {
      file: processedFile,
      originalSize,
      processedSize: processedFile.size,
      wasOptimized,
      wasConverted,
      originalFormat,
      processedFormat: processedFile.type,
    };
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Image processing failed:", error);
    }
    // Return original file if processing fails
    return {
      file,
      originalSize,
      processedSize: file.size,
      wasOptimized: false,
      wasConverted: false,
      originalFormat,
      processedFormat: file.type,
    };
  }
}

/**
 * Process multiple images with progress tracking
 */
export async function processImages(
  files: File[],
  onProgress?: (processed: number, total: number, currentFile: string) => void
): Promise<ProcessedImage[]> {
  if (!isBrowser()) {
    throw new Error(
      "Image processing is only available in browser environments"
    );
  }

  const results: ProcessedImage[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    onProgress?.(i, files.length, file.name);

    try {
      const result = await processImage(file);
      results.push(result);
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error(`Failed to process ${file.name}:`, error);
      }
      // Add original file if processing fails
      results.push({
        file,
        originalSize: file.size,
        processedSize: file.size,
        wasOptimized: false,
        wasConverted: false,
        originalFormat: file.type,
        processedFormat: file.type,
      });
    }
  }

  onProgress?.(files.length, files.length, "");
  return results;
}

/**
 * Get human-readable file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

/**
 * Calculate compression ratio as percentage
 */
export function calculateCompressionRatio(
  originalSize: number,
  compressedSize: number
): number {
  if (originalSize === 0) return 0;
  return Math.round(((originalSize - compressedSize) / originalSize) * 100);
}

/**
 * Calculate total payload size for a set of images
 */
export function calculateTotalPayloadSize(
  images: Array<{ file?: File; url?: string }>
): number {
  return images.reduce((total, image) => {
    if (image.file) {
      return total + image.file.size;
    }
    return total;
  }, 0);
}

/**
 * Check if the total payload size is within Firebase limits
 */
export function validatePayloadSize(
  images: Array<{ file?: File; url?: string }>
): {
  isValid: boolean;
  totalSize: number;
  totalSizeMB: number;
  maxSizeMB: number;
  error?: string;
} {
  const totalSize = calculateTotalPayloadSize(images);
  const totalSizeMB = totalSize / (1024 * 1024);
  const maxSizeMB = 10; // Keep under 10MB to be safe (Firebase limit is around 11MB)

  return {
    isValid: totalSizeMB <= maxSizeMB,
    totalSize,
    totalSizeMB: Math.round(totalSizeMB * 100) / 100,
    maxSizeMB,
    error:
      totalSizeMB > maxSizeMB
        ? `Total payload size (${totalSizeMB.toFixed(
            1
          )}MB) exceeds the ${maxSizeMB}MB limit. Please reduce image sizes or remove some images.`
        : undefined,
  };
}

/**
 * Aggressively optimize images to fit within payload size limits
 * This function will progressively reduce quality and size until the payload is acceptable
 */
export async function optimizeImagesForPayloadLimit(
  images: Array<{ file?: File; url?: string; id: string }>,
  maxPayloadSizeMB: number = 10
): Promise<Array<{ file?: File; url?: string; id: string }>> {
  if (!isBrowser()) {
    return images;
  }

  const maxPayloadSize = maxPayloadSizeMB * 1024 * 1024;
  const imagesWithFiles = images.filter((img) => img.file);

  if (imagesWithFiles.length === 0) {
    return images;
  }

  // Calculate current total size
  const currentTotalSize = calculateTotalPayloadSize(images);

  if (currentTotalSize <= maxPayloadSize) {
    return images; // Already within limits
  }

  // Calculate target size per image
  const targetSizePerImage = Math.floor(
    (maxPayloadSize * 0.9) / imagesWithFiles.length
  );

  const optimizedImages = [...images];

  for (let i = 0; i < optimizedImages.length; i++) {
    const image = optimizedImages[i];

    if (!image.file || image.file.size <= targetSizePerImage) {
      continue; // Skip if no file or already small enough
    }

    try {
      // Aggressively compress this image
      const compressedFile = await aggressivelyCompressImage(
        image.file,
        targetSizePerImage
      );
      optimizedImages[i] = { ...image, file: compressedFile };
    } catch (error) {
      console.warn(`Failed to compress image ${image.id}:`, error);
    }
  }

  return optimizedImages;
}

/**
 * Aggressively compress a single image to a target size
 */
async function aggressivelyCompressImage(
  file: File,
  targetSize: number
): Promise<File> {
  if (!isBrowser()) {
    return file;
  }

  const img = await createImageFromFile(file);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Canvas context not available");
  }

  // Start with aggressive dimensions
  let scaleFactor = Math.sqrt(targetSize / file.size);
  scaleFactor = Math.min(scaleFactor, 0.8); // Don't scale up, max 80% of original

  let width = Math.floor(img.naturalWidth * scaleFactor);
  let height = Math.floor(img.naturalHeight * scaleFactor);

  // Ensure minimum dimensions
  width = Math.max(width, 400);
  height = Math.max(height, 400);

  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(img, 0, 0, width, height);

  // Try different quality levels aggressively
  const qualityLevels = [0.6, 0.5, 0.4, 0.3, 0.2];

  for (const quality of qualityLevels) {
    const compressedFile = await new Promise<File>((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Failed to compress image"));
            return;
          }

          const outputType =
            file.type === "image/png" ? "image/png" : "image/jpeg";
          const compressed = new File([blob], file.name, { type: outputType });
          resolve(compressed);
        },
        file.type === "image/png" ? "image/png" : "image/jpeg",
        quality
      );
    });

    if (compressedFile.size <= targetSize) {
      return compressedFile;
    }
  }

  // If still too large, reduce dimensions further
  width = Math.floor(width * 0.7);
  height = Math.floor(height * 0.7);
  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(img, 0, 0, width, height);

  return new Promise<File>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Failed to compress image"));
          return;
        }

        const outputType =
          file.type === "image/png" ? "image/png" : "image/jpeg";
        const compressed = new File([blob], file.name, { type: outputType });
        resolve(compressed);
      },
      file.type === "image/png" ? "image/png" : "image/jpeg",
      0.2 // Very low quality as last resort
    );
  });
}

/**
 * Check if a URL is a blob or data URL (temporary/local URLs)
 * These URLs are too long for Firebase fields and should not be used for coverUrl
 */
export function isBlobOrDataUrl(url: string): boolean {
  return url.startsWith("blob:") || url.startsWith("data:");
}

/**
 * Check if a URL is a valid Firebase Storage URL
 */
export function isFirebaseStorageUrl(url: string): boolean {
  return (
    url.includes("firebasestorage.googleapis.com") ||
    url.includes("storage.googleapis.com")
  );
}

/**
 * Validate that a URL is safe to store in Firebase (not too long)
 */
export function isValidFirebaseUrl(url: string): boolean {
  // Firebase has a limit of ~1MB per field, but we'll be conservative
  const MAX_URL_LENGTH = 2048; // Typical URL length limit

  return url.length <= MAX_URL_LENGTH && !isBlobOrDataUrl(url);
}
