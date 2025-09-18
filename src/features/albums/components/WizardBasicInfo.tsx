"use client";
import React, { useState, useCallback, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  InformationCircleIcon,
  GlobeAltIcon,
  LockClosedIcon,
  UserGroupIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { helpers } from "@/shared/constants/designSystem";
import { Tooltip } from "@/shared/components";
import { StableInput } from "./StableInput";

interface BasicInfoData {
  title: string;
  privacy: "public" | "private" | "shared";
  tags: string[];
  coverImageIndex?: number;
}

interface WizardBasicInfoProps {
  value: BasicInfoData;
  onChange: (data: BasicInfoData) => void;
  onValidationChange?: (isValid: boolean) => void;
  className?: string;
}

const PRIVACY_OPTIONS = [
  {
    value: "public" as const,
    label: "Public",
    description: "Anyone can view this album",
    icon: <GlobeAltIcon className="w-6 h-6" />,
    color: "text-green-400",
    selectedColor:
      "border-green-500 bg-gradient-to-br from-green-500/20 to-emerald-500/10 shadow-lg shadow-green-500/20",
    hoverColor: "hover:border-green-400",
    iconBg: "bg-green-500/30",
    iconBgHover: "group-hover:bg-green-500/20",
    textColor: "text-green-200",
    descColor: "text-green-100",
    features: [
      "Discoverable by anyone",
      "No login required",
      "Indexed by search",
    ],
  },
  {
    value: "private" as const,
    label: "Private",
    description: "Only you can view this album",
    icon: <LockClosedIcon className="w-6 h-6" />,
    color: "text-red-400",
    selectedColor:
      "border-red-500 bg-gradient-to-br from-red-500/20 to-pink-500/10 shadow-lg shadow-red-500/20",
    hoverColor: "hover:border-red-400",
    iconBg: "bg-red-500/30",
    iconBgHover: "group-hover:bg-red-500/20",
    textColor: "text-red-200",
    descColor: "text-red-100",
    features: ["Complete privacy", "Login required", "Personal access only"],
  },
  {
    value: "shared" as const,
    label: "Shared",
    description: "Specific people you choose can view",
    icon: <UserGroupIcon className="w-6 h-6" />,
    color: "text-blue-400",
    selectedColor:
      "border-blue-500 bg-gradient-to-br from-blue-500/20 to-purple-500/10 shadow-lg shadow-blue-500/20",
    hoverColor: "hover:border-blue-400",
    iconBg: "bg-blue-500/30",
    iconBgHover: "group-hover:bg-blue-500/20",
    textColor: "text-blue-200",
    descColor: "text-blue-100",
    features: [
      "Share with specific people",
      "Link-based access",
      "Controlled sharing",
    ],
  },
];

const SUGGESTED_TAGS = [
  "vacation",
  "family",
  "friends",
  "celebration",
  "wedding",
  "birthday",
  "nature",
  "landscape",
  "city",
  "food",
  "art",
  "sports",
  "pets",
  "work",
  "memories",
  "special",
  "fun",
  "beautiful",
  "adventure",
  "love",
];

export const WizardBasicInfo: React.FC<WizardBasicInfoProps> = ({
  value,
  onChange,
  onValidationChange,
  className,
}) => {
  const [tagInput, setTagInput] = useState("");
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);

  // Use ref for validation callback to prevent infinite loops
  const onValidationChangeRef = useRef(onValidationChange);
  onValidationChangeRef.current = onValidationChange;

  // Use ref for current value to prevent handleFieldChange from recreating
  const valueRef = useRef(value);
  valueRef.current = value;

  // Run validation on mount and when key values change
  useEffect(() => {
    const isValid =
      value.title.trim().length >= 3 &&
      value.title.length <= 60 &&
      value.tags.length <= 10;
    onValidationChangeRef.current?.(isValid);
  }, [value.title, value.tags.length]); // Direct dependencies

  const handleFieldChange = useCallback(
    (field: keyof BasicInfoData, fieldValue: unknown) => {
      onChange({ ...valueRef.current, [field]: fieldValue });
    },
    [onChange] // Now safe - valueRef.current doesn't trigger re-renders
  );

  const handlePrivacyChange = useCallback(
    (privacy: BasicInfoData["privacy"]) => {
      handleFieldChange("privacy", privacy);
    },
    [handleFieldChange]
  );

  const handleTagAdd = useCallback(
    (tag: string) => {
      const trimmedTag = tag.trim().toLowerCase();
      const currentTags = valueRef.current.tags;
      if (
        trimmedTag &&
        !currentTags.includes(trimmedTag) &&
        currentTags.length < 10
      ) {
        handleFieldChange("tags", [...currentTags, trimmedTag]);
      }
      setTagInput("");
      setShowTagSuggestions(false);
    },
    [handleFieldChange]
  );

  const handleTagRemove = useCallback(
    (tagToRemove: string) => {
      const currentTags = valueRef.current.tags;
      handleFieldChange(
        "tags",
        currentTags.filter((tag) => tag !== tagToRemove)
      );
    },
    [handleFieldChange]
  );

  const handleTagInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setTagInput(e.target.value);
    },
    []
  );

  const handleTagInputKeyPress = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleTagAdd(tagInput);
      }
    },
    [handleTagAdd, tagInput]
  );

  const handleTagInputFocus = useCallback(() => {
    setShowTagSuggestions(true);
  }, []);

  const handleTagInputBlur = useCallback(() => {
    setTimeout(() => setShowTagSuggestions(false), 200);
  }, []);

  const filteredTagSuggestions = SUGGESTED_TAGS.filter(
    (tag) =>
      tag.toLowerCase().includes(tagInput.toLowerCase()) &&
      !value.tags.includes(tag)
  ).slice(0, 6);

  return (
    <div className={helpers.cn("max-w-2xl mx-auto space-y-8", className)}>
      {/* Welcome Message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      ></motion.div>

      {/* Album Title */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-2">
            Album Title *
            <Tooltip content="Give your album a memorable name that captures its essence">
              <InformationCircleIcon className="w-4 h-4 ml-1 inline text-neutral-400" />
            </Tooltip>
          </label>
          <StableInput
            initialValue={value.title}
            onChange={(newTitle) => handleFieldChange("title", newTitle)}
            placeholder="Enter a title for your album..."
            maxLength={60}
            className={helpers.cn(
              "w-full px-4 py-3 rounded-lg border text-neutral-900 dark:text-neutral-100 bg-white dark:bg-neutral-800 transition-colors",
              "border-neutral-300 dark:border-neutral-600 focus:border-blue-500 focus:ring-blue-500"
            )}
          />
          <div className="flex items-center justify-between mt-2">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {value.title.length}/60 characters
            </p>
          </div>
        </div>
      </div>

      {/* Privacy Settings */}
      <div>
        <label className="block text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-4">
          Privacy
          <Tooltip content="Choose who can view your album">
            <InformationCircleIcon className="w-4 h-4 ml-1 inline text-neutral-400" />
          </Tooltip>
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PRIVACY_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => handlePrivacyChange(option.value)}
              className={`group relative p-6 rounded-xl border-2 text-left transition-all duration-300 transform hover:scale-[1.02] ${
                value.privacy === option.value
                  ? option.selectedColor
                  : `border-gray-600 bg-gradient-to-br from-gray-700 to-gray-800 ${option.hoverColor} hover:shadow-lg`
              }`}
            >
              {/* Selected indicator */}
              {value.privacy === option.value && (
                <div className="absolute top-3 right-3">
                  <CheckCircleIcon className={`w-6 h-6 ${option.color}`} />
                </div>
              )}

              {/* Icon */}
              <div className="flex items-center mb-4">
                <div
                  className={`p-3 rounded-lg mr-4 ${
                    value.privacy === option.value
                      ? option.iconBg
                      : `bg-gray-600 ${option.iconBgHover}`
                  }`}
                >
                  <span
                    className={
                      value.privacy === option.value
                        ? option.color
                        : "text-gray-300"
                    }
                  >
                    {option.icon}
                  </span>
                </div>
                <div>
                  <h4
                    className={`font-bold text-lg ${
                      value.privacy === option.value
                        ? option.textColor
                        : "text-white"
                    }`}
                  >
                    {option.label}
                  </h4>
                  <div className="text-xs text-gray-400 mt-1">
                    {option.value === "shared"
                      ? "Link-based access"
                      : option.value === "private"
                      ? "Your eyes only"
                      : "Open access"}
                  </div>
                </div>
              </div>

              {/* Description */}
              <p
                className={`text-sm leading-relaxed ${
                  value.privacy === option.value
                    ? option.descColor
                    : "text-gray-300"
                }`}
              >
                {option.description}
              </p>

              {/* Features */}
              <div className="mt-4 space-y-1">
                {option.features.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center text-xs text-gray-400"
                  >
                    <div className="w-1.5 h-1.5 bg-current rounded-full mr-2"></div>
                    {feature}
                  </div>
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-2">
          Tags
          <span className="text-neutral-500 dark:text-neutral-400 font-normal ml-1">
            (optional)
          </span>
          <Tooltip content="Tags help you find and organize your albums later">
            <InformationCircleIcon className="w-4 h-4 ml-1 inline text-neutral-400" />
          </Tooltip>
        </label>

        {/* Existing Tags */}
        {value.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {value.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full text-sm"
              >
                {tag}
                <button
                  onClick={() => handleTagRemove(tag)}
                  className="ml-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Tag Input */}
        <div className="relative">
          <input
            type="text"
            value={tagInput}
            onChange={handleTagInputChange}
            onFocus={handleTagInputFocus}
            onBlur={handleTagInputBlur}
            onKeyPress={handleTagInputKeyPress}
            placeholder="Add tags to help organize your album..."
            className="w-full px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:border-blue-500 focus:ring-blue-500"
            disabled={value.tags.length >= 10}
          />

          {/* Tag Suggestions */}
          {showTagSuggestions &&
            tagInput &&
            filteredTagSuggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg z-10"
              >
                {filteredTagSuggestions.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleTagAdd(tag)}
                    className="w-full px-4 py-2 text-left hover:bg-neutral-50 dark:hover:bg-neutral-700 first:rounded-t-lg last:rounded-b-lg"
                  >
                    {tag}
                  </button>
                ))}
              </motion.div>
            )}
        </div>

        <div className="flex justify-between mt-2">
          <span />
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {value.tags.length}/10 tags
          </p>
        </div>
      </div>
    </div>
  );
};

export default WizardBasicInfo;
