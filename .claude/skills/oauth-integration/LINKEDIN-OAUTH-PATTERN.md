# LinkedIn OAuth Integration Pattern

**Purpose:** Automate LinkedIn OAuth integration for ChatGPT widgets with clear human/AI task boundaries

**Use Cases:**
- Single-tenant: Developer's own LinkedIn app credentials
- Multi-tenant SaaS: Each user configures their own LinkedIn app via UI

---

## Pattern Overview

### Human Tasks (Requires User Input)
These tasks **CANNOT** be automated and require human intervention:

1. **Create LinkedIn Developer App** (One-time setup)
   - Go to https://www.linkedin.com/developers/apps
   - Click "Create app"
   - Fill in app details (name, company page, logo)
   - Obtain Client ID and Client Secret

2. **Provide Credentials to AI** (Secure handoff)
   - Provide Client ID (public, safe to share with AI)
   - Provide Client Secret (private, paste directly in terminal when prompted by AI)

3. **Test OAuth Flow** (Manual verification)
   - Click OAuth initiation URL provided by AI
   - Authorize app on LinkedIn
   - Verify success page displays correctly

### AI Tasks (Fully Automated)
These tasks can be executed autonomously once credentials are provided:

1. **Store Credentials in Cloudflare Secrets**
   ```bash
   cd mcp-server
   npx wrangler secret put LINKEDIN_CLIENT_ID
   npx wrangler secret put LINKEDIN_CLIENT_SECRET
   npx wrangler secret list  # Verify
   ```

2. **Create KV Namespace for OAuth Tokens**
   ```bash
   npx wrangler kv namespace create "OAUTH_TOKENS"
   # Capture namespace ID from output
   ```

3. **Update wrangler.toml with KV Binding**
   ```toml
   [[kv_namespaces]]
   binding = "OAUTH_TOKENS"
   id = "{captured-namespace-id}"
   ```

4. **Implement OAuth Flow Code**
   - Create `src/oauth/linkedin.ts` with OAuth class
   - Update `src/index.ts` with OAuth routes (`/oauth/linkedin`, `/oauth/callback`)
   - Update Env interface with `OAUTH_TOKENS: KVNamespace`

5. **Build and Deploy**
   ```bash
   npm run build
   npx wrangler deploy
   ```

6. **Test OAuth Endpoints**
   ```bash
   curl -I https://{worker-url}/oauth/linkedin  # Should return 302 redirect
   curl https://{worker-url}/health  # Should return healthy status
   ```

7. **Provide Test URL to User**
   - Return OAuth initiation URL for manual testing
   - Format: `https://{worker-url}/oauth/linkedin`

---

## Step-by-Step Automation Flow

### Phase 1: Setup (Human → AI Handoff)

**Human:** Create LinkedIn App
```
1. Go to https://www.linkedin.com/developers/apps
2. Create app with these details:
   - App name: "{project-name}"
   - Company: {your-company}
   - Logo: (optional)
3. Navigate to "Auth" tab
4. Copy Client ID
5. Copy Client Secret (click eye icon to reveal)
6. Configure OAuth 2.0 settings:
   - Redirect URLs:
     * https://{worker-name}.{account}.workers.dev/oauth/callback
     * http://localhost:8787/oauth/callback
7. Go to "Products" tab
8. Request access to:
   - "Sign In with LinkedIn using OpenID Connect"
   - "Share on LinkedIn" (requires verification)
```

**Human → AI:** Provide credentials
```
I have created the LinkedIn app. Here are the credentials:
- Client ID: 86d4bjtmqjxh2d
- Client Secret: (I'll paste when prompted)
```

### Phase 2: Configuration (AI Automated)

**AI:** Store credentials
```bash
cd examples/{project-name}/mcp-server

# Add Client ID
npx wrangler secret put LINKEDIN_CLIENT_ID
# Paste: 86d4bjtmqjxh2d

# Add Client Secret
npx wrangler secret put LINKEDIN_CLIENT_SECRET
# Paste: {user-provided-secret}

# Verify
npx wrangler secret list
```

**Expected Output:**
```json
[
  {"name": "LINKEDIN_CLIENT_ID", "type": "secret_text"},
  {"name": "LINKEDIN_CLIENT_SECRET", "type": "secret_text"}
]
```

**AI:** Create KV namespace
```bash
npx wrangler kv namespace create "OAUTH_TOKENS"
```

**Expected Output:**
```
🌀 Creating namespace with title "OAUTH_TOKENS"
✨ Success!
{ "binding": "OAUTH_TOKENS", "id": "67a1346ec75b4f2a836a9031c576639b" }
```

**AI:** Update wrangler.toml
```toml
name = "{project-name}-mcp"
main = "dist/mcp-server/src/index.js"
compatibility_date = "2025-01-27"

[build]
command = "npm run build"

[[kv_namespaces]]
binding = "OAUTH_TOKENS"
id = "67a1346ec75b4f2a836a9031c576639b"  # From previous step
```

### Phase 3: Implementation (AI Automated)

**AI:** Create OAuth implementation file

