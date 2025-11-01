import type { UploadImageOutput } from '../../../shared-types';
import { uploadImage as uploadImageAPI } from '../integrations/linkedin-api';

export interface UploadImageParams {
  image: string;      // base64 encoded image data
  filename: string;
}

export async function handleUploadImage(params: UploadImageParams): Promise<UploadImageOutput> {
  const { image, filename } = params;

  // Validate filename extension
  const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  const hasValidExtension = validExtensions.some(ext =>
    filename.toLowerCase().endsWith(ext)
  );

  if (!hasValidExtension) {
    return {
      success: false,
      error: 'Invalid file type. Allowed: jpg, jpeg, png, gif, webp'
    };
  }

  // Upload to R2 (stub in Phase 1)
  const result = await uploadImageAPI(image, filename);
  return result;
}
