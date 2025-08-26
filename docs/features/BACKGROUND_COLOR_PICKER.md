# Mat Background Color Picker

The background color picker allows users to easily customize the background color while viewing albums in play mode, with seamless integration to the album's mat colors.

## Overview

Users can change the background color of both slideshow and grid layout views in the play page through an intuitive color picker interface that automatically syncs with the album's mat board colors.

## Features

### 🎨 Easy Access

- **Color Picker Button**: Located in the top-right corner of the play page
- **Toggle Interface**: Click to show/hide the color picker panel
- **Instant Preview**: Background changes immediately when a color is selected
- **Mat Sync**: Automatically matches the album's mat color on load

### 🌈 Color Options

#### Mat Colors (Primary Options)

- **No Mat** (#000) - Pure black background
- **Classic White** (#f8f8f8) - Clean, professional white
- **Soft Yellow** (#ffe88a) - Warm, inviting tone
- **Modern Grey** (#bfc2c3) - Contemporary neutral
- **Blush Pink** (#f8e1ea) - Elegant feminine tone
- **Deep Black** (#1a1a1a) - Rich, dramatic black
- **Cream** (#f5f5dc) - Warm, vintage tone
- **Sage Green** (#9caf88) - Natural, calming color

#### Mat Integration Features

- **Album Mat Indicator**: Shows which color matches the current album's mat
- **Quick Mat Sync**: "Use Album Mat" button for instant matching
- **Visual Indicators**: Blue dot shows current album mat color selection

#### Custom Color Picker

- **Full Color Spectrum**: HTML5 color input for unlimited color choices
- **Hex Values**: Direct color code input
- **Real-time Preview**: Instant background updates

### 💾 Persistence

- **localStorage**: User's color preference is automatically saved
- **Session Memory**: Color choice persists across album views
- **Auto-restore**: Last selected color is restored when reopening the app

## User Interface

### Color Picker Panel

```
┌─────────────────────────────┐
│ Background Color            │
├─────────────────────────────┤
│ ⚫ ⚪ 🔘 🔘 🔘 🔘 🔘      │
│ 🔘 🔘 🔘 🔘 🔘 🔘 🔘      │
├─────────────────────────────┤
│ Custom Color:               │
│ [████████████████████████]  │
├─────────────────────────────┤
│           Done              │
└─────────────────────────────┘
```

### Control Button

- **Icon**: Paint palette icon
- **Position**: Top-right corner of play page
- **Style**: Semi-transparent dark background with white icon
- **Hover Effects**: Smooth color transitions

## Implementation Details

### State Management

```typescript
const [backgroundColor, setBackgroundColor] = useState("#000000");
const [showColorPicker, setShowColorPicker] = useState(false);
```

### Persistence Logic

```typescript
// Load saved preference
useEffect(() => {
  const savedColor = localStorage.getItem("chrono-lens-bg-color");
  if (savedColor) {
    setBackgroundColor(savedColor);
  }
}, []);

// Save preference
useEffect(() => {
  localStorage.setItem("chrono-lens-bg-color", backgroundColor);
}, [backgroundColor]);
```

### Background Application

- **Dynamic Styling**: `style={{ backgroundColor }}` applied to main container
- **Both Layouts**: Works with slideshow and grid layouts
- **Full Coverage**: Background fills entire viewport

## Browser Compatibility

### Supported Features

- ✅ **HTML5 Color Input** - Chrome 20+, Safari 12.1+, Firefox 29+
- ✅ **localStorage** - All modern browsers
- ✅ **CSS Dynamic Styling** - Universal support

### Chrome 92+ Compatibility

- ✅ **Color Input Type** - Fully supported (Chrome 20+)
- ✅ **Event Handling** - Complete support
- ✅ **State Management** - React hooks fully compatible

## User Experience

### Workflow

1. **Open Album**: Navigate to any album's play page
2. **Access Picker**: Click the color palette icon (top-right)
3. **Select Color**: Choose from presets or use custom picker
4. **Instant Feedback**: Background changes immediately
5. **Close Panel**: Click "Done" or click outside
6. **Persistent Choice**: Color saved for future sessions

### Design Principles

- **Non-intrusive**: Color picker doesn't block content
- **Accessible**: Clear visual feedback and button labels
- **Intuitive**: Standard color picker UI patterns
- **Responsive**: Works on all screen sizes

## Accessibility

### Keyboard Navigation

- Color picker buttons are focusable
- Tab navigation through preset colors
- Enter key to select colors

### Screen Readers

- Descriptive `aria-label` attributes
- Semantic button elements
- Clear visual contrast indicators

### Visual Indicators

- **Selected State**: White border around chosen color
- **Hover Effects**: Scale animation on color buttons
- **Focus States**: Proper focus indicators

## Technical Notes

### Performance

- **Minimal Overhead**: Simple state updates
- **No Re-renders**: Efficient React state management
- **Fast Storage**: localStorage operations are synchronous

### Memory Usage

- **Lightweight**: Only stores hex color value
- **Cleanup**: No memory leaks from event handlers
- **Efficient**: Single color value in localStorage

## Future Enhancements

### Potential Features

- **Color Themes**: Predefined color schemes
- **Gradient Backgrounds**: Support for gradient overlays
- **Per-Album Colors**: Save different colors for different albums
- **Advanced Picker**: HSL/RGB input modes
- **Export Settings**: Share color preferences

### Integration Opportunities

- **Album Metadata**: Store background preference in album data
- **User Profiles**: Global color preferences
- **Accessibility**: High contrast mode integration

## Testing

### Manual Testing

- Test color selection on slideshow mode
- Test color selection on grid layouts
- Verify persistence across browser sessions
- Check responsive behavior on mobile

### Browser Testing

- Chrome 92+ compatibility verification
- Safari mobile color picker functionality
- Firefox color input behavior
- Edge compatibility testing

This feature enhances the user experience by providing personalized background control while maintaining the elegant design aesthetic of Chrono Lens.