**File:** `src/oauth/linkedin.ts`
```typescript
import { Env } from '../index';

interface LinkedInProfile {
  sub: string;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  email: string;
  email_verified: boolean;
}

interface LinkedInTokenResponse {
  access_token: string;
  expires_in: number;
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
    if (requestUrl) {
      const url = new URL(requestUrl);
      this.baseUrl = `${url.protocol}//${url.host}`;
    } else {
      this.baseUrl = 'https://{worker-name}.workers.dev';
    }
  }

  getAuthorizationUrl(state: string): string {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.env.LINKEDIN_CLIENT_ID || '',
      redirect_uri: `${this.baseUrl}/oauth/callback`,
      state: state,
      scope: 'openid profile w_member_social',
    });
    return `https://www.linkedin.com/oauth/v2/authorization?${params}`;
  }

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
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`LinkedIn token exchange failed: ${error}`);
    }

    return await response.json();
  }

  async getUserProfile(accessToken: string): Promise<LinkedInProfile> {
    const response = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`LinkedIn profile fetch failed: ${error}`);
    }

    return await response.json();
  }

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

  async getToken(userId: string): Promise<string | null> {
    const dataString = await this.env.OAUTH_TOKENS.get(`linkedin:${userId}`);
    if (!dataString) return null;

    const data: StoredTokenData = JSON.parse(dataString);
    if (data.expires_at && Date.now() >= data.expires_at) {
      return null;  // Token expired
    }

    return data.access_token;
  }
}
```

**AI:** Update main index.ts

**File:** `src/index.ts` (Add imports)
```typescript
import { LinkedInOAuth } from "./oauth/linkedin";
```

**File:** `src/index.ts` (Update Env interface)
```typescript
export interface Env {
  OPENAI_API_KEY?: string;
  LINKEDIN_CLIENT_ID?: string;
  LINKEDIN_CLIENT_SECRET?: string;
  R2_BUCKET_NAME?: string;
  OAUTH_TOKENS: KVNamespace;  // Add this
}
```

**File:** `src/index.ts` (Add OAuth routes before MCP endpoint)
```typescript
// OAuth initiation endpoint
if (url.pathname === "/oauth/linkedin") {
  const state = crypto.randomUUID();
  const oauth = new LinkedInOAuth(env, request.url);
  const authUrl = oauth.getAuthorizationUrl(state);
  return Response.redirect(authUrl, 302);
}

// OAuth callback endpoint
if (url.pathname === "/oauth/callback") {
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");

  if (error) {
    return new Response(`OAuth Error: ${error}`, { status: 400 });
  }

  if (!code) {
    return new Response("Missing authorization code", { status: 400 });
  }

  try {
    const oauth = new LinkedInOAuth(env, request.url);
    const tokenData = await oauth.exchangeCodeForToken(code);
    const profile = await oauth.getUserProfile(tokenData.access_token);
    await oauth.storeToken(profile.sub, tokenData);

    return new Response(`
      <!DOCTYPE html>
      <html>
        <head><title>LinkedIn Connected</title></head>
        <body style="font-family: system-ui; max-width: 600px; margin: 50px auto; text-align: center;">
          <div style="background: #efe; border: 2px solid #3c3; border-radius: 8px; padding: 30px;">
            <h1 style="color: #3c3;">✅ LinkedIn Connected!</h1>
            <img src="${profile.picture}" style="width: 80px; border-radius: 50%;" />
            <p><strong>${profile.name}</strong></p>
            <p>${profile.email}</p>
            <p style="color: #666; margin-top: 20px;">You can close this window</p>
          </div>
        </body>
      </html>
    `, { headers: { "Content-Type": "text/html" } });
  } catch (err: any) {
    console.error("OAuth error:", err);
    return new Response(`OAuth failed: ${err.message}`, { status: 500 });
  }
}
```

### Phase 4: Deployment (AI Automated)

**AI:** Build and deploy
```bash
cd mcp-server
npm run build
npx wrangler deploy
```

**Expected Output:**
```
Total Upload: 30.46 KiB / gzip: 7.19 KiB
Your Worker has access to the following bindings:
Binding                                                  Resource
env.OAUTH_TOKENS (67a1346ec75b4f2a836a9031c576639b)      KV Namespace

Deployed {project-name}-mcp triggers (1.15 sec)
  https://{project-name}-mcp.{account}.workers.dev
```

**AI:** Test endpoints
```bash
# Test OAuth redirect
curl -I https://{worker-url}/oauth/linkedin

# Expected: HTTP/2 302 with location header to LinkedIn

# Test health
curl https://{worker-url}/health

# Expected: {"status":"healthy",...}
```

### Phase 5: Testing (Human Verification)

**AI → Human:** Provide test URL
```
✅ LinkedIn OAuth integration complete!

Test the OAuth flow:
1. Open this URL in your browser:
   https://{worker-url}/oauth/linkedin

2. You should:
   - Be redirected to LinkedIn authorization page
   - See "{app-name} wants to access your profile"
   - Click "Allow"
   - Be redirected back to success page showing your profile

3. Verify token storage (optional):
   # IMPORTANT: Use --remote flag to access production KV (not local dev storage)
   npx wrangler kv key list --namespace-id={namespace-id} --remote

   # Get specific token data
   npx wrangler kv key get "linkedin:{userId}" --namespace-id={namespace-id} --remote
