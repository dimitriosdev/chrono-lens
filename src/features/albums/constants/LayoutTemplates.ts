import { LayoutTemplate } from "@/shared/types/album";

/**
 * Generate template slots based on orientation
 */
function generateSlots(
  photoCount: 1 | 2 | 3 | 4 | 6 | 12,
  orientation: "portrait" | "landscape",
) {
  const isPortrait = orientation === "portrait";

  // Wall is 16:9, so actual slot ratio = (width% / height%) * (16/9)
  // For portrait photos (9:16): height% = width% * 3.16
  // For landscape photos (16:9): height% = width%

  switch (photoCount) {
    case 1:
      // Single photo centered
      return isPortrait
        ? [
            // Portrait photo (9:16): height 80% → width = 80 / 3.16 = 25.3%
            // Center: x = (100 - 25.3) / 2 = 37.35, y = (100 - 80) / 2 = 10
            { id: "slot-1", x: 37.35, y: 10, width: 25.3, height: 80 },
          ]
        : [
            // Landscape photo (16:9): width 80% → height = 80%
            // Center: x = (100 - 80) / 2 = 10, y = (100 - 80) / 2 = 10
            { id: "slot-1", x: 10, y: 10, width: 80, height: 80 },
          ];
    case 2:
      return isPortrait
        ? [
            // Portrait (9:16): height 80% → width = 80 / 3.16 = 25.3%
            // Equal gaps: (100 - 50.6) / 3 = 16.47%
            // y = (100 - 80) / 2 = 10
            { id: "slot-1", x: 16.47, y: 10, width: 25.3, height: 80 },
            { id: "slot-2", x: 58.23, y: 10, width: 25.3, height: 80 },
          ]
        : [
            // Landscape (16:9): width 44% → height = 44%
            // Equal gaps: (100 - 88) / 3 = 4%
            // y = (100 - 44) / 2 = 28
            { id: "slot-1", x: 4, y: 28, width: 44, height: 44 },
            { id: "slot-2", x: 52, y: 28, width: 44, height: 44 },
          ];
    case 3:
      // 3 photos - portrait orientation only
      // Portrait (9:16): height 80% → width = 80 / 3.16 = 25.3%
      // 3 photos width = 75.9%, gaps = (100 - 75.9) / 4 = 6.025%
      // y = (100 - 80) / 2 = 10
      return [
        { id: "slot-1", x: 6.025, y: 10, width: 25.3, height: 80 },
        { id: "slot-2", x: 37.35, y: 10, width: 25.3, height: 80 },
        { id: "slot-3", x: 68.675, y: 10, width: 25.3, height: 80 },
      ];
    case 4:
      // 4 photos - landscape orientation only (2x2 grid)
      // Landscape (16:9): width 44% → height = 44%
      // gaps = (100 - 88) / 3 = 4%
      // 2 rows: y1 = 4, y2 = 4 + 44 + 4 = 52
      return [
        { id: "slot-1", x: 4, y: 4, width: 44, height: 44 },
        { id: "slot-2", x: 52, y: 4, width: 44, height: 44 },
        { id: "slot-3", x: 4, y: 52, width: 44, height: 44 },
        { id: "slot-4", x: 52, y: 52, width: 44, height: 44 },
      ];
    case 6:
      // 6 photos - landscape orientation only (3x2 grid)
      // Landscape (16:9): width 30% → height = 30%
      // gaps = (100 - 90) / 4 = 2.5%
      // 2 rows: y1 = 17.5, y2 = 17.5 + 30 + 5 = 52.5
      return [
        { id: "slot-1", x: 2.5, y: 17.5, width: 30, height: 30 },
        { id: "slot-2", x: 35, y: 17.5, width: 30, height: 30 },
        { id: "slot-3", x: 67.5, y: 17.5, width: 30, height: 30 },
        { id: "slot-4", x: 2.5, y: 52.5, width: 30, height: 30 },
        { id: "slot-5", x: 35, y: 52.5, width: 30, height: 30 },
        { id: "slot-6", x: 67.5, y: 52.5, width: 30, height: 30 },
      ];
    case 12:
      // 12 photos - landscape orientation only (4x3 grid)
      // Landscape (16:9): width 22% → height = 22%
      // 4 columns = 88%, horizontal gaps = (100 - 88) / 5 = 2.4%
      // 3 rows = 66%, vertical gaps = (100 - 66) / 4 = 8.5%
      return [
        { id: "slot-1", x: 2.4, y: 8.5, width: 22, height: 22 },
        { id: "slot-2", x: 26.8, y: 8.5, width: 22, height: 22 },
        { id: "slot-3", x: 51.2, y: 8.5, width: 22, height: 22 },
        { id: "slot-4", x: 75.6, y: 8.5, width: 22, height: 22 },
        { id: "slot-5", x: 2.4, y: 39, width: 22, height: 22 },
        { id: "slot-6", x: 26.8, y: 39, width: 22, height: 22 },
        { id: "slot-7", x: 51.2, y: 39, width: 22, height: 22 },
        { id: "slot-8", x: 75.6, y: 39, width: 22, height: 22 },
        { id: "slot-9", x: 2.4, y: 69.5, width: 22, height: 22 },
        { id: "slot-10", x: 26.8, y: 69.5, width: 22, height: 22 },
        { id: "slot-11", x: 51.2, y: 69.5, width: 22, height: 22 },
        { id: "slot-12", x: 75.6, y: 69.5, width: 22, height: 22 },
      ];
    default:
      return [];
  }
}

/**
 * Create a template with specified configuration
 */
function createTemplate(
  photoCount: 1 | 2 | 3 | 4 | 6 | 12,
  orientation: "portrait" | "landscape",
  frameWidth: number,
  frameColor: string,
  matWidth: number,
  matColor: string,
): LayoutTemplate {
  return {
    id: `${photoCount}-photo-${orientation}`,
    name: `${photoCount} Photo${photoCount > 1 ? "s" : ""}`,
    photoCount,
    orientation,
    frameWidth,
    frameColor,
    matWidth,
    matColor,
    slots: generateSlots(photoCount, orientation),
  };
}

/**
 * Get template by photo count with configuration
 */
export function getTemplateByCount(
  count: 1 | 2 | 3 | 4 | 6 | 12,
  orientation: "portrait" | "landscape" = "landscape",
  frameWidth: number = 0,
  frameColor: string = "#1a1a1a",
  matWidth: number = 0,
  matColor: string = "#FFFFFF",
): LayoutTemplate {
  return createTemplate(
    count,
    orientation,
    frameWidth,
    frameColor,
    matWidth,
    matColor,
  );
}

/**
 * Get all available template counts
 */
export function getAvailableTemplateCounts(): Array<1 | 2 | 3 | 4 | 6 | 12> {
  return [1, 2, 3, 4, 6, 12];
}

/**
 * Create initial slots with default image positions
 */
export function createInitialSlots(
  template: LayoutTemplate,
): LayoutTemplate["slots"] {
  return template.slots.map((slot) => ({
    ...slot,
    position: { x: 0, y: 0, zoom: 1 },
  }));
}
