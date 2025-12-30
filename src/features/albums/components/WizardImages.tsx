"use client";
import React, { useState, useCallback, useRef, useEffect } from "react";

import {
  PhotoIcon,
  MagnifyingGlassIcon,
  SparklesIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { helpers } from "@/shared/constants/design";
import { LoadingButton, Tooltip } from "@/shared/components";
import { ImageGallery } from "./ImageGalleryViews";

interface ImageData {
  id: string;
  file?: File; // Optional for existing images
  url: string;
  thumbnailUrl?: string;
  description?: string;
  tags: string[];
  isFavorite: boolean;
  order: number;
  metadata?: {
    width: number;
    height: number;
    size: number;
    type: string;
    takenAt?: Date;
    location?: string;
  };
}

interface WizardImagesProps {
  value: ImageData[];
  onChange: (images: ImageData[]) => void;
  onValidationChange?: (isValid: boolean) => void;
  className?: string;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
];

export const WizardImages: React.FC<WizardImagesProps> = ({
  value,
  onChange,
  onValidationChange,
  className,
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"order" | "name" | "size" | "date">(
    "order"
  );
  const [editingImageId, setEditingImageId] = useState<string | null>(null);
  const [editingCaption, setEditingCaption] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Use ref for validation callback to prevent infinite loops
  const onValidationChangeRef = useRef(onValidationChange);
  onValidationChangeRef.current = onValidationChange;

  // Validation (stable to prevent infinite loops)
  useEffect(() => {
    const isValid = value.length > 0 && value.length <= 50;
    onValidationChangeRef.current?.(isValid);
  }, [value.length]); // Only depend on value.length, not the callback

  // File processing
  const processFile = useCallback(
    async (file: File): Promise<ImageData> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        const img = new globalThis.Image();

        reader.onload = (e) => {
          const url = e.target?.result as string;
          img.onload = () => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");

            // Create thumbnail
            const maxThumbnailSize = 200;
            const ratio = Math.min(
              maxThumbnailSize / img.width,
              maxThumbnailSize / img.height
            );
            canvas.width = img.width * ratio;
            canvas.height = img.height * ratio;

            ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
            const thumbnailUrl = canvas.toDataURL("image/jpeg", 0.8);

            resolve({
              id: `img_${Date.now()}_${Math.random()
                .toString(36)
                .substr(2, 9)}`,
              file,
              url,
              thumbnailUrl,
              description: "", // Initialize empty description for captions
              tags: [],
              isFavorite: false,
              order: value.length,
              metadata: {
                width: img.width,
                height: img.height,
                size: file.size,
                type: file.type,
              },
            });
          };
          img.src = url;
        };

        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsDataURL(file);
      });
    },
    [value.length]
  );

  const handleFileUpload = useCallback(
    async (files: FileList | File[]) => {
      setUploading(true);
      const fileArray = Array.from(files);
      const validFiles = fileArray.filter((file) => {
        if (!ACCEPTED_TYPES.includes(file.type)) {
          console.warn(`File ${file.name} is not a supported image type`);
          return false;
        }
        if (file.size > MAX_FILE_SIZE) {
          console.warn(`File ${file.name} is too large (max 10MB)`);
          return false;
        }
        return true;
      });

      try {
        const newImages = await Promise.all(validFiles.map(processFile));
        onChange([...value, ...newImages]);
      } catch (error) {
        console.error("Error processing files:", error);
      } finally {
        setUploading(false);
      }
    },
    [value, onChange, processFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);

      if (e.dataTransfer.files) {
        handleFileUpload(e.dataTransfer.files);
      }
    },
    [handleFileUpload]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleImageSelect = useCallback(
    (imageId: string, isSelected: boolean) => {
      const newSelected = new Set(selectedImages);
      if (isSelected) {
        newSelected.add(imageId);
      } else {
        newSelected.delete(imageId);
      }
      setSelectedImages(newSelected);
    },
    [selectedImages]
  );

  const handleImageDelete = useCallback(
    (imageId: string) => {
      onChange(value.filter((img) => img.id !== imageId));
      setSelectedImages((prev) => {
        const newSet = new Set(prev);
        newSet.delete(imageId);
        return newSet;
      });
    },
    [value, onChange]
  );

  const handleBulkDelete = useCallback(() => {
    onChange(value.filter((img) => !selectedImages.has(img.id)));
    setSelectedImages(new Set());
  }, [value, onChange, selectedImages]);

  const handleImageUpdate = useCallback(
    (imageId: string, updates: Partial<ImageData>) => {
      onChange(
        value.map((img) => (img.id === imageId ? { ...img, ...updates } : img))
      );
    },
    [value, onChange]
  );

  // Reorder functionality is commented out but kept for future implementation
  // const handleReorder = useCallback(
  //   (dragIndex: number, hoverIndex: number) => {
  //     const newImages = [...value];
  //     const draggedImage = newImages[dragIndex];
  //     newImages.splice(dragIndex, 1);
  //     newImages.splice(hoverIndex, 0, draggedImage);

  //     // Update order indices
  //     const reorderedImages = newImages.map((img, index) => ({
  //       ...img,
  //       order: index,
  //     }));

  //     onChange(reorderedImages);
  //   },
  //   [value, onChange]
  // );

  // Smart auto-organization
  const handleAutoOrganize = useCallback(() => {
    const organizedImages = [...value]
      .sort((a, b) => {
        // Smart sorting by metadata, favorites, etc.
        if (a.isFavorite && !b.isFavorite) return -1;
        if (!a.isFavorite && b.isFavorite) return 1;

        // Sort by capture date if available, otherwise by file name
        const aDate = a.metadata?.takenAt || new Date(0);
        const bDate = b.metadata?.takenAt || new Date(0);
        return aDate.getTime() - bDate.getTime();
      })
      .map((img, index) => ({ ...img, order: index }));

    onChange(organizedImages);
  }, [value, onChange]);

  // Caption editing functions
  const handleStartEditing = useCallback(
    (imageId: string, currentDescription: string) => {
      setEditingImageId(imageId);
      setEditingCaption(currentDescription || "");
    },
    []
  );

  const handleSaveCaption = useCallback(
    (imageId: string) => {
      handleImageUpdate(imageId, { description: editingCaption });
      setEditingImageId(null);
      setEditingCaption("");
    },
    [editingCaption, handleImageUpdate]
  );

  const handleCancelEditing = useCallback(() => {
    setEditingImageId(null);
    setEditingCaption("");
  }, []);

  const filteredImages = value
    .filter((img) => {
      if (!searchQuery) return true;
      return (
        img.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        img.tags.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return (a.description || "").localeCompare(b.description || "");
        case "size":
          return (b.metadata?.size || 0) - (a.metadata?.size || 0);
        case "date":
          return (
            (b.metadata?.takenAt?.getTime() || 0) -
            (a.metadata?.takenAt?.getTime() || 0)
          );
        default:
          return a.order - b.order;
      }
    });

  return (
    <div className={helpers.cn("space-y-4 sm:space-y-6", className)}>
      {/* Upload Area - More compact on mobile */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={helpers.cn(
          "border-2 border-dashed rounded-xl p-4 sm:p-8 text-center transition-all duration-200",
          dragOver
            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
            : "border-neutral-300 dark:border-neutral-600 hover:border-neutral-400 dark:hover:border-neutral-500"
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={ACCEPTED_TYPES.join(",")}
          onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
          className="hidden"
        />

        <div className="space-y-3 sm:space-y-4">
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-1 sm:mb-2">
              {value.length === 0 ? "Add your first images" : "Add more images"}
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3 sm:mb-4 hidden sm:block">
              Drag and drop images here, or click to browse
            </p>
            <LoadingButton
              variant="primary"
              loading={uploading}
              onClick={() => fileInputRef.current?.click()}
              icon={<PhotoIcon className="w-4 h-4 sm:w-5 sm:h-5" />}
            >
              {uploading ? "Processing..." : "Choose Images"}
            </LoadingButton>
          </div>

          <div className="text-[10px] sm:text-xs text-neutral-500 dark:text-neutral-400 space-y-0.5 sm:space-y-1">
            <p>JPEG, PNG, WebP, GIF, HEIC • Max 10MB • Up to 50 images</p>
            {value.length > 0 && (
              <p className="font-medium">{value.length}/50 images</p>
            )}
          </div>
        </div>
      </div>

      {/* Images Management */}
      {value.length > 0 && (
        <div className="space-y-3 sm:space-y-4">
          {/* Toolbar - Simplified on mobile */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 p-2 sm:p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
            {/* Search - Full width on mobile */}
            <div className="relative flex-1 sm:max-w-xs">
              <MagnifyingGlassIcon className="w-4 h-4 absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-7 sm:pl-9 pr-3 sm:pr-4 py-1.5 sm:py-2 bg-white dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg text-sm"
              />
            </div>

            {/* Controls row */}
            <div className="flex items-center justify-between sm:justify-end gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="px-2 sm:px-3 py-1.5 sm:py-2 bg-white dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg text-xs sm:text-sm"
              >
                <option value="order">Order</option>
                <option value="name">Caption</option>
                <option value="size">Size</option>
                <option value="date">Date</option>
              </select>

              {/* Hide auto-organize on mobile to save space */}
              <div className="hidden sm:block">
                <Tooltip content="Auto-organize images">
                  <LoadingButton
                    variant="secondary"
                    size="sm"
                    onClick={handleAutoOrganize}
                    icon={<SparklesIcon className="w-4 h-4" />}
                  >
                    Auto-organize
                  </LoadingButton>
                </Tooltip>
              </div>

              {selectedImages.size > 0 && (
                <LoadingButton
                  variant="danger"
                  size="sm"
                  onClick={handleBulkDelete}
                  icon={<TrashIcon className="w-4 h-4" />}
                >
                  <span className="hidden sm:inline">Delete</span> (
                  {selectedImages.size})
                </LoadingButton>
              )}

              {/* View mode toggle - Only show on sm+ */}
              <div className="hidden sm:flex border border-neutral-300 dark:border-neutral-600 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode("grid")}
                  className={helpers.cn(
                    "p-2 text-sm",
                    viewMode === "grid"
                      ? "bg-blue-500 text-white"
                      : "bg-white dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400"
                  )}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={helpers.cn(
                    "p-2 text-sm",
                    viewMode === "list"
                      ? "bg-blue-500 text-white"
                      : "bg-white dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400"
                  )}
                >
                  List
                </button>
              </div>
            </div>
          </div>

          {/* Images Display */}
          <ImageGallery
            images={filteredImages}
            viewMode={viewMode}
            selectedImages={selectedImages}
            editingImageId={editingImageId}
            editingCaption={editingCaption}
            onSelect={handleImageSelect}
            onDelete={handleImageDelete}
            onUpdate={handleImageUpdate}
            onStartEditing={handleStartEditing}
            onSaveCaption={handleSaveCaption}
            onCancelEditing={handleCancelEditing}
            onEditingCaptionChange={setEditingCaption}
          />

          {/* Empty state for filtered results */}
          {filteredImages.length === 0 && searchQuery && (
            <div className="text-center py-12">
              <MagnifyingGlassIcon className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                No images found
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                Try adjusting your search terms or clear the search to see all
                images.
              </p>
              <button
                onClick={() => setSearchQuery("")}
                className="mt-4 text-blue-600 dark:text-blue-400 hover:underline"
              >
                Clear search
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WizardImages;
