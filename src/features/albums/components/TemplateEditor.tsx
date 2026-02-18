/**
 * Template Layout Editor
 * Interactive grid editor for template-based layouts with image upload and positioning
 */
"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import {
  PhotoIcon,
  MagnifyingGlassPlusIcon,
  MagnifyingGlassMinusIcon,
  ArrowUpTrayIcon,
  XMarkIcon,
  ArrowsPointingOutIcon,
} from "@heroicons/react/24/outline";
import {
  TemplateSlot,
  ImagePosition,
  LayoutTemplate,
} from "@/shared/types/album";

interface TemplateEditorProps {
  template: LayoutTemplate;
  slots: TemplateSlot[];
  onSlotsChange: (slots: TemplateSlot[]) => void;
  className?: string;
}

export function TemplateEditor({
  template,
  slots,
  onSlotsChange,
  className = "",
}: TemplateEditorProps) {
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{
    slotId: string;
    startX: number;
    startY: number;
    startPosition: ImagePosition;
  } | null>(null);

  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const handleFileSelect = useCallback(
    (slotId: string, file: File) => {
      if (!file.type.startsWith("image/")) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        const updatedSlots = slots.map((slot) =>
          slot.id === slotId
            ? {
                ...slot,
                imageId: imageUrl,
                position: slot.position || { x: 0, y: 0, zoom: 1 },
              }
            : slot,
        );
        onSlotsChange(updatedSlots);
        setSelectedSlotId(slotId);
      };
      reader.readAsDataURL(file);
    },
    [slots, onSlotsChange],
  );

  // Unified drag start for mouse and touch
  const handleDragStart = useCallback(
    (slotId: string, clientX: number, clientY: number) => {
      const slot = slots.find((s) => s.id === slotId);
      if (!slot?.imageId) return;

      const position = slot.position || { x: 0, y: 0, zoom: 1 };
      dragRef.current = {
        slotId,
        startX: clientX,
        startY: clientY,
        startPosition: position,
      };
      setIsDragging(true);
      setSelectedSlotId(slotId);
    },
    [slots],
  );

  // Unified drag move
  const handleDragMove = useCallback(
    (clientX: number, clientY: number) => {
      if (!dragRef.current) return;

      const deltaX = clientX - dragRef.current.startX;
      const deltaY = clientY - dragRef.current.startY;

      // Increased sensitivity for better responsiveness
      const sensitivity = 0.15;
      const offsetX = Math.max(
        -50,
        Math.min(50, dragRef.current.startPosition.x + deltaX * sensitivity),
      );
      const offsetY = Math.max(
        -50,
        Math.min(50, dragRef.current.startPosition.y + deltaY * sensitivity),
      );

      const updatedSlots = slots.map((slot) =>
        slot.id === dragRef.current!.slotId
          ? {
              ...slot,
              position: {
                ...dragRef.current!.startPosition,
                x: offsetX,
                y: offsetY,
              },
            }
          : slot,
      );
      onSlotsChange(updatedSlots);
    },
    [slots, onSlotsChange],
  );

  // Unified drag end
  const handleDragEnd = useCallback(() => {
    dragRef.current = null;
    setIsDragging(false);
  }, []);

  // Mouse event handlers
  const handleMouseDown = useCallback(
    (slotId: string, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      handleDragStart(slotId, e.clientX, e.clientY);
    },
    [handleDragStart],
  );

  // Touch event handlers
  const handleTouchStart = useCallback(
    (slotId: string, e: React.TouchEvent) => {
      e.stopPropagation();
      const touch = e.touches[0];
      handleDragStart(slotId, touch.clientX, touch.clientY);
    },
    [handleDragStart],
  );

  // Global mouse/touch move and end listeners
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      handleDragMove(e.clientX, e.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      handleDragMove(touch.clientX, touch.clientY);
    };

    const handleMouseUp = () => handleDragEnd();
    const handleTouchEnd = () => handleDragEnd();

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("touchmove", handleTouchMove, { passive: true });
    document.addEventListener("touchend", handleTouchEnd);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isDragging, handleDragMove, handleDragEnd]);

  // Handle responsive 16:9 aspect ratio
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateDimensions = () => {
      const width = container.clientWidth;
      const height = Math.round((width * 9) / 16);
      setDimensions({ width, height });
    };

    updateDimensions();

    const resizeObserver = new ResizeObserver(updateDimensions);
    resizeObserver.observe(container);
    window.addEventListener("resize", updateDimensions);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateDimensions);
    };
  }, []);

  const handleZoom = useCallback(
    (slotId: string, delta: number) => {
      const updatedSlots = slots.map((slot) => {
        if (slot.id !== slotId) return slot;
        const currentZoom = slot.position?.zoom || 1;
        const newZoom = Math.max(0.5, Math.min(3, currentZoom + delta));
        return {
          ...slot,
          position: {
            ...(slot.position || { x: 0, y: 0, zoom: 1 }),
            zoom: newZoom,
          },
        };
      });
      onSlotsChange(updatedSlots);
    },
    [slots, onSlotsChange],
  );

  // Mouse wheel zoom
  const handleWheel = useCallback(
    (slotId: string, e: React.WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      handleZoom(slotId, delta);
    },
    [handleZoom],
  );

  const handleResetPosition = useCallback(
    (slotId: string) => {
      const updatedSlots = slots.map((slot) =>
        slot.id === slotId
          ? { ...slot, position: { x: 0, y: 0, zoom: 1 } }
          : slot,
      );
      onSlotsChange(updatedSlots);
    },
    [slots, onSlotsChange],
  );

  const handleRemoveImage = useCallback(
    (slotId: string) => {
      const updatedSlots = slots.map((slot) =>
        slot.id === slotId
          ? {
              ...slot,
              imageId: undefined,
              position: { x: 0, y: 0, zoom: 1 },
            }
          : slot,
      );
      onSlotsChange(updatedSlots);
      if (selectedSlotId === slotId) {
        setSelectedSlotId(null);
      }
    },
    [slots, onSlotsChange, selectedSlotId],
  );

  return (
    <div className={`${className} w-full`}>
      {/* Toolbar */}
      <div className="mb-2 flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
        <div className="flex items-center gap-2">
          <PhotoIcon className="h-4 w-4 text-gray-600" />
          <span className="text-xs font-medium text-gray-700">
            {template.name}
          </span>
        </div>
        {selectedSlotId &&
          slots.find((s) => s.id === selectedSlotId)?.imageId && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleZoom(selectedSlotId, -0.2)}
                className="rounded p-1.5 text-gray-600 hover:bg-gray-200"
                title="Zoom Out"
              >
                <MagnifyingGlassMinusIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleZoom(selectedSlotId, 0.2)}
                className="rounded p-1.5 text-gray-600 hover:bg-gray-200"
                title="Zoom In"
              >
                <MagnifyingGlassPlusIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleResetPosition(selectedSlotId)}
                className="rounded p-1.5 text-gray-600 hover:bg-gray-200"
                title="Reset Position"
              >
                <ArrowsPointingOutIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleRemoveImage(selectedSlotId)}
                className="rounded p-1.5 text-red-500 hover:bg-red-100"
                title="Remove Image"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          )}
      </div>

      {/* Hint text */}
      {selectedSlotId &&
        slots.find((s) => s.id === selectedSlotId)?.imageId && (
          <p className="mb-2 text-center text-xs text-gray-500">
            Drag to reposition • Scroll to zoom
          </p>
        )}

      {/* Grid Container - 16:9 aspect ratio */}
      <div
        ref={containerRef}
        className="relative w-full overflow-hidden rounded-lg bg-gray-100"
        style={{
          height: dimensions.height ? `${dimensions.height}px` : undefined,
          minHeight: "300px",
        }}
      >
        <div className="absolute inset-0">
          {slots.map((slot) => {
            const isSelected = selectedSlotId === slot.id;
            const position = slot.position || { x: 0, y: 0, zoom: 1 };

            return (
              <div
                key={slot.id}
                className={`absolute transition-shadow ${
                  isSelected ? "ring-4 ring-blue-500 ring-offset-2 z-10" : ""
                }`}
                style={{
                  left: `${slot.x}%`,
                  top: `${slot.y}%`,
                  width: `${slot.width}%`,
                  height: `${slot.height}%`,
                  overflow: "hidden",
                }}
                onClick={() => setSelectedSlotId(slot.id)}
              >
                {/* Frame - Outer fixed border */}
                <div
                  className="relative h-full w-full overflow-hidden"
                  style={{
                    borderWidth: `${template.frameWidth || 4}px`,
                    borderColor: template.frameColor || "#1a1a1a",
                    borderStyle: "solid",
                    boxSizing: "border-box",
                  }}
                >
                  {/* Mat - Inner variable padding */}
                  <div
                    className="relative h-full w-full overflow-hidden"
                    style={{
                      padding: `${template.matWidth || 0}%`,
                      backgroundColor: template.matColor || "#FFFFFF",
                      boxSizing: "border-box",
                    }}
                  >
                    {slot.imageId ? (
                      <div
                        className="absolute inset-0 cursor-move select-none"
                        onMouseDown={(e) => handleMouseDown(slot.id, e)}
                        onTouchStart={(e) => handleTouchStart(slot.id, e)}
                        onWheel={(e) => handleWheel(slot.id, e)}
                        style={{
                          transform: `translate(${position.x}%, ${position.y}%) scale(${position.zoom})`,
                          transformOrigin: "center center",
                        }}
                      >
                        <Image
                          src={slot.imageId}
                          alt={`Slot ${slot.id}`}
                          fill
                          className="pointer-events-none object-cover"
                          draggable={false}
                        />
                      </div>
                    ) : (
                      <div
                        className="flex h-full w-full cursor-pointer flex-col items-center justify-center bg-gray-50 transition-colors hover:bg-gray-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          fileInputRefs.current[slot.id]?.click();
                        }}
                      >
                        {slot.placeholder ? (
                          <div className="text-center">
                            <div className="text-2xl font-serif text-gray-400">
                              {slot.placeholder}
                            </div>
                          </div>
                        ) : (
                          <>
                            <ArrowUpTrayIcon className="mb-2 h-8 w-8 text-gray-400" />
                            <span className="text-sm text-gray-500">
                              Upload Photo
                            </span>
                          </>
                        )}
                        <input
                          ref={(el) => {
                            fileInputRefs.current[slot.id] = el;
                          }}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileSelect(slot.id, file);
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
