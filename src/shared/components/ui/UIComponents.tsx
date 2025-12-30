"use client";

import React from "react";
import { helpers, componentVariants } from "@/shared/constants/design";

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
