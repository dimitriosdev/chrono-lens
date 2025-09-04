"use client";

import React from "react";

interface SlideshowDebugInfoProps {
  screenWidth: number;
  screenHeight: number;
  frameWidth: number;
  frameHeight: number;
  containerMode: boolean;
}

const SlideshowDebugInfo: React.FC<SlideshowDebugInfoProps> = ({
  screenWidth,
  screenHeight,
  frameWidth,
  frameHeight,
  containerMode,
}) => {
  // Only show in development
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 bg-black/80 text-white p-2 text-xs z-[9999] font-mono">
      <div>
        Screen: {screenWidth}x{screenHeight}
      </div>
      <div>
        Frame: {frameWidth}x{frameHeight}
      </div>
      <div>Container Mode: {containerMode ? "true" : "false"}</div>
      <div>
        Viewport:{" "}
        {typeof window !== "undefined"
          ? `${window.innerWidth}x${window.innerHeight}`
          : "SSR"}
      </div>
      <div>
        Screen Available:{" "}
        {typeof window !== "undefined"
          ? `${window.screen.availWidth}x${window.screen.availHeight}`
          : "SSR"}
      </div>
    </div>
  );
};

export default SlideshowDebugInfo;
