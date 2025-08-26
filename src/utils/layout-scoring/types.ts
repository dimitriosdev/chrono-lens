/**
 * Types for the layout scoring system
 */

export interface ImageAnalysis {
  url: string;
  dimensions: {
    width: number;
    height: number;
    aspectRatio: number;
    orientation: "portrait" | "landscape" | "square";
    visualWeight: number;
    aestheticScore: number;
  };
  file?: File;
  fileSize?: number;
}

export interface LayoutScore {
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

export interface ScoringContext {
  imageCount: number;
  portraitCount: number;
  landscapeCount: number;
  squareCount: number;
  avgAestheticScore: number;
  avgVisualWeight: number;
  orientationDominance: number;
  balanceScore: number;
}

/**
 * Interface for layout scoring strategies
 */
export interface LayoutScorer {
  /**
   * Calculate the score for this layout given the images and context
   */
  calculateScore(images: ImageAnalysis[], context: ScoringContext): LayoutScore;
}
