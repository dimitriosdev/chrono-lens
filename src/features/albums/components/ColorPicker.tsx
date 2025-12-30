"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
  showCustomInput?: boolean;
  className?: string;
  compact?: boolean;
}

// Curated color palette - minimal but useful
const QUICK_COLORS = [
  { color: "#000000", name: "Black" },
  { color: "#ffffff", name: "White" },
  { color: "#1f2937", name: "Charcoal" },
  { color: "#6b7280", name: "Gray" },
  { color: "#f3f4f6", name: "Light" },
  { color: "#1e40af", name: "Blue" },
  { color: "#7c3aed", name: "Purple" },
  { color: "#dc2626", name: "Red" },
];

/**
 * Dropdown content rendered via portal for consistent positioning
 * across all parent stacking contexts (fixed, z-index, etc.)
 */
const ColorDropdown: React.FC<{
  label: string;
  value: string;
  onChange: (color: string) => void;
  onClose: () => void;
  buttonRect: DOMRect | null;
}> = ({ label, value, onChange, onClose, buttonRect }) => {
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Calculate position based on button rect
  const getPosition = () => {
    if (!buttonRect) return { top: 0, left: 0 };

    const dropdownWidth = 200;
    const dropdownHeight = 220;

    // Center horizontally on button
    let left = buttonRect.left + buttonRect.width / 2 - dropdownWidth / 2;
    let top = buttonRect.bottom + 8;

    // Keep within horizontal bounds
    if (left < 8) left = 8;
    if (left + dropdownWidth > window.innerWidth - 8) {
      left = window.innerWidth - dropdownWidth - 8;
    }

    // If dropdown would go below viewport, show above
    if (top + dropdownHeight > window.innerHeight - 8) {
      top = buttonRect.top - dropdownHeight - 8;
    }

    // Ensure top doesn't go above viewport
    if (top < 8) top = 8;

    return { top, left };
  };

  const position = getPosition();
  const currentColorName =
    QUICK_COLORS.find((c) => c.color.toLowerCase() === value.toLowerCase())
      ?.name || "Custom";

  if (!mounted) return null;

  return createPortal(
    <>
      {/* Backdrop - covers entire screen */}
      <div
        className="fixed inset-0 bg-black/20"
        style={{ zIndex: 99999 }}
        onClick={onClose}
      />

      {/* Dropdown */}
      <div
        ref={dropdownRef}
        className="fixed p-3 bg-white dark:bg-neutral-800 rounded-xl shadow-2xl border border-neutral-200 dark:border-neutral-700"
        style={{
          zIndex: 100000,
          top: position.top,
          left: position.left,
          width: 200,
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-neutral-100 dark:border-neutral-700">
          <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
            {label}
          </span>
          <span className="text-[10px] text-neutral-500">
            {currentColorName}
          </span>
        </div>

        {/* Color grid */}
        <div className="grid grid-cols-4 gap-2 mb-3">
          {QUICK_COLORS.map((c) => (
            <button
              key={c.color}
              type="button"
              onClick={() => {
                onChange(c.color);
                onClose();
              }}
              className={`aspect-square rounded-lg transition-all shadow-sm ${
                value.toLowerCase() === c.color.toLowerCase()
                  ? "ring-2 ring-blue-500 ring-offset-2 ring-offset-white dark:ring-offset-neutral-800 scale-105"
                  : "ring-1 ring-black/10 dark:ring-white/10 hover:scale-110"
              }`}
              style={{ backgroundColor: c.color }}
              title={c.name}
            />
          ))}
        </div>

        {/* Custom color picker */}
        <label className="flex items-center gap-2 p-2 rounded-lg bg-neutral-50 dark:bg-neutral-700/50 cursor-pointer">
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-6 h-6 rounded cursor-pointer border-0 p-0"
          />
          <span className="text-xs text-neutral-600 dark:text-neutral-400">
            Custom color
          </span>
        </label>
      </div>
    </>,
    document.body
  );
};

const ColorPicker: React.FC<ColorPickerProps> = ({
  label,
  value,
  onChange,
  className = "",
  compact = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [buttonRect, setButtonRect] = useState<DOMRect | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Update button rect when opening dropdown
  const handleOpen = () => {
    if (buttonRef.current) {
      setButtonRect(buttonRef.current.getBoundingClientRect());
    }
    setIsExpanded(true);
  };

  const handleClose = () => {
    setIsExpanded(false);
  };

  // Get current color name
  const currentColorName =
    QUICK_COLORS.find((c) => c.color.toLowerCase() === value.toLowerCase())
      ?.name || "Custom";

  if (compact) {
    return (
      <div className={`relative ${className}`}>
        {/* Compact trigger button */}
        <button
          ref={buttonRef}
          type="button"
          onClick={handleOpen}
          className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700/50 transition-colors w-full"
        >
          <div
            className="w-8 h-8 rounded-lg shadow-sm ring-1 ring-black/10 dark:ring-white/10"
            style={{ backgroundColor: value }}
          />
          <span className="text-[10px] font-medium text-neutral-600 dark:text-neutral-400 truncate max-w-full">
            {label}
          </span>
        </button>

        {/* Dropdown rendered via portal */}
        {isExpanded && (
          <ColorDropdown
            label={label}
            value={value}
            onChange={onChange}
            onClose={handleClose}
            buttonRect={buttonRect}
          />
        )}
      </div>
    );
  }

  // Standard mode - inline swatches
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
          {label}
        </label>
        <span className="text-[10px] text-neutral-500">{currentColorName}</span>
      </div>

      {/* Color grid */}
      <div className="flex gap-2 flex-wrap">
        {QUICK_COLORS.map((c) => (
          <button
            key={c.color}
            type="button"
            onClick={() => onChange(c.color)}
            className={`w-8 h-8 rounded-lg transition-all shadow-sm ${
              value.toLowerCase() === c.color.toLowerCase()
                ? "ring-2 ring-blue-500 ring-offset-2 ring-offset-white dark:ring-offset-neutral-800 scale-105"
                : "ring-1 ring-black/10 dark:ring-white/10 hover:scale-110"
            }`}
            style={{ backgroundColor: c.color }}
            title={c.name}
          />
        ))}
        <label className="w-8 h-8 rounded-lg shadow-sm ring-1 ring-black/10 dark:ring-white/10 cursor-pointer overflow-hidden relative hover:scale-110 transition-all">
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 w-full h-full cursor-pointer opacity-0"
          />
          <div className="w-full h-full bg-gradient-to-br from-red-500 via-green-500 to-blue-500" />
        </label>
      </div>
    </div>
  );
};

export default ColorPicker;
export type { ColorPickerProps };
