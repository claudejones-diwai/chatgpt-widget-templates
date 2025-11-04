// LinkedIn Documents API Integration
// Handles uploading documents and creating document posts

import { Env } from '../index';
import { LinkedInOAuth } from '../oauth/linkedin';

export interface InitializeDocumentUploadResponse {
  uploadUrl: string;
  uploadUrlExpiresAt: number;
  documentUrn: string;
}

export interface UploadDocumentArgs {
  userId: string;
  documentUrl: string;    // R2 URL of the document
  authorUrn: string;      // URN of person or organization (document owner)
  title: string;          // Document title for the post
}

export interface CreateDocumentPostArgs {
  userId: string;
  authorUrn: string;
  content: string;
  documentUrn: string;
  documentTitle: string;
}

export interface DocumentPostResponse {
  success: boolean;
  postId?: string;
  postUrl?: string;
  error?: string;
}

export class LinkedInDocumentsAPI {
  constructor(private env: Env) {}

  /**
   * Get access token for a user from KV storage
   */
  private async getAccessToken(userId: string): Promise<string | null> {
    const oauth = new LinkedInOAuth(this.env);
    return await oauth.getToken(userId);
  }

  /**
   * Initialize document upload with LinkedIn
   * Returns upload URL and document URN
   */
  private async initializeUpload(
    accessToken: string,
    ownerUrn: string
  ): Promise<InitializeDocumentUploadResponse | null> {
    try {
      console.log('Initializing document upload for owner:', ownerUrn);

      const response = await fetch(
        'https://api.linkedin.com/rest/documents?action=initializeUpload',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'LinkedIn-Version': '202511',  // Current version in YYYYMM format (November 2025)
            'X-Restli-Protocol-Version': '2.0.0',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            initializeUploadRequest: {
              owner: ownerUrn,
            },
          }),
        }
      );

      console.log('Initialize upload response status:', response.status);

      if (!response.ok) {
        const error = await response.text();
        console.error('LinkedIn document upload initialization failed:', response.status, error);
        return null;
      }

      const responseText = await response.text();
      console.log('Initialize upload response body:', responseText.substring(0, 500));

      let data: any;
      try {
        data = JSON.parse(responseText);
        console.log('Document upload initialized successfully:', data);
      } catch (parseError: any) {
        console.error('Failed to parse LinkedIn initialize upload response:', parseError);
        console.error('Response was:', responseText);
        return null;
      }

      return {
        uploadUrl: data.value.uploadUrl,
        uploadUrlExpiresAt: data.value.uploadUrlExpiresAt,
        documentUrn: data.value.document,
      };
    } catch (error: any) {
      console.error('Error initializing document upload:', error);
      return null;
    }
  }

  /**
   * Upload document to LinkedIn
   * Returns document URN that can be used in post
   */
  async uploadDocument(args: UploadDocumentArgs): Promise<string | null> {
    const accessToken = await this.getAccessToken(args.userId);

    if (!accessToken) {
      console.error('No access token found for user:', args.userId);
      return null;
    }

    try {
      // Step 1: Get document from R2
      // URL format: https://linkedin-post-composer-mcp.claude-8f5.workers.dev/images/linkedin-documents/123-file.pdf
      // Key format: linkedin-documents/123-file.pdf
      const documentKey = args.documentUrl.split('/images/')[1];

      if (!documentKey) {
        console.error('Invalid document URL format:', args.documentUrl);
        return null;
      }

      console.log('Fetching document from R2 with key:', documentKey);

      // Read document from R2 bucket
      const documentObject = await this.env.IMAGE_BUCKET.get(documentKey);

      if (!documentObject) {
        console.error('Document not found in R2:', documentKey);
        return null;
      }

      const documentData = await documentObject.arrayBuffer();
      console.log('Document fetched from R2, size:', documentData.byteLength, 'bytes');

      // Step 2: Initialize upload with LinkedIn
      const uploadInfo = await this.initializeUpload(accessToken, args.authorUrn);

      if (!uploadInfo) {
        console.error('Failed to initialize document upload');
        return null;
      }

      console.log('Uploading document to LinkedIn, URN:', uploadInfo.documentUrn);

      // Step 3: Upload document binary to LinkedIn's upload URL
      console.log('Starting document binary upload, size:', documentData.byteLength, 'bytes');

      const uploadResponse = await fetch(uploadInfo.uploadUrl, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': documentObject.httpMetadata?.contentType || 'application/pdf',
        },
        body: documentData,
      });

      console.log('Upload response status:', uploadResponse.status);

      if (!uploadResponse.ok) {
        const error = await uploadResponse.text();
        console.error('LinkedIn document upload failed:', uploadResponse.status, error);
        return null;
      }

      console.log('Document uploaded successfully, URN:', uploadInfo.documentUrn);
      return uploadInfo.documentUrn;
    } catch (error: any) {
      console.error('Error uploading document to LinkedIn:', error);
      console.error('Error stack:', error.stack);
      return null;
    }
  }

  /**
   * Create a post with a document using the new REST Posts API
   */
  async createDocumentPost(args: CreateDocumentPostArgs): Promise<DocumentPostResponse> {
    const accessToken = await this.getAccessToken(args.userId);

    if (!accessToken) {
      return {
        success: false,
        error: 'Not authenticated. Please connect your LinkedIn account.',
      };
    }

    try {
      console.log('Creating document post with URN:', args.documentUrn);

      // Build post payload using new REST Posts API format
      const payload: any = {
        author: args.authorUrn,
        commentary: args.content,
        visibility: 'PUBLIC',
        distribution: {
          feedDistribution: 'MAIN_FEED',
          targetEntities: [],
          thirdPartyDistributionChannels: [],
        },
        content: {
          media: {
            title: args.documentTitle,
            id: args.documentUrn,
          },
        },
        lifecycleState: 'PUBLISHED',
        isReshareDisabledByAuthor: false,
      };

      console.log('Post payload:', JSON.stringify(payload, null, 2));

      const response = await fetch('https://api.linkedin.com/rest/posts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'LinkedIn-Version': '202511',  // Current version for Posts API (November 2025)
          'X-Restli-Protocol-Version': '2.0.0',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log('Create post response status:', response.status);

      if (!response.ok) {
        const error = await response.text();
        console.error('LinkedIn document post creation failed:', response.status, error);
        return {
          success: false,
          error: `Failed to create document post: ${response.statusText}`,
        };
      }

      const responseText = await response.text();
      console.log('Create post response body:', responseText.substring(0, 500));

      let postData: any;
      try {
        postData = JSON.parse(responseText);
        console.log('Document post created successfully:', postData);
      } catch (parseError: any) {
        console.error('Failed to parse LinkedIn create post response:', parseError);
        console.error('Response was:', responseText);
        return {
          success: false,
          error: 'Failed to parse LinkedIn API response',
        };
      }

      const postId = postData.id;

      // Construct post URL
      const postUrl = `https://www.linkedin.com/feed/update/${postId}`;

      return {
        success: true,
        postId,
        postUrl,
      };
    } catch (error: any) {
      console.error('Error creating document post:', error);
      return {
        success: false,
        error: error.message || 'Failed to create document post',
      };
    }
  }

  /**
   * Complete flow: Upload document and create post
   */
  async uploadAndCreatePost(args: UploadDocumentArgs & { content: string }): Promise<DocumentPostResponse> {
    try {
      console.log('[uploadAndCreatePost] Starting flow with args:', {
        documentUrl: args.documentUrl?.substring(0, 50) + '...',
        authorUrn: args.authorUrn,
        title: args.title,
      });

      // Step 1: Upload document to LinkedIn
      const documentUrn = await this.uploadDocument({
        userId: args.userId,
        documentUrl: args.documentUrl,
        authorUrn: args.authorUrn,
        title: args.title,
      });

      if (!documentUrn) {
        console.error('[uploadAndCreatePost] Document upload failed');
        return {
          success: false,
          error: 'Failed to upload document to LinkedIn',
        };
      }

      console.log('[uploadAndCreatePost] Document uploaded, creating post...');

      // Step 2: Create post with document
      const result = await this.createDocumentPost({
        userId: args.userId,
        authorUrn: args.authorUrn,
        content: args.content,
        documentUrn,
        documentTitle: args.title,
      });

      console.log('[uploadAndCreatePost] Flow completed:', result.success ? 'success' : 'failed');
      return result;
    } catch (error: any) {
      console.error('[uploadAndCreatePost] Unexpected error:', error);
      console.error('[uploadAndCreatePost] Error stack:', error.stack);
      return {
        success: false,
        error: error.message || 'Unexpected error during document post creation',
      };
    }
  }
}
