/**
 * useRadioPlayer Hook
 *
 * Manages radio stream playback using the HTML5 Audio API.
 * Handles play/pause, volume control, station switching, and connection state.
 *
 * Playback strategy (three layers):
 *   1. Audio API — programmatic control via a DOM-attached <audio> element
 *   2. Native fallback — browser-native <audio controls> (user clicks browser play)
 *   3. Embed fallback — TuneIn iframe embed (fully external player)
 *
 * Resilience features:
 * - Auto-retry with exponential backoff on stream errors (up to 3 retries)
 * - Fallback stream URLs per station (tried in order when primary fails)
 * - Automatic reconnection on `stalled`, `ended`, and `error` events
 * - Network change detection: pauses on offline, reconnects on back-online
 * - Connection watchdog: detects stuck loading states and recovers
 * - Native/embed fallback modes when Audio API fails completely
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

/**
 * Which playback engine is active:
 * - `audio-api`: Custom player using Audio API (default)
 * - `native`:    Browser-native <audio controls> element
 * - `embed`:     TuneIn iframe embed
 */
export type PlaybackMode = "audio-api" | "native" | "embed";

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
  /** Which playback engine is active */
  playbackMode: PlaybackMode;
}

export interface RadioPlayerActions {
  /** Toggle between play and pause */
  togglePlayback: () => void;
  /** Set volume (clamped to 0–1) */
  setVolume: (volume: number) => void;
  /** Switch to a different station by ID */
  switchStation: (stationId: RadioStationId) => void;
  /** Manually retry with Audio API after an error */
  retry: () => void;
  /** Switch to browser-native <audio controls> fallback */
  switchToNative: () => void;
  /** Switch to TuneIn iframe embed fallback */
  switchToEmbed: () => void;
  /** Switch back to Audio API mode */
  switchToAudioApi: () => void;
  /** All available stations */
  stations: readonly RadioStation[];
}

export type UseRadioPlayerReturn = RadioPlayerState & RadioPlayerActions;

// ============ CONSTANTS ============

/** Maximum number of automatic retry attempts before offering fallback */
const MAX_AUTO_RETRIES = 3;

/** Base delay for exponential backoff (ms). Actual delay = BASE * 2^attempt */
const RETRY_BASE_DELAY_MS = 1_500;

/** Maximum backoff delay cap (ms) */
const RETRY_MAX_DELAY_MS = 15_000;

/**
 * How long to wait in "loading" state before considering the connection stuck.
 */
const LOADING_WATCHDOG_MS = 12_000;

/**
 * How long a "stalled" state must persist before triggering reconnection.
 */
const STALL_THRESHOLD_MS = 8_000;

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
 */
function getRetryDelay(attempt: number): number {
  const exponential = RETRY_BASE_DELAY_MS * Math.pow(2, attempt);
  const capped = Math.min(exponential, RETRY_MAX_DELAY_MS);
  const jitter = capped * (0.75 + Math.random() * 0.5);
  return Math.round(jitter);
}

/** Audio events we care about */
interface AudioEventHandlers {
  onPlaying: () => void;
  onPause: () => void;
  onWaiting: () => void;
  onError: () => void;
  onStalled: () => void;
  onEnded: () => void;
}

/** Attach all event listeners to an Audio element. Returns a cleanup function. */
function bindAudioEvents(
  audio: HTMLAudioElement,
  handlers: AudioEventHandlers,
): () => void {
  const entries: [string, () => void][] = [
    ["playing", handlers.onPlaying],
    ["pause", handlers.onPause],
    ["waiting", handlers.onWaiting],
    ["error", handlers.onError],
    ["stalled", handlers.onStalled],
    ["ended", handlers.onEnded],
  ];

  for (const [event, handler] of entries) {
    audio.addEventListener(event, handler);
  }

  return () => {
    for (const [event, handler] of entries) {
      audio.removeEventListener(event, handler);
    }
  };
}

/**
 * Create a DOM-attached hidden <audio> element.
 *
 * Appending to document.body is critical — Safari/iOS and some mobile browsers
 * require audio elements to be part of the DOM tree for playback to work,
 * especially after 302 redirects to different origins.
 */
function createDomAudio(): HTMLAudioElement {
  const audio = document.createElement("audio");
  audio.preload = "metadata";
  audio.style.display = "none";
  audio.setAttribute("aria-hidden", "true");
  document.body.appendChild(audio);
  return audio;
}

/**
 * Remove a DOM-attached audio element and clean up.
 */
