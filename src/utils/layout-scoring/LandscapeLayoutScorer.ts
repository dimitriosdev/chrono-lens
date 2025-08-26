/**
 * Scoring strategy for landscape-oriented layouts
 */

import { BaseLayoutScorer } from "./BaseLayoutScorer";
import { LayoutScore, ScoringContext, ImageAnalysis } from "./types";

export class LandscapeLayoutScorer extends BaseLayoutScorer {
  private readonly targetImageCount: number;
  private readonly landscapeThreshold: number;

  constructor(
    layoutName: string,
    targetImageCount: number,
    landscapeThreshold: number = 0.7
  ) {
    super(layoutName);
    this.targetImageCount = targetImageCount;
    this.landscapeThreshold = landscapeThreshold;
  }

  calculateScore(
    images: ImageAnalysis[],
    context: ScoringContext
  ): LayoutScore {
    const { imageCount, landscapeCount } = context;

    // Calculate component scores
    const imageCountMatch =
      imageCount >= this.targetImageCount
        ? Math.min(100, (this.targetImageCount / imageCount) * 100)
        : (imageCount / this.targetImageCount) * 100;

    const orientationMatch = (landscapeCount / imageCount) * 100;
    const visualImpact = context.avgAestheticScore * 100;

    // Base score calculation
    let score =
      orientationMatch * 0.5 + imageCountMatch * 0.3 + visualImpact * 0.2;
    let confidence: "high" | "medium" | "low" = "medium";

    // Apply bonuses
    if (
      landscapeCount >= imageCount * this.landscapeThreshold &&
      imageCount >= this.targetImageCount
    ) {
      score += 20; // Bonus for mostly landscape
      confidence = "high";
    }

    const reason = `${landscapeCount}/${imageCount} landscape images (optimal for wide photos)`;

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
