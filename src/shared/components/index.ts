/**
 * Shared Components Barrel Export
 */

// UI Components
export { ErrorBoundary } from "./ui/ErrorBoundary";
export { default as BackgroundImage } from "./ui/BackgroundImage";
export { VersionDisplay } from "./ui/VersionDisplay";
export { VersionLogger } from "./ui/VersionLogger";
export { UserDebugPanel } from "./ui/UserDebugPanel";
export { FirebaseUsageDashboard } from "./ui/FirebaseUsageDashboard";
export { UsageLimitError } from "./ui/UsageLimitError";
export { Breadcrumb, useBreadcrumbs } from "./ui/Breadcrumb";
export * from "./ui/UIComponents";

// Loading Components
export {
  LoadingSpinner,
  LoadingSkeleton,
  LoadingDots,
  LoadingPulse,
  LoadingButton,
  LoadingOverlay,
} from "./ui/LoadingComponents";

// Interaction Components
export {
  InteractiveCard,
  RippleEffect,
  MagneticEffect,
  Tooltip,
  PressEffect,
} from "./ui/InteractionComponents";

// Onboarding Components
export {
  EmptyState,
  WelcomeTour,
  HelpTooltip,
  QuickStartGuide,
} from "./ui/OnboardingComponents";

// Form Components
export * from "./form/FormComponents";

// Layout Components
export { default as Layout } from "./layout/Layout";
