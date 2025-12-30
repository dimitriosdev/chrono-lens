"use client";

import React from "react";
import * as Switch from "@radix-ui/react-switch";
import * as Slider from "@radix-ui/react-slider";
import { LayoutType } from "@/features/albums/constants/AlbumLayout";
import {
  PlayIcon,
  Squares2X2Icon,
  CheckCircleIcon,
  CogIcon,
} from "@heroicons/react/24/outline";

interface TimingConfig {
  slideshow?: {
    cycleDuration: number;
  };
  interactive?: {
    autoAdvance: boolean;
    autoAdvanceDuration: number;
    transitionSpeed: "fast" | "normal" | "smooth";
  };
}

interface LayoutSelectorProps {
  currentLayoutType: LayoutType;
  onLayoutChange: (layoutType: LayoutType) => void;
  timing?: TimingConfig;
  onTimingChange?: (timing: TimingConfig) => void;
  className?: string;
}

export function LayoutSelector({
  currentLayoutType,
  onLayoutChange,
  timing = {},
  onTimingChange,
  className = "",
}: LayoutSelectorProps) {
  // Get current timing values with defaults
  const currentSlideshowDuration = timing.slideshow?.cycleDuration ?? 5;
  const currentAutoAdvance = timing.interactive?.autoAdvance ?? false;
  const currentAutoAdvanceDuration =
    timing.interactive?.autoAdvanceDuration ?? 5;

  // Handle timing configuration changes
  const handleSlideshowDurationChange = (value: number[]) => {
    if (!onTimingChange) return;
    onTimingChange({
      ...timing,
      slideshow: {
        cycleDuration: value[0],
      },
    });
  };

  const handleAutoAdvanceToggle = (checked: boolean) => {
    if (!onTimingChange) return;
    onTimingChange({
      ...timing,
      interactive: {
        ...timing.interactive,
        autoAdvance: checked,
        autoAdvanceDuration: timing.interactive?.autoAdvanceDuration ?? 5,
        transitionSpeed: timing.interactive?.transitionSpeed ?? "normal",
      },
    });
  };

  const handleAutoAdvanceDurationChange = (value: number[]) => {
    if (!onTimingChange) return;
    onTimingChange({
      ...timing,
      interactive: {
        ...timing.interactive,
        autoAdvance: timing.interactive?.autoAdvance ?? false,
        autoAdvanceDuration: value[0],
        transitionSpeed: timing.interactive?.transitionSpeed ?? "normal",
      },
    });
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Simplified Layout Toggle */}
      <div className="flex gap-2">
        {/* Slideshow Option */}
        <button
          onClick={() => onLayoutChange("slideshow")}
          className={`flex-1 flex items-center gap-2 p-3 rounded-lg border-2 transition-all ${
            currentLayoutType === "slideshow"
              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
              : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600"
          }`}
        >
          <div
            className={`p-1.5 rounded-md ${
              currentLayoutType === "slideshow"
                ? "bg-blue-500 text-white"
                : "bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400"
            }`}
          >
            <PlayIcon className="w-4 h-4" />
          </div>
          <div className="text-left">
            <div
              className={`text-sm font-medium ${
                currentLayoutType === "slideshow"
                  ? "text-blue-700 dark:text-blue-300"
                  : "text-neutral-700 dark:text-neutral-300"
              }`}
            >
              Slideshow
            </div>
            <div className="text-xs text-neutral-500 dark:text-neutral-400 hidden sm:block">
              Full-screen, auto-advance
            </div>
          </div>
          {currentLayoutType === "slideshow" && (
            <CheckCircleIcon className="w-5 h-5 text-blue-500 ml-auto" />
          )}
        </button>

        {/* Grid Option */}
        <button
          onClick={() => onLayoutChange("grid")}
          className={`flex-1 flex items-center gap-2 p-3 rounded-lg border-2 transition-all ${
            currentLayoutType === "grid"
              ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
              : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600"
          }`}
        >
          <div
            className={`p-1.5 rounded-md ${
              currentLayoutType === "grid"
                ? "bg-purple-500 text-white"
                : "bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400"
            }`}
          >
            <Squares2X2Icon className="w-4 h-4" />
          </div>
          <div className="text-left">
            <div
              className={`text-sm font-medium ${
                currentLayoutType === "grid"
                  ? "text-purple-700 dark:text-purple-300"
                  : "text-neutral-700 dark:text-neutral-300"
              }`}
            >
              Grid
            </div>
            <div className="text-xs text-neutral-500 dark:text-neutral-400 hidden sm:block">
              Multi-image view
            </div>
          </div>
          {currentLayoutType === "grid" && (
            <CheckCircleIcon className="w-5 h-5 text-purple-500 ml-auto" />
          )}
        </button>
      </div>

      {/* Timing Settings - Collapsible */}
      {onTimingChange && (
        <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-lg p-3 space-y-3">
          <div className="flex items-center gap-2 text-xs font-medium text-neutral-600 dark:text-neutral-400">
            <CogIcon className="w-3.5 h-3.5" />
            <span>Timing</span>
          </div>

          {currentLayoutType === "slideshow" ? (
            /* Slideshow Timing */
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-600 dark:text-neutral-400">
                  Speed: {currentSlideshowDuration}s per slide
                </span>
              </div>
              <Slider.Root
                value={[currentSlideshowDuration]}
                onValueChange={handleSlideshowDurationChange}
                max={15}
                min={2}
                step={1}
                className="relative flex items-center select-none touch-none w-full h-4"
              >
                <Slider.Track className="bg-neutral-200 dark:bg-neutral-700 relative grow rounded-full h-1.5">
                  <Slider.Range className="absolute bg-blue-500 rounded-full h-full" />
                </Slider.Track>
                <Slider.Thumb className="block w-4 h-4 bg-white border-2 border-blue-500 rounded-full shadow hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </Slider.Root>
              <div className="flex justify-between text-[10px] text-neutral-400">
                <span>Fast</span>
                <span>Slow</span>
              </div>
            </div>
          ) : (
            /* Grid Timing */
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-600 dark:text-neutral-400">
                  Auto-advance images
                </span>
                <Switch.Root
                  checked={currentAutoAdvance}
                  onCheckedChange={handleAutoAdvanceToggle}
                  className="w-9 h-5 bg-neutral-200 dark:bg-neutral-700 rounded-full relative data-[state=checked]:bg-purple-500 transition-colors"
                >
                  <Switch.Thumb className="block w-4 h-4 bg-white rounded-full transition-transform translate-x-0.5 data-[state=checked]:translate-x-[18px] shadow" />
                </Switch.Root>
              </div>

              {currentAutoAdvance && (
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-neutral-500">
                      Every {currentAutoAdvanceDuration}s
                    </span>
                  </div>
                  <Slider.Root
                    value={[currentAutoAdvanceDuration]}
                    onValueChange={handleAutoAdvanceDurationChange}
                    max={20}
                    min={2}
                    step={1}
                    className="relative flex items-center select-none touch-none w-full h-4"
                  >
                    <Slider.Track className="bg-neutral-200 dark:bg-neutral-700 relative grow rounded-full h-1.5">
                      <Slider.Range className="absolute bg-purple-500 rounded-full h-full" />
                    </Slider.Track>
                    <Slider.Thumb className="block w-4 h-4 bg-white border-2 border-purple-500 rounded-full shadow hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-400" />
                  </Slider.Root>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
