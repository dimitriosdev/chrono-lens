/**
 * Auto Layout Assigner
 *
 * Smart utility that takes a set of uploaded images and automatically
 * distributes them across multiple pages with optimal layout templates.
 *
 * Algorithm:
 * 1. Analyze each image to detect aspect ratio and orientation
 * 2. Separate images into portrait vs landscape pools by aspect ratio
 * 3. Partition each pool independently using orientation-appropriate page sizes
 *    - Portrait pool  → sizes [3, 2, 1]  (templates that support portrait)
 *    - Landscape pool → sizes [12, 6, 4, 2, 1] (templates that support landscape)
 * 4. Assign the best-fitting images to each page using aspect-ratio scoring
 */

import { AlbumPage, TemplateSlot } from "@/shared/types/album";
import {
  getTemplateByCount,
  createInitialSlots,
} from "../constants/LayoutTemplates";
import { processImage } from "./imageProcessing";

type ValidCount = 1 | 2 | 3 | 4 | 6 | 12;

/**
 * Expected slot aspect ratios per template configuration.
 * Derived from the slot width/height percentages on a 16:9 canvas:
 *   slotAR = (slotWidth% / slotHeight%) × (16 / 9)
 *
 * Portrait templates (9:16 slots):  ~0.5625
 * Landscape templates (16:9 slots): ~1.7778
 */
const SLOT_ASPECT_RATIOS: Record<string, number> = {
  portrait: 9 / 16, // ≈ 0.5625
  landscape: 16 / 9, // ≈ 1.7778
};

/**
 * Orientation constraints per template photo-count.
 * 3 → portrait only;  4/6/12 → landscape only;  1/2 → flexible (either).
 */
const FIXED_ORIENTATION: Record<ValidCount, "portrait" | "landscape" | null> = {
  1: null,
  2: null,
  3: "portrait",
  4: "landscape",
  6: "landscape",
  12: "landscape",
};

// Page sizes available per orientation pool
const PORTRAIT_SIZES: ValidCount[] = [3, 2, 1];
const LANDSCAPE_SIZES: ValidCount[] = [12, 6, 4, 2, 1];

/** Information about a single analyzed image */
export interface AnalyzedImage {
  dataUrl: string;
  file: File;
  width: number;
  height: number;
  aspectRatio: number; // width / height
  orientation: "portrait" | "landscape" | "square";
}

/** Result of the auto-layout assignment */
export interface AutoLayoutResult {
  pages: AlbumPage[];
  imageCount: number;
  pageCount: number;
  analyzedImages: AnalyzedImage[];
}

/** Callback for reporting progress during image analysis */
export type ProgressCallback = (
  current: number,
  total: number,
  phase: "analyzing" | "assigning",
) => void;

// ─── Image Analysis ──────────────────────────────────────────────────────────

/**
 * Analyze a single image file: process it (HEIC conversion, optimization),
 * read as data URL, and detect natural dimensions + aspect ratio.
 */
async function analyzeImage(file: File): Promise<AnalyzedImage> {
  const processed = await processImage(file);

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const img = new window.Image();
      img.onload = () => {
        const w = img.naturalWidth;
        const h = img.naturalHeight;
        const aspectRatio = w / h;

        let orientation: AnalyzedImage["orientation"];
        if (aspectRatio < 0.85) orientation = "portrait";
        else if (aspectRatio > 1.18) orientation = "landscape";
        else orientation = "square";

        resolve({
          dataUrl,
          file: processed.file,
          width: w,
          height: h,
          aspectRatio,
          orientation,
        });
      };
      img.onerror = () =>
        reject(new Error(`Failed to load image: ${file.name}`));
      img.src = dataUrl;
    };
    reader.onerror = () =>
      reject(new Error(`Failed to read file: ${file.name}`));
    reader.readAsDataURL(processed.file);
  });
}

/**
 * Analyze multiple image files in parallel (with concurrency limit).
 */
export async function analyzeImages(
  files: File[],
  onProgress?: ProgressCallback,
): Promise<AnalyzedImage[]> {
  const results: AnalyzedImage[] = [];
  const concurrency = 3;

  for (let i = 0; i < files.length; i += concurrency) {
    const batch = files.slice(i, i + concurrency);
    const batchResults = await Promise.all(batch.map((f) => analyzeImage(f)));
    results.push(...batchResults);
    onProgress?.(
      Math.min(i + concurrency, files.length),
      files.length,
      "analyzing",
    );
  }

  return results;
}

