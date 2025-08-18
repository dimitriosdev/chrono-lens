"use client";
import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { PencilSquareIcon, PlayIcon } from "@heroicons/react/24/solid";
import { Album } from "@/entities/Album";
import { getAlbums } from "@/lib/firestore";

const AlbumGrid: React.FC = () => {
  const [albums, setAlbums] = React.useState<Album[]>([]);
  const [loading, setLoading] = React.useState(true);
  const dragAlbumIndex = React.useRef<number | null>(null);
  const router = useRouter();

  React.useEffect(() => {
    async function fetchAlbums() {
      setLoading(true);
      try {
        const data = await getAlbums();
        setAlbums(data);
      } catch {
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
  const handleDragStart = (idx: number) => {
    dragAlbumIndex.current = idx;
  };
  const handleDrop = (idx: number) => {
    if (dragAlbumIndex.current === null || dragAlbumIndex.current === idx)
      return;
    setAlbums((prev) => {
      const updated = [...prev];
      const [removed] = updated.splice(dragAlbumIndex.current!, 1);
      updated.splice(idx, 0, removed);
      return updated;
    });
    dragAlbumIndex.current = null;
  };
  const renderCardBackground = (album: Album) => (
    <div className="absolute inset-0 group">
      <Image
        src={album.images[0]}
        alt={album.title}
        fill
        className="object-cover w-full h-full"
        unoptimized
      />
      <div className="absolute inset-0 bg-black/30 transition-opacity duration-200 group-hover:opacity-60" />
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
        <div className="flex flex-col items-center gap-2">
          <PlayIcon className="h-10 w-10 text-white drop-shadow-lg" />
          <span className="text-white text-base font-semibold drop-shadow-lg">
            View Album
          </span>
        </div>
      </div>
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
    <section className="pt-8 pb-8 w-full flex flex-col items-center">
      <div className="w-full max-w-screen-xl px-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-center">
          {albums.length === 0 ? (
            <div className="col-span-full text-center text-gray-400 py-12">
              No albums found.
            </div>
          ) : (
            albums.map((album, idx) => (
              <article
                key={album.id}
                className="bg-gray-800 rounded-xl overflow-hidden shadow-lg flex flex-col justify-end relative max-w-[340px] w-full mx-auto cursor-pointer min-h-[260px] group"
                onClick={() => handleAlbumClick(idx)}
                draggable
                onDragStart={() => handleDragStart(idx)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(idx)}
                tabIndex={0}
                aria-label={album.title}
              >
                {renderCardBackground(album)}
                <div className="absolute top-2 right-2 z-20 flex gap-4">
                  <div className="relative group">
                    <button
                      aria-label="Edit album"
                      className="bg-gray-800 rounded-full p-3 hover:bg-blue-600 transition-colors duration-150 block focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-md"
                      onClick={(e) => handleEditClick(e, idx)}
                      tabIndex={0}
                      onMouseEnter={(e) => e.currentTarget.focus()}
                    >
                      <PencilSquareIcon className="h-6 w-6 text-white mx-auto" />
                    </button>
                  </div>
                </div>
                <div className="absolute left-0 top-0 w-full z-10 p-4 flex items-start">
                  <span className="text-white text-lg font-semibold drop-shadow-lg text-shadow-md">
                    {album.title}
                  </span>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default AlbumGrid;
