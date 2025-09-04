import React from "react";
import { Album } from "@/features/albums/types/Album";

interface ColorPreferences {
  selectedMatColor: string | null;
  selectedBackgroundColor: string | null;
  effectiveMatColor: string;
  effectiveBackgroundColor: string;
  albumMatColor?: string;
  albumBackgroundColor?: string;
  showAlbumTitle: boolean;
}

interface ColorActions {
  selectMatColor: (color: string) => void;
  selectBackgroundColor: (color: string) => void;
  resetMatColor: () => void;
  resetBackgroundColor: () => void;
  toggleAlbumTitle: () => void;
}

interface ColorPreferencesHookReturn extends ColorPreferences, ColorActions {
  isInitialized: boolean;
}

// Storage keys
const MAT_COLOR_KEY = "chrono-lens-mat-color";
const BACKGROUND_COLOR_KEY = "chrono-lens-background-color";
const SHOW_ALBUM_TITLE_KEY = "chrono-lens-show-album-title";

export const useColorPreferences = (
  album?: Album
): ColorPreferencesHookReturn => {
  const [selectedMatColor, setSelectedMatColor] = React.useState<string | null>(
    null
  );
  const [selectedBackgroundColor, setSelectedBackgroundColor] = React.useState<
    string | null
  >(null);
  const [showAlbumTitle, setShowAlbumTitle] = React.useState<boolean>(true);
  const [isInitialized, setIsInitialized] = React.useState(false);

  // Album colors
  const albumMatColor = album?.matConfig?.matColor;
  const albumBackgroundColor = (
    album?.matConfig as { backgroundColor?: string }
  )?.backgroundColor;

  // Initialize colors from localStorage when album loads
  React.useEffect(() => {
    if (albumMatColor && !isInitialized) {
      // Load saved preferences
      const savedMatColor = localStorage.getItem(MAT_COLOR_KEY);
      const savedBackgroundColor = localStorage.getItem(BACKGROUND_COLOR_KEY);
      const savedShowTitle = localStorage.getItem(SHOW_ALBUM_TITLE_KEY);

      if (savedMatColor) {
        setSelectedMatColor(savedMatColor);
      }

      if (savedBackgroundColor) {
        setSelectedBackgroundColor(savedBackgroundColor);
      }

      if (savedShowTitle !== null) {
        setShowAlbumTitle(savedShowTitle === "true");
      }

      setIsInitialized(true);
    }
  }, [albumMatColor, isInitialized]);

  // Save mat color to localStorage (only after initialization)
  React.useEffect(() => {
    if (isInitialized && selectedMatColor) {
      localStorage.setItem(MAT_COLOR_KEY, selectedMatColor);
    }
  }, [selectedMatColor, isInitialized]);

  // Save background color to localStorage (only after initialization)
  React.useEffect(() => {
    if (isInitialized && selectedBackgroundColor) {
      localStorage.setItem(BACKGROUND_COLOR_KEY, selectedBackgroundColor);
    }
  }, [selectedBackgroundColor, isInitialized]);

  // Save show album title to localStorage (only after initialization)
  React.useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(SHOW_ALBUM_TITLE_KEY, showAlbumTitle.toString());
    }
  }, [showAlbumTitle, isInitialized]);

  // Computed effective colors
  const effectiveMatColor = selectedMatColor || albumMatColor || "#000";
  const effectiveBackgroundColor =
    selectedBackgroundColor || albumBackgroundColor || "#1a1a1a";

  // Actions
  const selectMatColor = React.useCallback((color: string) => {
    setSelectedMatColor(color);
  }, []);

  const selectBackgroundColor = React.useCallback((color: string) => {
    setSelectedBackgroundColor(color);
  }, []);

  const resetMatColor = React.useCallback(() => {
    setSelectedMatColor(null);
    localStorage.removeItem(MAT_COLOR_KEY);
  }, []);

  const resetBackgroundColor = React.useCallback(() => {
    setSelectedBackgroundColor(null);
    localStorage.removeItem(BACKGROUND_COLOR_KEY);
  }, []);

  const toggleAlbumTitle = React.useCallback(() => {
    setShowAlbumTitle((prev) => !prev);
  }, []);

  return {
    // State
    selectedMatColor,
    selectedBackgroundColor,
    effectiveMatColor,
    effectiveBackgroundColor,
    albumMatColor,
    albumBackgroundColor,
    showAlbumTitle,
    isInitialized,

    // Actions
    selectMatColor,
    selectBackgroundColor,
    resetMatColor,
    resetBackgroundColor,
    toggleAlbumTitle,
  };
};

// Mat colors definition (moved here for consistency)
export const matColors = [
  { name: "No Mat", color: "#000" },
  { name: "Classic White", color: "#f8f8f8" },
  { name: "Soft Yellow", color: "#ffe88a" },
  { name: "Modern Grey", color: "#bfc2c3" },
  { name: "Blush Pink", color: "#f8e1ea" },
  { name: "Deep Black", color: "#1a1a1a" },
  { name: "Cream", color: "#f5f5dc" },
  { name: "Sage Green", color: "#9caf88" },
];

// Utility function to determine if a color is light or dark
export const isLightColor = (color: string): boolean => {
  // Remove # if present
  const hex = color.replace("#", "");

  // Convert to RGB
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  // Calculate relative luminance using W3C formula
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Return true if light (luminance > 0.5)
  return luminance > 0.5;
};

export type { ColorPreferences, ColorActions, ColorPreferencesHookReturn };
