import React from "react";

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
}

export function MatBoard({ config, setConfig }: MatBoardProps) {
  const { matWidth, matColor } = config;
  const matOptions = matColors;
  const colorObj =
    matOptions.find((c) => c.color === matColor) || matOptions[0];
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
              setConfig({
                ...config,
                matColor: e.target.value,
              });
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
            style={{
              background: color,
              // border: `4px solid ${color.inner}`,
              boxSizing: "border-box",
            }}
          />
        )}
        {/* Artwork area */}
        <div
          className="absolute flex items-center justify-center rounded-lg"
          style={{
            top: matPx,
            left: matPx,
            width: `calc(100% - ${matPx * 2}px)`,
            height: `calc(100% - ${matPx * 2}px)`,
            background: isNoMat ? "#000" : "#fff",
            boxShadow: !isNoMat ? "0 0 0 1px #ccc" : undefined,
            fontSize: 18,
            color: "#888",
          }}
        >
          <span className="text-lg text-gray-500">Artwork</span>
        </div>
      </div>
    </div>
  );
}
