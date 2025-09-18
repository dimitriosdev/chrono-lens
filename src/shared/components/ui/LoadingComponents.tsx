"use client";
import React from "react";
import { helpers } from "@/shared/constants/designSystem";

// Loading Spinner Component
interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  color?: "primary" | "secondary" | "white" | "neutral";
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  color = "primary",
  className,
}) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
    xl: "w-12 h-12",
  };

  const colorClasses = {
    primary: "text-blue-600",
    secondary: "text-neutral-600",
    white: "text-white",
    neutral: "text-neutral-400",
  };

  return (
    <svg
      className={helpers.cn(
        "animate-spin",
        sizeClasses[size],
        colorClasses[color],
        className
      )}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-label="Loading"
      role="status"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  );
};

// Loading Skeleton Component
interface LoadingSkeletonProps {
  className?: string;
  variant?: "text" | "rectangle" | "circle" | "rounded";
  width?: string | number;
  height?: string | number;
  lines?: number;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  className,
  variant = "rectangle",
  width,
  height,
  lines = 1,
}) => {
  const baseClasses = "bg-neutral-200 dark:bg-neutral-700 animate-pulse";

  const variantClasses = {
    text: "h-4 rounded",
    rectangle: "rounded",
    circle: "rounded-full",
    rounded: "rounded-lg",
  };

  const style = {
    width: typeof width === "number" ? `${width}px` : width,
    height: typeof height === "number" ? `${height}px` : height,
  };

  if (variant === "text" && lines > 1) {
    return (
      <div className={helpers.cn("space-y-2", className)}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={helpers.cn(
              baseClasses,
              variantClasses.text,
              index === lines - 1 ? "w-3/4" : "w-full"
            )}
            style={style}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={helpers.cn(baseClasses, variantClasses[variant], className)}
      style={style}
    />
  );
};

// Loading Dots Component
interface LoadingDotsProps {
  size?: "sm" | "md" | "lg";
  color?: "primary" | "secondary" | "white" | "neutral";
  className?: string;
}

export const LoadingDots: React.FC<LoadingDotsProps> = ({
  size = "md",
  color = "primary",
  className,
}) => {
  const sizeClasses = {
    sm: "w-1 h-1",
    md: "w-2 h-2",
    lg: "w-3 h-3",
  };

  const colorClasses = {
    primary: "bg-blue-600",
    secondary: "bg-neutral-600",
    white: "bg-white",
    neutral: "bg-neutral-400",
  };

  return (
    <div
      className={helpers.cn("flex space-x-1", className)}
      role="status"
      aria-label="Loading"
    >
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className={helpers.cn(
            "rounded-full animate-bounce",
            sizeClasses[size],
            colorClasses[color]
          )}
          style={{
            animationDelay: `${index * 0.1}s`,
            animationDuration: "0.6s",
          }}
        />
      ))}
    </div>
  );
};

// Loading Pulse Component
interface LoadingPulseProps {
  size?: "sm" | "md" | "lg";
  color?: "primary" | "secondary" | "white" | "neutral";
  className?: string;
}

export const LoadingPulse: React.FC<LoadingPulseProps> = ({
  size = "md",
  color = "primary",
  className,
}) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  const colorClasses = {
    primary: "bg-blue-600",
    secondary: "bg-neutral-600",
    white: "bg-white",
    neutral: "bg-neutral-400",
  };

  return (
    <div
      className={helpers.cn("relative", sizeClasses[size], className)}
      role="status"
      aria-label="Loading"
    >
      <div
        className={helpers.cn(
          "absolute inset-0 rounded-full animate-ping opacity-20",
          colorClasses[color]
        )}
      />
      <div
        className={helpers.cn(
          "absolute inset-2 rounded-full animate-pulse",
          colorClasses[color]
        )}
      />
    </div>
  );
};

// Loading Button Component
interface LoadingButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingText?: string;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export const LoadingButton: React.FC<LoadingButtonProps> = ({
  loading = false,
  loadingText = "Loading...",
  variant = "primary",
  size = "md",
  icon,
  children,
  disabled,
  className,
  ...props
}) => {
  const baseClasses =
    "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const variantClasses = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    secondary:
      "bg-neutral-100 text-neutral-900 hover:bg-neutral-200 focus:ring-neutral-500 border border-neutral-300",
    ghost:
      "bg-transparent text-neutral-700 hover:bg-neutral-100 focus:ring-neutral-500",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  return (
    <button
      className={helpers.cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <LoadingSpinner
            size={size === "lg" ? "md" : "sm"}
            color={
              variant === "secondary" || variant === "ghost"
                ? "neutral"
                : "white"
            }
            className="mr-2"
          />
          {loadingText}
        </>
      ) : (
        <>
          {icon && <span className="mr-2">{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
};

// Loading Overlay Component
interface LoadingOverlayProps {
  visible: boolean;
  children?: React.ReactNode;
  className?: string;
  spinnerSize?: "sm" | "md" | "lg" | "xl";
  message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  visible,
  children,
  className,
  spinnerSize = "lg",
  message,
}) => {
  if (!visible) return null;

  return (
    <div
      className={helpers.cn(
        "absolute inset-0 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm",
        "flex items-center justify-center z-50",
        className
      )}
      role="status"
      aria-label={message || "Loading"}
    >
      <div className="flex flex-col items-center space-y-4">
        <LoadingSpinner size={spinnerSize} />
        {message && (
          <p className="text-neutral-600 dark:text-neutral-400 text-sm font-medium">
            {message}
          </p>
        )}
        {children}
      </div>
    </div>
  );
};

const LoadingComponents = {
  Spinner: LoadingSpinner,
  Skeleton: LoadingSkeleton,
  Dots: LoadingDots,
  Pulse: LoadingPulse,
  Button: LoadingButton,
  Overlay: LoadingOverlay,
};

export default LoadingComponents;
