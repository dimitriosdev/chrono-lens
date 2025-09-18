/**
 * Simple Album Sharing Utilities
 * Minimal implementation for album privacy and sharing
 */

import { AlbumPrivacy } from "@/shared/types/album";

/**
 * Generate a simple share token for an album
 */
export function generateShareToken(albumId: string): string {
  // Simple token generation - combine albumId with timestamp and random string
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `${albumId}_${timestamp}_${random}`;
}

/**
 * Check if a user can access an album based on privacy settings
 */
export function canAccessAlbum(
  albumPrivacy: AlbumPrivacy,
  albumOwnerId?: string,
  currentUserId?: string,
  shareToken?: string,
  albumShareToken?: string
): boolean {
  // Public albums are accessible to everyone
  if (albumPrivacy === "public") {
    return true;
  }

  // Private albums only accessible to owner
  if (albumPrivacy === "private") {
    return albumOwnerId === currentUserId;
  }

  // Shared albums accessible to owner or with valid share token
  if (albumPrivacy === "shared") {
    // Owner can always access
    if (albumOwnerId === currentUserId) {
      return true;
    }
    // Check if share token matches
    if (shareToken && albumShareToken && shareToken === albumShareToken) {
      return true;
    }
  }

  return false;
}

/**
 * Generate a share URL for an album
 */
export function generateShareUrl(albumId: string, shareToken: string): string {
  if (typeof window !== "undefined") {
    const baseUrl = window.location.origin;
    return `${baseUrl}/albums/${albumId}?share=${shareToken}`;
  }
  return `https://your-domain.com/albums/${albumId}?share=${shareToken}`;
}

/**
 * Extract share token from URL
 */
export function getShareTokenFromUrl(): string | null {
  if (typeof window === "undefined") return null;

  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("share");
}

/**
 * Validate if share token format is correct
 */
export function isValidShareToken(token: string): boolean {
  // Simple validation - check if token has expected format
  const parts = token.split("_");
  return parts.length === 3 && parts[0].length > 0;
}
