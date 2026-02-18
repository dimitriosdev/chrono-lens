# Component Reference

## Album Components

### AlbumGrid

Displays a grid of album cards with cover images.

### LayoutViewer

Renders album content in various layouts (slideshow, grid, wall, multi-page).

### MultiPageLayoutStep

Interactive multi-page album editor with template selection and image placement.

### AlbumPageHeader

Reusable header for album create/edit pages with title input and save button.

### TemplateLayoutViewer

Displays template-based layouts with positioned images.

### TemplateEditor

Interactive editor for adjusting image position and zoom within template slots.

**Features:**

- Drag-and-drop image upload support for HEIC/HEIF and standard image formats
- Click to browse files (accepts image/\*, .heic, .heif)
- Visual feedback when dragging files over slots
- Image repositioning within slots via mouse/touch drag
- Zoom controls and mouse wheel zoom
- Position reset functionality

### MatImage

Displays images with configurable mat borders.

### ColorPicker

Color selection component for background and mat colors.

### PhotoFrame

Individual photo with customizable frame and mat styles.

### WallLayoutViewer

Gallery-style wall layout with multiple positioned frames.

## UI Components

### ErrorBoundary

React error boundary for graceful error handling.

### LoadingSpinner

Animated loading indicator with size and color variants.

### LoadingButton

Button with integrated loading state.

### BackgroundImage

Full-screen background image with optional overlay.

### ConfirmationModal

Modal dialog for confirming destructive actions.

## Layout Components

### Layout

Main application layout wrapper.

### Navigation

Sidebar navigation with responsive design.

### NavigationWrapper

Context-aware navigation that hides on certain routes.

## Hooks

### useSlideshow

Manages slideshow playback, navigation, and image preloading.

### useColorPreferences

Handles mat and background color selection with persistence.

### useImagePreload

Preloads images around current index for smooth transitions.

### useErrorHandler

Error reporting and logging utility.

## Utilities

### processAlbumPages

Uploads local images and returns processed album data.

### createAlbumLayoutMetadata

Creates consistent layout metadata for albums.

### createMatConfigFromPages

Extracts mat configuration from album pages.

---

Last Updated: February 2026
