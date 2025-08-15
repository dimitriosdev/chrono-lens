"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import AlbumsLayout from "../layout";
import Image from "next/image";

const NewAlbumPage: React.FC = () => {
  const [images, setImages] = useState<File[]>([]);
  const [albumName, setAlbumName] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
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
    await new Promise((res) => setTimeout(res, 1200));
    setLoading(false);
    setSuccess(true);
    setTimeout(() => {
      router.push("/albums");
    }, 1200);
  };

  // Example sign out logic: redirect to login page
  const handleSignOut = () => {
    router.push("/");
  };

  return (
    <AlbumsLayout onSignOut={handleSignOut} isLoggedIn={true}>
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
        <h1 className="text-2xl font-bold mb-4">Create New Album</h1>
        <input
          type="text"
          placeholder="Album name"
          className="mb-4 w-full max-w-md px-4 py-2 rounded border border-gray-300 focus:outline-none focus:ring"
          value={albumName}
          onChange={(e) => setAlbumName(e.target.value)}
          aria-label="Album name"
        />
        <div
          className="w-full max-w-md border-2 border-dashed border-gray-700 rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer bg-gray-900 mb-4"
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => document.getElementById("fileInput")?.click()}
          role="button"
          tabIndex={0}
          aria-label="Upload images"
        >
          <p className="mb-2 text-gray-200">
            Drag & drop images here, or click to select files
          </p>
          <input
            id="fileInput"
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={handleInput}
          />
        </div>
        <div className="grid grid-cols-3 gap-2 w-full max-w-md mb-4">
          {images.map((img, idx) => (
            <div key={idx} className="relative group">
              <Image
                src={URL.createObjectURL(img)}
                alt="preview"
                width={120}
                height={96}
                className="w-full h-24 object-cover rounded"
                unoptimized
              />
              <button
                type="button"
                className="absolute top-1 right-1 bg-gray-900 bg-opacity-70 text-white rounded-full p-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeImage(idx)}
                aria-label="Remove image"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
        <button
          className="w-full max-w-md bg-cyan-500 text-white font-bold py-3 rounded-lg text-lg disabled:opacity-50 mb-2"
          onClick={handleSave}
          disabled={!albumName || images.length === 0 || loading}
          aria-label="Save album"
        >
          {loading ? "Saving..." : "Save Album"}
        </button>
        {success && (
          <div className="w-full max-w-md bg-green-100 text-green-800 text-center py-2 rounded mb-2">
            Album created! Redirecting...
          </div>
        )}
      </div>
    </AlbumsLayout>
  );
};

export default NewAlbumPage;
