/**
 * Image processing utilities for format conversion and optimization
 * Client-side only - requires browser APIs
 */

// Configuration constants
export const IMAGE_OPTIMIZATION_CONFIG = {
  // Maximum dimensions for optimized images
  MAX_WIDTH: 1920,
  MAX_HEIGHT: 1920,
  // JPEG quality (0.1 to 1.0)
  JPEG_QUALITY: 0.85,
  // Maximum file size before optimization (in bytes)
  MAX_FILE_SIZE_BEFORE_OPTIMIZATION: 2 * 1024 * 1024, // 2MB
  // Target file size after optimization (in bytes)
  TARGET_FILE_SIZE: 1 * 1024 * 1024, // 1MB
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

  if (file.size > IMAGE_OPTIMIZATION_CONFIG.MAX_FILE_SIZE_BEFORE_OPTIMIZATION) {
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
    console.log("Converting HEIC to JPEG:", file.name);

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

    console.log(`HEIC conversion successful: ${file.name} -> ${newName}`, {
      originalSize: file.size,
      convertedSize: convertedFile.size,
    });

    return convertedFile;
  } catch (error) {
    console.warn("HEIC conversion failed, attempting fallback method:", error);

    // Fallback: try to load HEIC using native browser support (very limited)
    try {
      const img = await createImageFromFile(file);
      return await convertImageToJPEG(img, file.name);
    } catch (fallbackError) {
      console.error("Both HEIC conversion methods failed:", fallbackError);
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
      console.log("Converting HEIC image to JPEG:", file.name);
      processedFile = await convertHEICToJPEG(file);
      wasConverted = true;
    }

    // Step 2: Optimize image if needed
    if (await needsOptimization(processedFile)) {
      console.log("Optimizing image:", processedFile.name);
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
    console.error("Image processing failed:", error);
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
      console.error(`Failed to process ${file.name}:`, error);
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
