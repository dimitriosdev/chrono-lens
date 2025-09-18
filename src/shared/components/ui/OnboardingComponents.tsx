"use client";
import React from "react";
import Link from "next/link";
import { PlusIcon, PhotoIcon, FolderIcon } from "@heroicons/react/24/outline";
import { SparklesIcon, ArrowRightIcon } from "@heroicons/react/24/solid";
import { helpers } from "@/shared/constants/designSystem";
import { LoadingButton, InteractiveCard } from "@/shared/components";

// Empty State Component
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
    loading?: boolean;
  };
  className?: string;
  variant?: "default" | "illustration";
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className,
}) => {
  const defaultIcon = <FolderIcon className="h-16 w-16 text-neutral-400" />;

  return (
    <div className={helpers.cn("text-center py-12 px-6", className)}>
      <div className="mx-auto max-w-md">
        {/* Icon */}
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800 mb-6">
          {icon || defaultIcon}
        </div>

        {/* Content */}
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
          {title}
        </h3>
        <p className="text-neutral-600 dark:text-neutral-400 text-sm leading-relaxed mb-6">
          {description}
        </p>

        {/* Action */}
        {action && (
          <div className="flex justify-center">
            {action.href ? (
              <Link
                href={action.href}
                className={helpers.cn(
                  "inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg",
                  "bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                  "transition-all duration-200 shadow-sm hover:shadow-md"
                )}
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                {action.label}
              </Link>
            ) : (
              <LoadingButton
                onClick={action.onClick}
                loading={action.loading}
                variant="primary"
                icon={<PlusIcon className="h-5 w-5" />}
              >
                {action.label}
              </LoadingButton>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Welcome Tour Component
interface WelcomeTourProps {
  onComplete: () => void;
  onSkip: () => void;
}

export const WelcomeTour: React.FC<WelcomeTourProps> = ({
  onComplete,
  onSkip,
}) => {
  const [currentStep, setCurrentStep] = React.useState(0);

  const steps = [
    {
      title: "Welcome to Chrono Lens",
      description:
        "Your personal photo memory companion. Let's get you started with organizing your favorite moments.",
      icon: <SparklesIcon className="h-8 w-8 text-blue-500" />,
    },
    {
      title: "Create Your First Album",
      description:
        "Albums help you organize photos by themes, events, or time periods. Start by creating your first album.",
      icon: <FolderIcon className="h-8 w-8 text-green-500" />,
    },
    {
      title: "Add Your Photos",
      description:
        "Upload photos to your albums and let Chrono Lens help you create beautiful memories.",
      icon: <PhotoIcon className="h-8 w-8 text-purple-500" />,
    },
  ];

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <InteractiveCard
        variant="elevated"
        className="max-w-md w-full bg-white dark:bg-neutral-800 p-8"
      >
        {/* Progress indicator */}
        <div className="flex space-x-2 mb-6">
          {steps.map((_, index) => (
            <div
              key={index}
              className={helpers.cn(
                "h-2 flex-1 rounded-full transition-colors duration-300",
                index <= currentStep
                  ? "bg-blue-500"
                  : "bg-neutral-200 dark:bg-neutral-700"
              )}
            />
          ))}
        </div>

        {/* Content */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-neutral-100 dark:bg-neutral-700 rounded-full flex items-center justify-center mb-4">
            {currentStepData.icon}
          </div>
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
            {currentStepData.title}
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
            {currentStepData.description}
          </p>
        </div>

        {/* Actions */}
        <div className="flex space-x-3">
          <button
            onClick={onSkip}
            className="flex-1 px-4 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors duration-200"
          >
            Skip Tour
          </button>
          <button
            onClick={handleNext}
            className={helpers.cn(
              "flex-1 inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg",
              "bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
              "transition-all duration-200 shadow-sm hover:shadow-md"
            )}
          >
            {isLastStep ? "Get Started" : "Next"}
            <ArrowRightIcon className="h-4 w-4 ml-2" />
          </button>
        </div>
      </InteractiveCard>
    </div>
  );
};

// Help Tooltip Component
interface HelpTooltipProps {
  content: string;
  children: React.ReactNode;
  placement?: "top" | "bottom" | "left" | "right";
  trigger?: "hover" | "click";
}

export const HelpTooltip: React.FC<HelpTooltipProps> = ({
  content,
  children,
  placement = "top",
  trigger = "hover",
}) => {
  const [isVisible, setIsVisible] = React.useState(false);

  const handleToggle = () => {
    if (trigger === "click") {
      setIsVisible(!isVisible);
    }
  };

  const handleMouseEnter = () => {
    if (trigger === "hover") {
      setIsVisible(true);
    }
  };

  const handleMouseLeave = () => {
    if (trigger === "hover") {
      setIsVisible(false);
    }
  };

  const handleClickOutside = React.useCallback((event: MouseEvent) => {
    const target = event.target as Element;
    if (!target.closest("[data-help-tooltip]")) {
      setIsVisible(false);
    }
  }, []);

  React.useEffect(() => {
    if (trigger === "click" && isVisible) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [trigger, isVisible, handleClickOutside]);

  const positionClasses = {
    top: "bottom-full left-1/2 transform -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 transform -translate-x-1/2 mt-2",
    left: "right-full top-1/2 transform -translate-y-1/2 mr-2",
    right: "left-full top-1/2 transform -translate-y-1/2 ml-2",
  };

  return (
    <div
      className="relative inline-block"
      data-help-tooltip
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleToggle}
    >
      {children}
      {isVisible && (
        <div
          className={helpers.cn(
            "absolute z-50 px-3 py-2 text-xs text-white bg-neutral-900 rounded-lg shadow-lg max-w-xs",
            "animate-in fade-in-0 zoom-in-95 duration-200",
            positionClasses[placement]
          )}
          role="tooltip"
        >
          {content}
          <div className="absolute w-2 h-2 bg-neutral-900 transform rotate-45" />
        </div>
      )}
    </div>
  );
};

// Quick Start Guide Component
interface QuickStartGuideProps {
  steps: Array<{
    title: string;
    description: string;
    action?: string;
    href?: string;
    completed?: boolean;
  }>;
  onStepComplete?: (stepIndex: number) => void;
  className?: string;
}

export const QuickStartGuide: React.FC<QuickStartGuideProps> = ({
  steps,
  onStepComplete,
  className,
}) => {
  const completedSteps = steps.filter((step) => step.completed).length;
  const progress = (completedSteps / steps.length) * 100;

  return (
    <InteractiveCard
      variant="elevated"
      className={helpers.cn("p-6", className)}
    >
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
          Quick Start Guide
        </h3>
        <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">
          {completedSteps} of {steps.length} steps completed
        </p>
      </div>

      <div className="space-y-4">
        {steps.map((step, index) => (
          <div
            key={index}
            className={helpers.cn(
              "flex items-start space-x-3 p-3 rounded-lg transition-colors duration-200",
              step.completed
                ? "bg-green-50 dark:bg-green-900/20"
                : "bg-neutral-50 dark:bg-neutral-800/50"
            )}
          >
            <div
              className={helpers.cn(
                "flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium",
                step.completed
                  ? "bg-green-500 text-white"
                  : "bg-neutral-300 dark:bg-neutral-600 text-neutral-600 dark:text-neutral-300"
              )}
            >
              {step.completed ? "✓" : index + 1}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-1">
                {step.title}
              </h4>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-2">
                {step.description}
              </p>
              {step.action && !step.completed && (
                <div className="flex space-x-2">
                  {step.href ? (
                    <Link
                      href={step.href}
                      className="text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      {step.action}
                    </Link>
                  ) : (
                    <button
                      onClick={() => onStepComplete?.(index)}
                      className="text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      {step.action}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </InteractiveCard>
  );
};

const OnboardingComponents = {
  EmptyState,
  WelcomeTour,
  HelpTooltip,
  QuickStartGuide,
};

export default OnboardingComponents;
