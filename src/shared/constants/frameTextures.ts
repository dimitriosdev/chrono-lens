/**
 * Frame and Mat Texture Constants
 * Predefined realistic textures and configurations for the digital frame system
 */

import {
  WoodTexture,
  MetalTexture,
  FabricTexture,
  PaperTexture,
  SpecialtyTexture,
  FramePreset,
  TextureLibrary,
  CornerJointType,
  WearPattern,
  AgingEffect,
  MatThickness,
} from "../types/frameTextures";

// =============================================================================
// WOOD TEXTURES
// =============================================================================

export const WOOD_TEXTURES: WoodTexture[] = [
  {
    id: "oak-natural",
    name: "Natural Oak",
    category: "wood",
    description:
      "Classic oak with prominent grain and natural color variations",
    cssClass: "texture-oak-natural",
    surfaceFinish: "satin",
    baseColor: "#D2B48C",
    highlightColor: "#E6D3A3",
    shadowColor: "#A0855B",
    woodType: "oak",
    grainDirection: "horizontal",
    grainIntensity: "prominent",
    knots: true,
    stainColor: "#C8A882",
  },
  {
    id: "mahogany-rich",
    name: "Rich Mahogany",
    category: "wood",
    description: "Deep reddish-brown mahogany with elegant grain pattern",
    cssClass: "texture-mahogany-rich",
    surfaceFinish: "semi-gloss",
    baseColor: "#8B4513",
    highlightColor: "#A0522D",
    shadowColor: "#654321",
    woodType: "mahogany",
    grainDirection: "horizontal",
    grainIntensity: "moderate",
    knots: false,
    stainColor: "#7A3F10",
  },
  {
    id: "pine-distressed",
    name: "Distressed Pine",
    category: "wood",
    description: "Rustic pine with weathered appearance and visible knots",
    cssClass: "texture-pine-distressed",
    surfaceFinish: "matte",
    baseColor: "#F5DEB3",
    highlightColor: "#FAEBD7",
    shadowColor: "#D2B48C",
    woodType: "pine",
    grainDirection: "vertical",
    grainIntensity: "subtle",
    knots: true,
    stainColor: "#E6D3A3",
  },
  {
    id: "walnut-dark",
    name: "Dark Walnut",
    category: "wood",
    description: "Rich dark walnut with beautiful chocolate tones",
    cssClass: "texture-walnut-dark",
    surfaceFinish: "gloss",
    baseColor: "#3C2415",
    highlightColor: "#4A2C17",
    shadowColor: "#2B1A0F",
    woodType: "walnut",
    grainDirection: "horizontal",
    grainIntensity: "prominent",
    knots: false,
    stainColor: "#2F1F13",
  },
  {
    id: "reclaimed-barn",
    name: "Reclaimed Barn Wood",
    category: "wood",
    description: "Weathered barn wood with character marks and patina",
    cssClass: "texture-reclaimed-barn",
    surfaceFinish: "rough",
    baseColor: "#8B7D6B",
    highlightColor: "#A69687",
    shadowColor: "#6B5B47",
    woodType: "reclaimed",
    grainDirection: "vertical",
    grainIntensity: "prominent",
    knots: true,
    stainColor: "#7A6B57",
  },
];

// =============================================================================
// METAL TEXTURES
// =============================================================================

