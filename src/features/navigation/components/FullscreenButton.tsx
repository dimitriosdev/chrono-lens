"use client";

import { memo, useState, useEffect } from "react";
import {
  ArrowsPointingInIcon,
  ArrowsPointingOutIcon,
} from "@heroicons/react/24/solid";
import { useGlobalFullscreen } from "@/context";
import { helpers } from "@/shared/constants/designSystem";

export interface FullscreenButtonProps {
  /** Additional CSS classes */
  className?: string;
  /** Button size variant */
  size?: "sm" | "md" | "lg";
  /** Custom aria-label override */
  "aria-label"?: string;
}

/**
 * Size configuration for the fullscreen button
 */
const SIZE_CONFIG = {
  sm: {
    icon: "w-4 h-4",
    button: "p-1",
  },
  md: {
    icon: "w-6 h-6",
    button: "p-2",
  },
  lg: {
    icon: "w-8 h-8",
    button: "p-3",
  },
} as const;

/**
 * Fullscreen toggle button component
 * Uses Heroicons for consistent styling with the rest of the app
 */
const FullscreenButton = memo<FullscreenButtonProps>(
  ({ className, size = "md", "aria-label": ariaLabel }) => {
    const { isFullscreen, toggleFullscreen, isSupported } =
      useGlobalFullscreen();
    const [isMounted, setIsMounted] = useState(false);

    // Prevent hydration mismatch by only rendering interactive content after mount
    useEffect(() => {
      setIsMounted(true);
    }, []);

    // Don't render if fullscreen is not supported or not yet mounted
    if (!isSupported || !isMounted) {
      return null;
    }

    const sizeConfig = SIZE_CONFIG[size];
    const defaultAriaLabel = isFullscreen
      ? "Exit fullscreen"
      : "Enter fullscreen";
    const buttonAriaLabel = ariaLabel ?? defaultAriaLabel;

    const handleClick = (): void => {
      // Fire and forget - errors are handled in the hook
      void toggleFullscreen();
    };

    return (
      <button
        type="button"
        onClick={handleClick}
        className={helpers.cn(
          // Base styles
          "bg-gray-900 hover:bg-gray-700 text-white rounded-lg shadow-lg",
          "focus:outline-none focus:ring-2 focus:ring-white",
          "transition-all duration-300",
          // Size-specific padding
          sizeConfig.button,
          // Custom classes
          className
        )}
        aria-label={buttonAriaLabel}
        title={buttonAriaLabel}
      >
        {isFullscreen ? (
          <ArrowsPointingInIcon
            className={sizeConfig.icon}
            aria-hidden="true"
          />
        ) : (
          <ArrowsPointingOutIcon
            className={sizeConfig.icon}
            aria-hidden="true"
          />
        )}
      </button>
    );
  }
);

FullscreenButton.displayName = "FullscreenButton";

export default FullscreenButton;
