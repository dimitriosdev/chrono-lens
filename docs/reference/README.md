# 📚 Reference Documentation

This directory contains technical reference materials for Chrono Lens.

## 📋 Reference Materials

### API Documentation

- **API.md** - Internal API endpoints and usage
- **FIREBASE_API.md** - Firebase service interactions
- **TYPES.md** - TypeScript type definitions

### Component Library

- **COMPONENTS.md** - Reusable component documentation
- **HOOKS.md** - Custom React hooks reference
- **UTILITIES.md** - Utility functions and helpers

### Data Models

- **ALBUM_MODEL.md** - Album data structure
- **IMAGE_MODEL.md** - Image data structure
- **USER_MODEL.md** - User data structure

## 🎯 Quick Reference

### Core Types

```typescript
// Album
interface Album {
  id: string;
  title: string;
  images: ImageItem[];
  layout: LayoutType;
  // ...
}

// Image Item
interface ImageItem {
  id: string;
  url: string;
  thumbnailUrl: string;
  // ...
}
```

### Common Hooks

```typescript
// Form management
const albumForm = useAlbumForm({ mode, initialData });

// Authentication
const { user, loading } = useAuth();

// Local storage
const [value, setValue] = useLocalStorage("key", defaultValue);
```

### Utility Functions

```typescript
// Image analysis
const analysis = await analyzeImageComposition(imageUrl);

// Validation
const result = validateAlbumData(formData);

// Security
const sanitized = sanitizeInput(userInput);
```

## 📖 How to Use This Reference

### For Developers

- Quick lookup of component APIs
- Type definitions for TypeScript
- Hook usage patterns and examples

### For Integration

- API endpoint specifications
- Data model requirements
- Service interaction patterns

### For Maintenance

- Code organization patterns
- Dependency relationships
- Update procedures

## 🔄 Keeping Reference Updated

- Auto-generate API docs from code comments
- Update type definitions with code changes
- Maintain component examples
- Review and update quarterly

---

**Maintained by**: Development Team
**Last Updated**: August 26, 2025
