import React from "react";
import Image from "next/image";

type Album = {
  title: string;
  image: string;
};

const placeholderAlbums: Album[] = [
  { title: "Hiking", image: "/placeholder1.jpg" },
  { title: "Catskills", image: "/placeholder2.jpg" },
  { title: "Japan", image: "/placeholder3.jpg" },
  { title: "Dolomites", image: "/placeholder4.jpg" },
  { title: "Sunset ", image: "/placeholder5.jpg" },
  { title: "Namibia", image: "/placeholder6.jpg" },
  {
    title: "Arizona",
    image: "/placeholder7.jpg",
  },
  { title: "Sweden", image: "/placeholder8.jpg" },
];

const AlbumGrid: React.FC = () => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-4 sm:p-8">
      {placeholderAlbums.map((album, idx) => (
        <div
          key={idx}
          className="bg-gray-800 rounded-xl overflow-hidden shadow-lg flex flex-col justify-end min-h-[220px] sm:min-h-[240px] lg:min-h-[260px] relative"
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
