# Background Color Picker

Customizable mat and background colors for the album play view with automatic persistence.

## Overview

Users can change both mat color and background color independently through an intuitive tabbed color picker interface. The feature provides automatic persistence and smart defaults based on album settings.

## Features

### 🎨 Easy Access

- **Color Picker Button**: Located in the top-right corner of the play page
- **Toggle Interface**: Click to show/hide the color picker panel
- **Instant Preview**: Colors change immediately when selected
- **Tabbed Interface**: Separate tabs for mat and background colors

### 🌈 Color Options

#### Available Colors

| Color         | Hex       | Description               |
| ------------- | --------- | ------------------------- |
| No Mat        | `#000`    | Pure black background     |
| Classic White | `#f8f8f8` | Clean, professional white |
| Soft Yellow   | `#ffe88a` | Warm, inviting tone       |
| Modern Grey   | `#bfc2c3` | Contemporary neutral      |
| Blush Pink    | `#f8e1ea` | Elegant feminine tone     |
| Deep Black    | `#1a1a1a` | Rich, dramatic black      |
| Cream         | `#f5f5dc` | Warm, vintage tone        |
| Sage Green    | `#9caf88` | Natural, calming color    |

#### Additional Features

- **Custom Color Picker**: HTML5 color input for unlimited choices
- **Album Default Indicator**: Shows which color matches album settings
- **Quick Reset**: "Use Album Default" button

### 💾 Persistence

- Colors are saved to the album in Firestore
- Show/hide album title preference stored in localStorage
- Changes can be saved or reset to album defaults

## Architecture

### Hook Location

```
src/features/albums/hooks/useColorPreferences.ts
```

### Hook Interface

```typescript
interface ColorPreferences {
  selectedMatColor: string | null;
  selectedBackgroundColor: string | null;
  effectiveMatColor: string;
  effectiveBackgroundColor: string;
  albumMatColor?: string;
  albumBackgroundColor?: string;
  showAlbumTitle: boolean;
}

interface ColorActions {
  selectMatColor: (color: string) => void;
  selectBackgroundColor: (color: string) => void;
  saveColors: () => Promise<void>;
  resetMatColor: () => Promise<void>;
  resetBackgroundColor: () => Promise<void>;
  toggleAlbumTitle: () => void;
}
```

## Usage

### Basic Usage

```typescript
import { useColorPreferences } from "@/features/albums/hooks";

function PlayPage({ album }: { album: Album }) {
  const colorPrefs = useColorPreferences(album);

  return (
    <div
      style={{
        backgroundColor: colorPrefs.effectiveBackgroundColor
      }}
    >
      <PhotoFrame
        matColor={colorPrefs.effectiveMatColor}
        // ...
      />
    </div>
  );
}
```

### Color Selection

```typescript
// Select mat color
colorPrefs.selectMatColor("#f8f8f8");

// Select background color
colorPrefs.selectBackgroundColor("#1a1a1a");

// Save to album
await colorPrefs.saveColors();

// Reset to album defaults
await colorPrefs.resetMatColor();
await colorPrefs.resetBackgroundColor();
```

### Available Colors Array

```typescript
import { matColors } from "@/features/albums/hooks";

// matColors = [
//   { name: "No Mat", value: "#000" },
//   { name: "Classic White", value: "#f8f8f8" },
//   // ...
// ]
```

## User Interface

### Color Picker Panel

```
┌─────────────────────────────┐
│ Mat Color | Background      │  ← Tabs
├─────────────────────────────┤
│ ⚫ ⚪ 🟡 ⚪ 🔘 ⚫ 🟢 🟡   │  ← Preset colors
├─────────────────────────────┤
│ Custom: [██████████████]    │  ← Color picker
├─────────────────────────────┤
│ ☑ Show Album Title          │  ← Toggle
├─────────────────────────────┤
│  [Reset]        [Save]      │  ← Actions
└─────────────────────────────┘
```

### Control Button

- **Icon**: Paint palette icon
- **Position**: Top-right corner
- **Style**: Semi-transparent with white icon

## User Workflow

1. **Open Album**: Navigate to album play page
2. **Access Picker**: Click the palette icon
3. **Select Tab**: Choose Mat or Background
4. **Pick Color**: Select preset or use custom picker
5. **Preview**: See changes immediately
6. **Save**: Click Save to persist to album

## Browser Compatibility

| Feature             | Support                               |
| ------------------- | ------------------------------------- |
| HTML5 Color Input   | Chrome 20+, Safari 12.1+, Firefox 29+ |
| localStorage        | All modern browsers                   |
| CSS Dynamic Styling | Universal                             |

## Accessibility

### Keyboard Navigation

- Tab navigation through preset colors
- Enter key to select colors
- Focus indicators on all buttons

### Screen Readers

- Descriptive `aria-label` attributes
- Semantic button elements
- Clear visual contrast

---

_Last updated: February 2026_
