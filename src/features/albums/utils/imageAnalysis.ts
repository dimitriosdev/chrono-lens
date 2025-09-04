// Enhanced image analysis utilities for smart layout detection
import { calculateLayoutScore as strategyCalculateLayoutScore } from "./layout-scoring";

export interface ImageDimensions {
  width: number;
  height: number;
  aspectRatio: number;
  orientation: "portrait" | "landscape" | "square";
  visualWeight: number; // 0-1 based on aspect ratio and size
  aestheticScore: number; // 0-1 based on golden ratio proximity
}

export interface ImageAnalysis {
  url: string;
  dimensions: ImageDimensions;
  file?: File;
  fileSize?: number;
  dominantOrientation?: boolean;
}

export interface LayoutRecommendation {
  layoutName: string;
  score: number;
  reason: string;
  detailedAnalysis: {
    orientationMatch: number;
    imageCountMatch: number;
    aestheticScore: number;
    balanceScore: number;
    visualImpact: number;
  };
  confidence: "high" | "medium" | "low";
}

/**
 * Calculate visual weight and aesthetic score for an image
 */
const calculateImageMetrics = (
  width: number,
  height: number,
  aspectRatio: number,
  fileSize?: number
): { visualWeight: number; aestheticScore: number } => {
  // Visual weight based on aspect ratio and size
  const sizeWeight = fileSize
    ? Math.min(fileSize / (1024 * 1024), 10) / 10
    : 0.5; // Normalize to 0-1
  const aspectWeight = Math.abs(aspectRatio - 1) + 0.5; // More extreme ratios have more weight
  const visualWeight = Math.min((sizeWeight + aspectWeight) / 2, 1);

  // Aesthetic score based on proximity to golden ratio and common pleasing ratios
  const goldenRatio = 1.618;
  const commonRatios = [1, 1.333, 1.5, goldenRatio, 2, 2.35]; // 1:1, 4:3, 3:2, golden, 2:1, cinemascope

  let aestheticScore = 0;
  for (const ratio of commonRatios) {
    const distance = Math.abs(aspectRatio - ratio);
    const score = Math.max(0, 1 - distance * 2); // Closer = higher score
    aestheticScore = Math.max(aestheticScore, score);
  }

  return { visualWeight, aestheticScore };
};

/**
 * Get image dimensions from a file
 */
export const getImageDimensions = (file: File): Promise<ImageDimensions> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      const width = img.naturalWidth;
      const height = img.naturalHeight;
      const aspectRatio = width / height;

      let orientation: "portrait" | "landscape" | "square";
      if (aspectRatio > 1.1) {
        orientation = "landscape";
      } else if (aspectRatio < 0.9) {
        orientation = "portrait";
      } else {
        orientation = "square";
      }

      const metrics = calculateImageMetrics(
        width,
        height,
        aspectRatio,
        file.size
      );

      URL.revokeObjectURL(url);
      resolve({
        width,
        height,
        aspectRatio,
        orientation,
        visualWeight: metrics.visualWeight,
        aestheticScore: metrics.aestheticScore,
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };

    img.src = url;
  });
};

/**
 * Extract image information from Firebase Storage URL patterns
 */
const analyzeFromFirebaseUrl = (url: string): ImageDimensions | null => {
  try {
    // Firebase Storage URLs often contain metadata or can be analyzed by filename patterns
    const urlParts = decodeURIComponent(url);

    // Look for dimension hints in filename (common patterns: 1920x1080, WIDTHxHEIGHT)
    const dimensionMatch = urlParts.match(/(\d{3,5})x(\d{3,5})/);
    if (dimensionMatch) {
      const width = parseInt(dimensionMatch[1]);
      const height = parseInt(dimensionMatch[2]);
      const aspectRatio = width / height;

      let orientation: "portrait" | "landscape" | "square";
      if (aspectRatio > 1.1) {
        orientation = "landscape";
      } else if (aspectRatio < 0.9) {
        orientation = "portrait";
      } else {
        orientation = "square";
      }

      const metrics = calculateImageMetrics(width, height, aspectRatio);

      return {
        width,
        height,
        aspectRatio,
        orientation,
        visualWeight: metrics.visualWeight,
        aestheticScore: metrics.aestheticScore,
      };
    }

    // Look for orientation hints in filename
    if (
      urlParts.toLowerCase().includes("portrait") ||
      urlParts.includes("_p_") ||
      urlParts.includes("-p-")
    ) {
      const metrics = calculateImageMetrics(1080, 1920, 1080 / 1920);
      return {
        width: 1080,
        height: 1920,
        aspectRatio: 1080 / 1920,
        orientation: "portrait",
        visualWeight: metrics.visualWeight,
        aestheticScore: metrics.aestheticScore,
      };
    }

    if (
      urlParts.toLowerCase().includes("landscape") ||
      urlParts.includes("_l_") ||
      urlParts.includes("-l-")
    ) {
      const metrics = calculateImageMetrics(1920, 1080, 1920 / 1080);
      return {
        width: 1920,
        height: 1080,
        aspectRatio: 1920 / 1080,
        orientation: "landscape",
        visualWeight: metrics.visualWeight,
        aestheticScore: metrics.aestheticScore,
      };
    }

    return null;
  } catch {
    return null;
  }
};

