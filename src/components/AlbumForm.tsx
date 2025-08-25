/**
 * Refactored Album Form Component
 * Simplified, modular, and more maintainable version
 */
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Save, Eye } from "lucide-react";

import { Button } from "@/components/FormComponents";
import { useAlbumForm } from "@/hooks/useAlbumForm";
import { AlbumFormProps } from "@/types/form";
import {
  AlbumBasicInfo,
  AlbumLayoutSection,
  AlbumSlideshowSettings,
  AlbumMatBoardSection,
  AlbumImagesSection,
} from "@/components/forms";

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

  const handlePreview = () => {
    // TODO: Implement preview functionality
    console.log("Preview functionality to be implemented");
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
      <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-700">
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
          variant="secondary"
          onClick={handlePreview}
          disabled={albumForm.formData.images.length === 0}
          className="flex-1 sm:flex-none"
        >
          <Eye size={16} />
          Preview
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
  );
}
