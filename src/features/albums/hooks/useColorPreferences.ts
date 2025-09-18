import React from "react";
import { Album } from "@/features/albums/types/Album";
import { updateAlbum } from "@/shared/lib/firestore";

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
  saveColors: () => Promise<void>;
  resetMatColor: () => Promise<void>;
  resetBackgroundColor: () => Promise<void>;
  toggleAlbumTitle: () => void;
}

interface ColorPreferencesHookReturn extends ColorPreferences, ColorActions {
  isInitialized: boolean;
}

// Storage keys
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
  const albumBackgroundColor = album?.matConfig?.backgroundColor;
  const albumTextColor = album?.matConfig?.textColor;

  // Initialize colors when album loads
  React.useEffect(() => {
    if (album && !isInitialized) {
      // Initialize selected colors with current album values for immediate feedback
      setSelectedMatColor(albumMatColor || null);
      setSelectedBackgroundColor(albumBackgroundColor || null);

      // Load show title preference from localStorage
      const savedShowTitle = localStorage.getItem(SHOW_ALBUM_TITLE_KEY);
      if (savedShowTitle !== null) {
        setShowAlbumTitle(savedShowTitle === "true");
      }

      setIsInitialized(true);
    }
  }, [album, albumMatColor, albumBackgroundColor, isInitialized]);

  // Save show album title to localStorage (only after initialization)
  React.useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(SHOW_ALBUM_TITLE_KEY, showAlbumTitle.toString());
    }
  }, [showAlbumTitle, isInitialized]);

  // Computed effective colors - use selected colors for immediate feedback, fall back to album colors
  const effectiveMatColor = selectedMatColor || albumMatColor || "#000";
  const effectiveBackgroundColor =
    selectedBackgroundColor || albumBackgroundColor || "#ffffff";

  // Actions
  const selectMatColor = React.useCallback((color: string) => {
    setSelectedMatColor(color);
  }, []);

  const selectBackgroundColor = React.useCallback((color: string) => {
    setSelectedBackgroundColor(color);
  }, []);

  const saveColors = React.useCallback(async () => {
    // Save current selected colors to database if album exists
    if (album?.id) {
      try {
        await updateAlbum(album.id, {
          matConfig: {
            ...album.matConfig,
            matColor: selectedMatColor || album.matConfig?.matColor || "#000",
            backgroundColor:
              selectedBackgroundColor ||
              album.matConfig?.backgroundColor ||
              "#ffffff",
            matWidth: album.matConfig?.matWidth || 20,
          },
        });
      } catch (error) {
        console.error("Failed to save colors to database:", error);
        throw error; // Re-throw so the UI can handle the error
      }
    } else {
      console.warn("Cannot save colors: no album ID");
    }
  }, [album, selectedMatColor, selectedBackgroundColor]);

  const resetMatColor = React.useCallback(async () => {
    setSelectedMatColor(null);

    // Reset to default in database if album exists
    if (album?.id) {
      try {
        await updateAlbum(album.id, {
          matConfig: {
            ...album.matConfig,
            matColor: "#000", // Reset to default
            matWidth: album.matConfig?.matWidth || 20,
          },
        });
      } catch (error) {
        console.error("Failed to reset mat color in database:", error);
      }
    }
  }, [album]);

  const resetBackgroundColor = React.useCallback(async () => {
    setSelectedBackgroundColor(null);

    // Reset to default in database if album exists
    if (album?.id) {
      try {
        await updateAlbum(album.id, {
          matConfig: {
            ...album.matConfig,
            backgroundColor: "#ffffff", // Reset to default
            matColor: album.matConfig?.matColor || "#000",
            matWidth: album.matConfig?.matWidth || 20,
          },
        });
      } catch (error) {
        console.error("Failed to reset background color in database:", error);
      }
    }
  }, [album]);

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
    saveColors,
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
