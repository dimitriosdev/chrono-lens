"use client";
import React, { useState } from "react";
import {
  ALBUM_LAYOUTS,
  AlbumLayout as AlbumLayoutType,
} from "../../../features/albums/AlbumLayout";
import { useRouter } from "next/navigation";
import AlbumsLayout from "../layout";
import Image from "next/image";
import { addAlbum } from "@/lib/firestore";
import { uploadImage } from "@/lib/storage";

const NewAlbumPage: React.FC = () => {
  const [images, setImages] = useState<File[]>([]);
  const [albumName, setAlbumName] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [selectedLayout, setSelectedLayout] = useState<AlbumLayoutType>(
    ALBUM_LAYOUTS.find((l) => l.type === "slideshow") || ALBUM_LAYOUTS[0]
  );
  const router = useRouter();

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    setImages(Array.from(files));
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    e.target.value = "";
  };

  const removeImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    if (!albumName || images.length === 0) return;
    setLoading(true);

    // Generate a temporary albumId for storage paths
    const tempAlbumId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const imageUrls: string[] = [];
    try {
      for (let i = 0; i < images.length; i++) {
        const url = await uploadImage(images[i], tempAlbumId, i);
        imageUrls.push(url);
      }
      await addAlbum({
        title: albumName,
        images: imageUrls,
        layout: selectedLayout,
        description: "",
        coverUrl: imageUrls[0],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      setSuccess(true);
      setTimeout(() => {
        router.push("/albums");
      }, 1200);
    } catch (err) {
      setSuccess(false);
    }
    setLoading(false);
  };

  // Example sign out logic: redirect to login page
  const handleSignOut = () => {
    router.push("/");
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 bg-gray-950 rounded-xl shadow-xl">
      <h1 className="text-3xl font-bold mb-8 text-cyan-400">
        Create New Album
      </h1>
      <form
        className="space-y-8"
        onSubmit={(e) => {
          e.preventDefault();
          handleSave();
        }}
      >
        {success && (
          <div className="bg-green-100 text-green-800 px-4 py-2 rounded mb-2 text-center border border-green-300">
            Album created! Redirecting...
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
            className="block mb-3 w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-cyan-50 file:text-cyan-700 hover:file:bg-cyan-100"
            onChange={handleInput}
          />
          <div className="grid grid-cols-3 gap-4 pb-2">
            {images.map((img, idx) => (
              <div key={idx} className="relative group">
                <div className="w-32 h-32 relative rounded-lg overflow-hidden border border-gray-800 bg-gray-900">
                  <Image
                    src={URL.createObjectURL(img)}
                    alt={`Media ${idx + 1}`}
                    fill
                    className="object-cover"
                    sizes="128px"
                  />
                </div>
                <button
                  type="button"
                  aria-label="Remove media"
                  className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-lg font-bold shadow hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 transition"
                  style={{ zIndex: 20 }}
                  onClick={() => removeImage(idx)}
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        </div>
        <div className="mb-2 text-left">
          <label
            htmlFor="layout-select"
            className="text-cyan-400 font-semibold mr-2"
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
            className="bg-gray-800 text-white rounded px-3 py-2 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
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
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Album Title
          </label>
          <input
            type="text"
            name="title"
            value={albumName}
            onChange={(e) => setAlbumName(e.target.value)}
            className="w-full p-3 border border-gray-700 rounded-lg bg-gray-900 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            placeholder="Enter album title"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-cyan-600 text-white py-3 rounded-lg font-semibold shadow hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
          disabled={!albumName || images.length === 0 || loading}
        >
          {loading ? "Saving..." : "Save Album"}
        </button>
      </form>
    </div>
  );
};

export default NewAlbumPage;
