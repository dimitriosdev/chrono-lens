"use client";

import React from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { FormSectionProps, FormFieldProps } from "@/shared/types/form";
import { ButtonProps, LoadingSpinnerProps } from "@/shared/types/ui";

export function FormSection({
  title,
  description,
  children,
  collapsible = false,
  defaultExpanded = true,
  expanded,
  onExpandedChange,
  className = "",
}: FormSectionProps) {
  const [internalExpanded, setInternalExpanded] =
    React.useState(defaultExpanded);

  // Use controlled state if provided, otherwise use internal state
  const isExpanded = expanded !== undefined ? expanded : internalExpanded;

  const toggleExpanded = () => {
    if (collapsible) {
      const newExpanded = !isExpanded;
      if (onExpandedChange) {
        onExpandedChange(newExpanded);
      } else {
        setInternalExpanded(newExpanded);
      }
    }
  };

  return (
    <div
      className={`bg-gray-800 rounded-lg p-6 border border-gray-700 ${className}`}
    >
      <div
        className={`flex items-center justify-between mb-4 ${
          collapsible ? "cursor-pointer" : ""
        }`}
        onClick={toggleExpanded}
      >
        <div>
          <h3 className="text-lg font-semibold text-gray-100 flex items-center gap-2">
            {collapsible &&
              (isExpanded ? (
                <ChevronDown size={20} />
              ) : (
                <ChevronRight size={20} />
              ))}
            {title}
          </h3>
          {description && (
            <p className="text-sm text-gray-400 mt-1">{description}</p>
          )}
        </div>
      </div>

      {isExpanded && <div className="space-y-4">{children}</div>}
    </div>
  );
}

export function FormField({
  label,
  required = false,
  error,
  help,
  children,
  className = "",
}: FormFieldProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-gray-200">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      {children}
      {help && !error && <p className="text-xs text-gray-400">{help}</p>}
      {error && (
        <p className="text-xs text-red-400 flex items-center gap-1">
          <span className="w-1 h-1 bg-red-400 rounded-full"></span>
          {error}
        </p>
      )}
    </div>
  );
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  onClick,
  type = "button",
  className = "",
}: ButtonProps) {
  const baseClasses =
    "font-semibold rounded-lg transition focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2";

  const variantClasses = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    secondary: "bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    success: "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500",
    ghost:
      "bg-transparent text-gray-300 hover:bg-gray-700 focus:ring-gray-500 border border-gray-600",
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {loading && (
        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
      )}
      {children}
    </button>
  );
}

export function LoadingSpinner({
  size = "md",
  className = "",
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <div
      className={`border-2 border-gray-600 border-t-blue-500 rounded-full animate-spin ${sizeClasses[size]} ${className}`}
    ></div>
  );
}
