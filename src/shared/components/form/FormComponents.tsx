"use client";

import React from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { FormSectionProps, FormFieldProps } from "@/shared/types/form";
import { ButtonProps, LoadingSpinnerProps } from "@/shared/types/ui";
import { componentVariants, helpers } from "@/shared/constants/designSystem";

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
      className={helpers.cn(
        componentVariants.card.default,
        "p-6 transition-smooth",
        className
      )}
    >
      <div
        className={helpers.cn(
          "flex items-center justify-between mb-4",
          collapsible ? "cursor-pointer group" : ""
        )}
        onClick={toggleExpanded}
      >
        <div>
          <h3
            className={helpers.cn(
              componentVariants.text.heading,
              "text-lg flex items-center gap-2",
              collapsible && "group-hover:text-blue-400 transition-colors"
            )}
          >
            {collapsible &&
              (isExpanded ? (
                <ChevronDown size={20} className="text-blue-400" />
              ) : (
                <ChevronRight size={20} className="text-blue-400" />
              ))}
            {title}
          </h3>
          {description && (
            <p className={helpers.cn(componentVariants.text.muted, "mt-1")}>
              {description}
            </p>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-4 animate-slide-down">{children}</div>
      )}
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
    <div className={helpers.cn("space-y-2", className)}>
      <label
        className={helpers.cn(
          componentVariants.text.body,
          "block text-sm font-medium"
        )}
      >
        {label}
        {required && (
          <span className="text-red-400 ml-1" aria-label="required">
            *
          </span>
        )}
      </label>

      <div className="relative">{children}</div>

      {help && !error && (
        <p className={helpers.cn(componentVariants.text.caption, "text-xs")}>
          {help}
        </p>
      )}

      {error && (
        <p
          className={helpers.cn(
            componentVariants.text.error,
            "text-xs flex items-center gap-1"
          )}
        >
          <span className="w-1 h-1 bg-red-400 rounded-full flex-shrink-0"></span>
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
  const baseClasses = helpers.cn(
    "font-semibold rounded-lg transition-smooth focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900",
    "disabled:opacity-50 disabled:cursor-not-allowed",
    "flex items-center justify-center gap-2",
    "btn-scale-hover"
  );

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  const variantClass = helpers.variant("button", variant);

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={helpers.cn(
        baseClasses,
        variantClass,
        sizeClasses[size],
        className
      )}
      aria-busy={loading}
      aria-disabled={disabled || loading}
    >
      {loading && (
        <div
          className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
          aria-hidden="true"
        />
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
      className={helpers.cn(
        "border-2 border-gray-600 border-t-blue-500 rounded-full animate-spin",
        sizeClasses[size],
        className
      )}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}
