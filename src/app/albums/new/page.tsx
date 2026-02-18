/**
 * New Album Page
 *
 * Page for creating new photo albums with multi-page slideshow support.
 */
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/shared/context";
import { addAlbum, updateAlbum } from "@/shared/lib/firestore";
import {
  MultiPageLayoutStep,
  AlbumPageHeader,
  TitleValidationMessage,
  TagsInput,
} from "@/features/albums/components";
import {
  processAlbumPages,
  createAlbumLayoutMetadata,
  createMatConfigFromPages,
} from "@/features/albums/utils/albumSave";
import { AlbumPage } from "@/shared/types/album";
import { ErrorBoundary } from "@/shared/components";
import { checkRateLimit } from "@/shared/utils/security";

/** Minimum title length for validation */
const MIN_TITLE_LENGTH = 3;

/** Default cycle duration in seconds */
const DEFAULT_CYCLE_DURATION = 10;

export default function NewAlbumPage() {
  const { isSignedIn, loading } = useAuth();
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [pages, setPages] = useState<AlbumPage[]>([]);
  const [cycleDuration, setCycleDuration] = useState(DEFAULT_CYCLE_DURATION);

  // Redirect unauthenticated users
  useEffect(() => {
    if (!loading && !isSignedIn) {
      router.replace("/");
    }
  }, [isSignedIn, loading, router]);

  const handlePagesChange = useCallback(
    (newPages: AlbumPage[], newCycleDuration: number) => {
      setPages(newPages);
      setCycleDuration(newCycleDuration);
    },
    [],
  );

  // Don't render until auth is resolved
  if (loading || !isSignedIn) return null;

  // Validation
  const totalFilledSlots = pages.reduce(
    (sum, page) => sum + page.slots.filter((s) => s.imageId).length,
    0,
  );
  const canSave =
    title.trim().length >= MIN_TITLE_LENGTH && totalFilledSlots > 0;

  const handleSave = async () => {
    if (pages.length === 0 || !canSave) return;

    setIsSaving(true);

    try {
      const userId = localStorage.getItem("userId") || `user_${Date.now()}`;

      // Rate limit check
      const maxAlbums = process.env.NODE_ENV === "development" ? 20 : 5;
      if (!checkRateLimit(userId, maxAlbums, 60000)) {
        throw new Error(
          "Too many album creation requests. Please wait a minute.",
        );
      }

      // Create album document first (with empty images/pages)
      const albumId = await addAlbum({
        title: title.trim(),
        description: "",
        privacy: "private",
        tags: tags,
        images: [],
        pages: [],
        cycleDuration,
        layout: createAlbumLayoutMetadata(pages.length),
        matConfig: createMatConfigFromPages(pages),
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Process and upload images
      const processedData = await processAlbumPages({
        pages,
        albumId,
      });

      // Update album with uploaded images and pages
      await updateAlbum(albumId, {
        images: processedData.images,
        coverUrl: processedData.coverUrl,
        pages: processedData.pages,
        updatedAt: new Date(),
      });

      router.push("/albums");
    } catch (error) {
      console.error("Error creating album:", error);
      alert("Failed to create album. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex h-[100dvh] flex-col bg-gray-100">
      <ErrorBoundary
        onError={(error, errorInfo) => {
          console.error("Album creation error:", error, errorInfo);
        }}
      >
        <AlbumPageHeader
          title={title}
          onTitleChange={setTitle}
          onBack={() => router.push("/albums")}
          onSave={handleSave}
          isSaving={isSaving}
          canSave={canSave}
        />

        <TitleValidationMessage title={title} minLength={MIN_TITLE_LENGTH} />

        {/* Main Content */}
        <div className="min-h-0 flex-1 overflow-auto p-3 sm:p-4">
          <div className="flex min-h-full flex-col rounded-lg bg-white p-3 shadow-sm sm:p-4 gap-6">
            {/* Tags Section */}
            <div>
              <TagsInput tags={tags} onTagsChange={setTags} />
            </div>

            {/* Layout Section */}
            <MultiPageLayoutStep
              onPagesChange={handlePagesChange}
              initialCycleDuration={DEFAULT_CYCLE_DURATION}
              className="flex-1"
            />
          </div>
        </div>
      </ErrorBoundary>
    </div>
  );
}