/**
 * Get image dimensions from an existing URL with enhanced fallback
 */
export const getImageDimensionsFromUrl = (
  url: string
): Promise<ImageDimensions> => {
  return new Promise((resolve) => {
    // First try to extract info from URL pattern
    const urlAnalysis = analyzeFromFirebaseUrl(url);
    if (urlAnalysis) {
      resolve(urlAnalysis);
      return;
    }

    const img = new Image();

    // Try without crossOrigin first for same-origin images
    img.onload = () => {
      const width = img.naturalWidth;
      const height = img.naturalHeight;
      const aspectRatio = width / height;

      let orientation: "portrait" | "landscape" | "square";
      if (aspectRatio > 1.1) {
        orientation = "landscape";
      } else if (aspectRatio < 0.9) {
        orientation = "portrait";
      } else {
        orientation = "square";
      }

      const metrics = calculateImageMetrics(width, height, aspectRatio);

      resolve({
        width,
        height,
        aspectRatio,
        orientation,
        visualWeight: metrics.visualWeight,
        aestheticScore: metrics.aestheticScore,
      });
    };

    img.onerror = () => {
      // If image loading fails, try with crossOrigin
      const corsImg = new Image();
      corsImg.crossOrigin = "anonymous";

      corsImg.onload = () => {
        const width = corsImg.naturalWidth;
        const height = corsImg.naturalHeight;
        const aspectRatio = width / height;

        let orientation: "portrait" | "landscape" | "square";
        if (aspectRatio > 1.1) {
          orientation = "landscape";
        } else if (aspectRatio < 0.9) {
          orientation = "portrait";
        } else {
          orientation = "square";
        }

        const metrics = calculateImageMetrics(width, height, aspectRatio);

        resolve({
          width,
          height,
          aspectRatio,
          orientation,
          visualWeight: metrics.visualWeight,
          aestheticScore: metrics.aestheticScore,
        });
      };

      corsImg.onerror = () => {
        // Final fallback: use intelligent defaults based on common image patterns
        let fallbackOrientation: "portrait" | "landscape" | "square" =
          "landscape";
        let fallbackRatio = 16 / 9; // Default to common 16:9 ratio

        // Smart fallback based on URL patterns
        if (
          url.toLowerCase().includes("photo") ||
          url.toLowerCase().includes("img") ||
          url.includes("JPG") ||
          url.includes("jpg")
        ) {
          // Photos are often landscape or portrait
          fallbackOrientation = Math.random() > 0.6 ? "landscape" : "portrait";
          fallbackRatio = fallbackOrientation === "portrait" ? 3 / 4 : 4 / 3;
        }

        const metrics = calculateImageMetrics(
          fallbackOrientation === "portrait" ? 1080 : 1920,
          fallbackOrientation === "portrait" ? 1440 : 1080,
          fallbackRatio
        );

        if (process.env.NODE_ENV === "development") {
          console.warn(
            `Using fallback analysis for ${url} - assumed ${fallbackOrientation}`
          );
        }

        resolve({
          width: fallbackOrientation === "portrait" ? 1080 : 1920,
          height: fallbackOrientation === "portrait" ? 1440 : 1080,
          aspectRatio: fallbackRatio,
          orientation: fallbackOrientation,
          visualWeight: metrics.visualWeight,
          aestheticScore: metrics.aestheticScore,
        });
      };

      corsImg.src = url;
    };

    img.src = url;
  });
};

/**
 * Analyze multiple existing images with enhanced error handling
 */
