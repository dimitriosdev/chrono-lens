// Enhanced image analysis utilities for smart layout detection

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
      if (process.env.NODE_ENV === "development") {
        console.log("Using URL pattern analysis for:", url);
      }
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
 * Enhanced layout compatibility scoring with detailed analysis
 */
export const calculateLayoutScore = (
  imageAnalyses: ImageAnalysis[],
  layoutName: string
): LayoutRecommendation => {
  const imageCount = imageAnalyses.length;

  if (imageCount === 0) {
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

  // Count orientations and calculate metrics
  const orientationCounts = imageAnalyses.reduce((acc, analysis) => {
    acc[analysis.dimensions.orientation] =
      (acc[analysis.dimensions.orientation] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const portraitCount = orientationCounts.portrait || 0;
  const landscapeCount = orientationCounts.landscape || 0;
  const squareCount = orientationCounts.square || 0;

  // Calculate average aesthetic and visual weight scores
  const avgAestheticScore =
    imageAnalyses.reduce((sum, img) => sum + img.dimensions.aestheticScore, 0) /
    imageCount;
  const avgVisualWeight =
    imageAnalyses.reduce((sum, img) => sum + img.dimensions.visualWeight, 0) /
    imageCount;

  // Calculate orientation dominance (how uniform are the orientations)
  const maxOrientationCount = Math.max(
    portraitCount,
    landscapeCount,
    squareCount
  );
  const orientationDominance = maxOrientationCount / imageCount;

  // Calculate visual balance (distribution of visual weights)
  const visualWeights = imageAnalyses.map((img) => img.dimensions.visualWeight);
  const weightVariance =
    visualWeights.reduce(
      (sum, weight) => sum + Math.pow(weight - avgVisualWeight, 2),
      0
    ) / imageCount;
  const balanceScore = Math.max(0, 1 - weightVariance * 2); // Lower variance = better balance

  let score = 0;
  let reason = "";
  let orientationMatch = 0;
  let imageCountMatch = 0;
  let visualImpact = 0;
  let confidence: "high" | "medium" | "low" = "medium";

  switch (layoutName) {
    case "3 Portraits":
      imageCountMatch =
        imageCount >= 3
          ? Math.min(100, (3 / imageCount) * 100)
          : (imageCount / 3) * 100;
      orientationMatch = (portraitCount / imageCount) * 100;
      visualImpact = avgVisualWeight * 100;

      score =
        orientationMatch * 0.5 + imageCountMatch * 0.3 + visualImpact * 0.2;
      if (portraitCount === imageCount && imageCount >= 3) {
        score += 20; // Bonus for perfect match
        confidence = "high";
      } else if (orientationMatch < 50) {
        confidence = "low";
      }

      reason =
        imageCount === 3
          ? `Perfect for ${portraitCount} portrait images`
          : `${portraitCount}/${imageCount} images are portrait (optimal: 3 portraits)`;
      break;

    case "6 Portraits":
      imageCountMatch =
        imageCount >= 6
          ? Math.min(100, (6 / imageCount) * 100)
          : (imageCount / 6) * 100;
      orientationMatch = (portraitCount / imageCount) * 100;
      visualImpact = avgVisualWeight * 100;

      score =
        orientationMatch * 0.5 + imageCountMatch * 0.3 + visualImpact * 0.2;
      if (portraitCount === imageCount && imageCount >= 6) {
        score += 25; // Higher bonus for 6-image layout
        confidence = "high";
      } else if (imageCount < 4) {
        confidence = "low";
        score *= 0.5; // Penalize heavily for too few images
      }

      reason =
        imageCount >= 6
          ? `Excellent for ${portraitCount} portrait images in gallery style`
          : `Need more images for optimal display (have ${imageCount}, ideal: 6+)`;
      break;

    case "2x2 Grid":
      imageCountMatch = imageCount >= 4 ? 100 : (imageCount / 4) * 100;
      orientationMatch = orientationDominance < 0.8 ? 90 : 60; // Prefer mixed orientations
      visualImpact = balanceScore * 100;

      score =
        orientationMatch * 0.4 + imageCountMatch * 0.4 + visualImpact * 0.2;
      if (imageCount === 4 && orientationDominance < 0.8) {
        score += 15; // Bonus for variety
        confidence = "high";
      }

      reason = `Good for ${imageCount} images with balanced composition`;
      break;

    case "Single Row":
      imageCountMatch =
        imageCount <= 8 ? 100 : Math.max(50, 100 - (imageCount - 8) * 5);
      orientationMatch = 80; // Works with any orientation
      visualImpact = avgAestheticScore * 100;

      score =
        orientationMatch * 0.3 + imageCountMatch * 0.4 + visualImpact * 0.3;
      if (imageCount >= 3 && imageCount <= 6) {
        score += 15; // Bonus for ideal count
        confidence = "high";
      }

      reason =
        imageCount <= 8
          ? `Great horizontal flow for ${imageCount} images`
          : `Too many images for single row (have ${imageCount}, ideal: 3-8)`;
      break;

    case "3x2 Landscape":
      imageCountMatch =
        imageCount >= 6
          ? Math.min(100, (6 / imageCount) * 100)
          : (imageCount / 6) * 100;
      orientationMatch = (landscapeCount / imageCount) * 100;
      visualImpact = avgAestheticScore * 100;

      score =
        orientationMatch * 0.5 + imageCountMatch * 0.3 + visualImpact * 0.2;
      if (landscapeCount >= imageCount * 0.7 && imageCount >= 6) {
        score += 20; // Bonus for mostly landscape
        confidence = "high";
      }

      reason = `${landscapeCount}/${imageCount} landscape images (optimal for wide photos)`;
      break;

    case "Mixed Grid":
      const diversityScore =
        ((Math.min(portraitCount, 1) +
          Math.min(landscapeCount, 1) +
          Math.min(squareCount, 1)) /
          3) *
        100;
      imageCountMatch = imageCount >= 4 ? 90 : (imageCount / 4) * 100;
      orientationMatch = diversityScore;
      visualImpact = balanceScore * 100;

      score =
        orientationMatch * 0.4 + imageCountMatch * 0.3 + visualImpact * 0.3;
      if (diversityScore > 66 && imageCount >= 6) {
        score += 15; // Bonus for good variety
        confidence = "high";
      }

      reason = `Great variety (P:${portraitCount}, L:${landscapeCount}, S:${squareCount})`;
      break;

    case "Column Stack":
      imageCountMatch =
        imageCount <= 10 ? 90 : Math.max(60, 90 - (imageCount - 10) * 3);
      orientationMatch = (portraitCount / imageCount) * 80 + 20; // Prefer portraits but works with any
      visualImpact = balanceScore * 100;

      score =
        orientationMatch * 0.4 + imageCountMatch * 0.3 + visualImpact * 0.3;
      if (portraitCount >= imageCount * 0.6) {
        score += 20; // Bonus for portrait-heavy collections
        confidence = "high";
      }

      reason = `Vertical layout ${
        portraitCount >= imageCount * 0.6 ? "perfect" : "good"
      } for mobile viewing`;
      break;

    case "Slideshow":
      score = 70; // Base score - always decent option
      imageCountMatch = 100; // Works with any count
      orientationMatch = 90; // Works with any orientation
      visualImpact = avgAestheticScore * 100;

      if (imageCount > 10) {
        score += 15; // Bonus for many images
        confidence = "high";
      } else if (imageCount < 3) {
        score += 10; // Good for few images
      }

      reason =
        imageCount > 10
          ? `Perfect for large collection (${imageCount} images)`
          : `Classic presentation for ${imageCount} images`;
      break;

    case "Mosaic":
      imageCountMatch =
        imageCount >= 8
          ? Math.min(100, 70 + (imageCount - 8) * 2)
          : (imageCount / 8) * 100;
      orientationMatch = (1 - orientationDominance) * 100; // Prefer variety
      visualImpact = balanceScore * 100;

      score =
        orientationMatch * 0.3 + imageCountMatch * 0.5 + visualImpact * 0.2;
      if (imageCount >= 12 && orientationDominance < 0.7) {
        score += 20; // Bonus for large varied collections
        confidence = "high";
      } else if (imageCount < 6) {
        confidence = "low";
      }

      reason =
        imageCount >= 8
          ? `Dynamic layout showcases ${imageCount} diverse images`
          : `Better with more images (have ${imageCount}, ideal: 8+)`;
      break;

    default:
      score = 0;
      reason = "Unknown layout";
      confidence = "low";
  }

  // Determine confidence level
  if (score > 85 && confidence !== "low") {
    confidence = "high";
  } else if (score < 40) {
    confidence = "low";
  }

  return {
    layoutName,
    score: Math.min(100, Math.max(0, score)),
    reason,
    detailedAnalysis: {
      orientationMatch,
      imageCountMatch,
      aestheticScore: avgAestheticScore * 100,
      balanceScore: balanceScore * 100,
      visualImpact,
    },
    confidence,
  };
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
