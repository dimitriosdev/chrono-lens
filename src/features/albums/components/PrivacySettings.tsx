/**
 * Privacy Settings Component
 *
 * TODO: Full implementation in progress
 * For now, use the WizardBasicInfo component which already has privacy selection
 *
 * Full implementation includes:
 * - Visual privacy selection UI
 * - Share link management
 * - Token regeneration
 * - Copy to clipboard
 *
 * See docs/features/PRIVACY_IMPLEMENTATION.md for complete specification
 */

"use client";

import React from "react";
import { Album } from "@/shared/types/album";

interface PrivacySettingsProps {
  album: Album;
  className?: string;
}

export function PrivacySettings({
  album,
  className = "",
}: PrivacySettingsProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-2">
          Privacy Settings
        </h3>
        <p className="text-white/70 mb-4">
          Current Privacy:{" "}
          <span className="font-semibold text-white">{album.privacy}</span>
        </p>
        <p className="text-sm text-white/60">
          Full privacy management UI coming soon. For now, edit privacy when
          creating/editing albums.
        </p>
      </div>
    </div>
  );
}

export default PrivacySettings;