export const METAL_TEXTURES: MetalTexture[] = [
  {
    id: "brushed-aluminum",
    name: "Brushed Aluminum",
    category: "metal",
    description: "Modern brushed aluminum with subtle linear patterns",
    cssClass: "texture-brushed-aluminum",
    surfaceFinish: "satin",
    baseColor: "#C0C0C0",
    highlightColor: "#E6E6E6",
    shadowColor: "#999999",
    metalType: "brushed-aluminum",
    reflectivity: "medium",
    brushDirection: "horizontal",
    patina: false,
  },
  {
    id: "gold-leaf-ornate",
    name: "Ornate Gold Leaf",
    category: "metal",
    description: "Luxurious gold leaf finish with rich warm tones",
    cssClass: "texture-gold-leaf",
    surfaceFinish: "gloss",
    baseColor: "#FFD700",
    highlightColor: "#FFFF99",
    shadowColor: "#B8860B",
    metalType: "gold-leaf",
    reflectivity: "high",
    patina: false,
  },
  {
    id: "antique-bronze",
    name: "Antique Bronze",
    category: "metal",
    description: "Aged bronze with natural patina and weathering",
    cssClass: "texture-antique-bronze",
    surfaceFinish: "matte",
    baseColor: "#CD7F32",
    highlightColor: "#D2B48C",
    shadowColor: "#8B4513",
    metalType: "antique-bronze",
    reflectivity: "low",
    patina: true,
  },
  {
    id: "pewter-hammered",
    name: "Hammered Pewter",
    category: "metal",
    description: "Hand-hammered pewter with textured surface",
    cssClass: "texture-pewter-hammered",
    surfaceFinish: "textured",
    baseColor: "#96A0A0",
    highlightColor: "#B8C0C0",
    shadowColor: "#708090",
    metalType: "pewter",
    reflectivity: "low",
    patina: false,
  },
  {
    id: "oxidized-copper",
    name: "Oxidized Copper",
    category: "metal",
    description: "Copper with natural green patina oxidation",
    cssClass: "texture-oxidized-copper",
    surfaceFinish: "matte",
    baseColor: "#B87333",
    highlightColor: "#CD853F",
    shadowColor: "#8B4513",
    metalType: "oxidized-copper",
    reflectivity: "low",
    patina: true,
  },
];

// =============================================================================
// FABRIC TEXTURES
// =============================================================================

export const FABRIC_TEXTURES: FabricTexture[] = [
  {
    id: "linen-natural",
    name: "Natural Linen",
    category: "fabric",
    description: "Classic natural linen with subtle weave texture",
    cssClass: "texture-linen-natural",
    surfaceFinish: "matte",
    baseColor: "#FAF0E6",
    highlightColor: "#FFFAF0",
    shadowColor: "#F5DEB3",
    fabricType: "linen",
    weavePattern: "plain",
    threadCount: "medium",
    nap: false,
  },
  {
    id: "canvas-heavyweight",
    name: "Heavyweight Canvas",
    category: "fabric",
    description: "Durable canvas with pronounced texture",
    cssClass: "texture-canvas-heavy",
    surfaceFinish: "textured",
    baseColor: "#F5F5DC",
    highlightColor: "#FFFAF0",
    shadowColor: "#DDD8C7",
    fabricType: "canvas",
    weavePattern: "plain",
    threadCount: "coarse",
    nap: false,
  },
  {
    id: "silk-dupioni",
    name: "Dupioni Silk",
    category: "fabric",
    description: "Luxurious silk with subtle sheen and slubs",
    cssClass: "texture-silk-dupioni",
    surfaceFinish: "satin",
    baseColor: "#F8F8FF",
    highlightColor: "#FFFFFF",
    shadowColor: "#E6E6FA",
    fabricType: "silk",
    weavePattern: "plain",
    threadCount: "fine",
    nap: false,
  },
  {
    id: "velvet-deep",
    name: "Deep Velvet",
    category: "fabric",
    description: "Rich velvet with directional pile and depth",
    cssClass: "texture-velvet-deep",
    surfaceFinish: "matte",
    baseColor: "#2F4F4F",
    highlightColor: "#696969",
    shadowColor: "#1C1C1C",
    fabricType: "velvet",
    weavePattern: "plain",
    threadCount: "fine",
    nap: true,
  },
  {
    id: "burlap-rustic",
    name: "Rustic Burlap",
    category: "fabric",
    description: "Coarse burlap with visible jute fibers",
    cssClass: "texture-burlap-rustic",
    surfaceFinish: "rough",
    baseColor: "#DEB887",
    highlightColor: "#F5DEB3",
    shadowColor: "#CD853F",
    fabricType: "burlap",
    weavePattern: "plain",
    threadCount: "coarse",
    nap: false,
  },
];

