"use client";
import React, { useState, useRef, useEffect } from "react";
import { helpers } from "@/shared/constants/design";

// Interactive Card Component with enhanced hover effects
interface InteractiveCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "elevated" | "glass" | "bordered";
  hoverEffect?: "lift" | "glow" | "scale" | "tilt" | "none";
  clickable?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  focusable?: boolean;
}

export const InteractiveCard: React.FC<InteractiveCardProps> = ({
  children,
  className,
  variant = "default",
  hoverEffect = "lift",
  clickable = false,
  onClick,
  disabled = false,
  focusable = true,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const baseClasses =
    "transition-all duration-300 ease-out relative overflow-hidden";

  const variantClasses = {
    default:
      "bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg",
    elevated:
      "bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-md",
    glass:
      "bg-white/10 dark:bg-neutral-900/20 backdrop-blur-md border border-white/20 dark:border-neutral-700/30 rounded-lg",
    bordered:
      "bg-transparent border-2 border-neutral-200 dark:border-neutral-700 rounded-lg",
  };

  const hoverClasses = {
    lift: isHovered ? "transform -translate-y-2 shadow-xl" : "shadow-sm",
    glow: isHovered
      ? "shadow-2xl shadow-blue-500/20 ring-1 ring-blue-500/20"
      : "shadow-sm",
    scale: isHovered ? "transform scale-105 shadow-lg" : "shadow-sm",
    tilt: isHovered ? "transform rotate-1 scale-105 shadow-lg" : "shadow-sm",
    none: "shadow-sm",
  };

  const pressedClasses = isPressed ? "transform scale-98" : "";

  const Component = clickable ? "button" : "div";

  return (
    <Component
      className={helpers.cn(
        baseClasses,
        variantClasses[variant],
        hoverClasses[hoverEffect],
        pressedClasses,
        clickable && "cursor-pointer",
        disabled && "opacity-50 cursor-not-allowed",
        focusable &&
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-blue-400 dark:focus:ring-offset-neutral-900",
        className
      )}
      onMouseEnter={() => !disabled && setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsPressed(false);
      }}
      onMouseDown={() => !disabled && setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onClick={!disabled ? onClick : undefined}
      disabled={disabled}
      tabIndex={focusable && clickable ? 0 : -1}
    >
      {children}
    </Component>
  );
};

// Tooltip Component with enhanced interactions
interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
  delay?: number;
  className?: string;
  disabled?: boolean;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = "top",
  delay = 500,
  className,
  disabled = false,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showTooltip = () => {
    if (disabled) return;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => setIsVisible(true), delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const positionClasses = {
    top: "bottom-full left-1/2 transform -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 transform -translate-x-1/2 mt-2",
    left: "right-full top-1/2 transform -translate-y-1/2 mr-2",
    right: "left-full top-1/2 transform -translate-y-1/2 ml-2",
  };

  const arrowClasses = {
    top: "top-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-neutral-900",
    bottom:
      "bottom-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-neutral-900",
    left: "left-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-neutral-900",
    right:
      "right-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-neutral-900",
  };

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
      >
        {children}
      </div>
      {isVisible && (
        <div
          className={helpers.cn(
            "absolute z-50 px-2 py-1 text-xs text-white bg-neutral-900 rounded shadow-lg whitespace-nowrap",
            "animate-in fade-in-0 zoom-in-95 duration-200",
            positionClasses[position],
            className
          )}
          role="tooltip"
        >
          {content}
          <div
            className={helpers.cn(
              "absolute w-0 h-0 border-4",
              arrowClasses[position]
            )}
          />
        </div>
      )}
    </div>
  );
};

// Press Effect Component
interface PressEffectProps {
  children: React.ReactNode;
  className?: string;
  scale?: number;
  disabled?: boolean;
}

export const PressEffect: React.FC<PressEffectProps> = ({
  children,
  className,
  scale = 0.95,
  disabled = false,
}) => {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <div
      className={helpers.cn(
        "transition-transform duration-100 ease-out",
        !disabled && "cursor-pointer",
        disabled && "cursor-not-allowed opacity-50",
        className
      )}
      style={{
        transform: isPressed && !disabled ? `scale(${scale})` : "scale(1)",
      }}
      onMouseDown={() => !disabled && setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      onTouchStart={() => !disabled && setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
    >
      {children}
    </div>
  );
};

const InteractionComponents = {
  Card: InteractiveCard,
  Tooltip,
  Press: PressEffect,
};

export default InteractionComponents;