// ─── Aspect-Ratio Scoring ────────────────────────────────────────────────────

/**
 * How well does an image fit a slot?  Lower = better.
 * Uses log-ratio so 2:1 vs 1:1 scores the same as 1:1 vs 1:2.
 */
function fitScore(imageAR: number, slotAR: number): number {
  return Math.abs(Math.log(imageAR) - Math.log(slotAR));
}

/**
 * Average fit score of a set of images against a target slot aspect ratio.
 * Used to decide which pool an image belongs to and to rank assignments.
 */
function averageFitScore(
  images: AnalyzedImage[],
  orientation: "portrait" | "landscape",
): number {
  if (images.length === 0) return Infinity;
  const targetAR = SLOT_ASPECT_RATIOS[orientation];
  return (
    images.reduce((sum, img) => sum + fitScore(img.aspectRatio, targetAR), 0) /
    images.length
  );
}

// ─── Orientation-Aware Partition ─────────────────────────────────────────────

/**
 * Partition a count into page sizes chosen from `allowedSizes` (descending).
 * Greedy with look-ahead to avoid orphan single-image remainders.
 */
function partitionCount(
  count: number,
  allowedSizes: ValidCount[],
): ValidCount[] {
  if (count <= 0) return [];

  const result: ValidCount[] = [];
  let remaining = count;

  while (remaining > 0) {
    let bestSize: ValidCount = 1;

    for (const size of allowedSizes) {
      if (size <= remaining) {
        const leftover = remaining - size;
        if (leftover === 0 || leftover >= 2) {
          bestSize = size;
          break;
        }
      }
    }

    result.push(bestSize);
    remaining -= bestSize;
  }

  return result;
}

/**
 * Classify images into portrait and landscape pools based on aspect ratio.
 *
 * Each image is scored against both the portrait slot AR (9:16 ≈ 0.5625) and
 * the landscape slot AR (16:9 ≈ 1.778). It goes into whichever pool it
 * fits better. Square images examine their actual ratio to break ties.
 */
function classifyImages(images: AnalyzedImage[]): {
  portrait: AnalyzedImage[];
  landscape: AnalyzedImage[];
} {
  const portrait: AnalyzedImage[] = [];
  const landscape: AnalyzedImage[] = [];

  for (const img of images) {
    const pScore = fitScore(img.aspectRatio, SLOT_ASPECT_RATIOS["portrait"]);
    const lScore = fitScore(img.aspectRatio, SLOT_ASPECT_RATIOS["landscape"]);

    if (pScore < lScore) {
      portrait.push(img);
    } else {
      landscape.push(img);
    }
  }

  return { portrait, landscape };
}

/**
 * Build an orientation-aware partition plan.
 *
 * 1. Classify images into portrait / landscape pools by aspect ratio.
 * 2. Partition each pool with its orientation-appropriate page sizes.
 * 3. Return a flat list of { size, orientation, imageIndices } descriptors.
 */
interface PagePlan {
  size: ValidCount;
  orientation: "portrait" | "landscape";
  images: AnalyzedImage[];
}

function planPages(images: AnalyzedImage[]): PagePlan[] {
  const { portrait, landscape } = classifyImages(images);

  // Sort each pool by fit score (best-fitting first) so the best images
  // land on the largest pages where visual impact is greatest.
  const sortByPortraitFit = (a: AnalyzedImage, b: AnalyzedImage) =>
    fitScore(a.aspectRatio, SLOT_ASPECT_RATIOS["portrait"]) -
    fitScore(b.aspectRatio, SLOT_ASPECT_RATIOS["portrait"]);

  const sortByLandscapeFit = (a: AnalyzedImage, b: AnalyzedImage) =>
    fitScore(a.aspectRatio, SLOT_ASPECT_RATIOS["landscape"]) -
    fitScore(b.aspectRatio, SLOT_ASPECT_RATIOS["landscape"]);

  portrait.sort(sortByPortraitFit);
  landscape.sort(sortByLandscapeFit);

  const plans: PagePlan[] = [];

  // Partition portrait pool
  const portraitSizes = partitionCount(portrait.length, PORTRAIT_SIZES);
  let pIdx = 0;
  for (const size of portraitSizes) {
    const pageImages = portrait.slice(pIdx, pIdx + size);
    plans.push({ size, orientation: "portrait", images: pageImages });
    pIdx += size;
  }

  // Partition landscape pool
  const landscapeSizes = partitionCount(landscape.length, LANDSCAPE_SIZES);
  let lIdx = 0;
  for (const size of landscapeSizes) {
    const pageImages = landscape.slice(lIdx, lIdx + size);
    plans.push({ size, orientation: "landscape", images: pageImages });
    lIdx += size;
  }

  // Sort plans: largest pages first for a visually impactful slideshow start
  plans.sort((a, b) => b.size - a.size);

  return plans;
}

