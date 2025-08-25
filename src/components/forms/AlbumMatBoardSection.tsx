/**
 * Album Mat Board Form Section
 * Handles frame and mat configuration
 */
"use client";

import React from "react";
import { FormSection } from "@/components/FormComponents";
import { EnhancedMatBoard } from "@/components/EnhancedMatBoard";
import { AlbumLayout, MatConfig } from "@/types/album";

interface AlbumMatBoardSectionProps {
  matConfig: MatConfig;
  onMatConfigChange: (config: MatConfig) => void;
  layout: AlbumLayout;
  previewImages?: string[];
  showPreview?: boolean;
  className?: string;
}

export function AlbumMatBoardSection({
  matConfig,
  onMatConfigChange,
  layout,
  previewImages = [],
  showPreview = true,
  className = "",
}: AlbumMatBoardSectionProps) {
  return (
    <FormSection
      title="Frame & Mat"
      description="Customize the frame and mat appearance"
      className={className}
    >
      <EnhancedMatBoard
        config={matConfig}
        setConfig={onMatConfigChange}
        layout={layout}
        previewImages={previewImages}
        showPreview={showPreview}
      />
    </FormSection>
  );
}
