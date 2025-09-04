/**
 * Scoring strategy for single row layouts
 */

import { BaseLayoutScorer } from "./BaseLayoutScorer";
import { LayoutScore, ScoringContext, ImageAnalysis } from "./types";

export class SingleRowLayoutScorer extends BaseLayoutScorer {
  private readonly maxOptimalCount: number;
  private readonly idealMinCount: number;
  private readonly idealMaxCount: number;

  constructor(
    layoutName: string,
    maxOptimalCount: number = 8,
    idealMinCount: number = 3,
    idealMaxCount: number = 6
  ) {
    super(layoutName);
    this.maxOptimalCount = maxOptimalCount;
    this.idealMinCount = idealMinCount;
    this.idealMaxCount = idealMaxCount;
  }

  calculateScore(
    images: ImageAnalysis[],
    context: ScoringContext
  ): LayoutScore {
    const { imageCount } = context;

    // Calculate component scores
    const imageCountMatch =
      imageCount <= this.maxOptimalCount
        ? 100
        : Math.max(50, 100 - (imageCount - this.maxOptimalCount) * 5);

    const orientationMatch = 80; // Works with any orientation
    const visualImpact = context.avgAestheticScore * 100;

    // Base score calculation
    let score =
      orientationMatch * 0.3 + imageCountMatch * 0.4 + visualImpact * 0.3;
    let confidence: "high" | "medium" | "low" = "medium";

    // Apply bonuses
    if (imageCount >= this.idealMinCount && imageCount <= this.idealMaxCount) {
      score += 15; // Bonus for ideal count
      confidence = "high";
    }

    // Generate reason
    const reason =
      imageCount <= this.maxOptimalCount
        ? `Great horizontal flow for ${imageCount} images`
        : `Too many images for single row (have ${imageCount}, ideal: ${this.idealMinCount}-${this.maxOptimalCount})`;

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
