"use client";

import React from "react";
import { helpers, componentVariants } from "@/shared/constants/designSystem";

// Card Component
interface CardProps {
  children: React.ReactNode;
  variant?: "default" | "elevated" | "glass" | "interactive";
  padding?: "none" | "sm" | "md" | "lg";
  className?: string;
  onClick?: () => void;
}

export function Card({
  children,
  variant = "default",
  padding = "md",
  className = "",
  onClick,
}: CardProps) {
  const paddingClasses = {
    none: "",
    sm: "p-3",
    md: "p-6",
    lg: "p-8",
  };

  const baseClasses = helpers.cn(
    componentVariants.card[variant],
    paddingClasses[padding],
    onClick && "cursor-pointer",
    "transition-smooth"
  );

  const Component = onClick ? "button" : "div";

  return (
    <Component
      className={helpers.cn(baseClasses, className)}
      onClick={onClick}
      {...(onClick && { type: "button" })}
    >
      {children}
    </Component>
  );
}

// Badge Component
interface BadgeProps {
  children: React.ReactNode;
  variant?:
    | "default"
    | "primary"
    | "success"
    | "warning"
    | "danger"
    | "outline";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Badge({
  children,
  variant = "default",
  size = "md",
  className = "",
}: BadgeProps) {
  const sizeClasses = {
    sm: "px-1.5 py-0.5 text-xs",
    md: "px-2 py-1 text-xs",
    lg: "px-3 py-1.5 text-sm",
  };

  return (
    <span
      className={helpers.cn(
        componentVariants.badge[variant],
        sizeClasses[size],
        "inline-flex items-center font-medium",
        className
      )}
    >
      {children}
    </span>
  );
}

// Input Component
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: "default" | "error" | "success";
  fullWidth?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { variant = "default", fullWidth = true, className = "", ...props },
    ref
  ) => {
    return (
      <input
        ref={ref}
        className={helpers.cn(
          componentVariants.input[variant],
          fullWidth && "w-full",
          "transition-smooth",
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

// Textarea Component
interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  variant?: "default" | "error" | "success";
  fullWidth?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    { variant = "default", fullWidth = true, className = "", ...props },
    ref
  ) => {
    return (
      <textarea
        ref={ref}
        className={helpers.cn(
          componentVariants.input[variant],
          fullWidth && "w-full",
          "transition-smooth resize-y min-h-[80px]",
          className
        )}
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";

// Select Component
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  variant?: "default" | "error" | "success";
  fullWidth?: boolean;
  children: React.ReactNode;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      variant = "default",
      fullWidth = true,
      className = "",
      children,
      ...props
    },
    ref
  ) => {
    return (
      <select
        ref={ref}
        className={helpers.cn(
          componentVariants.input[variant],
          fullWidth && "w-full",
          "transition-smooth appearance-none bg-chevron-down bg-no-repeat bg-right bg-[length:16px_16px] bg-[position:right_12px_center]",
          className
        )}
        {...props}
      >
        {children}
      </select>
    );
  }
);

Select.displayName = "Select";

// Divider Component
interface DividerProps {
  orientation?: "horizontal" | "vertical";
  className?: string;
}

export function Divider({
  orientation = "horizontal",
  className = "",
}: DividerProps) {
  return (
    <div
      className={helpers.cn(
        "bg-gray-600",
        orientation === "horizontal" ? "h-px w-full" : "w-px h-full",
        className
      )}
      role="separator"
      aria-orientation={orientation}
    />
  );
}

// Avatar Component
interface AvatarProps {
  src?: string;
  alt?: string;
  size?: "sm" | "md" | "lg" | "xl";
  fallback?: string;
  className?: string;
}

export function Avatar({
  src,
  alt = "",
  size = "md",
  fallback,
  className = "",
}: AvatarProps) {
  const sizeClasses = {
    sm: "w-6 h-6 text-xs",
    md: "w-8 h-8 text-sm",
    lg: "w-12 h-12 text-base",
    xl: "w-16 h-16 text-lg",
  };

  const [imageError, setImageError] = React.useState(false);

  if (src && !imageError) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        className={helpers.cn(
          "rounded-full object-cover",
          sizeClasses[size],
          className
        )}
        onError={() => setImageError(true)}
      />
    );
  }

  return (
    <div
      className={helpers.cn(
        "rounded-full bg-gray-600 flex items-center justify-center text-gray-200 font-medium",
        sizeClasses[size],
        className
      )}
    >
      {fallback || alt.charAt(0).toUpperCase()}
    </div>
  );
}

// Skeleton Component
interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular";
  width?: string | number;
  height?: string | number;
}

export function Skeleton({
  className = "",
  variant = "rectangular",
  width,
  height,
}: SkeletonProps) {
  const variantClasses = {
    text: "h-4 w-full",
    circular: "rounded-full",
    rectangular: "rounded",
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === "number" ? `${width}px` : width;
  if (height)
    style.height = typeof height === "number" ? `${height}px` : height;

  return (
    <div
      className={helpers.cn(
        "skeleton bg-gray-600",
        variantClasses[variant],
        className
      )}
      style={style}
      aria-hidden="true"
    />
  );
}

// Progress Component
interface ProgressProps {
  value: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "success" | "warning" | "danger";
  showLabel?: boolean;
  className?: string;
}

export function Progress({
  value,
  max = 100,
  size = "md",
  variant = "default",
  showLabel = false,
  className = "",
}: ProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const sizeClasses = {
    sm: "h-1",
    md: "h-2",
    lg: "h-3",
  };

  const variantClasses = {
    default: "bg-blue-500",
    success: "bg-green-500",
    warning: "bg-yellow-500",
    danger: "bg-red-500",
  };

  return (
    <div className={helpers.cn("w-full", className)}>
      {showLabel && (
        <div className="flex justify-between text-sm text-gray-400 mb-1">
          <span>Progress</span>
          <span>{Math.round(percentage)}%</span>
        </div>
      )}
      <div
        className={helpers.cn(
          "w-full bg-gray-700 rounded-full overflow-hidden",
          sizeClasses[size]
        )}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        <div
          className={helpers.cn(
            "h-full transition-all duration-300 ease-out rounded-full",
            variantClasses[variant]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

// Tooltip Component
interface TooltipProps {
  children: React.ReactNode;
  content: string;
  position?: "top" | "bottom" | "left" | "right";
  className?: string;
}

export function Tooltip({
  children,
  content,
  position = "top",
  className = "",
}: TooltipProps) {
  const [isVisible, setIsVisible] = React.useState(false);

  const positionClasses = {
    top: "bottom-full left-1/2 transform -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 transform -translate-x-1/2 mt-2",
    left: "right-full top-1/2 transform -translate-y-1/2 mr-2",
    right: "left-full top-1/2 transform -translate-y-1/2 ml-2",
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          className={helpers.cn(
            "absolute z-50 px-2 py-1 text-xs text-white bg-gray-800 rounded shadow-lg whitespace-nowrap pointer-events-none",
            positionClasses[position],
            className
          )}
          role="tooltip"
        >
          {content}
        </div>
      )}
    </div>
  );
}
