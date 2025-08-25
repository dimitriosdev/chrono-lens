# Image Processing and Optimization

Chrono-lens now includes advanced image processing capabilities that automatically handle format conversion and optimization for better performance and compatibility.

## Features

### Supported Formats

**Input Formats:**

- JPEG/JPG
- PNG
- WebP
- GIF
- **HEIC/HEIF** (automatically converted)

**Output Formats:**

- JPEG (for HEIC conversions)
- PNG (preserved for transparency)
- WebP (preserved)
- GIF (preserved)

### Automatic Processing

The application automatically processes uploaded images:

1. **HEIC Conversion**: HEIC/HEIF files are automatically converted to JPEG format for browser compatibility
2. **Image Optimization**: Large images are resized and compressed to improve performance
3. **Quality Preservation**: Smart compression maintains visual quality while reducing file size

## Configuration

Image processing behavior can be configured in `src/utils/imageProcessing.ts`:

```typescript
export const IMAGE_OPTIMIZATION_CONFIG = {
  // Maximum dimensions for optimized images
  MAX_WIDTH: 1920,
  MAX_HEIGHT: 1920,
  // JPEG quality (0.1 to 1.0)
  JPEG_QUALITY: 0.85,
  // Maximum file size before optimization
  MAX_FILE_SIZE_BEFORE_OPTIMIZATION: 2 * 1024 * 1024, // 2MB
  // Target file size after optimization
  TARGET_FILE_SIZE: 1 * 1024 * 1024, // 1MB
};
```

## Processing Logic

### HEIC Conversion

- Uses the `heic2any` library for reliable conversion
- Maintains original image quality during conversion
- Automatically updates file extensions from .heic/.heif to .jpg

### Image Optimization

Images are optimized when they meet any of these criteria:

- File size exceeds 2MB
- Dimensions exceed 1920x1920 pixels

Optimization includes:

- Proportional resizing to fit within max dimensions
- Quality-based compression to target file size
- Multiple compression attempts to achieve optimal balance

### Processing Pipeline

1. **File Validation**: Check file type and size limits
2. **HEIC Detection**: Identify HEIC/HEIF files for conversion
3. **Format Conversion**: Convert HEIC to JPEG if needed
4. **Optimization Check**: Determine if image needs resizing/compression
5. **Processing**: Apply optimizations while maintaining quality
6. **Result**: Return processed image with metadata

## User Experience

### Visual Feedback

- Processing progress indicator during bulk uploads
- Before/after file size comparison
- Conversion and optimization status
- Storage savings summary

### Error Handling

- Graceful fallback for processing failures
- Detailed error messages for unsupported scenarios
- Automatic retry with different quality settings

## User Experience

The image processing is seamlessly integrated into the album creation and editing workflow:

- **Album Creation** (`/albums/new`): Upload images with automatic processing
- **Album Editing** (`/albums/[id]/edit`): Add new images with processing
- **Real-time Feedback**: Progress bars and processing status
- **Transparency**: Users see exactly what was optimized
- **Storage Savings**: Display compression ratios and space saved

## Performance Benefits

- **Faster Loading**: Optimized images load significantly faster
- **Reduced Storage**: Lower storage costs with smaller file sizes
- **Better UX**: Consistent performance across different devices
- **Universal Compatibility**: JPEG format works in all browsers

## Browser Compatibility

- **HEIC Conversion**: Works in all modern browsers via JavaScript
- **Image Optimization**: Universal canvas-based processing
- **File Upload**: Standard HTML5 file input with format detection

## Technical Implementation

The image processing system uses:

- `heic2any` library for HEIC conversion
- HTML5 Canvas API for image manipulation
- Web Workers (future enhancement) for background processing
- Progressive compression for optimal quality/size balance

## Integration Points

### Upload Flow Integration

The image processing is seamlessly integrated into the album creation workflow:

1. **File Selection**: Updated file input accepts HEIC files (`.heic`, `.heif`)
2. **Validation**: Extended validation supports new file types
3. **Processing**: Automatic processing before Firebase upload
4. **Storage**: Optimized files are uploaded to reduce storage costs
5. **Display**: Processed images work universally across all browsers

### Component Updates

- **ImageGrid**: Updated to accept HEIC files
- **AlbumImagesSection**: Includes processing status and progress
- **ImageProcessingStatus**: New component for user feedback
- **File Validation**: Extended to support HEIC formats

### Storage Optimization

- **Reduced Upload Time**: Smaller files upload faster
- **Lower Storage Costs**: Optimized images use less Firebase storage
- **Better Performance**: Faster loading in albums and slideshows
- **Cache Efficiency**: Smaller images improve CDN performance

## Code Examples

### Basic Processing

```typescript
import { processImage } from "@/utils/imageProcessing";

const result = await processImage(file);
if (result.wasConverted) {
  console.log(
    `HEIC converted: ${result.originalFormat} → ${result.processedFormat}`
  );
}
if (result.wasOptimized) {
  console.log(
    `Size reduced: ${formatFileSize(result.originalSize)} → ${formatFileSize(
      result.processedSize
    )}`
  );
}
```

### Batch Processing with Progress

```typescript
import { processImages } from "@/utils/imageProcessing";

const results = await processImages(files, (current, total, filename) => {
  console.log(`Processing ${current}/${total}: ${filename}`);
  updateProgressBar(current / total);
});
```

### Usage in Components

```tsx
import { ImageProcessingStatus } from "@/components/ImageProcessingStatus";

function UploadSection() {
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState([]);

  return (
    <div>
      <ImageProcessingStatus
        isProcessing={processing}
        processedImages={results}
        progress={progress}
      />
      {/* Upload interface */}
    </div>
  );
}
```

## Future Enhancements

### Planned Improvements

- **WebP Conversion**: Convert all images to WebP for better compression
- **Progressive Loading**: Generate multiple image sizes for responsive loading
- **Background Processing**: Implement Web Workers for better performance
- **EXIF Preservation**: Maintain important metadata during processing
- **Thumbnail Generation**: Create optimized thumbnails for grid views

### Additional Format Support

- **RAW Image Support**: Process camera RAW formats
- **AVIF Format**: Next-generation image format support
- **Animated Image Handling**: Better GIF and animated WebP processing

## Monitoring and Analytics

### Processing Metrics

- Conversion success rates
- Average file size reduction
- Processing time per image
- Storage savings over time

### Error Tracking

- Failed conversion attempts
- Unsupported file scenarios
- Browser compatibility issues
- Performance bottlenecks

---

_Implementation completed: August 26, 2025_
_Last updated: August 26, 2025_
