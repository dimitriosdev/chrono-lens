/**
 * Payload Size Indicator Component
 * Shows current total payload size and warns when approaching limits
 */
"use client";

import React from "react";
import { AlertTriangle, CheckCircle, Upload, Zap } from "lucide-react";
import { validatePayloadSize, formatFileSize } from "../utils/imageProcessing";

interface PayloadSizeIndicatorProps {
  images: Array<{ file?: File; url?: string }>;
  onOptimizeRequest?: () => void;
  className?: string;
}

export function PayloadSizeIndicator({
  images,
  onOptimizeRequest,
  className = "",
}: PayloadSizeIndicatorProps) {
  const validation = validatePayloadSize(images);
  const imagesWithFiles = images.filter((img) => img.file);

  if (imagesWithFiles.length === 0) {
    return null;
  }

  const { isValid, totalSizeMB, maxSizeMB } = validation;
  const percentage = (totalSizeMB / maxSizeMB) * 100;

  const getStatusColor = () => {
    if (percentage > 90) return "text-red-400";
    if (percentage > 70) return "text-yellow-400";
    return "text-green-400";
  };

  const getStatusIcon = () => {
    if (percentage > 90) return <AlertTriangle size={16} />;
    if (percentage > 70) return <AlertTriangle size={16} />;
    return <CheckCircle size={16} />;
  };

  const getBarColor = () => {
    if (percentage > 90) return "bg-red-500";
    if (percentage > 70) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <div
      className={`bg-gray-800 rounded-lg p-4 border border-gray-700 ${className}`}
    >
      <div className="flex items-center gap-2 mb-2">
        <Upload size={16} className="text-gray-400" />
        <span className="text-sm font-medium text-white">Payload Size</span>
        <div className={`flex items-center gap-1 ${getStatusColor()}`}>
          {getStatusIcon()}
          <span className="text-xs">
            {formatFileSize(validation.totalSize)} / {maxSizeMB}MB
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-2">
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${getBarColor()}`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      </div>

      {/* Status message */}
      <div className="text-xs text-gray-400">
        {isValid ? (
          <span className="text-green-400">
            ✓ Payload size is within limits ({percentage.toFixed(1)}% used)
          </span>
        ) : (
          <div className="flex items-center justify-between">
            <span className="text-red-400">
              ⚠ Payload too large! Reduce image sizes or remove images.
            </span>
            {onOptimizeRequest && (
              <button
                onClick={onOptimizeRequest}
                className="ml-2 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors flex items-center gap-1"
              >
                <Zap size={12} />
                Auto-Optimize
              </button>
            )}
          </div>
        )}
      </div>

      {/* Additional info */}
      {imagesWithFiles.length > 0 && (
        <div className="text-xs text-gray-500 mt-1">
          {imagesWithFiles.length} image
          {imagesWithFiles.length !== 1 ? "s" : ""} • Avg:{" "}
          {formatFileSize(validation.totalSize / imagesWithFiles.length)} per
          image
        </div>
      )}
    </div>
  );
}

export default PayloadSizeIndicator;
