/**
 * Scoring strategy for portrait-oriented layouts
 */

import { BaseLayoutScorer } from "./BaseLayoutScorer";
import { LayoutScore, ScoringContext, ImageAnalysis } from "./types";

export class PortraitLayoutScorer extends BaseLayoutScorer {
  private readonly targetImageCount: number;
  private readonly bonusThreshold: number;

  constructor(
    layoutName: string,
    targetImageCount: number,
    bonusThreshold: number = 20
  ) {
    super(layoutName);
    this.targetImageCount = targetImageCount;
    this.bonusThreshold = bonusThreshold;
  }

  calculateScore(
    images: ImageAnalysis[],
    context: ScoringContext
  ): LayoutScore {
    const { imageCount, portraitCount } = context;

    // Calculate component scores
    const imageCountMatch =
      imageCount >= this.targetImageCount
        ? Math.min(100, (this.targetImageCount / imageCount) * 100)
        : (imageCount / this.targetImageCount) * 100;

    const orientationMatch = (portraitCount / imageCount) * 100;
    const visualImpact = context.avgVisualWeight * 100;

    // Base score calculation
    let score =
      orientationMatch * 0.5 + imageCountMatch * 0.3 + visualImpact * 0.2;
    let confidence: "high" | "medium" | "low" = "medium";

    // Apply bonuses and penalties
    if (portraitCount === imageCount && imageCount >= this.targetImageCount) {
      score += this.bonusThreshold;
      confidence = "high";
    } else if (orientationMatch < 50) {
      confidence = "low";
    } else if (imageCount < Math.max(3, this.targetImageCount - 2)) {
      confidence = "low";
      score *= 0.5; // Heavy penalty for too few images
    }

    // Generate reason
    const reason = this.generateReason(imageCount, portraitCount);

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

  private generateReason(imageCount: number, portraitCount: number): string {
    if (imageCount === this.targetImageCount) {
      return `Perfect for ${portraitCount} portrait images`;
    }

    if (imageCount >= this.targetImageCount) {
      return `Excellent for ${portraitCount} portrait images in gallery style`;
    }

    return `${portraitCount}/${imageCount} images are portrait (optimal: ${this.targetImageCount} portraits)`;
  }
}
