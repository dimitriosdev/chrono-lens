/**
 * Enhanced Album Form Component with Wizard Interface
 * Provides a step-by-step guided experience for album creation/editing
 * Uses clean Album interface with proper Firebase Storage URL handling
 */
"use client";

import React, {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
} from "react";
import {
  SparklesIcon,
  PhotoIcon,
  PaintBrushIcon,
} from "@heroicons/react/24/outline";
import { Album } from "@/shared/types/album";
import {
  AlbumLayout,
  createLayout,
} from "@/features/albums/constants/AlbumLayout";
import { AlbumCreationWizard, WizardStep } from "./AlbumCreationWizard";
import { WizardBasicInfo } from "./WizardBasicInfo";
import { WizardImages } from "./WizardImages";
import { AlbumLayoutSection } from "./forms/AlbumLayoutSection";
import {
  validatePayloadSize,
  optimizeImagesForPayloadLimit,
  isFirebaseStorageUrl,
} from "../utils/imageProcessing";
import { PayloadSizeIndicator } from "./PayloadSizeIndicator";
import ColorPicker from "./ColorPicker";
import { AlbumPreview } from "./AlbumPreview";

interface AlbumFormProps {
  album?: Album;
  mode?: "create" | "edit";
  onSave: (
    album: Omit<Album, "id" | "createdAt" | "updatedAt">
  ) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
}

interface BasicInfoData {
  title: string;
  privacy: "public" | "private";
  tags: string[];
  coverImageIndex?: number;
}

interface FormData {
  title: string;
  description: string;
  privacy: "public" | "private";
  tags: string[];
  category: string;
  images: Array<{
    id: string;
    file?: File; // Optional for existing images
    url: string;
    thumbnailUrl?: string;
    description?: string;
    tags: string[];
    isFavorite: boolean;
    order: number;
  }>;
  layout: AlbumLayout; // Use the proper AlbumLayout type
  customization: {
    backgroundColor: string;
    textColor: string;
    matColor?: string;
  };
  timing?: {
    slideshow?: {
      cycleDuration: number;
    };
    interactive?: {
      autoAdvance: boolean;
      autoAdvanceDuration: number;
      transitionSpeed: "fast" | "normal" | "smooth";
    };
  };
}

