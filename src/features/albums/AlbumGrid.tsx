"use client";
import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

type Album = {
  title: string;
  images: string[];
  showMatsAndFrames?: boolean;
};

export const placeholderAlbums: Album[] = [
  {
    title: "Hiking",
    images: [
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=400&q=80",
    ],
    showMatsAndFrames: true,
  },
  {
    title: "Catskills",
    images: [
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&w=400&q=80",
    ],
    showMatsAndFrames: false,
  },
  {
    title: "Japan",
    images: [
      "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=400&q=80",
    ],
    showMatsAndFrames: true,
  },
  {
    title: "Dolomites",
    images: [
      "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&w=400&q=80",
    ],
    showMatsAndFrames: false,
  },
  {
    title: "Sunset",
    images: [
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80",
    ],
    showMatsAndFrames: true,
  },
  {
    title: "Namibia",
    images: [
      "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=400&q=80",
    ],
    showMatsAndFrames: false,
  },
  {
    title: "Arizona",
    images: [
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&w=400&q=80",
    ],
    showMatsAndFrames: true,
  },
  {
    title: "Sweden",
    images: [
      "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80",
    ],
    showMatsAndFrames: false,
  },
];

const AlbumGrid: React.FC = () => {
  const router = useRouter();
  const handleAlbumClick = (idx: number) => {
    router.push(`/albums/${idx}/play`);
  };
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-4 sm:p-8 justify-center pt-16 pb-16 sm:pt-8 sm:pb-8">
      {placeholderAlbums.map((album, idx) => (
        <div
          key={idx}
          className="bg-gray-800 rounded-xl overflow-hidden shadow-lg flex flex-col justify-end min-h-[220px] sm:min-h-[240px] lg:min-h-[260px] relative max-w-[340px] w-full mx-auto cursor-pointer"
          onClick={() => handleAlbumClick(idx)}
        >
          <div className="absolute inset-0">
            <Image
              src={album.images[0]}
              alt={album.title}
              fill
              className="object-cover w-full h-full opacity-80"
              unoptimized
            />
          </div>
          <div className="relative z-10 p-4 flex items-end h-full">
            <span className="text-white text-base font-semibold drop-shadow-lg text-shadow-md">
              {album.title}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AlbumGrid;
