"use client";

import React from "react";
import {
  clearRateLimit,
  checkRateLimit,
  forceResetRateLimits,
} from "@/shared/utils/security";

/**
 * Development utility component for managing rate limits.
 * Only shows in development mode.
 */
export function RateLimitManager() {
  const [userId, setUserId] = React.useState("");
  const [status, setStatus] = React.useState("");

  // Only show in development
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  const handleClearAll = () => {
    clearRateLimit();
    setStatus("All rate limits cleared");
    setTimeout(() => setStatus(""), 3000);
  };

  const handleForceReset = () => {
    forceResetRateLimits();
    setStatus("Force reset: All limits and cache cleared");
    setTimeout(() => setStatus(""), 3000);
  };

  const handleClearUser = () => {
    if (!userId.trim()) {
      setStatus("Please enter a user ID");
      setTimeout(() => setStatus(""), 3000);
      return;
    }
    clearRateLimit(userId.trim());
    setStatus(`Rate limit cleared for user: ${userId}`);
    setTimeout(() => setStatus(""), 3000);
  };

  const handleCheckUser = () => {
    if (!userId.trim()) {
      setStatus("Please enter a user ID");
      setTimeout(() => setStatus(""), 3000);
      return;
    }
    const canProceed = checkRateLimit(userId.trim(), 5, 60000);
    setStatus(
      `User ${userId} can ${canProceed ? "create" : "NOT create"} albums`
    );
    setTimeout(() => setStatus(""), 3000);
  };

  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 border border-gray-600 rounded-lg p-4 text-white text-sm max-w-sm z-50">
      <h3 className="font-semibold mb-2">Rate Limit Manager (Dev)</h3>

      <div className="space-y-2">
        <input
          type="text"
          placeholder="User ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-xs"
        />

        <div className="flex gap-1">
          <button
            onClick={handleCheckUser}
            className="flex-1 bg-blue-600 hover:bg-blue-700 rounded px-2 py-1 text-xs"
          >
            Check
          </button>
          <button
            onClick={handleClearUser}
            className="flex-1 bg-yellow-600 hover:bg-yellow-700 rounded px-2 py-1 text-xs"
          >
            Clear User
          </button>
        </div>

        <button
          onClick={handleClearAll}
          className="w-full bg-red-600 hover:bg-red-700 rounded px-2 py-1 text-xs"
        >
          Clear All Limits
        </button>

        <button
          onClick={handleForceReset}
          className="w-full bg-red-800 hover:bg-red-900 rounded px-2 py-1 text-xs font-bold"
        >
          🚨 Force Reset Everything
        </button>

        {status && (
          <div className="text-xs text-green-400 mt-2 break-words">
            {status}
          </div>
        )}
      </div>
    </div>
  );
}