// =============================================================================
// PAPER TEXTURES
// =============================================================================

export const PAPER_TEXTURES: PaperTexture[] = [
  {
    id: "watercolor-cold-press",
    name: "Cold Press Watercolor",
    category: "paper",
    description: "Professional watercolor paper with medium texture",
    cssClass: "texture-watercolor-cold",
    surfaceFinish: "textured",
    baseColor: "#FFFEF7",
    highlightColor: "#FFFFFF",
    shadowColor: "#F8F6F0",
    paperType: "watercolor",
    tooth: "medium",
    deckleEdge: true,
    watermark: false,
  },
  {
    id: "museum-board",
    name: "Museum Board",
    category: "paper",
    description: "Acid-free museum quality matboard",
    cssClass: "texture-museum-board",
    surfaceFinish: "matte",
    baseColor: "#F8F8F8",
    highlightColor: "#FFFFFF",
    shadowColor: "#F0F0F0",
    paperType: "museum-board",
    tooth: "smooth",
    deckleEdge: false,
    watermark: true,
  },
  {
    id: "handmade-rag",
    name: "Handmade Rag Paper",
    category: "paper",
    description: "Artisan handmade paper with visible fibers",
    cssClass: "texture-handmade-rag",
    surfaceFinish: "textured",
    baseColor: "#FFF8DC",
    highlightColor: "#FFFEF7",
    shadowColor: "#F5F5DC",
    paperType: "handmade",
    tooth: "rough",
    deckleEdge: true,
    watermark: false,
  },
  {
    id: "parchment-aged",
    name: "Aged Parchment",
    category: "paper",
    description: "Vintage-style parchment with aging effects",
    cssClass: "texture-parchment-aged",
    surfaceFinish: "matte",
    baseColor: "#F5E6D3",
    highlightColor: "#FAF0E6",
    shadowColor: "#E6D3A3",
    paperType: "parchment",
    tooth: "fine",
    deckleEdge: false,
    watermark: false,
  },
];

// =============================================================================
// SPECIALTY TEXTURES
// =============================================================================

export const SPECIALTY_TEXTURES: SpecialtyTexture[] = [
  {
    id: "leather-tooled",
    name: "Tooled Leather",
    category: "specialty",
    description: "Hand-tooled leather with embossed patterns",
    cssClass: "texture-leather-tooled",
    surfaceFinish: "textured",
    baseColor: "#8B4513",
    highlightColor: "#A0522D",
    shadowColor: "#654321",
    specialtyType: "leather",
    properties: {
      embossed: true,
      patternType: "floral",
      thickness: "thick",
    },
  },
  {
    id: "stone-granite",
    name: "Polished Granite",
    category: "specialty",
    description: "Natural granite with speckled pattern",
    cssClass: "texture-granite-polished",
    surfaceFinish: "gloss",
    baseColor: "#696969",
    highlightColor: "#A9A9A9",
    shadowColor: "#2F4F4F",
    specialtyType: "stone",
    properties: {
      speckled: true,
      hardness: "very-hard",
      pattern: "natural",
    },
  },
  {
    id: "glass-frosted",
    name: "Frosted Glass",
    category: "specialty",
    description: "Translucent frosted glass effect",
    cssClass: "texture-glass-frosted",
    surfaceFinish: "matte",
    baseColor: "#F0F8FF",
    highlightColor: "#FFFFFF",
    shadowColor: "#E6E6FA",
    specialtyType: "glass",
    properties: {
      opacity: 0.8,
      translucent: true,
      frostLevel: "medium",
    },
  },
];

