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
      <div className="flex justify-center w-full pt-8 pb-8">
        <div className="w-full max-w-xl bg-gray-900 rounded-2xl shadow-2xl mx-auto p-6 flex flex-col gap-6 border border-gray-800 text-center">
          <h1 className="text-3xl font-bold mb-2 text-cyan-400 text-center">
            Create New Album
          </h1>
          <input
            type="text"
            placeholder="Album name"
            className="mb-2 w-full px-4 py-2 rounded-lg border border-gray-700 bg-gray-950 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
            value={albumName}
            onChange={(e) => setAlbumName(e.target.value)}
            aria-label="Album name"
          />
          <div
            className="w-full border-2 border-dashed border-cyan-700 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer bg-gray-950 hover:bg-gray-900 transition mb-2"
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => document.getElementById("fileInput")?.click()}
            role="button"
            tabIndex={0}
            aria-label="Upload images"
          >
            <p className="mb-2 text-cyan-300 text-lg font-medium">
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
          {images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full mb-2">
              {images.map((img, idx) => (
                <div key={idx} className="relative group">
                  <Image
                    src={URL.createObjectURL(img)}
                    alt="preview"
                    width={140}
                    height={110}
                    className="w-full h-28 object-cover rounded-xl border border-gray-800"
                    unoptimized
                  />
                  <button
                    type="button"
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-lg font-bold hover:bg-red-600 focus:outline-none transition"
                    style={{ zIndex: 20 }}
                    onClick={() => removeImage(idx)}
                    aria-label="Remove image"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          )}
          <button
            className="w-full bg-cyan-500 hover:bg-cyan-400 text-white font-bold py-3 rounded-xl text-lg disabled:opacity-50 shadow-lg transition"
            onClick={handleSave}
            disabled={!albumName || images.length === 0 || loading}
            aria-label="Save album"
          >
            {loading ? "Saving..." : "Save Album"}
          </button>
          {success && (
            <div className="w-full bg-green-100 text-green-800 text-center py-2 rounded-xl mb-2">
              Album created! Redirecting...
            </div>
          )}
        </div>
      </div>
    </AlbumsLayout>
  );
};

export default NewAlbumPage;