export const analyzeExistingImages = async (
  imageUrls: string[]
): Promise<ImageDimensions[]> => {
  if (process.env.NODE_ENV === "development") {
    console.log("Analyzing existing images:", imageUrls.length);
  }

  const analyses = await Promise.allSettled(
    imageUrls.map(async (url) => {
      try {
        return await getImageDimensionsFromUrl(url);
      } catch {
        if (process.env.NODE_ENV === "development") {
          console.warn(`Fallback analysis for image: ${url}`);
        }
        // Return a reasonable default for failed analysis
        const metrics = calculateImageMetrics(1920, 1080, 16 / 9);
        return {
          width: 1920,
          height: 1080,
          aspectRatio: 16 / 9,
          orientation: "landscape" as const,
          visualWeight: metrics.visualWeight,
          aestheticScore: metrics.aestheticScore,
        };
      }
    })
  );

  return analyses.map((result) =>
    result.status === "fulfilled"
      ? result.value
      : {
          width: 1920,
          height: 1080,
          aspectRatio: 16 / 9,
          orientation: "landscape" as const,
          visualWeight: 0.5,
          aestheticScore: 0.5,
        }
  );
};

/**
 * Analyze multiple images and return their characteristics
 */
export const analyzeImages = async (
  images: Array<{ file?: File; url: string }>
): Promise<ImageAnalysis[]> => {
  const analyses: ImageAnalysis[] = [];

  for (const image of images) {
    try {
      let dimensions: ImageDimensions;

      if (image.file) {
        dimensions = await getImageDimensions(image.file);
      } else {
        dimensions = await getImageDimensionsFromUrl(image.url);
      }

      analyses.push({
        url: image.url,
        dimensions,
        file: image.file,
        fileSize: image.file?.size,
      });
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.warn(`Failed to analyze image ${image.url}:`, error);
      }
      // Provide intelligent fallback dimensions
      const metrics = calculateImageMetrics(1920, 1080, 16 / 9);
      analyses.push({
        url: image.url,
        dimensions: {
          width: 1920,
          height: 1080,
          aspectRatio: 16 / 9,
          orientation: "landscape",
          visualWeight: metrics.visualWeight,
          aestheticScore: metrics.aestheticScore,
        },
        file: image.file,
        fileSize: image.file?.size,
      });
    }
  }

  return analyses;
};

/**
 * Calculate layout compatibility score using strategy pattern
 * Refactored for maintainability and extensibility
 */
export const calculateLayoutScore = (
  imageAnalyses: ImageAnalysis[],
  layoutName: string
): LayoutRecommendation => {
  if (imageAnalyses.length === 0) {
    return {
      layoutName,
      score: 0,
      reason: "No images to analyze",
      detailedAnalysis: {
        orientationMatch: 0,
        imageCountMatch: 0,
        aestheticScore: 0,
        balanceScore: 0,
        visualImpact: 0,
      },
      confidence: "low",
    };
  }

  // Use the new strategy-based scoring system
  try {
    return strategyCalculateLayoutScore(imageAnalyses, layoutName);
  } catch (error) {
    console.warn(
      "Failed to load new layout scoring system, using fallback",
      error
    );

    // Fallback scoring for unknown layouts
    return {
      layoutName,
      score: 50, // Default moderate score
      reason: "Layout scoring system unavailable",
      detailedAnalysis: {
        orientationMatch: 50,
        imageCountMatch: 50,
        aestheticScore: 50,
        balanceScore: 50,
        visualImpact: 50,
      },
      confidence: "low",
    };
  }
};

/**
 * Get smart layout recommendations based on image analysis
 */
export const getSmartLayoutRecommendations = async (
  images: Array<{ file?: File; url: string }>
): Promise<LayoutRecommendation[]> => {
  if (images.length === 0) {
    return [];
  }

  const imageAnalyses = await analyzeImages(images);

  // Available layout names (should match the expanded ALBUM_LAYOUTS)
  const layoutNames = [
    "3 Portraits",
    "6 Portraits",
    "Single Row",
    "2x2 Grid",
    "3x2 Landscape",
    "Column Stack",
    "Mixed Grid",
    "Slideshow",
    "Mosaic",
  ];

  const recommendations = layoutNames.map((layoutName) =>
    calculateLayoutScore(imageAnalyses, layoutName)
  );

  // Sort by score descending
  return recommendations.sort((a, b) => b.score - a.score);
};

/**
 * Get the best smart layout recommendation
 */
export const getBestSmartLayout = async (
  images: Array<{ file?: File; url: string }>
): Promise<LayoutRecommendation | null> => {
  const recommendations = await getSmartLayoutRecommendations(images);
  return recommendations.length > 0 ? recommendations[0] : null;
};
