// Image analysis utilities for smart layout detection

export interface ImageDimensions {
  width: number;
  height: number;
  aspectRatio: number;
  orientation: "portrait" | "landscape" | "square";
}

export interface ImageAnalysis {
  url: string;
  dimensions: ImageDimensions;
  file?: File;
}

export interface LayoutRecommendation {
  layoutName: string;
  score: number;
  reason: string;
}

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

      URL.revokeObjectURL(url);
      resolve({
        width,
        height,
        aspectRatio,
        orientation,
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
 * Get image dimensions from an existing URL
 */
export const getImageDimensionsFromUrl = (
  url: string
): Promise<ImageDimensions> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

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

      resolve({
        width,
        height,
        aspectRatio,
        orientation,
      });
    };

    img.onerror = () => {
      reject(new Error("Failed to load image from URL"));
    };

    img.src = url;
  });
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
      });
    } catch (error) {
      console.warn(`Failed to analyze image ${image.url}:`, error);
      // Provide fallback dimensions
      analyses.push({
        url: image.url,
        dimensions: {
          width: 1,
          height: 1,
          aspectRatio: 1,
          orientation: "square",
        },
        file: image.file,
      });
    }
  }

  return analyses;
};

/**
 * Calculate layout compatibility score
 */
export const calculateLayoutScore = (
  imageAnalyses: ImageAnalysis[],
  layoutName: string
): LayoutRecommendation => {
  const imageCount = imageAnalyses.length;

  if (imageCount === 0) {
    return { layoutName, score: 0, reason: "No images to analyze" };
  }

  // Count orientations
  const orientationCounts = imageAnalyses.reduce((acc, analysis) => {
    acc[analysis.dimensions.orientation] =
      (acc[analysis.dimensions.orientation] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const portraitCount = orientationCounts.portrait || 0;
  const landscapeCount = orientationCounts.landscape || 0;
  const squareCount = orientationCounts.square || 0;

  let score = 0;
  let reason = "";

  switch (layoutName) {
    case "3 Portraits":
      if (imageCount >= 3) {
        score = (portraitCount / imageCount) * 100;
        if (portraitCount === imageCount) {
          score += 20; // Bonus for all portrait
        }
        reason = `${portraitCount}/${imageCount} images are portrait orientation`;
      } else {
        score = 0;
        reason = `Need at least 3 images (have ${imageCount})`;
      }
      break;

    case "6 Portraits":
      if (imageCount >= 6) {
        score = (portraitCount / imageCount) * 100;
        if (portraitCount === imageCount) {
          score += 25; // Higher bonus for 6-image layout
        }
        reason = `${portraitCount}/${imageCount} images are portrait orientation`;
      } else {
        score = Math.max(0, 50 - (6 - imageCount) * 10);
        reason = `Need 6 images for optimal display (have ${imageCount})`;
      }
      break;

    case "2x2 Grid":
      if (imageCount >= 4) {
        score = 80;
        if (squareCount >= imageCount * 0.5) {
          score += 15; // Bonus for square images
        }
        reason = `Good for ${imageCount} mixed orientation images`;
      } else {
        score = 30;
        reason = `Better with 4+ images (have ${imageCount})`;
      }
      break;

    case "3x2 Landscape":
      if (imageCount >= 6) {
        score = (landscapeCount / imageCount) * 100;
        if (landscapeCount >= imageCount * 0.7) {
          score += 20; // Bonus for mostly landscape
        }
        reason = `${landscapeCount}/${imageCount} images are landscape orientation`;
      } else {
        score = 20;
        reason = `Need 6+ images for landscape grid (have ${imageCount})`;
      }
      break;

    case "Mixed Grid":
      if (imageCount >= 4) {
        const mixedScore =
          Math.min(portraitCount, landscapeCount, squareCount) * 10;
        score = 60 + mixedScore;
        reason = `Good for mixed orientations (P:${portraitCount}, L:${landscapeCount}, S:${squareCount})`;
      } else {
        score = 25;
        reason = `Better with more variety (have ${imageCount} images)`;
      }
      break;

    case "Slideshow":
      score = 70; // Always decent option
      if (imageCount > 10) {
        score += 10; // Bonus for many images
      }
      reason = `Works with any number of images (${imageCount} total)`;
      break;

    case "Mosaic":
      if (imageCount >= 8) {
        score = 75 + Math.min(imageCount - 8, 20);
        reason = `Great for large collections (${imageCount} images)`;
      } else {
        score = 40;
        reason = `Better with 8+ images (have ${imageCount})`;
      }
      break;

    default:
      score = 0;
      reason = "Unknown layout";
  }

  return { layoutName, score, reason };
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
    "2x2 Grid",
    "3x2 Landscape",
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
