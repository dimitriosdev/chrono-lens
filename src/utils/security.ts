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

export function getCurrentUserId(): string | null {
  if (typeof window === "undefined") return null;

  // Check if user is signed in
  if (localStorage.getItem("isSignedIn") !== "true") {
    return null;
  }

  // Get or generate a user ID
  let userId = localStorage.getItem("userId");
  if (!userId) {
    // Generate a unique user ID for localStorage-based auth
    userId = `user_${Date.now()}_${Math.random().toString(36).slice(2)}`;
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