export const AlbumForm: React.FC<AlbumFormProps> = ({
  album,
  mode: propMode,
  onSave,
  loading = false,
}) => {
  // Determine mode from props or data
  const mode = propMode || (album ? "edit" : "create");
  const [currentStep, setCurrentStep] = useState(0);
  const [previewIndex, setPreviewIndex] = useState(0);

  // Helper function to convert existing album images to wizard format
  const convertAlbumImagesToWizardFormat = (
    albumImages: unknown[]
  ): FormData["images"] => {
    if (!albumImages) return [];

    return albumImages.map((img, index) => {
      if (typeof img === "string") {
        return {
          id: `existing-${index}`,
          url: img,
          thumbnailUrl: img,
          description: "",
          tags: [],
          isFavorite: false,
          order: index,
          // Don't create placeholder file for existing images - they're already uploaded
          file: undefined,
        };
      } else {
        const imgObj = img as {
          id?: string;
          url: string;
          description?: string;
        };
        return {
          id: imgObj.id || `existing-${index}`,
          url: imgObj.url,
          thumbnailUrl: imgObj.url,
          description: imgObj.description || "", // Use description for captions
          tags: [],
          isFavorite: false,
          order: index,
          // Don't create placeholder file for existing images - they're already uploaded
          file: undefined,
        };
      }
    });
  };

  // Initialize form data from album (memoized to prevent infinite loops)
  const initialFormData = useMemo((): FormData => {
    // If we have album prop
    if (album) {
      const convertedImages = convertAlbumImagesToWizardFormat(
        album.images || []
      );

      return {
        title: album.title || "",
        description: album.description || "",
        privacy: album.privacy || "private", // Use album's privacy or default to private
        tags: album.tags || [],
        category: "",
        images: convertedImages,
        layout:
          album.layout || createLayout("slideshow", album.images?.length || 1), // Use the album's layout or default to slideshow
        customization: {
          backgroundColor: album.matConfig?.backgroundColor || "#ffffff",
          textColor: album.matConfig?.textColor || "#000000",
          matColor: album.matConfig?.matColor || "#000000",
        },
        timing: {
          slideshow: {
            cycleDuration: 5,
          },
          interactive: {
            autoAdvance: false,
            autoAdvanceDuration: 5,
            transitionSpeed: "normal",
          },
        },
      };
    }

    // Default empty form data
    return {
      title: "",
      description: "",
      privacy: "private", // Default to private for security
      tags: [],
      category: "",
      images: [],
      layout: createLayout("slideshow", 1), // Default to slideshow layout
      customization: {
        backgroundColor: "#ffffff",
        textColor: "#000000",
        matColor: "#000000",
      },
      timing: {
        slideshow: {
          cycleDuration: 5,
        },
        interactive: {
          autoAdvance: false,
          autoAdvanceDuration: 5,
          transitionSpeed: "normal",
        },
      },
    };
  }, [album]); // Only recalculate when album changes

  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isInitialized, setIsInitialized] = useState(false);

  // Update form data when album prop changes (for edit mode) - but only on initial load
  useEffect(() => {
    // Only update if album exists and we haven't initialized yet
    if (album && !isInitialized) {
      const convertedImages = convertAlbumImagesToWizardFormat(
        album.images || []
      );

      const albumFormData: FormData = {
        title: album.title || "",
        description: album.description || "",
        privacy: album.privacy || "private",
        tags: album.tags || [],
        category: "",
        images: convertedImages,
        layout:
          album.layout || createLayout("slideshow", album.images?.length || 1),
        customization: {
          backgroundColor: album.matConfig?.backgroundColor || "#ffffff",
          textColor: album.matConfig?.textColor || "#000000",
        },
        timing: {
          slideshow: {
            cycleDuration: album.cycleDuration || 5,
          },
          interactive: {
            autoAdvance: false,
            autoAdvanceDuration: 5,
            transitionSpeed: "normal",
          },
        },
      };

      const getUpdatedStepValidations = (): Record<number, boolean> => {
        return {
          0: !!(albumFormData.title && albumFormData.title.length >= 3), // Basic info valid if title exists
          1: !!(albumFormData.images && albumFormData.images.length > 0), // Images valid if any exist
          2: true, // Layout & Customization always valid (has defaults)
        };
      };

      setFormData(albumFormData);
      setStepValidations(getUpdatedStepValidations());
      setIsInitialized(true);
    }
  }, [album, isInitialized]);

  // Use ref to store latest formData for stable callbacks (updated directly, no useEffect needed)
  const formDataRef = useRef(formData);
  formDataRef.current = formData; // Update ref directly on every render

  // Initialize step validations dynamically based on existing data
  const getInitialStepValidations = (): Record<number, boolean> => {
    return {
      0: !!(initialFormData.title && initialFormData.title.length >= 3), // Basic info valid if title exists
      1: !!(initialFormData.images && initialFormData.images.length > 0), // Images valid if any exist
      2: true, // Layout & Customization always valid (has defaults)
    };
  };

  const [stepValidations, setStepValidations] = useState<
    Record<number, boolean>
  >(getInitialStepValidations());

  // Form data update handlers with refs to prevent recreation
  const handleBasicInfoChangeRef = useRef<(data: BasicInfoData) => void>(
    () => {}
  );
  handleBasicInfoChangeRef.current = (data: BasicInfoData) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const handleBasicInfoChange = useCallback((data: BasicInfoData) => {
    handleBasicInfoChangeRef.current(data);
  }, []);

  const handleImagesChange = useCallback((images: FormData["images"]) => {
    setFormData((prev) => ({ ...prev, images }));
  }, []);

  // Step validation handlers (memoized and stable)
  const handleStepValidation = useCallback(
    (stepIndex: number, isValid: boolean) => {
      setStepValidations((prev) => ({ ...prev, [stepIndex]: isValid }));
    },
    []
  );

  // Create stable validation callbacks to prevent infinite loops
  const handleBasicInfoValidation = useCallback(
    (isValid: boolean) => handleStepValidation(0, isValid),
    [handleStepValidation]
  );

  const handleImagesValidation = useCallback(
    (isValid: boolean) => handleStepValidation(1, isValid),
    [handleStepValidation]
  );

  // Removed unused validation handlers - these are handled by component refs

  // Navigation handlers with proper dependencies (memoized)
  const handleNext = useCallback(() => {
    const totalSteps = 4; // We have 4 steps total
    setCurrentStep((prev) => (prev < totalSteps - 1 ? prev + 1 : prev));
  }, []);

  const handlePrev = useCallback(() => {
    setCurrentStep((prev) => (prev > 0 ? prev - 1 : prev));
  }, []);

  // Function to clean up blob URLs to prevent memory leaks
  const cleanupBlobUrls = useCallback((images: FormData["images"]) => {
    images.forEach((img) => {
      if (img.url && img.url.startsWith("blob:")) {
        URL.revokeObjectURL(img.url);
      }
      if (img.thumbnailUrl && img.thumbnailUrl.startsWith("blob:")) {
        URL.revokeObjectURL(img.thumbnailUrl);
      }
    });
  }, []);

  // Function to reset form to default state
  const handleResetToDefaults = useCallback(() => {
    // Clean up existing blob URLs before resetting
    cleanupBlobUrls(formData.images);

    // Reset form data to initial defaults
    const freshFormData = {
      title: "",
      description: "",
      privacy: "public" as const,
      tags: [],
      category: "",
      images: [],
      layout: createLayout("grid", 1),
      customization: {
        backgroundColor: "#ffffff",
        textColor: "#000000",
      },
    };

    setFormData(freshFormData);
    formDataRef.current = freshFormData;

    // Reset step validations
    setStepValidations({
      0: false, // Basic info invalid until title is entered
      1: false, // Images invalid until images are added
      2: true, // Layout & Finalize always valid (has defaults)
    });
  }, [formData.images, cleanupBlobUrls]);

  const handleStepChange = useCallback(
    (step: number) => {
      setCurrentStep(step);

      // Clean up when going back to step 1 (Basic Info)
      if (step === 0 && currentStep > 0) {
        handleResetToDefaults();
      }
    },
    [currentStep, handleResetToDefaults]
  );

  // Function to start completely over (reset and go to step 1)
  const handleStartOver = useCallback(() => {
    const shouldReset = confirm(
      "Are you sure you want to start over? This will clear all your progress and return to the beginning."
    );

    if (shouldReset) {
      handleResetToDefaults();
      setCurrentStep(0);
    }
  }, [handleResetToDefaults]);

  // Cleanup blob URLs on component unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      cleanupBlobUrls(formData.images);
    };
  }, [cleanupBlobUrls, formData.images]); // Include dependencies

  const handleSkipStep = useCallback(() => {
    const totalSteps = 4; // We have 4 steps total
    setCurrentStep((prev) => (prev < totalSteps - 1 ? prev + 1 : prev));
  }, []);

  // Save handler (optimized to prevent unnecessary re-renders)
  const handleSave = useCallback(async () => {
    const currentFormData = formDataRef.current;

    // Validate payload size before saving
    const payloadValidation = validatePayloadSize(currentFormData.images);
    if (!payloadValidation.isValid) {
      // Offer automatic optimization
      const shouldOptimize = confirm(
        `${payloadValidation.error}\n\nWould you like to automatically optimize the images to reduce the payload size? This may reduce image quality but will ensure successful upload.`
      );

      if (shouldOptimize) {
        try {
          const optimizedImages = await optimizeImagesForPayloadLimit(
            currentFormData.images
          );

          // Convert optimized images back to FormData format
          const updatedImages = currentFormData.images.map(
            (originalImg, index) => {
              const optimizedImg = optimizedImages[index];
              return {
                ...originalImg,
                file: optimizedImg.file || originalImg.file,
                url: optimizedImg.file
                  ? URL.createObjectURL(optimizedImg.file)
                  : originalImg.url,
              };
            }
          );

          const newFormData = { ...currentFormData, images: updatedImages };
          formDataRef.current = newFormData;
          setFormData(newFormData);

          // Validate again after optimization
          const newValidation = validatePayloadSize(updatedImages);
          if (!newValidation.isValid) {
            alert(
              `Even after optimization, the payload is still too large (${newValidation.totalSizeMB.toFixed(
                1
              )}MB). Please remove some images and try again.`
            );
            return;
          }
        } catch (error) {
          console.error("Failed to optimize images:", error);
          alert(
            "Failed to optimize images. Please try reducing the number of images or manually compress them."
          );
          return;
        }
      } else {
        return; // User cancelled
      }
    }

    // Create album data for save
    const albumData: Omit<Album, "id" | "createdAt" | "updatedAt"> & {
      timing?: {
        slideshow?: { cycleDuration: number };
        interactive?: {
          autoAdvance: boolean;
          autoAdvanceDuration: number;
          transitionSpeed: "fast" | "normal" | "smooth";
        };
      };
    } = {
      title: currentFormData.title,
      description: currentFormData.description,
      privacy: currentFormData.privacy, // Include privacy setting
      tags: currentFormData.tags, // Include tags
      // Don't set coverUrl here - let the calling code handle it after upload with proper Firebase URLs
      // If we ever need to set it here, use: coverUrl: isValidFirebaseUrl(currentFormData.images[0]?.url) ? currentFormData.images[0]?.url : undefined,
      images: currentFormData.images.map((img) => ({
        id: img.id,
        // Use Firebase Storage URL if valid, otherwise use placeholder that calling code will replace
        // This prevents blob URLs from being saved to Firestore (causing size limit issues)
        url: isFirebaseStorageUrl(img.url)
          ? img.url
          : `pending-upload-${img.id}`,
        description: img.description || "",
        // Include file for upload process
        file: img.file,
      })),
      layout: currentFormData.layout, // Use the layout directly - it's already in the correct format
      matConfig: {
        matWidth: 20,
        matColor: currentFormData.customization.matColor || "#000000",
        backgroundColor: currentFormData.customization.backgroundColor,
        textColor: currentFormData.customization.textColor,
      },
      cycleDuration: currentFormData.timing?.slideshow?.cycleDuration || 5, // Use timing from form or default to 5 seconds
    };

    await onSave(albumData);
  }, [onSave]);

  // Create memoized basic info value to prevent unnecessary re-renders
  const basicInfoValue = useMemo(
    () => ({
      title: formData.title,
      privacy: formData.privacy,
      tags: formData.tags,
    }),
    [formData.title, formData.privacy, formData.tags]
  );

  // Create refs to always access current values without recreating component
  const currentBasicInfoValueRef = useRef(basicInfoValue);
  const currentHandleBasicInfoChangeRef = useRef(handleBasicInfoChange);
  const currentHandleBasicInfoValidationRef = useRef(handleBasicInfoValidation);

  // Update refs on every render
  currentBasicInfoValueRef.current = basicInfoValue;
  currentHandleBasicInfoChangeRef.current = handleBasicInfoChange;
  currentHandleBasicInfoValidationRef.current = handleBasicInfoValidation;

  // Create completely stable BasicInfo component - never changes reference
  const BasicInfoComponent = useMemo(() => {
    const Component = () => (
      <WizardBasicInfo
        value={currentBasicInfoValueRef.current}
        onChange={currentHandleBasicInfoChangeRef.current}
        onValidationChange={currentHandleBasicInfoValidationRef.current}
      />
    );
    Component.displayName = "BasicInfoComponent";
    return Component;
  }, []); // Empty deps - NEVER recreate this component

  // Handler for auto-optimization request from PayloadSizeIndicator
  const handleOptimizeRequest = useCallback(async () => {
    const currentFormData = formDataRef.current;

    try {
      const optimizedImages = await optimizeImagesForPayloadLimit(
        currentFormData.images
      );

      // Convert optimized images back to FormData format
      const updatedImages = currentFormData.images.map((originalImg, index) => {
        const optimizedImg = optimizedImages[index];
        return {
          ...originalImg,
          file: optimizedImg.file || originalImg.file,
          url: optimizedImg.file
            ? URL.createObjectURL(optimizedImg.file)
            : originalImg.url,
        };
      });

      const newFormData = { ...currentFormData, images: updatedImages };
      formDataRef.current = newFormData;
      setFormData(newFormData);
    } catch (error) {
      console.error("Failed to optimize images:", error);
      alert(
        "Failed to optimize images. Please try reducing the number of images or manually compress them."
      );
    }
  }, []);

  const ImagesComponent = useCallback(
    () => (
      <div className="space-y-4">
        <WizardImages
          value={formData.images}
          onChange={handleImagesChange}
          onValidationChange={handleImagesValidation}
        />
        <PayloadSizeIndicator
          images={formData.images}
          onOptimizeRequest={handleOptimizeRequest}
        />
      </div>
    ),
    [
      formData.images,
      handleImagesChange,
      handleImagesValidation,
      handleOptimizeRequest,
    ]
  );

  const LayoutAndCustomizeComponent = useCallback(
    () => (
      <div className="space-y-4">
        {/* Live Preview - Always at top, most important */}
        <AlbumPreview
          images={formData.images}
          layout={formData.layout}
          customization={formData.customization}
          title={formData.title}
          previewIndex={previewIndex}
          onPreviewIndexChange={setPreviewIndex}
        />

        {/* Controls Grid - Unified card */}
        <div className="bg-white dark:bg-neutral-800 rounded-xl p-3 space-y-4 shadow-sm border border-neutral-200 dark:border-neutral-700">
          {/* Layout Type Toggle */}
          <div>
            <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-2 block">
              Layout
            </label>
            <AlbumLayoutSection
              images={formData.images}
              currentLayout={formData.layout}
              onLayoutChange={(layout) =>
                setFormData((prev) => ({ ...prev, layout }))
              }
              timing={formData.timing}
              onTimingChange={(timing) =>
                setFormData((prev) => ({ ...prev, timing }))
              }
            />
          </div>

          {/* Color Controls - Centered row */}
          <div>
            <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-2 block">
              Colors
            </label>
            <div className="flex justify-center gap-4">
              {formData.layout.type !== "slideshow" && (
                <ColorPicker
                  label="Background"
                  value={formData.customization.backgroundColor}
                  onChange={(color) =>
                    setFormData((prev) => ({
                      ...prev,
                      customization: {
                        ...prev.customization,
                        backgroundColor: color,
                      },
                    }))
                  }
                  compact
                />
              )}
              <ColorPicker
                label="Mat"
                value={formData.customization.matColor || "#000000"}
                onChange={(color) =>
                  setFormData((prev) => ({
                    ...prev,
                    customization: {
                      ...prev.customization,
                      matColor: color,
                    },
                  }))
                }
                compact
              />
              <ColorPicker
                label="Text"
                value={formData.customization.textColor}
                onChange={(color) =>
                  setFormData((prev) => ({
                    ...prev,
                    customization: {
                      ...prev.customization,
                      textColor: color,
                    },
                  }))
                }
                compact
              />
            </div>
          </div>

          {/* Quick Themes */}
          <div>
            <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-2 block">
              Themes
            </label>
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
              {[
                {
                  bg: "#ffffff",
                  mat: "#000000",
                  text: "#000000",
                  name: "Light",
                },
                {
                  bg: "#000000",
                  mat: "#ffffff",
                  text: "#ffffff",
                  name: "Dark",
                },
                {
                  bg: "#1e293b",
                  mat: "#94a3b8",
                  text: "#f1f5f9",
                  name: "Slate",
                },
                {
                  bg: "#fef3c7",
                  mat: "#92400e",
                  text: "#78350f",
                  name: "Warm",
                },
              ].map((theme) => (
                <button
                  key={theme.name}
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      customization: {
                        ...prev.customization,
                        backgroundColor: theme.bg,
                        matColor: theme.mat,
                        textColor: theme.text,
                      },
                    }))
                  }
                  className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-neutral-200 dark:border-neutral-600 hover:border-blue-400 transition-colors bg-white dark:bg-neutral-700"
                >
                  <div className="flex -space-x-1">
                    <div
                      className="w-3 h-3 rounded-full border border-white"
                      style={{ backgroundColor: theme.bg }}
                    />
                    <div
                      className="w-3 h-3 rounded-full border border-white"
                      style={{ backgroundColor: theme.mat }}
                    />
                  </div>
                  <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                    {theme.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    ),
    [formData, setFormData, previewIndex]
  );

  // Create wizard steps with stable components
  const steps: WizardStep[] = useMemo(
    () => [
      {
        id: "basics",
        title: "Basic Information",
        description: "Start with the essential details for your album",
        icon: <SparklesIcon className="w-6 h-6" />,
        component: BasicInfoComponent,
        estimatedTime: "1 min",
        validation: () => stepValidations[0],
      },
      {
        id: "images",
        title: "Add Images",
        description: "Upload and organize your photos",
        icon: <PhotoIcon className="w-6 h-6" />,
        component: ImagesComponent,
        estimatedTime: "3-5 min",
        validation: () => stepValidations[1],
      },
      {
        id: "layout-customize",
        title: "Layout & Finalize",
        description: "Choose layout, customize styling, and save",
        icon: <PaintBrushIcon className="w-6 h-6" />,
        component: LayoutAndCustomizeComponent,
        estimatedTime: "2-3 min",
        validation: () => stepValidations[2],
      },
    ],
    [
      BasicInfoComponent,
      ImagesComponent,
      LayoutAndCustomizeComponent,
      stepValidations,
    ]
  );

  return (
    <AlbumCreationWizard
      steps={steps}
      currentStep={currentStep}
      onStepChange={handleStepChange}
      onNext={handleNext}
      onPrev={handlePrev}
      onSkipStep={handleSkipStep}
      onStartOver={handleStartOver}
      onSave={handleSave}
      loading={loading}
      formData={formData}
      mode={mode}
    />
  );
};

export default AlbumForm;
