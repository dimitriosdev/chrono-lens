/**
 * useRadioPlayer Hook
 *
 * Manages radio stream playback using the HTML5 Audio API.
 * Handles play/pause, volume control, station switching, and connection state.
 *
 * IMPORTANT: Do NOT set `crossOrigin` on the Audio element — SRG SSR streams
 * redirect HTTPS → HTTP, and browsers block cross-origin access without proper
 * CORS headers. Since we don't use AudioContext/analyser, it's not needed.
 */

import React from "react";
import {
  RadioStation,
  RadioStationId,
  RADIO_STATIONS,
  DEFAULT_RADIO_STATION,
} from "@/features/albums/constants/RadioStations";

// ============ TYPES ============

/** Playback lifecycle states */
export type RadioPlaybackStatus =
  | "idle"
  | "loading"
  | "playing"
  | "paused"
  | "error";

export interface RadioPlayerState {
  /** Current playback lifecycle status */
  status: RadioPlaybackStatus;
  /** Currently selected station */
  station: RadioStation;
  /** Volume level (0–1) */
  volume: number;
  /** Convenience flag: true when status is 'playing' */
  isPlaying: boolean;
  /** Error description when status is 'error', null otherwise */
  errorMessage: string | null;
}

export interface RadioPlayerActions {
  /** Toggle between play and pause */
  togglePlayback: () => void;
  /** Set volume (clamped to 0–1) */
  setVolume: (volume: number) => void;
  /** Switch to a different station by ID */
  switchStation: (stationId: RadioStationId) => void;
  /** All available stations */
  stations: readonly RadioStation[];
}

export type UseRadioPlayerReturn = RadioPlayerState & RadioPlayerActions;

// ============ STORAGE HELPERS ============

const STORAGE_KEYS = {
  volume: "chrono-lens-radio-volume",
  station: "chrono-lens-radio-station",
} as const;

function loadSavedVolume(): number {
  if (typeof window === "undefined") return 0.5;
  const saved = localStorage.getItem(STORAGE_KEYS.volume);
  return saved ? parseFloat(saved) : 0.5;
}

function loadSavedStation(): RadioStation {
  if (typeof window === "undefined") return DEFAULT_RADIO_STATION;
  const savedId = localStorage.getItem(STORAGE_KEYS.station);
  if (savedId) {
    const found = RADIO_STATIONS.find((s) => s.id === savedId);
    if (found) return found;
  }
  return DEFAULT_RADIO_STATION;
}

function persistVolume(volume: number): void {
  localStorage.setItem(STORAGE_KEYS.volume, volume.toString());
}

function persistStation(stationId: RadioStationId): void {
  localStorage.setItem(STORAGE_KEYS.station, stationId);
}

// ============ AUDIO HELPERS ============

/** Attach all event listeners to an Audio element. Returns a cleanup function. */
function bindAudioEvents(
  audio: HTMLAudioElement,
  handlers: {
    onPlaying: () => void;
    onPause: () => void;
    onWaiting: () => void;
    onError: () => void;
  },
): () => void {
  audio.addEventListener("playing", handlers.onPlaying);
  audio.addEventListener("pause", handlers.onPause);
  audio.addEventListener("waiting", handlers.onWaiting);
  audio.addEventListener("error", handlers.onError);

  return () => {
    audio.removeEventListener("playing", handlers.onPlaying);
    audio.removeEventListener("pause", handlers.onPause);
    audio.removeEventListener("waiting", handlers.onWaiting);
    audio.removeEventListener("error", handlers.onError);
  };
}

/** Start streaming a station on the given Audio element */
function startStream(
  audio: HTMLAudioElement,
  streamUrl: string,
): Promise<void> {
  audio.src = streamUrl;
  audio.load();
  return audio.play();
}

/**
 * Stop streaming and reset the media element.
 *
 * IMPORTANT: Do NOT set `audio.src = ""` — the browser treats an empty string
 * as a relative URL, tries to load it, and fires an error event that corrupts
 * the element's state. Use `removeAttribute('src')` + `load()` instead (per MDN).
 */
function stopStream(audio: HTMLAudioElement): void {
  audio.pause();
  audio.removeAttribute("src");
  audio.load();
}

// ============ HOOK ============

/**
 * Manages radio stream playback state for slideshow background music.
 *
 * @returns Combined state and actions for controlling radio playback
 */
export function useRadioPlayer(): UseRadioPlayerReturn {
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const [status, setStatus] = React.useState<RadioPlaybackStatus>("idle");
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [volume, setVolumeState] = React.useState<number>(loadSavedVolume);
  const [station, setStation] = React.useState<RadioStation>(loadSavedStation);

  // Track whether we should auto-play after a station switch
  const pendingPlayRef = React.useRef(false);

  // Initialize Audio element and bind event listeners
  React.useEffect(() => {
    const audio = new Audio();
    audio.preload = "none";
    audioRef.current = audio;

    const unbind = bindAudioEvents(audio, {
      onPlaying: () => setStatus("playing"),
      onPause: () => setStatus("paused"),
      onWaiting: () => setStatus("loading"),
      onError: () => {
        setStatus("error");
        setErrorMessage("Unable to connect to radio stream");
      },
    });

    return () => {
      unbind();
      stopStream(audio);
      audioRef.current = null;
    };
  }, []);

  // Sync volume to Audio element and persist
  React.useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
    persistVolume(volume);
  }, [volume]);

  // Handle deferred playback after station switch
  React.useEffect(() => {
    if (!pendingPlayRef.current) return;
    pendingPlayRef.current = false;

    const audio = audioRef.current;
    if (!audio) return;

    setStatus("loading");
    startStream(audio, station.streamUrl).catch(() => {
      setStatus("error");
      setErrorMessage("Failed to play station");
    });
  }, [station]);

  const play = React.useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    setErrorMessage(null);
    setStatus("loading");
    startStream(audio, station.streamUrl).catch((err) => {
      console.warn("Radio playback failed:", err);
      setStatus("error");
      setErrorMessage("Playback failed. Try again.");
    });
  }, [station]);

  const pause = React.useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    stopStream(audio);
    setStatus("paused");
  }, []);

  const togglePlayback = React.useCallback(() => {
    if (status === "playing" || status === "loading") {
      pause();
    } else {
      play();
    }
  }, [status, play, pause]);

  const setVolume = React.useCallback((newVolume: number) => {
    setVolumeState(Math.max(0, Math.min(1, newVolume)));
  }, []);

  const switchStation = React.useCallback(
    (stationId: RadioStationId) => {
      const newStation = RADIO_STATIONS.find((s) => s.id === stationId);
      if (!newStation || newStation.id === station.id) return;

      const wasPlaying = status === "playing" || status === "loading";

      // Stop current stream immediately
      if (audioRef.current) {
        stopStream(audioRef.current);
      }

      // Schedule playback for after state update (via useEffect)
      pendingPlayRef.current = wasPlaying;

      setStation(newStation);
      persistStation(newStation.id);

      if (!wasPlaying) {
        setStatus("idle");
      }
    },
    [station.id, status],
  );

  return {
    status,
    station,
    volume,
    isPlaying: status === "playing",
    errorMessage,
    togglePlayback,
    setVolume,
    switchStation,
    stations: RADIO_STATIONS,
  };
}
