"use client";

import React from "react";
import * as Switch from "@radix-ui/react-switch";
import * as RadioGroup from "@radix-ui/react-radio-group";
import * as Slider from "@radix-ui/react-slider";
import { FormSection } from "../FormComponents";
import type { AlbumLayout } from "@/types/layout";

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

interface AlbumTimingSectionProps {
  layout: AlbumLayout;
  timing: TimingConfig;
  onTimingChange: (timing: TimingConfig) => void;
}

const TIMING_PRESETS = {
  fast: { duration: 3, label: "Fast (3s)", speed: "fast" as const },
  normal: { duration: 5, label: "Normal (5s)", speed: "normal" as const },
  smooth: { duration: 8, label: "Smooth (8s)", speed: "smooth" as const },
  custom: { duration: 5, label: "Custom", speed: "normal" as const },
};

export const AlbumTimingSection: React.FC<AlbumTimingSectionProps> = ({
  layout,
  timing,
  onTimingChange,
}) => {
  const isSlideshow = layout.type === "slideshow";
  const isInteractive =
    ["grid", "custom"].includes(layout.type) &&
    !["portrait", "landscape"].includes(layout.name);

  // Get current values with defaults
  const currentSlideshowDuration = timing.slideshow?.cycleDuration ?? 5;
  const currentAutoAdvance = timing.interactive?.autoAdvance ?? false;
  const currentAutoAdvanceDuration =
    timing.interactive?.autoAdvanceDuration ?? 5;
  const currentTransitionSpeed =
    timing.interactive?.transitionSpeed ?? "normal";

  // Determine if using custom timing
  const isCustomSlideshow = !Object.values(TIMING_PRESETS).some(
    (preset) =>
      preset.duration === currentSlideshowDuration && preset.speed === "normal"
  );
  const isCustomInteractive = !Object.values(TIMING_PRESETS).some(
    (preset) =>
      preset.duration === currentAutoAdvanceDuration &&
      preset.speed === currentTransitionSpeed
  );

  const handleSlideshowPresetChange = (presetKey: string) => {
    if (presetKey === "custom") return;

    const preset = TIMING_PRESETS[presetKey as keyof typeof TIMING_PRESETS];
    onTimingChange({
      ...timing,
      slideshow: {
        cycleDuration: preset.duration,
      },
    });
  };

  const handleInteractivePresetChange = (presetKey: string) => {
    if (presetKey === "custom") return;

    const preset = TIMING_PRESETS[presetKey as keyof typeof TIMING_PRESETS];
    onTimingChange({
      ...timing,
      interactive: {
        ...timing.interactive,
        autoAdvance: true,
        autoAdvanceDuration: preset.duration,
        transitionSpeed: preset.speed,
      },
    });
  };

  const handleSlideshowDurationChange = (value: number[]) => {
    onTimingChange({
      ...timing,
      slideshow: {
        cycleDuration: value[0],
      },
    });
  };

  const handleAutoAdvanceToggle = (checked: boolean) => {
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

  if (!isSlideshow && !isInteractive) {
    return null; // No timing config for portrait/landscape layouts
  }

  return (
    <FormSection
      title="Timing Configuration"
      description={
        isSlideshow
          ? "Configure how long each slide is displayed"
          : "Configure automatic advancement and transition timing"
      }
    >
      <div className="space-y-6 mt-4">
        {isSlideshow && (
          <div className="space-y-4">
            <h4 className="font-medium text-sm">Slideshow Speed</h4>

            {/* Slideshow Presets */}
            <RadioGroup.Root
              value={
                isCustomSlideshow
                  ? "custom"
                  : Object.keys(TIMING_PRESETS).find(
                      (key) =>
                        TIMING_PRESETS[key as keyof typeof TIMING_PRESETS]
                          .duration === currentSlideshowDuration
                    ) || "normal"
              }
              onValueChange={handleSlideshowPresetChange}
              className="flex flex-wrap gap-4"
            >
              {Object.entries(TIMING_PRESETS)
                .filter(([key]) => key !== "custom")
                .map(([key, preset]) => (
                  <div key={key} className="flex items-center space-x-2">
                    <RadioGroup.Item
                      value={key}
                      id={`slideshow-${key}`}
                      className="w-4 h-4 rounded-full border border-gray-300 data-[state=checked]:border-blue-500 data-[state=checked]:bg-blue-500"
                    >
                      <RadioGroup.Indicator className="flex items-center justify-center w-full h-full relative after:content-[''] after:w-2 after:h-2 after:rounded-full after:bg-white" />
                    </RadioGroup.Item>
                    <label
                      htmlFor={`slideshow-${key}`}
                      className="text-sm font-medium cursor-pointer"
                    >
                      {preset.label}
                    </label>
                  </div>
                ))}
              <div className="flex items-center space-x-2">
                <RadioGroup.Item
                  value="custom"
                  id="slideshow-custom"
                  className="w-4 h-4 rounded-full border border-gray-300 data-[state=checked]:border-blue-500 data-[state=checked]:bg-blue-500"
                >
                  <RadioGroup.Indicator className="flex items-center justify-center w-full h-full relative after:content-[''] after:w-2 after:h-2 after:rounded-full after:bg-white" />
                </RadioGroup.Item>
                <label
                  htmlFor="slideshow-custom"
                  className="text-sm font-medium cursor-pointer"
                >
                  Custom
                </label>
              </div>
            </RadioGroup.Root>

            {/* Custom Slideshow Duration Slider */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
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
                <Slider.Track className="bg-gray-200 relative grow rounded-full h-1">
                  <Slider.Range className="absolute bg-blue-500 rounded-full h-full" />
                </Slider.Track>
                <Slider.Thumb className="block w-5 h-5 bg-white border-2 border-blue-500 rounded-full hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" />
              </Slider.Root>
            </div>
          </div>
        )}

        {isInteractive && (
          <div className="space-y-4">
            <h4 className="font-medium text-sm">Interactive Layout</h4>

            {/* Auto-advance Toggle */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <label className="text-sm font-medium">
                  Auto-advance images
                </label>
                <p className="text-xs text-gray-500">
                  Automatically cycle through images
                </p>
              </div>
              <Switch.Root
                checked={currentAutoAdvance}
                onCheckedChange={handleAutoAdvanceToggle}
                className="w-11 h-6 bg-gray-200 rounded-full relative data-[state=checked]:bg-blue-500 transition-colors duration-200 ease-in-out"
              >
                <Switch.Thumb className="block w-5 h-5 bg-white rounded-full transition-transform duration-100 ease-in-out data-[state=checked]:translate-x-5 translate-x-0" />
              </Switch.Root>
            </div>

            {/* Auto-advance Configuration */}
            {currentAutoAdvance && (
              <div className="space-y-4 pl-4 border-l-2 border-gray-100">
                {/* Interactive Presets */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Speed Preset</label>
                  <RadioGroup.Root
                    value={
                      isCustomInteractive
                        ? "custom"
                        : Object.keys(TIMING_PRESETS).find((key) => {
                            const preset =
                              TIMING_PRESETS[
                                key as keyof typeof TIMING_PRESETS
                              ];
                            return (
                              preset.duration === currentAutoAdvanceDuration &&
                              preset.speed === currentTransitionSpeed
                            );
                          }) || "normal"
                    }
                    onValueChange={handleInteractivePresetChange}
                    className="flex flex-wrap gap-4"
                  >
                    {Object.entries(TIMING_PRESETS)
                      .filter(([key]) => key !== "custom")
                      .map(([key, preset]) => (
                        <div key={key} className="flex items-center space-x-2">
                          <RadioGroup.Item
                            value={key}
                            id={`interactive-${key}`}
                            className="w-4 h-4 rounded-full border border-gray-300 data-[state=checked]:border-blue-500 data-[state=checked]:bg-blue-500"
                          >
                            <RadioGroup.Indicator className="flex items-center justify-center w-full h-full relative after:content-[''] after:w-2 after:h-2 after:rounded-full after:bg-white" />
                          </RadioGroup.Item>
                          <label
                            htmlFor={`interactive-${key}`}
                            className="text-sm font-medium cursor-pointer"
                          >
                            {preset.label}
                          </label>
                        </div>
                      ))}
                    <div className="flex items-center space-x-2">
                      <RadioGroup.Item
                        value="custom"
                        id="interactive-custom"
                        className="w-4 h-4 rounded-full border border-gray-300 data-[state=checked]:border-blue-500 data-[state=checked]:bg-blue-500"
                      >
                        <RadioGroup.Indicator className="flex items-center justify-center w-full h-full relative after:content-[''] after:w-2 after:h-2 after:rounded-full after:bg-white" />
                      </RadioGroup.Item>
                      <label
                        htmlFor="interactive-custom"
                        className="text-sm font-medium cursor-pointer"
                      >
                        Custom
                      </label>
                    </div>
                  </RadioGroup.Root>
                </div>

                {/* Custom Duration Slider */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
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
                    <Slider.Track className="bg-gray-200 relative grow rounded-full h-1">
                      <Slider.Range className="absolute bg-blue-500 rounded-full h-full" />
                    </Slider.Track>
                    <Slider.Thumb className="block w-5 h-5 bg-white border-2 border-blue-500 rounded-full hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" />
                  </Slider.Root>
                </div>

                {/* Transition Speed */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Transition Speed
                  </label>
                  <RadioGroup.Root
                    value={currentTransitionSpeed}
                    onValueChange={handleTransitionSpeedChange}
                    className="flex gap-4"
                  >
                    {[
                      { value: "fast", label: "Fast" },
                      { value: "normal", label: "Normal" },
                      { value: "smooth", label: "Smooth" },
                    ].map(({ value, label }) => (
                      <div key={value} className="flex items-center space-x-2">
                        <RadioGroup.Item
                          value={value}
                          id={`speed-${value}`}
                          className="w-4 h-4 rounded-full border border-gray-300 data-[state=checked]:border-blue-500 data-[state=checked]:bg-blue-500"
                        >
                          <RadioGroup.Indicator className="flex items-center justify-center w-full h-full relative after:content-[''] after:w-2 after:h-2 after:rounded-full after:bg-white" />
                        </RadioGroup.Item>
                        <label
                          htmlFor={`speed-${value}`}
                          className="text-sm font-medium cursor-pointer"
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
    </FormSection>
  );
};
