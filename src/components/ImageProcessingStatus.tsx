/**
 * Image Processing Status Component
 * Shows progress and results of image processing operations
 */
"use client";

import React from "react";
import { CheckCircle, FileImage, Loader } from "lucide-react";
import {
  ProcessedImage,
  formatFileSize,
  calculateCompressionRatio,
} from "@/utils/imageProcessing";

interface ImageProcessingStatusProps {
  isProcessing?: boolean;
  processedImages?: ProcessedImage[];
  currentFile?: string;
  progress?: { current: number; total: number };
  className?: string;
}

export function ImageProcessingStatus({
  isProcessing = false,
  processedImages = [],
  currentFile = "",
  progress,
  className = "",
}: ImageProcessingStatusProps) {
  if (!isProcessing && processedImages.length === 0) {
    return null;
  }

  const hasProcessedImages = processedImages.length > 0;
  const totalSavings = processedImages.reduce(
    (acc, img) => acc + (img.originalSize - img.processedSize),
    0
  );
  const conversions = processedImages.filter((img) => img.wasConverted).length;
  const optimizations = processedImages.filter(
    (img) => img.wasOptimized
  ).length;

  return (
    <div
      className={`bg-gray-800 rounded-lg p-4 border border-gray-700 ${className}`}
    >
      {isProcessing && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Loader className="animate-spin" size={16} />
            <span className="text-sm font-medium text-blue-400">
              Processing Images...
            </span>
          </div>

          {progress && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-400">
                <span>
                  Progress: {progress.current} of {progress.total}
                </span>
                <span>
                  {Math.round((progress.current / progress.total) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${(progress.current / progress.total) * 100}%`,
                  }}
                />
              </div>
              {currentFile && (
                <p className="text-xs text-gray-400 truncate">
                  Processing: {currentFile}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {hasProcessedImages && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle className="text-green-400" size={16} />
            <span className="text-sm font-medium text-green-400">
              Processing Complete
            </span>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
            {conversions > 0 && (
              <div className="bg-gray-700 rounded p-2">
                <div className="text-gray-400">HEIC Converted</div>
                <div className="font-medium text-white">
                  {conversions} files
                </div>
              </div>
            )}

            {optimizations > 0 && (
              <div className="bg-gray-700 rounded p-2">
                <div className="text-gray-400">Images Optimized</div>
                <div className="font-medium text-white">
                  {optimizations} files
                </div>
              </div>
            )}

            {totalSavings > 0 && (
              <div className="bg-gray-700 rounded p-2">
                <div className="text-gray-400">Storage Saved</div>
                <div className="font-medium text-green-400">
                  {formatFileSize(totalSavings)}
                </div>
              </div>
            )}
          </div>

          {/* Detailed Results */}
          <details className="group">
            <summary className="cursor-pointer text-sm text-blue-400 hover:text-blue-300 list-none">
              <span className="group-open:hidden">
                ▶ Show processing details
              </span>
              <span className="hidden group-open:inline">
                ▼ Hide processing details
              </span>
            </summary>

            <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
              {processedImages.map((img, index) => (
                <ImageProcessingResult key={index} processedImage={img} />
              ))}
            </div>
          </details>
        </div>
      )}
    </div>
  );
}

interface ImageProcessingResultProps {
  processedImage: ProcessedImage;
}

function ImageProcessingResult({ processedImage }: ImageProcessingResultProps) {
  const {
    file,
    originalSize,
    processedSize,
    wasOptimized,
    wasConverted,
    originalFormat,
    processedFormat,
  } = processedImage;

  const compressionRatio = calculateCompressionRatio(
    originalSize,
    processedSize
  );
  const hasChanges = wasOptimized || wasConverted;

  return (
    <div className="flex items-start gap-3 p-2 bg-gray-750 rounded border border-gray-600">
      <FileImage className="text-gray-400 mt-0.5" size={16} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-white truncate">
            {file.name}
          </span>
          {hasChanges && (
            <CheckCircle className="text-green-400 flex-shrink-0" size={12} />
          )}
        </div>

        <div className="space-y-1 text-xs text-gray-400">
          {wasConverted && (
            <div className="flex items-center gap-1">
              <span className="text-blue-400">Converted:</span>
              <span>
                {originalFormat} → {processedFormat}
              </span>
            </div>
          )}

          {wasOptimized && (
            <div className="flex items-center gap-1">
              <span className="text-green-400">Optimized:</span>
              <span>
                {formatFileSize(originalSize)} → {formatFileSize(processedSize)}
              </span>
              {compressionRatio > 0 && (
                <span className="text-green-400">(-{compressionRatio}%)</span>
              )}
            </div>
          )}

          {!hasChanges && (
            <div className="text-gray-500">No processing needed</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ImageProcessingStatus;
