/**
 * Simple Album Privacy Component
 * Minimal implementation for album privacy settings
 */
"use client";

import React from "react";
import { AlbumPrivacy } from "@/shared/types/album";
import { GlobeAltIcon, LockClosedIcon } from "@heroicons/react/24/outline";

interface AlbumPrivacySettingsProps {
  privacy: AlbumPrivacy;
  onPrivacyChange: (privacy: AlbumPrivacy) => void;
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
];

export function AlbumPrivacySettings({
  privacy,
  onPrivacyChange,
  className = "",
}: AlbumPrivacySettingsProps) {
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
    </div>
  );
}
