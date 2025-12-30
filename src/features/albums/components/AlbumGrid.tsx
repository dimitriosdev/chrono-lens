"use client";
import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  PencilSquareIcon,
  PlayIcon,
  TrashIcon,
} from "@heroicons/react/24/solid";
import { Album } from "@/shared/types/album";
import { getAlbums, deleteAlbum } from "@/shared/lib/firestore";
import { executeDeleteAll } from "@/shared/utils/deleteAllData";
import ConfirmationModal from "@/shared/components/ConfirmationModal";

interface AlbumGridProps {
  albums?: Album[]; // Optional: if provided, use these instead of fetching
  showActions?: boolean; // Optional: show edit/delete actions (default: true for user albums)
}

const AlbumGrid: React.FC<AlbumGridProps> = ({
  albums: providedAlbums,
  showActions = true,
}) => {
  const [albums, setAlbums] = React.useState<Album[]>(providedAlbums || []);
  const [loading, setLoading] = React.useState(!providedAlbums); // Don't load if albums provided
  const [showDeleteAllModal, setShowDeleteAllModal] = React.useState(false);
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);
  const [showResultModal, setShowResultModal] = React.useState(false);
  const [resultMessage, setResultMessage] = React.useState("");
  const [resultType, setResultType] = React.useState<"info" | "danger">("info");
  const [albumToDelete, setAlbumToDelete] = React.useState<{
    album: Album;
    index: number;
  } | null>(null);
  const dragAlbumIndex = React.useRef<number | null>(null);
  const router = useRouter();

  const handleDeleteClick = async (e: React.MouseEvent, idx: number) => {
    e.stopPropagation();
    const album = albums[idx];
    setAlbumToDelete({ album, index: idx });
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!albumToDelete) return;

    setShowDeleteModal(false);
    const { album } = albumToDelete;
    const albumId = album.id;

    try {
      await deleteAlbum(albumId);
      setAlbums((prev: Album[]) => prev.filter((a: Album) => a.id !== albumId));
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to delete album:", error);
      }

      // Provide more specific error messages
      let errorMessage = "Failed to delete album. Please try again.";
      if (error instanceof Error) {
        if (error.message.includes("Unauthorized")) {
          errorMessage = "You don't have permission to delete this album.";
        } else if (error.message.includes("not found")) {
          errorMessage = "Album not found. It may have already been deleted.";
          // Remove from UI anyway since it doesn't exist
          setAlbums((prev: Album[]) =>
            prev.filter((a: Album) => a.id !== albumId)
          );
        } else if (error.message.includes("not authenticated")) {
          errorMessage = "Please log in to delete albums.";
        }
      }

      setResultMessage(errorMessage);
      setResultType("danger");
      setShowResultModal(true);
    } finally {
      setAlbumToDelete(null);
    }
  };

  const handleDeleteAllClick = async () => {
    if (albums.length === 0) {
      setResultMessage("No albums to delete.");
      setResultType("info");
      setShowResultModal(true);
      return;
    }

    setShowDeleteAllModal(true);
  };

  const handleDeleteAllConfirm = async () => {
    setShowDeleteAllModal(false);

    try {
      const result = await executeDeleteAll();

      if (result.success) {
        setAlbums([]);
        setResultMessage(
          `Successfully deleted ${result.albumsDeleted} albums and ${result.filesDeleted} files!`
        );
        setResultType("info");
        setShowResultModal(true);
      } else {
        setResultMessage(`Error during deletion: ${result.error}`);
        setResultType("danger");
        setShowResultModal(true);
      }
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Delete all failed:", error);
      }
      setResultMessage("Failed to delete all data. Please try again.");
      setResultType("danger");
      setShowResultModal(true);
    }
  };

  React.useEffect(() => {
    // If albums are provided as props, use them instead of fetching
    if (providedAlbums) {
      setAlbums(providedAlbums);
      setLoading(false);
      return;
    }

    // Otherwise, fetch user's albums
    async function fetchAlbums() {
      setLoading(true);
      try {
        const data = await getAlbums();
        setAlbums(data);
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.error("Error fetching albums:", error);
        }
        setAlbums([]);
      }
      setLoading(false);
    }
    fetchAlbums();
  }, [providedAlbums]);

  const handleAlbumClick = (idx: number) => {
    router.push(`/albums/play?id=${albums[idx].id}`);
  };
  const handleEditClick = (e: React.MouseEvent, idx: number) => {
    e.stopPropagation();
    router.push(`/albums/edit?id=${albums[idx].id}`);
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
  const renderCardBackground = (album: Album) => {
    const firstImage = album.images[0];
    const imageUrl = firstImage?.url || "";

    return (
      <div className="absolute inset-0 group">
        <Image
          src={imageUrl}
          alt={album.title}
          fill
          className="object-cover w-full h-full"
          unoptimized
          priority
        />
        <div className="absolute inset-0 bg-black/30 transition-opacity duration-200 group-hover:opacity-60" />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          <div className="flex flex-col items-center gap-1 sm:gap-2">
            <PlayIcon className="h-8 w-8 sm:h-10 sm:w-10 text-white drop-shadow-lg" />
            <span className="text-white text-sm sm:text-base font-semibold drop-shadow-lg">
              View Album
            </span>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="pt-8 pb-8 w-full flex items-center justify-center">
        <span className="text-gray-400 text-lg">Loading albums...</span>
      </div>
    );
  }

  return (
    <section className="pt-4 sm:pt-8 pb-4 sm:pb-8 w-full flex flex-col items-center">
      <div className="w-full max-w-screen-xl px-3 sm:px-4 lg:px-0">
        {/* Discreet Delete All - only in development for user albums */}
        {showActions &&
          process.env.NODE_ENV === "development" &&
          albums.length > 0 && (
            <div className="flex justify-end mb-2">
              <button
                onClick={handleDeleteAllClick}
                className="text-[10px] text-neutral-500 hover:text-red-400 transition-colors"
              >
                Delete all
              </button>
            </div>
          )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 justify-center">
          {albums.length === 0 ? (
            <div className="col-span-full text-center text-gray-400 py-12">
              No albums found.
            </div>
          ) : (
            albums.map((album, idx) => (
              <article
                key={album.id}
                className="bg-gray-800 rounded-xl overflow-hidden shadow-lg flex flex-col justify-end relative w-full max-w-[340px] mx-auto cursor-pointer min-h-[220px] sm:min-h-[260px] group"
                onClick={() => handleAlbumClick(idx)}
                draggable
                onDragStart={() => handleDragStart(idx)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(idx)}
                tabIndex={0}
                aria-label={album.title}
              >
                {renderCardBackground(album)}
                {showActions && (
                  <div className="absolute top-2 right-2 z-20 flex gap-1 sm:gap-2">
                    <button
                      aria-label="Edit album"
                      className="bg-gray-800 rounded-full p-2 sm:p-3 hover:bg-blue-600 transition-colors duration-150 block focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-md"
                      onClick={(e) => handleEditClick(e, idx)}
                      tabIndex={0}
                      onMouseEnter={(e) => e.currentTarget.focus()}
                    >
                      <PencilSquareIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white mx-auto" />
                    </button>
                    <button
                      aria-label="Delete album"
                      className="bg-gray-800 rounded-full p-2 sm:p-3 hover:bg-red-600 transition-colors duration-150 block focus:outline-none focus:ring-2 focus:ring-red-500 shadow-md"
                      onClick={(e) => handleDeleteClick(e, idx)}
                      tabIndex={0}
                    >
                      <TrashIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white mx-auto" />
                    </button>
                  </div>
                )}
                <div className="absolute left-0 top-0 w-full z-10 p-3 sm:p-4 flex items-start">
                  <span className="text-white text-base sm:text-lg font-semibold drop-shadow-lg text-shadow-md">
                    {album.title}
                  </span>
                </div>
              </article>
            ))
          )}
        </div>
      </div>

      <ConfirmationModal
        isOpen={showDeleteAllModal}
        onClose={() => setShowDeleteAllModal(false)}
        onConfirm={handleDeleteAllConfirm}
        title="Delete All Albums"
        message="This will permanently delete ALL albums and images. This action cannot be undone."
        requireTextConfirmation={true}
        requiredText="delete"
        confirmButtonText="Delete All"
        type="danger"
      />

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Album"
        message={
          albumToDelete
            ? `Are you sure you want to delete "${albumToDelete.album.title}"? This will permanently remove all images and cannot be undone.`
            : ""
        }
        requireTextConfirmation={true}
        requiredText={
          albumToDelete ? albumToDelete.album.title.toLowerCase() : ""
        }
        confirmButtonText="Delete Album"
        type="danger"
      />

      <ConfirmationModal
        isOpen={showResultModal}
        onClose={() => setShowResultModal(false)}
        onConfirm={() => setShowResultModal(false)}
        title={resultType === "info" ? "Success" : "Error"}
        message={resultMessage}
        requireTextConfirmation={false}
        confirmButtonText="OK"
        cancelButtonText=""
        type={resultType}
      />
    </section>
  );
};

export default AlbumGrid;
