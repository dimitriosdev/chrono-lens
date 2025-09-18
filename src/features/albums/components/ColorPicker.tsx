"use client";

import React from "react";
import { matColors } from "@/features/albums/hooks/useColorPreferences";

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
  showCustomInput?: boolean;
  className?: string;
}

const ColorPicker: React.FC<ColorPickerProps> = ({
  label,
  value,
  onChange,
  showCustomInput = true,
  className = "",
}) => {
  return (
    <div className={`space-y-3 ${className}`}>
      <label className="block text-sm font-medium text-neutral-900 dark:text-neutral-100">
        {label}
      </label>

      {/* Preset colors grid */}
      <div className="grid grid-cols-4 gap-2">
        {matColors.map((colorOption) => (
          <button
            key={colorOption.color}
            type="button"
            onClick={() => onChange(colorOption.color)}
            className={`w-12 h-12 rounded-lg border-2 transition-all hover:scale-105 ${
              value === colorOption.color
                ? "border-blue-500 ring-2 ring-blue-500/50"
                : "border-neutral-300 dark:border-neutral-600 hover:border-neutral-400 dark:hover:border-neutral-500"
            }`}
            style={{ backgroundColor: colorOption.color }}
            title={colorOption.name}
          />
        ))}
      </div>

      {/* Custom color input */}
      {showCustomInput && (
        <div className="flex items-center space-x-3">
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-12 h-12 border border-neutral-300 dark:border-neutral-600 rounded-lg cursor-pointer"
            title="Choose custom color"
          />
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="flex-1 px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
            placeholder="#000000"
            pattern="^#[0-9A-Fa-f]{6}$"
          />
        </div>
      )}
    </div>
  );
};

export default ColorPicker;
export type { ColorPickerProps };
