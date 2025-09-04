/**
 * Scoring strategy for column stack layouts
 */

import { BaseLayoutScorer } from "./BaseLayoutScorer";
import { LayoutScore, ScoringContext, ImageAnalysis } from "./types";

export class ColumnStackLayoutScorer extends BaseLayoutScorer {
  private readonly maxOptimalCount: number;
  private readonly portraitThreshold: number;

  constructor(
    layoutName: string,
    maxOptimalCount: number = 10,
    portraitThreshold: number = 0.6
  ) {
    super(layoutName);
    this.maxOptimalCount = maxOptimalCount;
    this.portraitThreshold = portraitThreshold;
  }

  calculateScore(
    images: ImageAnalysis[],
    context: ScoringContext
  ): LayoutScore {
    const { imageCount, portraitCount } = context;

    // Calculate component scores
    const imageCountMatch =
      imageCount <= this.maxOptimalCount
        ? 90
        : Math.max(60, 90 - (imageCount - this.maxOptimalCount) * 3);

    const orientationMatch = (portraitCount / imageCount) * 80 + 20; // Prefer portraits but works with any
    const visualImpact = context.balanceScore * 100;

    // Base score calculation
    let score =
      orientationMatch * 0.4 + imageCountMatch * 0.3 + visualImpact * 0.3;
    let confidence: "high" | "medium" | "low" = "medium";

    // Apply bonuses
    if (portraitCount >= imageCount * this.portraitThreshold) {
      score += 20; // Bonus for portrait-heavy collections
      confidence = "high";
    }

    const reason = `Vertical layout ${
      portraitCount >= imageCount * this.portraitThreshold ? "perfect" : "good"
    } for mobile viewing`;

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
