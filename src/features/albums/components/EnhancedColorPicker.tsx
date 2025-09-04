"use client";

import React from "react";
import { matColors } from "@/features/albums/hooks/useColorPreferences";

interface EnhancedColorPickerProps {
  effectiveMatColor: string;
  selectedMatColor: string | null;
  albumMatColor?: string;
  effectiveBackgroundColor: string;
  selectedBackgroundColor: string | null;
  albumBackgroundColor?: string;
  onMatColorSelect: (color: string) => void;
  onBackgroundColorSelect: (color: string) => void;
  onMatReset: () => void;
  onBackgroundReset: () => void;
  showAlbumTitle: boolean;
  onToggleAlbumTitle: () => void;
  onClose: () => void;
}

const EnhancedColorPicker: React.FC<EnhancedColorPickerProps> = ({
  effectiveMatColor,
  selectedMatColor,
  albumMatColor,
  effectiveBackgroundColor,
  selectedBackgroundColor,
  albumBackgroundColor,
  onMatColorSelect,
  onBackgroundColorSelect,
  onMatReset,
  onBackgroundReset,
  showAlbumTitle,
  onToggleAlbumTitle,
  onClose,
}) => {
  const [activeTab, setActiveTab] = React.useState<"mat" | "background">("mat");

  const handleColorSelect = React.useCallback(
    (color: string) => {
      if (activeTab === "mat") {
        onMatColorSelect(color);
      } else {
        onBackgroundColorSelect(color);
      }
    },
    [activeTab, onMatColorSelect, onBackgroundColorSelect]
  );

  const handleReset = React.useCallback(() => {
    if (activeTab === "mat") {
      onMatReset();
    } else {
      onBackgroundReset();
    }
  }, [activeTab, onMatReset, onBackgroundReset]);

  const effectiveColor =
    activeTab === "mat" ? effectiveMatColor : effectiveBackgroundColor;
  const albumColor = activeTab === "mat" ? albumMatColor : albumBackgroundColor;
  const selectedColor =
    activeTab === "mat" ? selectedMatColor : selectedBackgroundColor;

  const currentColorInfo = matColors.find((c) => c.color === effectiveColor);

  return (
    <div className="absolute top-16 left-4 z-50">
      <div className="bg-gray-900/95 backdrop-blur-sm rounded-xl p-4 shadow-2xl border border-gray-700/50 min-w-[280px]">
        {/* Tab selection */}
        <div className="flex mb-4 bg-gray-800 rounded-lg p-1">
          <button
            type="button"
            onClick={() => setActiveTab("mat")}
            className={`flex-1 px-3 py-2 text-xs rounded-md transition-colors font-calligraphy ${
              activeTab === "mat"
                ? "bg-blue-600 text-white"
                : "text-gray-300 hover:text-white"
            }`}
          >
            Mat Color
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("background")}
            className={`flex-1 px-3 py-2 text-xs rounded-md transition-colors font-calligraphy ${
              activeTab === "background"
                ? "bg-blue-600 text-white"
                : "text-gray-300 hover:text-white"
            }`}
          >
            Background
          </button>
        </div>

        <h3 className="text-white text-sm font-medium mb-3 font-calligraphy">
          {activeTab === "mat" ? "Mat Colors" : "Background Colors"}
        </h3>

        {/* Colors grid */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {matColors.map((colorOption) => (
            <button
              key={colorOption.color}
              type="button"
              onClick={() => handleColorSelect(colorOption.color)}
              className={`w-12 h-12 rounded-lg border-2 transition-all duration-200 hover:scale-105 flex flex-col items-center justify-center ${
                effectiveColor === colorOption.color
                  ? "border-white shadow-lg ring-2 ring-white/30"
                  : "border-gray-600 hover:border-gray-400"
              }`}
              style={{ backgroundColor: colorOption.color }}
              aria-label={`Set ${activeTab} to ${colorOption.name}`}
            >
              {/* Show current album default indicator */}
              {albumColor === colorOption.color && (
                <div className="w-2 h-2 rounded-full bg-blue-400 border border-white shadow-sm" />
              )}
            </button>
          ))}
        </div>

        {/* Color names for selected color */}
        <div className="mb-3">
          <p className="text-white/80 text-xs font-calligraphy text-center">
            {currentColorInfo?.name || "Custom Color"}
            {albumColor === effectiveColor && !selectedColor && (
              <span className="text-blue-400"> • Album Default</span>
            )}
            {selectedColor && (
              <span className="text-green-400"> • Custom Selection</span>
            )}
          </p>
        </div>

        {/* Custom color picker */}
        <div className="space-y-3">
          <label className="text-white text-xs font-medium font-calligraphy">
            Custom Color:
          </label>
          <input
            type="color"
            value={effectiveColor}
            onChange={(e) => handleColorSelect(e.target.value)}
            className="w-full h-10 rounded-lg border border-gray-600 bg-transparent cursor-pointer"
          />
        </div>

        {/* Album title visibility toggle */}
        <div className="border-t border-gray-700/50 pt-3 mt-4">
          <div className="flex items-center justify-between">
            <label className="text-white text-xs font-medium font-calligraphy">
              Show Album Title
            </label>
            <button
              type="button"
              onClick={onToggleAlbumTitle}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                showAlbumTitle ? "bg-blue-600" : "bg-gray-600"
              }`}
            >
              <span
                className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                  showAlbumTitle ? "translate-x-5" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 mt-4">
          <button
            type="button"
            onClick={handleReset}
            className="flex-1 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white text-xs rounded-lg transition-colors font-calligraphy"
          >
            Use Album Default
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-3 py-2 bg-blue-800 hover:bg-blue-700 text-white text-xs rounded-lg transition-colors font-calligraphy"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnhancedColorPicker;
export type { EnhancedColorPickerProps };
