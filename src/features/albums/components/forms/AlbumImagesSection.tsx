/**
 * Album Images Form Section
 * Handles image upload, management, and organization with processing
 */
"use client";

import React, { useCallback, useState } from "react";
import { FormSection } from "@/shared/components";
import { ImageGrid, ImageItem } from "@/features/albums/components/ImageGrid";
import { ImageProcessingStatus } from "@/features/albums/components/ImageProcessingStatus";
import { processImages, ProcessedImage } from "../../utils/imageProcessing";

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
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedResults, setProcessedResults] = useState<ProcessedImage[]>(
    []
  );
  const [processingProgress, setProcessingProgress] = useState<{
    current: number;
    total: number;
    currentFile: string;
  }>({
    current: 0,
    total: 0,
    currentFile: "",
  });

  const handleImageRemove = useCallback(
    (id: string) => {
      const updatedImages = images.filter((img) => img.id !== id);
      onImagesChange(updatedImages);
    },
    [images, onImagesChange]
  );

  const handleImageReorder = useCallback(
    (fromIndex: number, toIndex: number) => {
      const updatedImages = [...images];
      const [movedImage] = updatedImages.splice(fromIndex, 1);
      updatedImages.splice(toIndex, 0, movedImage);
      onImagesChange(updatedImages);
    },
    [images, onImagesChange]
  );

  const handleDescriptionChange = useCallback(
    (id: string, description: string) => {
      const updatedImages = images.map((img) =>
        img.id === id ? { ...img, description } : img
      );
      onImagesChange(updatedImages);
    },
    [images, onImagesChange]
  );

  const handleFilesAdd = useCallback(
    async (files: FileList) => {
      const fileArray = Array.from(files);

      if (images.length + fileArray.length > maxImages) {
        alert(
          `Cannot add ${fileArray.length} images. Maximum ${maxImages} images allowed.`
        );
        return;
      }

      setIsProcessing(true);
      setProcessingProgress({
        current: 0,
        total: fileArray.length,
        currentFile: "",
      });

      try {
        // Process images with progress tracking
        const results = await processImages(
          fileArray,
          (processed, total, currentFile) => {
            setProcessingProgress({ current: processed, total, currentFile });
          }
        );

        setProcessedResults(results);

        // Convert processed images to ImageItems
        const newImages: ImageItem[] = results.map((result, index) => ({
          id: `new-${Date.now()}-${index}`,
          url: URL.createObjectURL(result.file),
          file: result.file,
          description: "",
          isNew: true,
        }));

        onImagesChange([...images, ...newImages]);
      } catch (error) {
        console.error("Image processing failed:", error);
        // Fallback: add original files without processing
        const newImages: ImageItem[] = fileArray.map((file, index) => ({
          id: `new-${Date.now()}-${index}`,
          url: URL.createObjectURL(file),
          file,
          description: "",
          isNew: true,
        }));

        onImagesChange([...images, ...newImages]);
      } finally {
        setIsProcessing(false);
      }
    },
    [images, onImagesChange, maxImages]
  );

  return (
    <FormSection
      title="Images"
      description="Add and organize your album images"
      className={className}
    >
      {/* Image Processing Status */}
      <ImageProcessingStatus
        isProcessing={isProcessing}
        processedImages={processedResults}
        currentFile={processingProgress.currentFile}
        progress={processingProgress.total > 0 ? processingProgress : undefined}
      />

      {/* Image Grid */}
      <ImageGrid
        images={images}
        onDescriptionChange={handleDescriptionChange}
        onRemove={handleImageRemove}
        onReorder={handleImageReorder}
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
