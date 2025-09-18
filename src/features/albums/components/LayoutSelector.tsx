"use client";

import React from "react";
import * as Switch from "@radix-ui/react-switch";
import * as RadioGroup from "@radix-ui/react-radio-group";
import * as Slider from "@radix-ui/react-slider";
import {
  createLayout,
  LayoutType,
} from "@/features/albums/constants/AlbumLayout";
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

const TIMING_PRESETS = {
  fast: { duration: 3, label: "Fast (3s)", speed: "fast" as const },
  normal: { duration: 5, label: "Normal (5s)", speed: "normal" as const },
  smooth: { duration: 8, label: "Smooth (8s)", speed: "smooth" as const },
};

interface LayoutSelectorProps {
  imageCount: number;
  currentLayoutType: LayoutType;
  onLayoutChange: (layoutType: LayoutType) => void;
  timing?: TimingConfig;
  onTimingChange?: (timing: TimingConfig) => void;
  className?: string;
}

export function LayoutSelector({
  imageCount,
  currentLayoutType,
  onLayoutChange,
  timing = {},
  onTimingChange,
  className = "",
}: LayoutSelectorProps) {
  const slideshowLayout = createLayout("slideshow", imageCount);
  const gridLayout = createLayout("grid", imageCount);

  // Get current timing values with defaults
  const currentSlideshowDuration = timing.slideshow?.cycleDuration ?? 5;
  const currentAutoAdvance = timing.interactive?.autoAdvance ?? false;
  const currentAutoAdvanceDuration =
    timing.interactive?.autoAdvanceDuration ?? 5;
  const currentTransitionSpeed =
    timing.interactive?.transitionSpeed ?? "normal";

  // Handle timing configuration changes
  const handleSlideshowPresetChange = (presetKey: string) => {
    if (!onTimingChange) return;
    if (presetKey === "custom") return;

    const preset = TIMING_PRESETS[presetKey as keyof typeof TIMING_PRESETS];
    onTimingChange({
      ...timing,
      slideshow: {
        cycleDuration: preset.duration,
      },
    });
  };

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

  const handleTransitionSpeedChange = (speed: string) => {
    if (!onTimingChange) return;
    onTimingChange({
      ...timing,
      interactive: {
        ...timing.interactive,
        autoAdvance: timing.interactive?.autoAdvance ?? false,
        autoAdvanceDuration: timing.interactive?.autoAdvanceDuration ?? 5,
        transitionSpeed: speed as "fast" | "normal" | "smooth",
      },
    });
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Slideshow Option */}
        <div
          className={`relative rounded-xl border-2 overflow-hidden transition-all duration-300 ${
            currentLayoutType === "slideshow"
              ? "border-blue-500 bg-gradient-to-br from-blue-500/20 to-purple-500/10 shadow-lg shadow-blue-500/20"
              : "border-gray-600 bg-gradient-to-br from-gray-700 to-gray-800 hover:border-blue-400 hover:shadow-lg"
          }`}
        >
          <button
            onClick={() => onLayoutChange("slideshow")}
            className="w-full p-6 text-left transition-all duration-300 transform hover:scale-[1.02] focus:outline-none"
          >
            {/* Selected indicator */}
            {currentLayoutType === "slideshow" && (
              <div className="absolute top-3 right-3">
                <CheckCircleIcon className="w-6 h-6 text-blue-400" />
              </div>
            )}

            {/* Icon */}
            <div className="flex items-center mb-4">
              <div
                className={`p-3 rounded-lg mr-4 ${
                  currentLayoutType === "slideshow"
                    ? "bg-blue-500/30"
                    : "bg-gray-600 group-hover:bg-blue-500/20"
                }`}
              >
                <PlayIcon
                  className={`w-6 h-6 ${
                    currentLayoutType === "slideshow"
                      ? "text-blue-300"
                      : "text-gray-300"
                  }`}
                />
              </div>
              <div>
                <h4
                  className={`font-bold text-lg ${
                    currentLayoutType === "slideshow"
                      ? "text-blue-200"
                      : "text-white"
                  }`}
                >
                  {slideshowLayout.name}
                </h4>
                <div className="text-xs text-gray-400 mt-1">
                  Full-screen presentation
                </div>
              </div>
            </div>

            {/* Description */}
            <p
              className={`text-sm leading-relaxed ${
                currentLayoutType === "slideshow"
                  ? "text-blue-100"
                  : "text-gray-300"
              }`}
            >
              {slideshowLayout.description}
            </p>

            {/* Features */}
            <div className="mt-4 space-y-1">
              <div className="flex items-center text-xs text-gray-400">
                <div className="w-1.5 h-1.5 bg-current rounded-full mr-2"></div>
                Auto-advance timing
              </div>
              <div className="flex items-center text-xs text-gray-400">
                <div className="w-1.5 h-1.5 bg-current rounded-full mr-2"></div>
                Fullscreen experience
              </div>
              <div className="flex items-center text-xs text-gray-400">
                <div className="w-1.5 h-1.5 bg-current rounded-full mr-2"></div>
                Smooth transitions
              </div>
            </div>
          </button>

          {/* Slideshow Configuration Panel */}
          {currentLayoutType === "slideshow" && onTimingChange && (
            <div
              className="border-t border-blue-500/30 bg-blue-500/10 p-4 space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-2 mb-3">
                <CogIcon className="w-4 h-4 text-blue-300" />
                <h5 className="font-medium text-blue-200 text-sm">
                  Slideshow Settings
                </h5>
              </div>

              {/* Speed Presets */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-blue-200">
                  Speed Preset
                </label>
                <RadioGroup.Root
                  value={
                    Object.keys(TIMING_PRESETS).find(
                      (key) =>
                        TIMING_PRESETS[key as keyof typeof TIMING_PRESETS]
                          .duration === currentSlideshowDuration
                    ) || "custom"
                  }
                  onValueChange={handleSlideshowPresetChange}
                  className="flex flex-wrap gap-3"
                >
                  {Object.entries(TIMING_PRESETS).map(([key, preset]) => (
                    <div key={key} className="flex items-center space-x-1.5">
                      <RadioGroup.Item
                        value={key}
                        id={`slideshow-${key}`}
                        className="w-4 h-4 rounded-full border border-blue-300 data-[state=checked]:bg-blue-400 data-[state=checked]:border-blue-400 flex items-center justify-center"
                      >
                        <RadioGroup.Indicator className="w-2 h-2 rounded-full bg-white" />
                      </RadioGroup.Item>
                      <label
                        htmlFor={`slideshow-${key}`}
                        className="text-xs font-medium cursor-pointer text-blue-100"
                      >
                        {preset.label}
                      </label>
                    </div>
                  ))}
                </RadioGroup.Root>
              </div>

              {/* Custom Duration Slider */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-blue-200">
                  Duration: {currentSlideshowDuration}s
                </label>
                <Slider.Root
                  value={[currentSlideshowDuration]}
                  onValueChange={handleSlideshowDurationChange}
                  max={20}
                  min={1}
                  step={1}
                  className="relative flex items-center select-none touch-none w-full h-5"
                >
                  <Slider.Track className="bg-blue-200/30 relative grow rounded-full h-1">
                    <Slider.Range className="absolute bg-blue-400 rounded-full h-full" />
                  </Slider.Track>
                  <Slider.Thumb className="block w-4 h-4 bg-white border-2 border-blue-400 rounded-full hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2" />
                </Slider.Root>
              </div>
            </div>
          )}
        </div>

        {/* Grid Option */}
        <div
          className={`relative rounded-xl border-2 overflow-hidden transition-all duration-300 ${
            currentLayoutType === "grid"
              ? "border-purple-500 bg-gradient-to-br from-purple-500/20 to-blue-500/10 shadow-lg shadow-purple-500/20"
              : "border-gray-600 bg-gradient-to-br from-gray-700 to-gray-800 hover:border-purple-400 hover:shadow-lg"
          }`}
        >
          <button
            onClick={() => onLayoutChange("grid")}
            className="w-full p-6 text-left transition-all duration-300 transform hover:scale-[1.02] focus:outline-none"
          >
            {/* Selected indicator */}
            {currentLayoutType === "grid" && (
              <div className="absolute top-3 right-3">
                <CheckCircleIcon className="w-6 h-6 text-purple-400" />
              </div>
            )}

            {/* Icon */}
            <div className="flex items-center mb-4">
              <div
                className={`p-3 rounded-lg mr-4 ${
                  currentLayoutType === "grid"
                    ? "bg-purple-500/30"
                    : "bg-gray-600 group-hover:bg-purple-500/20"
                }`}
              >
                <Squares2X2Icon
                  className={`w-6 h-6 ${
                    currentLayoutType === "grid"
                      ? "text-purple-300"
                      : "text-gray-300"
                  }`}
                />
              </div>
              <div>
                <h4
                  className={`font-bold text-lg ${
                    currentLayoutType === "grid"
                      ? "text-purple-200"
                      : "text-white"
                  }`}
                >
                  {gridLayout.name}
                </h4>
                <div className="text-xs text-gray-400 mt-1">
                  {gridLayout.grid
                    ? `${gridLayout.grid.rows}×${gridLayout.grid.cols} grid`
                    : "Multi-image"}
                </div>
              </div>
            </div>

            {/* Description */}
            <p
              className={`text-sm leading-relaxed ${
                currentLayoutType === "grid"
                  ? "text-purple-100"
                  : "text-gray-300"
              }`}
            >
              {gridLayout.description}
            </p>

            {/* Features */}
            <div className="mt-4 space-y-1">
              <div className="flex items-center text-xs text-gray-400">
                <div className="w-1.5 h-1.5 bg-current rounded-full mr-2"></div>
                Auto-sizing layout
              </div>
              <div className="flex items-center text-xs text-gray-400">
                <div className="w-1.5 h-1.5 bg-current rounded-full mr-2"></div>
                Orientation-aware
              </div>
              <div className="flex items-center text-xs text-gray-400">
                <div className="w-1.5 h-1.5 bg-current rounded-full mr-2"></div>
                Multiple images visible
              </div>
            </div>
          </button>

          {/* Grid Configuration Panel */}
          {currentLayoutType === "grid" && onTimingChange && (
            <div
              className="border-t border-purple-500/30 bg-purple-500/10 p-4 space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-2 mb-3">
                <CogIcon className="w-4 h-4 text-purple-300" />
                <h5 className="font-medium text-purple-200 text-sm">
                  Grid Settings
                </h5>
              </div>

              {/* Auto-advance Toggle */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-purple-200">
                    Auto-advance images
                  </label>
                  <p className="text-xs text-purple-300/70">
                    Automatically cycle through images
                  </p>
                </div>
                <Switch.Root
                  checked={currentAutoAdvance}
                  onCheckedChange={handleAutoAdvanceToggle}
                  className="w-10 h-6 bg-purple-200/30 rounded-full relative data-[state=checked]:bg-purple-400 outline-none cursor-pointer transition-colors"
                >
                  <Switch.Thumb className="block w-5 h-5 bg-white rounded-full transition-transform duration-100 translate-x-0.5 data-[state=checked]:translate-x-[18px]" />
                </Switch.Root>
              </div>

              {/* Auto-advance Configuration */}
              {currentAutoAdvance && (
                <div className="space-y-4 pl-4 border-l-2 border-purple-300/30">
                  {/* Duration Slider */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-purple-200">
                      Auto-advance every: {currentAutoAdvanceDuration}s
                    </label>
                    <Slider.Root
                      value={[currentAutoAdvanceDuration]}
                      onValueChange={handleAutoAdvanceDurationChange}
                      max={30}
                      min={2}
                      step={1}
                      className="relative flex items-center select-none touch-none w-full h-5"
                    >
                      <Slider.Track className="bg-purple-200/30 relative grow rounded-full h-1">
                        <Slider.Range className="absolute bg-purple-400 rounded-full h-full" />
                      </Slider.Track>
                      <Slider.Thumb className="block w-4 h-4 bg-white border-2 border-purple-400 rounded-full hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2" />
                    </Slider.Root>
                  </div>

                  {/* Transition Speed */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-purple-200">
                      Transition Speed
                    </label>
                    <RadioGroup.Root
                      value={currentTransitionSpeed}
                      onValueChange={handleTransitionSpeedChange}
                      className="flex gap-3"
                    >
                      {[
                        { value: "fast", label: "Fast" },
                        { value: "normal", label: "Normal" },
                        { value: "smooth", label: "Smooth" },
                      ].map(({ value, label }) => (
                        <div
                          key={value}
                          className="flex items-center space-x-1.5"
                        >
                          <RadioGroup.Item
                            value={value}
                            id={`grid-speed-${value}`}
                            className="w-4 h-4 rounded-full border border-purple-300 data-[state=checked]:bg-purple-400 data-[state=checked]:border-purple-400 flex items-center justify-center"
                          >
                            <RadioGroup.Indicator className="w-2 h-2 rounded-full bg-white" />
                          </RadioGroup.Item>
                          <label
                            htmlFor={`grid-speed-${value}`}
                            className="text-xs font-medium cursor-pointer text-purple-100"
                          >
                            {label}
                          </label>
                        </div>
                      ))}
                    </RadioGroup.Root>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Helper text */}
      {imageCount === 1 && (
        <div className="text-center p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
          <p className="text-amber-200 text-sm">
            💡 <strong>Tip:</strong> With only 1 image, slideshow mode is
            recommended for the best viewing experience.
          </p>
        </div>
      )}

      {imageCount > 1 && (
        <div className="bg-gray-800/50 rounded-lg p-4 space-y-2">
          <h5 className="font-medium text-gray-300 text-sm">
            Layout Comparison:
          </h5>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="flex items-start space-x-2">
              <PlayIcon className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-blue-300 font-medium">Slideshow</div>
                <div className="text-gray-400">
                  Focus on one image at a time with smooth transitions
                </div>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <Squares2X2Icon className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-purple-300 font-medium">Grid</div>
                <div className="text-gray-400">
                  See multiple images simultaneously for comparison
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
