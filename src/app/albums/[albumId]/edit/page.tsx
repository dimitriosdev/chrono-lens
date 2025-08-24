"use client";

let dragIndex: number | null = null;
type DraggableMediaProps = {
  idx: number;
  img: string;
  description?: string;
  removeImage: (idx: number) => void;
  moveMedia: (from: number, to: number) => void;
  updateDescription?: (idx: number, description: string) => void;
};
function DraggableMedia({
  idx,
  img,
  description,
  removeImage,
  moveMedia,
  updateDescription,
}: DraggableMediaProps) {
  return (
    <div className="flex flex-col">
      <div
        className="relative group cursor-move w-full h-32"
        draggable
        onDragStart={() => {
          dragIndex = idx;
        }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={() => {
          if (dragIndex !== null && dragIndex !== idx) {
            moveMedia(dragIndex, idx);
          }
          dragIndex = null;
        }}
      >
        <div className="w-full h-full relative rounded-lg overflow-hidden border border-gray-800 bg-gray-900">
          <Image
            src={img}
            alt={`Media ${idx + 1}`}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          <button
            type="button"
            aria-label="Remove media"
            className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-7 h-7 flex items-center justify-center text-xl font-bold shadow hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 transition"
            style={{ zIndex: 20 }}
            onClick={() => removeImage(idx)}
          >
            &times;
          </button>
        </div>
      </div>
      {updateDescription && (
        <div className="mt-2">
          <label className="block text-xs text-gray-400 mb-1">
            Description (optional)
          </label>
          <input
            type="text"
            placeholder="e.g., Paris vacation, birthday party, etc."
            value={description || ""}
            onChange={(e) => updateDescription(idx, e.target.value)}
            className="w-full px-3 py-2 text-sm rounded bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400"
          />
        </div>
      )}
    </div>
  );
}
import React, { useState, useEffect, useMemo } from "react";
import { MatBoard, MatConfig } from "@/components/MatBoard";
import Image from "next/image";

import { useParams, useRouter } from "next/navigation";
import {
  ALBUM_LAYOUTS,
  AlbumLayout as AlbumLayoutType,
} from "@/features/albums/AlbumLayout";
import { getAlbum, updateAlbum } from "@/lib/firestore";
import { uploadImage, deleteImage } from "@/lib/storage";
import { useAuth } from "@/context/AuthContext";
import { validateAlbumTitle, validateFile } from "@/lib/security";
import { AlbumImage } from "@/entities/Album";

const EditAlbumPage: React.FC = () => {
  const { isSignedIn, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const albumId = params?.albumId as string;
  const [matConfig, setMatConfig] = useState<MatConfig | undefined>(undefined);
  const [loadingState, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [album, setAlbum] = useState<import("@/entities/Album").Album | null>(
    null
  );
  const [images, setImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [imageDescriptions, setImageDescriptions] = useState<string[]>([]);
  const [newImageDescriptions, setNewImageDescriptions] = useState<string[]>(
    []
  );
  const [albumName, setAlbumName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedLayout, setSelectedLayout] = useState<AlbumLayoutType>(
    ALBUM_LAYOUTS.find((l) => l.type === "slideshow") || ALBUM_LAYOUTS[0]
  );
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverUrl, setCoverUrl] = useState<string>("");
  const [cycleDuration, setCycleDuration] = useState(2000);

  useEffect(() => {
    if (!loading && !isSignedIn) {
      router.replace("/");
    }
  }, [isSignedIn, loading, router]);

  useEffect(() => {
    async function fetchAlbum() {
      if (!albumId) return;
      setLoading(true);
      const data = await getAlbum(albumId);
      if (data) {
        setAlbum(data);
        setAlbumName(data.title || "");
        setDescription(data.description || "");

        // Handle both old format (string[]) and new format (AlbumImage[])
        const albumImages = data.images || [];
        const urls: string[] = [];
        const descriptions: string[] = [];

        albumImages.forEach((img) => {
          if (typeof img === "string") {
            // Old format
            urls.push(img);
            descriptions.push("");
          } else {
            // New format
            urls.push(img.url);
            descriptions.push(img.description || "");
          }
        });

        setImageUrls(urls);
        setImageDescriptions(descriptions);
        setSelectedLayout(data.layout || ALBUM_LAYOUTS[0]);
        setCoverUrl(data.coverUrl || "");
        setMatConfig(data.matConfig || { matWidth: 40, matColor: "#000" });
      }
      setLoading(false);
    }
    fetchAlbum();
  }, [albumId]);

  useEffect(() => {
    if (matConfig && typeof matConfig.cycleDuration === "number") {
      setCycleDuration(matConfig.cycleDuration);
    }
  }, [matConfig]);

  // Drag-and-drop reordering
  const moveMediaDnd = (from: number, to: number) => {
    const allUrls = [...imageUrls, ...imageObjectUrls];
    const allDescriptions = [...imageDescriptions, ...newImageDescriptions];

    if (from === to) return;

    const urlItem = allUrls[from];
    const descItem = allDescriptions[from];

    allUrls.splice(from, 1);
    allDescriptions.splice(from, 1);
    allUrls.splice(to, 0, urlItem);
    allDescriptions.splice(to, 0, descItem);

    // Split back into existing and new images
    const newImageUrls = allUrls
      .slice(0, imageUrls.length)
      .filter((url) => typeof url === "string");
    const newImages = images.slice();
    const updatedImageDescriptions = allDescriptions.slice(0, imageUrls.length);
    const updatedNewImageDescriptions = allDescriptions.slice(imageUrls.length);

    setImageUrls(newImageUrls);
    setImages(newImages);
    setImageDescriptions(updatedImageDescriptions);
    setNewImageDescriptions(updatedNewImageDescriptions);
  };

  const updateImageDescription = (idx: number, description: string) => {
    if (idx < imageUrls.length) {
      // Updating existing image description
      setImageDescriptions((prev) => {
        const updated = [...prev];
        updated[idx] = description;
        return updated;
      });
    } else {
      // Updating new image description
      const newIdx = idx - imageUrls.length;
      setNewImageDescriptions((prev) => {
        const updated = [...prev];
        updated[newIdx] = description;
        return updated;
      });
    }
  };

  // Memoize object URLs for images and clean up on change
  const imageObjectUrls = useMemo(() => {
    const urls = images.map((img) => URL.createObjectURL(img));
    return urls;
  }, [images]);

  useEffect(() => {
    return () => {
      imageObjectUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [imageObjectUrls]);

  if (loading || !isSignedIn) return null;

  const handleFiles = (files: FileList | null) => {
    if (!files) return;

    const validFiles: File[] = [];
    const errors: string[] = [];

    // Validate new files
    Array.from(files).forEach((file) => {
      const validation = validateFile(file);
      if (validation.isValid) {
        // Only add new files that aren't already present
        if (
          !images.some(
            (img) => img.name === file.name && img.size === file.size
          )
        ) {
          validFiles.push(file);
        }
      } else {
        errors.push(`${file.name}: ${validation.error}`);
      }
    });

    if (errors.length > 0) {
      setError(errors.join("; "));
    } else if (validFiles.length === 0 && Array.from(files).length > 0) {
      setError("No new valid files to add");
    } else {
      setError("");
    }

    setImages((prev) => [...prev, ...validFiles]);
    // Initialize descriptions for new images
    setNewImageDescriptions((prev) => [...prev, ...validFiles.map(() => "")]);
  };

  const removeImage = async (idx: number) => {
    if (idx < imageUrls.length) {
      // Removing existing image
      const urlToDelete = imageUrls[idx];
      setImageUrls((prev) => prev.filter((_, i) => i !== idx));
      setImageDescriptions((prev) => prev.filter((_, i) => i !== idx));
      // Remove from storage if it's a URL
      if (urlToDelete) {
        await deleteImage(urlToDelete);
      }
    } else {
      // Removing new image
      const newIdx = idx - imageUrls.length;
      setImages((prev) => prev.filter((_, i) => i !== newIdx));
      setNewImageDescriptions((prev) => prev.filter((_, i) => i !== newIdx));
    }
  };

  const handleCoverFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCoverFile(e.target.files[0]);
    }
  };

  const handleSave = async () => {
    // Validate title
    const titleValidation = validateAlbumTitle(albumName);
    if (!titleValidation.isValid) {
      setError(titleValidation.error || "Invalid title");
      return;
    }

    if (images.length === 0 && imageUrls.length === 0) {
      setError("Album title and at least one image are required.");
      return;
    }

    if (!matConfig) {
      setError("Mat configuration is required.");
      return;
    }

    setLoading(true);
    setError("");
    const albumImages: AlbumImage[] = [];

    try {
      // Add existing images with their descriptions
      imageUrls.forEach((url, idx) => {
        const imageDescription = imageDescriptions[idx]?.trim();
        const albumImage: AlbumImage = { url };

        // Only add description field if it's not empty
        if (imageDescription) {
          albumImage.description = imageDescription;
        }

        albumImages.push(albumImage);
      });

      // Upload new images and add them
      for (let i = 0; i < images.length; i++) {
        const url = await uploadImage(images[i], albumId, i);
        const newImageDescription = newImageDescriptions[i]?.trim();
        const albumImage: AlbumImage = { url };

        // Only add description field if it's not empty
        if (newImageDescription) {
          albumImage.description = newImageDescription;
        }

        albumImages.push(albumImage);
      }

      // Upload cover image if changed
      let newCoverUrl = coverUrl;
      if (coverFile) {
        newCoverUrl = await uploadImage(coverFile, albumId, 0);
      }
      await updateAlbum(albumId, {
        title: albumName,
        description,
        images: albumImages,
        layout: selectedLayout,
        coverUrl: newCoverUrl || albumImages[0]?.url,
        matConfig: {
          matWidth: matConfig.matWidth || 40,
          matColor: matConfig.matColor || "#000",
          cycleDuration,
        },
        updatedAt: new Date(),
      });
      setSuccess(true);
      setTimeout(() => {
        router.push("/albums");
      }, 1200);
    } catch {
      setError("Failed to update album.");
      setSuccess(false);
    }
    setLoading(false);
  };

  if (loadingState && !album) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 bg-gray-950 rounded-xl shadow-xl text-center text-gray-300">
        Loading album...
      </div>
    );
  }

  if (!album) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 bg-gray-950 rounded-xl shadow-xl text-center text-red-400">
        Album not found.
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 bg-gray-950 rounded-xl shadow-xl">
      <h1 className="text-3xl font-bold mb-8 text-blue-400">Edit Album</h1>
      <form
        className="space-y-8"
        onSubmit={(e) => {
          e.preventDefault();
          handleSave();
        }}
      >
        {success && (
          <div className="bg-green-100 text-green-800 px-4 py-2 rounded mb-2 text-center border border-green-300">
            Album updated! Redirecting...
          </div>
        )}
        {error && (
          <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-2 text-center border border-red-300">
            {error}
          </div>
        )}
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Album Media
          </label>
          <input
            id="addMediaInput"
            type="file"
            multiple
            accept="image/*"
            className="block mb-3 w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            onChange={(e) => {
              handleFiles(e.target.files);
              e.target.value = "";
            }}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-2">
            {imageUrls.map((img, idx) => (
              <DraggableMedia
                key={img + idx}
                idx={idx}
                img={img}
                description={imageDescriptions[idx]}
                removeImage={removeImage}
                moveMedia={moveMediaDnd}
                updateDescription={updateImageDescription}
              />
            ))}
            {imageObjectUrls.map((img, idx) => (
              <DraggableMedia
                key={img + "new" + idx}
                idx={imageUrls.length + idx}
                img={img}
                description={newImageDescriptions[idx]}
                removeImage={removeImage}
                moveMedia={moveMediaDnd}
                updateDescription={updateImageDescription}
              />
            ))}
          </div>
        </div>
        {/* Drag-and-drop logic for media */}
        <div className="mb-2 text-left">
          <label
            htmlFor="layout-select"
            className="text-blue-400 font-semibold mr-2"
          >
            Album Layout:
          </label>
          <select
            id="layout-select"
            value={selectedLayout.name}
            onChange={(e) => {
              const layout = ALBUM_LAYOUTS.find(
                (l) => l.name === e.target.value
              );
              if (layout) setSelectedLayout(layout);
            }}
            className="bg-gray-800 text-white rounded px-3 py-2 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {ALBUM_LAYOUTS.map((layout) => (
              <option
                key={layout.name}
                value={layout.name}
                className="bg-gray-800 text-white"
              >
                {layout.name}
              </option>
            ))}
          </select>
          <span className="ml-2 text-gray-400">
            {selectedLayout.description}
          </span>
        </div>
        {matConfig && (
          <MatBoard
            config={matConfig}
            setConfig={setMatConfig}
            layout={selectedLayout}
          />
        )}
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Album Title
          </label>
          <input
            type="text"
            name="title"
            value={albumName}
            onChange={(e) => setAlbumName(e.target.value)}
            className="w-full p-3 border border-gray-700 rounded-lg bg-gray-900 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter album title"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Cover Image
          </label>
          <input
            id="coverImageInput"
            type="file"
            accept="image/*"
            className="block mb-3 w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            onChange={handleCoverFile}
          />
          {(coverFile || coverUrl) && (
            <div className="relative w-32 h-32 mb-2 rounded-lg overflow-hidden border border-gray-800 bg-gray-900">
              <Image
                src={coverFile ? URL.createObjectURL(coverFile) : coverUrl}
                alt="Cover Image"
                fill
                className="object-cover"
                sizes="128px"
              />
            </div>
          )}
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Image Change Duration (ms)
          </label>
          <input
            type="number"
            min={500}
            max={10000}
            step={100}
            value={cycleDuration}
            onChange={(e) => setCycleDuration(Number(e.target.value))}
            className="w-32 px-2 py-1 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          disabled={loadingState}
        >
          {loadingState ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
};

export default EditAlbumPage;
