"use client";
import React, { useState } from "react";
import {
  ALBUM_LAYOUTS,
  AlbumLayout as AlbumLayoutType,
} from "../../../../features/albums/AlbumLayout";
import { useParams } from "next/navigation";
import Image from "next/image";
import type { DragEndEvent } from "@dnd-kit/core";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { PhotoIcon } from "@heroicons/react/24/solid";

export default function EditAlbumPage() {
  const params = useParams();
  // const albumId = params?.albumId; // Not used yet
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

  // Basic form state management
  const [form, setForm] = useState(album);
  const [selectedLayout, setSelectedLayout] = useState<AlbumLayoutType>(
    ALBUM_LAYOUTS[0]
  );
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [media, setMedia] = useState<string[]>(album.images);
  const [error, setError] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);

  // Remove media item
  const handleRemoveMedia = (idx: number) => {
    setMedia((prev) => prev.filter((_, i) => i !== idx));
  };

  // dnd-kit sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id && over?.id && active.id !== over.id) {
      const oldIndex = media.findIndex((id) => id === active.id);
      const newIndex = media.findIndex((id) => id === over.id);
      setMedia((items) => arrayMove(items, oldIndex, newIndex));
    }
  };
  // Sortable thumbnail component
  function SortableThumbnail({
    id,
    idx,
    src,
  }: {
    id: string;
    idx: number;
    src: string;
  }) {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
      isSorting,
    } = useSortable({ id });
    return (
      <div
        ref={setNodeRef}
        style={{
          transform: transform ? CSS.Transform.toString(transform) : undefined,
          transition: transition || undefined,
          opacity: isDragging ? 0.4 : 1,
          zIndex: isDragging ? 50 : 1,
          boxShadow: isDragging ? "0 4px 16px rgba(0,0,0,0.25)" : undefined,
          border: isSorting ? "2px solid #2563eb" : undefined,
        }}
        className={`relative group cursor-grab ${
          isDragging ? "ring-2 ring-blue-500" : ""
        }`}
        {...attributes}
        {...listeners}
      >
        <div className="w-32 h-32 relative">
          <Image
            src={src}
            alt={`Media ${idx + 1}`}
            fill
            className={`rounded object-cover border ${
              isDragging ? "border-blue-500" : "border-gray-700"
            } transition-all duration-200`}
            sizes="128px"
          />
        </div>
        {/* Remove button */}
        <button
          type="button"
          aria-label="Remove media"
          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-base font-bold hover:bg-red-600 focus:outline-none transition"
          style={{ zIndex: 20 }}
          onClick={() => handleRemoveMedia(idx)}
        >
          &times;
        </button>
        {/* Drag handle visual */}
        <span className="absolute bottom-1 left-1 text-xs text-gray-400 opacity-70 pointer-events-none select-none">
          &#x2630;
        </span>
      </div>
    );
  }

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
    // TODO: Add API call to update album with selected layout
    // e.g., { ...form, images: media, layout: selectedLayout }
    alert("Album updated! (stub)");
    window.location.href = "/albums";
  };

  return (
    <div className="max-w-xl mx-auto py-12">
      <h1 className="text-2xl font-bold mb-6">Edit Album</h1>
      <form className="space-y-6" onSubmit={handleSubmit}>
        {error && (
          <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-2 text-center">
            {error}
          </div>
        )}
        {/* Media items section with drag-and-drop */}
        <div>
          <label className="block text-sm font-medium mb-2">Album Media</label>
          <div
            className={`mb-4 border-2 border-dashed rounded-lg flex flex-col items-center justify-center transition-colors duration-200 cursor-pointer focus:ring-2 focus:ring-blue-500 focus:outline-none ${
              isDragging
                ? "border-blue-600 bg-blue-50 animate-pulse"
                : "border-blue-300 bg-white"
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              handleAddMedia(e.dataTransfer.files);
            }}
            tabIndex={0}
            role="button"
            aria-label="Upload images"
          >
            <PhotoIcon className="h-10 w-10 text-blue-400 mb-2" />

            <input
              id="addMediaInput"
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                handleAddMedia(e.target.files);
                e.target.value = "";
              }}
            />
            <label
              htmlFor="addMediaInput"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded shadow cursor-pointer mb-2 transition-all duration-150 focus:ring-2 focus:ring-blue-500"
            >
              Upload Images
            </label>
          </div>
          {media.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-blue-400 rounded-lg">
              <p className="mb-2 text-blue-600">
                No media items. Add images to your album.
              </p>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={media}
                strategy={verticalListSortingStrategy}
              >
                <div className="grid grid-cols-3 gap-4 pb-2">
                  {media.map((img, idx) => (
                    <SortableThumbnail key={img} id={img} idx={idx} src={img} />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
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
