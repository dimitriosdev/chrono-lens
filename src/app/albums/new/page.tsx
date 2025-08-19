"use client";
import React, { useState, useEffect } from "react";
import { MatBoard, MatConfig } from "@/components/MatBoard";
// alias: import * as MatBoardModule from "@/components/MatBoard";
import {
  ALBUM_LAYOUTS,
  AlbumLayout as AlbumLayoutType,
} from "../../../features/albums/AlbumLayout";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { addAlbum } from "@/lib/firestore";
// alias: import * as FirestoreModule from "@/lib/firestore";
import { uploadImage } from "@/lib/storage";
// alias: import * as StorageModule from "@/lib/storage";
import { useAuth } from "@/context/AuthContext";
import { validateAlbumTitle, validateFile } from "../../../lib/security";

const NewAlbumPage: React.FC = () => {
  const { isSignedIn, loading } = useAuth();
  const router = useRouter();
  const [images, setImages] = useState<File[]>([]);
  const [albumName, setAlbumName] = useState("");
  const [loadingAlbum, setLoadingAlbum] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [selectedLayout, setSelectedLayout] = useState<AlbumLayoutType>(
    ALBUM_LAYOUTS.find((l) => l.type === "slideshow") || ALBUM_LAYOUTS[0]
  );
  const [matConfig, setMatConfig] = useState<MatConfig>({
    matWidth: 40,
    matColor: "#000",
  });
  const [cycleDuration, setCycleDuration] = useState(2000);

  useEffect(() => {
    if (!loading && !isSignedIn) {
      router.replace("/");
    }
  }, [isSignedIn, loading, router]);

  if (loading || !isSignedIn) return null;

  const handleFiles = (files: FileList | null) => {
    if (!files) return;

    const validFiles: File[] = [];
    const errors: string[] = [];

    Array.from(files).forEach((file) => {
      const validation = validateFile(file);
      if (validation.isValid) {
        validFiles.push(file);
      } else {
        errors.push(`${file.name}: ${validation.error}`);
      }
    });

    if (errors.length > 0) {
      setError(errors.join("; "));
    } else {
      setError("");
    }

    setImages(validFiles);
  };

  const removeImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    // Validate title
    const titleValidation = validateAlbumTitle(albumName);
    if (!titleValidation.isValid) {
      setError(titleValidation.error || "Invalid title");
      return;
    }

    if (images.length === 0) {
      setError("At least one image is required");
      return;
    }

    // Get userId from localStorage (temporary solution until proper auth)
    const userId = localStorage.getItem("userId") || `user_${Date.now()}`;

    setLoadingAlbum(true);
    setError("");

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
        matConfig: { ...matConfig, cycleDuration },
        description: "",
        coverUrl: imageUrls[0],
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      setSuccess(true);
      setTimeout(() => {
        router.push("/albums");
      }, 1200);
    } catch (err) {
      console.error("Failed to create album:", err);
      setError("Failed to create album. Please try again.");
      setSuccess(false);
    }
    setLoadingAlbum(false);
  };

  // Example sign out logic: redirect to login page
  // const handleSignOut = () => {
  //   router.push("/");
  // };

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
            className="block mb-3 w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-cyan-50 file:text-cyan-700 hover:file:bg-cyan-100"
            onChange={(e) => {
              handleFiles(e.target.files);
              e.target.value = "";
            }}
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
        <MatBoard
          config={matConfig}
          setConfig={setMatConfig}
          layout={selectedLayout}
        />
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
            className="w-32 px-2 py-1 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-cyan-600 text-white py-3 rounded-lg font-semibold shadow hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
          disabled={!albumName || images.length === 0 || loadingAlbum}
        >
          {loadingAlbum ? "Saving..." : "Save Album"}
        </button>
      </form>
    </div>
  );
};

export default NewAlbumPage;
