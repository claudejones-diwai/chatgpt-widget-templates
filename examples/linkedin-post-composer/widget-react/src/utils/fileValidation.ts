// File validation utilities for LinkedIn API file type support
// Based on LinkedIn API documentation (2025)

export type PostType = 'text' | 'image' | 'video' | 'document' | 'carousel' | 'poll';

export interface FileValidationResult {
  valid: boolean;
  error?: string;
  fileType?: 'image' | 'video' | 'document';
}

// LinkedIn API file type specifications
const FILE_SPECS = {
  image: {
    extensions: ['.jpg', '.jpeg', '.png'],
    mimeTypes: ['image/jpeg', 'image/png'],
    maxSize: 10 * 1024 * 1024, // 10MB
    maxResolution: 36 * 1000 * 1000, // 36 megapixels
  },
  video: {
    extensions: ['.mp4', '.mov', '.avi', '.asf', '.flv', '.mkv', '.webm'],
    mimeTypes: ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/x-ms-asf',
                'video/x-flv', 'video/x-matroska', 'video/webm'],
    maxSize: 5 * 1024 * 1024 * 1024, // 5GB
    minSize: 75 * 1024, // 75KB
  },
  document: {
    extensions: ['.pdf', '.ppt', '.pptx', '.doc', '.docx'],
    mimeTypes: ['application/pdf', 'application/vnd.ms-powerpoint',
                'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    maxSize: 100 * 1024 * 1024, // 100MB
    maxPages: 300,
  },
};

/**
 * Get file extension from filename
 */
function getFileExtension(filename: string): string {
  return filename.toLowerCase().substring(filename.lastIndexOf('.'));
}

/**
 * Determine file type from filename and MIME type
 */
function determineFileType(filename: string, mimeType: string): 'image' | 'video' | 'document' | null {
  const extension = getFileExtension(filename);

  if (FILE_SPECS.image.extensions.includes(extension) || FILE_SPECS.image.mimeTypes.includes(mimeType)) {
    return 'image';
  }
  if (FILE_SPECS.video.extensions.includes(extension) || FILE_SPECS.video.mimeTypes.includes(mimeType)) {
    return 'video';
  }
  if (FILE_SPECS.document.extensions.includes(extension) || FILE_SPECS.document.mimeTypes.includes(mimeType)) {
    return 'document';
  }

  return null;
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Validate file for LinkedIn upload
 */
export function validateFile(file: File, postType: PostType): FileValidationResult {
  const fileType = determineFileType(file.name, file.type);

  // Check if file type is supported
  if (!fileType) {
    const extension = getFileExtension(file.name);
    return {
      valid: false,
      error: `File type "${extension}" is not supported. Supported types: Images (JPG, PNG), Videos (MP4, MOV, AVI), Documents (PDF, PPT, DOC)`,
    };
  }

  // Validate based on post type
  if (postType === 'image' && fileType !== 'image') {
    return {
      valid: false,
      error: 'Please select an image file (JPG or PNG)',
    };
  }

  if (postType === 'video' && fileType !== 'video') {
    return {
      valid: false,
      error: 'Please select a video file (MP4, MOV, AVI, etc.)',
    };
  }

  if (postType === 'document' && fileType !== 'document') {
    return {
      valid: false,
      error: 'Please select a document file (PDF, PPT, DOC)',
    };
  }

  // Validate file size
  const specs = FILE_SPECS[fileType];

  if (file.size > specs.maxSize) {
    return {
      valid: false,
      error: `File size (${formatFileSize(file.size)}) exceeds maximum allowed size of ${formatFileSize(specs.maxSize)}`,
    };
  }

  // Video-specific minimum size check
  if (fileType === 'video') {
    const videoSpecs = FILE_SPECS.video;
    if (file.size < videoSpecs.minSize) {
      return {
        valid: false,
        error: `Video file size (${formatFileSize(file.size)}) is below minimum required size of ${formatFileSize(videoSpecs.minSize)}`,
      };
    }
  }

  return {
    valid: true,
    fileType,
  };
}

/**
 * Get accepted file types for file input
 */
export function getAcceptedFileTypes(postType: PostType): string {
  switch (postType) {
    case 'image':
      return FILE_SPECS.image.mimeTypes.join(',');
    case 'video':
      return FILE_SPECS.video.mimeTypes.join(',');
    case 'document':
      return FILE_SPECS.document.mimeTypes.join(',');
    case 'carousel':
      return FILE_SPECS.image.mimeTypes.join(',');
    default:
      return '';
  }
}

/**
 * Read file as base64
 */
export function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result);
    };
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Read file as data URL (for preview)
 */
export function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    reader.readAsDataURL(file);
  });
}
