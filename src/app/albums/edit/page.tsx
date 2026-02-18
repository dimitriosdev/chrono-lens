/**
 * Edit Album Page
 *
 * Page for editing existing photo albums.
 */
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/shared/context";
import { getAlbum, updateAlbum } from "@/shared/lib/firestore";
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
import { AlbumPage, Album } from "@/shared/types/album";
import { ErrorBoundary } from "@/shared/components";

/** Minimum title length for validation */
const MIN_TITLE_LENGTH = 3;

/** Default cycle duration in seconds */
const DEFAULT_CYCLE_DURATION = 10;

export default function EditAlbumPage() {
  const { isSignedIn, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const albumId = searchParams.get("id");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [album, setAlbum] = useState<Album | null>(null);
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [pages, setPages] = useState<AlbumPage[]>([]);
  const [cycleDuration, setCycleDuration] = useState(DEFAULT_CYCLE_DURATION);
  const [initialPages, setInitialPages] = useState<AlbumPage[] | undefined>(
    undefined,
  );

  // Redirect unauthenticated users
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
          setTitle(fetchedAlbum.title || "");
          setTags(fetchedAlbum.tags || []);
          setCycleDuration(fetchedAlbum.cycleDuration || 10);

          // Extract pages if available (new format)
          if (fetchedAlbum.pages && fetchedAlbum.pages.length > 0) {
            setInitialPages(fetchedAlbum.pages);
          } else if (fetchedAlbum.layout?.template?.slots) {
            // Convert old single-page format to new multi-page format
            const savedSlots = fetchedAlbum.layout.template.slots;
            const count = savedSlots.length as 1 | 2 | 3 | 4 | 6 | 12;
            if ([1, 2, 3, 4, 6, 12].includes(count)) {
              const page: AlbumPage = {
                id: `page-${Date.now()}`,
                templateId: fetchedAlbum.layout.template.templateId,
                photoCount: count,
                orientation: "landscape",
                slots: savedSlots,
                frameWidth: 0,
                frameColor: "#1a1a1a",
                matWidth: fetchedAlbum.matConfig?.matWidth || 8,
                matColor: fetchedAlbum.matConfig?.matColor || "#FFFFFF",
              };
              setInitialPages([page]);
            }
          } else if (fetchedAlbum.images?.length) {
            // Fallback: create page from existing images
            const imageCount = fetchedAlbum.images.length;
            const validCounts: (1 | 2 | 3 | 4 | 6 | 12)[] = [1, 2, 3, 4, 6, 12];
            const closestCount = validCounts.reduce((prev, curr) =>
              Math.abs(curr - imageCount) < Math.abs(prev - imageCount)
                ? curr
                : prev,
            );

            const { getTemplateByCount, createInitialSlots } =
              await import("@/features/albums/constants/LayoutTemplates");
            const template = getTemplateByCount(closestCount, "landscape");
            const slots = createInitialSlots(template);
            const slotsWithImages = slots.map((slot, idx) => ({
              ...slot,
              imageId: fetchedAlbum.images[idx]?.url || undefined,
            }));

            const page: AlbumPage = {
              id: `page-${Date.now()}`,
              templateId: template.id,
              photoCount: closestCount,
              orientation: "landscape",
              slots: slotsWithImages,
              frameWidth: 0,
              frameColor: "#1a1a1a",
              matWidth: fetchedAlbum.matConfig?.matWidth || 8,
              matColor: fetchedAlbum.matConfig?.matColor || "#FFFFFF",
            };
            setInitialPages([page]);
          }
        }
      } catch (error) {
        console.error("Error fetching album:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchAlbum();
  }, [albumId]);

  const handlePagesChange = useCallback(
    (newPages: AlbumPage[], newCycleDuration: number) => {
      setPages(newPages);
      setCycleDuration(newCycleDuration);
    },
    [],
  );

  const totalFilledSlots = pages.reduce(
    (sum, page) => sum + page.slots.filter((s) => s.imageId).length,
    0,
  );
  const canSave =
    title.trim().length >= MIN_TITLE_LENGTH && totalFilledSlots > 0;

  const handleSave = async () => {
    if (!albumId || pages.length === 0 || !canSave) return;

    setIsSaving(true);

    try {
      // Process and upload images
      const processedData = await processAlbumPages({
        pages,
        albumId,
      });

      // Update album
      await updateAlbum(albumId, {
        title: title.trim(),
        description: "",
        tags: tags,
        images: processedData.images,
        coverUrl: processedData.coverUrl,
        pages: processedData.pages,
        cycleDuration,
        layout: createAlbumLayoutMetadata(processedData.pages.length),
        matConfig: createMatConfigFromPages(processedData.pages),
        updatedAt: new Date(),
      });

      router.push("/albums");
    } catch (error) {
      console.error("Error updating album:", error);
      alert("Failed to update album. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Don't render until auth is resolved
  if (loading || !isSignedIn) return null;

  if (!albumId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="rounded-lg bg-white p-6 text-center shadow-sm">
          <h1 className="mb-3 text-xl font-bold text-gray-900 sm:text-2xl">
            Album Not Found
          </h1>
          <p className="mb-4 text-sm text-gray-600 sm:text-base">
            No album ID provided in the URL.
          </p>
          <button
            onClick={() => router.push("/albums")}
            className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            Back to Albums
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          <span className="text-sm text-gray-600">Loading album...</span>
        </div>
      </div>
    );
  }

  if (!album) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="rounded-lg bg-white p-6 text-center shadow-sm">
          <h1 className="mb-3 text-xl font-bold text-gray-900 sm:text-2xl">
            Album Not Found
          </h1>
          <p className="mb-4 text-sm text-gray-600 sm:text-base">
            Could not load album data.
          </p>
          <button
            onClick={() => router.push("/albums")}
            className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            Back to Albums
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[100dvh] flex-col bg-gray-100">
      <ErrorBoundary
        onError={(error, errorInfo) => {
          console.error("Album edit error:", error, errorInfo);
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
              initialPages={initialPages}
              initialCycleDuration={cycleDuration}
              className="flex-1"
            />
          </div>
        </div>
      </ErrorBoundary>
    </div>
  );
}
