"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getAlbum, updateAlbum } from "@/shared/lib/firestore";
import { uploadImage } from "@/shared/lib/storage";
import { AlbumForm } from "@/features/albums/components/AlbumForm";
import { AlbumImage } from "@/features/albums/types/Album";
import { ALBUM_LAYOUTS } from "@/features/albums/constants/AlbumLayout";
import { AlbumFormData } from "@/shared/types/form";

export default function EditAlbumPage() {
  const { isSignedIn, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const albumId = searchParams.get("id");
  const [isLoading, setIsLoading] = useState(true);
  const [initialData, setInitialData] = useState<Partial<AlbumFormData> | null>(
    null
  );

  useEffect(() => {
    if (!loading && !isSignedIn) {
      router.replace("/");
    }
  }, [isSignedIn, loading, router]);

  useEffect(() => {
    async function fetchAlbum() {
      if (!albumId) return;

      try {
        const album = await getAlbum(albumId);
        if (album) {
          const formData: Partial<AlbumFormData> = {
            title: album.title,
            images: (album.images || []).map((img, index) => {
              if (typeof img === "string") {
                return {
                  id: `existing-${index}`,
                  url: img,
                  description: "",
                };
              } else {
                return {
                  id: `existing-${index}`,
                  url: img.url,
                  description: img.description || "",
                };
              }
            }),
            layout: album.layout || ALBUM_LAYOUTS[0],
            matConfig: album.matConfig || {
              matWidth: 5,
              matColor: "#f8f8f8",
            },
            timing: {
              slideshow: album.timing?.slideshow || { cycleDuration: 5 },
              interactive: {
                autoAdvance: album.timing?.interactive?.autoAdvance || false,
                autoAdvanceDuration:
                  album.timing?.interactive?.autoAdvanceDuration || 5,
                transitionSpeed:
                  album.timing?.interactive?.transitionSpeed || "normal",
              },
            },
            cycleDuration: album.timing?.slideshow?.cycleDuration || 5,
          };
          setInitialData(formData);
        }
      } catch (error) {
        console.error("Error fetching album:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchAlbum();
  }, [albumId]);

  const handleSubmit = async (formData: AlbumFormData) => {
    if (!albumId) return;

    try {
      // Handle image uploads for new files
      const processedImages: AlbumImage[] = [];

      for (let i = 0; i < formData.images.length; i++) {
        const img = formData.images[i];
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
        title: formData.title,
        images: processedImages,
        layout: formData.layout,
        matConfig: formData.matConfig,
        timing: formData.timing,
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
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-center">
          <h1 className="text-2xl font-bold mb-4">Album Not Found</h1>
          <p className="mb-4">No album ID provided in the URL.</p>
          <button
            onClick={() => router.push("/albums")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Back to Albums
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white">Loading album...</div>
      </div>
    );
  }

  if (!initialData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-center">
          <h1 className="text-2xl font-bold mb-4">Album Not Found</h1>
          <p className="mb-4">Could not load album data.</p>
          <button
            onClick={() => router.push("/albums")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Back to Albums
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <AlbumForm mode="edit" initialData={initialData} onSave={handleSubmit} />
    </div>
  );
}
