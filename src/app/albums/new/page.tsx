"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { addAlbum } from "@/shared/lib/firestore";
import { uploadImage } from "@/shared/lib/storage";
import { AlbumForm } from "@/features/albums/components/AlbumForm";
import { AlbumImage } from "@/features/albums/types/Album";
import { AlbumLayout } from "@/features/albums/constants/AlbumLayout";
import { MatConfig } from "@/features/albums/components/EnhancedMatBoard";

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

const NewAlbumPage: React.FC = () => {
  const { isSignedIn, loading } = useAuth();
  const router = useRouter();
  const [albumLoading, setAlbumLoading] = React.useState(false);

  useEffect(() => {
    if (!loading && !isSignedIn) {
      router.replace("/");
    }
  }, [isSignedIn, loading, router]);

  if (loading || !isSignedIn) return null;

  const handleSave = async (formData: AlbumFormData) => {
    setAlbumLoading(true);

    try {
      // Get userId from localStorage (temporary solution until proper auth)
      const userId = localStorage.getItem("userId") || `user_${Date.now()}`;

      // Check rate limit before proceeding (max 5 albums per minute, higher in development)
      const { checkRateLimit } = await import("@/shared/utils/security");
      const maxAlbums = process.env.NODE_ENV === "development" ? 20 : 5;
      if (!checkRateLimit(userId, maxAlbums, 60000)) {
        throw new Error(
          "Too many album creation requests. Please wait a minute before creating another album."
        );
      }

      // Create the album document first to get a real albumId
      const albumId = await addAlbum({
        title: formData.title,
        images: [], // Start with empty images array
        layout: formData.layout,
        matConfig: {
          ...formData.matConfig,
          cycleDuration: formData.cycleDuration,
        },
        timing: formData.timing,
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const albumImages: AlbumImage[] = [];

      // Upload images using the real albumId
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

      // Update the album with the uploaded images
      const { updateAlbum } = await import("@/shared/lib/firestore");
      await updateAlbum(albumId, {
        images: albumImages,
        coverUrl: albumImages[0]?.url,
        updatedAt: new Date(),
      });

      router.push("/albums");
    } finally {
      setAlbumLoading(false);
    }
  };

  return (
    <div className="py-8 px-4">
      <AlbumForm mode="create" onSave={handleSave} loading={albumLoading} />
    </div>
  );
};

export default NewAlbumPage;
