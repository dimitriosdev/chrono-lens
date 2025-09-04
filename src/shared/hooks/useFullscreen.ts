import { useState, useEffect, useCallback, useMemo } from "react";

/**
 * Cross-browser fullscreen API types
 * These interfaces extend the standard DOM types to include vendor-prefixed methods
 */
interface ExtendedDocument extends Document {
  webkitFullscreenEnabled?: boolean;
  mozFullScreenEnabled?: boolean;
  msFullscreenEnabled?: boolean;
  webkitFullscreenElement?: Element;
  mozFullScreenElement?: Element;
  msFullscreenElement?: Element;
  webkitExitFullscreen?: () => Promise<void>;
  mozCancelFullScreen?: () => Promise<void>;
  msExitFullscreen?: () => Promise<void>;
}

interface ExtendedHTMLElement extends HTMLElement {
  webkitRequestFullscreen?: () => Promise<void>;
  mozRequestFullScreen?: () => Promise<void>;
  msRequestFullscreen?: () => Promise<void>;
}

export interface FullscreenHookReturn {
  /** Whether the document is currently in fullscreen mode */
  isFullscreen: boolean;
  /** Toggle between fullscreen and normal mode */
  toggleFullscreen: () => Promise<void>;
  /** Enter fullscreen mode */
  enterFullscreen: () => Promise<void>;
  /** Exit fullscreen mode */
  exitFullscreen: () => Promise<void>;
  /** Whether fullscreen API is supported by the browser */
  isSupported: boolean;
}

/**
 * Browser environment check utility
 */
const isBrowser = (): boolean => {
  return typeof window !== "undefined" && typeof document !== "undefined";
};

/**
 * Get the current fullscreen element across different browsers
 */
const getFullscreenElement = (): Element | null => {
  if (!isBrowser()) return null;

  const doc = document as ExtendedDocument;
  return (
    document.fullscreenElement ||
    doc.webkitFullscreenElement ||
    doc.mozFullScreenElement ||
    doc.msFullscreenElement ||
    null
  );
};

/**
 * Check if fullscreen API is supported
 */
const isFullscreenSupported = (): boolean => {
  if (!isBrowser()) return false;

  const doc = document as ExtendedDocument;
  return !!(
    document.fullscreenEnabled ||
    doc.webkitFullscreenEnabled ||
    doc.mozFullScreenEnabled ||
    doc.msFullscreenEnabled
  );
};

/**
 * Cross-browser fullscreen hook
 * Provides a consistent API for entering/exiting fullscreen mode across different browsers
 */
export const useFullscreen = (): FullscreenHookReturn => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Memoize support check to avoid repeated calculations
  const isSupported = useMemo(() => isFullscreenSupported(), []);

  // Handle fullscreen change events
  useEffect(() => {
    if (!isBrowser()) return;

    const handleFullscreenChange = (): void => {
      const fullscreenElement = getFullscreenElement();
      setIsFullscreen(!!fullscreenElement);
    };

    // All possible fullscreen change event names
    const eventNames = [
      "fullscreenchange",
      "webkitfullscreenchange",
      "mozfullscreenchange",
      "MSFullscreenChange",
    ] as const;

    // Add event listeners
    eventNames.forEach((eventName) => {
      document.addEventListener(eventName, handleFullscreenChange);
    });

    // Initial state check
    handleFullscreenChange();

    // Cleanup
    return () => {
      eventNames.forEach((eventName) => {
        document.removeEventListener(eventName, handleFullscreenChange);
      });
    };
  }, []);

  const enterFullscreen = useCallback(async (): Promise<void> => {
    if (!isSupported || !isBrowser()) return;

    try {
      const element = document.documentElement as ExtendedHTMLElement;

      // Try standard method first, then vendor-specific methods
      if (element.requestFullscreen) {
        await element.requestFullscreen();
      } else if (element.webkitRequestFullscreen) {
        await element.webkitRequestFullscreen();
      } else if (element.mozRequestFullScreen) {
        await element.mozRequestFullScreen();
      } else if (element.msRequestFullscreen) {
        await element.msRequestFullscreen();
      }
    } catch (error) {
      console.warn("Failed to enter fullscreen:", error);
    }
  }, [isSupported]);

  const exitFullscreen = useCallback(async (): Promise<void> => {
    if (!isSupported || !isBrowser()) return;

    try {
      const doc = document as ExtendedDocument;

      // Try standard method first, then vendor-specific methods
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if (doc.webkitExitFullscreen) {
        await doc.webkitExitFullscreen();
      } else if (doc.mozCancelFullScreen) {
        await doc.mozCancelFullScreen();
      } else if (doc.msExitFullscreen) {
        await doc.msExitFullscreen();
      }
    } catch (error) {
      console.warn("Failed to exit fullscreen:", error);
    }
  }, [isSupported]);

  const toggleFullscreen = useCallback(async (): Promise<void> => {
    if (isFullscreen) {
      await exitFullscreen();
    } else {
      await enterFullscreen();
    }
  }, [isFullscreen, enterFullscreen, exitFullscreen]);

  return {
    isFullscreen,
    toggleFullscreen,
    enterFullscreen,
    exitFullscreen,
    isSupported,
  };
};
