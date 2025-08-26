/**
 * Scoring strategy for slideshow layouts
 */

import { BaseLayoutScorer } from "./BaseLayoutScorer";
import { LayoutScore, ScoringContext, ImageAnalysis } from "./types";

export class SlideshowLayoutScorer extends BaseLayoutScorer {
  private readonly baseScore: number;
  private readonly bonusThreshold: number;
  private readonly smallCollectionThreshold: number;

  constructor(
    layoutName: string,
    baseScore: number = 70,
    bonusThreshold: number = 10,
    smallCollectionThreshold: number = 3
  ) {
    super(layoutName);
    this.baseScore = baseScore;
    this.bonusThreshold = bonusThreshold;
    this.smallCollectionThreshold = smallCollectionThreshold;
  }

  calculateScore(
    images: ImageAnalysis[],
    context: ScoringContext
  ): LayoutScore {
    const { imageCount } = context;

    let score = this.baseScore; // Base score - always decent option
    const imageCountMatch = 100; // Works with any count
    const orientationMatch = 90; // Works with any orientation
    const visualImpact = context.avgAestheticScore * 100;
    let confidence: "high" | "medium" | "low" = "medium";

    // Apply bonuses
    if (imageCount > this.bonusThreshold) {
      score += 15; // Bonus for many images
      confidence = "high";
    } else if (imageCount < this.smallCollectionThreshold) {
      score += 10; // Good for few images
    }

    // Generate reason
    const reason =
      imageCount > this.bonusThreshold
        ? `Perfect for large collection (${imageCount} images)`
        : `Classic presentation for ${imageCount} images`;

    return this.createResult(
      score,
      reason,
      orientationMatch,
      imageCountMatch,
      visualImpact,
      context,
      confidence
    );
  }
}