// =============================================================================
// TEXTURE LIBRARY
// =============================================================================

export const TEXTURE_LIBRARY: TextureLibrary = {
  wood: WOOD_TEXTURES,
  metal: METAL_TEXTURES,
  fabric: FABRIC_TEXTURES,
  paper: PAPER_TEXTURES,
  specialty: SPECIALTY_TEXTURES,
};

// =============================================================================
// CORNER JOINT TYPES
// =============================================================================

export const CORNER_JOINT_TYPES: {
  type: CornerJointType;
  name: string;
  description: string;
}[] = [
  {
    type: "miter",
    name: "Miter Joint",
    description: "Classic 45-degree angled corners for professional appearance",
  },
  {
    type: "butt",
    name: "Butt Joint",
    description: "Simple straight-cut corners for modern minimalist look",
  },
  {
    type: "lap",
    name: "Lap Joint",
    description: "Overlapping corners for rustic and handcrafted appearance",
  },
  {
    type: "dovetail",
    name: "Dovetail Joint",
    description: "Traditional interlocking corners for premium craftsmanship",
  },
  {
    type: "finger",
    name: "Finger Joint",
    description: "Multiple interlocking fingers for distinctive geometric look",
  },
  {
    type: "mortise-tenon",
    name: "Mortise & Tenon",
    description: "Traditional woodworking joint for maximum strength",
  },
];

// =============================================================================
// WEAR PATTERNS
// =============================================================================

export const WEAR_PATTERNS: {
  pattern: WearPattern;
  name: string;
  description: string;
}[] = [
  {
    pattern: "none",
    name: "Pristine",
    description: "Perfect condition with no wear or aging",
  },
  {
    pattern: "light-wear",
    name: "Light Wear",
    description: "Minimal signs of use with subtle handling marks",
  },
  {
    pattern: "moderate-wear",
    name: "Moderate Wear",
    description: "Noticeable wear patterns from regular use",
  },
  {
    pattern: "heavy-wear",
    name: "Heavy Wear",
    description: "Significant wear with visible damage and patina",
  },
  {
    pattern: "vintage",
    name: "Vintage Character",
    description: "Charming aged appearance with character marks",
  },
  {
    pattern: "antique",
    name: "Antique Patina",
    description: "Deep aging with rich patina and time-worn beauty",
  },
  {
    pattern: "distressed",
    name: "Intentionally Distressed",
    description: "Deliberately aged for rustic aesthetic",
  },
  {
    pattern: "weathered",
    name: "Weather Worn",
    description: "Natural weathering from environmental exposure",
  },
];

// =============================================================================
// AGING EFFECTS
// =============================================================================

export const AGING_EFFECTS: {
  effect: AgingEffect;
  name: string;
  description: string;
}[] = [
  {
    effect: "none",
    name: "No Aging",
    description: "Fresh, new appearance",
  },
  {
    effect: "faded",
    name: "Sun Faded",
    description: "Colors lightened by sun exposure",
  },
  {
    effect: "scratched",
    name: "Surface Scratches",
    description: "Fine scratches from handling",
  },
  {
    effect: "chipped",
    name: "Edge Chipping",
    description: "Small chips along edges and corners",
  },
  {
    effect: "tarnished",
    name: "Metal Tarnishing",
    description: "Natural oxidation on metal surfaces",
  },
  {
    effect: "oxidized",
    name: "Oxidation Patterns",
    description: "Chemical aging with color changes",
  },
  {
    effect: "water-stained",
    name: "Water Staining",
    description: "Subtle water marks and stains",
  },
  {
    effect: "sun-bleached",
    name: "Sun Bleaching",
    description: "Uneven fading from light exposure",
  },
  {
    effect: "cracked",
    name: "Age Cracking",
    description: "Fine cracks from material aging",
  },
];

// =============================================================================
// MAT THICKNESS OPTIONS
// =============================================================================

