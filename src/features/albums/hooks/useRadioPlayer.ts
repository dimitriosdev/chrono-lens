/**
 * useRadioPlayer Hook
 *
 * Manages radio stream playback using the HTML5 Audio API.
 * Handles play/pause, volume control, station switching, and connection state.
 *
 * Resilience features:
 * - Auto-retry with exponential backoff on stream errors (up to 5 retries)
 * - Fallback stream URLs per station (tried in order when primary fails)
 * - Automatic reconnection on `stalled`, `ended`, and `error` events
 * - Network change detection: pauses on offline, reconnects on back-online
 * - Connection watchdog: detects stuck loading states and recovers
 * - Manual retry action exposed to the UI
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
  /** Whether auto-retry is in progress */
  isRetrying: boolean;
  /** Current retry attempt number (0 = not retrying) */
  retryAttempt: number;
}

export interface RadioPlayerActions {
  /** Toggle between play and pause */
  togglePlayback: () => void;
  /** Set volume (clamped to 0–1) */
  setVolume: (volume: number) => void;
  /** Switch to a different station by ID */
  switchStation: (stationId: RadioStationId) => void;
  /** Manually retry after an error */
  retry: () => void;
  /** All available stations */
  stations: readonly RadioStation[];
}

export type UseRadioPlayerReturn = RadioPlayerState & RadioPlayerActions;

// ============ CONSTANTS ============

/** Maximum number of automatic retry attempts before giving up */
const MAX_AUTO_RETRIES = 5;

/** Base delay for exponential backoff (ms). Actual delay = BASE * 2^attempt */
const RETRY_BASE_DELAY_MS = 1_000;

/** Maximum backoff delay cap (ms) */
const RETRY_MAX_DELAY_MS = 30_000;

/**
 * How long to wait in "loading" state before considering the connection stuck.
 * If we've been loading for longer than this, the watchdog kicks in.
 */
const LOADING_WATCHDOG_MS = 15_000;

/**
 * How long a "stalled" state must persist before triggering reconnection.
 * Short stalls are normal; only reconnect if stalled for this long.
 */
const STALL_THRESHOLD_MS = 10_000;

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

/**
 * Get all stream URLs for a station in order of preference.
 * Primary URL first, then fallbacks.
 */
function getStreamUrls(station: RadioStation): string[] {
  return [station.streamUrl, ...station.fallbackUrls];
}

/**
 * Calculate retry delay with exponential backoff + jitter.
 * Jitter prevents thundering herd if multiple tabs retry simultaneously.
 */
function getRetryDelay(attempt: number): number {
  const exponential = RETRY_BASE_DELAY_MS * Math.pow(2, attempt);
  const capped = Math.min(exponential, RETRY_MAX_DELAY_MS);
  // Add ±25% jitter
  const jitter = capped * (0.75 + Math.random() * 0.5);
  return Math.round(jitter);
}

/** Attach all event listeners to an Audio element. Returns a cleanup function. */
function bindAudioEvents(
  audio: HTMLAudioElement,
  handlers: {
    onPlaying: () => void;
    onPause: () => void;
    onWaiting: () => void;
    onError: () => void;
    onStalled: () => void;
    onEnded: () => void;
  },
): () => void {
  audio.addEventListener("playing", handlers.onPlaying);
  audio.addEventListener("pause", handlers.onPause);
  audio.addEventListener("waiting", handlers.onWaiting);
  audio.addEventListener("error", handlers.onError);
  audio.addEventListener("stalled", handlers.onStalled);
  audio.addEventListener("ended", handlers.onEnded);

  return () => {
    audio.removeEventListener("playing", handlers.onPlaying);
    audio.removeEventListener("pause", handlers.onPause);
    audio.removeEventListener("waiting", handlers.onWaiting);
    audio.removeEventListener("error", handlers.onError);
    audio.removeEventListener("stalled", handlers.onStalled);
    audio.removeEventListener("ended", handlers.onEnded);
  };
}

/**
 * Start streaming a station on the given Audio element.
 * Appends a cache-busting parameter to avoid stale cached responses.
 */
