/**
 * Album Images Form Section
 * Handles image upload, management, and organization
 */
"use client";

import React, { useCallback } from "react";
import { FormSection } from "@/components/FormComponents";
import { ImageGrid, ImageItem } from "@/components/ImageGrid";

interface AlbumImagesSectionProps {
  images: ImageItem[];
  onImagesChange: (images: ImageItem[]) => void;
  error?: string;
  maxImages?: number;
  className?: string;
}

export function AlbumImagesSection({
  images,
  onImagesChange,
  error,
  maxImages = 20,
  className = "",
}: AlbumImagesSectionProps) {
  const handleDescriptionChange = useCallback(
    (id: string, description: string) => {
      const updatedImages = images.map((img) => {
        if (img.id === id) {
          return { ...img, description };
        }
        return img;
      });
      onImagesChange(updatedImages);
    },
    [images, onImagesChange]
  );

  const handleRemove = useCallback(
    (id: string) => {
      const updatedImages = images.filter((img) => img.id !== id);
      onImagesChange(updatedImages);
    },
    [images, onImagesChange]
  );

  const handleReorder = useCallback(
    (fromIndex: number, toIndex: number) => {
      const updatedImages = [...images];
      const [movedImage] = updatedImages.splice(fromIndex, 1);
      updatedImages.splice(toIndex, 0, movedImage);
      onImagesChange(updatedImages);
    },
    [images, onImagesChange]
  );

  const handleFilesAdd = useCallback(
    (files: FileList) => {
      const newImages: ImageItem[] = Array.from(files).map((file, index) => ({
        id: `new-${Date.now()}-${index}`,
        url: URL.createObjectURL(file),
        file,
        description: "",
        isNew: true,
      }));

      const totalImages = images.length + newImages.length;
      if (totalImages > maxImages) {
        alert(
          `Cannot add ${newImages.length} images. Maximum ${maxImages} images allowed.`
        );
        return;
      }

      onImagesChange([...images, ...newImages]);
    },
    [images, onImagesChange, maxImages]
  );

  return (
    <FormSection
      title="Images"
      description="Add and organize your album images"
      className={className}
    >
      <ImageGrid
        images={images}
        onDescriptionChange={handleDescriptionChange}
        onRemove={handleRemove}
        onReorder={handleReorder}
        onFilesAdd={handleFilesAdd}
        maxImages={maxImages}
      />
      {error && (
        <p className="text-xs text-red-400 flex items-center gap-1 mt-2">
          <span className="w-1 h-1 bg-red-400 rounded-full"></span>
          {error}
        </p>
      )}
    </FormSection>
  );
}