```

**Important: Local vs. Remote KV Storage**
- **Local KV**: Used for development with `wrangler dev` (default for CLI commands)
- **Remote KV**: Production storage used by deployed workers (requires `--remote` flag)
- Always use `--remote` flag when verifying tokens in production after deployment

---

## Multi-Tenant SaaS Pattern

For multi-tenant SaaS, the OAuth flow changes:

### Current Single-Tenant:
- Developer creates LinkedIn app
- Credentials stored in Cloudflare secrets (global)
- All users share same LinkedIn app

### Future Multi-Tenant:
- Each customer creates their own LinkedIn app
- Credentials stored in KV per tenant (not secrets)
- Each customer has isolated LinkedIn integration

**Implementation Changes for Multi-Tenant:**

1. **Tenant Onboarding UI**
   - Customer inputs Client ID and Client Secret via web form
   - Store per-tenant: `TENANT_CONFIGS.put(tenantId, { linkedin_client_id, linkedin_client_secret })`

2. **Dynamic OAuth Class**
   ```typescript
   // Instead of env.LINKEDIN_CLIENT_ID
   const tenantConfig = await env.TENANT_CONFIGS.get(tenantId, 'json');
   const oauth = new LinkedInOAuth(tenantConfig.linkedin_client_id, tenantConfig.linkedin_client_secret);
   ```

3. **Tenant-Scoped Token Storage**
   ```typescript
   // Instead of linkedin:userId
   await env.OAUTH_TOKENS.put(`${tenantId}:linkedin:${userId}`, tokenData);
   ```

---

## Automation Checklist

When implementing LinkedIn OAuth, AI can check off these tasks autonomously:

- [ ] **Credentials received from user**
  - Client ID provided
  - Client Secret provided

- [ ] **Cloudflare configuration (AI automated)**
  - [ ] Secrets stored via `wrangler secret put`
  - [ ] Secrets verified via `wrangler secret list`
  - [ ] KV namespace created
  - [ ] KV namespace ID captured
  - [ ] wrangler.toml updated with KV binding

- [ ] **Code implementation (AI automated)**
  - [ ] `src/oauth/linkedin.ts` created
  - [ ] `src/index.ts` imports added
  - [ ] Env interface updated
  - [ ] OAuth routes added (`/oauth/linkedin`, `/oauth/callback`)
  - [ ] Success/error HTML pages included

- [ ] **Build and deploy (AI automated)**
  - [ ] TypeScript compilation successful
  - [ ] Wrangler deploy successful
  - [ ] KV binding confirmed in deployment output

- [ ] **Testing (AI automated + human verification)**
  - [ ] OAuth initiation endpoint returns 302 redirect
  - [ ] Health endpoint returns 200
  - [ ] Test URL provided to human
  - [ ] Human confirms OAuth flow works end-to-end

---

## Pattern for Other OAuth Providers

This same pattern applies to other OAuth providers:

### Twitter/X OAuth
- Replace LinkedIn URLs with Twitter OAuth URLs
- Scopes: `tweet.read`, `tweet.write`, `users.read`
- Same KV storage pattern

### GitHub OAuth
- Replace LinkedIn URLs with GitHub OAuth URLs
- Scopes: `user`, `repo` (as needed)
- Same KV storage pattern

### Google OAuth
- Replace LinkedIn URLs with Google OAuth URLs
- Scopes: `openid`, `profile`, `email`
- Same KV storage pattern

**Reusable Components:**
1. KV namespace for token storage (same across all providers)
2. OAuth class structure (adapt URLs and scopes)
3. `/oauth/{provider}` and `/oauth/callback` routes
4. Success/error HTML pages

---

## Security Best Practices

1. **Never commit secrets to git**
   - Use `wrangler secret put` (encrypted at rest)
   - For multi-tenant, store in KV (encrypted)

2. **Validate redirect URIs**
   - Only allow configured redirect URIs
   - Prevent open redirect vulnerabilities

3. **Use state parameter**
   - Generate random state with `crypto.randomUUID()`
   - Validate state on callback (prevents CSRF)

4. **Token expiration**
   - Store `expires_at` timestamp
   - Implement token refresh if provider supports it
   - Return `null` for expired tokens

5. **HTTPS only**
   - Never use OAuth over HTTP in production
   - Localhost HTTP acceptable for development only

---

## Future Enhancements

1. **Token Refresh**
   - Implement automatic token refresh before expiration
   - Store refresh token securely in KV

2. **OAuth State Validation**
   - Store state in KV with short TTL
   - Validate on callback to prevent CSRF

3. **Multi-Account Support**
   - Allow users to connect multiple LinkedIn accounts
   - Store multiple tokens per user: `linkedin:{userId}:account1`, `linkedin:{userId}:account2`

4. **Revocation**
   - Implement `/oauth/revoke` endpoint
   - Delete tokens from KV
   - Call provider's revoke endpoint

5. **Audit Logging**
   - Log OAuth events (connect, refresh, revoke)
   - Store in separate KV namespace or external service
