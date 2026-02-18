# Album Privacy

Album-level access control with public and private visibility options.

## Overview

Chrono Lens supports two privacy levels for albums:

- **Private** (default) - Only the album owner can view
- **Public** - Anyone can view without authentication

## Privacy Levels

| Level   | Read Access | Write Access | URL Access        |
| ------- | ----------- | ------------ | ----------------- |
| Private | Owner only  | Owner only   | Requires auth     |
| Public  | Anyone      | Owner only   | Direct link works |

## Type Definition

```typescript
// src/shared/types/album.ts
export type AlbumPrivacy = "public" | "private";

export interface Album {
  id: string;
  userId: string;
  title: string;
  privacy: AlbumPrivacy;
  // ...
}
```

## Firestore Security Rules

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /albums/{albumId} {
      // Anyone can read public albums
      allow read: if resource.data.privacy == 'public';

      // Owner can always read their own albums
      allow read: if request.auth != null
        && request.auth.uid == resource.data.userId;

      // Only owner can write
      allow write: if request.auth != null
        && request.auth.uid == resource.data.userId;
    }
  }
}
```

## Default Behavior

Albums are created as **private** by default:

```typescript
// src/app/albums/new/page.tsx
const albumData: Omit<Album, "id"> = {
  userId: currentUser.id,
  title: title.trim(),
  privacy: "private",
  // ...
};
```

## Privacy Utilities

### File Location

```
src/shared/utils/privacy.ts
```

### Available Functions

```typescript
/**
 * Check if a user can access an album
 */
export function canAccessAlbum(album: Album, currentUser?: AuthUser): boolean {
  if (album.privacy === "public") {
    return true;
  }
  return !!(currentUser && album.userId === currentUser.id);
}

/**
 * Check if authentication is required
 */
export function requiresAuthentication(privacy: AlbumPrivacy): boolean {
  return privacy === "private";
}
```

## API Integration

### Getting Albums

```typescript
// Get specific album (privacy check automatic)
const album = await getAlbum(albumId);

// Get user's albums (all privacy levels)
const myAlbums = await getAlbums();

// Get public albums for discovery
const publicAlbums = await getPublicAlbums(20);
```

### Updating Privacy

```typescript
import { updateAlbum } from "@/shared/lib/firestore";

// Make album public
await updateAlbum(albumId, { privacy: "public" });

// Make album private
await updateAlbum(albumId, { privacy: "private" });
```

## UI Integration

### Public Gallery

The `/albums/public` page displays all public albums:

```typescript
// src/app/albums/public/page.tsx
const publicAlbums = await getPublicAlbums(50);
```

### Play Page Access

```typescript
// src/app/albums/play/page.tsx
if (album.privacy === "public") {
  // Allow access without auth
  return;
}

// Private albums require owner authentication
if (!currentUser || album.userId !== currentUser.id) {
  router.replace("/?message=This album is private");
}
```

## Security Layers

### Defense in Depth

1. **Client-side checks** - Fast feedback to users
2. **API validation** - Server-side access control
3. **Firestore rules** - Database-level enforcement

### Best Practices

- ✅ Default to private - New albums are private
- ✅ Validate on server - Never trust client-side alone
- ✅ Clear error messages - Inform users why access denied
- ✅ Owner-only writes - Prevent unauthorized modifications

## File Reference

| File                             | Purpose           |
| -------------------------------- | ----------------- |
| `firestore.rules`                | Security rules    |
| `src/shared/types/album.ts`      | Type definitions  |
| `src/shared/utils/privacy.ts`    | Privacy utilities |
| `src/shared/lib/firestore.ts`    | API functions     |
| `src/app/albums/public/page.tsx` | Public gallery    |
| `src/app/albums/play/page.tsx`   | Album viewer      |

## Future Enhancements

Potential additions (not currently implemented):

- **Link-based sharing** - Generate temporary public links
- **Password protection** - Add passwords to public albums
- **Expiring access** - Time-limited public access
- **Collaborative editing** - Multiple owners per album

---

_Last updated: February 2026_
