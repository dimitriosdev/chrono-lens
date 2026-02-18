"use client";

import React, { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/solid";

interface TagsInputProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  maxTags?: number;
  placeholder?: string;
}

const SUGGESTED_TAGS = [
  "Family",
  "Travel",
  "Nature",
  "Friends",
  "Celebration",
  "2017",
  "2018",
  "2019",
  "2020",
  "2021",
  "2022",
  "2023",
  "2024",
  "2025",
  "2026",
  "Summer",
  "Winter",
  "Color",
  "Memories",
  "Wedding",
  "Vacation",
];

export const TagsInput: React.FC<TagsInputProps> = ({
  tags,
  onTagsChange,
  maxTags = 10,
  placeholder = "Add tags (comma-separated or click suggestions)",
}) => {
  const [inputValue, setInputValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setShowSuggestions(e.target.value.length > 0);
  };

  const addTag = (tag: string) => {
    const cleanTag = tag.trim();
    if (
      cleanTag &&
      !tags.includes(cleanTag) &&
      tags.length < maxTags &&
      cleanTag.length > 0 &&
      cleanTag.length <= 30
    ) {
      onTagsChange([...tags, cleanTag]);
      setInputValue("");
      setShowSuggestions(false);
    }
  };

  const removeTag = (tagToRemove: string) => {
    onTagsChange(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === "Backspace" && inputValue === "" && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  const handleInputBlur = () => {
    if (inputValue.trim()) {
      addTag(inputValue);
    }
    setShowSuggestions(false);
  };

  const filteredSuggestions = SUGGESTED_TAGS.filter(
    (tag) =>
      !tags.includes(tag) &&
      tag.toLowerCase().includes(inputValue.toLowerCase()),
  ).slice(0, 5);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">
          Tags
          <span className="text-xs text-gray-500 ml-2">
            ({tags.length}/{maxTags})
          </span>
        </label>
        <span className="text-xs text-gray-500">Optional</span>
      </div>

      {/* Tags Display */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full text-sm font-medium"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="ml-1 hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                aria-label={`Remove ${tag}`}
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Input Field */}
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onBlur={handleInputBlur}
          onFocus={() => inputValue && setShowSuggestions(true)}
          placeholder={placeholder}
          disabled={tags.length >= maxTags}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
        />

        {/* Suggestions Dropdown */}
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
            {filteredSuggestions.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => addTag(tag)}
                className="w-full text-left px-3 py-2 hover:bg-gray-100 transition-colors text-sm"
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      <p className="text-xs text-gray-500">
        Press Enter or comma to add a tag. Click suggestions or type your own.
      </p>
    </div>
  );
};

export default TagsInput;
