"use client";

import React from "react";
import { helpers } from "@/shared/constants/designSystem";
import {
  ExclamationTriangleIcon,
  ClockIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";

interface UsageLimitErrorProps {
  /** The error message from Firebase usage monitor */
  error: string;
  /** Suggested action for the user */
  suggestion?: string;
  /** Additional CSS classes */
  className?: string;
  /** Callback when user acknowledges the error */
  onAcknowledge?: () => void;
}

/**
 * Firebase Usage Limit Error Component
 * Shows user-friendly error messages when Firebase limits are exceeded
 */
export const UsageLimitError: React.FC<UsageLimitErrorProps> = ({
  error,
  suggestion,
  className,
  onAcknowledge,
}) => {
  const getErrorType = (
    errorMessage: string
  ): {
    type: "read" | "write" | "storage" | "general";
    icon: React.ReactNode;
    title: string;
    defaultSuggestion: string;
  } => {
    const lowerError = errorMessage.toLowerCase();

    if (lowerError.includes("read")) {
      return {
        type: "read",
        icon: <ChartBarIcon className="w-6 h-6" />,
        title: "Daily Read Limit Reached",
        defaultSuggestion:
          "The app will reset tomorrow. Try viewing fewer albums or refreshing less frequently.",
      };
    }

    if (lowerError.includes("write")) {
      return {
        type: "write",
        icon: <ExclamationTriangleIcon className="w-6 h-6" />,
        title: "Daily Write Limit Reached",
        defaultSuggestion:
          "You cannot create or edit albums today. The limit will reset tomorrow.",
      };
    }

    if (lowerError.includes("storage")) {
      return {
        type: "storage",
        icon: <ChartBarIcon className="w-6 h-6" />,
        title: "Storage Limit Reached",
        defaultSuggestion:
          "Delete some images or albums to free up space before uploading more.",
      };
    }

    return {
      type: "general",
      icon: <ExclamationTriangleIcon className="w-6 h-6" />,
      title: "Usage Limit Reached",
      defaultSuggestion:
        "Please try again later or contact support if this persists.",
    };
  };

  const errorInfo = getErrorType(error);
  const displaySuggestion = suggestion || errorInfo.defaultSuggestion;

  const getBackgroundColor = (type: string): string => {
    switch (type) {
      case "storage":
        return "bg-red-50 border-red-200 text-red-800";
      case "write":
        return "bg-yellow-50 border-yellow-200 text-yellow-800";
      case "read":
        return "bg-blue-50 border-blue-200 text-blue-800";
      default:
        return "bg-gray-50 border-gray-200 text-gray-800";
    }
  };

  const getIconColor = (type: string): string => {
    switch (type) {
      case "storage":
        return "text-red-500";
      case "write":
        return "text-yellow-500";
      case "read":
        return "text-blue-500";
      default:
        return "text-gray-500";
    }
  };

  return (
    <div
      className={helpers.cn(
        "rounded-lg border p-4",
        getBackgroundColor(errorInfo.type),
        className
      )}
    >
      <div className="flex items-start space-x-3">
        <div
          className={helpers.cn("flex-shrink-0", getIconColor(errorInfo.type))}
        >
          {errorInfo.icon}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium">{errorInfo.title}</h3>

          <div className="mt-2 text-sm">
            <p className="mb-2">{error}</p>
            <p className="opacity-75">{displaySuggestion}</p>
          </div>

          {errorInfo.type === "read" || errorInfo.type === "write" ? (
            <div className="mt-3 flex items-center text-xs opacity-60">
              <ClockIcon className="w-4 h-4 mr-1" />
              <span>Limits reset daily at midnight UTC</span>
            </div>
          ) : null}

          {onAcknowledge && (
            <div className="mt-4">
              <button
                onClick={onAcknowledge}
                className={helpers.cn(
                  "bg-white text-gray-700 border border-gray-300",
                  "px-3 py-2 rounded-md text-sm font-medium",
                  "hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500",
                  "transition-colors duration-200"
                )}
              >
                Understood
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UsageLimitError;
