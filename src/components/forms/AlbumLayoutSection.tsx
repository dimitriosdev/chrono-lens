/**
 * Album Layout Selection Form Section
 * Handles layout selection with traditional dropdown and smart recommendations
 */
"use client";

import React from "react";
import { FormSection, FormField } from "@/components/FormComponents";
import { SmartLayoutSelector } from "@/components/SmartLayoutSelector";
import { ALBUM_LAYOUTS, AlbumLayout } from "@/features/albums/AlbumLayout";

interface AlbumLayoutSectionProps {
  images: Array<{
    id: string;
    url: string;
    description?: string;
    file?: File;
    isNew?: boolean;
  }>;
  currentLayout: AlbumLayout;
  onLayoutChange: (layout: AlbumLayout) => void;
  className?: string;
}

export function AlbumLayoutSection({
  images,
  currentLayout,
  onLayoutChange,
  className = "",
}: AlbumLayoutSectionProps) {
  const handleLayoutDropdownChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selectedLayout = ALBUM_LAYOUTS.find(
      (layout) => layout.name === e.target.value
    );
    if (selectedLayout) {
      onLayoutChange(selectedLayout);
    }
  };

  return (
    <FormSection
      title="Layout Selection"
      description="Choose how your images will be arranged"
      className={className}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Traditional Layout Selection */}
        <div className="space-y-4">
          <FormField
            label="Layout Style"
            help="Select from predefined layout options"
          >
            <select
              value={currentLayout.name}
              onChange={handleLayoutDropdownChange}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {ALBUM_LAYOUTS.map((layout) => (
                <option key={layout.name} value={layout.name}>
                  {layout.name}
                </option>
              ))}
            </select>
          </FormField>

          {/* Layout Description */}
          <div className="p-3 bg-gray-700 rounded-lg border border-gray-600">
            <p className="text-sm text-gray-300">{currentLayout.description}</p>
            <div className="mt-2 text-xs text-gray-400">
              Grid: {currentLayout.grid.rows}×{currentLayout.grid.cols}
              {currentLayout.orientation && (
                <span className="ml-2">
                  • Orientation: {currentLayout.orientation}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Smart Layout Recommendations */}
        <div className="space-y-4">
          <SmartLayoutSelector
            images={images.map((img) => ({
              ...img,
              id: img.id || `temp-${Math.random()}`,
            }))}
            currentLayout={currentLayout}
            onLayoutChange={onLayoutChange}
            className="h-fit"
          />
        </div>
      </div>
    </FormSection>
  );
}
