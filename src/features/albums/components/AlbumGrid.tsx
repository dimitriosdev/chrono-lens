"use client";
import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  PencilSquareIcon,
  PlayIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  PlusIcon,
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
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedTags, setSelectedTags] = React.useState<Set<string>>(
    new Set(),
  );
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

  // Get all unique tags from albums
  const allTags = React.useMemo(() => {
    const tags = new Set<string>();
    albums.forEach((album) => {
      album.tags?.forEach((tag) => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [albums]);

  // Filter albums based on search query and selected tags
  const filteredAlbums = React.useMemo(() => {
    return albums.filter((album) => {
      const matchesSearch =
        searchQuery === "" ||
        album.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        album.description?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesTags =
        selectedTags.size === 0 ||
        (album.tags && album.tags.some((tag) => selectedTags.has(tag)));

      return matchesSearch && matchesTags;
    });
  }, [albums, searchQuery, selectedTags]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => {
      const newTags = new Set(prev);
      if (newTags.has(tag)) {
        newTags.delete(tag);
      } else {
        newTags.add(tag);
      }
      return newTags;
    });
  };

  const handleDeleteClick = async (e: React.MouseEvent, idx: number) => {
    e.stopPropagation();
    const album = filteredAlbums[idx];
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
            prev.filter((a: Album) => a.id !== albumId),
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
          `Successfully deleted ${result.albumsDeleted} albums and ${result.filesDeleted} files!`,
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
    router.push(`/albums/play?id=${filteredAlbums[idx].id}`);
  };

  const handleCreateAlbum = () => {
    router.push("/albums/new");
  };

  const handleEditClick = (e: React.MouseEvent, idx: number) => {
    e.stopPropagation();
    router.push(`/albums/edit?id=${filteredAlbums[idx].id}`);
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
        {/* Header with Title and Create Button */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            My Albums
          </h1>
          <button
            onClick={handleCreateAlbum}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-lg hover:shadow-xl"
          >
            <PlusIcon className="w-5 h-5" />
            <span className="hidden sm:inline">New</span>
            <span className="sm:hidden">New</span>
          </button>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-6 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search albums by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 pl-10 rounded-lg bg-neutral-800 text-white placeholder-neutral-500 border border-neutral-700 focus:border-blue-500 focus:outline-none transition-colors"
            />
            <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-neutral-500" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-2.5 text-neutral-500 hover:text-white transition-colors"
                aria-label="Clear search"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Tags Filter */}
          {allTags.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm text-neutral-400 font-medium">
                Filter by tags:
              </label>
              <div className="flex flex-wrap gap-2">
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                      selectedTags.has(tag)
                        ? "bg-blue-600 text-white"
                        : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
                {selectedTags.size > 0 && (
                  <button
                    onClick={() => setSelectedTags(new Set())}
                    className="px-3 py-1.5 rounded-full text-sm font-medium bg-neutral-700 text-neutral-300 hover:bg-neutral-600 transition-all"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Results count */}
          {albums.length > 0 && (
            <div className="text-sm text-neutral-400">
              {filteredAlbums.length} of {albums.length} album
              {albums.length !== 1 ? "s" : ""}
              {searchQuery && ` matching "${searchQuery}"`}
              {selectedTags.size > 0 &&
                ` with selected tag${selectedTags.size !== 1 ? "s" : ""}`}
            </div>
          )}
        </div>
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
          {filteredAlbums.length === 0 ? (
            <div className="col-span-full text-center text-gray-400 py-12">
              {albums.length === 0 ? (
                <div className="space-y-4">
                  <p className="text-lg">No albums yet</p>
                  <p className="text-sm text-gray-500">
                    Create your first album to get started!
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-lg">
                    {searchQuery || selectedTags.size > 0
                      ? "No albums match your search or filters."
                      : "No albums found."}
                  </p>
                </div>
              )}
            </div>
          ) : (
            filteredAlbums.map((album, idx) => (
              <article
                key={album.id}
                className="bg-gray-800 rounded-xl overflow-hidden shadow-lg flex flex-col justify-end relative w-full max-w-[340px] mx-auto cursor-pointer min-h-[220px] sm:min-h-[260px] group"
                onClick={() => handleAlbumClick(idx)}
                draggable={searchQuery === "" && selectedTags.size === 0}
                onDragStart={() => {
                  if (searchQuery === "" && selectedTags.size === 0) {
                    handleDragStart(idx);
                  }
                }}
                onDragOver={(e) => {
                  if (searchQuery === "" && selectedTags.size === 0) {
                    e.preventDefault();
                  }
                }}
                onDrop={() => {
                  if (searchQuery === "" && selectedTags.size === 0) {
                    handleDrop(idx);
                  }
                }}
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
                <div className="absolute left-0 top-0 w-full z-10 p-3 sm:p-4 flex flex-col items-start gap-2">
                  <span className="text-white text-base sm:text-lg font-semibold drop-shadow-lg text-shadow-md">
                    {album.title}
                  </span>
                  {album.tags && album.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {album.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-block bg-blue-600/80 text-white text-xs px-2 py-1 rounded-full font-medium drop-shadow"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
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
