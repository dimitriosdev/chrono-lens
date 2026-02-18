# Architecture Overview

## Design Principles

- **Simplicity First** - Clean, readable, maintainable code
- **Feature-Based Structure** - Organized by domain, not file type
- **Type Safety** - Comprehensive TypeScript coverage
- **DRY** - Shared utilities and reusable components

## Project Structure

```
src/
├── app/                      # Next.js App Router
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Home page
│   ├── globals.css          # Global styles
│   ├── albums/              # Album pages
│   │   ├── page.tsx         # Album list
│   │   ├── new/             # Create album
│   │   ├── edit/            # Edit album
│   │   ├── play/            # View slideshow
│   │   └── public/          # Public album view
│   └── about/               # About page
│
├── features/                 # Feature modules
│   ├── albums/              # Album feature
│   │   ├── components/      # Album-specific components
│   │   ├── hooks/           # Album hooks (useSlideshow, useColorPreferences)
│   │   ├── constants/       # Layout templates, presets
│   │   └── utils/           # Album utilities (albumSave, imageProcessing)
│   └── navigation/          # Navigation feature
│       └── components/      # Navigation, NavigationWrapper
│
└── shared/                   # Shared modules
    ├── components/          # Reusable UI components
    │   ├── ui/              # ErrorBoundary, Loading, BackgroundImage
    │   └── layout/          # Layout wrapper
    ├── hooks/               # Shared hooks (useImagePreload, useErrorHandler)
    ├── context/             # React contexts (Auth, Fullscreen)
    ├── lib/                 # External integrations
    │   ├── firebase.ts      # Firebase config
    │   ├── firestore.ts     # Database operations
    │   └── storage.ts       # File storage
    ├── types/               # TypeScript definitions
    │   └── album.ts         # Album, AlbumPage, LayoutType, etc.
    ├── utils/               # Utility functions
    │   └── security.ts      # Validation, sanitization
    └── constants/           # Design system tokens
        └── design/          # Colors, typography, spacing
```

## Data Flow

### Album Creation Flow

1. User fills MultiPageLayoutStep component
2. Component manages local state for pages/slots
3. On save, `processAlbumPages()` uploads images
4. `addAlbum()` / `updateAlbum()` writes to Firestore
5. Router navigates to album list

### State Management

- **Local State**: React hooks for component state
- **Context**: AuthContext for user authentication, FullscreenContext
- **Persistence**: localStorage for user preferences (colors, settings)
- **Server State**: Firestore for album data

## Key Components

### Album Feature

- `MultiPageLayoutStep` - Main album editor with template selection
- `LayoutViewer` - Renders album in play mode (slideshow/grid/wall)
- `TemplateEditor` - Image positioning with pan/zoom
- `AlbumPageHeader` - Reusable header for create/edit pages

### Shared Components

- `ErrorBoundary` - Graceful error handling
- `LoadingSpinner` / `LoadingButton` - Loading states
- `ConfirmationModal` - Destructive action confirmation

## Custom Hooks

| Hook                  | Purpose                                    |
| --------------------- | ------------------------------------------ |
| `useSlideshow`        | Slideshow playback, navigation, preloading |
| `useColorPreferences` | Mat/background color with persistence      |
| `useImagePreload`     | Preload images for smooth transitions      |
| `useErrorHandler`     | Error reporting and logging                |

## Type System

Core types in `shared/types/album.ts`:

- `Album` - Main album entity
- `AlbumPage` - Multi-page slideshow page
- `TemplateSlot` - Image slot with position
- `AlbumLayout` - Layout configuration
- `LayoutType` - "slideshow" | "grid" | "wall" | "template"
- `MatConfig` - Mat/frame styling

## Security

- Firebase Authentication for user management
- Firestore security rules for data access
- Client-side validation with `security.ts`
- Rate limiting for API operations

## Performance

- Next.js automatic code splitting
- Image optimization with `imageProcessing.ts`
- Image preloading via `useImagePreload`
- Lazy loading for heavy components

---

Last Updated: February 2026
