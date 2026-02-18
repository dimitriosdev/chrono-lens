/**
 * useSlideshow Hook
 *
 * Custom hook for managing slideshow state and navigation.
 * Handles image cycling, layout management, and image preloading.
 */

import React from "react";
import { Album } from "@/shared/types/album";
import {
  AlbumLayout,
  createLayout,
  LayoutType,
} from "@/features/albums/constants/AlbumLayout";
import { useImagePreload } from "@/shared/hooks/useImagePreload";

/** Default number of images to preload ahead/behind current */
const DEFAULT_PRELOAD_RANGE = 2;

/** Default slideshow duration in seconds */
const DEFAULT_SLIDESHOW_DURATION = 5;

/**
 * Options for configuring the slideshow hook
 */
interface SlideshowOptions {
  /** Album data to display */
  album?: Album;
  /** Whether to auto-advance slides */
  autoPlay?: boolean;
  /** Whether to preload nearby images */
  enablePreloading?: boolean;
}

/**
 * Current slideshow state
 */
interface SlideshowState {
  currentIndex: number;
  images: string[];
  imageDescriptions: string[];
  layout: AlbumLayout;
  isPlaying: boolean;
}

/**
 * Available slideshow actions
 */
interface SlideshowActions {
  goToNext: () => void;
  goToPrevious: () => void;
  goToIndex: (index: number) => void;
  togglePlayback: () => void;
  setCurrentIndex: (index: number) => void;
  changeLayoutType: (layoutType: LayoutType) => void;
}

/**
 * Complete return type for the slideshow hook
 */
interface SlideshowHookReturn extends SlideshowState, SlideshowActions {
  currentImage: string | null;
  currentDescription: string;
  hasNext: boolean;
  hasPrevious: boolean;
  totalImages: number;
  isCurrentImageLoaded: boolean;
  isCurrentImageLoading: boolean;
  preloadProgress: number;
}

/**
 * Hook for managing slideshow playback, navigation, and image preloading
 *
 * @param options - Configuration options
 * @returns Slideshow state and actions
 */
export const useSlideshow = ({
  album,
  autoPlay = true,
  enablePreloading = true,
}: SlideshowOptions): SlideshowHookReturn => {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [isPlaying, setIsPlaying] = React.useState(autoPlay);

  // Use album's layout if available, otherwise default to slideshow
  const [layoutType, setLayoutType] = React.useState<LayoutType>(() => {
    return album?.layout?.type || "slideshow";
  });

  // Update layout type when album changes
  React.useEffect(() => {
    if (album?.layout?.type && album.layout.type !== layoutType) {
      setLayoutType(album.layout.type);
    }
  }, [album?.layout?.type, layoutType]);

  // Extract images and descriptions from album
  const images = React.useMemo(() => {
    return (album?.images || []).map((img) => img.url);
  }, [album?.images]);

  const imageDescriptions = React.useMemo(() => {
    return (album?.images || []).map((img) => img.description || "");
  }, [album?.images]);

  // Create layout based on current type and image count
  const layout: AlbumLayout = React.useMemo(() => {
    return createLayout(layoutType, images.length);
  }, [layoutType, images.length]);

  // Auto-advance slideshow
  React.useEffect(() => {
    if (layout.type !== "slideshow" || images.length <= 1 || !isPlaying) {
      return;
    }

    const duration = album?.cycleDuration ?? DEFAULT_SLIDESHOW_DURATION;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, duration * 1000);

    return () => clearInterval(timer);
  }, [layout.type, images.length, album?.cycleDuration, isPlaying]);

  // Reset current index when images change
  React.useEffect(() => {
    if (currentIndex >= images.length && images.length > 0) {
      setCurrentIndex(0);
    }
  }, [images.length, currentIndex]);

  // Actions
  const goToNext = React.useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const goToPrevious = React.useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  const goToIndex = React.useCallback(
    (index: number) => {
      if (index >= 0 && index < images.length) {
        setCurrentIndex(index);
      }
    },
    [images.length],
  );

  const togglePlayback = React.useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const changeLayoutType = React.useCallback((newLayoutType: LayoutType) => {
    setLayoutType(newLayoutType);
    setCurrentIndex(0);
  }, []);

  // Image preloading
  const preloadHook = useImagePreload({
    images,
    currentIndex,
    preloadRange: enablePreloading ? DEFAULT_PRELOAD_RANGE : 0,
  });

  // Computed values
  const currentImage = images[currentIndex] || null;
  const currentDescription = imageDescriptions[currentIndex] || "";
  const hasNext = images.length > 1;
  const hasPrevious = images.length > 1;
  const totalImages = images.length;

  // Preload state for current image
  const isCurrentImageLoaded = currentImage
    ? preloadHook.isImageLoaded(currentImage)
    : false;
  const isCurrentImageLoading = currentImage
    ? preloadHook.isImageLoading(currentImage)
    : false;

  // Calculate preload progress (percentage of nearby images loaded)
  const preloadProgress = React.useMemo(() => {
    if (!enablePreloading || images.length === 0) return 100;

    const imagesToCheck: string[] = [];

    // Add next and previous images within range
    for (let i = 1; i <= DEFAULT_PRELOAD_RANGE; i++) {
      const nextIndex = (currentIndex + i) % images.length;
      const prevIndex = (currentIndex - i + images.length) % images.length;
      if (images[nextIndex]) imagesToCheck.push(images[nextIndex]);
      if (images[prevIndex]) imagesToCheck.push(images[prevIndex]);
    }

    const uniqueImages = [...new Set(imagesToCheck)];
    const loadedCount = uniqueImages.filter((img) =>
      preloadHook.isImageLoaded(img),
    ).length;

    return uniqueImages.length > 0
      ? (loadedCount / uniqueImages.length) * 100
      : 100;
  }, [images, currentIndex, enablePreloading, preloadHook]);

  return {
    // State
    currentIndex,
    images,
    imageDescriptions,
    layout,
    isPlaying,

    // Computed
    currentImage,
    currentDescription,
    hasNext,
    hasPrevious,
    totalImages,

    // Preloading state
    isCurrentImageLoaded,
    isCurrentImageLoading,
    preloadProgress,

    // Actions
    goToNext,
    goToPrevious,
    goToIndex,
    togglePlayback,
    setCurrentIndex,
    changeLayoutType,
  };
};

export type { SlideshowOptions, SlideshowHookReturn };
