import React from "react";
import Image from "next/image";

type Album = {
  title: string;
  image: string;
};

const placeholderAlbums: Album[] = [
  {
    title: "Hiking",
    image:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
  },
  {
    title: "Catskills",
    image:
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=400&q=80",
  },
  {
    title: "Japan",
    image:
      "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80",
  },
  {
    title: "Dolomites",
    image:
      "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80",
  },
  {
    title: "Sunset",
    image:
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=400&q=80",
  },
  {
    title: "Namibia",
    image:
      "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80",
  },
  {
    title: "Arizona",
    image:
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=400&q=80",
  },
  {
    title: "Sweden",
    image:
      "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&w=400&q=80",
  },
];

const AlbumGrid: React.FC = () => {
  return (
  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-4 sm:p-8 justify-center pt-16 pb-16 sm:pt-8 sm:pb-8">
      {placeholderAlbums.map((album, idx) => (
        <div
          key={idx}
          className="bg-gray-800 rounded-xl overflow-hidden shadow-lg flex flex-col justify-end min-h-[220px] sm:min-h-[240px] lg:min-h-[260px] relative max-w-[340px] w-full mx-auto"
        >
          <div className="absolute inset-0">
            <Image
              src={album.image}
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
