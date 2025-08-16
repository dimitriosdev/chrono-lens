"use client";
import React from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";

// Temporary: import placeholderAlbums from AlbumGrid for demo
import { placeholderAlbums } from "../../../../features/albums/AlbumGrid";

function MatImage({ src, alt }: { src: string; alt: string }) {
  // Mat and image container with equal margins
  return (
    <div className="relative flex items-center justify-center w-full h-full">
      <div
        className="absolute rounded-xl"
        style={{
          top: "5vh",
          left: "5vw",
          width: "90vw",
          height: "90vh",
          background: "#fff",
          boxShadow: "0 2px 16px 0 rgba(0,0,0,0.08)",
          zIndex: 2,
        }}
        aria-hidden="true"
      />
      <div
        className="absolute flex items-center justify-center"
        style={{
          top: "5vh",
          left: "5vw",
          width: "90vw",
          height: "90vh",
          zIndex: 3,
        }}
      >
        <Image
          src={src}
          alt={alt}
          fill
          className="object-contain rounded-lg"
          unoptimized
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

  const [current, setCurrent] = React.useState(0);
  const [timerActive, setTimerActive] = React.useState(true);
  const images = album?.images || [];

  React.useEffect(() => {
    if (images.length > 1 && timerActive) {
      const timer = setInterval(() => {
        setCurrent((prev) => (prev + 1) % images.length);
      }, 2000);
      return () => clearInterval(timer);
    }
  }, [images.length, timerActive]);

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
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
      {album.showMatsAndFrames ? (
        <MatImage src={images[current]} alt={album.title} />
      ) : (
        <div className="relative w-full h-full flex items-center justify-center">
          <Image
            src={images[current]}
            alt={album.title}
            fill
            className="object-contain rounded-lg"
            unoptimized
          />
        </div>
      )}
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
