"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { Album } from "@/entities/Album";
import { getAlbum } from "@/lib/firestore";
import { useAuth } from "@/context/AuthContext";
import { AlbumLayout } from "@/features/albums/AlbumLayout";
import Image from "next/image";

function MatImage({
  src,
  matConfig,
  containerMode = false,
}: {
  src: string;
  matConfig: { matWidth?: number; matColor?: string };
  containerMode?: boolean;
}) {
  const matPercent = matConfig?.matWidth ?? 5;
  const matColor = matConfig?.matColor ?? "#000";
  const isNoMat = matColor === "#000";
  const [imgDims, setImgDims] = React.useState({ width: 1, height: 1 });

  // Use different sizing for grid vs slideshow
  const frameW = containerMode
    ? 280
    : typeof window !== "undefined" && window.innerWidth
    ? window.innerWidth
    : 400;
  const frameH = containerMode
    ? 420
    : typeof window !== "undefined" && window.innerHeight
    ? window.innerHeight
    : 600;

  const handleImgLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.target as HTMLImageElement;
    setImgDims({ width: img.naturalWidth, height: img.naturalHeight });
  };

  // Adaptive mat calculation - reduce mat percentage for grid mode
  const adjustedMatPercent = containerMode
    ? Math.min(matPercent, 10)
    : matPercent;
  const imgAspect = imgDims.width / imgDims.height;
  const artworkArea = Math.min(frameW, frameH) * (1 - adjustedMatPercent / 100);
  let artworkWidth = artworkArea;
  let artworkHeight = artworkArea;
  if (frameW / frameH > imgAspect) {
    artworkHeight = frameH * (1 - adjustedMatPercent / 100);
    artworkWidth = artworkHeight * imgAspect;
  } else {
    artworkWidth = frameW * (1 - adjustedMatPercent / 100);
    artworkHeight = artworkWidth / imgAspect;
  }
  const matHorizontal = (frameW - artworkWidth) / 2;
  const matVertical = (frameH - artworkHeight) / 2;

  return (
    <div
      className="relative flex items-center justify-center"
      style={{
        background: isNoMat ? "#374151" : matColor, // Use gray-700 for no mat
        width: `${frameW}px`,
        height: `${frameH}px`,
        border: "none",
        boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
        flexShrink: 0,
      }}
    >
      {/* Outer mat (skip if No Mat) */}
      {!isNoMat && (
        <div
          className="absolute rounded-xl"
          style={{
            top: 0,
            left: 0,
            width: `${frameW}px`,
            height: `${frameH}px`,
            background: matColor,
            boxSizing: "border-box",
            boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
            zIndex: 2,
            border: "none",
          }}
          aria-hidden="true"
        />
      )}
      {/* Artwork area */}
      <div
        className="absolute flex items-center justify-center rounded-xl overflow-hidden"
        style={{
          top: `${matVertical}px`,
          left: `${matHorizontal}px`,
          width: `${artworkWidth}px`,
          height: `${artworkHeight}px`,
          background: isNoMat ? "#000" : "#fff",
          boxShadow: !isNoMat ? "0 0 0 1px #ccc" : undefined,
          zIndex: 4,
        }}
      >
        <Image
          src={src}
          alt="Artwork"
          className="object-contain w-full h-full rounded"
          onLoad={handleImgLoad}
          style={{ maxWidth: "100%", maxHeight: "100%", border: "none" }}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
    </div>
  );
}

