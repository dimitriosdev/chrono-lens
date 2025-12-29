/**
 * Frame and Mat Texture System Types
 * Comprehensive type definitions for realistic frame and mat textures
 * with advanced customization features
 */

// Base texture categories
export type TextureCategory =
  | "wood"
  | "metal"
  | "fabric"
  | "paper"
  | "specialty";

// Wood grain types with realistic variations
export type WoodType =
  | "oak"
  | "mahogany"
  | "pine"
  | "walnut"
  | "cherry"
  | "maple"
  | "bamboo"
  | "reclaimed"
  | "driftwood"
  | "ebony"
  | "birch";

// Metal finish types
export type MetalFinish =
  | "brushed-aluminum"
  | "gold-leaf"
  | "silver-leaf"
  | "copper"
  | "brass"
  | "pewter"
  | "chrome"
  | "antique-bronze"
  | "oxidized-copper"
  | "matte-black"
  | "gun-metal";

// Fabric and textile types
export type FabricType =
  | "linen"
  | "canvas"
  | "silk"
  | "velvet"
  | "burlap"
  | "cotton"
  | "hemp"
  | "jute"
  | "tweed";

// Paper and cardboard types
export type PaperType =
  | "watercolor"
  | "heavyweight"
  | "museum-board"
  | "rag-paper"
  | "parchment"
  | "handmade"
  | "recycled"
  | "linen-paper";

// Corner joint types that affect frame appearance
export type CornerJointType =
  | "miter"
  | "butt"
  | "lap"
  | "dovetail"
  | "finger"
  | "mortise-tenon";

// Wear and aging effects
export type WearPattern =
  | "none"
  | "light-wear"
  | "moderate-wear"
  | "heavy-wear"
  | "vintage"
  | "antique"
  | "distressed"
  | "weathered";

// Aging effects for different materials
export type AgingEffect =
  | "none"
  | "faded"
  | "scratched"
  | "chipped"
  | "tarnished"
  | "oxidized"
  | "water-stained"
  | "sun-bleached"
  | "cracked";

// Mat thickness options
export type MatThickness =
  | "thin"
  | "standard"
  | "thick"
  | "extra-thick"
  | "gallery";

// Mat opening styles
export type MatOpeningStyle =
  | "single"
  | "double"
  | "triple"
  | "quad"
  | "custom-grid"
  | "asymmetric";

// Surface finish options
export type SurfaceFinish =
  | "matte"
  | "satin"
  | "semi-gloss"
  | "gloss"
  | "textured"
  | "rough";

// Base texture interface
export interface BaseTexture {
  id: string;
  name: string;
  category: TextureCategory;
  description: string;
  previewUrl?: string; // URL to texture preview image
  cssClass: string; // CSS class for applying texture
  surfaceFinish: SurfaceFinish;
  // Color properties for tinting
  baseColor: string;
  highlightColor?: string;
  shadowColor?: string;
}

// Wood-specific texture properties
export interface WoodTexture extends BaseTexture {
  category: "wood";
  woodType: WoodType;
  grainDirection: "horizontal" | "vertical" | "diagonal";
  grainIntensity: "subtle" | "moderate" | "prominent";
  knots: boolean;
  stainColor?: string;
}

// Metal-specific texture properties
export interface MetalTexture extends BaseTexture {
  category: "metal";
  metalType: MetalFinish;
  reflectivity: "low" | "medium" | "high";
  patina?: boolean;
  brushDirection?: "horizontal" | "vertical" | "circular";
}

// Fabric-specific texture properties
export interface FabricTexture extends BaseTexture {
  category: "fabric";
  fabricType: FabricType;
  weavePattern: "plain" | "twill" | "herringbone" | "basket";
  threadCount: "fine" | "medium" | "coarse";
  nap?: boolean; // Fabric pile direction
}

// Paper-specific texture properties
export interface PaperTexture extends BaseTexture {
  category: "paper";
  paperType: PaperType;
  tooth: "smooth" | "fine" | "medium" | "rough";
  deckleEdge?: boolean;
  watermark?: boolean;
}

// Specialty textures (leather, stone, etc.)
export interface SpecialtyTexture extends BaseTexture {
  category: "specialty";
  specialtyType: string;
  properties: Record<string, string | number | boolean>;
}

// Union type for all texture types
export type FrameTexture =
  | WoodTexture
  | MetalTexture
  | FabricTexture
  | PaperTexture
  | SpecialtyTexture;

// Frame configuration with advanced features
export interface FrameConfig {
  // Basic frame properties
  texture: FrameTexture;
  width: number; // Frame width in pixels/percentage
  depth: number; // Visual depth effect

  // Corner joint styling
  cornerJoint: CornerJointType;
  cornerRadius?: number; // For rounded corners

