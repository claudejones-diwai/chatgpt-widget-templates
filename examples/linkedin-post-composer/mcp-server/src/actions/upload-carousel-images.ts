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

  const uploadedImages: { url: string; imageKey: string; order: number }[] = [];
  const storage = new R2ImageStorage(env);

  try {
    // Upload all images
    for (const img of images) {
      // Parse base64 data URL
      const matches = img.image.match(/^data:([^;]+);base64,(.+)$/);

      if (!matches) {
        return {
          success: false,
          error: `Invalid image data format for ${img.filename}. Expected base64 data URL.`
        };
      }

      const contentType = matches[1];
      const base64Data = matches[2];

      // Convert base64 to Uint8Array
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Upload to R2
      const result = await storage.uploadImage({
        imageData: bytes,
        fileName: img.filename,
        contentType,
      });

      if (!result.success) {
        return {
          success: false,
          error: result.error || `Failed to upload ${img.filename}`
        };
      }

      uploadedImages.push({
        url: result.publicUrl!,
        imageKey: result.key!,
        order: img.order
      });

      console.log(`Uploaded carousel image ${img.order + 1}/${images.length}: ${img.filename}`);
    }

    // Sort by order to ensure consistency
    uploadedImages.sort((a, b) => a.order - b.order);

    console.log(`Successfully uploaded ${uploadedImages.length} carousel images`);

    return {
      success: true,
      images: uploadedImages,
      message: `Successfully uploaded ${uploadedImages.length} images`
    };
  } catch (error: any) {
    console.error('Carousel upload error:', error);
    return {
      success: false,
      error: error.message || 'Failed to process and upload carousel images'
    };
  }
}
