"use client";

import React from "react";
import { AlbumLayout } from "@/features/albums/AlbumLayout";
import { FormField } from "./FormComponents";

const matColors = [
  { name: "No Mat", color: "#000" },
  { name: "Classic White", color: "#f8f8f8" },
  { name: "Soft Yellow", color: "#ffe88a" },
  { name: "Modern Grey", color: "#bfc2c3" },
  { name: "Blush Pink", color: "#f8e1ea" },
  { name: "Deep Black", color: "#1a1a1a" },
  { name: "Cream", color: "#f5f5dc" },
  { name: "Sage Green", color: "#9caf88" },
];

export type MatConfig = {
  matWidth: number;
  matColor: string;
  cycleDuration?: number;
};

interface EnhancedMatBoardProps {
  config: MatConfig;
  setConfig: (c: MatConfig) => void;
  layout: AlbumLayout;
  previewImages?: string[];
  showPreview?: boolean;
}

export function EnhancedMatBoard({
  config,
  setConfig,
  layout,
  previewImages = [],
  showPreview = true,
}: EnhancedMatBoardProps) {
  const { matWidth, matColor } = config;
  const frameWidth = 400;
  const frameHeight = 300;
  const minPercent = 5;
  const maxPercent = 40;
  const matPercent = matWidth || minPercent;
  const isNoMat = matColor === matColors[0].color;
  const matPx = isNoMat
    ? 0
    : Math.floor((matPercent / 100) * Math.min(frameWidth, frameHeight));

  const { grid } = React.useMemo(
    () => ({
      grid: layout?.grid || { rows: 1, cols: 1 },
    }),
    [layout]
  );

  // Calculate artwork area size
  let artworkWidth = (frameWidth - matPx * 2) / grid.cols;
  let artworkHeight = (frameHeight - matPx * 2) / grid.rows;

  if (layout?.orientation === "portrait") {
    const portraitRatio = 4 / 5;
    artworkHeight = artworkWidth / portraitRatio;
    if (artworkHeight > frameHeight - matPx * 2) {
      artworkHeight = frameHeight - matPx * 2;
      artworkWidth = artworkHeight * portraitRatio;
    }
  }

  const totalSlots = grid.rows * grid.cols;
  const imagesToShow = previewImages.slice(0, totalSlots);

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="Mat Color">
          <select
            value={matColor}
            onChange={(e) => {
              setConfig({ ...config, matColor: e.target.value });
            }}
            className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {matColors.map((c) => (
              <option
                value={c.color}
                key={c.name}
                className="bg-gray-700 text-white"
              >
                {c.name}
              </option>
            ))}
          </select>

          {/* Color preview swatches */}
          <div className="flex flex-wrap gap-2 mt-2">
            {matColors.map((colorOption) => (
              <button
                key={colorOption.name}
                onClick={() =>
                  setConfig({ ...config, matColor: colorOption.color })
                }
                className={`w-8 h-8 rounded-full border-2 transition ${
                  matColor === colorOption.color
                    ? "border-blue-500 ring-2 ring-blue-500 ring-opacity-50"
                    : "border-gray-600 hover:border-gray-400"
                }`}
                style={{ backgroundColor: colorOption.color }}
                title={colorOption.name}
              />
            ))}
          </div>
        </FormField>

        {!isNoMat && (
          <FormField label="Mat Width" help={`${matPercent}% of frame size`}>
            <input
              type="range"
              min={minPercent}
              max={maxPercent}
              value={matPercent}
              onChange={(e) =>
                setConfig({ ...config, matWidth: Number(e.target.value) })
              }
              className="w-full accent-blue-500"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>Thin ({minPercent}%)</span>
              <span>Thick ({maxPercent}%)</span>
            </div>
          </FormField>
        )}
      </div>

      {/* Preview */}
      {showPreview && (
        <div className="bg-gray-900 rounded-lg p-6">
          <h4 className="text-sm font-medium text-gray-300 mb-4">
            Live Preview
          </h4>
          <div className="flex justify-center">
            <div
              className="relative shadow-lg"
              style={{
                width: frameWidth,
                height: frameHeight,
                background: matColor,
                borderRadius: "0.5rem",
              }}
            >
              {/* Mat frame */}
              {!isNoMat && (
                <div
                  className="absolute inset-0 rounded-lg"
                  style={{ background: matColor }}
                />
              )}

              {/* Image grid */}
              <div
                className="absolute grid gap-1"
                style={{
                  top: matPx,
                  left: matPx,
                  width: `calc(100% - ${matPx * 2}px)`,
                  height: `calc(100% - ${matPx * 2}px)`,
                  gridTemplateRows: `repeat(${grid.rows}, 1fr)`,
                  gridTemplateColumns: `repeat(${grid.cols}, 1fr)`,
                  borderRadius: "0.375rem",
                  overflow: "hidden",
                }}
              >
                {Array.from({ length: totalSlots }).map((_, i) => (
                  <div
                    key={i}
                    className="relative bg-gray-800 border border-gray-700 rounded overflow-hidden"
                    style={{
                      minHeight: Math.max(artworkHeight, 40),
                      minWidth: Math.max(artworkWidth, 40),
                    }}
                  >
                    {imagesToShow[i] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={imagesToShow[i]}
                        alt={`Preview ${i + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.warn(
                            "Image failed to load:",
                            imagesToShow[i]
                          );
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-500 text-xs">
                        {i < previewImages.length ? "Image" : "Empty"}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Preview info */}
          <div className="mt-4 text-center space-y-1">
            <div className="text-sm text-gray-400">
              Layout: {layout.name} ({grid.rows}×{grid.cols})
            </div>
            {!isNoMat && (
              <div className="text-xs text-gray-500">
                Mat: {matPercent}% width,{" "}
                {matColors.find((c) => c.color === matColor)?.name}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
