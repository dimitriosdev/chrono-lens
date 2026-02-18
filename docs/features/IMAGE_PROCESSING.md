# Image Processing

Comprehensive client-side image optimization and format conversion for universal browser compatibility.

## Overview

Chrono Lens includes automatic image processing that handles HEIC/HEIF conversion and image optimization to ensure optimal performance and compatibility across all devices.

## Features

### 🔄 HEIC/HEIF Conversion

- **Automatic Detection**: Identifies HEIC/HEIF files from iOS devices
- **Client-Side Conversion**: Converts to JPEG using the `heic2any` library
- **No Server Required**: All processing happens in the browser
- **Quality Preservation**: Maintains visual quality during conversion
- **Drag-and-Drop Support**: Upload HEIC images via drag-and-drop or file browser

### 📏 Image Optimization

- **Smart Resizing**: Reduces images larger than 2048px
- **Quality Compression**: JPEG compression at 85% quality
- **Size Reduction**: Typically 50-80% smaller file sizes
- **Aspect Ratio Preservation**: Maintains original proportions

### 📤 Upload Methods

- **Click to Browse**: Standard file input with explicit HEIC/HEIF support
- **Drag and Drop**: Drag images directly onto template slots
- **Visual Feedback**: Blue highlight when dragging files over drop zones

## Architecture

### File Location

```
src/features/albums/utils/imageProcessing.ts
```

### Core Functions

| Function                           | Purpose                              |
| ---------------------------------- | ------------------------------------ |
| `processImage(file)`               | Process single image file            |
| `processImages(files, onProgress)` | Batch process with progress callback |
| `isHeicFile(file)`                 | Detect HEIC/HEIF format              |
| `convertHeicToJpeg(file)`          | Convert HEIC to JPEG                 |
| `optimizeImage(file, options)`     | Resize and compress image            |

### ProcessedImage Interface

```typescript
interface ProcessedImage {
  file: File;
  originalFile: File;
  originalSize: number;
  processedSize: number;
  originalFormat: string;
  processedFormat: string;
  wasConverted: boolean;
  wasOptimized: boolean;
  conversionTime: number;
  dimensions: {
    original: { width: number; height: number };
    processed: { width: number; height: number };
  };
}
```

## Usage

### Basic Processing

```typescript
import { processImage } from "@/features/albums/utils/imageProcessing";

const result = await processImage(file);

if (result.wasConverted) {
  console.log(
    `Converted: ${result.originalFormat} → ${result.processedFormat}`,
  );
}

if (result.wasOptimized) {
  console.log(
    `Reduced: ${result.originalSize} → ${result.processedSize} bytes`,
  );
}
```

### Batch Processing

```typescript
import { processImages } from "@/features/albums/utils/imageProcessing";

const results = await processImages(files, (current, total, filename) => {
  console.log(`Processing ${current}/${total}: ${filename}`);
  setProgress((current / total) * 100);
});
```

### Integration with Storage

The `uploadImage` function in `src/shared/lib/storage.ts` automatically processes images before upload:

```typescript
import { uploadImage } from "@/shared/lib/storage";

// Images are automatically processed before upload
const imageUrl = await uploadImage(file, `albums/${albumId}`);
```

## Processing Pipeline

```
User selects files
        ↓
Format detection (HEIC/JPEG/PNG)
        ↓
HEIC → JPEG conversion (if needed)
        ↓
Size check (> 2048px?)
        ↓
Resize and compress
        ↓
Return ProcessedImage
```

## Optimization Settings

| Setting       | Value       |
| ------------- | ----------- |
| Max Dimension | 2048px      |
| JPEG Quality  | 85%         |
| Target Format | JPEG        |
| Processing    | Client-side |

## Browser Compatibility

- **HEIC Conversion**: All modern browsers via JavaScript
- **Canvas API**: Universal support for image manipulation
- **File API**: HTML5 file input with format detection

### Supported Browsers

| Browser | Version | Notes        |
| ------- | ------- | ------------ |
| Chrome  | 92+     | Full support |
| Safari  | 15.4+   | Full support |
| Firefox | 90+     | Full support |
| Edge    | 92+     | Full support |

## Benefits

- **Universal Compatibility**: JPEG works in all browsers
- **Faster Loading**: Optimized images load quickly
- **Reduced Storage**: Lower Firebase storage costs
- **Better UX**: Consistent performance across devices

## Technical Notes

### HEIC Detection

Files are identified as HEIC through:

1. File extension (`.heic`, `.heif`)
2. MIME type (`image/heic`, `image/heif`)

### Canvas-Based Processing

All image manipulation uses the HTML5 Canvas API:

1. Load image into `<img>` element
2. Draw to canvas at target dimensions
3. Export as JPEG with compression
4. Create new File object

### Memory Management

- Images are processed sequentially to avoid memory issues
- Canvas elements are cleaned up after use
- Large batches use progress callbacks for UI feedback

## Dependencies

- `heic2any`: HEIC/HEIF to JPEG conversion
- Native Canvas API: Image resizing and compression

---

_Last updated: February 2026_
