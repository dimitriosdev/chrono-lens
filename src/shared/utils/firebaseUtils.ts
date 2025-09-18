/**
 * Firebase utilities for handling data
 */

/**
 * Remove undefined values from an object recursively
 * Firebase doesn't allow undefined values, so we need to clean them
 */
export function removeUndefinedValues<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(removeUndefinedValues) as T;
  }

  if (typeof obj === "object") {
    const cleaned: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        cleaned[key] = removeUndefinedValues(value);
      }
    }
    return cleaned as T;
  }

  return obj;
}

/**
 * Clean album data before saving to Firebase
 */
export function cleanAlbumData<T extends Record<string, unknown>>(album: T): T {
  return removeUndefinedValues(album);
}
