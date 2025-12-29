/**
 * Advanced Frame Texture Picker Component
 * Sophisticated UI for selecting frame textures, corner joints, and wear effects
 */

"use client";

import React, { useState, useCallback, useMemo } from "react";
import {
  FrameTexture,
  FrameConfig,
  MatConfig as AdvancedMatConfig,
  FrameAssembly,
  TextureCategory,
  CornerJointType,
  WearPattern,
  MatThickness,
} from "@/shared/types/frameTextures";
import {
  TEXTURE_LIBRARY,
  CORNER_JOINT_TYPES,
  WEAR_PATTERNS,
  AGING_EFFECTS,
  MAT_THICKNESS_OPTIONS,
  FRAME_PRESETS,
} from "@/shared/constants/frameTextures";

interface FrameTexturePickerProps {
  assembly: FrameAssembly;
  onAssemblyChange: (assembly: FrameAssembly) => void;
  readonly?: boolean;
  showPreview?: boolean;
  className?: string;
}

interface TextureCategoryTabProps {
  category: TextureCategory;
  isActive: boolean;
  onClick: () => void;
  count: number;
}

interface TexturePreviewProps {
  texture: FrameTexture;
  isSelected: boolean;
  onClick: () => void;
  size?: "small" | "medium" | "large";
}

interface AdvancedControlsProps {
  frameConfig: FrameConfig;
  matConfig?: AdvancedMatConfig;
  onFrameConfigChange: (config: FrameConfig) => void;
  onMatConfigChange: (config: AdvancedMatConfig) => void;
}

// Texture Category Tab Component
const TextureCategoryTab: React.FC<TextureCategoryTabProps> = ({
  category,
  isActive,
  onClick,
  count,
}) => {
  const categoryNames = {
    wood: "Wood",
    metal: "Metal",
    fabric: "Fabric",
    paper: "Paper",
    specialty: "Specialty",
  };

  const categoryIcons = {
    wood: "🌳",
    metal: "⚡",
    fabric: "🧵",
    paper: "📄",
    specialty: "✨",
  };

  return (
    <button
      onClick={onClick}
      className={`
        flex flex-col items-center justify-center p-3 rounded-lg transition-all duration-200
        ${
          isActive
            ? "bg-blue-500 text-white shadow-lg"
            : "bg-gray-100 hover:bg-gray-200 text-gray-700"
        }
      `}
    >
      <span className="text-2xl mb-1">{categoryIcons[category]}</span>
      <span className="text-sm font-medium">{categoryNames[category]}</span>
      <span className="text-xs opacity-75">({count})</span>
    </button>
  );
};

// Texture Preview Component
const TexturePreview: React.FC<TexturePreviewProps> = ({
  texture,
  isSelected,
  onClick,
  size = "medium",
}) => {
  const sizeClasses = {
    small: "w-16 h-16",
    medium: "w-20 h-20",
    large: "w-24 h-24",
  };

  return (
    <div className="flex flex-col items-center space-y-2">
      <button
        onClick={onClick}
        className={`
          ${sizeClasses[size]} ${
          texture.cssClass
        } rounded-lg border-2 transition-all duration-200
          ${
            isSelected
              ? "border-blue-500 ring-2 ring-blue-200 shadow-lg scale-105"
              : "border-gray-300 hover:border-gray-400 hover:shadow-md"
          }
          frame-realistic frame-depth-medium
        `}
        title={texture.description}
      />
      <div className="text-center">
        <p className="text-xs font-medium text-gray-900 truncate max-w-20">
          {texture.name}
        </p>
        <p className="text-xs text-gray-500 capitalize">
          {texture.surfaceFinish}
        </p>
      </div>
    </div>
  );
};

