import type { UploadDocumentOutput } from '../../../shared-types';
import { R2ImageStorage } from '../integrations/r2-storage';
import type { Env } from '../index';

export interface UploadDocumentParams {
  document: string;      // base64 encoded document data (with data:application/... prefix)
  filename: string;
  fileType: string;      // MIME type
  fileSize: number;      // File size in bytes
}

export async function handleUploadDocument(params: UploadDocumentParams, env: Env): Promise<UploadDocumentOutput> {
  const { document, filename, fileType, fileSize } = params;

  // Validate file type
  const validTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
  ];

  if (!validTypes.includes(fileType)) {
    return {
      success: false,
      error: 'Invalid file type. Allowed: PDF, Word (.doc, .docx), PowerPoint (.ppt, .pptx)'
    };
  }

  // Validate file size (50MB max for LinkedIn documents)
  const maxSize = 50 * 1024 * 1024; // 50MB
  if (fileSize > maxSize) {
    return {
      success: false,
      error: 'Document must be less than 50MB'
    };
  }

  try {
    // Parse base64 data URL
    // Format: data:application/pdf;base64,JVBERi0xLjQK...
    const matches = document.match(/^data:([^;]+);base64,(.+)$/);

    if (!matches) {
      return {
        success: false,
        error: 'Invalid document data format. Expected base64 data URL.'
      };
    }

    const contentType = matches[1];
    const base64Data = matches[2];

    // Convert base64 to Uint8Array (optimized for large files)
    const binaryString = atob(base64Data);
    const bytes = Uint8Array.from(binaryString, c => c.charCodeAt(0));

    // Upload to R2 (reusing R2ImageStorage with document support)
    const storage = new R2ImageStorage(env);
    const result = await storage.uploadDocument({
      documentData: bytes,
      fileName: filename,
      contentType,
    });

    if (!result.success) {
      return {
        success: false,
        error: result.error || 'Failed to upload document'
      };
    }

    return {
      success: true,
      documentUrl: result.publicUrl!,
      documentKey: result.key!,
    };
  } catch (error: any) {
    console.error('Upload document error:', error);
    return {
      success: false,
      error: error.message || 'Failed to process and upload document'
    };
  }
}
