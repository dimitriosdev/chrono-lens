"use client";
import React from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";

// Temporary: import placeholderAlbums from AlbumGrid for demo
import { placeholderAlbums } from "../../../../features/albums/AlbumGrid";

const matColors = [
  { name: "Classic White", outer: "#f8f8f8", inner: "#4b306a" },
  { name: "Soft Yellow", outer: "#ffe88a", inner: "#222" },
  { name: "Modern Grey", outer: "#bfc2c3", inner: "#222" },
  { name: "Blush Pink", outer: "#f8e1ea", inner: "#d16ba5" },
];

type MatConfig = {
  selected: number;
  matWidth: number;
  doubleMat: boolean;
};

function MatImage({
  src,
  alt,
  matConfig,
}: {
  src: string;
  alt: string;
  matConfig?: MatConfig;
}) {
  const selected = matConfig?.selected ?? 0;
  const matPercent = matConfig?.matWidth ?? 5; // percent
  // Add 'No Mat' option
  const matOptions = [
    { name: "No Mat", outer: "#000", inner: "#000" },
    ...matColors,
  ];
  const color = matOptions[selected];
  const [screenDims, setScreenDims] = React.useState<{
    width: number;
    height: number;
  }>({
    width: 1,
    height: 1,
  });
  const [imgDims, setImgDims] = React.useState<{
    width: number;
    height: number;
  }>({
    width: 1,
    height: 1,
  });

  React.useEffect(() => {
    function updateDims() {
      setScreenDims({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }
    updateDims();
    window.addEventListener("resize", updateDims);
    return () => window.removeEventListener("resize", updateDims);
  }, []);

  // Get image natural dimensions
  const handleImgLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.target as HTMLImageElement;
    setImgDims({ width: img.naturalWidth, height: img.naturalHeight });
  };

  // Adaptive mat calculation
  const frameWidth = screenDims.width;
  const frameHeight = screenDims.height;
  const imgAspect = imgDims.width / imgDims.height;
  // Calculate artwork area size as percentage of frame
  const artworkArea =
    Math.min(frameWidth, frameHeight) * (1 - matPercent / 100);
  // Now, calculate artwork width/height to match image aspect and fill frame
  let artworkWidth = artworkArea;
  let artworkHeight = artworkArea;
  if (frameWidth / frameHeight > imgAspect) {
    // Frame is wider than image: fit by height
    artworkHeight = frameHeight * (1 - matPercent / 100);
    artworkWidth = artworkHeight * imgAspect;
  } else {
    // Frame is taller than image: fit by width
    artworkWidth = frameWidth * (1 - matPercent / 100);
    artworkHeight = artworkWidth / imgAspect;
  }
  // Calculate mat widths
  const matHorizontal = (frameWidth - artworkWidth) / 2;
  const matVertical = (frameHeight - artworkHeight) / 2;
  const outerBorder = 4;

  return (
    <div className="relative flex flex-col items-center justify-center w-full h-full">
      {/* Outer mat (skip if No Mat) */}
      {selected !== 0 && (
        <div
          className="absolute rounded-xl"
          style={{
            top: 0,
            left: 0,
            width: `${frameWidth}px`,
            height: `${frameHeight}px`,
            background: color.outer,
            border: `${outerBorder}px solid ${color.inner}`,
            boxSizing: "border-box",
            boxShadow: "0 2px 8px #aaa",
            zIndex: 2,
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
          background: selected === 0 ? "#000" : "#fff",
          boxShadow: selected !== 0 ? "0 0 0 1px #ccc" : undefined,
          zIndex: 4,
        }}
      >
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover rounded-lg"
          unoptimized
          onLoad={handleImgLoad}
        />
      </div>
    </div>
  );
}

const SlideshowPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const albumId = Number(params?.albumId);
  const album = placeholderAlbums[albumId];

  // Move all hooks to top before any returns
  const [current, setCurrent] = React.useState(0);
  const [timerActive, setTimerActive] = React.useState(true);
  const images = album?.images || [];
  const [matConfig, setMatConfig] = React.useState<MatConfig | undefined>(
    undefined
  );

  React.useEffect(() => {
    if (images.length > 1 && timerActive) {
      const timer = setInterval(() => {
        setCurrent((prev) => (prev + 1) % images.length);
      }, 2000);
      return () => clearInterval(timer);
    }
  }, [images.length, timerActive]);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(
        `album-mat-config-${params?.albumId || "demo"}`
      );
      if (saved) setMatConfig(JSON.parse(saved));
      else setMatConfig(undefined);
    }
  }, [params?.albumId]);

  const handleBack = React.useCallback(() => {
    setTimerActive(false);
    router.push("/albums");
  }, [router]);

  if (!album) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        <div className="text-white text-lg font-semibold">Album not found.</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50">
      <MatImage src={images[current]} alt={album.title} matConfig={matConfig} />

      <button
        type="button"
        onClick={handleBack}
        aria-label="Back to albums"
        className="absolute top-4 left-4 bg-gray-900 bg-opacity-80 text-white px-4 py-2 rounded-lg shadow-lg text-base font-semibold hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-white z-30"
      >
        ←
      </button>
    </div>
  );
};

export default SlideshowPage;