function startStream(
  audio: HTMLAudioElement,
  streamUrl: string,
): Promise<void> {
  // Cache-bust to avoid stale 302 redirects or cached error responses
  const separator = streamUrl.includes("?") ? "&" : "?";
  const bustUrl = `${streamUrl}${separator}_t=${Date.now()}`;

  audio.src = bustUrl;
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
 * Includes auto-retry, fallback URLs, stall detection, and network recovery.
 *
 * @returns Combined state and actions for controlling radio playback
 */
export function useRadioPlayer(): UseRadioPlayerReturn {
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const [status, setStatus] = React.useState<RadioPlaybackStatus>("idle");
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [volume, setVolumeState] = React.useState<number>(loadSavedVolume);
  const [station, setStation] = React.useState<RadioStation>(loadSavedStation);
  const [retryAttempt, setRetryAttempt] = React.useState(0);
  const [isRetrying, setIsRetrying] = React.useState(false);

  // Track whether we should auto-play after a station switch
  const pendingPlayRef = React.useRef(false);
  // Track whether user has explicitly paused (don't auto-reconnect if so)
  const userPausedRef = React.useRef(false);
  // Retry timer ref for cleanup
  const retryTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  // Stall timer ref for cleanup
  const stallTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  // Loading watchdog timer ref
  const loadingWatchdogRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  // Current URL index being tried (for fallback rotation)
  const urlIndexRef = React.useRef(0);
  // Track if we intended to play (for reconnection logic)
  const wantPlayingRef = React.useRef(false);

  /** Clear all pending timers */
  const clearAllTimers = React.useCallback(() => {
    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }
    if (stallTimerRef.current) {
      clearTimeout(stallTimerRef.current);
      stallTimerRef.current = null;
    }
    if (loadingWatchdogRef.current) {
      clearTimeout(loadingWatchdogRef.current);
      loadingWatchdogRef.current = null;
    }
  }, []);

  /**
   * Core play function with fallback URL support.
   * Tries URLs in order; on failure advances to next URL or triggers retry.
   */
  const playWithFallback = React.useCallback(
    (stationToPlay: RadioStation, urlIdx: number = 0) => {
      const audio = audioRef.current;
      if (!audio) return;

      const urls = getStreamUrls(stationToPlay);
      const url = urls[urlIdx % urls.length];

      urlIndexRef.current = urlIdx;
      wantPlayingRef.current = true;
      userPausedRef.current = false;
      setErrorMessage(null);
      setStatus("loading");

      // Start loading watchdog
      if (loadingWatchdogRef.current) clearTimeout(loadingWatchdogRef.current);
      loadingWatchdogRef.current = setTimeout(() => {
        // If still loading after threshold, force reconnect
        if (wantPlayingRef.current && audio.readyState < 3) {
          console.warn(
            "[RadioPlayer] Loading watchdog triggered — reconnecting",
          );
          stopStream(audio);
          const nextIdx = (urlIdx + 1) % urls.length;
          playWithFallback(stationToPlay, nextIdx);
        }
      }, LOADING_WATCHDOG_MS);

      startStream(audio, url).catch((err) => {
        // If this URL failed, try the next fallback
        const nextIdx = urlIdx + 1;
        if (nextIdx < urls.length) {
          console.warn(
            `[RadioPlayer] URL ${urlIdx} failed, trying fallback ${nextIdx}:`,
            err,
          );
          playWithFallback(stationToPlay, nextIdx);
        } else {
          // All URLs exhausted for this attempt — schedule retry
          console.warn("[RadioPlayer] All URLs failed:", err);
          scheduleRetry(stationToPlay);
        }
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  /** Schedule an automatic retry with exponential backoff */
  const scheduleRetry = React.useCallback(
    (stationToRetry: RadioStation) => {
      const audio = audioRef.current;
      if (audio) stopStream(audio);

      setRetryAttempt((prev) => {
        const attempt = prev + 1;
        if (attempt > MAX_AUTO_RETRIES) {
          // Give up — let user manually retry
          setStatus("error");
          setErrorMessage(
            "Unable to connect after multiple attempts. Tap to retry.",
          );
          setIsRetrying(false);
          return 0;
        }

        const delay = getRetryDelay(attempt - 1);
        console.info(
          `[RadioPlayer] Retry ${attempt}/${MAX_AUTO_RETRIES} in ${delay}ms`,
        );
        setStatus("loading");
        setErrorMessage(`Reconnecting (attempt ${attempt})...`);
        setIsRetrying(true);

        retryTimerRef.current = setTimeout(() => {
          retryTimerRef.current = null;
          urlIndexRef.current = 0;
          playWithFallback(stationToRetry, 0);
        }, delay);

        return attempt;
      });
    },
    [playWithFallback],
  );

  // Initialize Audio element and bind event listeners
  React.useEffect(() => {
    const audio = new Audio();
    audio.preload = "none";
    audioRef.current = audio;

    const unbind = bindAudioEvents(audio, {
      onPlaying: () => {
        // Successfully playing — clear all recovery state
        setStatus("playing");
        setRetryAttempt(0);
        setIsRetrying(false);
        setErrorMessage(null);
        if (loadingWatchdogRef.current) {
          clearTimeout(loadingWatchdogRef.current);
          loadingWatchdogRef.current = null;
        }
        if (stallTimerRef.current) {
          clearTimeout(stallTimerRef.current);
          stallTimerRef.current = null;
        }
      },

      onPause: () => {
        // Only set paused if the user explicitly paused (not a transient browser pause)
        if (userPausedRef.current) {
          setStatus("paused");
        }
      },

      onWaiting: () => {
        setStatus("loading");
      },

      onError: () => {
        if (!wantPlayingRef.current) return; // Ignore errors when we're not trying to play

        console.warn("[RadioPlayer] Audio error event");
        // Don't immediately show error — schedule retry
        const currentStation =
          RADIO_STATIONS.find(
            (s) => s.id === audioRef.current?.dataset?.stationId,
          ) ?? DEFAULT_RADIO_STATION;
        scheduleRetry(currentStation);
      },

      onStalled: () => {
        if (!wantPlayingRef.current || userPausedRef.current) return;

        // Start a stall timer — only reconnect if stall persists
        if (stallTimerRef.current) clearTimeout(stallTimerRef.current);
        stallTimerRef.current = setTimeout(() => {
          stallTimerRef.current = null;
          if (!wantPlayingRef.current || userPausedRef.current) return;

          console.warn(
            "[RadioPlayer] Persistent stall detected — reconnecting",
          );
          const currentStation =
            RADIO_STATIONS.find(
              (s) => s.id === audioRef.current?.dataset?.stationId,
            ) ?? DEFAULT_RADIO_STATION;
          stopStream(audio);
          playWithFallback(currentStation, 0);
        }, STALL_THRESHOLD_MS);
      },

      onEnded: () => {
        // Live streams shouldn't end. If they do, reconnect.
        if (!wantPlayingRef.current || userPausedRef.current) return;

        console.warn("[RadioPlayer] Stream ended unexpectedly — reconnecting");
        const currentStation =
          RADIO_STATIONS.find(
            (s) => s.id === audioRef.current?.dataset?.stationId,
          ) ?? DEFAULT_RADIO_STATION;
        stopStream(audio);
        playWithFallback(currentStation, 0);
      },
    });

    return () => {
      unbind();
      stopStream(audio);
      audioRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Store station ID on audio element for event handler access
  React.useEffect(() => {
    if (audioRef.current) {
      audioRef.current.dataset.stationId = station.id;
    }
  }, [station]);

  // Network change detection: reconnect when coming back online
  React.useEffect(() => {
    const handleOnline = () => {
      if (wantPlayingRef.current && !userPausedRef.current) {
        console.info("[RadioPlayer] Network back online — reconnecting");
        clearAllTimers();
        setRetryAttempt(0);
        playWithFallback(station, 0);
      }
    };

    const handleOffline = () => {
      if (wantPlayingRef.current) {
        console.info(
          "[RadioPlayer] Network offline — will reconnect when back",
        );
        setStatus("loading");
        setErrorMessage("Waiting for network...");
      }
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [station, clearAllTimers, playWithFallback]);

  // Sync volume to Audio element and persist
  React.useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
    persistVolume(volume);
  }, [volume]);

  // Clean up timers on unmount
  React.useEffect(() => {
    return () => clearAllTimers();
  }, [clearAllTimers]);

  // Handle deferred playback after station switch
  React.useEffect(() => {
    if (!pendingPlayRef.current) return;
    pendingPlayRef.current = false;

    clearAllTimers();
    setRetryAttempt(0);
    urlIndexRef.current = 0;
    playWithFallback(station, 0);
  }, [station, clearAllTimers, playWithFallback]);

  const play = React.useCallback(() => {
    clearAllTimers();
    setRetryAttempt(0);
    urlIndexRef.current = 0;
    playWithFallback(station, 0);
  }, [station, clearAllTimers, playWithFallback]);

  const pause = React.useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    wantPlayingRef.current = false;
    userPausedRef.current = true;
    clearAllTimers();
    setRetryAttempt(0);
    setIsRetrying(false);
    stopStream(audio);
    setStatus("paused");
    setErrorMessage(null);
  }, [clearAllTimers]);

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

  const retry = React.useCallback(() => {
    clearAllTimers();
    setRetryAttempt(0);
    setIsRetrying(false);
    urlIndexRef.current = 0;
    playWithFallback(station, 0);
  }, [station, clearAllTimers, playWithFallback]);

  const switchStation = React.useCallback(
    (stationId: RadioStationId) => {
      const newStation = RADIO_STATIONS.find((s) => s.id === stationId);
      if (!newStation || newStation.id === station.id) return;

      const wasPlaying = status === "playing" || status === "loading";

      // Stop current stream immediately
      if (audioRef.current) {
        stopStream(audioRef.current);
      }

      clearAllTimers();
      setRetryAttempt(0);
      setIsRetrying(false);
      setErrorMessage(null);
      urlIndexRef.current = 0;

      // Schedule playback for after state update (via useEffect)
      pendingPlayRef.current = wasPlaying;

      setStation(newStation);
      persistStation(newStation.id);

      if (!wasPlaying) {
        setStatus("idle");
      }
    },
    [station.id, status, clearAllTimers],
  );

  return {
    status,
    station,
    volume,
    isPlaying: status === "playing",
    errorMessage,
    isRetrying,
    retryAttempt,
    togglePlayback,
    setVolume,
    switchStation,
    retry,
    stations: RADIO_STATIONS,
  };
}
