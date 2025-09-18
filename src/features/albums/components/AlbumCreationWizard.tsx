"use client";
import React, { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  SparklesIcon,
  PhotoIcon,
  PaintBrushIcon,
  CogIcon,
  EyeIcon,
  DocumentCheckIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { helpers } from "@/shared/constants/designSystem";
import {
  InteractiveCard,
  LoadingButton,
  Breadcrumb,
} from "@/shared/components";

export interface WizardStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  component: React.ComponentType<Record<string, unknown>>;
  validation?: () => boolean;
  optional?: boolean;
  estimatedTime?: string;
}

interface AlbumCreationWizardProps {
  steps: WizardStep[];
  currentStep: number;
  onStepChange: (step: number) => void;
  onNext: () => void;
  onPrev: () => void;
  onSkipStep?: () => void;
  onStartOver?: () => void;
  onSave: () => Promise<void>;
  loading?: boolean;
  formData: unknown;
  mode: "create" | "edit";
  className?: string;
}

export const AlbumCreationWizard: React.FC<AlbumCreationWizardProps> = ({
  steps,
  currentStep,
  onStepChange,
  onNext,
  onPrev,
  onSkipStep,
  onStartOver,
  onSave,
  loading = false,
  formData,
  mode,
  className,
}) => {
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [saveError, setSaveError] = useState<string | null>(null);

  const current = steps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;
  const canGoNext = current?.validation ? current.validation() : true;
  const progress = ((currentStep + 1) / steps.length) * 100;

  const formDataRef = useRef(formData);
  formDataRef.current = formData;

  const handleStepComplete = useCallback((stepIndex: number) => {
    setCompletedSteps((prev) => new Set([...prev, stepIndex]));
  }, []);

  const handleSave = useCallback(async () => {
    setSaveError(null);
    try {
      await onSave();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to save album";
      setSaveError(errorMessage);
      console.error("Save error:", error);
    }
  }, [onSave]);

  const handleNext = useCallback(() => {
    if (canGoNext) {
      handleStepComplete(currentStep);
      onNext();
    }
  }, [canGoNext, currentStep, onNext, handleStepComplete]);

  const handleStepClick = useCallback(
    (stepIndex: number) => {
      if (completedSteps.has(stepIndex) || stepIndex <= currentStep + 1) {
        onStepChange(stepIndex);
      }
    },
    [completedSteps, currentStep, onStepChange]
  );

  const breadcrumbItems = [
    { label: "Albums", href: "/albums" },
    {
      label: mode === "create" ? "Create New Album" : "Edit Album",
      href: "#",
    },
    { label: current?.title || "Step", href: "#" },
  ];

  return (
    <div
      className={helpers.cn(
        "min-h-screen bg-neutral-50 dark:bg-neutral-900",
        className
      )}
    >
      <div className="bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Breadcrumb items={breadcrumbItems} className="mb-3" />
              <div className="flex items-center space-x-4">
                <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                  {mode === "create" ? "Create New Album" : "Edit Album"}
                </h1>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-neutral-600 dark:text-neutral-400 mb-2">
              <span>
                Step {currentStep + 1} of {steps.length}
              </span>
              <span>{Math.round(progress)}% complete</span>
            </div>
            <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
              <motion.div
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <InteractiveCard variant="elevated" className="overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-4">
            <div className="lg:col-span-1 bg-neutral-50 dark:bg-neutral-800/50 p-6 border-b lg:border-b-0 lg:border-r border-neutral-200 dark:border-neutral-700">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                    Progress
                  </h3>
                  <span className="text-xs text-neutral-500 dark:text-neutral-400">
                    {currentStep + 1}/{steps.length}
                  </span>
                </div>

                <div className="space-y-2">
                  {steps.map((step, index) => {
                    const isCompleted = completedSteps.has(index);
                    const isCurrent = index === currentStep;
                    const isAccessible =
                      completedSteps.has(index) || index <= currentStep + 1;

                    return (
                      <button
                        key={step.id}
                        onClick={() => handleStepClick(index)}
                        disabled={!isAccessible}
                        className={helpers.cn(
                          "w-full flex items-center space-x-3 p-2 rounded-lg text-left transition-all duration-200",
                          isCurrent &&
                            "bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700",
                          isCompleted &&
                            !isCurrent &&
                            "bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-700",
                          !isCurrent &&
                            !isCompleted &&
                            isAccessible &&
                            "hover:bg-neutral-100 dark:hover:bg-neutral-700/50 border border-transparent",
                          !isAccessible &&
                            "opacity-50 cursor-not-allowed border border-transparent"
                        )}
                      >
                        <div
                          className={helpers.cn(
                            "flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium",
                            isCurrent && "bg-blue-500 text-white",
                            isCompleted &&
                              !isCurrent &&
                              "bg-green-500 text-white",
                            !isCurrent &&
                              !isCompleted &&
                              "bg-neutral-300 dark:bg-neutral-600 text-neutral-600 dark:text-neutral-300"
                          )}
                        >
                          {isCompleted ? (
                            <CheckIcon className="w-3 h-3" />
                          ) : (
                            index + 1
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className={helpers.cn(
                              "text-xs font-medium truncate",
                              isCurrent && "text-blue-800 dark:text-blue-200",
                              isCompleted &&
                                !isCurrent &&
                                "text-green-800 dark:text-green-200",
                              !isCurrent &&
                                !isCompleted &&
                                "text-neutral-700 dark:text-neutral-200"
                            )}
                          >
                            {step.title}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="border-t border-neutral-200 dark:border-neutral-600 pt-4">
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <LoadingButton
                      variant="secondary"
                      size="sm"
                      onClick={onPrev}
                      disabled={isFirstStep}
                      icon={<ChevronLeftIcon className="w-3 h-3" />}
                      className="flex-1 text-xs"
                    >
                      Back
                    </LoadingButton>

                    {!isLastStep ? (
                      <LoadingButton
                        variant="primary"
                        size="sm"
                        onClick={handleNext}
                        disabled={!canGoNext}
                        icon={<ChevronRightIcon className="w-3 h-3" />}
                        className="flex-1 text-xs"
                      >
                        Next
                      </LoadingButton>
                    ) : (
                      <LoadingButton
                        variant="primary"
                        size="sm"
                        onClick={handleSave}
                        loading={loading}
                        icon={<DocumentCheckIcon className="w-3 h-3" />}
                        className="flex-1 text-xs"
                      >
                        Save
                      </LoadingButton>
                    )}
                  </div>

                  <div className="text-center space-y-1">
                    {current?.optional && onSkipStep && (
                      <button
                        onClick={onSkipStep}
                        className="block w-full text-xs text-neutral-500 dark:text-neutral-400 hover:text-blue-600 dark:hover:text-blue-400 underline"
                      >
                        Skip step
                      </button>
                    )}

                    {!isFirstStep && onStartOver && (
                      <button
                        onClick={onStartOver}
                        className="block w-full text-xs text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 underline"
                        title="Reset and start over"
                      >
                        Start over
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-3">
              <div className="border-b border-neutral-200 dark:border-neutral-700 p-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                    <span className="text-blue-600 dark:text-blue-400">
                      {current?.icon}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
                      {current?.title}
                    </h2>
                    <p className="text-neutral-600 dark:text-neutral-400">
                      {current?.description}
                    </p>
                    {current?.optional && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 mt-2">
                        Optional
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-6 flex-1 min-h-[500px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="h-full"
                  >
                    {current && <current.component />}
                  </motion.div>
                </AnimatePresence>
              </div>

              {saveError && (
                <div className="border-t border-neutral-200 dark:border-neutral-700 p-6">
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                          Save Failed
                        </h3>
                        <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                          {saveError}
                        </div>
                      </div>
                      <div className="ml-auto pl-3">
                        <button
                          type="button"
                          onClick={() => setSaveError(null)}
                          className="inline-flex bg-red-50 dark:bg-red-900/20 rounded-md p-1.5 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/40"
                        >
                          <span className="sr-only">Dismiss</span>
                          <svg
                            className="h-3 w-3"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </InteractiveCard>
      </div>
    </div>
  );
};

export const getAlbumWizardSteps = (): WizardStep[] => [
  {
    id: "basics",
    title: "Basic Information",
    description: "Start with the essential details for your album",
    icon: <SparklesIcon className="w-6 h-6" />,
    component: () => null,
    estimatedTime: "1 min",
    validation: () => true,
  },
  {
    id: "images",
    title: "Add Images",
    description: "Upload and organize your photos",
    icon: <PhotoIcon className="w-6 h-6" />,
    component: () => null,
    estimatedTime: "3-5 min",
    validation: () => true,
  },
  {
    id: "layout",
    title: "Choose Layout",
    description: "Select how your images will be displayed",
    icon: <PaintBrushIcon className="w-6 h-6" />,
    component: () => null,
    estimatedTime: "2 min",
    validation: () => true,
  },
  {
    id: "customize",
    title: "Customize",
    description: "Fine-tune timing, effects, and styling",
    icon: <CogIcon className="w-6 h-6" />,
    component: () => null,
    estimatedTime: "2-3 min",
    optional: true,
    validation: () => true,
  },
  {
    id: "preview",
    title: "Preview & Finalize",
    description: "Review your album before saving",
    icon: <EyeIcon className="w-6 h-6" />,
    component: () => null,
    estimatedTime: "1 min",
    validation: () => true,
  },
];

export default AlbumCreationWizard;
