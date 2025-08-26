// Quick test of the refactored layout scoring system
import { calculateLayoutScore } from "../src/utils/imageAnalysis";

// Test with sample image data
const sampleImages = [
  {
    url: "test1.jpg",
    dimensions: {
      width: 400,
      height: 600,
      aspectRatio: 0.67,
      orientation: "portrait",
      visualWeight: 0.7,
      aestheticScore: 0.8,
    },
  },
  {
    url: "test2.jpg",
    dimensions: {
      width: 400,
      height: 600,
      aspectRatio: 0.67,
      orientation: "portrait",
      visualWeight: 0.6,
      aestheticScore: 0.75,
    },
  },
  {
    url: "test3.jpg",
    dimensions: {
      width: 400,
      height: 600,
      aspectRatio: 0.67,
      orientation: "portrait",
      visualWeight: 0.8,
      aestheticScore: 0.85,
    },
  },
];

// Test portrait layout scoring
console.log("🧪 Testing refactored layout scoring system");
console.log("=".repeat(50));

const portraitResult = calculateLayoutScore(sampleImages, "3 Portraits");
console.log(`✅ 3 Portraits layout score: ${portraitResult.score}%`);
console.log(`   Reason: ${portraitResult.reason}`);
console.log(`   Confidence: ${portraitResult.confidence}`);

const slideshowResult = calculateLayoutScore(sampleImages, "Slideshow");
console.log(`✅ Slideshow layout score: ${slideshowResult.score}%`);
console.log(`   Reason: ${slideshowResult.reason}`);

const unknownResult = calculateLayoutScore(sampleImages, "Unknown Layout");
console.log(`✅ Unknown layout handling: ${unknownResult.score}%`);
console.log(`   Reason: ${unknownResult.reason}`);

console.log("\n🎉 Layout scoring refactoring test completed!");
