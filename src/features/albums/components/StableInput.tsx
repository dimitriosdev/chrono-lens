"use client";
import React, { useRef, useEffect } from "react";

interface StableInputProps {
  initialValue: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  className?: string;
}

// This component uses direct DOM manipulation to completely bypass React
export const StableInput: React.FC<StableInputProps> = React.memo(
  ({ initialValue, onChange, placeholder, maxLength, className }) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const onChangeRef = useRef(onChange);
    const lastValueRef = useRef(initialValue);

    // Update ref without causing re-render
    onChangeRef.current = onChange;

    // Use direct DOM manipulation instead of React
    useEffect(() => {
      const input = inputRef.current;
      if (!input) return;

      // Set initial value
      input.value = initialValue;
      lastValueRef.current = initialValue;

      // Direct event listener - completely bypass React
      const handleInput = (e: Event) => {
        const target = e.target as HTMLInputElement;
        const newValue = target.value;
        lastValueRef.current = newValue;

        // Call onChange directly without going through React
        setTimeout(() => {
          onChangeRef.current(newValue);
        }, 0);
      };

      input.addEventListener("input", handleInput);

      return () => {
        input.removeEventListener("input", handleInput);
      };
    }, [initialValue]); // Include initialValue as dependency

    // Update value only when external value changes significantly
    useEffect(() => {
      const input = inputRef.current;
      if (
        input &&
        initialValue !== lastValueRef.current &&
        document.activeElement !== input
      ) {
        input.value = initialValue;
        lastValueRef.current = initialValue;
      }
    }, [initialValue]);

    return (
      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        maxLength={maxLength}
        className={className}
        // No React props that could cause re-renders
      />
    );
  },
  () => true
); // Never re-render

StableInput.displayName = "StableInput";

export default StableInput;
