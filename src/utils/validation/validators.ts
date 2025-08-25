import { ValidationResult } from "@/types/form";

/**
 * Validation utilities for form fields
 * Centralized validation logic for consistency and reusability
 */

export const validateRequired = (value: string): ValidationResult => {
  const trimmedValue = value?.trim();
  return {
    isValid: Boolean(trimmedValue),
    error: !trimmedValue ? "This field is required" : undefined,
  };
};

export const validateTitle = (title: string): ValidationResult => {
  const requiredCheck = validateRequired(title);
  if (!requiredCheck.isValid) {
    return requiredCheck;
  }

  const trimmedTitle = title.trim();

  if (trimmedTitle.length < 3) {
    return {
      isValid: false,
      error: "Title must be at least 3 characters long",
    };
  }

  if (trimmedTitle.length > 100) {
    return {
      isValid: false,
      error: "Title must be less than 100 characters",
    };
  }

  // Check for invalid characters
  const invalidChars = /[<>"/\\|?*]/;
  if (invalidChars.test(trimmedTitle)) {
    return {
      isValid: false,
      error: "Title contains invalid characters",
    };
  }

  return { isValid: true };
};

export const validateEmail = (email: string): ValidationResult => {
  const requiredCheck = validateRequired(email);
  if (!requiredCheck.isValid) {
    return requiredCheck;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return {
    isValid: emailRegex.test(email),
    error: !emailRegex.test(email)
      ? "Please enter a valid email address"
      : undefined,
  };
};

export const validateFile = (file: File): ValidationResult => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];

  if (!file) {
    return {
      isValid: false,
      error: "No file selected",
    };
  }

  if (file.size > maxSize) {
    return {
      isValid: false,
      error: "File size must be less than 10MB",
    };
  }

  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: "File must be an image (JPEG, PNG, GIF, or WebP)",
    };
  }

  return { isValid: true };
};

export const validateUrl = (url: string): ValidationResult => {
  if (!url) {
    return { isValid: true }; // URL is optional
  }

  try {
    new URL(url);
    return { isValid: true };
  } catch {
    return {
      isValid: false,
      error: "Please enter a valid URL",
    };
  }
};

export const validateNumber = (
  value: number | string,
  min?: number,
  max?: number
): ValidationResult => {
  const numValue = typeof value === "string" ? parseFloat(value) : value;

  if (isNaN(numValue)) {
    return {
      isValid: false,
      error: "Please enter a valid number",
    };
  }

  if (min !== undefined && numValue < min) {
    return {
      isValid: false,
      error: `Value must be at least ${min}`,
    };
  }

  if (max !== undefined && numValue > max) {
    return {
      isValid: false,
      error: `Value must be no more than ${max}`,
    };
  }

  return { isValid: true };
};