const SlideshowPage: React.FC = () => {
  const { isSignedIn, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const albumId = params?.albumId as string;
  const [album, setAlbum] = React.useState<Album | undefined>(undefined);
  const [current, setCurrent] = React.useState(0);
  const [gridImages, setGridImages] = React.useState<string[]>([]);
  const [nextSlotIndex, setNextSlotIndex] = React.useState(0);
  const [globalImageIndex, setGlobalImageIndex] = React.useState(3); // Start from image 3 (after initial 0,1,2)

  React.useEffect(() => {
    if (!loading && !isSignedIn) {
      router.replace("/");
    }
  }, [isSignedIn, loading, router]);

  React.useEffect(() => {
    async function fetchAlbum() {
      try {
        const data = await getAlbum(albumId);
        setAlbum(data || undefined);
      } catch {
        setAlbum(undefined);
      }
    }
    if (albumId) fetchAlbum();
  }, [albumId]);

  const images = React.useMemo(() => {
    const albumImages = album?.images || [];
    // Handle both old format (string[]) and new format (AlbumImage[])
    return albumImages.map((img) => (typeof img === "string" ? img : img.url));
  }, [album?.images]);

  const imageDescriptions = React.useMemo(() => {
    const albumImages = album?.images || [];
    // Get descriptions for new format, empty string for old format
    const descriptions = albumImages.map((img) =>
      typeof img === "string" ? "" : img.description || ""
    );
    return descriptions;
  }, [album?.images]);

  const currentImageDescription = imageDescriptions[current] || "";
  const matConfig = album?.matConfig || { matWidth: 5, matColor: "#000" };
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

  // Initialize grid with first images based on layout
  React.useEffect(() => {
    if (
      images.length > 0 &&
      (layout?.type === "grid" || layout?.type === "custom")
    ) {
      const requiredCount =
        (layout?.grid?.rows || 1) * (layout?.grid?.cols || 3);
      setGridImages(images.slice(0, requiredCount));
      setGlobalImageIndex(requiredCount); // Start next image index after initial set
      setNextSlotIndex(0); // Start with slot 0
    }
  }, [images, layout]);

  // Individual image cycling for grid layout
  React.useEffect(() => {
    if (layout?.type === "grid" || layout?.type === "custom") {
      const requiredCount =
        (layout?.grid?.rows || 1) * (layout?.grid?.cols || 3);
      if (images.length > requiredCount) {
        const timer = setInterval(() => {
          setGridImages((prevGrid) => {
            const newGrid = [...prevGrid];
            // Replace image at current slot with next global image
            newGrid[nextSlotIndex] = images[globalImageIndex % images.length];
            return newGrid;
          });
          setNextSlotIndex((prev) => (prev + 1) % requiredCount);
          setGlobalImageIndex((prev) => prev + 1);
        }, matConfig.cycleDuration ?? 2000);
        return () => clearInterval(timer);
      }
    }
  }, [
    images,
    layout,
    nextSlotIndex,
    globalImageIndex,
    matConfig.cycleDuration,
  ]);

  const handleBack = React.useCallback(() => {
    router.push("/albums");
  }, [router]);

  // Slideshow interval effect (hook placement fix)
  React.useEffect(() => {
    if (layout?.type === "slideshow" && images.length > 1) {
      const timer = setInterval(() => {
        setCurrent((prev) => (prev + 1) % images.length);
      }, matConfig.cycleDuration ?? 2000);
      return () => clearInterval(timer);
    }
    // No interval for other layouts
    return undefined;
  }, [layout?.type, images.length, matConfig.cycleDuration]);

  if (loading || !isSignedIn) return null;

  // Grid layout: 3 Portraits, 6 Portraits, or custom layouts like Mosaic
  if (layout?.type === "grid" || layout?.type === "custom") {
    const rows = layout?.grid?.rows || 1;
    const cols = layout?.grid?.cols || 3;
    const requiredCount = rows * cols;
    const hasMoreImages = images.length > requiredCount;
    const displayImages =
      gridImages.length > 0 ? gridImages : images.slice(0, requiredCount);
    const allPortrait =
      displayImages.length === requiredCount || !hasMoreImages;

    // Modern responsive grid design
    const is6Portrait = requiredCount === 6;

    return (
      <div className="fixed inset-0 bg-gray-900 flex flex-col items-center justify-center z-50">
        <style jsx>{`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .image-fade-transition {
            animation: fadeIn 0.6s ease-out;
          }

          /* Mobile-first approach for better viewing */
          @media (max-width: 640px) {
            .mobile-grid-6 {
              grid-template-columns: repeat(2, 1fr) !important;
              grid-template-rows: repeat(2, 1fr) !important;
              gap: 6px !important;
              padding: 6px !important;
              height: calc(100vh - 100px) !important;
            }
            .mobile-grid-6 > div:nth-child(n + 5) {
              display: none !important;
            }
            .mobile-grid-6 .group {
              transform: scale(1.1) !important;
            }
            .mobile-grid-3 {
              grid-template-columns: repeat(1, 1fr) !important;
              grid-template-rows: repeat(2, 1fr) !important;
              gap: 12px !important;
              padding: 8px !important;
              height: calc(100vh - 100px) !important;
            }
            .mobile-grid-3 > div:nth-child(n + 3) {
              display: none !important;
            }
          }

          @media (min-width: 641px) and (max-width: 768px) {
            .mobile-grid-6 {
              grid-template-columns: repeat(2, 1fr) !important;
              grid-template-rows: repeat(3, 1fr) !important;
              gap: 10px !important;
              padding: 12px !important;
            }
            .mobile-grid-3 {
              grid-template-columns: repeat(1, 1fr) !important;
              grid-template-rows: repeat(3, 1fr) !important;
              gap: 12px !important;
              padding: 12px !important;
            }
          }

          @media (min-width: 769px) and (max-width: 1024px) {
            .mobile-grid-6 {
              grid-template-columns: repeat(3, 1fr) !important;
              grid-template-rows: repeat(2, 1fr) !important;
              gap: 14px !important;
              padding: 16px !important;
            }
          }
        `}</style>

        <div
          className={`w-full h-full max-w-7xl mx-auto p-2 sm:p-4 md:p-6 lg:p-8 ${
            is6Portrait
              ? "mobile-grid-6"
              : requiredCount === 3
              ? "mobile-grid-3"
              : ""
          }`}
        >
          <div
            className="grid w-full h-full gap-2 sm:gap-3 md:gap-4 lg:gap-6"
            style={{
              gridTemplateColumns: `repeat(${cols}, 1fr)`,
              gridTemplateRows: `repeat(${rows}, 1fr)`,
              height: "calc(100vh - 60px)",
            }}
          >
            {displayImages.map((img: string, index: number) => {
              // Get the description for the current image - find the correct index in the original images array
              const originalImageIndex = images.indexOf(img);
              const description =
                originalImageIndex >= 0
                  ? imageDescriptions[originalImageIndex]
                  : "";

              // For debugging - let's also show some fallback info
              const fallbackCaption = `Image ${index + 1}`;
              const displayCaption =
                description && description.trim()
                  ? description
                  : fallbackCaption;

              return (
                <div
                  key={`${img}-${globalImageIndex}-${nextSlotIndex}`}
                  className="relative w-full h-full min-h-0 overflow-hidden"
                >
                  <div className="group relative w-full h-full transition-all duration-300 image-fade-transition">
                    {/* Mat board container */}
                    <div className="relative w-full h-full flex items-center justify-center">
                      <MatImage
                        src={img}
                        matConfig={matConfig}
                        containerMode={true}
                      />
                    </div>

                    {/* Barely noticeable caption overlay at bottom of image */}
                    <div className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none">
                      <div className="relative">
                        {/* Subtle gradient fade */}
                        <div className="h-8 bg-gradient-to-t from-black/20 to-transparent"></div>
                        {/* Calligraphy caption text with Greek support */}
                        <p className="absolute bottom-0 left-0 right-0 text-white/80 text-sm text-center px-1 pb-1 overflow-hidden text-ellipsis whitespace-nowrap font-calligraphy">
                          {displayCaption}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {!allPortrait && (
          <div className="absolute bottom-12 sm:bottom-16 w-full text-center z-50 px-4">
            <span className="text-red-500 bg-black bg-opacity-80 px-3 sm:px-4 py-2 rounded-lg text-sm sm:font-semibold font-calligraphy">
              All images must be portrait for this layout. Please update your
              album.
            </span>
          </div>
        )}

        <div className="absolute bottom-2 sm:bottom-4 w-full text-center z-40 px-4">
          <h1 className="text-sm sm:text-base font-medium text-white opacity-70 font-calligraphy">
            {album?.title || "Untitled Album"}
          </h1>
        </div>

        <button
          type="button"
          onClick={handleBack}
          aria-label="Back to albums"
          className="absolute top-2 sm:top-4 left-2 sm:left-4 bg-gray-900 bg-opacity-80 text-white px-3 sm:px-4 py-2 rounded-lg shadow-lg text-sm sm:text-base font-semibold hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-white z-50 font-calligraphy"
        >
          Back
        </button>
      </div>
    );
  }

  // Slideshow layout
  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50">
      {images.length > 0 ? (
        <div className="w-screen h-screen flex items-center justify-center">
          <MatImage
            src={images[current]}
            matConfig={matConfig}
            containerMode={false}
          />
        </div>
      ) : (
        <div className="text-white font-calligraphy">No images in album.</div>
      )}
      <div className="absolute bottom-2 sm:bottom-4 w-full text-center z-40 px-4">
        <h1 className="text-sm sm:text-base font-medium text-white opacity-70 font-calligraphy">
          {album?.title || "Untitled Album"}
        </h1>
        {currentImageDescription && currentImageDescription.trim() && (
          <div className="mt-2 sm:mt-3 px-4 sm:px-6 py-2 sm:py-3 bg-black/60 backdrop-blur-sm rounded-xl mx-auto max-w-2xl">
            <p className="text-white text-sm sm:text-base leading-relaxed drop-shadow-lg font-calligraphy">
              {currentImageDescription}
            </p>
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={handleBack}
        aria-label="Back to albums"
        className="absolute top-2 sm:top-4 left-2 sm:left-4 bg-gray-900 bg-opacity-80 text-white px-3 sm:px-4 py-2 rounded-lg shadow-lg text-sm sm:text-base font-semibold hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-white z-50 font-calligraphy"
      >
        Back
      </button>
    </div>
  );
};

export default SlideshowPage;