// Advanced Controls Component
const AdvancedControls: React.FC<AdvancedControlsProps> = ({
  frameConfig,
  matConfig,
  onFrameConfigChange,
  onMatConfigChange,
}) => {
  const handleFrameConfigChange = useCallback(
    (updates: Partial<FrameConfig>) => {
      onFrameConfigChange({ ...frameConfig, ...updates });
    },
    [frameConfig, onFrameConfigChange]
  );

  const handleMatConfigChange = useCallback(
    (updates: Partial<AdvancedMatConfig>) => {
      if (matConfig) {
        onMatConfigChange({ ...matConfig, ...updates });
      }
    },
    [matConfig, onMatConfigChange]
  );

  return (
    <div className="space-y-6">
      {/* Frame Controls */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-gray-900">Frame Settings</h4>

        {/* Frame Width */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Frame Width: {frameConfig.width}px
          </label>
          <input
            type="range"
            min="10"
            max="80"
            value={frameConfig.width}
            onChange={(e) =>
              handleFrameConfigChange({ width: parseInt(e.target.value) })
            }
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Frame Depth */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Frame Depth: {frameConfig.depth}px
          </label>
          <input
            type="range"
            min="5"
            max="40"
            value={frameConfig.depth}
            onChange={(e) =>
              handleFrameConfigChange({ depth: parseInt(e.target.value) })
            }
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Corner Joint Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Corner Joint
          </label>
          <select
            value={frameConfig.cornerJoint}
            onChange={(e) =>
              handleFrameConfigChange({
                cornerJoint: e.target.value as CornerJointType,
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {CORNER_JOINT_TYPES.map((joint) => (
              <option key={joint.type} value={joint.type}>
                {joint.name}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            {
              CORNER_JOINT_TYPES.find((j) => j.type === frameConfig.cornerJoint)
                ?.description
            }
          </p>
        </div>

        {/* Wear Pattern */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Wear Pattern
          </label>
          <select
            value={frameConfig.wearPattern}
            onChange={(e) =>
              handleFrameConfigChange({
                wearPattern: e.target.value as WearPattern,
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {WEAR_PATTERNS.map((pattern) => (
              <option key={pattern.pattern} value={pattern.pattern}>
                {pattern.name}
              </option>
            ))}
          </select>
        </div>

        {/* Wear Intensity */}
        {frameConfig.wearPattern !== "none" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Wear Intensity: {frameConfig.wearIntensity}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={frameConfig.wearIntensity}
              onChange={(e) =>
                handleFrameConfigChange({
                  wearIntensity: parseInt(e.target.value),
                })
              }
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        )}

        {/* Aging Effects */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Aging Effects
          </label>
          <div className="grid grid-cols-2 gap-2">
            {AGING_EFFECTS.filter((effect) => effect.effect !== "none").map(
              (effect) => (
                <label
                  key={effect.effect}
                  className="flex items-center space-x-2"
                >
                  <input
                    type="checkbox"
                    checked={frameConfig.agingEffects.includes(effect.effect)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        handleFrameConfigChange({
                          agingEffects: [
                            ...frameConfig.agingEffects,
                            effect.effect,
                          ],
                        });
                      } else {
                        handleFrameConfigChange({
                          agingEffects: frameConfig.agingEffects.filter(
                            (ae) => ae !== effect.effect
                          ),
                        });
                      }
                    }}
                    className="rounded border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{effect.name}</span>
                </label>
              )
            )}
          </div>
        </div>
      </div>

      {/* Mat Controls */}
      {matConfig && (
        <div className="space-y-4 border-t pt-6">
          <h4 className="text-lg font-semibold text-gray-900">Mat Settings</h4>

          {/* Mat Thickness */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mat Thickness
            </label>
            <select
              value={matConfig.thickness}
              onChange={(e) =>
                handleMatConfigChange({
                  thickness: e.target.value as MatThickness,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {MAT_THICKNESS_OPTIONS.map((option) => (
                <option key={option.thickness} value={option.thickness}>
                  {option.name} ({option.pixels}px)
                </option>
              ))}
            </select>
          </div>

          {/* Bevel Angle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bevel Angle: {matConfig.bevelAngle}°
            </label>
            <input
              type="range"
              min="0"
              max="60"
              value={matConfig.bevelAngle}
              onChange={(e) =>
                handleMatConfigChange({ bevelAngle: parseInt(e.target.value) })
              }
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Double Mat Layer */}
          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={matConfig.doubleMatLayer || false}
                onChange={(e) =>
                  handleMatConfigChange({ doubleMatLayer: e.target.checked })
                }
                className="rounded border-gray-300 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Double Mat Layer
              </span>
            </label>
          </div>

          {/* Second Mat Color */}
          {matConfig.doubleMatLayer && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Second Mat Color
              </label>
              <input
                type="color"
                value={matConfig.secondMatColor || "#ffffff"}
                onChange={(e) =>
                  handleMatConfigChange({ secondMatColor: e.target.value })
                }
                className="w-full h-10 border border-gray-300 rounded-md cursor-pointer"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Main Frame Texture Picker Component
export const FrameTexturePicker: React.FC<FrameTexturePickerProps> = ({
  assembly,
  onAssemblyChange,
  readonly = false,
  showPreview = true,
  className = "",
}) => {
  const [activeCategory, setActiveCategory] = useState<TextureCategory>("wood");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  const currentTextures = useMemo(() => {
    return TEXTURE_LIBRARY[activeCategory] || [];
  }, [activeCategory]);

  const handleTextureSelect = useCallback(
    (texture: FrameTexture) => {
      if (readonly) return;

      const updatedAssembly = {
        ...assembly,
        frame: {
          ...assembly.frame,
          texture,
        },
      };

      onAssemblyChange(updatedAssembly);
    },
    [assembly, onAssemblyChange, readonly]
  );

  const handleFrameConfigChange = useCallback(
    (frameConfig: FrameConfig) => {
      if (readonly) return;

      const updatedAssembly = {
        ...assembly,
        frame: frameConfig,
      };

      onAssemblyChange(updatedAssembly);
    },
    [assembly, onAssemblyChange, readonly]
  );

  const handleMatConfigChange = useCallback(
    (matConfig: AdvancedMatConfig) => {
      if (readonly) return;

      const updatedAssembly = {
        ...assembly,
        mat: matConfig,
      };

      onAssemblyChange(updatedAssembly);
    },
    [assembly, onAssemblyChange, readonly]
  );

  const handlePresetSelect = useCallback(
    (presetId: string) => {
      if (readonly) return;

      const preset = FRAME_PRESETS.find((p) => p.id === presetId);
      if (preset) {
        onAssemblyChange(preset.assembly);
        setSelectedPreset(presetId);
      }
    },
    [onAssemblyChange, readonly]
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Preset Quick Selection */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900">Quick Presets</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {FRAME_PRESETS.slice(0, 4).map((preset) => (
            <button
              key={preset.id}
              onClick={() => handlePresetSelect(preset.id)}
              disabled={readonly}
              className={`
                p-3 rounded-lg border-2 transition-all duration-200 text-left
                ${
                  selectedPreset === preset.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300 hover:border-gray-400 bg-white"
                }
                ${readonly ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
              `}
            >
              <p className="font-medium text-sm text-gray-900">{preset.name}</p>
              <p className="text-xs text-gray-600 mt-1">{preset.description}</p>
              <div className="flex flex-wrap gap-1 mt-2">
                {preset.tags.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Category Tabs */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900">Frame Textures</h3>
        <div className="grid grid-cols-5 gap-2">
          {Object.entries(TEXTURE_LIBRARY).map(([category, textures]) => (
            <TextureCategoryTab
              key={category}
              category={category as TextureCategory}
              isActive={activeCategory === category}
              onClick={() => setActiveCategory(category as TextureCategory)}
              count={textures.length}
            />
          ))}
        </div>
      </div>

      {/* Texture Grid */}
      <div className="space-y-3">
        <h4 className="text-md font-medium text-gray-800">
          {activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)}{" "}
          Textures
        </h4>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
          {currentTextures.map((texture) => (
            <TexturePreview
              key={texture.id}
              texture={texture}
              isSelected={assembly.frame.texture.id === texture.id}
              onClick={() => handleTextureSelect(texture)}
            />
          ))}
        </div>
      </div>

      {/* Advanced Controls Toggle */}
      <div className="border-t pt-6">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          disabled={readonly}
          className={`
            flex items-center justify-between w-full p-3 bg-gray-50 rounded-lg transition-all duration-200
            ${
              readonly
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-gray-100 cursor-pointer"
            }
          `}
        >
          <span className="text-lg font-semibold text-gray-900">
            Advanced Customization
          </span>
          <span
            className={`transform transition-transform duration-200 ${
              showAdvanced ? "rotate-180" : ""
            }`}
          >
            ▼
          </span>
        </button>

        {/* Advanced Controls */}
        {showAdvanced && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <AdvancedControls
              frameConfig={assembly.frame}
              matConfig={assembly.mat}
              onFrameConfigChange={handleFrameConfigChange}
              onMatConfigChange={handleMatConfigChange}
            />
          </div>
        )}
      </div>

      {/* Live Preview */}
      {showPreview && (
        <div className="border-t pt-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            Live Preview
          </h4>
          <div className="flex justify-center">
            <div
              className={`
                w-48 h-48 ${assembly.frame.texture.cssClass} 
                ${`corner-joint-${assembly.frame.cornerJoint}`}
                ${`wear-${assembly.frame.wearPattern}`}
                frame-realistic frame-depth-medium
                flex items-center justify-center
              `}
              style={{
                padding: `${
                  assembly.mat?.thickness === "thin"
                    ? 20
                    : assembly.mat?.thickness === "standard"
                    ? 40
                    : assembly.mat?.thickness === "thick"
                    ? 60
                    : assembly.mat?.thickness === "extra-thick"
                    ? 80
                    : 100
                }px`,
              }}
            >
              <div
                className={`
                  w-full h-full bg-gray-200 rounded flex items-center justify-center
                  ${
                    assembly.mat?.bevelAngle
                      ? `mat-bevel-${assembly.mat.bevelAngle}`
                      : ""
                  }
                `}
                style={{ backgroundColor: assembly.mat?.color || "#ffffff" }}
              >
                <span className="text-gray-500 text-sm">Photo</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FrameTexturePicker;
