/**
 * Album Layout Selection Form Section
 * Simplified layout selection with just slideshow and grid options
 */
"use client";

import React from "react";
import { LayoutSelector } from "@/features/albums/components/LayoutSelector";
import {
  createLayout,
  LayoutType,
  AlbumLayout,
} from "@/features/albums/constants/AlbumLayout";

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
  timing?: {
    slideshow?: {
      cycleDuration: number;
    };
    interactive?: {
      autoAdvance: boolean;
      autoAdvanceDuration: number;
      transitionSpeed: "fast" | "normal" | "smooth";
    };
  };
  onTimingChange?: (timing: {
    slideshow?: {
      cycleDuration: number;
    };
    interactive?: {
      autoAdvance: boolean;
      autoAdvanceDuration: number;
      transitionSpeed: "fast" | "normal" | "smooth";
    };
  }) => void;
  className?: string;
}

export function AlbumLayoutSection({
  images,
  currentLayout,
  onLayoutChange,
  timing,
  onTimingChange,
  className = "",
}: AlbumLayoutSectionProps) {
  const imageCount = images.length;

  const handleLayoutTypeChange = (layoutType: LayoutType) => {
    const newLayout = createLayout(layoutType, imageCount);
    onLayoutChange(newLayout);
  };

  return (
    <LayoutSelector
      currentLayoutType={currentLayout.type}
      onLayoutChange={handleLayoutTypeChange}
      timing={timing}
      onTimingChange={onTimingChange}
      className={className}
    />
  );
}
