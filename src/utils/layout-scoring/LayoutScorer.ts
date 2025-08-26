/**
 * Main layout scoring system using strategy pattern
 */

import { ImageAnalysis, LayoutScore, ScoringContext } from "./types";
import { LayoutScorerFactory } from "./LayoutScorerFactory";

/**
 * Create scoring context from image analyses
 */
function createScoringContext(imageAnalyses: ImageAnalysis[]): ScoringContext {
  const imageCount = imageAnalyses.length;

  // Count orientations
  const orientationCounts = imageAnalyses.reduce(
    (counts, img) => {
      counts[img.dimensions.orientation]++;
      return counts;
    },
    { portrait: 0, landscape: 0, square: 0 }
  );

  const portraitCount = orientationCounts.portrait;
  const landscapeCount = orientationCounts.landscape;
  const squareCount = orientationCounts.square;

  // Calculate averages
  const avgAestheticScore =
    imageAnalyses.reduce((sum, img) => sum + img.dimensions.aestheticScore, 0) /
    imageCount;
  const avgVisualWeight =
    imageAnalyses.reduce((sum, img) => sum + img.dimensions.visualWeight, 0) /
    imageCount;

  // Calculate orientation dominance
  const maxOrientationCount = Math.max(
    portraitCount,
    landscapeCount,
    squareCount
  );
  const orientationDominance = maxOrientationCount / imageCount;

  // Calculate visual balance
  const visualWeights = imageAnalyses.map((img) => img.dimensions.visualWeight);
  const weightVariance =
    visualWeights.reduce(
      (sum, weight) => sum + Math.pow(weight - avgVisualWeight, 2),
      0
    ) / imageCount;
  const balanceScore = Math.max(0, 1 - weightVariance * 2);

  return {
    imageCount,
    portraitCount,
    landscapeCount,
    squareCount,
    avgAestheticScore,
    avgVisualWeight,
    orientationDominance,
    balanceScore,
  };
}

/**
 * Calculate layout score using strategy pattern
 */
export function calculateLayoutScore(
  imageAnalyses: ImageAnalysis[],
  layoutName: string
): LayoutScore {
  // Get the appropriate scorer
  const scorer = LayoutScorerFactory.getScorer(layoutName);

  if (!scorer) {
    // Fallback for unknown layouts
    return {
      layoutName,
      score: 0,
      reason: "Unknown layout",
      detailedAnalysis: {
        orientationMatch: 0,
        imageCountMatch: 0,
        aestheticScore: 0,
        balanceScore: 0,
        visualImpact: 0,
      },
      confidence: "low",
    };
  }

  // Create scoring context
  const context = createScoringContext(imageAnalyses);

  // Calculate score using the strategy
  return scorer.calculateScore(imageAnalyses, context);
}

/**
 * Calculate scores for all available layouts
 */
export function calculateAllLayoutScores(
  imageAnalyses: ImageAnalysis[]
): LayoutScore[] {
  const context = createScoringContext(imageAnalyses);
  const results: LayoutScore[] = [];

  for (const layoutName of LayoutScorerFactory.getAvailableLayouts()) {
    const scorer = LayoutScorerFactory.getScorer(layoutName);
    if (scorer) {
      results.push(scorer.calculateScore(imageAnalyses, context));
    }
  }

  // Sort by score descending
  return results.sort((a, b) => b.score - a.score);
}
