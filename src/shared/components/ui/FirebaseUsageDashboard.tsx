"use client";

import React, { useState, useEffect } from "react";
import { firebaseUsageMonitor } from "@/shared/lib/firebaseUsageMonitor";
import { helpers } from "@/shared/constants/design";

interface UsageDashboardProps {
  /** Show detailed breakdown */
  detailed?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Firebase Usage Dashboard Component
 * Shows current usage against Firebase free tier limits
 */
export const FirebaseUsageDashboard: React.FC<UsageDashboardProps> = ({
  detailed = false,
  className,
}) => {
  const [usage, setUsage] = useState(firebaseUsageMonitor.getUsageSummary());
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Update usage every 30 seconds
    const interval = setInterval(() => {
      setUsage(firebaseUsageMonitor.getUsageSummary());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Only show in development or if usage is high
  useEffect(() => {
    const shouldShow =
      process.env.NODE_ENV === "development" ||
      usage.reads.percentage > 50 ||
      usage.writes.percentage > 50 ||
      usage.storage.percentage > 50;

    setIsVisible(shouldShow);
  }, [usage]);

  if (!isVisible) return null;

  const formatTimeRemaining = (ms: number): string => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getUsageColor = (percentage: number): string => {
    if (percentage >= 90) return "text-red-400";
    if (percentage >= 80) return "text-yellow-400";
    if (percentage >= 60) return "text-orange-400";
    return "text-green-400";
  };

  const getProgressColor = (percentage: number): string => {
    if (percentage >= 90) return "bg-red-500";
    if (percentage >= 80) return "bg-yellow-500";
    if (percentage >= 60) return "bg-orange-500";
    return "bg-green-500";
  };

  const UsageBar: React.FC<{
    label: string;
    used: number;
    limit: number;
    percentage: number;
    suffix?: string;
  }> = ({ label, used, limit, percentage, suffix = "" }) => (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-gray-300">{label}</span>
        <span className={getUsageColor(percentage)}>
          {used.toLocaleString()}
          {suffix} / {limit.toLocaleString()}
          {suffix} ({percentage.toFixed(1)}%)
        </span>
      </div>
      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
        <div
          className={helpers.cn(
            "h-full transition-all duration-300",
            getProgressColor(percentage)
          )}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );

  return (
    <div
      className={helpers.cn(
        "bg-gray-800 border border-gray-700 rounded-lg p-4 shadow-lg",
        "text-sm space-y-3",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-white">Firebase Usage</h3>
        <div className="text-xs text-gray-400">
          Resets in {formatTimeRemaining(usage.timeUntilReset)}
        </div>
      </div>

      <div className="space-y-3">
        <UsageBar
          label="Daily Reads"
          used={usage.reads.used}
          limit={usage.reads.limit}
          percentage={usage.reads.percentage}
        />

        <UsageBar
          label="Daily Writes"
          used={usage.writes.used}
          limit={usage.writes.limit}
          percentage={usage.writes.percentage}
        />

        <UsageBar
          label="Storage"
          used={Math.round(usage.storage.used / (1024 * 1024))}
          limit={Math.round(usage.storage.limit / (1024 * 1024))}
          percentage={usage.storage.percentage}
          suffix=" MB"
        />
      </div>

      {detailed && (
        <div className="mt-4 pt-3 border-t border-gray-700">
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
            <div>Storage: {usage.storage.usedFormatted}</div>
            <div>Limit: {usage.storage.limitFormatted}</div>
          </div>
        </div>
      )}

      {process.env.NODE_ENV === "development" && (
        <div className="mt-3 pt-3 border-t border-gray-700">
          <button
            onClick={() => {
              firebaseUsageMonitor.resetUsageStats();
              setUsage(firebaseUsageMonitor.getUsageSummary());
            }}
            className="text-xs text-blue-400 hover:text-blue-300 underline"
          >
            Reset Usage Stats (Dev Only)
          </button>
        </div>
      )}
    </div>
  );
};

export default FirebaseUsageDashboard;
