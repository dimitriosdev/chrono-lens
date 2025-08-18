"use client";
import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { PencilSquareIcon } from "@heroicons/react/24/solid";
import { ALBUM_LAYOUTS } from "./AlbumLayout";
import { Album } from "@/entities/Album";
import { getAlbums } from "@/lib/firestore";

const AlbumGrid: React.FC = () => {
  const router = useRouter();
  const [albums, setAlbums] = React.useState<Album[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchAlbums() {
      setLoading(true);
      try {
        const data = await getAlbums();
        setAlbums(data);
      } catch (err) {
        setAlbums([]);
      }
      setLoading(false);
    }
    fetchAlbums();
  }, []);

  const handleAlbumClick = (idx: number) => {
    router.push(`/albums/${albums[idx].id}/play`);
  };
  const handleEditClick = (e: React.MouseEvent, idx: number) => {
    e.stopPropagation();
    router.push(`/albums/${albums[idx].id}/edit`);
  };

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

  if (loading) {
    return (
      <div className="pt-8 pb-8 w-full flex items-center justify-center">
        <span className="text-gray-400 text-lg">Loading albums...</span>
      </div>
    );
  }

  return (
    <div className="pt-8 pb-8 w-full">
      <div className="grid grid-cols-1 [@media(min-width:400px)]:grid-cols-2 [@media(min-width:880px)]:grid-cols-3 gap-6 px-0 w-full max-w-screen-xl mx-auto justify-center">
        {albums.length === 0 ? (
          <div className="col-span-full text-center text-gray-400 py-12">
            No albums found.
          </div>
        ) : (
          albums.map((album, idx) => (
            <div
              key={album.id}
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
          ))
        )}
      </div>
    </div>
  );
};

export default AlbumGrid;
