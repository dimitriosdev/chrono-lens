"use client";

import React, { useState, useEffect } from "react";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
  type?: "warning" | "danger" | "info";
  requireTextConfirmation?: boolean;
  requiredText?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmButtonText = "Confirm",
  cancelButtonText = "Cancel",
  type = "warning",
  requireTextConfirmation = false,
  requiredText = "",
}) => {
  const [inputValue, setInputValue] = useState("");
  const [isConfirmEnabled, setIsConfirmEnabled] = useState(
    !requireTextConfirmation
  );

  useEffect(() => {
    if (requireTextConfirmation) {
      setIsConfirmEnabled(inputValue === requiredText);
    }
  }, [inputValue, requiredText, requireTextConfirmation]);

  useEffect(() => {
    if (isOpen) {
      setInputValue("");
      setIsConfirmEnabled(!requireTextConfirmation);
    }
  }, [isOpen, requireTextConfirmation]);

  const handleConfirm = () => {
    if (isConfirmEnabled) {
      onConfirm();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    } else if (e.key === "Enter" && isConfirmEnabled) {
      handleConfirm();
    }
  };

  if (!isOpen) return null;

  const getColors = () => {
    switch (type) {
      case "danger":
        return {
          confirmButton: "bg-red-600 hover:bg-red-700 focus:ring-red-500",
          icon: "🚨",
          border: "border-red-500",
        };
      case "warning":
        return {
          confirmButton:
            "bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500",
          icon: "⚠️",
          border: "border-yellow-500",
        };
      case "info":
        return {
          confirmButton: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
          icon: "ℹ️",
          border: "border-blue-500",
        };
      default:
        return {
          confirmButton:
            "bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500",
          icon: "⚠️",
          border: "border-yellow-500",
        };
    }
  };

  const colors = getColors();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Background overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-75"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div
        className={`relative w-full max-w-md p-6 bg-gray-800 border-2 shadow-xl rounded-2xl ${colors.border}`}
        onKeyDown={handleKeyDown}
        tabIndex={-1}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">{colors.icon}</span>
          <h3 className="text-lg font-medium leading-6 text-white">{title}</h3>
        </div>

        {/* Message */}
        <div className="mb-6">
          <p className="text-sm text-gray-300 whitespace-pre-line">{message}</p>
        </div>

        {/* Text confirmation input */}
        {requireTextConfirmation && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Type &quot;{requiredText}&quot; to confirm:
            </label>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
              placeholder={requiredText}
              autoFocus
            />
            {inputValue && inputValue !== requiredText && (
              <p className="mt-1 text-xs text-red-400">
                Text must match exactly (case sensitive)
              </p>
            )}
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 border border-gray-600 rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
          >
            {cancelButtonText}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!isConfirmEnabled}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 transition-colors ${
              colors.confirmButton
            } ${
              !isConfirmEnabled
                ? "opacity-50 cursor-not-allowed"
                : "cursor-pointer"
            }`}
          >
            {confirmButtonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
