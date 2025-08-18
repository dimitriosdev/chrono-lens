import React from "react";
import { AlbumLayout } from "@/features/albums/AlbumLayout";

const matColors = [
  { name: "No Mat", color: "#000" },
  { name: "Classic White", color: "#f8f8f8" },
  { name: "Soft Yellow", color: "#ffe88a" },
  { name: "Modern Grey", color: "#bfc2c3" },
  { name: "Blush Pink", color: "#f8e1ea" },
];

export type MatConfig = {
  matWidth: number;
  matColor: string;
};

interface MatBoardProps {
  config: MatConfig;
  setConfig: (c: MatConfig) => void;
  layout: AlbumLayout;
}

export function MatBoard({ config, setConfig, layout }: MatBoardProps) {
  const { matWidth, matColor } = config;
  const matOptions = matColors;
  // colorObj removed (unused)
  const color = matColor;
  const frameWidth = 400;
  const frameHeight = 300;
  const minPercent = 5;
  const maxPercent = 40;
  const matPercent = matWidth || minPercent;
  const isNoMat = matColor === matOptions[0].color;
  const matPx = isNoMat
    ? 0
    : Math.floor((matPercent / 100) * Math.min(frameWidth, frameHeight));

  // Layout grid
  const { grid } = React.useMemo(
    () => ({
      grid: layout?.grid || { rows: 1, cols: 1 },
    }),
    [layout]
  );

  // Calculate artwork area size and aspect ratio
  let artworkWidth = (frameWidth - matPx * 2) / grid.cols;
  let artworkHeight = (frameHeight - matPx * 2) / grid.rows;
  // If portrait orientation, make artwork taller than wide
  if (layout?.orientation === "portrait") {
    const portraitRatio = 4 / 5; // width/height for portrait
    artworkHeight = artworkWidth / portraitRatio;
    // Clamp height to available space
    if (artworkHeight > frameHeight - matPx * 2) {
      artworkHeight = frameHeight - matPx * 2;
      artworkWidth = artworkHeight * portraitRatio;
    }
  }

  return (
    <div className="p-8 bg-gray-900 rounded-xl shadow-lg">
      <h2 className="text-xl font-bold mb-4 text-gray-100">Mat Board</h2>
      <div className="mb-4 flex flex-wrap gap-4">
        <div className="min-w-[120px] flex-1">
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Mat Color
          </label>
          <select
            value={matColor}
            onChange={(e) => {
              setConfig({ ...config, matColor: e.target.value });
            }}
            className="w-full bg-gray-800 text-white border border-gray-700 rounded px-2 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {matOptions.map((c) => (
              <option
                value={c.color}
                key={c.name}
                className="bg-gray-800 text-white"
              >
                {c.name}
              </option>
            ))}
          </select>
        </div>
        {!isNoMat && (
          <div className="min-w-[120px] flex-1">
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Mat Width
            </label>
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
            <span className="ml-2 text-gray-400">{matPercent}%</span>
          </div>
        )}
      </div>
      <div
        className="relative w-full max-w-[400px] aspect-[4/3] mx-auto bg-white shadow-md border border-gray-700"
        style={{ background: color }}
      >
        {/* Outer mat (skip if No Mat) */}
        {!isNoMat && (
          <div
            className="absolute top-0 left-0 w-full h-full rounded-lg"
            style={{ background: color, boxSizing: "border-box" }}
          />
        )}
        {/* Artwork grid */}
        <div
          className="absolute grid gap-2"
          style={{
            top: matPx,
            left: matPx,
            width: `calc(100% - ${matPx * 2}px)`,
            height: `calc(100% - ${matPx * 2}px)`,
            display: "grid",
            gridTemplateRows: `repeat(${grid.rows}, 1fr)`,
            gridTemplateColumns: `repeat(${grid.cols}, 1fr)`,
            background: isNoMat ? "#000" : "#fff",
            boxShadow: !isNoMat ? "0 0 0 1px #ccc" : undefined,
            borderRadius: "0.75rem",
            overflow: "hidden",
          }}
        >
          {Array.from({ length: grid.rows * grid.cols }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-center rounded-xl border border-gray-300 bg-white shadow-md"
              style={{
                width: artworkWidth,
                height: artworkHeight,
                minHeight: 80,
                minWidth: 40,
                overflow: "hidden",
              }}
              aria-label={`Artwork placeholder ${i + 1}`}
            >
              <span className="text-lg text-gray-500">Artwork</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
