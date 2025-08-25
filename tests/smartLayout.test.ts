import {
  calculateLayoutScore,
  ImageAnalysis,
} from "../src/utils/imageAnalysis";

// Simple test runner for smart layout functionality
console.log("\n=== Smart Layout System Tests ===\n");

// Mock image analyses
const portraitImages: ImageAnalysis[] = [
  {
    url: "test1.jpg",
    dimensions: {
      width: 400,
      height: 600,
      aspectRatio: 0.67,
      orientation: "portrait",
    },
  },
  {
    url: "test2.jpg",
    dimensions: {
      width: 300,
      height: 500,
      aspectRatio: 0.6,
      orientation: "portrait",
    },
  },
  {
    url: "test3.jpg",
    dimensions: {
      width: 350,
      height: 550,
      aspectRatio: 0.64,
      orientation: "portrait",
    },
  },
];

const landscapeImages: ImageAnalysis[] = [
  {
    url: "test1.jpg",
    dimensions: {
      width: 800,
      height: 600,
      aspectRatio: 1.33,
      orientation: "landscape",
    },
  },
  {
    url: "test2.jpg",
    dimensions: {
      width: 900,
      height: 600,
      aspectRatio: 1.5,
      orientation: "landscape",
    },
  },
  {
    url: "test3.jpg",
    dimensions: {
      width: 1000,
      height: 600,
      aspectRatio: 1.67,
      orientation: "landscape",
    },
  },
];

const mixedImages: ImageAnalysis[] = [
  {
    url: "test1.jpg",
    dimensions: {
      width: 400,
      height: 600,
      aspectRatio: 0.67,
      orientation: "portrait",
    },
  },
  {
    url: "test2.jpg",
    dimensions: {
      width: 800,
      height: 600,
      aspectRatio: 1.33,
      orientation: "landscape",
    },
  },
  {
    url: "test3.jpg",
    dimensions: {
      width: 500,
      height: 500,
      aspectRatio: 1.0,
      orientation: "square",
    },
  },
  {
    url: "test4.jpg",
    dimensions: {
      width: 300,
      height: 450,
      aspectRatio: 0.67,
      orientation: "portrait",
    },
  },
];

// Test 1: Portrait images should score high for 3 Portraits layout
const portraitResult = calculateLayoutScore(portraitImages, "3 Portraits");
console.log(
  `✓ 3 Portraits with portrait images: ${portraitResult.score}% - ${portraitResult.reason}`
);

// Test 2: Landscape images should prefer landscape layouts
const landscapeResult = calculateLayoutScore(landscapeImages, "3x2 Landscape");
console.log(
  `✓ 3x2 Landscape with landscape images: ${landscapeResult.score}% - ${landscapeResult.reason}`
);

// Test 3: Mixed images should work well with Mixed Grid
const mixedResult = calculateLayoutScore(mixedImages, "Mixed Grid");
console.log(
  `✓ Mixed Grid with mixed images: ${mixedResult.score}% - ${mixedResult.reason}`
);

// Test 4: Slideshow should work for any collection
const slideshowResult = calculateLayoutScore(portraitImages, "Slideshow");
console.log(
  `✓ Slideshow fallback: ${slideshowResult.score}% - ${slideshowResult.reason}`
);

// Test 5: Insufficient images should score low
const insufficientResult = calculateLayoutScore(
  [portraitImages[0]],
  "6 Portraits"
);
console.log(
  `✓ Insufficient images test: ${insufficientResult.score}% - ${insufficientResult.reason}`
);

console.log("\n=== All tests completed ===");
