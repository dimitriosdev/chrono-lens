import React from "react";
import { Album } from "@/features/albums/types/Album";
import { AlbumLayout } from "@/features/albums/constants/AlbumLayout";
import { useImagePreload } from "@/shared/hooks/useImagePreload";

interface SlideshowOptions {
  album?: Album;
  autoPlay?: boolean;
  enablePreloading?: boolean;
}

interface SlideshowState {
  currentIndex: number;
  images: string[];
  imageDescriptions: string[];
  layout: AlbumLayout;
  isPlaying: boolean;
}

interface SlideshowActions {
  goToNext: () => void;
  goToPrevious: () => void;
  goToIndex: (index: number) => void;
  togglePlayback: () => void;
  setCurrentIndex: (index: number) => void;
}

interface SlideshowHookReturn extends SlideshowState, SlideshowActions {
  currentImage: string | null;
  currentDescription: string;
  hasNext: boolean;
  hasPrevious: boolean;
  totalImages: number;
  // Image preloading state
  isCurrentImageLoaded: boolean;
  isCurrentImageLoading: boolean;
  preloadProgress: number; // Percentage of nearby images preloaded
}

export const useSlideshow = ({
  album,
  autoPlay = true,
  enablePreloading = true,
}: SlideshowOptions): SlideshowHookReturn => {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [isPlaying, setIsPlaying] = React.useState(autoPlay);

  // Extract images and descriptions from album
  const images = React.useMemo(() => {
    const albumImages = album?.images || [];
    // Handle both old format (string[]) and new format (AlbumImage[])
    return albumImages.map((img) => (typeof img === "string" ? img : img.url));
  }, [album?.images]);

  const imageDescriptions = React.useMemo(() => {
    const albumImages = album?.images || [];
    // Get descriptions for new format, empty string for old format
    return albumImages.map((img) =>
      typeof img === "string" ? "" : img.description || ""
    );
  }, [album?.images]);

  const layout: AlbumLayout = React.useMemo(
    () =>
      album?.layout || {
        type: "slideshow",
        name: "Default",
        description: "Default slideshow",
        grid: { rows: 1, cols: 1 },
      },
    [album?.layout]
  );

  // Auto-advance slideshow
  React.useEffect(() => {
    if (layout?.type === "slideshow" && images.length > 1 && isPlaying) {
      const slideshowDuration = album?.timing?.slideshow?.cycleDuration ?? 5;
      const timer = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
      }, slideshowDuration * 1000);

      return () => clearInterval(timer);
    }
  }, [
    layout?.type,
    images.length,
    album?.timing?.slideshow?.cycleDuration,
    isPlaying,
  ]);

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
    [images.length]
  );

  const togglePlayback = React.useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  // Image preloading
  const preloadHook = useImagePreload({
    images,
    currentIndex,
    preloadRange: enablePreloading ? 2 : 0,
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

    const preloadRange = 2;
    const imagesToCheck: string[] = [];

    // Add next and previous images within range
    for (let i = 1; i <= preloadRange; i++) {
      const nextIndex = (currentIndex + i) % images.length;
      const prevIndex = (currentIndex - i + images.length) % images.length;
      if (images[nextIndex]) imagesToCheck.push(images[nextIndex]);
      if (images[prevIndex]) imagesToCheck.push(images[prevIndex]);
    }

    const uniqueImages = [...new Set(imagesToCheck)];
    const loadedCount = uniqueImages.filter((img) =>
      preloadHook.isImageLoaded(img)
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
  };
};

export type { SlideshowOptions, SlideshowHookReturn };
