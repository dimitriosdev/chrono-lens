"use client";

import React from "react";
import { useFullscreen } from "@/shared/hooks/useFullscreen";

interface FullscreenButtonProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export default function FullscreenButton({
  className = "",
  size = "md",
}: FullscreenButtonProps) {
  const { isFullscreen, toggleFullscreen, isSupported } = useFullscreen();

  if (!isSupported) {
    return null; // Don't render if fullscreen is not supported
  }

  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  const buttonSizeClasses = {
    sm: "p-1",
    md: "p-2",
    lg: "p-3",
  };

  return (
    <button
      onClick={toggleFullscreen}
      className={`bg-gray-900 hover:bg-gray-700 text-white rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-white transition-all duration-300 ${buttonSizeClasses[size]} ${className}`}
      aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
      title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
    >
      {isFullscreen ? (
        // Exit fullscreen icon (compress/minimize)
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className={sizeClasses[size]}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M15 15v4.5M15 15h4.5M15 15l5.25 5.25"
          />
        </svg>
      ) : (
        // Enter fullscreen icon (expand)
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className={sizeClasses[size]}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"
          />
        </svg>
      )}
    </button>
  );
}
