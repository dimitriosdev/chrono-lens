/**
 * Refactored Album Form Component
 * Simplified, modular, and more maintainable version
 */
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";

import { Button } from "@/shared/components";
import { useAlbumForm } from "@/features/albums/hooks/useAlbumForm";
import { AlbumFormProps } from "@/shared/types/form";
import {
  AlbumBasicInfo,
  AlbumLayoutSection,
  AlbumSlideshowSettings,
  AlbumMatBoardSection,
  AlbumImagesSection,
  AlbumTimingSection,
} from "@/features/albums/components/forms";

export function AlbumForm({
  mode,
  initialData = {},
  onSave,
  loading = false,
  className = "",
}: AlbumFormProps) {
  const router = useRouter();
  const albumForm = useAlbumForm({ mode, initialData });

  const handleSave = async () => {
    if (!albumForm.validateForm()) {
      return;
    }

    try {
      await onSave(albumForm.formData);
    } catch (error) {
      console.error("Error saving album:", error);
      // Handle error (show toast, etc.)
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Basic Album Information */}
      <AlbumBasicInfo
        title={albumForm.formData.title}
        onTitleChange={(title) => albumForm.updateField("title", title)}
        titleError={albumForm.errors.title}
      />

      {/* Image Management */}
      <AlbumImagesSection
        images={albumForm.formData.images}
        onImagesChange={(images) => albumForm.updateField("images", images)}
        error={albumForm.errors.images}
        maxImages={20}
      />

      {/* Layout Selection */}
      <AlbumLayoutSection
        images={albumForm.formData.images}
        currentLayout={albumForm.formData.layout}
        onLayoutChange={(layout) => albumForm.updateField("layout", layout)}
      />

      {/* Slideshow Settings (conditional) */}
      <AlbumSlideshowSettings
        cycleDuration={albumForm.formData.cycleDuration}
        onCycleDurationChange={(duration) =>
          albumForm.updateField("cycleDuration", duration)
        }
        cycleDurationError={albumForm.errors.cycleDuration}
        isVisible={albumForm.isSlideshow}
      />

      {/* Timing Configuration */}
      {albumForm.formData.layout && (
        <AlbumTimingSection
          layout={albumForm.formData.layout}
          timing={albumForm.formData.timing || {}}
          onTimingChange={(timing) => albumForm.updateField("timing", timing)}
        />
      )}

      {/* Mat Board Configuration */}
      <AlbumMatBoardSection
        matConfig={albumForm.formData.matConfig}
        onMatConfigChange={(config) =>
          albumForm.updateField("matConfig", config)
        }
        layout={albumForm.formData.layout}
        previewImages={albumForm.previewImageUrls}
        showPreview={albumForm.showPreview}
      />

      {/* Action Buttons */}
      <div className="sticky bottom-0 bg-gray-900 p-4 -mx-4 border-t border-gray-700 mt-8">
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={handleSave}
            loading={loading}
            disabled={albumForm.hasErrors}
            className="flex-1 sm:flex-none"
          >
            <Save size={16} />
            {mode === "create" ? "Create Album" : "Save Changes"}
          </Button>

          <Button
            variant="ghost"
            onClick={handleCancel}
            className="flex-1 sm:flex-none"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
