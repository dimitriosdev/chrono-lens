/**
 * Album Slideshow Settings Form Section
 * Handles slideshow-specific configuration
 */
"use client";

import React from "react";
import { FormSection, FormField } from "@/components/FormComponents";

interface AlbumSlideshowSettingsProps {
  cycleDuration: number;
  onCycleDurationChange: (duration: number) => void;
  cycleDurationError?: string;
  isVisible: boolean;
  className?: string;
}

export function AlbumSlideshowSettings({
  cycleDuration,
  onCycleDurationChange,
  cycleDurationError,
  isVisible,
  className = "",
}: AlbumSlideshowSettingsProps) {
  const handleCycleDurationChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value)) {
      onCycleDurationChange(value);
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <FormSection
      title="Slideshow Settings"
      description="Configure slideshow timing and behavior"
      className={className}
    >
      <FormField
        label="Cycle Duration"
        error={cycleDurationError}
        help="Time in milliseconds between image transitions"
      >
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={500}
            max={10000}
            step={100}
            value={cycleDuration}
            onChange={handleCycleDurationChange}
            className="w-20 px-2 py-1 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-gray-400 text-sm">ms</span>
        </div>
      </FormField>
    </FormSection>
  );
}
