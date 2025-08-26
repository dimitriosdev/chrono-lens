/**
 * Scoring strategy for grid-based layouts
 */

import { BaseLayoutScorer } from "./BaseLayoutScorer";
import { LayoutScore, ScoringContext, ImageAnalysis } from "./types";

export class GridLayoutScorer extends BaseLayoutScorer {
  private readonly targetImageCount: number;
  private readonly preferMixedOrientations: boolean;

  constructor(
    layoutName: string,
    targetImageCount: number,
    preferMixedOrientations: boolean = false
  ) {
    super(layoutName);
    this.targetImageCount = targetImageCount;
    this.preferMixedOrientations = preferMixedOrientations;
  }

  calculateScore(
    images: ImageAnalysis[],
    context: ScoringContext
  ): LayoutScore {
    const { imageCount, orientationDominance } = context;

    // Calculate component scores
    const imageCountMatch =
      imageCount >= this.targetImageCount
        ? 100
        : (imageCount / this.targetImageCount) * 100;

    const orientationMatch = this.preferMixedOrientations
      ? orientationDominance < 0.8
        ? 90
        : 60 // Prefer variety
      : 80; // Works with any orientation

    const visualImpact = context.balanceScore * 100;

    // Base score calculation
    let score =
      orientationMatch * 0.4 + imageCountMatch * 0.4 + visualImpact * 0.2;
    let confidence: "high" | "medium" | "low" = "medium";

    // Apply bonuses
    if (imageCount === this.targetImageCount) {
      if (this.preferMixedOrientations && orientationDominance < 0.8) {
        score += 15; // Bonus for variety
        confidence = "high";
      } else if (!this.preferMixedOrientations) {
        score += 10; // Bonus for exact count
        confidence = "high";
      }
    }

    const reason = `Good for ${imageCount} images with balanced composition`;

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
