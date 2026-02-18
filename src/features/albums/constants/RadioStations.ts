/**
 * Radio Stations Configuration
 *
 * Radio stations available for playback during album slideshows.
 * Streams provided by SRG SSR (Swiss Broadcasting Corporation).
 *
 * @see https://www.srgssr.ch — Stream provider
 * @see https://tunein.com — Station directory (attribution)
 */

/** Valid station identifiers */
export type RadioStationId =
  | "radio-swiss-jazz"
  | "radio-swiss-pop"
  | "radio-swiss-classic";

export interface RadioStation {
  /** Unique station identifier */
  id: RadioStationId;
  /** Display name shown in the UI */
  name: string;
  /** Direct MP3 stream URL (SRG SSR CDN) */
  streamUrl: string;
  /** Fallback stream URLs to try if primary fails (tried in order) */
  fallbackUrls: readonly string[];
  /** Music genre label */
  genre: string;
  /** Attribution URL (not used in UI, kept for reference) */
  attributionUrl: string;
}

/**
 * Available radio stations for slideshow background music.
 *
 * All streams are 128kbps MP3 via SRG SSR infrastructure.
 * IMPORTANT: Use the `/srgssr/` path, NOT the `/m/` shorthand.
 * The `/m/` URLs redirect HTTPS → HTTP, which browsers block as mixed content.
 * The `/srgssr/` URLs redirect HTTPS → HTTPS (to a load-balanced node).
 */
export const RADIO_STATIONS: readonly RadioStation[] = [
  {
    id: "radio-swiss-jazz",
    name: "Radio Swiss Jazz",
    streamUrl: "https://stream.srg-ssr.ch/srgssr/rsj/mp3/128",
    fallbackUrls: [
      "https://stream.srg-ssr.ch/m/rsj/mp3_128",
      "https://stream.srg-ssr.ch/m/rsj/aacp_96",
    ],
    genre: "Jazz",
    attributionUrl: "https://tunein.com/radio/Radio-Swiss-Jazz-s6814/",
  },
  {
    id: "radio-swiss-pop",
    name: "Radio Swiss Pop",
    streamUrl: "https://stream.srg-ssr.ch/srgssr/rsp/mp3/128",
    fallbackUrls: [
      "https://stream.srg-ssr.ch/m/rsp/mp3_128",
      "https://stream.srg-ssr.ch/m/rsp/aacp_96",
    ],
    genre: "Pop",
    attributionUrl: "https://tunein.com/radio/Radio-Swiss-Pop-s6828/",
  },
  {
    id: "radio-swiss-classic",
    name: "Radio Swiss Classic",
    streamUrl: "https://stream.srg-ssr.ch/srgssr/rsc_de/mp3/128",
    fallbackUrls: [
      "https://stream.srg-ssr.ch/m/rsc_de/mp3_128",
      "https://stream.srg-ssr.ch/m/rsc_de/aacp_96",
    ],
    genre: "Classical",
    attributionUrl: "https://tunein.com/radio/Radio-Swiss-Classic-s6822/",
  },
];

/** Default station used when no preference is saved */
export const DEFAULT_RADIO_STATION: RadioStation = RADIO_STATIONS[0];
