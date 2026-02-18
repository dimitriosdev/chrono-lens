# Browser Compatibility

## Supported Browsers

- **Chrome**: 92+ (July 2021)
- **Firefox**: 100+ (May 2022)
- **Edge**: 100+ (March 2022)
- **Safari**: 15+ (September 2021)

## Mobile Support

- **iOS Safari**: iOS 15+
- **Chrome Mobile**: Android 8+

## Key Features

- ES2020+ JavaScript features
- CSS Grid and Flexbox
- CSS Custom Properties
- ResizeObserver API
- Modern image formats (WebP)

## Known Limitations

- **Fullscreen API**: Requires user interaction and has platform-specific behaviors
  - **Desktop**: Standard Fullscreen API works across all supported browsers
  - **iOS Safari/Chrome**: Native fullscreen API is limited; uses CSS-based fullscreen simulation
  - **Android Chrome**: Standard Fullscreen API is supported
- **File drag & drop**: Limited on mobile
- **HEIC support**: Varies by platform
- **Android Chrome**: Latest versions
- **Status**: ✅ Fully Supported

## Feature Compatibility

### Chrome 92 Specific Support

Chrome 92 was released in July 2021 and supports all the core features used in Chrono Lens:

#### Supported Features ✅

- **Optional Chaining** (`?.`) - Chrome 80+
- **Nullish Coalescing** (`??`) - Chrome 80+
- **Dynamic Imports** - Chrome 63+
- **CSS Grid** - Chrome 57+
- **CSS Flexbox** - Chrome 29+
- **ES6 Modules** - Chrome 61+
- **Async/Await** - Chrome 55+
- **CSS Custom Properties** - Chrome 49+
- **CSS Attribute Selectors** - Basic support since early Chrome versions
- **Framer Motion Animations** - Library provides polyfills
- **Radix UI Components** - Works with Safari-compatible CSS

#### Features Not Available in Chrome 92 ❌

- **CSS `:has()` Selector** - Chrome 105+ (not used in our codebase)
- **Container Queries** - Chrome 105+ (not used in our codebase)
- **CSS `@layers`** - Chrome 99+ (not used in our codebase)

## Build Configuration

The application uses Next.js 15.4.6 with automatic transpilation for older browsers. The browserslist configuration in `.browserslistrc` ensures proper polyfills and transformations:

```
# Support for older browsers
Chrome >= 92
Firefox >= 100
Edge >= 100
Safari >= 15
iOS >= 15
```

## Testing Recommendations

When testing on Chrome 92:

1. **Core Functionality**: All album creation, editing, and playback features should work
2. **UI Components**: Radix UI components use Safari-compatible CSS that also works in Chrome 92
3. **Animations**: Framer Motion provides cross-browser compatibility
4. **Layout System**: CSS Grid and Flexbox are fully supported

## Known Limitations

### Chrome 92 Specific

- No significant limitations identified
- All core features are compatible

### General Older Browser Considerations

- Some very new CSS features may require fallbacks (already implemented)
- Performance may be slightly reduced compared to latest browsers
- Some cutting-edge features may not be available, but none are required for core functionality

## Development Notes

- The build system automatically transpiles modern JavaScript for older browsers
- CSS autoprefixer handles vendor prefixes automatically
- All critical features have been tested to work with the minimum supported versions
- Safari-specific CSS workarounds also benefit older Chrome versions

### Fullscreen Implementation Notes

The application implements a hybrid fullscreen approach to ensure compatibility across all devices:

1. **Desktop Browsers**: Uses the standard Fullscreen API with vendor prefixes for cross-browser support
2. **Mobile Devices**:
   - **iOS (Safari/Chrome)**: Uses CSS-based fullscreen simulation due to API limitations
   - **Android**: Attempts native Fullscreen API, falls back to CSS simulation if needed
3. **Auto Re-entry**: Maintains fullscreen state across navigation on supported platforms
4. **Rate Limiting**: Implements throttling to prevent browser API abuse detection

## Browser Support Policy

We aim to support browsers that:

- Are still receiving security updates
- Represent >0.5% of global usage
- Support core web standards (ES6+, CSS Grid, Flexbox)

Chrome 92+ meets all these criteria and provides a solid foundation for the application.
