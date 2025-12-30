"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/shared/context";
import { addAlbum } from "@/shared/lib/firestore";
import { uploadImage } from "@/shared/lib/storage";
import { AlbumForm } from "@/features/albums/components/AlbumForm";
import { AlbumImage, Album } from "@/shared/types/album";
import { ErrorBoundary } from "@/shared/components";

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

  const handleSave = async (
    albumData: Omit<Album, "id" | "createdAt" | "updatedAt">
  ) => {
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
        title: albumData.title,
        description: albumData.description,
        privacy: albumData.privacy, // Include privacy setting
        tags: albumData.tags, // Include tags
        images: [], // Start with empty images array
        layout: albumData.layout,
        matConfig: albumData.matConfig,
        // Simplified timing - just cycleDuration
        ...(albumData.cycleDuration && {
          cycleDuration: albumData.cycleDuration,
        }),
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const albumImages: AlbumImage[] = [];

      // Upload images using the real albumId
      for (let i = 0; i < albumData.images.length; i++) {
        const image = albumData.images[i];
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
    <div className="min-h-screen bg-gray-950">
      <ErrorBoundary
        onError={(error, errorInfo) => {
          console.error("Album creation form error:", error, errorInfo);
        }}
      >
        <AlbumForm mode="create" onSave={handleSave} loading={albumLoading} />
      </ErrorBoundary>
    </div>
  );
};

export default NewAlbumPage;
