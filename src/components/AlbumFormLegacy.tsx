"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Save, Eye } from "lucide-react";

import { ImageGrid, ImageItem } from "@/components/ImageGrid";
import { FormSection, FormField, Button } from "@/components/FormComponents";
import { EnhancedMatBoard, MatConfig } from "@/components/EnhancedMatBoard";
import { SmartLayoutSelector } from "@/components/SmartLayoutSelector";
import {
  ALBUM_LAYOUTS,
  AlbumLayout as AlbumLayoutType,
} from "@/features/albums/AlbumLayout";
import { validateAlbumTitle, validateFile } from "@/lib/security";

interface AlbumFormData {
  title: string;
  images: ImageItem[];
  layout: AlbumLayoutType;
  matConfig: MatConfig;
  cycleDuration: number;
  coverUrl?: string;
}

interface AlbumFormProps {
  mode: "create" | "edit";
  initialData?: Partial<AlbumFormData>;
  onSave: (data: AlbumFormData) => Promise<void>;
  loading?: boolean;
  className?: string;
}

export function AlbumForm({
  mode,
  initialData = {},
  onSave,
  loading = false,
  className = "",
}: AlbumFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<AlbumFormData>({
    title: initialData.title || "",
    images: initialData.images || [],
    layout:
      initialData.layout ||
      ALBUM_LAYOUTS.find((l) => l.type === "slideshow") ||
      ALBUM_LAYOUTS[0],
    matConfig: initialData.matConfig || { matWidth: 40, matColor: "#000" },
    cycleDuration: initialData.cycleDuration || 2000,
    coverUrl: initialData.coverUrl,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPreview, setShowPreview] = useState(true);

  // Generate preview image URLs
  const previewImageUrls = useMemo(() => {
    return formData.images.map((img) => {
      if (img.file) {
        return URL.createObjectURL(img.file);
      }
      return img.url;
    });
  }, [formData.images]);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      formData.images.forEach((img) => {
        if (img.file) {
          URL.revokeObjectURL(URL.createObjectURL(img.file));
        }
      });
    };
  }, [formData.images]);

  // Update form data when initialData changes (for edit mode)
  useEffect(() => {
    if (mode === "edit" && initialData && Object.keys(initialData).length > 0) {
      setFormData({
        title: initialData.title || "",
        images: initialData.images || [],
        layout:
          initialData.layout ||
          ALBUM_LAYOUTS.find((l) => l.type === "slideshow") ||
          ALBUM_LAYOUTS[0],
        matConfig: initialData.matConfig || { matWidth: 40, matColor: "#000" },
        cycleDuration: initialData.cycleDuration || 2000,
        coverUrl: initialData.coverUrl,
      });
    }
  }, [initialData, mode]);

  const updateFormData = (updates: Partial<AlbumFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));

    // Clear related errors when field is updated
    const newErrors = { ...errors };
    Object.keys(updates).forEach((key) => {
      delete newErrors[key];
    });
    setErrors(newErrors);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate title
    const titleValidation = validateAlbumTitle(formData.title);
    if (!titleValidation.isValid) {
      newErrors.title = titleValidation.error || "Invalid title";
    }

    // Validate images
    if (formData.images.length === 0) {
      newErrors.images = "At least one image is required";
    }

    // Validate cycle duration
    if (formData.cycleDuration < 500 || formData.cycleDuration > 10000) {
      newErrors.cycleDuration = "Duration must be between 500ms and 10000ms";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFilesAdd = (files: FileList) => {
    const validFiles: File[] = [];
    const fileErrors: string[] = [];

    Array.from(files).forEach((file) => {
      const validation = validateFile(file);
      if (validation.isValid) {
        // Check if file is already added
        const isDuplicate = formData.images.some(
          (img) =>
            img.file &&
            img.file.name === file.name &&
            img.file.size === file.size
        );

        if (!isDuplicate) {
          validFiles.push(file);
        }
      } else {
        fileErrors.push(`${file.name}: ${validation.error}`);
      }
    });

    if (fileErrors.length > 0) {
      setErrors((prev) => ({ ...prev, images: fileErrors.join("; ") }));
    }

    if (validFiles.length > 0) {
      const newImages: ImageItem[] = validFiles.map((file, index) => ({
        id: `new-${Date.now()}-${index}`,
        url: "",
        file,
        isNew: true,
        description: "",
      }));

      updateFormData({
        images: [...formData.images, ...newImages],
      });
    }
  };

  const handleImageRemove = (id: string) => {
    updateFormData({
      images: formData.images.filter((img) => img.id !== id),
    });
  };

  const handleImageReorder = (fromIndex: number, toIndex: number) => {
    const newImages = [...formData.images];
    const [movedImage] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImage);

    updateFormData({ images: newImages });
  };

  const handleDescriptionChange = (id: string, description: string) => {
    updateFormData({
      images: formData.images.map((img) =>
        img.id === id ? { ...img, description } : img
      ),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await onSave(formData);
    } catch (error) {
      let errorMessage =
        error instanceof Error ? error.message : "Failed to save album";

      // If it's a rate limit error, provide a helpful suggestion in development
      if (
        errorMessage.includes("Rate limit") &&
        process.env.NODE_ENV === "development"
      ) {
        errorMessage +=
          " (In development, you can clear rate limits using window.clearRateLimit() in the browser console)";
      }

      setErrors((prev) => ({
        ...prev,
        submit: errorMessage,
      }));
    }
  };

  const canSave =
    formData.title.trim() && formData.images.length > 0 && !loading;

  return (
    <div className={`max-w-4xl mx-auto space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">
          {mode === "create" ? "Create New Album" : "Edit Album"}
        </h1>

        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={() => setShowPreview(!showPreview)}
          >
            <Eye size={16} />
            {showPreview ? "Hide Preview" : "Show Preview"}
          </Button>
        </div>
      </div>

      {/* Error summary */}
      {errors.submit && (
        <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded-lg">
          {errors.submit}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info Section */}
        <FormSection title="Basic Information" description="Album title">
          <FormField
            label="Album Title"
            required
            error={errors.title}
            help="Give your album a memorable name"
          >
            <input
              type="text"
              value={formData.title}
              onChange={(e) => updateFormData({ title: e.target.value })}
              className="w-full p-3 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter album title"
            />
          </FormField>
        </FormSection>

        {/* Images Section */}
        <FormSection
          title="Images"
          description="Upload and organize your album images"
        >
          <ImageGrid
            images={formData.images}
            onFilesAdd={handleFilesAdd}
            onRemove={handleImageRemove}
            onReorder={handleImageReorder}
            onDescriptionChange={handleDescriptionChange}
            maxImages={50}
          />
          {errors.images && (
            <p className="text-red-400 text-sm mt-2">{errors.images}</p>
          )}
        </FormSection>

        {/* Layout Section */}
        <FormSection
          title="Layout & Display"
          description="Choose how your images will be displayed"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <FormField label="Album Layout">
                <select
                  value={formData.layout.name}
                  onChange={(e) => {
                    const layout = ALBUM_LAYOUTS.find(
                      (l) => l.name === e.target.value
                    );
                    if (layout) updateFormData({ layout });
                  }}
                  className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {ALBUM_LAYOUTS.map((layout) => (
                    <option key={layout.name} value={layout.name}>
                      {layout.name}
                    </option>
                  ))}
                </select>
                <p className="text-sm text-gray-400 mt-1">
                  {formData.layout.description}
                </p>
              </FormField>

              <FormField
                label="Image Change Duration"
                error={errors.cycleDuration}
                help="How long each image is displayed (milliseconds)"
              >
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={500}
                    max={10000}
                    step={100}
                    value={formData.cycleDuration}
                    onChange={(e) =>
                      updateFormData({ cycleDuration: Number(e.target.value) })
                    }
                    className="flex-1 accent-blue-500"
                  />
                  <input
                    type="number"
                    min={500}
                    max={10000}
                    step={100}
                    value={formData.cycleDuration}
                    onChange={(e) =>
                      updateFormData({ cycleDuration: Number(e.target.value) })
                    }
                    className="w-20 px-2 py-1 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-gray-400 text-sm">ms</span>
                </div>
              </FormField>
            </div>

            {/* Smart Layout Recommendations */}
            <div className="space-y-4">
              <SmartLayoutSelector
                images={formData.images}
                currentLayout={formData.layout}
                onLayoutChange={(layout) => updateFormData({ layout })}
                className="h-fit"
              />
            </div>
          </div>
        </FormSection>

        {/* Mat Board Section */}
        <FormSection
          title="Frame & Mat"
          description="Customize the frame and mat appearance"
        >
          <EnhancedMatBoard
            config={formData.matConfig}
            setConfig={(matConfig) => updateFormData({ matConfig })}
            layout={formData.layout}
            previewImages={previewImageUrls}
            showPreview={showPreview}
          />
        </FormSection>

        {/* Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-700">
          <Button
            variant="secondary"
            onClick={() => router.back()}
            disabled={loading}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            loading={loading}
            disabled={!canSave}
            size="lg"
            className="min-w-[120px]"
          >
            <Save size={16} />
            {mode === "create" ? "Create Album" : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
