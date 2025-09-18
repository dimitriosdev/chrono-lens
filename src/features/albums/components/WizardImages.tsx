"use client";
import React, { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

import {
  PhotoIcon,
  MagnifyingGlassIcon,
  SparklesIcon,
  StarIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { helpers } from "@/shared/constants/designSystem";
import { InteractiveCard, LoadingButton, Tooltip } from "@/shared/components";

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
    <div className={helpers.cn("space-y-6", className)}>
      {/* Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={helpers.cn(
          "border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200",
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

        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
              {value.length === 0 ? "Add your first images" : "Add more images"}
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400 mb-4">
              Drag and drop images here, or click to browse
            </p>
            <LoadingButton
              variant="primary"
              loading={uploading}
              onClick={() => fileInputRef.current?.click()}
              icon={<PhotoIcon className="w-5 h-5" />}
            >
              {uploading ? "Processing..." : "Choose Images"}
            </LoadingButton>
          </div>

          <div className="text-xs text-neutral-500 dark:text-neutral-400 space-y-1">
            <p>
              Supports: JPEG, PNG, WebP, GIF, HEIC • Max 10MB per file • Up to
              50 images
            </p>
            {value.length > 0 && (
              <p className="font-medium">{value.length}/50 images uploaded</p>
            )}
          </div>
        </div>
      </div>

      {/* Images Management */}
      {value.length > 0 && (
        <div className="space-y-4">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search captions and tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 bg-white dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg text-sm"
                />
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="px-3 py-2 bg-white dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg text-sm"
              >
                <option value="order">Custom Order</option>
                <option value="name">Caption</option>
                <option value="size">File Size</option>
                <option value="date">Date Taken</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
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

              {selectedImages.size > 0 && (
                <LoadingButton
                  variant="danger"
                  size="sm"
                  onClick={handleBulkDelete}
                  icon={<TrashIcon className="w-4 h-4" />}
                >
                  Delete ({selectedImages.size})
                </LoadingButton>
              )}

              <div className="flex border border-neutral-300 dark:border-neutral-600 rounded-lg overflow-hidden">
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
          {viewMode === "grid" ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              <AnimatePresence>
                {filteredImages.map((image) => (
                  <motion.div
                    key={image.id}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="group relative"
                  >
                    <InteractiveCard className="p-2 h-full">
                      <div className="relative aspect-square rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-700">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={image.thumbnailUrl || image.url}
                          alt={image.description || "Album image"}
                          className="w-full h-full object-cover"
                        />

                        {/* Selection checkbox */}
                        <div className="absolute top-2 left-2">
                          <input
                            type="checkbox"
                            checked={selectedImages.has(image.id)}
                            onChange={(e) =>
                              handleImageSelect(image.id, e.target.checked)
                            }
                            className="w-4 h-4 text-blue-600 bg-white border-2 border-white rounded focus:ring-blue-500"
                          />
                        </div>

                        {/* Favorite star */}
                        <button
                          onClick={() =>
                            handleImageUpdate(image.id, {
                              isFavorite: !image.isFavorite,
                            })
                          }
                          className="absolute top-2 right-2"
                        >
                          <StarIcon
                            className={helpers.cn(
                              "w-5 h-5",
                              image.isFavorite
                                ? "text-yellow-500 fill-current"
                                : "text-white opacity-0 group-hover:opacity-100"
                            )}
                          />
                        </button>

                        {/* Action buttons overlay */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <div className="flex space-x-2">
                            <Tooltip content="Delete">
                              <button
                                onClick={() => handleImageDelete(image.id)}
                                className="p-2 bg-white/90 rounded-full hover:bg-white text-red-600"
                              >
                                <TrashIcon className="w-4 h-4" />
                              </button>
                            </Tooltip>
                          </div>
                        </div>

                        {/* Image info */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                          {editingImageId === image.id ? (
                            <div className="space-y-2">
                              <input
                                type="text"
                                value={editingCaption}
                                onChange={(e) =>
                                  setEditingCaption(e.target.value)
                                }
                                onBlur={() => handleSaveCaption(image.id)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    handleSaveCaption(image.id);
                                  } else if (e.key === "Escape") {
                                    handleCancelEditing();
                                  }
                                }}
                                className="w-full bg-white/90 text-black text-xs px-2 py-1 rounded border-0"
                                placeholder="Add caption..."
                                autoFocus
                              />
                            </div>
                          ) : (
                            <div
                              className="cursor-pointer"
                              onClick={() =>
                                handleStartEditing(
                                  image.id,
                                  image.description || ""
                                )
                              }
                            >
                              <p className="text-white text-xs font-medium truncate">
                                {image.description || "Click to add caption"}
                              </p>
                            </div>
                          )}
                          <p className="text-white/80 text-xs">
                            {image.metadata &&
                              `${image.metadata.width}×${image.metadata.height}`}
                          </p>
                        </div>
                      </div>
                    </InteractiveCard>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredImages.map((image) => (
                <InteractiveCard key={image.id} className="p-4">
                  <div className="flex items-center space-x-4">
                    <input
                      type="checkbox"
                      checked={selectedImages.has(image.id)}
                      onChange={(e) =>
                        handleImageSelect(image.id, e.target.checked)
                      }
                      className="w-4 h-4 text-blue-600"
                    />

                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-700 flex-shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={image.thumbnailUrl || image.url}
                        alt={image.description || "Album image"}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      {editingImageId === image.id ? (
                        <input
                          type="text"
                          value={editingCaption}
                          onChange={(e) => setEditingCaption(e.target.value)}
                          onBlur={() => handleSaveCaption(image.id)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleSaveCaption(image.id);
                            } else if (e.key === "Escape") {
                              handleCancelEditing();
                            }
                          }}
                          className="w-full font-medium text-neutral-900 dark:text-neutral-100 bg-transparent border-b border-blue-500 outline-none"
                          placeholder="Add caption..."
                          autoFocus
                        />
                      ) : (
                        <h4
                          className="font-medium text-neutral-900 dark:text-neutral-100 truncate cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
                          onClick={() =>
                            handleStartEditing(
                              image.id,
                              image.description || ""
                            )
                          }
                        >
                          {image.description || "Click to add caption"}
                        </h4>
                      )}
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        {image.metadata && (
                          <>
                            {image.metadata.width}×{image.metadata.height} •
                            {(image.metadata.size / 1024 / 1024).toFixed(1)}MB
                          </>
                        )}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() =>
                          handleImageUpdate(image.id, {
                            isFavorite: !image.isFavorite,
                          })
                        }
                        className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded"
                      >
                        <StarIcon
                          className={helpers.cn(
                            "w-5 h-5",
                            image.isFavorite
                              ? "text-yellow-500 fill-current"
                              : "text-neutral-400"
                          )}
                        />
                      </button>
                      <button
                        onClick={() => handleImageDelete(image.id)}
                        className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded text-red-600"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </InteractiveCard>
              ))}
            </div>
          )}

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
