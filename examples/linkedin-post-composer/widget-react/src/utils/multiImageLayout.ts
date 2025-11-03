/**
 * LinkedIn Multi-Image Layout Utility
 *
 * Implements LinkedIn's carousel layout algorithm based on image count:
 * - 2 images: Side by side (portrait)
 * - 3 images: 1 top (landscape), 2 bottom (square)
 * - 4 images: 1 top (landscape), 3 bottom (portrait)
 * - 5 images: 2 top (square), 3 bottom (portrait)
 * - 6+ images: Grid layout with "+N" overlay on last visible image
 */

export interface LayoutConfig {
  gridTemplate: string;           // CSS grid-template-areas
  imageClasses: string[];          // Tailwind classes for each image
  showOverlay: boolean;            // Whether to show "+N" overlay
  overlayCount: number;            // Number to show in "+N" overlay
  visibleCount: number;            // Number of images to display
}

export function calculateMultiImageLayout(imageCount: number): LayoutConfig {
  // 2 images: Side by side
  if (imageCount === 2) {
    return {
      gridTemplate: 'grid-cols-2 gap-1',
      imageClasses: [
        'col-span-1 aspect-[3/4]',  // Left image (portrait)
        'col-span-1 aspect-[3/4]',  // Right image (portrait)
      ],
      showOverlay: false,
      overlayCount: 0,
      visibleCount: 2
    };
  }

  // 3 images: 1 top (landscape), 2 bottom (square)
  if (imageCount === 3) {
    return {
      gridTemplate: 'grid-cols-2 gap-1',
      imageClasses: [
        'col-span-2 aspect-[4/3]',  // Top image (landscape)
        'col-span-1 aspect-square',  // Bottom left (square)
        'col-span-1 aspect-square',  // Bottom right (square)
      ],
      showOverlay: false,
      overlayCount: 0,
      visibleCount: 3
    };
  }

  // 4 images: 1 top (landscape), 3 bottom (portrait)
  if (imageCount === 4) {
    return {
      gridTemplate: 'grid-cols-3 gap-1',
      imageClasses: [
        'col-span-3 aspect-[4/3]',  // Top image (landscape)
        'col-span-1 aspect-[3/4]',  // Bottom left (portrait)
        'col-span-1 aspect-[3/4]',  // Bottom middle (portrait)
        'col-span-1 aspect-[3/4]',  // Bottom right (portrait)
      ],
      showOverlay: false,
      overlayCount: 0,
      visibleCount: 4
    };
  }

  // 5 images: 2 top (square), 3 bottom (portrait)
  if (imageCount === 5) {
    return {
      gridTemplate: 'grid-cols-3 gap-1',
      imageClasses: [
        'col-span-1 aspect-square',  // Top left (square) - actually spans more space
        'col-span-2 aspect-square',  // Top right (square) - spans 2 cols
        'col-span-1 aspect-[3/4]',   // Bottom left (portrait)
        'col-span-1 aspect-[3/4]',   // Bottom middle (portrait)
        'col-span-1 aspect-[3/4]',   // Bottom right (portrait)
      ],
      showOverlay: false,
      overlayCount: 0,
      visibleCount: 5
    };
  }

  // 6+ images: Show first 5 with "+N" overlay on last
  // Display pattern: 2 top, 3 bottom
  const remainingCount = imageCount - 5;
  return {
    gridTemplate: 'grid-cols-3 gap-1',
    imageClasses: [
      'col-span-1 aspect-square',  // Top left
      'col-span-2 aspect-square',  // Top right
      'col-span-1 aspect-[3/4]',   // Bottom left
      'col-span-1 aspect-[3/4]',   // Bottom middle
      'col-span-1 aspect-[3/4]',   // Bottom right (with overlay)
    ],
    showOverlay: true,
    overlayCount: remainingCount,
    visibleCount: 5
  };
}

/**
 * Get human-readable description of layout
 */
export function getLayoutDescription(imageCount: number): string {
  if (imageCount === 2) return "2 images side by side";
  if (imageCount === 3) return "1 large image on top, 2 below";
  if (imageCount === 4) return "1 large image on top, 3 below";
  if (imageCount === 5) return "2 images on top, 3 below";
  return `Showing first 5 of ${imageCount} images`;
}
