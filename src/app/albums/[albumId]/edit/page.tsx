"use client";
import React, { useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import {
  ALBUM_LAYOUTS,
  AlbumLayout as AlbumLayoutType,
} from "@/features/albums/AlbumLayout";
import { MatBoard, MatConfig } from "@/components/MatBoard";

export default function EditAlbumPage() {
  const params = useParams();
  const albumId = params?.albumId || "demo";
  const album = {
    title: "Sample Album",
    description: "A description of the album.",
    coverUrl: "/bg-img.jpg",
    images: [
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=400&q=80",
    ],
  };

  const [matConfig, setMatConfig] = useState<MatConfig>({
    selected: 0,
    matWidth: 40,
    doubleMat: true,
  });
  const [form, setForm] = useState(album);
  const [selectedLayout, setSelectedLayout] = useState<AlbumLayoutType>(
    ALBUM_LAYOUTS.find((l) => l.name === "Slideshow") || ALBUM_LAYOUTS[0]
  );
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [media, setMedia] = useState<string[]>(album.images);
  const [error, setError] = useState<string>("");
  const [isClient, setIsClient] = useState(false);

  // Load matConfig from localStorage on client only
  React.useEffect(() => {
    setIsClient(true);
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(`album-mat-config-${albumId}`);
      if (saved) setMatConfig(JSON.parse(saved));
    }
  }, [albumId]);

  const handleRemoveMedia = (idx: number) => {
    setMedia((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCoverFile(e.target.files[0]);
    }
  };

  const handleAddMedia = (files: FileList | null) => {
    if (!files) return;
    if (isClient) {
      const newImages = Array.from(files).map((file) =>
        URL.createObjectURL(file)
      );
      setMedia((prev) => [...prev, ...newImages]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError("Album title is required.");
      return;
    }
    if (media.length === 0) {
      setError("At least one media item is required.");
      return;
    }
    setError("");
    // Save mat config and album edits to localStorage
    if (isClient) {
      localStorage.setItem(
        `album-mat-config-${albumId}`,
        JSON.stringify(matConfig)
      );
      localStorage.setItem(
        `album-edit-${albumId}`,
        JSON.stringify({
          title: form.title,
          description: form.description,
          coverUrl: coverFile
            ? URL.createObjectURL(coverFile as Blob)
            : album.coverUrl,
          images: media,
          layout: selectedLayout,
        })
      );
      window.location.href = "/albums";
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 bg-gray-950 rounded-xl shadow-xl">
      <h1 className="text-3xl font-bold mb-8 text-gray-100">Edit Album</h1>
      <form className="space-y-8" onSubmit={handleSubmit}>
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
              handleAddMedia(e.target.files);
              e.target.value = "";
            }}
          />
          <div className="grid grid-cols-3 gap-4 pb-2">
            {media.map((img, idx) => (
              <div key={img} className="relative group">
                <div className="w-32 h-32 relative rounded-lg overflow-hidden border border-gray-800 bg-gray-900">
                  {isClient && (
                    <Image
                      src={img}
                      alt={`Media ${idx + 1}`}
                      fill
                      className="object-cover"
                      sizes="128px"
                    />
                  )}
                </div>
                <button
                  type="button"
                  aria-label="Remove media"
                  className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-lg font-bold shadow hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 transition"
                  style={{ zIndex: 20 }}
                  onClick={() => handleRemoveMedia(idx)}
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
        </div>
        <MatBoard config={matConfig} setConfig={setMatConfig} />
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Album Title
          </label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
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
            onChange={handleFileChange}
          />
          {coverFile && (
            <div className="relative w-32 h-32 mb-2 rounded-lg overflow-hidden border border-gray-800 bg-gray-900">
              <Image
                src={URL.createObjectURL(coverFile)}
                alt="Cover Image"
                fill
                className="object-cover"
                sizes="128px"
              />
            </div>
          )}
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
}
