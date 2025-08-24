// Security utilities for production-ready app

// File validation
export const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
];

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_FILES_PER_ALBUM = 50;
export const MAX_ALBUMS_PER_USER = 20;

// Content security
export const BLOCKED_KEYWORDS = [
  // Phishing related
  "login",
  "signin",
  "password",
  "verify",
  "account",
  "security",
  "bank",
  "paypal",
  "amazon",
  "google",
  "microsoft",
  "apple",
  "update",
  "suspend",
  "expire",
  "urgent",
  "immediate",
  // Inappropriate content
  "adult",
  "xxx",
  "porn",
  "sex",
  "nude",
  "naked",
  // Spam/malicious
  "click here",
  "download now",
  "free money",
  "win prize",
  "limited time",
  "act now",
  "congratulations",
];

export function validateFile(file: File): { isValid: boolean; error?: string } {
  // Check file type
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error:
        "File type not allowed. Please upload JPEG, PNG, WebP, or GIF images only.",
    };
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: `File size too large. Maximum size is ${
        MAX_FILE_SIZE / (1024 * 1024)
      }MB.`,
    };
  }

  // Check filename for suspicious content
  const filename = file.name.toLowerCase();
  for (const keyword of BLOCKED_KEYWORDS) {
    if (filename.includes(keyword)) {
      return {
        isValid: false,
        error: "Filename contains prohibited content.",
      };
    }
  }

  return { isValid: true };
}

export function validateAlbumTitle(title: string): {
  isValid: boolean;
  error?: string;
} {
  if (!title || title.trim().length === 0) {
    return { isValid: false, error: "Album title is required." };
  }

  if (title.length > 100) {
    return {
      isValid: false,
      error: "Album title must be less than 100 characters.",
    };
  }

  // Check for blocked keywords
  const lowerTitle = title.toLowerCase();
  for (const keyword of BLOCKED_KEYWORDS) {
    if (lowerTitle.includes(keyword)) {
      return {
        isValid: false,
        error: "Album title contains prohibited content.",
      };
    }
  }

  // Check for potential phishing patterns
  const phishingPatterns = [
    /verify.*account/i,
    /update.*payment/i,
    /security.*alert/i,
    /suspended.*account/i,
    /click.*here/i,
    /urgent.*action/i,
  ];

  for (const pattern of phishingPatterns) {
    if (pattern.test(title)) {
      return {
        isValid: false,
        error: "Album title contains prohibited content patterns.",
      };
    }
  }

  return { isValid: true };
}

export function sanitizeText(text: string): string {
  return text
    .replace(/[<>'"&]/g, "") // Remove potential XSS characters
    .replace(/javascript:/gi, "") // Remove javascript: URLs
    .replace(/data:/gi, "") // Remove data: URLs
    .trim();
}

export function validateUserLimits(
  userAlbumCount: number,
  albumImageCount: number
): { isValid: boolean; error?: string } {
  if (userAlbumCount >= MAX_ALBUMS_PER_USER) {
    return {
      isValid: false,
      error: `Maximum ${MAX_ALBUMS_PER_USER} albums allowed per user.`,
    };
  }

  if (albumImageCount >= MAX_FILES_PER_ALBUM) {
    return {
      isValid: false,
      error: `Maximum ${MAX_FILES_PER_ALBUM} images allowed per album.`,
    };
  }

  return { isValid: true };
}

export function generateSecureAlbumId(): string {
  // Generate a cryptographically secure album ID
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const randomArray = new Uint8Array(16);
  crypto.getRandomValues(randomArray);

  for (let i = 0; i < randomArray.length; i++) {
    result += chars[randomArray[i] % chars.length];
  }

  return `${Date.now()}-${result}`;
}

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("isSignedIn") === "true";
}

/**
 * Get the current user ID from Firebase Auth or localStorage fallback.
 * If user is signed in with Firebase, use their Firebase UID.
 * Otherwise, generate and store a temporary user ID.
 */
export async function getCurrentUserId(): Promise<string> {
  if (typeof window === "undefined") {
    // Server-side rendering
    return "";
  }

  // First, try to get the Firebase user ID
  try {
    const { getFirebaseAuth } = await import("../lib/firebase");
    const auth = getFirebaseAuth();
    if (auth?.currentUser) {
      return auth.currentUser.uid;
    }
  } catch (error) {
    console.warn("Could not get Firebase user ID:", error);
  }

  // Fallback to localStorage for temporary/anonymous users
  let userId = localStorage.getItem("userId");
  if (!userId) {
    // Generate a unique user ID
    userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem("userId", userId);
  }
  return userId;
}

// Rate limiting helper (client-side basic check)
const requestCounts = new Map<string, { count: number; timestamp: number }>();

export function checkRateLimit(
  userId: string,
  maxRequests: number = 10,
  windowMs: number = 60000
): boolean {
  const now = Date.now();
  const userRequests = requestCounts.get(userId);

  if (!userRequests || now - userRequests.timestamp > windowMs) {
    requestCounts.set(userId, { count: 1, timestamp: now });
    return true;
  }

  if (userRequests.count >= maxRequests) {
    return false;
  }

  userRequests.count++;
  return true;
}

// Clear rate limiting cache (useful for development)
export function clearRateLimit(userId?: string): void {
  if (userId) {
    requestCounts.delete(userId);
  } else {
    requestCounts.clear();
  }
}

// Add to global window object in development for easy debugging
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  interface DevWindow extends Window {
    clearRateLimit?: typeof clearRateLimit;
    checkRateLimit?: typeof checkRateLimit;
  }

  const devWindow = window as DevWindow;
  devWindow.clearRateLimit = clearRateLimit;
  devWindow.checkRateLimit = checkRateLimit;
}
