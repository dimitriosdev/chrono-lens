/**
 * Album Page Header
 *
 * Reusable header component for album create/edit pages.
 * Provides consistent UI for title input, back navigation, and save action.
 */
"use client";

import React from "react";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

export interface AlbumPageHeaderProps {
  /** Album title value */
  title: string;
  /** Title change handler */
  onTitleChange: (title: string) => void;
  /** Back navigation handler */
  onBack: () => void;
  /** Save action handler */
  onSave: () => void;
  /** Whether save is currently in progress */
  isSaving: boolean;
  /** Whether form can be saved (validation passed) */
  canSave: boolean;
  /** Placeholder text for title input */
  titlePlaceholder?: string;
}

/**
 * Header component for album editing pages
 *
 * Features:
 * - Back navigation button
 * - Inline title editing
 * - Save button with loading state
 */
export function AlbumPageHeader({
  title,
  onTitleChange,
  onBack,
  onSave,
  isSaving,
  canSave,
  titlePlaceholder = "Album title...",
}: AlbumPageHeaderProps) {
  return (
    <div className="flex items-center gap-3 border-b border-gray-200 bg-white px-3 py-2 sm:px-4">
      <button
        onClick={onBack}
        className="rounded-full p-1.5 text-gray-600 hover:bg-gray-100"
        aria-label="Go back"
      >
        <ArrowLeftIcon className="h-5 w-5" />
      </button>
      <div className="min-w-0 flex-1">
        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder={titlePlaceholder}
          className="w-full border-none bg-transparent text-lg font-semibold text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-0"
          aria-label="Album title"
        />
      </div>
      <button
        onClick={onSave}
        disabled={!canSave || isSaving}
        className={`rounded-lg px-4 py-1.5 text-sm font-medium text-white transition-colors ${
          canSave && !isSaving
            ? "bg-blue-600 hover:bg-blue-700"
            : "cursor-not-allowed bg-gray-300"
        }`}
      >
        {isSaving ? "..." : "Save"}
      </button>
    </div>
  );
}

/**
 * Title Validation Message
 *
 * Shows validation feedback for album title
 */
export function TitleValidationMessage({
  title,
  minLength = 3,
}: {
  title: string;
  minLength?: number;
}) {
  if (title.length === 0 || title.length >= minLength) {
    return null;
  }

  return (
    <div className="bg-amber-50 px-4 py-1.5 text-center text-xs text-amber-700">
      Title must be at least {minLength} characters
    </div>
  );
}
