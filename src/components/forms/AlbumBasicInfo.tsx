/**
 * Album Basic Info Form Section
 * Handles title and description input with validation
 */
"use client";

import React from "react";
import { FormSection, FormField } from "@/components/FormComponents";

interface AlbumBasicInfoProps {
  title: string;
  onTitleChange: (title: string) => void;
  titleError?: string;
  className?: string;
}

export function AlbumBasicInfo({
  title,
  onTitleChange,
  titleError,
  className = "",
}: AlbumBasicInfoProps) {
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    onTitleChange(newTitle);
  };

  return (
    <FormSection
      title="Album Details"
      description="Set the basic information for your album"
      className={className}
    >
      <FormField
        label="Album Title"
        required
        error={titleError}
        help="Choose a descriptive name for your album"
      >
        <input
          type="text"
          value={title}
          onChange={handleTitleChange}
          placeholder="Enter album title..."
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          maxLength={100}
        />
      </FormField>
    </FormSection>
  );
}
