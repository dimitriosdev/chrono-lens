import React from "react";

interface ImagePreloadOptions {
  images: string[];
  currentIndex: number;
  preloadRange?: number; // How many images to preload ahead/behind
}

interface PreloadState {
  loadedImages: Set<string>;
  loadingImages: Set<string>;
  failedImages: Set<string>;
}

interface UseImagePreloadReturn extends PreloadState {
  preloadImage: (src: string) => Promise<void>;
  isImageLoaded: (src: string) => boolean;
  isImageLoading: (src: string) => boolean;
  hasImageFailed: (src: string) => boolean;
}

export const useImagePreload = ({
  images,
  currentIndex,
  preloadRange = 2,
}: ImagePreloadOptions): UseImagePreloadReturn => {
  const [state, setState] = React.useState<PreloadState>({
    loadedImages: new Set(),
    loadingImages: new Set(),
    failedImages: new Set(),
  });

  // Preload a single image
  const preloadImage = React.useCallback(
    async (src: string): Promise<void> => {
      // Skip if already loaded or loading
      if (state.loadedImages.has(src) || state.loadingImages.has(src)) {
        return;
      }

      setState((prev) => ({
        ...prev,
        loadingImages: new Set([...prev.loadingImages, src]),
      }));

      return new Promise((resolve, reject) => {
        const img = new Image();

        img.onload = () => {
          setState((prev) => ({
            ...prev,
            loadedImages: new Set([...prev.loadedImages, src]),
            loadingImages: new Set(
              [...prev.loadingImages].filter((s) => s !== src)
            ),
          }));
          resolve();
        };

        img.onerror = () => {
          setState((prev) => ({
            ...prev,
            failedImages: new Set([...prev.failedImages, src]),
            loadingImages: new Set(
              [...prev.loadingImages].filter((s) => s !== src)
            ),
          }));
          reject(new Error(`Failed to load image: ${src}`));
        };

        img.src = src;
      });
    },
    [state.loadedImages, state.loadingImages]
  );

  // Preload images around current index
  React.useEffect(() => {
    if (images.length === 0) return;

    const imagesToPreload: string[] = [];

    // Add current image (highest priority)
    if (images[currentIndex]) {
      imagesToPreload.push(images[currentIndex]);
    }

    // Add next and previous images within range
    for (let i = 1; i <= preloadRange; i++) {
      // Next images
      const nextIndex = (currentIndex + i) % images.length;
      if (images[nextIndex]) {
        imagesToPreload.push(images[nextIndex]);
      }

      // Previous images
      const prevIndex = (currentIndex - i + images.length) % images.length;
      if (images[prevIndex]) {
        imagesToPreload.push(images[prevIndex]);
      }
    }

    // Remove duplicates and preload
    const uniqueImages = [...new Set(imagesToPreload)];
    uniqueImages.forEach((src) => {
      preloadImage(src).catch(() => {
        // Silently handle preload failures
      });
    });
  }, [images, currentIndex, preloadRange, preloadImage]);

  const isImageLoaded = React.useCallback(
    (src: string) => state.loadedImages.has(src),
    [state.loadedImages]
  );
  const isImageLoading = React.useCallback(
    (src: string) => state.loadingImages.has(src),
    [state.loadingImages]
  );
  const hasImageFailed = React.useCallback(
    (src: string) => state.failedImages.has(src),
    [state.failedImages]
  );

  return {
    ...state,
    preloadImage,
    isImageLoaded,
    isImageLoading,
    hasImageFailed,
  };
};

export type { ImagePreloadOptions, UseImagePreloadReturn };
