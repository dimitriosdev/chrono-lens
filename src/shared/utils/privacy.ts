/**
 * Privacy Utilities Module
 *
 * Provides helper functions for managing album privacy, access control,
 * and share token generation/validation.
 */

import { AlbumPrivacy, Album } from "@/shared/types/album";
import { User } from "@/shared/types/auth";

// ========================================
// ACCESS CONTROL
// ========================================

/**
 * Check if a user can access an album based on privacy settings
 *
 * @param album - The album to check access for
 * @param currentUser - The currently authenticated user (if any)
 * @returns True if user can access the album
 */
export function canAccessAlbum(
  album: Album,
  currentUser?: User | null
): boolean {
  // PUBLIC: Anyone can access
  if (album.privacy === "public") {
    return true;
  }

  // PRIVATE: Only owner can access
  if (album.privacy === "private") {
    return !!(currentUser && album.userId === currentUser.id);
  }

  return false;
}

/**
 * Check if a user can edit/modify an album
 * Only the owner can edit, regardless of privacy level
 *
 * @param album - The album to check
 * @param currentUser - The currently authenticated user
 * @returns True if user can edit the album
 */
export function canEditAlbum(album: Album, currentUser?: User | null): boolean {
  return !!(currentUser && album.userId === currentUser.id);
}

/**
 * Check if a user can delete an album
 * Only the owner can delete, regardless of privacy level
 *
 * @param album - The album to check
 * @param currentUser - The currently authenticated user
 * @returns True if user can delete the album
 */
export function canDeleteAlbum(
  album: Album,
  currentUser?: User | null
): boolean {
  return !!(currentUser && album.userId === currentUser.id);
}

/**
 * Check if an album requires authentication to view
 *
 * @param privacy - The privacy level of the album
 * @returns True if authentication is required
 */
export function requiresAuthentication(privacy: AlbumPrivacy): boolean {
  // Public albums never require auth
  if (privacy === "public") {
    return false;
  }

  // Private albums require auth
  return true;
}

// ========================================
// PRIVACY VALIDATION
// ========================================

/**
 * Validate privacy level value
 *
 * @param privacy - The privacy value to validate
 * @returns True if privacy is valid
 */
export function isValidPrivacy(privacy: unknown): privacy is AlbumPrivacy {
  return privacy === "public" || privacy === "private";
}

/**
 * Validate privacy transition
 * Checks if changing from one privacy level to another is allowed
 *
 * @param currentPrivacy - Current privacy level
 * @param newPrivacy - New privacy level
 * @returns Object with validation result and optional message
 */
export function validatePrivacyTransition(
  currentPrivacy: AlbumPrivacy,
  newPrivacy: AlbumPrivacy
): { isValid: boolean; message?: string } {
  // All transitions are currently allowed
  // Future: Add restrictions based on business logic

  // No change
  if (currentPrivacy === newPrivacy) {
    return { isValid: true };
  }

  // Transitioning to public
  if (newPrivacy === "public") {
    return {
      isValid: true,
      message:
        "Album will be visible to everyone and appear in public gallery.",
    };
  }

  // Transitioning to private
  if (newPrivacy === "private") {
    return {
      isValid: true,
      message: "Album will become private. Only you can view it.",
    };
  }

  return { isValid: true };
}

// ========================================
// PRIVACY METADATA
// ========================================

/**
 * Get human-readable privacy information
 *
 * @param privacy - The privacy level
 * @returns Object with label, description, and icon identifier
 */
export function getPrivacyMetadata(privacy: AlbumPrivacy): {
  label: string;
  description: string;
  icon: "globe" | "lock" | "users";
  color: string;
} {
  switch (privacy) {
    case "public":
      return {
        label: "Public",
        description: "Anyone can view this album",
        icon: "globe",
        color: "green",
      };
    case "private":
      return {
        label: "Private",
        description: "Only you can view this album",
        icon: "lock",
        color: "red",
      };
  }
}

/**
 * Get privacy recommendation based on album content
 * Provides smart default based on various factors
 *
 * @param options - Album characteristics
 * @returns Recommended privacy level
 */
export function recommendPrivacy(options: {
  hasPersonalPhotos?: boolean;
  hasSensitiveContent?: boolean;
}): AlbumPrivacy {
  const { hasPersonalPhotos, hasSensitiveContent } = options;

  // Sensitive content should always be private
  if (hasSensitiveContent) {
    return "private";
  }

  // Personal photos default to private
  if (hasPersonalPhotos) {
    return "private";
  }

  // Default to private for security
  return "private";
}

// ========================================
// ACCESS LOGGING (Optional)
// ========================================

/**
 * Type for access log entry
 */
export interface AccessLogEntry {
  timestamp: Date;
  accessType: "owner" | "public";
  userId?: string;
}

/**
 * Create an access log entry
 * Can be used for analytics and audit trails
 *
 * @param album - The album being accessed
 * @param user - The user accessing (if authenticated)
 * @returns Access log entry
 */
export function createAccessLogEntry(
  album: Album,
  user?: User | null
): AccessLogEntry {
  // Determine access type
  let accessType: AccessLogEntry["accessType"] = "public";

  if (user && album.userId === user.id) {
    accessType = "owner";
  }

  return {
    timestamp: new Date(),
    accessType,
    userId: user?.id,
  };
}
