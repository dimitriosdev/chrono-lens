/**
 * Image Gallery Views
 * Grid and List views for displaying album images
 */
"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StarIcon, TrashIcon } from "@heroicons/react/24/outline";
import { helpers } from "@/shared/constants/design";
import { InteractiveCard, Tooltip } from "@/shared/components";

interface ImageData {
  id: string;
  file?: File;
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

interface ImageCardProps {
  image: ImageData;
  isSelected: boolean;
  isEditing: boolean;
  editingCaption: string;
  onSelect: (imageId: string, isSelected: boolean) => void;
  onDelete: (imageId: string) => void;
  onUpdate: (imageId: string, updates: Partial<ImageData>) => void;
  onStartEditing: (imageId: string, currentDescription: string) => void;
  onSaveCaption: (imageId: string) => void;
  onCancelEditing: () => void;
  onEditingCaptionChange: (caption: string) => void;
}

// Grid view card component
export const ImageGridCard: React.FC<ImageCardProps> = ({
  image,
  isSelected,
  isEditing,
  editingCaption,
  onSelect,
  onDelete,
  onUpdate,
  onStartEditing,
  onSaveCaption,
  onCancelEditing,
  onEditingCaptionChange,
}) => (
  <motion.div
    layout
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.8 }}
    className="group relative"
  >
    <InteractiveCard className="p-1 sm:p-2 h-full">
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
            checked={isSelected}
            onChange={(e) => onSelect(image.id, e.target.checked)}
            className="w-4 h-4 text-blue-600 bg-white border-2 border-white rounded focus:ring-blue-500"
          />
        </div>

        {/* Favorite star */}
        <button
          onClick={() => onUpdate(image.id, { isFavorite: !image.isFavorite })}
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
                onClick={() => onDelete(image.id)}
                className="p-2 bg-white/90 rounded-full hover:bg-white text-red-600"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </Tooltip>
          </div>
        </div>

        {/* Image info */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
          {isEditing ? (
            <div className="space-y-2">
              <input
                type="text"
                value={editingCaption}
                onChange={(e) => onEditingCaptionChange(e.target.value)}
                onBlur={() => onSaveCaption(image.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    onSaveCaption(image.id);
                  } else if (e.key === "Escape") {
                    onCancelEditing();
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
              onClick={() => onStartEditing(image.id, image.description || "")}
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
);

// List view row component
export const ImageListRow: React.FC<ImageCardProps> = ({
  image,
  isSelected,
  isEditing,
  editingCaption,
  onSelect,
  onDelete,
  onUpdate,
  onStartEditing,
  onSaveCaption,
  onCancelEditing,
  onEditingCaptionChange,
}) => (
  <InteractiveCard className="p-4">
    <div className="flex items-center space-x-4">
      <input
        type="checkbox"
        checked={isSelected}
        onChange={(e) => onSelect(image.id, e.target.checked)}
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
        {isEditing ? (
          <input
            type="text"
            value={editingCaption}
            onChange={(e) => onEditingCaptionChange(e.target.value)}
            onBlur={() => onSaveCaption(image.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                onSaveCaption(image.id);
              } else if (e.key === "Escape") {
                onCancelEditing();
              }
            }}
            className="w-full font-medium text-neutral-900 dark:text-neutral-100 bg-transparent border-b border-blue-500 outline-none"
            placeholder="Add caption..."
            autoFocus
          />
        ) : (
          <h4
            className="font-medium text-neutral-900 dark:text-neutral-100 truncate cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
            onClick={() => onStartEditing(image.id, image.description || "")}
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
          onClick={() => onUpdate(image.id, { isFavorite: !image.isFavorite })}
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
          onClick={() => onDelete(image.id)}
          className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded text-red-600"
        >
          <TrashIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  </InteractiveCard>
);

// Main gallery view component
interface ImageGalleryProps {
  images: ImageData[];
  viewMode: "grid" | "list";
  selectedImages: Set<string>;
  editingImageId: string | null;
  editingCaption: string;
  onSelect: (imageId: string, isSelected: boolean) => void;
  onDelete: (imageId: string) => void;
  onUpdate: (imageId: string, updates: Partial<ImageData>) => void;
  onStartEditing: (imageId: string, currentDescription: string) => void;
  onSaveCaption: (imageId: string) => void;
  onCancelEditing: () => void;
  onEditingCaptionChange: (caption: string) => void;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  viewMode,
  selectedImages,
  editingImageId,
  editingCaption,
  onSelect,
  onDelete,
  onUpdate,
  onStartEditing,
  onSaveCaption,
  onCancelEditing,
  onEditingCaptionChange,
}) => {
  const commonProps = {
    onSelect,
    onDelete,
    onUpdate,
    onStartEditing,
    onSaveCaption,
    onCancelEditing,
    onEditingCaptionChange,
    editingCaption,
  };

  if (viewMode === "grid") {
    return (
      <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-4">
        <AnimatePresence>
          {images.map((image) => (
            <ImageGridCard
              key={image.id}
              image={image}
              isSelected={selectedImages.has(image.id)}
              isEditing={editingImageId === image.id}
              {...commonProps}
            />
          ))}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {images.map((image) => (
        <ImageListRow
          key={image.id}
          image={image}
          isSelected={selectedImages.has(image.id)}
          isEditing={editingImageId === image.id}
          {...commonProps}
        />
      ))}
    </div>
  );
};

export default ImageGallery;
