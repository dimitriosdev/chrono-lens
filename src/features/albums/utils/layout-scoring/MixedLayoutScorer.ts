/**
 * Scoring strategy for mixed/diverse layouts
 */

import { BaseLayoutScorer } from "./BaseLayoutScorer";
import { LayoutScore, ScoringContext, ImageAnalysis } from "./types";

export class MixedLayoutScorer extends BaseLayoutScorer {
  private readonly minImageCount: number;
  private readonly diversityThreshold: number;

  constructor(
    layoutName: string,
    minImageCount: number = 4,
    diversityThreshold: number = 66
  ) {
    super(layoutName);
    this.minImageCount = minImageCount;
    this.diversityThreshold = diversityThreshold;
  }

  calculateScore(
    images: ImageAnalysis[],
    context: ScoringContext
  ): LayoutScore {
    const { imageCount, portraitCount, landscapeCount, squareCount } = context;

    // Calculate diversity score
    const diversityScore =
      ((Math.min(portraitCount, 1) +
        Math.min(landscapeCount, 1) +
        Math.min(squareCount, 1)) /
        3) *
      100;

    // Calculate component scores
    const imageCountMatch =
      imageCount >= this.minImageCount
        ? 90
        : (imageCount / this.minImageCount) * 100;

    const orientationMatch = diversityScore;
    const visualImpact = context.balanceScore * 100;

    // Base score calculation
    let score =
      orientationMatch * 0.4 + imageCountMatch * 0.3 + visualImpact * 0.3;
    let confidence: "high" | "medium" | "low" = "medium";

    // Apply bonuses
    if (diversityScore > this.diversityThreshold && imageCount >= 6) {
      score += 15; // Bonus for good variety
      confidence = "high";
    }

    const reason = `Great variety (P:${portraitCount}, L:${landscapeCount}, S:${squareCount})`;

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
