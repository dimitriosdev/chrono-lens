"use client";
import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { PencilSquareIcon } from "@heroicons/react/24/solid";

import { ALBUM_LAYOUTS, AlbumLayout as AlbumLayoutType } from "./AlbumLayout";

type Album = {
  title: string;
  images: string[];
  showMatsAndFrames?: boolean;
  layout?: AlbumLayoutType;
};

export const placeholderAlbums: Album[] = [
  {
    title: "Hiking",
    images: [
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=400&q=80",
      "https://plus.unsplash.com/premium_photo-1680740103993-21639956f3f0?q=80&w=688&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      "https://plus.unsplash.com/premium_photo-1673765123739-3862ccaeb3d6?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    ],
    showMatsAndFrames: true,
    layout: ALBUM_LAYOUTS[0],
  },
  {
    title: "Catskills",
    images: [
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&w=400&q=80",
    ],
    showMatsAndFrames: false,
    layout: ALBUM_LAYOUTS[1],
  },
  {
    title: "Japan",
    images: [
      "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=400&q=80",
    ],
    showMatsAndFrames: true,
    layout: ALBUM_LAYOUTS[2],
  },
  {
    title: "Dolomites",
    images: [
      "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&w=400&q=80",
    ],
    showMatsAndFrames: false,
    layout: ALBUM_LAYOUTS[0],
  },
  {
    title: "Sunset",
    images: [
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80",
    ],
    showMatsAndFrames: true,
    layout: ALBUM_LAYOUTS[1],
  },
  {
    title: "Namibia",
    images: [
      "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=400&q=80",
    ],
    showMatsAndFrames: false,
    layout: ALBUM_LAYOUTS[2],
  },
  {
    title: "Arizona",
    images: [
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&w=400&q=80",
    ],
    showMatsAndFrames: true,
    layout: ALBUM_LAYOUTS[0],
  },
  {
    title: "Sweden",
    images: [
      "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80",
    ],
    showMatsAndFrames: false,
    layout: ALBUM_LAYOUTS[1],
  },
];

const AlbumGrid: React.FC = () => {
  const router = useRouter();
  const [albums, setAlbums] = useState<Album[]>(placeholderAlbums);

  const handleAlbumClick = (idx: number) => {
    router.push(`/albums/${idx}/play`);
  };
  const handleEditClick = (e: React.MouseEvent, idx: number) => {
    e.stopPropagation();
    router.push(`/albums/${idx}/edit`);
  };

  // Only use the first image as the card background
  const renderCardBackground = (album: Album) => (
    <div className="absolute inset-0">
      <Image
        src={album.images[0]}
        alt={album.title}
        fill
        className="object-cover w-full h-full"
        unoptimized
      />
      <div className="absolute inset-0 bg-black/30" />
    </div>
  );

  // ...existing code...

  return (
    <div className="pt-8 pb-8 w-full">
      <div className="grid grid-cols-1 [@media(min-width:400px)]:grid-cols-2 [@media(min-width:880px)]:grid-cols-3 gap-6 px-0 w-full max-w-screen-xl mx-auto justify-center">
        {albums.map((album, idx) => (
          <div
            key={idx}
            className="bg-gray-800 rounded-xl overflow-hidden shadow-lg flex flex-col justify-end relative max-w-[340px] w-full mx-auto cursor-pointer min-h-[260px]"
            onClick={() => handleAlbumClick(idx)}
          >
            {renderCardBackground(album)}
            <div className="absolute top-2 right-2 z-20">
              <button
                aria-label="Edit album"
                className="bg-gray-800 rounded-full p-3 hover:bg-gray-700 block focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={(e) => handleEditClick(e, idx)}
              >
                <PencilSquareIcon className="h-6 w-6 text-white mx-auto" />
              </button>
            </div>
            <div className="absolute left-0 top-0 w-full z-10 p-4 flex items-start">
              <span className="text-white text-lg font-semibold drop-shadow-lg text-shadow-md">
                {album.title}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlbumGrid;