export const MAT_THICKNESS_OPTIONS: {
  thickness: MatThickness;
  name: string;
  description: string;
  pixels: number;
}[] = [
  {
    thickness: "thin",
    name: "Thin Mat",
    description: "Minimal border for modern look",
    pixels: 20,
  },
  {
    thickness: "standard",
    name: "Standard Mat",
    description: "Traditional proportioned matting",
    pixels: 40,
  },
  {
    thickness: "thick",
    name: "Thick Mat",
    description: "Generous border for formal presentation",
    pixels: 60,
  },
  {
    thickness: "extra-thick",
    name: "Extra Thick Mat",
    description: "Wide border for dramatic effect",
    pixels: 80,
  },
  {
    thickness: "gallery",
    name: "Gallery Style",
    description: "Museum-quality wide matting",
    pixels: 100,
  },
];

// =============================================================================
// FRAME PRESETS
// =============================================================================

export const FRAME_PRESETS: FramePreset[] = [
  {
    id: "classic-oak",
    name: "Classic Oak",
    description: "Traditional oak frame with museum board mat",
    category: "beginner",
    popularity: 95,
    tags: ["traditional", "wood", "natural"],
    assembly: {
      id: "classic-oak-assembly",
      name: "Classic Oak Assembly",
      frame: {
        texture: WOOD_TEXTURES[0], // Natural Oak
        width: 30,
        depth: 15,
        cornerJoint: "miter",
        wearPattern: "none",
        agingEffects: [],
        wearIntensity: 0,
        shadowIntensity: 70,
        lightDirection: "top-left",
        saturation: 100,
        brightness: 100,
        contrast: 100,
      },
      mat: {
        texture: PAPER_TEXTURES[1], // Museum Board
        thickness: "standard",
        color: "#F8F8F8",
        bevelAngle: 45,
        openingStyle: "single",
        openings: [
          {
            id: "main-opening",
            x: 50,
            y: 50,
            width: 70,
            height: 70,
            shape: "rectangle",
            bevelWidth: 3,
          },
        ],
        surfaceTexture: "smooth",
        edgeFinish: "beveled",
      },
      style: "traditional",
      era: "contemporary",
      tags: ["classic", "beginner-friendly"],
      popularity: 95,
      isCustom: false,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
    },
  },
  {
    id: "modern-metal",
    name: "Modern Metal",
    description: "Sleek brushed aluminum with minimal matting",
    category: "intermediate",
    popularity: 85,
    tags: ["modern", "metal", "minimalist"],
    assembly: {
      id: "modern-metal-assembly",
      name: "Modern Metal Assembly",
      frame: {
        texture: METAL_TEXTURES[0], // Brushed Aluminum
        width: 15,
        depth: 8,
        cornerJoint: "miter",
        wearPattern: "none",
        agingEffects: [],
        wearIntensity: 0,
        shadowIntensity: 40,
        lightDirection: "top",
        saturation: 100,
        brightness: 110,
        contrast: 105,
      },
      mat: {
        texture: PAPER_TEXTURES[1], // Museum Board
        thickness: "thin",
        color: "#FFFFFF",
        bevelAngle: 30,
        openingStyle: "single",
        openings: [
          {
            id: "main-opening",
            x: 50,
            y: 50,
            width: 80,
            height: 80,
            shape: "rectangle",
            bevelWidth: 2,
          },
        ],
        surfaceTexture: "smooth",
        edgeFinish: "straight",
      },
      style: "modern",
      era: "contemporary",
      tags: ["sleek", "contemporary"],
      popularity: 85,
      isCustom: false,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
    },
  },
  {
    id: "vintage-ornate",
    name: "Vintage Ornate",
    description: "Elaborate gold leaf frame with aged character",
    category: "professional",
    popularity: 75,
    tags: ["vintage", "ornate", "gold", "luxury"],
    assembly: {
      id: "vintage-ornate-assembly",
      name: "Vintage Ornate Assembly",
      frame: {
        texture: METAL_TEXTURES[1], // Gold Leaf
        width: 50,
        depth: 25,
        cornerJoint: "miter",
        wearPattern: "vintage",
        agingEffects: ["faded", "tarnished"],
        wearIntensity: 30,
        shadowIntensity: 80,
        lightDirection: "top-left",
        saturation: 95,
        brightness: 95,
        contrast: 105,
      },
      mat: {
        texture: FABRIC_TEXTURES[2], // Silk
        thickness: "thick",
        color: "#F8F8FF",
        bevelAngle: 45,
        openingStyle: "single",
        openings: [
          {
            id: "main-opening",
            x: 50,
            y: 50,
            width: 60,
            height: 60,
            shape: "rectangle",
            bevelWidth: 4,
          },
        ],
        doubleMatLayer: true,
        secondMatColor: "#FFD700",
        secondMatThickness: "thin",
        surfaceTexture: "smooth",
        edgeFinish: "beveled",
      },
      style: "ornate",
      era: "victorian",
      tags: ["luxury", "classical"],
      popularity: 75,
      isCustom: false,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
    },
  },
  {
    id: "rustic-barn",
    name: "Rustic Barn Wood",
    description: "Weathered reclaimed wood with natural character",
    category: "intermediate",
    popularity: 80,
    tags: ["rustic", "reclaimed", "natural", "weathered"],
    assembly: {
      id: "rustic-barn-assembly",
      name: "Rustic Barn Assembly",
      frame: {
        texture: WOOD_TEXTURES[4], // Reclaimed Barn
        width: 40,
        depth: 20,
        cornerJoint: "lap",
        wearPattern: "weathered",
        agingEffects: ["water-stained", "scratched", "faded"],
        wearIntensity: 60,
        shadowIntensity: 85,
        lightDirection: "top-right",
        saturation: 90,
        brightness: 95,
        contrast: 110,
      },
      mat: {
        texture: FABRIC_TEXTURES[4], // Burlap
        thickness: "standard",
        color: "#DEB887",
        bevelAngle: 30,
        openingStyle: "single",
        openings: [
          {
            id: "main-opening",
            x: 50,
            y: 50,
            width: 75,
            height: 75,
            shape: "rectangle",
            bevelWidth: 2,
          },
        ],
        surfaceTexture: "textured",
        edgeFinish: "straight",
      },
      style: "rustic",
      era: "contemporary",
      tags: ["farmhouse", "country"],
      popularity: 80,
      isCustom: false,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
    },
  },
];

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

