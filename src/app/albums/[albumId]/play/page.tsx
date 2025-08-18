"use client";
import React from "react";
import { useParams, useRouter } from "next/navigation";
import { Album } from "@/entities/Album";
import { getAlbum } from "@/lib/firestore";
import { MatBoard } from "@/components/MatBoard";

const frameWidth = 400;
const frameHeight = 300;

function MatImage({
  src,
  matConfig,
  containerMode = false,
}: {
  src: string;
  matConfig: any;
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
        <img
          src={src}
          alt="Artwork"
          className="object-contain w-full h-full rounded"
          onLoad={handleImgLoad}
          style={{ maxWidth: "100%", maxHeight: "100%", border: "none" }}
        />
      </div>
    </div>
  );
}

const SlideshowPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const albumId = params?.albumId as string;
  const [album, setAlbum] = React.useState<Album | undefined>(undefined);
  const [loading, setLoading] = React.useState(true);
  const [current, setCurrent] = React.useState(0);
  React.useEffect(() => {
    async function fetchAlbum() {
      setLoading(true);
      try {
        const data = await getAlbum(albumId);
        setAlbum(data || undefined);
      } catch {
        setAlbum(undefined);
      }
      setLoading(false);
    }
    if (albumId) fetchAlbum();
  }, [albumId]);

  const images = album?.images || [];
  const matConfig = album?.matConfig;

  React.useEffect(() => {
    if (images.length > 1) {
      const timer = setInterval(() => {
        setCurrent((prev) => (prev + 1) % images.length);
      }, 2000);
      return () => clearInterval(timer);
    }
  }, [images.length]);

  const handleBack = React.useCallback(() => {
    router.push("/albums");
  }, [router]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        <div className="text-white text-lg font-semibold">Loading album...</div>
      </div>
    );
  }
  if (!album) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        <div className="text-white text-lg font-semibold">Album not found.</div>
      </div>
    );
  }

  const layout = album?.layout || { type: "slideshow" };

  // Grid layout: 3 Portraits
  if (layout.type === "grid") {
    const requiredCount = layout.grid?.cols || 3;
    const portraitImages = images.slice(0, requiredCount);
    const allPortrait = portraitImages.length === requiredCount;
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50">
        <div
          className="grid w-full h-full mx-auto px-2 md:px-4"
          style={{
            maxWidth: "1200px",
            width: "100%",
            height: "100%",
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "1.5vw",
            alignItems: "center",
            justifyItems: "center",
            paddingTop: "2vh",
            paddingBottom: "6vh",
          }}
        >
          {portraitImages.map((img: string) => (
            <div
              key={img}
              style={{
                width: "100%",
                height: "75vh",
                maxWidth: "350px",
                maxHeight: "600px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "transparent",
                margin: "0 auto",
              }}
            >
              <MatImage src={img} matConfig={matConfig} containerMode={true} />
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
            {album.title}
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
          {album.title}
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
