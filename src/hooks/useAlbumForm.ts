/**
 * Custom hook for managing album form state and logic
 * Centralizes form state management, validation, and side effects
 */
import { useEffect, useMemo } from "react";
import { useFormState } from "@/hooks/useFormState";
import { validateTitle } from "@/utils/validation";
import { AlbumFormData } from "@/types/form";
import { ALBUM_LAYOUTS } from "@/features/albums/AlbumLayout";

interface UseAlbumFormOptions {
  mode: "create" | "edit";
  initialData?: Partial<AlbumFormData>;
}

export function useAlbumForm({ mode, initialData = {} }: UseAlbumFormOptions) {
  // Default form data
  const defaultFormData: AlbumFormData = {
    title: "",
    images: [],
    layout:
      ALBUM_LAYOUTS.find((l) => l.type === "slideshow") || ALBUM_LAYOUTS[0],
    matConfig: { matWidth: 40, matColor: "#000" },
    cycleDuration: 2000,
    coverUrl: initialData.coverUrl,
    timing: {
      slideshow: {
        cycleDuration: 5,
      },
      interactive: {
        autoAdvance: false,
        autoAdvanceDuration: 5,
        transitionSpeed: 'normal',
      },
    },
  };

  // Initialize form state with merged data
  const formState = useFormState<AlbumFormData>({
    ...defaultFormData,
    ...initialData,
  });

  // Preview image URLs for mat board
  const previewImageUrls = useMemo(() => {
    return formState.formData.images.map((img) => {
      if (img.file) {
        return URL.createObjectURL(img.file);
      }
      return img.url;
    });
  }, [formState.formData.images]);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      formState.formData.images.forEach((img) => {
        if (img.file) {
          URL.revokeObjectURL(URL.createObjectURL(img.file));
        }
      });
    };
  }, [formState.formData.images]);

  // Update form data when initialData changes (for edit mode)
  useEffect(() => {
    if (mode === "edit" && initialData && Object.keys(initialData).length > 0) {
      formState.setFormData({
        ...defaultFormData,
        ...initialData,
      });
    }
  }, [initialData, mode]); // eslint-disable-line react-hooks/exhaustive-deps

  // Validation functions
  const validateForm = (): boolean => {
    formState.clearErrors();
    let isValid = true;

    // Validate title
    const titleValidation = validateTitle(formState.formData.title);
    if (!titleValidation.isValid) {
      formState.setError("title", titleValidation.error!);
      isValid = false;
    }

    // Validate images
    if (formState.formData.images.length === 0) {
      formState.setError("images", "Please add at least one image");
      isValid = false;
    }

    return isValid;
  };

  // Computed properties
  const isSlideshow = formState.formData.layout.type === "slideshow";
  const showPreview = formState.formData.images.length > 0;

  return {
    ...formState,
    previewImageUrls,
    validateForm,
    isSlideshow,
    showPreview,
  };
}
