"use client";

import { useCallback, useRef } from "react";

interface ErrorReport {
  error: Error;
  errorInfo?: React.ErrorInfo;
  context?: string;
  timestamp: number;
  userAgent: string;
  url: string;
}

interface UseErrorHandlerOptions {
  context?: string;
  enableConsoleLogging?: boolean;
  enableErrorReporting?: boolean;
  maxReportsPerSession?: number;
}

interface UseErrorHandlerReturn {
  reportError: (error: Error, errorInfo?: React.ErrorInfo) => void;
  clearErrorReports: () => void;
  getErrorReports: () => ErrorReport[];
  getErrorCount: () => number;
}

/**
 * Custom hook for handling and reporting errors in React components
 * Provides consistent error logging and optional error reporting
 */
export function useErrorHandler(
  options: UseErrorHandlerOptions = {},
): UseErrorHandlerReturn {
  const {
    context = "Unknown",
    enableConsoleLogging = true,
    enableErrorReporting = false,
    maxReportsPerSession = 50,
  } = options;

  const errorReports = useRef<ErrorReport[]>([]);
  const reportCount = useRef(0);

  const reportError = useCallback(
    (error: Error, errorInfo?: React.ErrorInfo) => {
      const timestamp = Date.now();
      const report: ErrorReport = {
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack,
        } as Error,
        errorInfo,
        context,
        timestamp,
        userAgent:
          typeof navigator !== "undefined" ? navigator.userAgent : "Unknown",
        url: typeof window !== "undefined" ? window.location.href : "Unknown",
      };

      // Add to local error reports (with size limit)
      if (errorReports.current.length >= maxReportsPerSession) {
        errorReports.current.shift(); // Remove oldest report
      }
      errorReports.current.push(report);
      reportCount.current++;

      // Console logging
      if (enableConsoleLogging) {
        console.group(`🚨 Error in ${context}`);
        console.error("Error:", error);
        if (errorInfo) {
          console.error("Error Info:", errorInfo);
        }
        console.error("Full Report:", report);
        console.groupEnd();
      }

      // Optional external error reporting
      if (enableErrorReporting && typeof window !== "undefined") {
        // You can integrate with services like Sentry, LogRocket, etc.
        try {
          // Example: Send to your error reporting service
          // sendErrorReport(report);

          // For now, we'll store in sessionStorage for debugging
          const sessionErrors = JSON.parse(
            sessionStorage.getItem("chronolens_errors") || "[]",
          );
          sessionErrors.push(report);

          // Keep only recent errors
          const recentErrors = sessionErrors.slice(-maxReportsPerSession);
          sessionStorage.setItem(
            "chronolens_errors",
            JSON.stringify(recentErrors),
          );
        } catch (reportingError) {
          console.warn("Failed to report error:", reportingError);
        }
      }
    },
    [context, enableConsoleLogging, enableErrorReporting, maxReportsPerSession],
  );

  const clearErrorReports = useCallback(() => {
    errorReports.current = [];
    reportCount.current = 0;

    if (typeof window !== "undefined") {
      sessionStorage.removeItem("chronolens_errors");
    }
  }, []);

  const getErrorReports = useCallback(() => {
    return [...errorReports.current];
  }, []);

  const getErrorCount = useCallback(() => {
    return reportCount.current;
  }, []);

  return {
    reportError,
    clearErrorReports,
    getErrorReports,
    getErrorCount,
  };
}

/**
 * Hook for handling async errors (e.g., in useEffect, event handlers)
 * Since error boundaries don't catch async errors, this provides a way to handle them
 */
export function useAsyncErrorHandler(context = "Async Operation") {
  const { reportError } = useErrorHandler({ context });

  const handleAsyncError = useCallback(
    (error: unknown) => {
      const errorInstance =
        error instanceof Error ? error : new Error(String(error));
      reportError(errorInstance);
    },
    [reportError],
  );

  const asyncWrapper = useCallback(
    <T extends unknown[], R>(fn: (...args: T) => Promise<R>) => {
      return async (...args: T): Promise<R | undefined> => {
        try {
          return await fn(...args);
        } catch (error) {
          handleAsyncError(error);
          return undefined;
        }
      };
    },
    [handleAsyncError],
  );

  return {
    handleAsyncError,
    asyncWrapper,
  };
}

/**
 * Hook for graceful error recovery with retry functionality
 */
export function useErrorRecovery(maxRetries = 3) {
  const retryCount = useRef(0);
  const { reportError } = useErrorHandler({ context: "Error Recovery" });

  const tryWithRecovery = useCallback(
    async <T>(
      operation: () => Promise<T>,
      onError?: (error: Error, attempt: number) => void,
    ): Promise<T | null> => {
      try {
        const result = await operation();
        retryCount.current = 0; // Reset on success
        return result;
      } catch (error) {
        const errorInstance =
          error instanceof Error ? error : new Error(String(error));
        retryCount.current++;

        reportError(errorInstance);

        if (onError) {
          onError(errorInstance, retryCount.current);
        }

        if (retryCount.current < maxRetries) {
          // Exponential backoff
          const delay = Math.pow(2, retryCount.current - 1) * 1000;
          await new Promise((resolve) => setTimeout(resolve, delay));
          // Retry by calling operation again (recursive call is intentional)
          // eslint-disable-next-line react-hooks/immutability
          return tryWithRecovery(operation, onError);
        }

        // Max retries exceeded
        retryCount.current = 0;
        return null;
      }
    },
    [maxRetries, reportError],
  );

  const resetRetryCount = useCallback(() => {
    retryCount.current = 0;
  }, []);

  return {
    tryWithRecovery,
    resetRetryCount,
    currentRetryCount: retryCount.current,
    canRetry: retryCount.current < maxRetries,
  };
}

export type { ErrorReport, UseErrorHandlerOptions, UseErrorHandlerReturn };
