"use client";

import React, { useState, useRef } from "react";
import { Trash2, GripVertical, Upload, AlertCircle } from "lucide-react";

export interface ImageItem {
  id: string;
  url: string;
  description?: string;
  isNew?: boolean;
  file?: File;
}

interface ImageGridProps {
  images: ImageItem[];
  onDescriptionChange: (id: string, description: string) => void;
  onRemove: (id: string) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
  onFilesAdd: (files: FileList) => void;
  maxImages?: number;
  className?: string;
}

export function ImageGrid({
  images,
  onDescriptionChange,
  onRemove,
  onReorder,
  onFilesAdd,
  maxImages = 50,
  className = "",
}: ImageGridProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDraggingFiles, setIsDraggingFiles] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.currentTarget.classList.add("opacity-50");
  };

  const handleDragEnd = (e: React.DragEvent) => {
    e.currentTarget.classList.remove("opacity-50");
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      onReorder(draggedIndex, index);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // File drop handlers for adding new images
  const handleContainerDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Check if we're dragging files (not reordering existing images)
    if (e.dataTransfer.types.includes("Files")) {
      e.dataTransfer.dropEffect = "copy";
      setIsDraggingFiles(true);
    }
  };

  const handleContainerDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.dataTransfer.types.includes("Files")) {
      setIsDraggingFiles(true);
    }
  };

  const handleContainerDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Only reset if we're leaving the container completely
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDraggingFiles(false);
    }
  };

  const handleContainerDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsDraggingFiles(false);

    // Check if files were dropped
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      if (!canAddMore) {
        alert(`Cannot add images. Maximum ${maxImages} images allowed.`);
        return;
      }

      const filesArray = Array.from(e.dataTransfer.files);
      const imageFiles = filesArray.filter(
        (file) =>
          file.type.startsWith("image/") ||
          file.name.toLowerCase().endsWith(".heic") ||
          file.name.toLowerCase().endsWith(".heif")
      );

      if (imageFiles.length > 0) {
        const fileList = new DataTransfer();
        imageFiles.forEach((file) => fileList.items.add(file));
        onFilesAdd(fileList.files);
      } else {
        alert(
          "Please drop only image files (JPEG, PNG, GIF, WebP, HEIC, etc.)"
        );
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      onFilesAdd(e.target.files);
      e.target.value = "";
    }
  };

  const toggleImageSelection = (id: string) => {
    const newSelected = new Set(selectedImages);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedImages(newSelected);
  };

  const handleBulkDelete = () => {
    selectedImages.forEach((id) => onRemove(id));
    setSelectedImages(new Set());
    setShowDeleteConfirm(false);
  };

  const canAddMore = images.length < maxImages;

  return (
    <div
      className={`space-y-4 ${className} ${
        isDraggingFiles
          ? "ring-2 ring-blue-500 ring-opacity-50 bg-blue-500 bg-opacity-5"
          : ""
      }`}
      onDragOver={handleContainerDragOver}
      onDragEnter={handleContainerDragEnter}
      onDragLeave={handleContainerDragLeave}
      onDrop={handleContainerDrop}
    >
      {/* Header with actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-gray-200">
            Album Images ({images.length})
          </h3>
          {selectedImages.size > 0 && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-1 px-3 py-1 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              <Trash2 size={14} />
              Delete {selectedImages.size}
            </button>
          )}
        </div>

        {canAddMore && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <Upload size={16} />
            Add Images
          </button>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,.heic,.heif"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Images grid */}
      {images.length === 0 ? (
        <div
          className={`border-2 border-dashed rounded-lg p-12 text-center transition-all ${
            isDraggingFiles
              ? "border-blue-500 bg-blue-500 bg-opacity-10"
              : "border-gray-600"
          }`}
        >
          <Upload size={48} className="mx-auto mb-4 text-gray-400" />
          <p className="text-gray-400 mb-4">
            {isDraggingFiles ? "Drop images here" : "No images yet"}
          </p>
          <p className="text-gray-500 text-sm mb-4">
            Drag and drop images here or click to upload
          </p>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Upload Images
          </button>
        </div>
      ) : (
        <div className="relative">
          {/* Drag overlay for file drops */}
          {isDraggingFiles && (
            <div className="absolute inset-0 z-10 border-2 border-dashed border-blue-500 bg-blue-500 bg-opacity-10 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Upload size={48} className="mx-auto mb-2 text-blue-500" />
                <p className="text-blue-500 font-semibold">
                  Drop images to add them
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {images.map((image, index) => (
              <ImageCard
                key={image.id}
                image={image}
                index={index}
                isSelected={selectedImages.has(image.id)}
                isDraggedOver={dragOverIndex === index}
                onSelect={() => toggleImageSelection(image.id)}
                onRemove={() => onRemove(image.id)}
                onDescriptionChange={(desc) =>
                  onDescriptionChange(image.id, desc)
                }
                onDragStart={(e) => handleDragStart(e, index)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={(e) => handleDrop(e, index)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Upload hint */}
      {canAddMore && images.length > 0 && (
        <div className="text-center">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-blue-400 hover:text-blue-300 text-sm underline"
          >
            + Add more images (up to {maxImages - images.length} more)
          </button>
        </div>
      )}

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md mx-4">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="text-red-500" size={24} />
              <h3 className="text-lg font-semibold text-white">
                Confirm Deletion
              </h3>
            </div>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete {selectedImages.size} selected
              image(s)? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface ImageCardProps {
  image: ImageItem;
  index: number;
  isSelected: boolean;
  isDraggedOver: boolean;
  onSelect: () => void;
  onRemove: () => void;
  onDescriptionChange: (description: string) => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
}

function ImageCard({
  image,
  index,
  isSelected,
  isDraggedOver,
  onSelect,
  onRemove,
  onDescriptionChange,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
}: ImageCardProps) {
  const [showDescription, setShowDescription] = useState(false);
  const [localDescription, setLocalDescription] = useState(
    image.description || ""
  );
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>("");

  // Create image URL from file or use existing URL
  React.useEffect(() => {
    if (image.file) {
      const reader = new FileReader();

      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setImageUrl(dataUrl);
        setImageLoaded(false);
        setImageError(false);
      };

      reader.onerror = () => {
        setImageError(true);
        setImageLoaded(false);
      };

      reader.readAsDataURL(image.file);
    } else if (image.url) {
      setImageUrl(image.url);
      setImageLoaded(false);
      setImageError(false);
    } else {
      setImageUrl("");
      setImageLoaded(false);
      setImageError(false);
    }
  }, [image.file, image.url, image.id]);

  const handleDescriptionBlur = () => {
    onDescriptionChange(localDescription);
    setShowDescription(false);
  };

  return (
    <div
      className={`relative group bg-gray-800 rounded-lg overflow-hidden border transition-all ${
        isSelected
          ? "border-blue-500 ring-2 ring-blue-500 ring-opacity-50"
          : "border-gray-700 hover:border-gray-600"
      } ${isDraggedOver ? "border-green-500 bg-green-500 bg-opacity-10" : ""}`}
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      {/* Selection checkbox */}
      <div className="absolute top-2 left-2 z-20">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onSelect}
          className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
        />
      </div>

      {/* Drag handle */}
      <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
        <GripVertical size={16} className="text-gray-400 cursor-move" />
      </div>

      {/* Remove button */}
      <button
        onClick={onRemove}
        className="absolute top-2 right-2 z-20 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-700 transition-all focus:outline-none focus:ring-2 focus:ring-red-400"
      >
        <Trash2 size={14} />
      </button>

      {/* Image badges */}
      <div className="absolute bottom-2 left-2 z-20 flex gap-1">
        {image.isNew && (
          <span className="px-2 py-1 text-xs bg-green-600 text-white rounded">
            New
          </span>
        )}
        <span className="px-2 py-1 text-xs bg-gray-900 bg-opacity-75 text-white rounded">
          #{index + 1}
        </span>
      </div>

      {/* Image */}
      <div className="w-full h-48 relative cursor-move bg-gray-700">
        {!imageUrl || imageUrl === "" ? (
          <div className="w-full h-full flex items-center justify-center bg-gray-600 text-gray-400">
            <div className="text-center">
              <Upload size={24} className="mx-auto mb-2" />
              <p className="text-xs">No image URL</p>
            </div>
          </div>
        ) : imageError ? (
          <div className="w-full h-full flex items-center justify-center bg-red-900 text-red-300">
            <div className="text-center">
              <AlertCircle size={24} className="mx-auto mb-2" />
              <p className="text-xs">Failed to load</p>
              <p className="text-xs break-all px-2">
                {imageUrl.substring(0, 100)}...
              </p>
              <button
                onClick={() => {
                  setImageError(false);
                  setImageLoaded(false);
                }}
                className="mt-2 px-2 py-1 bg-red-600 text-white text-xs rounded"
              >
                Retry
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full h-full relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={`Image ${index + 1}`}
              className="w-full h-full object-cover"
              style={{
                display: "block",
                width: "100%",
                height: "100%",
                objectFit: "cover",
                position: "relative",
                zIndex: 1,
              }}
              onLoad={() => {
                setImageLoaded(true);
                setImageError(false);
              }}
              onError={() => {
                setImageError(true);
                setImageLoaded(false);
              }}
            />
          </div>
        )}

        {/* Loading state overlay - Only show if not loaded and no error */}
        {imageUrl && !imageLoaded && !imageError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-20">
            <div className="text-white text-sm">Loading...</div>
          </div>
        )}

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all" />
      </div>

      {/* Description section */}
      <div className="p-3 space-y-2">
        {!showDescription ? (
          <button
            onClick={() => setShowDescription(true)}
            className="w-full text-left text-sm text-gray-400 hover:text-gray-300 transition"
          >
            {image.description || "Add description..."}
          </button>
        ) : (
          <input
            type="text"
            value={localDescription}
            onChange={(e) => setLocalDescription(e.target.value)}
            onBlur={handleDescriptionBlur}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleDescriptionBlur();
              } else if (e.key === "Escape") {
                setLocalDescription(image.description || "");
                setShowDescription(false);
              }
            }}
            placeholder="Add description..."
            autoFocus
            className="w-full px-2 py-1 text-sm bg-gray-700 text-white border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        )}
      </div>
    </div>
  );
}
