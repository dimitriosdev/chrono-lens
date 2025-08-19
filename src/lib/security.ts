/**
 * Security utilities for validating user input and preventing content policy violations
 */

// File type validation
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Content filtering - blocked keywords to prevent policy violations
const BLOCKED_KEYWORDS = [
  "phishing",
  "spam",
  "malware",
  "virus",
  "scam",
  "fraud",
  "illegal",
  "copyright",
  "piracy",
  "pornography",
  "adult",
  "violence",
  "hate",
  "discrimination",
  "harassment",
  "abuse",
  "threatening",
  "inappropriate",
  "offensive",
  "explicit",
  "nsfw",
];

// Rate limiting (in-memory store - in production use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10;

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validate file type and size
 */
export function validateFile(file: File): ValidationResult {
  // Check file type
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: `Invalid file type. Allowed types: ${ALLOWED_IMAGE_TYPES.join(
        ", "
      )}`,
    };
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: `File too large. Maximum size: ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
    };
  }

  return { isValid: true };
}

/**
 * Validate album title for content policy compliance
 */
export function validateAlbumTitle(title: string): ValidationResult {
  // Check length
  if (!title || title.trim().length === 0) {
    return { isValid: false, error: "Album title is required" };
  }

  if (title.length > 100) {
    return {
      isValid: false,
      error: "Album title must be less than 100 characters",
    };
  }

  // Check for blocked keywords
  const lowerTitle = title.toLowerCase();
  for (const keyword of BLOCKED_KEYWORDS) {
    if (lowerTitle.includes(keyword)) {
      return {
        isValid: false,
        error: "Album title contains inappropriate content",
      };
    }
  }

  // Check for common spam patterns
  if (/(.)\1{4,}/.test(title)) {
    // Repeated characters
    return {
      isValid: false,
      error: "Album title contains suspicious patterns",
    };
  }

  return { isValid: true };
}

/**
 * Rate limiting check
 */
export function checkRateLimit(userId: string): ValidationResult {
  const now = Date.now();
  const userLimit = rateLimitStore.get(userId);

  if (!userLimit || now > userLimit.resetTime) {
    // Reset or initialize
    rateLimitStore.set(userId, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    });
    return { isValid: true };
  }

  if (userLimit.count >= MAX_REQUESTS_PER_WINDOW) {
    return {
      isValid: false,
      error: "Rate limit exceeded. Please try again later.",
    };
  }

  // Increment count
  userLimit.count++;
  rateLimitStore.set(userId, userLimit);
  return { isValid: true };
}

/**
 * Sanitize text input to prevent XSS
 */
export function sanitizeText(text: string): string {
  return text
    .replace(/[<>'"&]/g, (char) => {
      switch (char) {
        case "<":
          return "&lt;";
        case ">":
          return "&gt;";
        case '"':
          return "&quot;";
        case "'":
          return "&#x27;";
        case "&":
          return "&amp;";
        default:
          return char;
      }
    })
    .trim();
}

/**
 * Validate user authentication and get userId
 */
export function validateUserAuth(
  user: { uid: string } | null
): ValidationResult & { userId?: string } {
  if (!user || !user.uid) {
    return { isValid: false, error: "User authentication required" };
  }
  return { isValid: true, userId: user.uid };
}
