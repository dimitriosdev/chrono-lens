/**
 * Shared Components Barrel Export
 */

// UI Components
export { ErrorBoundary } from "./ui/ErrorBoundary";
export { default as BackgroundImage } from "./ui/BackgroundImage";
export { VersionLogger } from "./ui/VersionLogger";
export { UserDebugPanel } from "./ui/UserDebugPanel";
export { FirebaseUsageDashboard } from "./ui/FirebaseUsageDashboard";
export { Breadcrumb, useBreadcrumbs } from "./ui/Breadcrumb";
export { Card, Badge, Input, Textarea, Select } from "./ui/UIComponents";

// Loading Components
export { LoadingSpinner, LoadingButton } from "./ui/LoadingComponents";

// Interaction Components
export {
  InteractiveCard,
  Tooltip,
  PressEffect,
} from "./ui/InteractionComponents";

// Modal Components
export { default as ConfirmationModal } from "./ConfirmationModal";

// Form Components
export * from "./form/FormComponents";

// Layout Components
export { default as Layout } from "./layout/Layout";
