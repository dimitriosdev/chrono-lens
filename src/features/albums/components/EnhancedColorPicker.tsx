"use client";

import React from "react";
import { matColors } from "@/features/albums/hooks/useColorPreferences";

interface EnhancedColorPickerProps {
  effectiveMatColor: string;
  effectiveBackgroundColor: string;
  onMatColorSelect: (color: string) => void;
  onBackgroundColorSelect: (color: string) => void;
  onSave: () => Promise<void>;
  onClose: () => void;
  hideBackgroundColor?: boolean;
}

const EnhancedColorPicker: React.FC<EnhancedColorPickerProps> = ({
  effectiveMatColor,
  effectiveBackgroundColor,
  onMatColorSelect,
  onBackgroundColorSelect,
  onSave,
  onClose,
  hideBackgroundColor = false,
}) => {
  const [isSaving, setIsSaving] = React.useState(false);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await onSave();
      onClose(); // Close the popup after successful save
    } catch (error) {
      console.error("Error saving colors:", error);
      // Could add user-visible error message here
    } finally {
      setIsSaving(false);
    }
  };
  return (
    <div className="absolute top-16 left-4 z-50">
      <div className="bg-gray-900/95 backdrop-blur-sm rounded-xl p-4 shadow-2xl border border-gray-700/50 min-w-[240px]">
        {/* Close button */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-white text-sm font-medium">Colors</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Mat Colors */}
        <div className="space-y-3">
          <div>
            <label className="text-white text-xs font-medium mb-2 block">
              Mat Color
            </label>
            <div className="grid grid-cols-4 gap-2">
              {matColors.slice(0, 8).map((colorOption) => (
                <button
                  key={`mat-${colorOption.color}`}
                  type="button"
                  onClick={() => onMatColorSelect(colorOption.color)}
                  className={`w-10 h-10 rounded-lg border-2 transition-all hover:scale-105 ${
                    effectiveMatColor === colorOption.color
                      ? "border-white ring-2 ring-white/50"
                      : "border-gray-600 hover:border-gray-400"
                  }`}
                  style={{ backgroundColor: colorOption.color }}
                  title={colorOption.name}
                />
              ))}
            </div>
          </div>

          {/* Background Colors - hidden for slideshow layout */}
          {!hideBackgroundColor && (
            <div>
              <label className="text-white text-xs font-medium mb-2 block">
                Background Color
              </label>
              <div className="grid grid-cols-4 gap-2">
                {matColors.slice(0, 8).map((colorOption) => (
                  <button
                    key={`bg-${colorOption.color}`}
                    type="button"
                    onClick={() => onBackgroundColorSelect(colorOption.color)}
                    className={`w-10 h-10 rounded-lg border-2 transition-all hover:scale-105 ${
                      effectiveBackgroundColor === colorOption.color
                        ? "border-white ring-2 ring-white/50"
                        : "border-gray-600 hover:border-gray-400"
                    }`}
                    style={{ backgroundColor: colorOption.color }}
                    title={colorOption.name}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 mt-4 pt-3 border-t border-gray-700/50">
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            {isSaving ? "Saving..." : "Save"}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="px-3 py-2 text-gray-400 hover:text-white disabled:text-gray-600 text-sm transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnhancedColorPicker;
export type { EnhancedColorPickerProps };
