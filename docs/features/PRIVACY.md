# Privacy System Documentation

## Overview

ChronoLens uses a simplified two-level privacy system for albums:

- **Public** - Anyone can view
- **Private** - Only owner can view (default)

## Privacy Levels

### 🌍 Public Albums

**Access**

- Viewable by anyone (authenticated or not)
- Accessible via direct URL: `/albums/play?id=ALBUM_ID`
- No authentication required

**Use Cases**

- Photography portfolios
- Event albums (weddings, parties)
- Public showcases
- Content meant for sharing

**Security**

- Read access: Anyone
- Write access: Owner only
- Enforced by Firestore security rules

### 🔒 Private Albums

**Access**

- Viewable only by the owner
- Requires authentication
- Automatic redirect to login for non-owners

**Use Cases**

- Personal photos
- Family albums
- Work-in-progress content
- Sensitive content

**Security**

- Read access: Owner only
- Write access: Owner only
- Default privacy level for new albums

## Implementation

### Type Definition

```typescript
// src/shared/types/album.ts
export type AlbumPrivacy = "public" | "private";

export interface Album {
  id: string;
  title: string;
  privacy: AlbumPrivacy;
  userId: string;
  // ... other fields
}
```

### Firestore Security Rules

```javascript
// firestore.rules
match /albums/{albumId} {
  // Anyone can read public albums
  allow read: if resource.data.privacy == "public";

  // Owner can read their private albums
  allow read: if request.auth.uid == resource.data.userId;

  // Only owner can write
  allow write: if request.auth.uid == resource.data.userId;
}
```

### Access Control Functions

```typescript
// src/shared/utils/privacy.ts

/**
 * Check if user can access an album
 */
export function canAccessAlbum(
  album: Album,
  currentUser?: User | null
): boolean {
  // Public albums: anyone can access
  if (album.privacy === "public") {
    return true;
  }

  // Private albums: only owner
  return !!(currentUser && album.userId === currentUser.id);
}

/**
 * Check if authentication is required
 */
export function requiresAuthentication(privacy: AlbumPrivacy): boolean {
  return privacy === "private";
}
```

### API Functions

```typescript
// src/shared/lib/firestore.ts

/**
 * Get album with automatic privacy checks
 */
export async function getAlbum(id: string): Promise<Album | null> {
  const albumDoc = await getDoc(doc(albumsCollection, id));

  if (!albumDoc.exists()) {
    return null;
  }

  const albumData = { id: albumDoc.id, ...albumDoc.data() } as Album;
  const currentUser = getCurrentUser();

  // Check access
  if (!canAccessAlbum(albumData, currentUser)) {
    if (albumData.privacy === "private") {
      throw new Error(
        "This album is private and can only be viewed by the owner."
      );
    }
    throw new Error("You do not have permission to view this album.");
  }

  return albumData;
}

/**
 * Get all public albums
 */
export async function getPublicAlbums(
  limitCount: number = 20
): Promise<Album[]> {
  const publicQuery = query(
    albumsCollection,
    where("privacy", "==", "public"),
    orderBy("createdAt", "desc"),
    limit(limitCount)
  );

  const snapshot = await getDocs(publicQuery);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Album));
}
```

## UI Integration

### Privacy Selection

```tsx
// src/features/albums/components/WizardBasicInfo.tsx
<select value={privacy} onChange={(e) => setPrivacy(e.target.value)}>
  <option value="private">Private - Only I can view</option>
  <option value="public">Public - Anyone can view</option>
</select>
```

### Error Handling

```tsx
// src/app/albums/play/page.tsx
try {
  const data = await getAlbum(albumId);
  setAlbum(data);
} catch (error: any) {
  if (error?.message?.includes("private")) {
    // Redirect to login with message
    router.replace(
      "/?redirect=" +
        encodeURIComponent(window.location.pathname) +
        "&message=" +
        encodeURIComponent("This album is private. Please sign in to view it.")
    );
    return;
  }
  // Handle other errors
}
```

## Usage Examples

### Creating Albums

```typescript
// Create public album
const publicAlbum = await addAlbum({
  title: "My Portfolio",
  privacy: "public",
  images: [...],
});

// Create private album (default)
const privateAlbum = await addAlbum({
  title: "Family Photos",
  privacy: "private",
  images: [...],
});
```

### Changing Privacy

```typescript
// Make album public
await updateAlbumPrivacy(albumId, "public");

// Make album private
await updateAlbumPrivacy(albumId, "private");
```

### Accessing Albums

```typescript
// Get specific album (privacy check automatic)
const album = await getAlbum(albumId);

// Get user's albums
const myAlbums = await getAlbums();

// Get public albums
const publicAlbums = await getPublicAlbums(20);
```

## Security Considerations

### Defense in Depth

1. **Client-side checks** - Fast feedback to users
2. **API validation** - Server-side access control
3. **Firestore rules** - Database-level enforcement

### Best Practices

- ✅ **Default to private** - New albums are private by default
- ✅ **Validate on server** - Never trust client-side checks alone
- ✅ **Clear error messages** - Inform users why access is denied
- ✅ **Preserve URLs** - Redirect to original URL after login
- ✅ **Owner-only writes** - Prevent unauthorized modifications

### Common Pitfalls

- ❌ Relying only on UI hiding
- ❌ Checking privacy client-side only
- ❌ Forgetting to update Firestore rules
- ❌ Not handling errors gracefully

## Testing

### Manual Test Cases

**Public Albums**

- [ ] View public album without login
- [ ] View public album with direct URL
- [ ] Owner can edit public album
- [ ] Non-owner cannot edit public album

**Private Albums**

- [ ] Cannot view private album without login
- [ ] Non-owner redirected to login
- [ ] Owner can view private album
- [ ] Friendly error message shown

**Privacy Changes**

- [ ] Can change private to public
- [ ] Can change public to private
- [ ] Changes persist after reload
- [ ] Access control updates immediately

## Migration from Shared Privacy

The "shared" privacy level with token-based sharing has been removed.

### Why Removed

- Simplified mental model
- Reduced code complexity
- Public privacy serves most sharing needs
- Token management overhead eliminated

### Migration Strategy

Albums previously marked as "shared":

- Change to **public** if broad sharing is acceptable
- Change to **private** if access should be restricted

## Future Enhancements

Potential additions (not currently implemented):

- **Link-based sharing** - Generate temporary public links
- **Password protection** - Add passwords to public albums
- **Viewer analytics** - Track who viewed public albums
- **Expiring access** - Time-limited public access
- **Collaborative editing** - Multiple owners per album

## File Reference

**Core Files**

- `firestore.rules` - Security rules
- `src/shared/types/album.ts` - Type definitions
- `src/shared/utils/privacy.ts` - Privacy utilities
- `src/shared/lib/firestore.ts` - API functions

**UI Components**

- `src/features/albums/components/WizardBasicInfo.tsx` - Privacy selector
- `src/app/albums/play/page.tsx` - Album viewer
- `src/app/root.tsx` - Login with error messages

---

**Status**: Production ready ✅

Last updated: December 30, 2025
