/**
 * Base class for layout scorers with common functionality
 */

import {
  LayoutScorer,
  LayoutScore,
  ScoringContext,
  ImageAnalysis,
} from "./types";

export abstract class BaseLayoutScorer implements LayoutScorer {
  protected readonly layoutName: string;

  constructor(layoutName: string) {
    this.layoutName = layoutName;
  }

  abstract calculateScore(
    images: ImageAnalysis[],
    context: ScoringContext
  ): LayoutScore;

  /**
   * Helper method to determine confidence level based on score
   */
  protected determineConfidence(
    score: number,
    baseConfidence: "high" | "medium" | "low" = "medium"
  ): "high" | "medium" | "low" {
    if (baseConfidence === "low") {
      return "low";
    }

    if (score > 85) {
      return "high";
    } else if (score < 40) {
      return "low";
    }

    return baseConfidence;
  }

  /**
   * Helper method to clamp score between 0 and 100
   */
  protected clampScore(score: number): number {
    return Math.min(100, Math.max(0, score));
  }

  /**
   * Helper method to create a LayoutScore result
   */
  protected createResult(
    score: number,
    reason: string,
    orientationMatch: number,
    imageCountMatch: number,
    visualImpact: number,
    context: ScoringContext,
    confidence: "high" | "medium" | "low" = "medium"
  ): LayoutScore {
    const finalScore = this.clampScore(score);
    const finalConfidence = this.determineConfidence(finalScore, confidence);

    return {
      layoutName: this.layoutName,
      score: finalScore,
      reason,
      detailedAnalysis: {
        orientationMatch,
        imageCountMatch,
        aestheticScore: context.avgAestheticScore * 100,
        balanceScore: context.balanceScore * 100,
        visualImpact,
      },
      confidence: finalConfidence,
    };
  }
}
