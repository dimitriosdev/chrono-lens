/**
 * Multi-Opening Mat Component
 * Supports collage-style layouts with multiple photo openings
 */

"use client";

import React, { useState, useCallback, useMemo } from "react";
import Image from "next/image";
import {
  MatConfig as AdvancedMatConfig,
  MatOpening,
  MatOpeningStyle,
} from "@/shared/types/frameTextures";
import { AlbumImage } from "@/shared/types/album";

interface MultiOpeningMatProps {
  matConfig: AdvancedMatConfig;
  images: AlbumImage[];
  onMatConfigChange: (config: AdvancedMatConfig) => void;
  onImageAssignment: (openingId: string, imageId: string) => void;
  className?: string;
  readonly?: boolean;
}

interface MatOpeningProps {
  opening: MatOpening;
  image?: AlbumImage;
  isSelected: boolean;
  isEditing: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onMove: (opening: MatOpening) => void;
  containerWidth: number;
  containerHeight: number;
}

interface MatLayoutSelectorProps {
  currentStyle: MatOpeningStyle;
  onStyleChange: (style: MatOpeningStyle) => void;
  imageCount: number;
}

// Predefined layout templates
const LAYOUT_TEMPLATES: Record<
  MatOpeningStyle,
  (imageCount: number) => MatOpening[]
> = {
  single: () => [
    {
      id: "main",
      x: 50,
      y: 50,
      width: 70,
      height: 70,
      shape: "rectangle",
      bevelWidth: 3,
    },
  ],

  double: () => [
    {
      id: "left",
      x: 25,
      y: 50,
      width: 40,
      height: 60,
      shape: "rectangle",
      bevelWidth: 3,
    },
    {
      id: "right",
      x: 75,
      y: 50,
      width: 40,
      height: 60,
      shape: "rectangle",
      bevelWidth: 3,
    },
  ],

  triple: () => [
    {
      id: "center",
      x: 50,
      y: 35,
      width: 45,
      height: 45,
      shape: "rectangle",
      bevelWidth: 3,
    },
    {
      id: "bottom-left",
      x: 25,
      y: 70,
      width: 35,
      height: 35,
      shape: "rectangle",
      bevelWidth: 3,
    },
    {
      id: "bottom-right",
      x: 75,
      y: 70,
      width: 35,
      height: 35,
      shape: "rectangle",
      bevelWidth: 3,
    },
  ],

  quad: () => [
    {
      id: "top-left",
      x: 30,
      y: 30,
      width: 35,
      height: 35,
      shape: "rectangle",
      bevelWidth: 3,
    },
    {
      id: "top-right",
      x: 70,
      y: 30,
      width: 35,
      height: 35,
      shape: "rectangle",
      bevelWidth: 3,
    },
    {
      id: "bottom-left",
      x: 30,
      y: 70,
      width: 35,
      height: 35,
      shape: "rectangle",
      bevelWidth: 3,
    },
    {
      id: "bottom-right",
      x: 70,
      y: 70,
      width: 35,
      height: 35,
      shape: "rectangle",
      bevelWidth: 3,
    },
  ],

  "custom-grid": (imageCount: number) => {
    const cols = Math.ceil(Math.sqrt(imageCount));
    const rows = Math.ceil(imageCount / cols);
    const openings: MatOpening[] = [];

    for (let i = 0; i < imageCount; i++) {
      const row = Math.floor(i / cols);
      const col = i % cols;

      openings.push({
        id: `grid-${i}`,
        x: (col + 0.5) * (80 / cols) + 10,
        y: (row + 0.5) * (80 / rows) + 10,
        width: 70 / cols,
        height: 70 / rows,
        shape: "rectangle",
        bevelWidth: 2,
      });
    }

    return openings;
  },

  asymmetric: () => [
    {
      id: "large",
      x: 35,
      y: 40,
      width: 50,
      height: 60,
      shape: "rectangle",
      bevelWidth: 4,
    },
    {
      id: "small-top",
      x: 75,
      y: 25,
      width: 30,
      height: 25,
      shape: "rectangle",
      bevelWidth: 2,
    },
    {
      id: "small-bottom",
      x: 75,
      y: 65,
      width: 30,
      height: 25,
      shape: "rectangle",
      bevelWidth: 2,
    },
  ],
};

