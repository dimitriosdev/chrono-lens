"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getAlbum, updateAlbum } from "@/lib/firestore";
import { uploadImage, deleteImage } from "@/lib/storage";
import { AlbumForm } from "@/components/AlbumForm";
import { AlbumImage } from "@/entities/Album";
import { ALBUM_LAYOUTS, AlbumLayout } from "@/features/albums/AlbumLayout";
import { MatConfig } from "@/components/EnhancedMatBoard";

interface AlbumFormData {
  title: string;
  images: Array<{
    id: string;
    url: string;
    description?: string;
    file?: File;
  }>;
  layout: AlbumLayout;
  matConfig: MatConfig;
  cycleDuration: number;
  timing?: {
    slideshow?: {
      cycleDuration: number;
    };
    interactive?: {
      autoAdvance: boolean;
      autoAdvanceDuration: number;
      transitionSpeed: "fast" | "normal" | "smooth";
    };
  };
}

const EditAlbumPage: React.FC = () => {
  const { isSignedIn, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const albumId = params?.albumId as string;
  const [album, setAlbum] = useState<import("@/entities/Album").Album | null>(
    null
  );
  const [albumLoading, setAlbumLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    if (!loading && !isSignedIn) {
      router.replace("/");
    }
  }, [isSignedIn, loading, router]);

  useEffect(() => {
    async function fetchAlbum() {
      if (!albumId) return;
      setPageLoading(true);
      const data = await getAlbum(albumId);
      setAlbum(data);
      setPageLoading(false);
    }
    fetchAlbum();
  }, [albumId]);

  if (loading || !isSignedIn) return null;

  if (pageLoading) {
    return (
      <div className="py-8 px-4">
        <div className="max-w-2xl mx-auto py-12 px-4 bg-gray-900 rounded-xl shadow-xl text-center text-gray-300">
          Loading album...
        </div>
      </div>
    );
  }

  if (!album) {
    return (
      <div className="py-8 px-4">
        <div className="max-w-2xl mx-auto py-12 px-4 bg-gray-900 rounded-xl shadow-xl text-center text-red-400">
          Album not found.
        </div>
      </div>
    );
  }

  const handleSave = async (formData: AlbumFormData) => {
    setAlbumLoading(true);

    try {
      const albumImages: AlbumImage[] = [];

      // Process images - upload new ones and keep existing ones
      for (let i = 0; i < formData.images.length; i++) {
        const image = formData.images[i];
        let url = image.url;

        // Upload new files
        if (image.file) {
          url = await uploadImage(image.file, albumId, i);
        }

        const albumImage: AlbumImage = { url };
        if (image.description?.trim()) {
          albumImage.description = image.description.trim();
        }

        albumImages.push(albumImage);
      }

      // Delete images that were removed (if any)
      const originalImages = album.images || [];
      const currentUrls = new Set(albumImages.map((img) => img.url));

      for (const originalImage of originalImages) {
        const originalUrl =
          typeof originalImage === "string" ? originalImage : originalImage.url;
        if (!currentUrls.has(originalUrl)) {
          await deleteImage(originalUrl);
        }
      }

      await updateAlbum(albumId, {
        title: formData.title,
        images: albumImages,
        layout: formData.layout,
        coverUrl: albumImages[0]?.url,
        matConfig: {
          matWidth: formData.matConfig.matWidth || 40,
          matColor: formData.matConfig.matColor || "#000",
          cycleDuration: formData.cycleDuration,
        },
        timing: formData.timing,
        updatedAt: new Date(),
      });

      router.push("/albums");
    } finally {
      setAlbumLoading(false);
    }
  };

  // Transform album data to form format
  const initialData = {
    title: album.title || "",
    images: (album.images || []).map((img, index) => {
      const imageData =
        typeof img === "string" ? { url: img, description: "" } : img;
      return {
        id: `existing-${index}`,
        url: imageData.url,
        description: imageData.description || "",
        isNew: false,
      };
    }),
    layout: album.layout || ALBUM_LAYOUTS[0],
    matConfig: album.matConfig || { matWidth: 40, matColor: "#000" },
    cycleDuration: album.matConfig?.cycleDuration || 2000,
    timing: album.timing || {
      slideshow: {
        cycleDuration: 5,
      },
      interactive: {
        autoAdvance: false,
        autoAdvanceDuration: 5,
        transitionSpeed: "normal" as const,
      },
    },
    coverUrl: album.coverUrl,
  };

  return (
    <div className="py-8 px-4">
      <AlbumForm
        mode="edit"
        initialData={initialData}
        onSave={handleSave}
        loading={albumLoading}
      />
    </div>
  );
};

export default EditAlbumPage;
