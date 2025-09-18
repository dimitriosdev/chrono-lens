/**
 * Album Mat Board Form Section
 * Handles frame and mat configuration
 */
"use client";

import React from "react";
import { FormSection, FormField } from "@/shared/components";
import { AlbumLayout, MatConfig } from "@/shared/types/album";

interface AlbumMatBoardSectionProps {
  matConfig: MatConfig;
  onMatConfigChange: (config: MatConfig) => void;
  layout: AlbumLayout;
  previewImages?: string[];
  showPreview?: boolean;
  className?: string;
}

const MAT_COLORS = [
  { name: "Black", value: "#000000" },
  { name: "White", value: "#FFFFFF" },
  { name: "Cream", value: "#F5F5DC" },
  { name: "Charcoal", value: "#36454F" },
  { name: "Warm Gray", value: "#8D8D8D" },
  { name: "Navy", value: "#191970" },
];

export function AlbumMatBoardSection({
  matConfig,
  onMatConfigChange,
  previewImages = [],
  showPreview = true,
  className = "",
}: AlbumMatBoardSectionProps) {
  const handleMatWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const width = parseInt(e.target.value, 10);
    onMatConfigChange({ ...matConfig, matWidth: width });
  };

  const handleMatColorChange = (color: string) => {
    onMatConfigChange({ ...matConfig, matColor: color });
  };

  return (
    <FormSection
      title="Frame & Mat"
      description="Customize the frame and mat appearance"
      className={className}
    >
      <div className="space-y-6">
        {/* Mat Width */}
        <FormField
          label="Mat Width"
          help="Adjust the width of the mat border around images"
        >
          <div className="space-y-2">
            <input
              type="range"
              min="0"
              max="20"
              step="1"
              value={matConfig.matWidth}
              onChange={handleMatWidthChange}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-sm text-gray-400">
              <span>No Mat</span>
              <span className="font-medium">{matConfig.matWidth}%</span>
              <span>Wide Mat</span>
            </div>
          </div>
        </FormField>

        {/* Mat Color */}
        <FormField label="Mat Color" help="Choose the color of the mat border">
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {MAT_COLORS.map((color) => (
              <button
                key={color.value}
                type="button"
                onClick={() => handleMatColorChange(color.value)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  matConfig.matColor === color.value
                    ? "border-blue-500 bg-blue-500/20"
                    : "border-gray-600 hover:border-gray-500"
                }`}
              >
                <div
                  className="w-full h-8 rounded border"
                  style={{ backgroundColor: color.value }}
                />
                <div className="text-xs text-gray-300 mt-1">{color.name}</div>
              </button>
            ))}
          </div>
        </FormField>

        {/* Preview */}
        {showPreview && previewImages.length > 0 && (
          <div className="p-4 bg-gray-700 rounded-lg">
            <h4 className="text-sm font-medium text-gray-300 mb-3">Preview</h4>
            <div className="text-sm text-gray-400">
              Preview will show in the album viewer with your selected mat
              settings.
            </div>
          </div>
        )}
      </div>
    </FormSection>
  );
}
