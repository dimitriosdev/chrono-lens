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
    ? Math.min(matPercent, 15)
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
      className="relative flex items-center justify-center bg-white"
      style={{
        background: matColor,
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

  const images = React.useMemo(() => album?.images || [], [album?.images]);
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
    if (images.length > 0 && layout?.type === "grid") {
      const requiredCount =
        (layout?.grid?.rows || 1) * (layout?.grid?.cols || 3);
      setGridImages(images.slice(0, requiredCount));
      setGlobalImageIndex(requiredCount); // Start next image index after initial set
      setNextSlotIndex(0); // Start with slot 0
    }
  }, [images, layout]);

  // Individual image cycling for grid layout
  React.useEffect(() => {
    if (layout?.type === "grid") {
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

  // Grid layout: 3 Portraits or 6 Portraits
  if (layout?.type === "grid") {
    const rows = layout?.grid?.rows || 1;
    const cols = layout?.grid?.cols || 3;
    const requiredCount = rows * cols;
    const hasMoreImages = images.length > requiredCount;
    const displayImages =
      gridImages.length > 0 ? gridImages : images.slice(0, requiredCount);
    const allPortrait =
      displayImages.length === requiredCount || !hasMoreImages;

    // Determine styling based on layout
    const is6Portrait = requiredCount === 6;
    const imageHeight = is6Portrait ? "35vh" : "75vh";
    const maxImageHeight = is6Portrait ? "300px" : "600px";
    const maxImageWidth = is6Portrait ? "200px" : "350px";

    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50">
        <style jsx>{`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: scale(0.95);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
          .image-fade-transition {
            transition: opacity 0.5s ease-in-out, transform 0.5s ease-in-out;
          }
        `}</style>
        <div
          className="grid w-full h-full mx-auto px-2 md:px-4"
          style={{
            maxWidth: "1200px",
            width: "100%",
            height: "100%",
            display: "grid",
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gridTemplateRows: `repeat(${rows}, 1fr)`,
            gap: is6Portrait ? "1vw" : "1.5vw",
            alignItems: "center",
            justifyItems: "center",
            paddingTop: "2vh",
            paddingBottom: "6vh",
          }}
        >
          {displayImages.map((img: string, index: number) => (
            <div
              key={`slot-${index}`}
              style={{
                width: "100%",
                height: imageHeight,
                maxWidth: maxImageWidth,
                maxHeight: maxImageHeight,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "transparent",
                margin: "0 auto",
              }}
            >
              <div className="image-fade-transition" key={img}>
                <MatImage
                  src={img}
                  matConfig={matConfig}
                  containerMode={true}
                />
              </div>
            </div>
          ))}
        </div>
        {!allPortrait && (
          <div className="absolute bottom-16 w-full text-center z-50">
            <span className="text-red-500 bg-black bg-opacity-80 px-4 py-2 rounded-lg font-semibold">
              All images must be portrait for this layout. Please update your
              album.
            </span>
          </div>
        )}
        <div className="absolute bottom-4 w-full text-center z-40">
          <h1 className="text-base font-medium text-white opacity-70">
            {album?.title || "Untitled Album"}
          </h1>
        </div>
        <button
          type="button"
          onClick={handleBack}
          aria-label="Back to albums"
          className="absolute top-4 left-4 bg-gray-900 bg-opacity-80 text-white px-4 py-2 rounded-lg shadow-lg text-base font-semibold hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-white z-50"
        >
          ←
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
        <div className="text-white">No images in album.</div>
      )}
      <div className="absolute bottom-4 w-full text-center z-40">
        <h1 className="text-base font-medium text-white opacity-70">
          {album?.title || "Untitled Album"}
        </h1>
      </div>
      <button
        type="button"
        onClick={handleBack}
        aria-label="Back to albums"
        className="absolute top-4 left-4 bg-gray-900 bg-opacity-80 text-white px-4 py-2 rounded-lg shadow-lg text-base font-semibold hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-white z-50"
      >
        ←
      </button>
    </div>
  );
};

export default SlideshowPage;