function destroyDomAudio(audio: HTMLAudioElement): void {
  audio.pause();
  audio.removeAttribute("src");
  audio.load();
  audio.remove();
}

/**
 * Start streaming a station on the given Audio element.
 *
 * Strategy: call play() immediately after setting src. This preserves the
 * user-gesture context so browsers allow autoplay. The browser will buffer
 * data from the stream internally before resolving the play() promise.
 *
 * If the first play() fails for a recoverable reason (e.g., the stream data
 * hasn't arrived yet due to the 302 redirect), we fall back to waiting for
 * the `canplay` event before retrying play().
 */
async function startStream(
  audio: HTMLAudioElement,
  streamUrl: string,
): Promise<void> {
  audio.src = streamUrl;

  try {
    // Immediate play() — preserves user gesture context for autoplay policy
    await audio.play();
  } catch (firstErr) {
    // Autoplay blocked or play() interrupted — rethrow immediately
    if (isAutoplayBlocked(firstErr) || isAbortError(firstErr)) {
      throw firstErr;
    }

    // For recoverable errors, wait for data then retry
    await new Promise<void>((resolve, reject) => {
      let settled = false;

      const onCanPlay = () => {
        if (settled) return;
        settled = true;
        cleanup();
        audio.play().then(resolve).catch(reject);
      };

      const onError = () => {
        if (settled) return;
        settled = true;
        cleanup();
        const code = audio.error?.code;
        reject(
          new Error(
            `Stream load failed (MediaError code=${code ?? "unknown"})`,
          ),
        );
      };

      const cleanup = () => {
        audio.removeEventListener("canplay", onCanPlay);
        audio.removeEventListener("error", onError);
      };

      audio.addEventListener("canplay", onCanPlay);
      audio.addEventListener("error", onError);

      // Restart resource loading so the browser tries again
      audio.load();
    });
  }
}

/**
 * Stop streaming and reset the media element (without removing from DOM).
 */
function stopStream(audio: HTMLAudioElement): void {
  audio.pause();
  audio.removeAttribute("src");
  audio.load();
}

/**
 * Check if an error is due to browser autoplay policy.
 */
function isAutoplayBlocked(err: unknown): boolean {
  return err instanceof DOMException && err.name === "NotAllowedError";
}

/**
 * Check if an error is an AbortError (play was interrupted).
 */
function isAbortError(err: unknown): boolean {
  return err instanceof DOMException && err.name === "AbortError";
}

// ============ HOOK ============

/**
 * Manages radio stream playback state for slideshow background music.
 * Includes auto-retry, fallback URLs, stall detection, network recovery,
 * and native/embed fallback modes.
 */
