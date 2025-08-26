/**
 * Scoring strategy for mosaic layouts
 */

import { BaseLayoutScorer } from "./BaseLayoutScorer";
import { LayoutScore, ScoringContext, ImageAnalysis } from "./types";

export class MosaicLayoutScorer extends BaseLayoutScorer {
  private readonly minOptimalCount: number;
  private readonly idealCount: number;
  private readonly varietyThreshold: number;

  constructor(
    layoutName: string,
    minOptimalCount: number = 8,
    idealCount: number = 12,
    varietyThreshold: number = 0.7
  ) {
    super(layoutName);
    this.minOptimalCount = minOptimalCount;
    this.idealCount = idealCount;
    this.varietyThreshold = varietyThreshold;
  }

  calculateScore(
    images: ImageAnalysis[],
    context: ScoringContext
  ): LayoutScore {
    const { imageCount, orientationDominance } = context;

    // Calculate component scores
    const imageCountMatch =
      imageCount >= this.minOptimalCount
        ? Math.min(100, 70 + (imageCount - this.minOptimalCount) * 2)
        : (imageCount / this.minOptimalCount) * 100;

    const orientationMatch = (1 - orientationDominance) * 100; // Prefer variety
    const visualImpact = context.balanceScore * 100;

    // Base score calculation
    let score =
      orientationMatch * 0.3 + imageCountMatch * 0.5 + visualImpact * 0.2;
    let confidence: "high" | "medium" | "low" = "medium";

    // Apply bonuses and penalties
    if (
      imageCount >= this.idealCount &&
      orientationDominance < this.varietyThreshold
    ) {
      score += 20; // Bonus for large varied collections
      confidence = "high";
    } else if (imageCount < 6) {
      confidence = "low";
    }

    // Generate reason
    const reason =
      imageCount >= this.minOptimalCount
        ? `Dynamic layout showcases ${imageCount} diverse images`
        : `Better with more images (have ${imageCount}, ideal: ${this.minOptimalCount}+)`;

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
