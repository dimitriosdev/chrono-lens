"use client";
let dragIndex: number | null = null;
type DraggableMediaProps = {
  idx: number;
  img: string;
  removeImage: (idx: number) => void;
  moveMedia: (from: number, to: number) => void;
};
function DraggableMedia({
  idx,
  img,
  removeImage,
  moveMedia,
}: DraggableMediaProps) {
  return (
    <div
      className="relative group cursor-move w-32 h-32"
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
          sizes="128px"
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
        setImageUrls(data.images || []);
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
    const all = [...imageUrls, ...images];
    if (from === to) return;
    const item = all[from];
    all.splice(from, 1);
    all.splice(to, 0, item);
    // Split back into imageUrls and images
    const newImageUrls = all
      .slice(0, imageUrls.length)
      .map((x) => (typeof x === "string" ? x : ""))
      .filter(Boolean);
    const newImages = all
      .slice(imageUrls.length)
      .filter((x) => x instanceof File);
    setImageUrls(newImageUrls);
    setImages(newImages);
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
    // Only add new files that aren't already present
    const newFiles = Array.from(files).filter(
      (file) =>
        !images.some((img) => img.name === file.name && img.size === file.size)
    );
    setImages((prev) => [...prev, ...newFiles]);
  };

  const removeImage = async (idx: number) => {
    // Remove from UI
    const urlToDelete = imageUrls[idx];
    setImages((prev) => prev.filter((_, i) => i !== idx));
    setImageUrls((prev) => prev.filter((_, i) => i !== idx));
    // Remove from storage if it's a URL
    if (urlToDelete) {
      await deleteImage(urlToDelete);
    }
  };

  const handleCoverFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCoverFile(e.target.files[0]);
    }
  };

  const handleSave = async () => {
    if (!albumName || (images.length === 0 && imageUrls.length === 0)) {
      setError("Album title and at least one image are required.");
      return;
    }
    setLoading(true);
    const uploadedImageUrls = [...imageUrls];
    try {
      // Upload new images
      for (let i = 0; i < images.length; i++) {
        const url = await uploadImage(images[i], albumId, i);
        uploadedImageUrls.push(url);
      }
      // Upload cover image if changed
      let newCoverUrl = coverUrl;
      if (coverFile) {
        newCoverUrl = await uploadImage(coverFile, albumId, 0);
      }
      await updateAlbum(albumId, {
        title: albumName,
        description,
        images: uploadedImageUrls,
        layout: selectedLayout,
        coverUrl: newCoverUrl || uploadedImageUrls[0],
        matConfig: { ...matConfig, cycleDuration },
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
          <div className="grid grid-cols-3 gap-4 pb-2">
            {imageUrls.map((img, idx) => (
              <DraggableMedia
                key={img + idx}
                idx={idx}
                img={img}
                removeImage={removeImage}
                moveMedia={moveMediaDnd}
              />
            ))}
            {imageObjectUrls.map((img, idx) => (
              <DraggableMedia
                key={img + "new" + idx}
                idx={imageUrls.length + idx}
                img={img}
                removeImage={removeImage}
                moveMedia={moveMediaDnd}
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