export const getTextureById = (id: string) => {
  const allTextures = [
    ...WOOD_TEXTURES,
    ...METAL_TEXTURES,
    ...FABRIC_TEXTURES,
    ...PAPER_TEXTURES,
    ...SPECIALTY_TEXTURES,
  ];
  return allTextures.find((texture) => texture.id === id);
};

export const getTexturesByCategory = (category: string) => {
  switch (category) {
    case "wood":
      return WOOD_TEXTURES;
    case "metal":
      return METAL_TEXTURES;
    case "fabric":
      return FABRIC_TEXTURES;
    case "paper":
      return PAPER_TEXTURES;
    case "specialty":
      return SPECIALTY_TEXTURES;
    default:
      return [];
  }
};

export const getPopularTextures = (limit: number = 6) => {
  const allTextures = [
    ...WOOD_TEXTURES,
    ...METAL_TEXTURES,
    ...FABRIC_TEXTURES,
    ...PAPER_TEXTURES,
    ...SPECIALTY_TEXTURES,
  ];
  // For now, return first items from each category
  return allTextures.slice(0, limit);
};

export const getPresetsByCategory = (category: string) => {
  return FRAME_PRESETS.filter((preset) => preset.category === category);
};

export const getPresetById = (id: string) => {
  return FRAME_PRESETS.find((preset) => preset.id === id);
};
