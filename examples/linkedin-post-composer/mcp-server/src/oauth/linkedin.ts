import { Env } from '../index';

interface LinkedInProfile {
  sub: string;  // User ID
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  email: string;
  email_verified: boolean;
}

interface LinkedInTokenResponse {
  access_token: string;
  expires_in: number;  // seconds
  refresh_token?: string;
  scope: string;
}

interface StoredTokenData {
  access_token: string;
  refresh_token?: string;
  expires_at: number;
  scope: string;
}

export class LinkedInOAuth {
  private baseUrl: string;

  constructor(private env: Env, requestUrl?: string) {
    // Dynamically determine base URL from request, or use a default
    if (requestUrl) {
      const url = new URL(requestUrl);
      this.baseUrl = `${url.protocol}//${url.host}`;
    } else {
      // Fallback for environments where request URL isn't available
      this.baseUrl = 'https://linkedin-post-composer-mcp.workers.dev';
    }
  }

  /**
   * Step 1: Generate OAuth authorization URL
   */
  getAuthorizationUrl(state: string): string {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.env.LINKEDIN_CLIENT_ID || '',
      redirect_uri: `${this.baseUrl}/oauth/callback`,
      state: state,
      scope: 'openid profile w_member_social r_organization_social w_organization_social rw_organization_admin',
    });

    return `https://www.linkedin.com/oauth/v2/authorization?${params}`;
  }

  /**
   * Step 2: Exchange authorization code for access token
   */
  async exchangeCodeForToken(code: string): Promise<LinkedInTokenResponse> {
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      client_id: this.env.LINKEDIN_CLIENT_ID || '',
      client_secret: this.env.LINKEDIN_CLIENT_SECRET || '',
      redirect_uri: `${this.baseUrl}/oauth/callback`,
    });

    const response = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`LinkedIn token exchange failed: ${error}`);
    }

    return await response.json();
  }

  /**
   * Step 3: Get user profile with access token
   */
  async getUserProfile(accessToken: string): Promise<LinkedInProfile> {
    const response = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`LinkedIn profile fetch failed: ${error}`);
    }

    return await response.json();
  }

  /**
   * Step 4: Store access token in KV
   */
  async storeToken(userId: string, tokenData: LinkedInTokenResponse): Promise<void> {
    const expiresAt = Date.now() + (tokenData.expires_in * 1000);

    const storedData: StoredTokenData = {
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_at: expiresAt,
      scope: tokenData.scope,
    };

    await this.env.OAUTH_TOKENS.put(
      `linkedin:${userId}`,
      JSON.stringify(storedData),
      { expirationTtl: tokenData.expires_in }
    );
  }

  /**
   * Step 5: Retrieve access token from KV
   */
  async getToken(userId: string): Promise<string | null> {
    const dataString = await this.env.OAUTH_TOKENS.get(`linkedin:${userId}`);

    if (!dataString) {
      return null;
    }

    const data: StoredTokenData = JSON.parse(dataString);

    // Check if token is expired
    if (data.expires_at && Date.now() >= data.expires_at) {
      // TODO: Implement token refresh
      return null;
    }

    return data.access_token;
  }
}
