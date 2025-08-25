# 📝 Component Library Reference

This document provides a comprehensive reference for all reusable components in Chrono Lens.

## 🧩 Form Components

### FormSection

A container component for grouping related form elements.

```typescript
interface FormSectionProps {
  title: string;
  description?: string;
  className?: string;
  children: React.ReactNode;
}
```

**Usage:**

```tsx
<FormSection title="Album Settings" description="Configure your album">
  <FormField label="Title">
    <input type="text" />
  </FormField>
</FormSection>
```

### FormField

A wrapper for form inputs with consistent styling and error handling.

```typescript
interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}
```

**Usage:**

```tsx
<FormField label="Album Title" error={errors.title} required>
  <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
</FormField>
```

### Button

A versatile button component with multiple variants and states.

```typescript
interface ButtonProps {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}
```

**Usage:**

```tsx
<Button variant="primary" loading={isSubmitting} onClick={handleSave}>
  Save Album
</Button>
```

## 🖼️ Album Components

### AlbumBasicInfo

Handles basic album information input (title, description).

```typescript
interface AlbumBasicInfoProps {
  title: string;
  onTitleChange: (title: string) => void;
  titleError?: string;
}
```

### AlbumImagesSection

Manages image upload and organization.

```typescript
interface AlbumImagesSectionProps {
  images: ImageItem[];
  onImagesChange: (images: ImageItem[]) => void;
  error?: string;
  maxImages?: number;
}
```

### AlbumLayoutSection

Provides layout selection and preview.

```typescript
interface AlbumLayoutSectionProps {
  images: ImageItem[];
  currentLayout: LayoutType;
  onLayoutChange: (layout: LayoutType) => void;
}
```

### AlbumSlideshowSettings

Configures slideshow behavior and timing.

```typescript
interface AlbumSlideshowSettingsProps {
  cycleDuration: number;
  onCycleDurationChange: (duration: number) => void;
  cycleDurationError?: string;
  isVisible: boolean;
}
```

### AlbumMatBoardSection

Handles mat board configuration and preview.

```typescript
interface AlbumMatBoardSectionProps {
  matConfig: MatBoardConfig;
  onMatConfigChange: (config: MatBoardConfig) => void;
  layout: LayoutType;
  previewImages: string[];
  showPreview: boolean;
}
```

## 🎨 UI Components

### SmartLayoutSelector

Intelligent layout selection with preview capabilities.

```typescript
interface SmartLayoutSelectorProps {
  images: ImageItem[];
  currentLayout: LayoutType;
  onLayoutChange: (layout: LayoutType) => void;
  showAnalysis?: boolean;
}
```

### EnhancedMatBoard

Advanced mat board component with customization options.

```typescript
interface EnhancedMatBoardProps {
  images: ImageItem[];
  config: MatBoardConfig;
  layout: LayoutType;
  className?: string;
}
```

### ImageGrid

Responsive image grid with drag-and-drop support.

```typescript
interface ImageGridProps {
  images: ImageItem[];
  onImagesChange?: (images: ImageItem[]) => void;
  maxImages?: number;
  editable?: boolean;
  layout?: "grid" | "masonry" | "flex";
}
```

### Navigation

Main navigation component with responsive design.

```typescript
interface NavigationProps {
  currentPath: string;
  user?: User | null;
  onSignOut?: () => void;
}
```

## 🔧 Utility Components

### ErrorBoundary

React error boundary for graceful error handling.

```typescript
interface ErrorBoundaryProps {
  fallback?: React.ComponentType<{ error: Error }>;
  children: React.ReactNode;
}
```

### BackgroundImage

Manages background image display and transitions.

```typescript
interface BackgroundImageProps {
  src: string;
  alt?: string;
  overlay?: boolean;
  className?: string;
}
```

### VersionDisplay

Shows current application version information.

```typescript
interface VersionDisplayProps {
  showBuildInfo?: boolean;
  className?: string;
}
```

## 📱 Layout Components

### Layout

Main application layout wrapper.

```typescript
interface LayoutProps {
  children: React.ReactNode;
  showNavigation?: boolean;
  className?: string;
}
```

### Sidebar

Collapsible sidebar for navigation and tools.

```typescript
interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}
```

### MobileMenu

Mobile-optimized navigation menu.

```typescript
interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  menuItems: MenuItem[];
}
```

## 🎯 Component Usage Guidelines

### Best Practices

1. **Props Validation**: Always define TypeScript interfaces
2. **Error Handling**: Include error states and fallbacks
3. **Accessibility**: Add ARIA labels and keyboard support
4. **Performance**: Use React.memo for expensive components
5. **Testing**: Write tests for component behavior

### Styling Conventions

- Use Tailwind CSS utility classes
- Avoid inline styles
- Use CSS variables for theming
- Follow responsive design patterns

### State Management

- Keep component state minimal
- Use custom hooks for complex logic
- Lift state up when needed
- Avoid prop drilling

## 🔄 Component Evolution

### Deprecation Process

1. Mark component as deprecated in JSDoc
2. Add migration guide in comments
3. Provide transition period
4. Remove in next major version

### Version Compatibility

- Maintain backward compatibility
- Document breaking changes
- Provide migration scripts
- Use semantic versioning

---

**Last Updated**: August 26, 2025
**Maintained by**: Development Team
