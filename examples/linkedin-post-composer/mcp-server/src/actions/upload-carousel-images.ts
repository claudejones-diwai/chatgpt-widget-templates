import type { UploadCarouselImagesOutput } from '../../../shared-types';
import { R2ImageStorage } from '../integrations/r2-storage';
import type { Env } from '../index';

export interface CarouselImageInput {
  image: string;      // base64 encoded image data (with data:image/... prefix)
  filename: string;
  order: number;      // Display order
}

export interface UploadCarouselImagesParams {
  images: CarouselImageInput[];
}

export async function handleUploadCarouselImages(
  params: UploadCarouselImagesParams,
  env: Env
): Promise<UploadCarouselImagesOutput> {
  const { images } = params;

  // Validate: 2-20 images
  if (images.length < 2) {
    return {
      success: false,
      error: 'Carousel requires at least 2 images',
      message: 'Please upload 2-20 images for a carousel post'
    };
  }

  if (images.length > 20) {
    return {
      success: false,
      error: 'Carousel supports maximum 20 images',
      message: 'Please select no more than 20 images'
    };
  }

  // Validate all filenames
  const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  for (const img of images) {
    const hasValidExtension = validExtensions.some(ext =>
      img.filename.toLowerCase().endsWith(ext)
    );
    if (!hasValidExtension) {
      return {
        success: false,
        error: `Invalid file type for ${img.filename}. Allowed: jpg, jpeg, png, gif, webp`
      };
    }
  }

  const validatedImages: { url: string; imageKey: string; order: number }[] = [];

  try {
    // Validate all images
    for (const img of images) {
      // Validate base64 data URL format
      const matches = img.image.match(/^data:([^;]+);base64,(.+)$/);

      if (!matches) {
        return {
          success: false,
          error: `Invalid image data format for ${img.filename}. Expected base64 data URL.`
        };
      }

      const contentType = matches[1];

      // Validate it's an image content type
      if (!contentType.startsWith('image/')) {
        return {
          success: false,
          error: `Invalid content type for ${img.filename}. Expected image/*`
        };
      }

      // Store the data URI directly (no R2 upload)
      validatedImages.push({
        url: img.image, // Return the data URI itself
        imageKey: img.filename,
        order: img.order
      });

      console.log(`Validated carousel image ${img.order + 1}/${images.length}: ${img.filename}`);
    }

    // Sort by order to ensure consistency
    validatedImages.sort((a, b) => a.order - b.order);

    console.log(`Successfully validated ${validatedImages.length} carousel images for direct upload`);

    return {
      success: true,
      images: validatedImages,
      message: `Successfully validated ${validatedImages.length} images`
    };
  } catch (error: any) {
    console.error('Carousel validation error:', error);
    return {
      success: false,
      error: error.message || 'Failed to validate carousel images'
    };
  }
}