// Mat Layout Selector Component
const MatLayoutSelector: React.FC<MatLayoutSelectorProps> = ({
  currentStyle,
  onStyleChange,
  imageCount,
}) => {
  const layouts = [
    { style: "single" as MatOpeningStyle, name: "Single", icon: "⬜" },
    { style: "double" as MatOpeningStyle, name: "Double", icon: "⬜⬜" },
    { style: "triple" as MatOpeningStyle, name: "Triple", icon: "⬜\n⬜⬜" },
    { style: "quad" as MatOpeningStyle, name: "Quad", icon: "⬜⬜\n⬜⬜" },
    {
      style: "custom-grid" as MatOpeningStyle,
      name: "Grid",
      icon: "⬜⬜⬜\n⬜⬜⬜",
    },
    {
      style: "asymmetric" as MatOpeningStyle,
      name: "Asymmetric",
      icon: "⬜ ⬜\n   ⬜",
    },
  ];

  return (
    <div className="space-y-3">
      <h4 className="text-md font-medium text-gray-800">Mat Layout</h4>
      <div className="grid grid-cols-3 gap-3">
        {layouts.map((layout) => (
          <button
            key={layout.style}
            onClick={() => onStyleChange(layout.style)}
            className={`
              p-3 rounded-lg border-2 transition-all duration-200 text-center
              ${
                currentStyle === layout.style
                  ? "border-blue-500 bg-blue-50 text-blue-900"
                  : "border-gray-300 hover:border-gray-400 bg-white text-gray-700"
              }
            `}
          >
            <div className="text-lg mb-1 whitespace-pre-line leading-tight">
              {layout.icon}
            </div>
            <div className="text-xs font-medium">{layout.name}</div>
            {layout.style === "custom-grid" && (
              <div className="text-xs text-gray-500">
                {Math.ceil(Math.sqrt(imageCount))}×
                {Math.ceil(imageCount / Math.ceil(Math.sqrt(imageCount)))}
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

// Individual Mat Opening Component
const MatOpeningComponent: React.FC<MatOpeningProps> = ({
  opening,
  image,
  isSelected,
  isEditing,
  onSelect,
  onEdit,
  onMove,
  containerWidth,
  containerHeight,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      onSelect();

      if (isEditing) {
        setIsDragging(true);
        setDragStart({
          x: e.clientX - (opening.x * containerWidth) / 100,
          y: e.clientY - (opening.y * containerHeight) / 100,
        });
      }
    },
    [isEditing, opening.x, opening.y, containerWidth, containerHeight, onSelect]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isDragging && isEditing) {
        const newX = ((e.clientX - dragStart.x) / containerWidth) * 100;
        const newY = ((e.clientY - dragStart.y) / containerHeight) * 100;

        onMove({
          ...opening,
          x: Math.max(
            opening.width / 2,
            Math.min(100 - opening.width / 2, newX)
          ),
          y: Math.max(
            opening.height / 2,
            Math.min(100 - opening.height / 2, newY)
          ),
        });
      }
    },
    [
      isDragging,
      isEditing,
      dragStart,
      containerWidth,
      containerHeight,
      opening,
      onMove,
    ]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
  }, []);

  React.useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);

  const openingStyle = {
    position: "absolute" as const,
    left: `${opening.x - opening.width / 2}%`,
    top: `${opening.y - opening.height / 2}%`,
    width: `${opening.width}%`,
    height: `${opening.height}%`,
    borderRadius:
      opening.shape === "circle"
        ? "50%"
        : opening.shape === "oval"
        ? "50%"
        : "4px",
  };

  return (
    <div
      style={openingStyle}
      className={`
        border-2 transition-all duration-200 cursor-pointer
        ${
          isSelected
            ? "border-blue-500 ring-2 ring-blue-200"
            : "border-gray-400 hover:border-gray-600"
        }
        ${isEditing ? "cursor-move" : "cursor-pointer"}
      `}
      onMouseDown={handleMouseDown}
      onDoubleClick={onEdit}
    >
      {/* Mat Bevel Effect */}
      <div
        className={`
          w-full h-full border-gray-300 bg-white flex items-center justify-center
          ${`mat-bevel-${opening.bevelWidth * 15}`}
        `}
        style={{
          borderWidth: `${opening.bevelWidth}px`,
          borderStyle: "inset",
        }}
      >
        {/* Image or Placeholder */}
        {image ? (
          <Image
            src={image.url}
            alt={image.description || "Mat opening"}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        ) : (
          <div className="text-gray-400 text-center text-xs">
            <div className="mb-1">📷</div>
            <div>Drop image</div>
          </div>
        )}
      </div>

      {/* Resize Handles */}
      {isSelected && isEditing && (
        <>
          <div
            className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 rounded-full cursor-se-resize"
            onMouseDown={(e) => {
              e.stopPropagation();
              setIsResizing(true);
            }}
          />
          <div
            className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 rounded-full cursor-nw-resize"
            onMouseDown={(e) => {
              e.stopPropagation();
              setIsResizing(true);
            }}
          />
        </>
      )}
    </div>
  );
};

// Main Multi-Opening Mat Component
export const MultiOpeningMat: React.FC<MultiOpeningMatProps> = ({
  matConfig,
  images,
  onMatConfigChange,
  onImageAssignment,
  className = "",
  readonly = false,
}) => {
  const [selectedOpening, setSelectedOpening] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const handleLayoutChange = useCallback(
    (style: MatOpeningStyle) => {
      if (readonly) return;

      const newOpenings = LAYOUT_TEMPLATES[style](images.length);
      onMatConfigChange({
        ...matConfig,
        openingStyle: style,
        openings: newOpenings,
      });
    },
    [matConfig, images.length, onMatConfigChange, readonly]
  );

  const handleOpeningMove = useCallback(
    (updatedOpening: MatOpening) => {
      if (readonly) return;

      const updatedOpenings = matConfig.openings.map((opening) =>
        opening.id === updatedOpening.id ? updatedOpening : opening
      );

      onMatConfigChange({
        ...matConfig,
        openings: updatedOpenings,
      });
    },
    [matConfig, onMatConfigChange, readonly]
  );

  const handleOpeningEdit = useCallback(
    (openingId: string) => {
      if (readonly) return;

      setSelectedOpening(openingId);
      setIsEditing(true);
    },
    [readonly]
  );

  const containerDimensions = useMemo(() => {
    return { width: 400, height: 400 }; // Fixed size for consistent calculations
  }, []);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Layout Selector */}
      <MatLayoutSelector
        currentStyle={matConfig.openingStyle}
        onStyleChange={handleLayoutChange}
        imageCount={images.length}
      />

      {/* Mat Preview */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-md font-medium text-gray-800">Mat Preview</h4>
          {!readonly && (
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`
                px-3 py-1 text-sm rounded transition-all duration-200
                ${
                  isEditing
                    ? "bg-blue-500 text-white hover:bg-blue-600"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }
              `}
            >
              {isEditing ? "Done Editing" : "Edit Layout"}
            </button>
          )}
        </div>

        {/* Mat Container */}
        <div className="flex justify-center">
          <div
            ref={containerRef}
            className={`
              relative ${matConfig.texture.cssClass} 
              mat-realistic ${`mat-${matConfig.thickness}`}
              frame-depth-medium
            `}
            style={{
              width: containerDimensions.width,
              height: containerDimensions.height,
              backgroundColor: matConfig.color,
            }}
          >
            {/* Mat Openings */}
            {matConfig.openings.map((opening) => {
              const assignedImage = images.find(
                (img) => opening.imageId === img.id
              );

              return (
                <MatOpeningComponent
                  key={opening.id}
                  opening={opening}
                  image={assignedImage}
                  isSelected={selectedOpening === opening.id}
                  isEditing={isEditing}
                  onSelect={() => setSelectedOpening(opening.id)}
                  onEdit={() => handleOpeningEdit(opening.id)}
                  onMove={handleOpeningMove}
                  containerWidth={containerDimensions.width}
                  containerHeight={containerDimensions.height}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Image Assignment */}
      <div className="space-y-3">
        <h4 className="text-md font-medium text-gray-800">Image Assignment</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {images.map((image) => (
            <div
              key={image.id}
              className="group relative aspect-square rounded-lg overflow-hidden border-2 border-gray-300 hover:border-blue-400 transition-all duration-200"
            >
              <Image
                src={image.url}
                alt={image.description || "Album image"}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 25vw"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200">
                <div className="absolute bottom-2 left-2 right-2">
                  <select
                    value={
                      matConfig.openings.find((o) => o.imageId === image.id)
                        ?.id || ""
                    }
                    onChange={(e) =>
                      onImageAssignment(e.target.value, image.id!)
                    }
                    disabled={readonly}
                    className="w-full text-xs bg-white bg-opacity-90 border border-gray-300 rounded px-1 py-1"
                  >
                    <option value="">Unassigned</option>
                    {matConfig.openings.map((opening) => (
                      <option key={opening.id} value={opening.id}>
                        Opening {opening.id}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Opening Details */}
      {selectedOpening && (
        <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-md font-medium text-gray-800">
            Opening Details: {selectedOpening}
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bevel Width
              </label>
              <input
                type="range"
                min="1"
                max="8"
                value={
                  matConfig.openings.find((o) => o.id === selectedOpening)
                    ?.bevelWidth || 3
                }
                onChange={(e) => {
                  const updatedOpenings = matConfig.openings.map((opening) =>
                    opening.id === selectedOpening
                      ? { ...opening, bevelWidth: parseInt(e.target.value) }
                      : opening
                  );
                  onMatConfigChange({
                    ...matConfig,
                    openings: updatedOpenings,
                  });
                }}
                disabled={readonly}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Shape
              </label>
              <select
                value={
                  matConfig.openings.find((o) => o.id === selectedOpening)
                    ?.shape || "rectangle"
                }
                onChange={(e) => {
                  const updatedOpenings = matConfig.openings.map((opening) =>
                    opening.id === selectedOpening
                      ? {
                          ...opening,
                          shape: e.target.value as
                            | "rectangle"
                            | "oval"
                            | "circle"
                            | "custom",
                        }
                      : opening
                  );
                  onMatConfigChange({
                    ...matConfig,
                    openings: updatedOpenings,
                  });
                }}
                disabled={readonly}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              >
                <option value="rectangle">Rectangle</option>
                <option value="oval">Oval</option>
                <option value="circle">Circle</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiOpeningMat;
