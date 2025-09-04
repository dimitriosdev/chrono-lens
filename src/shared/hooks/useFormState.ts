import { useState, useCallback } from "react";
import { FormErrors, ValidationResult } from "@/shared/types/form";

/**
 * Custom hook for managing form state and validation
 * Provides simplified form management with built-in error handling
 */
export function useFormState<T extends object>(initialData: T) {
  const [formData, setFormData] = useState<T>(initialData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  const updateField = useCallback(
    <K extends keyof T>(
      field: K,
      value: T[K],
      validator?: (value: T[K]) => ValidationResult
    ) => {
      setFormData((prev) => ({ ...prev, [field]: value }));

      // Clear existing error
      if (errors[field as string]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field as string];
          return newErrors;
        });
      }

      // Run validation if provided
      if (validator) {
        const validation = validator(value);
        if (!validation.isValid && validation.error) {
          setErrors((prev) => ({
            ...prev,
            [field as string]: validation.error!,
          }));
        }
      }
    },
    [errors]
  );

  const updateFormData = useCallback((updates: Partial<T>) => {
    setFormData((prev) => ({ ...prev, ...updates }));

    // Clear related errors
    const updatedFields = Object.keys(updates);
    setErrors((prev) => {
      const newErrors = { ...prev };
      updatedFields.forEach((field) => {
        delete newErrors[field];
      });
      return newErrors;
    });
  }, []);

  const setError = useCallback((field: keyof T, error: string) => {
    setErrors((prev) => ({
      ...prev,
      [field as string]: error,
    }));
  }, []);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const hasErrors = Object.keys(errors).length > 0;

  return {
    formData,
    errors,
    loading,
    hasErrors,
    updateField,
    updateFormData,
    setFormData,
    setError,
    clearErrors,
    setLoading,
  };
}
