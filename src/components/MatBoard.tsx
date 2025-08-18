import React from "react";

const matColors = [
  { name: "Classic White", outer: "#f8f8f8", inner: "#4b306a" },
  { name: "Soft Yellow", outer: "#ffe88a", inner: "#222" },
  { name: "Modern Grey", outer: "#bfc2c3", inner: "#222" },
  { name: "Blush Pink", outer: "#f8e1ea", inner: "#d16ba5" },
];

export type MatConfig = {
  selected: number;
  matWidth: number;
  doubleMat: boolean;
};

interface MatBoardProps {
  config: MatConfig;
  setConfig: (c: MatConfig) => void;
}

export function MatBoard({ config, setConfig }: MatBoardProps) {
  const { selected, matWidth } = config;
  const matOptions = [
    { name: "No Mat", outer: "#000", inner: "#000" },
    ...matColors,
  ];
  const color = matOptions[selected];
  const frameWidth = 400;
  const frameHeight = 300;
  const minPercent = 5;
  const maxPercent = 40;
  const matPercent = matWidth || minPercent;
  const matPx =
    selected === 0
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
            value={selected}
            onChange={(e) =>
              setConfig({ ...config, selected: Number(e.target.value) })
            }
            className="w-full bg-gray-800 text-white border border-gray-700 rounded px-2 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {matOptions.map((c, i) => (
              <option value={i} key={c.name} className="bg-gray-800 text-white">
                {c.name}
              </option>
            ))}
          </select>
        </div>
        {selected !== 0 && (
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
        style={{ background: color.outer }}
      >
        {/* Outer mat (skip if No Mat) */}
        {selected !== 0 && (
          <div
            className="absolute top-0 left-0 w-full h-full rounded-lg"
            style={{
              background: color.outer,
              border: `4px solid ${color.inner}`,
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
            background: selected === 0 ? "#000" : "#fff",
            boxShadow: selected !== 0 ? "0 0 0 1px #ccc" : undefined,
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
