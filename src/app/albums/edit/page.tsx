"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getAlbum, updateAlbum } from "@/shared/lib/firestore";
import { uploadImage } from "@/shared/lib/storage";
import { AlbumForm } from "@/features/albums/components/AlbumForm";
import { AlbumImage, Album } from "@/shared/types/album";
import { ErrorBoundary } from "@/shared/components";

export default function EditAlbumPage() {
  const { isSignedIn, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const albumId = searchParams.get("id");
  const [isLoading, setIsLoading] = useState(true);
  const [album, setAlbum] = useState<Album | null>(null);

  useEffect(() => {
    if (!loading && !isSignedIn) {
      router.replace("/");
    }
  }, [isSignedIn, loading, router]);

  useEffect(() => {
    async function fetchAlbum() {
      if (!albumId) return;

      try {
        const fetchedAlbum = await getAlbum(albumId);
        if (fetchedAlbum) {
          setAlbum(fetchedAlbum);
        }
      } catch (error) {
        console.error("Error fetching album:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchAlbum();
  }, [albumId]);

  const handleSubmit = async (
    albumData: Omit<Album, "id" | "createdAt" | "updatedAt">
  ) => {
    if (!albumId) return;

    try {
      // Handle image uploads for new files
      const processedImages: AlbumImage[] = [];

      for (let i = 0; i < albumData.images.length; i++) {
        const img = albumData.images[i];
        if (img.file) {
          // New image - upload it
          const uploadedUrl = await uploadImage(img.file, albumId, i);
          processedImages.push({
            url: uploadedUrl,
            description: img.description || "",
          });
        } else {
          // Existing image
          processedImages.push({
            url: img.url,
            description: img.description || "",
          });
        }
      }

      // Update the album
      await updateAlbum(albumId, {
        title: albumData.title,
        description: albumData.description,
        privacy: albumData.privacy, // Include privacy setting
        tags: albumData.tags, // Include tags
        shareToken: albumData.shareToken, // Include share token
        images: processedImages,
        layout: albumData.layout,
        matConfig: albumData.matConfig,
        cycleDuration: albumData.cycleDuration,
        updatedAt: new Date(),
      });

      // Navigate back to albums
      router.push("/albums");
    } catch (error) {
      console.error("Error updating album:", error);
      alert("Failed to update album. Please try again.");
    }
  };

  if (loading || !isSignedIn) return null;

  if (!albumId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-center p-6">
          <h1 className="text-xl sm:text-2xl font-bold text-white mb-3">
            Album Not Found
          </h1>
          <p className="text-neutral-400 mb-4 text-sm sm:text-base">
            No album ID provided in the URL.
          </p>
          <button
            onClick={() => router.push("/albums")}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            Back to Albums
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-neutral-400 text-sm">Loading album...</span>
        </div>
      </div>
    );
  }

  if (!album) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-center p-6">
          <h1 className="text-xl sm:text-2xl font-bold text-white mb-3">
            Album Not Found
          </h1>
          <p className="text-neutral-400 mb-4 text-sm sm:text-base">
            Could not load album data.
          </p>
          <button
            onClick={() => router.push("/albums")}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            Back to Albums
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <ErrorBoundary
        onError={(error, errorInfo) => {
          console.error("Album edit form error:", error, errorInfo);
        }}
      >
        <AlbumForm mode="edit" album={album} onSave={handleSubmit} />
      </ErrorBoundary>
    </div>
  );
}