// ─── Page Creation ───────────────────────────────────────────────────────────

const generateId = () =>
  `page-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

/**
 * Determine orientation for a page.
 * Fixed-orientation templates override; flexible templates (1, 2) use the
 * plan's orientation which was chosen by aspect-ratio classification.
 */
function resolveOrientation(
  pageSize: ValidCount,
  planned: "portrait" | "landscape",
): "portrait" | "landscape" {
  const fixed = FIXED_ORIENTATION[pageSize];
  return fixed ?? planned;
}

/**
 * Create an AlbumPage with images assigned to template slots.
 * Images are sorted by fit score so the best-matching image goes into
 * each slot in order (first slot is usually the most prominent).
 */
function createPageWithImages(
  plan: PagePlan,
  defaults: PageDefaults,
): AlbumPage {
  const orientation = resolveOrientation(plan.size, plan.orientation);

  const template = getTemplateByCount(
    plan.size,
    orientation,
    defaults.frameWidth,
    defaults.frameColor,
    defaults.matWidth,
    defaults.matColor,
  );

  // Sort images by how well they fit this template's slot aspect ratio
  const targetAR = SLOT_ASPECT_RATIOS[orientation];
  const sortedImages = [...plan.images].sort(
    (a, b) =>
      fitScore(a.aspectRatio, targetAR) - fitScore(b.aspectRatio, targetAR),
  );

  const slots: TemplateSlot[] = createInitialSlots(template).map(
    (slot, idx) => ({
      ...slot,
      imageId:
        idx < sortedImages.length ? sortedImages[idx].dataUrl : undefined,
      position: idx < sortedImages.length ? { x: 0, y: 0, zoom: 1 } : undefined,
    }),
  );

  return {
    id: generateId(),
    templateId: template.id,
    photoCount: plan.size,
    orientation,
    slots,
    frameWidth: defaults.frameWidth,
    frameColor: defaults.frameColor,
    matWidth: defaults.matWidth,
    matColor: defaults.matColor,
    backgroundColor: defaults.backgroundColor,
  };
}

/** Default styling for generated pages */
export interface PageDefaults {
  frameWidth: number;
  frameColor: string;
  matWidth: number;
  matColor: string;
  backgroundColor: string;
}

const DEFAULT_PAGE_DEFAULTS: PageDefaults = {
  frameWidth: 0,
  frameColor: "#1a1a1a",
  matWidth: 0,
  matColor: "#FFFFFF",
  backgroundColor: "#000000",
};

// ─── Main Entry Point ────────────────────────────────────────────────────────

/**
 * Auto-assign a set of images to optimally-sized layout pages.
 *
 * @param files      - Raw File objects from the user's file picker
 * @param defaults   - Optional page styling defaults
 * @param onProgress - Optional progress callback
 * @returns Pages with images distributed and assigned to slots
 */
export async function autoAssignLayouts(
  files: File[],
  defaults: PageDefaults = DEFAULT_PAGE_DEFAULTS,
  onProgress?: ProgressCallback,
): Promise<AutoLayoutResult> {
  if (files.length === 0) {
    return { pages: [], imageCount: 0, pageCount: 0, analyzedImages: [] };
  }

  // 1. Analyze all images (aspect ratio detection + HEIC conversion + optimization)
  const analyzed = await analyzeImages(files, onProgress);

  // 2. Plan pages based on aspect-ratio classification
  const plans = planPages(analyzed);

  onProgress?.(0, plans.length, "assigning");

  // 3. Create pages from plans
  const pages = plans.map((plan, idx) => {
    const page = createPageWithImages(plan, defaults);
    onProgress?.(idx + 1, plans.length, "assigning");
    return page;
  });

  return {
    pages,
    imageCount: analyzed.length,
    pageCount: pages.length,
    analyzedImages: analyzed,
  };
}