  // Wear and aging
  wearPattern: WearPattern;
  agingEffects: AgingEffect[];
  wearIntensity: number; // 0-100 scale

  // Shadow and lighting
  shadowIntensity: number; // 0-100 scale
  lightDirection:
    | "top-left"
    | "top"
    | "top-right"
    | "right"
    | "bottom-right"
    | "bottom"
    | "bottom-left"
    | "left";

  // Color adjustments
  saturation: number; // 0-200 scale, 100 = normal
  brightness: number; // 0-200 scale, 100 = normal
  contrast: number; // 0-200 scale, 100 = normal
}

// Mat configuration with multi-opening support
export interface MatConfig {
  // Basic mat properties
  texture: FrameTexture;
  thickness: MatThickness;
  color: string;
  bevelAngle: number; // Degrees for mat bevel

  // Opening configuration
  openingStyle: MatOpeningStyle;
  openings: MatOpening[];

  // Advanced features
  doubleMatLayer?: boolean; // Second mat layer
  secondMatColor?: string;
  secondMatThickness?: MatThickness;

  // Texture-specific properties
  surfaceTexture: "smooth" | "textured" | "embossed";
  edgeFinish: "straight" | "beveled" | "rounded";
}

// Individual mat opening definition
export interface MatOpening {
  id: string;
  x: number; // Position as percentage
  y: number; // Position as percentage
  width: number; // Size as percentage
  height: number; // Size as percentage
  shape: "rectangle" | "oval" | "circle" | "custom";
  bevelWidth: number; // Individual bevel width
  imageId?: string; // Associated image
}

// Complete frame assembly configuration
export interface FrameAssembly {
  id: string;
  name: string;
  description?: string;

  // Frame and mat components
  frame: FrameConfig;
  mat?: MatConfig;
  glass?: GlassConfig;
  backing?: BackingConfig;

  // Overall styling
  style: FrameStyle;
  era?: FrameEra;

  // Metadata
  tags: string[];
  popularity: number;
  isCustom: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Glass/glazing options
export interface GlassConfig {
  type: "clear" | "non-reflective" | "uv-protective" | "museum" | "acrylic";
  reflection: number; // 0-100 scale
  tint?: string;
  thickness: "thin" | "standard" | "thick";
}

// Backing options
export interface BackingConfig {
  type: "cardboard" | "foam-core" | "mdf" | "hardboard";
  color: string;
  texture: "smooth" | "textured";
}

// Style classifications
export type FrameStyle =
  | "modern"
  | "traditional"
  | "rustic"
  | "industrial"
  | "minimalist"
  | "ornate"
  | "contemporary"
  | "vintage"
  | "bohemian"
  | "scandinavian";

// Historical era classifications
export type FrameEra =
  | "medieval"
  | "renaissance"
  | "baroque"
  | "victorian"
  | "art-nouveau"
  | "art-deco"
  | "mid-century"
  | "contemporary"
  | "modern";

// Preset configurations
export interface FramePreset {
  id: string;
  name: string;
  description: string;
  category: "beginner" | "intermediate" | "professional" | "artistic";
  assembly: FrameAssembly;
  thumbnailUrl?: string;
  popularity: number;
  tags: string[];
}

// Texture library organization
export interface TextureLibrary {
  wood: WoodTexture[];
  metal: MetalTexture[];
  fabric: FabricTexture[];
  paper: PaperTexture[];
  specialty: SpecialtyTexture[];
}

// User customization state
export interface UserFrameCustomization {
  userId: string;
  savedPresets: FramePreset[];
  recentlyUsed: FrameAssembly[];
  favorites: string[]; // Assembly IDs
  customTextures: FrameTexture[]; // User-uploaded textures
}

// Validation interfaces
export interface TextureValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface FrameConfigValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  performance: "excellent" | "good" | "fair" | "poor";
}

// Export utility types
export type TextureId = string;
export type FrameAssemblyId = string;
export type MatOpeningId = string;

// Conditional types for texture-specific operations
export type TextureByCategory<T extends TextureCategory> = T extends "wood"
  ? WoodTexture
  : T extends "metal"
  ? MetalTexture
  : T extends "fabric"
  ? FabricTexture
  : T extends "paper"
  ? PaperTexture
  : T extends "specialty"
  ? SpecialtyTexture
  : never;

// Helper types for component props
export type TexturePickerProps<T extends TextureCategory> = {
  category: T;
  selectedTexture?: TextureByCategory<T>;
  onTextureSelect: (texture: TextureByCategory<T>) => void;
  showAdvanced?: boolean;
};

export type FrameCustomizationProps = {
  assembly: FrameAssembly;
  onAssemblyChange: (assembly: FrameAssembly) => void;
  readonly?: boolean;
  showPreview?: boolean;
};
