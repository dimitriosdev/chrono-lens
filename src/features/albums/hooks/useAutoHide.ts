/**
 * useAutoHide Hook
 *
 * Manages auto-minimize/reveal behavior for overlay UI elements.
 * After a configurable delay of inactivity, the element is minimized.
 * Mouse/touch interaction reveals it; leaving restarts the timer.
 *
 * Used by RadioPlayer to auto-hide after user stops interacting.
 */

import React from "react";

/** Default delay before auto-hiding (ms) */
const DEFAULT_HIDE_DELAY = 3000;

interface UseAutoHideOptions {
  /** Delay in ms before auto-minimizing (default: 3000) */
  hideDelay?: number;
  /** When true, the timer is paused (e.g., expanded panel is open) */
  isPinned?: boolean;
}

interface UseAutoHideReturn {
  /** Whether the element is currently minimized */
  isMinimized: boolean;
  /** Whether the user is hovering over the element */
  isHovering: boolean;
  /** Attach to the container's onMouseEnter */
  handleMouseEnter: () => void;
  /** Attach to the container's onMouseLeave */
  handleMouseLeave: () => void;
  /** Programmatically reveal the element */
  reveal: () => void;
}

export function useAutoHide(
  options: UseAutoHideOptions = {},
): UseAutoHideReturn {
  const { hideDelay = DEFAULT_HIDE_DELAY, isPinned = false } = options;

  const [isMinimized, setIsMinimized] = React.useState(false);
  const [isHovering, setIsHovering] = React.useState(false);
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = React.useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = React.useCallback(() => {
    clearTimer();
    timerRef.current = setTimeout(() => setIsMinimized(true), hideDelay);
  }, [clearTimer, hideDelay]);

  const reveal = React.useCallback(() => {
    setIsMinimized(false);
    clearTimer();
  }, [clearTimer]);

  const handleMouseEnter = React.useCallback(() => {
    setIsHovering(true);
    reveal();
  }, [reveal]);

  const handleMouseLeave = React.useCallback(() => {
    setIsHovering(false);
    if (!isPinned) {
      startTimer();
    }
  }, [isPinned, startTimer]);

  // Start initial timer on mount
  React.useEffect(() => {
    startTimer();
    return clearTimer;
  }, [startTimer, clearTimer]);

  // When pinned, keep visible; when unpinned, restart timer (unless hovering)
  React.useEffect(() => {
    if (isPinned) {
      setIsMinimized(false);
      clearTimer();
    } else if (!isHovering) {
      startTimer();
    }
  }, [isPinned, isHovering, startTimer, clearTimer]);

  return {
    isMinimized,
    isHovering,
    handleMouseEnter,
    handleMouseLeave,
    reveal,
  };
}
