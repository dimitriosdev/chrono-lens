"use client";
import React, { useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";

// Mat board mockup component
const matColors = [
  { name: "Classic White", outer: "#f8f8f8", inner: "#4b306a" },
  { name: "Soft Yellow", outer: "#ffe88a", inner: "#222" },
  { name: "Modern Grey", outer: "#bfc2c3", inner: "#222" },
  { name: "Blush Pink", outer: "#f8e1ea", inner: "#d16ba5" },
];

function MatBoardMockup({
  config,
  setConfig,
}: {
  config: MatConfig;
  setConfig: (c: MatConfig) => void;
}) {
  const { selected, matWidth } = config;
  // Add 'No Mat' option
  const matOptions = [
    { name: "No Mat", outer: "#000", inner: "#000" },
    ...matColors,
  ];
  const color = matOptions[selected];
  const frameWidth = 400;
  const frameHeight = 300;
  const minPercent = 5;
  const maxPercent = 40;
  const matPercent = matWidth || minPercent;
  const matPx =
    selected === 0
      ? 0
      : Math.floor((matPercent / 100) * Math.min(frameWidth, frameHeight));
  return (
    <div style={{ padding: 32 }}>
      <h2 className="text-lg font-semibold mb-2">Mat Board Frame Mockup</h2>
      <div style={{ marginBottom: 16 }}>
        <label>Mat Color: </label>
        <select
          value={selected}
          onChange={(e) =>
            setConfig({ ...config, selected: Number(e.target.value) })
          }
        >
          {matOptions.map((c, i) => (
            <option value={i} key={c.name}>
              {c.name}
            </option>
          ))}
        </select>
        {selected !== 0 && (
          <>
            <label style={{ marginLeft: 16 }}>Mat Width: </label>
            <input
              type="range"
              min={minPercent}
              max={maxPercent}
              value={matPercent}
              onChange={(e) =>
                setConfig({ ...config, matWidth: Number(e.target.value) })
              }
            />
            <span> {matPercent}%</span>
          </>
        )}
      </div>
      <div
        style={{
          position: "relative",
          width: frameWidth,
          height: frameHeight,
          background: color.outer,
          boxShadow: "0 2px 8px #aaa",
        }}
      >
        {/* Outer mat (skip if No Mat) */}
        {selected !== 0 && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background: color.outer,
              border: `4px solid ${color.inner}`,
              boxSizing: "border-box",
            }}
          />
        )}
        {/* Artwork area */}
        <div
          style={{
            position: "absolute",
            top: matPx,
            left: matPx,
            width: frameWidth - matPx * 2,
            height: frameHeight - matPx * 2,
            background: selected === 0 ? "#000" : "#fff",
            boxShadow: selected !== 0 ? "0 0 0 1px #ccc" : undefined,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
            color: "#888",
          }}
        >
          Artwork
        </div>
      </div>
    </div>
  );
}
type MatConfig = {
  selected: number;
  matWidth: number;
  doubleMat: boolean;
};

import {
  ALBUM_LAYOUTS,
  AlbumLayout as AlbumLayoutType,
} from "../../../../features/albums/AlbumLayout";

export default function EditAlbumPage() {
  const params = useParams();
  const albumId = params?.albumId || "demo";
  const [matConfig, setMatConfig] = useState<MatConfig>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(`album-mat-config-${albumId}`);
      if (saved) return JSON.parse(saved);
    }
    return { selected: 0, matWidth: 40, doubleMat: true };
  });
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

  const [form, setForm] = useState(album);
  const [selectedLayout, setSelectedLayout] = useState<AlbumLayoutType>(
    ALBUM_LAYOUTS[0]
  );
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [media, setMedia] = useState<string[]>(album.images);
  const [error, setError] = useState<string>("");

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
    const newImages = Array.from(files).map((file) =>
      URL.createObjectURL(file)
    );
    setMedia((prev) => [...prev, ...newImages]);
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
    if (typeof window !== "undefined") {
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
    }

    window.location.href = "/albums";
  };

  return (
    <div className="max-w-xl mx-auto py-12">
      <MatBoardMockup config={matConfig} setConfig={setMatConfig} />
      <h1 className="text-2xl font-bold mb-6">Edit Album</h1>
      <form className="space-y-6" onSubmit={handleSubmit}>
        {error && (
          <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-2 text-center">
            {error}
          </div>
        )}
        <div>
          <label className="block text-sm font-medium mb-2">Album Media</label>
          <input
            id="addMediaInput"
            type="file"
            multiple
            accept="image/*"
            className="block mb-2"
            onChange={(e) => {
              handleAddMedia(e.target.files);
              e.target.value = "";
            }}
          />
          <div className="grid grid-cols-3 gap-4 pb-2">
            {media.map((img, idx) => (
              <div key={img} className="relative group">
                <div className="w-32 h-32 relative">
                  <Image
                    src={img}
                    alt={`Media ${idx + 1}`}
                    fill
                    className="rounded object-cover border border-gray-700"
                    sizes="128px"
                  />
                </div>
                <button
                  type="button"
                  aria-label="Remove media"
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-base font-bold hover:bg-red-600 focus:outline-none transition"
                  style={{ zIndex: 20 }}
                  onClick={() => handleRemoveMedia(idx)}
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        </div>
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-1">
            Title
          </label>
          <input
            id="title"
            name="title"
            type="text"
            value={form.title}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded bg-gray-900 text-white"
            required
          />
        </div>
        <div className="mb-2 text-left">
          <label
            htmlFor="layout-select"
            className="text-blue-600 font-medium mr-2"
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
            className="bg-gray-800 text-white rounded px-3 py-2"
          >
            {ALBUM_LAYOUTS.map((layout) => (
              <option key={layout.name} value={layout.name}>
                {layout.name}
              </option>
            ))}
          </select>
          <span className="ml-2 text-gray-400">
            {selectedLayout.description}
          </span>
        </div>
        <div>
          <label htmlFor="cover" className="block text-sm font-medium mb-1">
            Cover Image
          </label>
          <div className="mb-2 w-32 h-32 relative">
            <Image
              src={
                coverFile
                  ? URL.createObjectURL(coverFile as Blob)
                  : album.coverUrl
              }
              alt="Album cover"
              fill
              className="object-cover rounded"
              sizes="128px"
            />
          </div>
          <input
            id="cover"
            name="cover"
            type="file"
            accept="image/*"
            className="block w-full text-sm text-gray-400"
            onChange={handleFileChange}
          />
        </div>
        <div className="flex gap-4 mt-8">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded shadow disabled:opacity-50"
            disabled={!form.title.trim() || media.length === 0}
          >
            Save Changes
          </button>
          <button
            type="button"
            className="bg-gray-700 hover:bg-gray-800 text-white font-semibold px-6 py-2 rounded"
            onClick={() => window.history.back()}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
