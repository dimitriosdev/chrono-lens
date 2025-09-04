/**
 * Factory for creating layout scoring strategies
 */

import { LayoutScorer } from "./types";
import { PortraitLayoutScorer } from "./PortraitLayoutScorer";
import { LandscapeLayoutScorer } from "./LandscapeLayoutScorer";
import { GridLayoutScorer } from "./GridLayoutScorer";
import { SingleRowLayoutScorer } from "./SingleRowLayoutScorer";
import { MixedLayoutScorer } from "./MixedLayoutScorer";
import { ColumnStackLayoutScorer } from "./ColumnStackLayoutScorer";
import { SlideshowLayoutScorer } from "./SlideshowLayoutScorer";
import { MosaicLayoutScorer } from "./MosaicLayoutScorer";

/**
 * Factory for creating layout scoring strategies
 */
export class LayoutScorerFactory {
  private static readonly scorers = new Map<string, LayoutScorer>();

  static {
    // Initialize all layout scorers
    this.scorers.set(
      "3 Portraits",
      new PortraitLayoutScorer("3 Portraits", 3, 20)
    );
    this.scorers.set(
      "6 Portraits",
      new PortraitLayoutScorer("6 Portraits", 6, 25)
    );
    this.scorers.set(
      "3x2 Landscape",
      new LandscapeLayoutScorer("3x2 Landscape", 6)
    );
    this.scorers.set("2x2 Grid", new GridLayoutScorer("2x2 Grid", 4, true)); // Prefers mixed orientations
    this.scorers.set("Single Row", new SingleRowLayoutScorer("Single Row"));
    this.scorers.set("Mixed Grid", new MixedLayoutScorer("Mixed Grid"));
    this.scorers.set(
      "Column Stack",
      new ColumnStackLayoutScorer("Column Stack")
    );
    this.scorers.set("Slideshow", new SlideshowLayoutScorer("Slideshow"));
    this.scorers.set("Mosaic", new MosaicLayoutScorer("Mosaic"));
  }

  /**
   * Get a scorer for the specified layout name
   */
  static getScorer(layoutName: string): LayoutScorer | undefined {
    return this.scorers.get(layoutName);
  }

  /**
   * Get all available layout names
   */
  static getAvailableLayouts(): string[] {
    return Array.from(this.scorers.keys());
  }

  /**
   * Register a custom scorer
   */
  static registerScorer(layoutName: string, scorer: LayoutScorer): void {
    this.scorers.set(layoutName, scorer);
  }
}
