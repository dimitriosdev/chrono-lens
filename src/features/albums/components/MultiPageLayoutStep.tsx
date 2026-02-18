/**
 * Multi-Page Layout Step
 * Mobile-first UX for multi-page slideshow creation
 * Each page can have its own template and photos
 */
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { TemplateEditor } from "./TemplateEditor";
import {
  getTemplateByCount,
  createInitialSlots,
} from "@/features/albums/constants/LayoutTemplates";
import { TemplateSlot, LayoutTemplate, AlbumPage } from "@/shared/types/album";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  PhotoIcon,
  Cog6ToothIcon,
  PlusIcon,
  PlayIcon,
  ClockIcon,
  XMarkIcon,
  Bars3Icon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon as CheckCircleSolidIcon } from "@heroicons/react/24/solid";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface MultiPageLayoutStepProps {
  onPagesChange: (pages: AlbumPage[], cycleDuration: number) => void;
  initialPages?: AlbumPage[];
  initialCycleDuration?: number;
  className?: string;
}

// Generate unique ID
const generateId = () =>
  `page-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Sortable Page Tab Component
interface SortablePageTabProps {
  page: AlbumPage;
  index: number;
  isActive: boolean;
  isComplete: boolean;
  onClick: () => void;
  onRemove: (e: React.MouseEvent) => void;
  canRemove: boolean;
}

function SortablePageTab({
  page,
  index,
  isActive,
  isComplete,
  onClick,
  onRemove,
  canRemove,
}: SortablePageTabProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: page.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onClick}
      className={`group relative flex cursor-pointer items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
        isActive
          ? "bg-blue-600 text-white shadow-md"
          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
      } ${isDragging ? "z-50" : ""}`}
    >
      {/* Drag Handle */}
      <button
        {...attributes}
        {...listeners}
        className={`cursor-grab active:cursor-grabbing ${
          isActive
            ? "text-white/70 hover:text-white"
            : "text-gray-400 hover:text-gray-600"
        }`}
        onClick={(e) => e.stopPropagation()}
        title="Drag to reorder"
      >
        <Bars3Icon className="h-3.5 w-3.5" />
      </button>
      <span>Page {index + 1}</span>
      {isComplete && (
        <CheckCircleSolidIcon className="h-3.5 w-3.5 text-green-400" />
      )}
      {canRemove && isActive && (
        <button
          onClick={onRemove}
          className="ml-1 rounded-full p-0.5 hover:bg-blue-500"
        >
          <XMarkIcon className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}

// Create a default page
const createDefaultPage = (): AlbumPage => {
  const template = getTemplateByCount(
    1,
    "landscape",
    4,
    "#1a1a1a",
    8,
    "#FFFFFF",
  );
  return {
    id: generateId(),
    templateId: template.id,
    photoCount: 1,
    orientation: "landscape",
    slots: createInitialSlots(template),
    frameWidth: 0,
    frameColor: "#1a1a1a",
    matWidth: 0,
    matColor: "#FFFFFF",
  };
};

export function MultiPageLayoutStep({
  onPagesChange,
  initialPages,
  initialCycleDuration = 10,
  className = "",
}: MultiPageLayoutStepProps) {
  const [pages, setPages] = useState<AlbumPage[]>(
    initialPages && initialPages.length > 0
      ? initialPages
      : [createDefaultPage()],
  );
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [cycleDuration, setCycleDuration] = useState(initialCycleDuration);
  const [showSettings, setShowSettings] = useState(false);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);

  // Current page data
  const currentPage = pages[currentPageIndex] || pages[0];

  // Update parent when pages change
  useEffect(() => {
    onPagesChange(pages, cycleDuration);
  }, [pages, cycleDuration, onPagesChange]);

  // Slideshow preview timer
  useEffect(() => {
    if (!isPreviewPlaying) return;

    const interval = setInterval(() => {
      setCurrentPageIndex((prev) => (prev + 1) % pages.length);
    }, cycleDuration * 1000);

    return () => clearInterval(interval);
  }, [isPreviewPlaying, cycleDuration, pages.length]);

  // Template for current page
  const template: LayoutTemplate = {
    id: currentPage.templateId,
    name: `${currentPage.photoCount} Photo${currentPage.photoCount > 1 ? "s" : ""}`,
    photoCount: currentPage.photoCount,
    orientation: currentPage.orientation,
    slots: currentPage.slots,
    frameWidth: currentPage.frameWidth,
    frameColor: currentPage.frameColor,
    matWidth: currentPage.matWidth,
    matColor: currentPage.matColor,
  };

  const updateCurrentPage = useCallback(
    (updates: Partial<AlbumPage>) => {
      setPages((prev) =>
        prev.map((page, idx) =>
          idx === currentPageIndex ? { ...page, ...updates } : page,
        ),
      );
    },
    [currentPageIndex],
  );

  const handleCountChange = (count: 1 | 2 | 3 | 4 | 6 | 12) => {
    // Auto-switch orientation based on available options
    let newOrientation = currentPage.orientation;
    if (count === 3) {
      newOrientation = "portrait";
    } else if (count === 4 || count === 6 || count === 12) {
      newOrientation = "landscape";
    }

    const newTemplate = getTemplateByCount(
      count,
      newOrientation,
      currentPage.frameWidth || 4,
      currentPage.frameColor || "#1a1a1a",
      currentPage.matWidth || 8,
      currentPage.matColor || "#FFFFFF",
    );

    updateCurrentPage({
      photoCount: count,
      orientation: newOrientation,
      templateId: newTemplate.id,
      slots: createInitialSlots(newTemplate),
    });
  };

  const handleOrientationChange = (orientation: "portrait" | "landscape") => {
    const newTemplate = getTemplateByCount(
      currentPage.photoCount,
      orientation,
      currentPage.frameWidth || 4,
      currentPage.frameColor || "#1a1a1a",
      currentPage.matWidth || 8,
      currentPage.matColor || "#FFFFFF",
    );

    updateCurrentPage({
      orientation,
      templateId: newTemplate.id,
      slots: newTemplate.slots.map((slot, idx) => ({
        ...slot,
        imageId: currentPage.slots[idx]?.imageId,
        // Reset position to default when changing orientation since layout changes
        position: currentPage.slots[idx]?.imageId
          ? { x: 0, y: 0, zoom: 1 }
          : undefined,
      })),
    });
  };

  const handleSlotsChange = (updatedSlots: TemplateSlot[]) => {
    updateCurrentPage({ slots: updatedSlots });
  };

  const handleSettingChange = (
    key: keyof AlbumPage,
    value: number | string,
  ) => {
    updateCurrentPage({ [key]: value });
  };

  const addPage = () => {
    const newPage = createDefaultPage();
    setPages((prev) => [...prev, newPage]);
    setCurrentPageIndex(pages.length);
  };

  const removePage = (index: number) => {
    if (pages.length <= 1) return;
    setPages((prev) => prev.filter((_, idx) => idx !== index));
    if (currentPageIndex >= index && currentPageIndex > 0) {
      setCurrentPageIndex((prev) => prev - 1);
    }
  };

  // Handle drag and drop reordering
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setPages((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        // Update current page index to follow the moved page
        if (oldIndex === currentPageIndex) {
          setCurrentPageIndex(newIndex);
        } else if (
          oldIndex < currentPageIndex &&
          newIndex >= currentPageIndex
        ) {
          setCurrentPageIndex((prev) => prev - 1);
        } else if (
          oldIndex > currentPageIndex &&
          newIndex <= currentPageIndex
        ) {
          setCurrentPageIndex((prev) => prev + 1);
        }

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const photoCounts: (1 | 2 | 3 | 4 | 6 | 12)[] = [1, 2, 3, 4, 6, 12];
  const filledCount = currentPage.slots.filter((s) => s.imageId).length;
  const isPageComplete = filledCount === currentPage.photoCount;
  const totalFilledPhotos = pages.reduce(
    (sum, page) => sum + page.slots.filter((s) => s.imageId).length,
    0,
  );
  const totalPhotoSlots = pages.reduce((sum, page) => sum + page.photoCount, 0);

  return (
    <div className={`flex h-full flex-col ${className}`}>
      {/* Page Tabs with Drag and Drop */}
      <div className="mb-2 flex items-center gap-2 overflow-x-auto pb-1">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={pages.map((p) => p.id)}
            strategy={horizontalListSortingStrategy}
          >
            <div className="flex items-center gap-1">
              {pages.map((page, idx) => {
                const pageFilledCount = page.slots.filter(
                  (s) => s.imageId,
                ).length;
                const pageComplete = pageFilledCount === page.photoCount;
                return (
                  <SortablePageTab
                    key={page.id}
                    page={page}
                    index={idx}
                    isActive={currentPageIndex === idx}
                    isComplete={pageComplete}
                    onClick={() => {
                      setCurrentPageIndex(idx);
                      setIsPreviewPlaying(false);
                    }}
                    onRemove={(e) => {
                      e.stopPropagation();
                      removePage(idx);
                    }}
                    canRemove={pages.length > 1}
                  />
                );
              })}
            </div>
          </SortableContext>
        </DndContext>
        <button
          onClick={addPage}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200"
          title="Add page"
        >
          <PlusIcon className="h-4 w-4" />
        </button>
      </div>

      {/* Compact Header with Template Count + Status */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2">
        {/* Photo Count Pills */}
        <div className="flex flex-wrap gap-1.5">
          {photoCounts.map((count) => (
            <button
              key={count}
              onClick={() => handleCountChange(count)}
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium transition-all ${
                currentPage.photoCount === count
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {count}
            </button>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-1.5">
          {/* Orientation Toggle */}
          {currentPage.photoCount === 1 || currentPage.photoCount === 2 ? (
            <div className="flex overflow-hidden rounded-md border border-gray-200">
              <button
                onClick={() => handleOrientationChange("landscape")}
                className={`px-1.5 py-1 text-xs transition-colors ${
                  currentPage.orientation === "landscape"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
                title="Landscape orientation"
              >
                ▬
              </button>
              <button
                onClick={() => handleOrientationChange("portrait")}
                className={`px-1.5 py-1 text-xs transition-colors ${
                  currentPage.orientation === "portrait"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
                title="Portrait orientation"
              >
                ▮
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1 rounded-md border border-gray-200 bg-gray-50 px-2 py-1">
              <span
                className="text-xs text-gray-500"
                title="Fixed orientation for this layout"
              >
                {currentPage.orientation === "landscape" ? "▬" : "▮"}
              </span>
            </div>
          )}

          {/* Settings Toggle */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs transition-all ${
              showSettings
                ? "bg-blue-100 text-blue-700"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <Cog6ToothIcon className="h-3.5 w-3.5" />
            {showSettings ? (
              <ChevronUpIcon className="h-3 w-3" />
            ) : (
              <ChevronDownIcon className="h-3 w-3" />
            )}
          </button>
        </div>
      </div>

      {/* Collapsible Settings Panel */}
      {showSettings && (
        <div className="mb-2 rounded-lg border border-gray-200 bg-gray-50 p-2">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            {/* Frame Width */}
            <div>
              <label className="mb-0.5 block text-xs font-medium text-gray-600">
                Frame: {currentPage.frameWidth}px
              </label>
              <input
                type="range"
                min="0"
                max="20"
                value={currentPage.frameWidth}
                onChange={(e) =>
                  handleSettingChange("frameWidth", Number(e.target.value))
                }
                className="w-full"
              />
            </div>

            {/* Frame Color */}
            <div>
              <label className="mb-0.5 block text-xs font-medium text-gray-600">
                Frame Color
              </label>
              <input
                type="color"
                value={currentPage.frameColor}
                onChange={(e) =>
                  handleSettingChange("frameColor", e.target.value)
                }
                className="h-6 w-full cursor-pointer rounded border border-gray-300"
              />
            </div>

            {/* Mat Width */}
            <div>
              <label className="mb-0.5 block text-xs font-medium text-gray-600">
                Mat: {currentPage.matWidth}%
              </label>
              <input
                type="range"
                min="0"
                max="15"
                value={currentPage.matWidth}
                onChange={(e) =>
                  handleSettingChange("matWidth", Number(e.target.value))
                }
                className="w-full"
              />
            </div>

            {/* Mat Color */}
            <div>
              <label className="mb-0.5 block text-xs font-medium text-gray-600">
                Mat Color
              </label>
              <input
                type="color"
                value={currentPage.matColor}
                onChange={(e) =>
                  handleSettingChange("matColor", e.target.value)
                }
                className="h-6 w-full cursor-pointer rounded border border-gray-300"
              />
            </div>

            {/* Cycle Duration */}
            <div>
              <label className="mb-0.5 block text-xs font-medium text-gray-600">
                <ClockIcon className="mr-0.5 inline h-3 w-3" />
                {cycleDuration}s
              </label>
              <input
                type="range"
                min="3"
                max="60"
                step="1"
                value={cycleDuration}
                onChange={(e) => setCycleDuration(Number(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        </div>
      )}

      {/* Preview Editor - Priority Area */}
      <div className="relative min-h-[300px] flex-1 sm:min-h-[400px]">
        <TemplateEditor
          template={template}
          slots={currentPage.slots}
          onSlotsChange={handleSlotsChange}
        />

        {/* Preview Playing Overlay */}
        {isPreviewPlaying && (
          <div className="pointer-events-none absolute inset-0 flex items-end justify-center pb-4">
            <div className="rounded-full bg-black/50 px-4 py-2 text-sm text-white">
              Page {currentPageIndex + 1} of {pages.length}
            </div>
          </div>
        )}
      </div>

      {/* Compact Summary Bar */}
      <div className="mt-2 flex items-center justify-between rounded-lg bg-gray-100 px-3 py-2">
        <div className="flex items-center gap-3">
          {/* Page Progress */}
          <div className="flex items-center gap-1.5">
            {isPageComplete ? (
              <CheckCircleSolidIcon className="h-4 w-4 text-green-500" />
            ) : (
              <PhotoIcon className="h-4 w-4 text-gray-400" />
            )}
            <span
              className={`text-xs font-medium ${isPageComplete ? "text-green-600" : "text-gray-700"}`}
            >
              {filledCount}/{currentPage.photoCount}
            </span>
          </div>

          {/* Page Dots */}
          <div className="flex gap-1">
            {pages.map((page, idx) => {
              const complete =
                page.slots.filter((s) => s.imageId).length === page.photoCount;
              return (
                <div
                  key={page.id}
                  className={`h-2 w-2 rounded-full transition-colors ${
                    idx === currentPageIndex
                      ? complete
                        ? "bg-green-500"
                        : "bg-blue-500"
                      : complete
                        ? "bg-green-300"
                        : "bg-gray-300"
                  }`}
                />
              );
            })}
          </div>

          {/* Total */}
          <span className="text-xs text-gray-500">
            {totalFilledPhotos}/{totalPhotoSlots} total
          </span>
        </div>

        {/* Preview Button */}
        <button
          onClick={() => setIsPreviewPlaying(!isPreviewPlaying)}
          disabled={pages.length < 2}
          className={`flex items-center gap-1 rounded-lg px-3 py-1 text-xs font-medium transition-all ${
            isPreviewPlaying
              ? "bg-red-100 text-red-700"
              : pages.length < 2
                ? "cursor-not-allowed bg-gray-200 text-gray-400"
                : "bg-blue-100 text-blue-700 hover:bg-blue-200"
          }`}
        >
          {isPreviewPlaying ? (
            <>
              <XMarkIcon className="h-3.5 w-3.5" />
              Stop
            </>
          ) : (
            <>
              <PlayIcon className="h-3.5 w-3.5" />
              Preview
            </>
          )}
        </button>
      </div>
    </div>
  );
}
