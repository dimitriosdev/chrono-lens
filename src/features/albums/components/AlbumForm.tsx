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
  EyeIcon,
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
import { generateShareToken as generateToken } from "@/shared/utils/albumSharing";
import {
  validatePayloadSize,
  optimizeImagesForPayloadLimit,
  isFirebaseStorageUrl,
} from "../utils/imageProcessing";
import { PayloadSizeIndicator } from "./PayloadSizeIndicator";
import { matColors } from "@/features/albums/hooks/useColorPreferences";
import ColorPicker from "./ColorPicker";
import { FrameTexturePicker } from "./FrameTexturePicker";
import { FrameAssembly } from "@/shared/types/frameTextures";
import { FRAME_PRESETS } from "@/shared/constants/frameTextures";

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
  privacy: "public" | "private" | "shared";
  tags: string[];
  coverImageIndex?: number;
}

interface FormData {
  title: string;
  description: string;
  privacy: "public" | "private" | "shared";
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
    backgroundImage?: string;
    music?: string;
    frameAssembly?: FrameAssembly;
    useAdvancedFraming?: boolean;
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
  const [shareToken, setShareToken] = useState<string | undefined>(
    album?.shareToken
  );
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
          3: true, // Preview always valid
        };
      };

      setFormData(albumFormData);
      setShareToken(album.shareToken);
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
      3: true, // Preview always valid
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

    // Auto-generate share token when privacy is set to shared
    if (data.privacy === "shared" && !shareToken) {
      const token = generateToken(Date.now().toString());
      setShareToken(token);
    }
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
      2: true, // Layout always valid (has defaults)
      3: true, // Customization always valid (has defaults)
      4: true, // Preview always valid
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
      shareToken: shareToken, // Include share token if generated
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
  }, [onSave, shareToken]);

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
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
            Layout & Appearance
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400">
            Choose how your images will be displayed and customize the styling
          </p>
        </div>

        {/* Layout Section */}
        <div className="space-y-4">
          <h4 className="text-md font-medium text-neutral-900 dark:text-neutral-100">
            Choose Layout
          </h4>
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

        {/* Customization Section */}
        <div className="space-y-6 pt-6 border-t border-neutral-200 dark:border-neutral-700">
          <h4 className="text-md font-medium text-neutral-900 dark:text-neutral-100">
            Customize Appearance
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Background Color - hidden for slideshow layout */}
            {formData.layout.type !== "slideshow" && (
              <ColorPicker
                label="Background Color"
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
              />
            )}

            {/* Mat Color */}
            <ColorPicker
              label="Mat Color"
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
            />

            {/* Text Color */}
            <ColorPicker
              label="Text Color"
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
            />
          </div>

          {/* Frame Texture System */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
              Advanced Frame System
            </h4>
            <FrameTexturePicker
              assembly={
                formData.customization.frameAssembly ||
                FRAME_PRESETS[0].assembly
              }
              onAssemblyChange={(frameAssembly: FrameAssembly) =>
                setFormData((prev) => ({
                  ...prev,
                  customization: {
                    ...prev.customization,
                    frameAssembly,
                    useAdvancedFraming: true,
                  },
                }))
              }
            />
          </div>

          {/* Color presets for quick combinations */}
          <div>
            <h4 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-3">
              Quick Combinations
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                {
                  bg: "#ffffff",
                  mat: "#000000",
                  text: "#000000",
                  name: "Classic White",
                },
                {
                  bg: "#000000",
                  mat: "#f8f8f8",
                  text: "#ffffff",
                  name: "Dark Mode",
                },
                {
                  bg: "#f3f4f6",
                  mat: "#bfc2c3",
                  text: "#1f2937",
                  name: "Soft Gray",
                },
                {
                  bg: "#1e40af",
                  mat: "#f8f8f8",
                  text: "#ffffff",
                  name: "Deep Blue",
                },
              ].map((preset) => (
                <button
                  key={preset.name}
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      customization: {
                        ...prev.customization,
                        backgroundColor: preset.bg,
                        matColor: preset.mat,
                        textColor: preset.text,
                      },
                    }))
                  }
                  className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600 transition-colors group"
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <div
                      className="w-6 h-6 rounded border border-neutral-300"
                      style={{ backgroundColor: preset.bg }}
                      title="Background"
                    />
                    <div
                      className="w-6 h-6 rounded border border-neutral-300"
                      style={{ backgroundColor: preset.mat }}
                      title="Mat"
                    />
                    <div
                      className="w-6 h-6 rounded border border-neutral-300"
                      style={{ backgroundColor: preset.text }}
                      title="Text"
                    />
                  </div>
                  <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100 group-hover:text-blue-600">
                    {preset.name}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    ),
    [formData, setFormData]
  );

  const PreviewComponent = useCallback(
    () => (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
            Album Preview
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400">
            Review how your album will look to viewers
          </p>
        </div>

        <div
          className="rounded-lg p-8 min-h-[400px]"
          style={{
            backgroundColor: formData.customization.backgroundColor,
            color: formData.customization.textColor,
          }}
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">
              {formData.title || "Untitled Album"}
            </h2>
            {formData.description && (
              <p className="text-lg opacity-80">{formData.description}</p>
            )}
            <div className="flex items-center justify-center space-x-4 mt-4 text-sm opacity-60">
              <span>{formData.images.length} photos</span>
              <span>•</span>
              <span className="capitalize">{formData.layout.type} layout</span>
              {formData.privacy && (
                <>
                  <span>•</span>
                  <span className="capitalize">{formData.privacy}</span>
                </>
              )}
            </div>
          </div>

          {formData.images.length > 0 && (
            <div className="space-y-6">
              {/* Layout and Colors Summary */}
              <div className="bg-black/10 dark:bg-white/10 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <strong>Layout:</strong>{" "}
                    {formData.layout.name || formData.layout.type}
                  </div>
                  <div>
                    <strong>Mat Color:</strong>{" "}
                    <span className="inline-flex items-center gap-2">
                      <span
                        className="w-4 h-4 rounded border border-black/20"
                        style={{
                          backgroundColor:
                            formData.customization.matColor || "#000000",
                        }}
                      />
                      {matColors.find(
                        (c) => c.color === formData.customization.matColor
                      )?.name || "Custom"}
                    </span>
                  </div>
                  <div>
                    <strong>Background:</strong>{" "}
                    <span className="inline-flex items-center gap-2">
                      <span
                        className="w-4 h-4 rounded border border-black/20"
                        style={{
                          backgroundColor:
                            formData.customization.backgroundColor,
                        }}
                      />
                      Background Color
                    </span>
                  </div>
                </div>
              </div>

              {/* Preview with Mat Effect */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {formData.images.slice(0, 8).map((image) => (
                  <div
                    key={image.id}
                    className="aspect-square p-3 rounded-lg"
                    style={{
                      backgroundColor:
                        formData.customization.matColor || "#000000",
                    }}
                  >
                    <div className="w-full h-full rounded overflow-hidden bg-white">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={image.thumbnailUrl || image.url}
                        alt={image.description || "Preview"}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                ))}
                {formData.images.length > 8 && (
                  <div
                    className="aspect-square p-3 rounded-lg flex items-center justify-center"
                    style={{
                      backgroundColor:
                        formData.customization.matColor || "#000000",
                    }}
                  >
                    <div className="w-full h-full rounded bg-white/20 flex items-center justify-center">
                      <span className="text-sm opacity-60">
                        +{formData.images.length - 8} more
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {formData.tags.length > 0 && (
            <div className="mt-8 text-center">
              <div className="inline-flex flex-wrap gap-2 justify-center">
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full text-xs opacity-60 bg-white/10"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    ),
    [formData]
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
        title: "Layout & Appearance",
        description: "Choose layout and customize styling",
        icon: <PaintBrushIcon className="w-6 h-6" />,
        component: LayoutAndCustomizeComponent,
        estimatedTime: "3-4 min",
        validation: () => stepValidations[2],
      },
      {
        id: "preview",
        title: "Preview & Finalize",
        description: "Review your album before saving",
        icon: <EyeIcon className="w-6 h-6" />,
        component: PreviewComponent,
        estimatedTime: "1 min",
        validation: () => stepValidations[3],
      },
    ],
    [
      BasicInfoComponent,
      ImagesComponent,
      LayoutAndCustomizeComponent,
      PreviewComponent,
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
