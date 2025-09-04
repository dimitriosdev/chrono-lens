"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { usePathname } from "next/navigation";

/**
 * Cross-browser fullscreen API types
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

export interface FullscreenContextType {
  /** Whether the document is currently in fullscreen mode */
  isFullscreen: boolean;
  /** Whether the user wants to stay in fullscreen mode (persists across navigation) */
  fullscreenIntent: boolean;
  /** Toggle between fullscreen and normal mode */
  toggleFullscreen: () => Promise<void>;
  /** Enter fullscreen mode */
  enterFullscreen: () => Promise<void>;
  /** Exit fullscreen mode */
  exitFullscreen: () => Promise<void>;
  /** Whether fullscreen API is supported by the browser */
  isSupported: boolean;
}

const FullscreenContext = createContext<FullscreenContextType | null>(null);

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
 * FullscreenProvider component that manages global fullscreen state
 */
export const FullscreenProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenIntent, setFullscreenIntent] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();

  // Prevent hydration issues
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Memoize support check to avoid repeated calculations
  const isSupported = useMemo(() => {
    if (!isMounted) return false;
    return isFullscreenSupported();
  }, [isMounted]);

  // Check fullscreen state when route changes and auto-re-enter if needed
  useEffect(() => {
    if (!isMounted) return;

    // Small delay to allow navigation to complete
    const timeoutId = setTimeout(async () => {
      const fullscreenElement = getFullscreenElement();
      const actualIsFullscreen = !!fullscreenElement;

      // If user intended to be in fullscreen but navigation exited it, re-enter
      // Add throttling to prevent browser rate limiting
      if (fullscreenIntent && !actualIsFullscreen && isSupported) {
        // Check if we recently made a fullscreen request (throttling)
        const lastRequest = sessionStorage.getItem('lastFullscreenRequest');
        const now = Date.now();
        const minInterval = 1000; // Minimum 1 second between requests
        
        if (!lastRequest || now - parseInt(lastRequest) > minInterval) {
          console.log("Auto re-entering fullscreen after navigation");
          sessionStorage.setItem('lastFullscreenRequest', now.toString());
          
          try {
            const element = document.documentElement as ExtendedHTMLElement;
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
            console.warn("Failed to auto re-enter fullscreen:", error);
            // If rate limited, clear intent to prevent infinite retries
            if (error instanceof Error && error.message.includes('rate')) {
              setFullscreenIntent(false);
            }
          }
        } else {
          console.log('Skipping fullscreen re-entry due to rate limiting');
        }
      }

      setIsFullscreen((prev) => {
        if (prev !== actualIsFullscreen) {
          console.log(
            "Route change fullscreen sync: was",
            prev,
            "now",
            actualIsFullscreen
          );
          return actualIsFullscreen;
        }
        return prev;
      });
    }, 500); // Increased delay to ensure navigation is complete and reduce rapid requests

    return () => clearTimeout(timeoutId);
  }, [pathname, isMounted, fullscreenIntent, isSupported]);

  // Handle fullscreen change events and navigation-based exits
  useEffect(() => {
    if (!isBrowser() || !isMounted) return;

    const handleFullscreenChange = (): void => {
      const fullscreenElement = getFullscreenElement();
      const newIsFullscreen = !!fullscreenElement;
      setIsFullscreen(newIsFullscreen);

      // Only clear intent if user manually exited (not due to navigation)
      // We detect manual exit by checking if the change happens quickly after intent was set
      if (!newIsFullscreen && fullscreenIntent) {
        console.log(
          "Fullscreen exited - maintaining intent for potential auto re-entry"
        );
      }
    };

    // Check fullscreen state periodically to catch navigation-based exits
    const checkFullscreenState = (): void => {
      const fullscreenElement = getFullscreenElement();
      const actualIsFullscreen = !!fullscreenElement;

      // Update state if it's out of sync
      setIsFullscreen((prev) => {
        if (prev !== actualIsFullscreen) {
          console.log(
            "Fullscreen state sync: was",
            prev,
            "now",
            actualIsFullscreen
          );
          return actualIsFullscreen;
        }
        return prev;
      });
    };

    // All possible fullscreen change event names
    const eventNames = [
      "fullscreenchange",
      "webkitfullscreenchange",
      "mozfullscreenchange",
      "MSFullscreenChange",
    ] as const;

    // Add event listeners for fullscreen changes
    eventNames.forEach((eventName) => {
      document.addEventListener(eventName, handleFullscreenChange, {
        passive: true,
      });
    });

    // Listen for navigation events that might cause fullscreen to exit
    const handleVisibilityChange = (): void => {
      if (document.visibilityState === "visible") {
        // Check fullscreen state when page becomes visible again
        setTimeout(checkFullscreenState, 100);
      }
    };

    const handleFocus = (): void => {
      // Check fullscreen state when window regains focus
      setTimeout(checkFullscreenState, 100);
    };

    const handleResize = (): void => {
      // Check fullscreen state on window resize (may indicate fullscreen exit)
      setTimeout(checkFullscreenState, 100);
    };

    // Add additional event listeners
    document.addEventListener("visibilitychange", handleVisibilityChange, {
      passive: true,
    });
    window.addEventListener("focus", handleFocus, { passive: true });
    window.addEventListener("resize", handleResize, { passive: true });

    // Periodic check for fullscreen state (fallback)
    const intervalId = setInterval(checkFullscreenState, 1000);

    // Initial state check
    handleFullscreenChange();

    // Cleanup
    return () => {
      eventNames.forEach((eventName) => {
        document.removeEventListener(eventName, handleFullscreenChange);
      });
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("resize", handleResize);
      clearInterval(intervalId);
    };
  }, [isMounted, fullscreenIntent]);

  const enterFullscreen = useCallback(async (): Promise<void> => {
    if (!isSupported || !isBrowser()) return;

    try {
      const element = document.documentElement as ExtendedHTMLElement;

      // Set intent before attempting to enter fullscreen
      setFullscreenIntent(true);

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
      // Reset intent if failed
      setFullscreenIntent(false);
    }
  }, [isSupported]);

  const exitFullscreen = useCallback(async (): Promise<void> => {
    if (!isSupported || !isBrowser()) return;

    try {
      const doc = document as ExtendedDocument;

      // Clear intent when user explicitly exits
      setFullscreenIntent(false);

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

  const value = useMemo(
    () => ({
      isFullscreen,
      fullscreenIntent,
      toggleFullscreen,
      enterFullscreen,
      exitFullscreen,
      isSupported,
    }),
    [
      isFullscreen,
      fullscreenIntent,
      toggleFullscreen,
      enterFullscreen,
      exitFullscreen,
      isSupported,
    ]
  );

  return (
    <FullscreenContext.Provider value={value}>
      {children}
    </FullscreenContext.Provider>
  );
};

/**
 * Hook to use the fullscreen context
 * Throws an error if used outside of FullscreenProvider
 */
export const useGlobalFullscreen = (): FullscreenContextType => {
  const context = useContext(FullscreenContext);

  if (!context) {
    throw new Error(
      "useGlobalFullscreen must be used within a FullscreenProvider"
    );
  }

  return context;
};
