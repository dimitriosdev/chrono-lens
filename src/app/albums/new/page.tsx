"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { addAlbum } from "@/lib/firestore";
import { uploadImage } from "@/lib/storage";
import { AlbumForm } from "@/components/AlbumForm";
import { AlbumImage } from "@/entities/Album";
import { AlbumLayout } from "@/features/albums/AlbumLayout";
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

      // Generate a temporary albumId for storage paths
      const tempAlbumId = `${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}`;
      const albumImages: AlbumImage[] = [];

      // Upload images
      for (let i = 0; i < formData.images.length; i++) {
        const image = formData.images[i];
        let url = image.url;

        // Upload new files
        if (image.file) {
          url = await uploadImage(image.file, tempAlbumId, i);
        }

        const albumImage: AlbumImage = { url };
        if (image.description?.trim()) {
          albumImage.description = image.description.trim();
        }

        albumImages.push(albumImage);
      }

      await addAlbum({
        title: formData.title,
        images: albumImages,
        layout: formData.layout,
        matConfig: {
          ...formData.matConfig,
          cycleDuration: formData.cycleDuration,
        },
        coverUrl: albumImages[0]?.url,
        userId,
        createdAt: new Date(),
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
