/**
 * Simple Album Privacy Component
 * Minimal implementation for album privacy settings
 */
"use client";

import React from "react";
import { AlbumPrivacy } from "@/shared/types/album";
import {
  GlobeAltIcon,
  LockClosedIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";

interface AlbumPrivacySettingsProps {
  privacy: AlbumPrivacy;
  onPrivacyChange: (privacy: AlbumPrivacy) => void;
  shareToken?: string;
  onGenerateShareLink?: () => void;
  className?: string;
}

const PRIVACY_OPTIONS = [
  {
    value: "public" as const,
    label: "Public",
    description: "Anyone can view this album",
    icon: <GlobeAltIcon className="w-5 h-5" />,
    color: "text-green-600 dark:text-green-400",
  },
  {
    value: "private" as const,
    label: "Private",
    description: "Only you can view this album",
    icon: <LockClosedIcon className="w-5 h-5" />,
    color: "text-red-600 dark:text-red-400",
  },
  {
    value: "shared" as const,
    label: "Shared",
    description: "Anyone with the link can view",
    icon: <UserGroupIcon className="w-5 h-5" />,
    color: "text-blue-600 dark:text-blue-400",
  },
];

export function AlbumPrivacySettings({
  privacy,
  onPrivacyChange,
  shareToken,
  onGenerateShareLink,
  className = "",
}: AlbumPrivacySettingsProps) {
  const generateShareUrl = () => {
    if (typeof window !== "undefined" && shareToken) {
      const baseUrl = window.location.origin;
      return `${baseUrl}/albums/share/${shareToken}`;
    }
    return "";
  };

  const copyShareLink = async () => {
    const shareUrl = generateShareUrl();
    if (shareUrl) {
      try {
        await navigator.clipboard.writeText(shareUrl);
        alert("Share link copied to clipboard!");
      } catch (err) {
        console.error("Failed to copy:", err);
        // Fallback: show the URL in a prompt
        prompt("Copy this share link:", shareUrl);
      }
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <label className="block text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-3">
          Privacy Settings
        </label>
        <div className="grid grid-cols-1 gap-3">
          {PRIVACY_OPTIONS.map((option) => (
            <div
              key={option.value}
              className={`
                p-4 border-2 rounded-lg cursor-pointer transition-all duration-200
                ${
                  privacy === option.value
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600"
                }
              `}
              onClick={() => onPrivacyChange(option.value)}
            >
              <div className="flex items-center space-x-3">
                <span className={option.color}>{option.icon}</span>
                <div>
                  <h4 className="font-medium text-neutral-900 dark:text-neutral-100">
                    {option.label}
                  </h4>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    {option.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Share Link Section for Shared Albums */}
      {privacy === "shared" && (
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-2">
            Share Link
          </h4>
          {shareToken ? (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={generateShareUrl()}
                  readOnly
                  className="flex-1 px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded bg-neutral-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
                />
                <button
                  onClick={copyShareLink}
                  className="px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Copy
                </button>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Anyone with this link can view your album
              </p>
            </div>
          ) : (
            <div>
              <button
                onClick={onGenerateShareLink}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Generate Share Link
              </button>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                Create a link to share this album with others
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