export function useRadioPlayer(): UseRadioPlayerReturn {
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const unbindRef = React.useRef<(() => void) | null>(null);
  const [status, setStatus] = React.useState<RadioPlaybackStatus>("idle");
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [volume, setVolumeState] = React.useState<number>(loadSavedVolume);
  const [station, setStation] = React.useState<RadioStation>(loadSavedStation);
  const [retryAttempt, setRetryAttempt] = React.useState(0);
  const [isRetrying, setIsRetrying] = React.useState(false);
  const [playbackMode, setPlaybackMode] =
    React.useState<PlaybackMode>("audio-api");

  // Track whether we should auto-play after a station switch
  const pendingPlayRef = React.useRef(false);
  // Track whether user has explicitly paused
  const userPausedRef = React.useRef(false);
  // Retry timer ref
  const retryTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  // Stall timer ref
  const stallTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  // Loading watchdog timer ref
  const loadingWatchdogRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  // Track if we intended to play
  const wantPlayingRef = React.useRef(false);
  // Guard flag: suppress events during intentional stop
  const suppressEventsRef = React.useRef(false);
  // Current station ref (for event handlers that can't access state)
  const stationRef = React.useRef(station);
  // Current volume ref (so createFreshAudio always uses latest volume)
  const volumeRef = React.useRef(volume);

  // Keep refs in sync with state
  React.useEffect(() => {
    stationRef.current = station;
  }, [station]);
  React.useEffect(() => {
    volumeRef.current = volume;
  }, [volume]);

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

  /** Safely stop audio without triggering re-entrant event handlers */
  const safeStop = React.useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    suppressEventsRef.current = true;
    stopStream(audio);
    Promise.resolve().then(() => {
      suppressEventsRef.current = false;
    });
  }, []);

  /** Destroy the current audio element entirely and create a fresh one */
  const resetAudioElement = React.useCallback(() => {
    // Unbind events from old element
    if (unbindRef.current) {
      unbindRef.current();
      unbindRef.current = null;
    }
    // Destroy old element
    if (audioRef.current) {
      destroyDomAudio(audioRef.current);
      audioRef.current = null;
    }
  }, []);

  /**
   * Create a fresh DOM audio element and bind events.
   * Returns the new audio element.
   */
  const createFreshAudio = React.useCallback((): HTMLAudioElement => {
    resetAudioElement();

    const audio = createDomAudio();
    audio.volume = volumeRef.current;
    audioRef.current = audio;

    unbindRef.current = bindAudioEvents(audio, {
      onPlaying: () => {
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
        if (userPausedRef.current) {
          setStatus("paused");
        }
      },

      onWaiting: () => {
        if (suppressEventsRef.current) return;
        setStatus("loading");
      },

      onError: () => {
        if (suppressEventsRef.current || !wantPlayingRef.current) return;
        console.warn("[RadioPlayer] Audio error event fired");
        // Let the startStream promise rejection handle retry logic
      },

      onStalled: () => {
        if (
          suppressEventsRef.current ||
          !wantPlayingRef.current ||
          userPausedRef.current
        )
          return;

        if (stallTimerRef.current) clearTimeout(stallTimerRef.current);
        stallTimerRef.current = setTimeout(() => {
          stallTimerRef.current = null;
          if (!wantPlayingRef.current || userPausedRef.current) return;
          console.warn(
            "[RadioPlayer] Persistent stall detected — reconnecting",
          );
          doPlay(stationRef.current, 0);
        }, STALL_THRESHOLD_MS);
      },

      onEnded: () => {
        if (
          suppressEventsRef.current ||
          !wantPlayingRef.current ||
          userPausedRef.current
        )
          return;
        console.warn("[RadioPlayer] Stream ended unexpectedly — reconnecting");
        doPlay(stationRef.current, 0);
      },
    });

    return audio;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetAudioElement]);

  /**
   * Core play function. Creates a fresh audio element for each attempt
   * (avoids state corruption from previous failures).
   * Tries URLs in order; on failure advances to next URL or schedules retry.
   */
  const doPlay = React.useCallback(
    (stationToPlay: RadioStation, urlIdx: number) => {
      const urls = getStreamUrls(stationToPlay);
      const url = urls[urlIdx % urls.length];

      wantPlayingRef.current = true;
      userPausedRef.current = false;
      setErrorMessage(null);
      setStatus("loading");

      // Create a fresh audio element for this attempt
      const audio = createFreshAudio();

      // Loading watchdog — if stuck loading, try next URL
      if (loadingWatchdogRef.current) clearTimeout(loadingWatchdogRef.current);
      loadingWatchdogRef.current = setTimeout(() => {
        loadingWatchdogRef.current = null;
        if (wantPlayingRef.current && audio === audioRef.current) {
          console.warn(
            "[RadioPlayer] Loading watchdog triggered — trying next URL",
          );
          const nextIdx = (urlIdx + 1) % urls.length;
          doPlay(stationToPlay, nextIdx);
        }
      }, LOADING_WATCHDOG_MS);

      startStream(audio, url).catch((err) => {
        // Guard: if a newer play attempt replaced our audio element, ignore
        if (audio !== audioRef.current) return;

        if (isAutoplayBlocked(err)) {
          console.warn("[RadioPlayer] Autoplay blocked — needs user gesture");
          wantPlayingRef.current = false;
          clearAllTimers();
          setStatus("error");
          setErrorMessage("Tap play to start radio");
          setIsRetrying(false);
          return;
        }

        if (isAbortError(err)) {
          return; // harmless — play() was interrupted
        }

        console.warn(`[RadioPlayer] URL #${urlIdx} failed:`, err);

        // Try next fallback URL
        const nextIdx = urlIdx + 1;
        if (nextIdx < urls.length) {
          doPlay(stationToPlay, nextIdx);
          return;
        }

        // All URLs exhausted — schedule retry
        setRetryAttempt((prev) => {
          const attempt = prev + 1;
          if (attempt > MAX_AUTO_RETRIES) {
            wantPlayingRef.current = false;
            setStatus("error");
            setErrorMessage("Stream unavailable. Try native player or TuneIn.");
            setIsRetrying(false);
            return 0;
          }

          const delay = getRetryDelay(attempt - 1);
          console.info(
            `[RadioPlayer] Retry ${attempt}/${MAX_AUTO_RETRIES} in ${delay}ms`,
          );
          setStatus("loading");
          setErrorMessage(`Reconnecting (${attempt}/${MAX_AUTO_RETRIES})...`);
          setIsRetrying(true);

          retryTimerRef.current = setTimeout(() => {
            retryTimerRef.current = null;
            doPlay(stationToPlay, 0);
          }, delay);

          return attempt;
        });
      });
    },
    [createFreshAudio, clearAllTimers],
  );

  // Clean up audio element on unmount
  React.useEffect(() => {
    return () => {
      clearAllTimers();
      resetAudioElement();
    };
  }, [clearAllTimers, resetAudioElement]);

  // Network change detection
  React.useEffect(() => {
    const handleOnline = () => {
      if (
        wantPlayingRef.current &&
        !userPausedRef.current &&
        playbackMode === "audio-api"
      ) {
        console.info("[RadioPlayer] Network back online — reconnecting");
        clearAllTimers();
        setRetryAttempt(0);
        doPlay(stationRef.current, 0);
      }
    };

    const handleOffline = () => {
      if (wantPlayingRef.current) {
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
  }, [playbackMode, clearAllTimers, doPlay]);

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

    if (playbackMode === "audio-api") {
      clearAllTimers();
      setRetryAttempt(0);
      doPlay(station, 0);
    }
    // For native/embed modes, the component re-renders with the new station
  }, [station, playbackMode, clearAllTimers, doPlay]);

  // ============ ACTIONS ============

  const play = React.useCallback(() => {
    if (playbackMode !== "audio-api") {
      // In fallback modes, just update status — component handles playback
      setStatus("playing");
      wantPlayingRef.current = true;
      userPausedRef.current = false;
      return;
    }
    clearAllTimers();
    setRetryAttempt(0);
    doPlay(station, 0);
  }, [station, playbackMode, clearAllTimers, doPlay]);

  const pause = React.useCallback(() => {
    wantPlayingRef.current = false;
    userPausedRef.current = true;
    clearAllTimers();
    setRetryAttempt(0);
    setIsRetrying(false);
    setErrorMessage(null);

    if (playbackMode === "audio-api") {
      safeStop();
    }
    setStatus("paused");
  }, [playbackMode, clearAllTimers, safeStop]);

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
    setPlaybackMode("audio-api");
    clearAllTimers();
    setRetryAttempt(0);
    setIsRetrying(false);
    doPlay(station, 0);
  }, [station, clearAllTimers, doPlay]);

  const switchToNative = React.useCallback(() => {
    safeStop();
    resetAudioElement();
    clearAllTimers();
    setPlaybackMode("native");
    setStatus("idle");
    setErrorMessage(null);
    setRetryAttempt(0);
    setIsRetrying(false);
    wantPlayingRef.current = false;
  }, [safeStop, resetAudioElement, clearAllTimers]);

  const switchToEmbed = React.useCallback(() => {
    safeStop();
    resetAudioElement();
    clearAllTimers();
    setPlaybackMode("embed");
    setStatus("playing");
    setErrorMessage(null);
    setRetryAttempt(0);
    setIsRetrying(false);
    wantPlayingRef.current = true;
  }, [safeStop, resetAudioElement, clearAllTimers]);

  const switchToAudioApi = React.useCallback(() => {
    setPlaybackMode("audio-api");
    setStatus("idle");
    setErrorMessage(null);
    setRetryAttempt(0);
    setIsRetrying(false);
    wantPlayingRef.current = false;
  }, []);

  const switchStation = React.useCallback(
    (stationId: RadioStationId) => {
      const newStation = RADIO_STATIONS.find((s) => s.id === stationId);
      if (!newStation || newStation.id === station.id) return;

      const wasActive =
        status === "playing" || status === "loading" || isRetrying;

      if (playbackMode === "audio-api") {
        safeStop();
      }
      clearAllTimers();
      setRetryAttempt(0);
      setIsRetrying(false);
      setErrorMessage(null);

      pendingPlayRef.current = wasActive;

      setStation(newStation);
      persistStation(newStation.id);

      if (!wasActive) {
        setStatus("idle");
      }
    },
    [station.id, status, isRetrying, playbackMode, clearAllTimers, safeStop],
  );

  return {
    status,
    station,
    volume,
    isPlaying: status === "playing",
    errorMessage,
    isRetrying,
    retryAttempt,
    playbackMode,
    togglePlayback,
    setVolume,
    switchStation,
    retry,
    switchToNative,
    switchToEmbed,
    switchToAudioApi,
    stations: RADIO_STATIONS,
  };
}
