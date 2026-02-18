/**
 * RadioPlayer Component
 *
 * Minimal floating overlay for background music during album slideshows.
 * Auto-hides after inactivity; reappears on hover/focus. Expands inline
 * to show volume and station controls.
 *
 * Sub-components (EqualizerBars, VolumeControl, StationSelector) are
 * co-located here since they're only used by RadioPlayer.
 */

"use client";

import React from "react";
import {
  MusicalNoteIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  SignalIcon,
  ChevronUpIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/solid";
import { PlayIcon, PauseIcon } from "@heroicons/react/24/solid";
import { UseRadioPlayerReturn } from "@/features/albums/hooks/useRadioPlayer";
import {
  RadioStation,
  RadioStationId,
} from "@/features/albums/constants/RadioStations";
import { useAutoHide } from "@/features/albums/hooks/useAutoHide";

// ============ STYLE CONSTANTS ============

const INTERACTIVE_BASE =
  "text-white transition-all duration-300 focus:outline-none";
const PANEL_SURFACE =
  "bg-black/30 backdrop-blur-sm rounded-xl shadow-[0_0_12px_rgba(0,0,0,0.3)]";

// ============ SUB-COMPONENTS ============

/** Animated equalizer bars indicating active playback */
const EqualizerBars = React.memo<{ isPlaying: boolean }>(({ isPlaying }) => (
  <div className="flex items-end gap-[2px] h-3 w-3" aria-hidden="true">
    {[0, 1, 2].map((i) => (
      <div
        key={i}
        className={`w-[3px] bg-green-400 rounded-full transition-all ${
          isPlaying ? "animate-equalizer" : "h-1"
        }`}
        style={
          isPlaying
            ? {
                animationDelay: `${i * 0.15}s`,
                animationDuration: `${0.4 + i * 0.1}s`,
              }
            : undefined
        }
      />
    ))}
  </div>
));
EqualizerBars.displayName = "EqualizerBars";

/** Volume slider with mute toggle */
interface VolumeControlProps {
  volume: number;
  onVolumeChange: (volume: number) => void;
}

const VolumeControl = React.memo<VolumeControlProps>(
  ({ volume, onVolumeChange }) => {
    const isMuted = volume === 0;

    return (
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onVolumeChange(isMuted ? 0.5 : 0)}
          className={`${INTERACTIVE_BASE} opacity-60 hover:opacity-100`}
          aria-label={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? (
            <SpeakerXMarkIcon className="w-3.5 h-3.5" />
          ) : (
            <SpeakerWaveIcon className="w-3.5 h-3.5" />
          )}
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={volume}
          onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
          className="w-14 h-1 appearance-none bg-white/20 rounded-full cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5
            [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:cursor-pointer
            [&::-moz-range-thumb]:w-2.5 [&::-moz-range-thumb]:h-2.5 [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
          aria-label="Volume"
        />
      </div>
    );
  },
);
VolumeControl.displayName = "VolumeControl";

/** Dropdown for switching between radio stations */
interface StationSelectorProps {
  stations: readonly RadioStation[];
  currentStationId: RadioStationId;
  onSwitch: (stationId: RadioStationId) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const StationSelector = React.memo<StationSelectorProps>(
  ({ stations, currentStationId, onSwitch, isOpen, onToggle }) => {
    if (stations.length <= 1) return null;

    return (
      <div className="relative">
        <button
          type="button"
          onClick={onToggle}
          className={`${INTERACTIVE_BASE} flex items-center gap-1 text-[10px] opacity-60 hover:opacity-100`}
          aria-label="Select station"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        >
          <SignalIcon className="w-3 h-3" />
          {isOpen ? (
            <ChevronDownIcon className="w-2.5 h-2.5" />
          ) : (
            <ChevronUpIcon className="w-2.5 h-2.5" />
          )}
        </button>

        {isOpen && (
          <div
            className="absolute bottom-full mb-2 right-0 min-w-[160px] bg-black/80 backdrop-blur-md rounded-lg shadow-xl border border-white/10 overflow-hidden z-50"
            role="listbox"
            aria-label="Radio stations"
          >
            {stations.map((s) => (
              <button
                key={s.id}
                type="button"
                role="option"
                aria-selected={s.id === currentStationId}
                onClick={() => {
                  onSwitch(s.id);
                  onToggle();
                }}
                className={`w-full text-left px-3 py-2 text-xs transition-colors ${
                  s.id === currentStationId
                    ? "bg-blue-600/40 text-white"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <div className="font-medium">{s.name}</div>
                <div className="text-[10px] opacity-60">{s.genre}</div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  },
);
StationSelector.displayName = "StationSelector";

// ============ STATUS LABEL ============

/** Derive the display label from current playback state */
function getStatusLabel(radio: UseRadioPlayerReturn): string {
  switch (radio.status) {
    case "loading":
      return "Connecting...";
    case "error":
      return radio.errorMessage ?? "Error";
    default:
      return radio.station.name;
  }
}

// ============ MAIN COMPONENT ============

export interface RadioPlayerProps {
  radio: UseRadioPlayerReturn;
}

/**
 * Floating radio player overlay for album slideshows.
 *
 * - Positioned at bottom-right as a minimal overlay
 * - Auto-minimizes after 3 s of inactivity
 * - When minimized + playing → shows only equalizer bars
 * - When minimized + idle → hidden completely
 * - On hover/focus → reveals full controls
 * - Expand button reveals volume + station picker inline
 */
const RadioPlayer: React.FC<RadioPlayerProps> = ({ radio }) => {
  const [expanded, setExpanded] = React.useState(false);
  const [stationPickerOpen, setStationPickerOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const isActive = radio.isPlaying || radio.status === "loading";

  // Auto-hide behavior — collapses expanded panel after inactivity
  const { isMinimized, handleMouseEnter, handleMouseLeave } = useAutoHide();

  // When auto-hide triggers, collapse expanded panel too
  React.useEffect(() => {
    if (isMinimized) {
      setExpanded(false);
      setStationPickerOpen(false);
    }
  }, [isMinimized]);

  // Close expanded panel on outside click
  React.useEffect(() => {
    if (!expanded) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setExpanded(false);
        setStationPickerOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [expanded]);

  // Visibility states
  const showMinimalIndicator = isMinimized && isActive;

  const handleMainButtonClick = React.useCallback(() => {
    if (!expanded) {
      setExpanded(true);
    } else {
      radio.togglePlayback();
    }
  }, [expanded, radio]);

  const handleStationPickerToggle = React.useCallback(() => {
    setStationPickerOpen((prev) => !prev);
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute bottom-3 right-3 z-50 flex items-end gap-1.5 transition-opacity duration-500 opacity-100"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role="region"
      aria-label="Radio player"
    >
      {/* Minimized indicator: equalizer when playing, music note when idle */}
      {isMinimized && !expanded && (
        <button
          type="button"
          className={`${PANEL_SURFACE} p-2 cursor-pointer border-none ${INTERACTIVE_BASE} opacity-40 hover:opacity-90 flex items-center justify-center`}
          onClick={() => setExpanded(true)}
          aria-label="Show radio controls"
        >
          {isActive ? (
            <EqualizerBars isPlaying={radio.isPlaying} />
          ) : (
            <MusicalNoteIcon className="w-4 h-4" />
          )}
        </button>
      )}

      {/* Full controls (hidden when minimized) */}
      {!isMinimized && (
        <>
          {/* Expanded controls panel */}
          {expanded && (
            <div
              className={`${PANEL_SURFACE} px-3 py-2 flex items-center gap-3`}
            >
              {/* Station info */}
              <div className="flex items-center gap-1.5 min-w-0">
                <EqualizerBars isPlaying={radio.isPlaying} />
                <span className="text-white/80 text-[11px] font-medium truncate max-w-[100px]">
                  {getStatusLabel(radio)}
                </span>
              </div>

              {/* Volume */}
              <VolumeControl
                volume={radio.volume}
                onVolumeChange={radio.setVolume}
              />

              {/* Station selector */}
              <StationSelector
                stations={radio.stations}
                currentStationId={radio.station.id}
                onSwitch={radio.switchStation}
                isOpen={stationPickerOpen}
                onToggle={handleStationPickerToggle}
              />
            </div>
          )}

          {/* Main action button */}
          <button
            type="button"
            onClick={handleMainButtonClick}
            className={`${PANEL_SURFACE} p-2.5 ${INTERACTIVE_BASE} opacity-40 hover:opacity-90 flex items-center justify-center`}
            aria-label={
              !expanded
                ? "Open radio"
                : radio.isPlaying
                  ? "Pause radio"
                  : "Play radio"
            }
          >
            {radio.status === "loading" ? (
              <div
                className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"
                aria-label="Loading"
              />
            ) : isActive ? (
              <PauseIcon className="w-5 h-5 text-green-400 opacity-100" />
            ) : (
              <div className="relative">
                <MusicalNoteIcon className="w-5 h-5" />
                {!expanded && (
                  <PlayIcon className="w-2.5 h-2.5 absolute -bottom-0.5 -right-0.5 text-green-400" />
                )}
              </div>
            )}
          </button>
        </>
      )}
    </div>
  );
};

export default RadioPlayer;
