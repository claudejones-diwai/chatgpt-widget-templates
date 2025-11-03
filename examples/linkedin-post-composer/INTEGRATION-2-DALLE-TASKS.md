# Integration 2: DALL-E Image Generation - Task Breakdown

**Status:** Ready to Begin
**Prerequisites:** Integration 1 (LinkedIn OAuth) Complete ✅

---

## Human Tasks (Requires Your Input)

### Task 1: Get OpenAI API Key

**What You Need to Do:**
1. Go to https://platform.openai.com/
2. Sign in or create account
3. Add payment method at https://platform.openai.com/account/billing
   - DALL-E 3 pricing:
     - 1024x1024: $0.040/image
     - 1024x1792 or 1792x1024: $0.080/image
4. Generate API key at https://platform.openai.com/api-keys
   - Click "Create new secret key"
   - Name it: "LinkedIn Post Composer"
   - **IMPORTANT:** Copy the key immediately (starts with `sk-...`)
   - You'll only see it once!

5. **Provide to AI:**
   ```
   I have the OpenAI API key: sk-...
   ```

**What Happens Next:**
Once you provide the API key, I will:
- Store it securely in Cloudflare secrets
- Verify it's stored correctly
- Continue with implementation

---

## AI Tasks (Fully Automated)

Once you provide the OpenAI API key, I can complete these tasks autonomously:

### Task 2: Store OpenAI API Key in Cloudflare

**Commands I'll Run:**
```bash
cd mcp-server
npx wrangler secret put OPENAI_API_KEY
# Paste your API key when prompted
npx wrangler secret list  # Verify
```

**Expected Result:**
```json
[
  {"name": "LINKEDIN_CLIENT_ID", "type": "secret_text"},
  {"name": "LINKEDIN_CLIENT_SECRET", "type": "secret_text"},
  {"name": "OPENAI_API_KEY", "type": "secret_text"}  // New
]
```

### Task 3: Implement DALL-E Integration

**Files I'll Create:**

1. **`src/integrations/dalle.ts`** - DALL-E API client
   - `DalleImageGenerator` class
   - `generateImage()` method
   - `downloadImage()` method (URLs expire in 1 hour)

2. **Update `src/actions/generate-image.ts`** - Replace mock with real API
   - Call DALL-E 3 API
   - Handle errors (rate limits, content policy violations)
   - Return temporary image URL

**Implementation Details:**
```typescript
// src/integrations/dalle.ts
export class DalleImageGenerator {
  async generateImage(args: {
    prompt: string;
    style?: 'natural' | 'vivid';
    size?: '1024x1024' | '1792x1024' | '1024x1792';
  }): Promise<{
    success: boolean;
    imageUrl?: string;
    revisedPrompt?: string;
    error?: string;
  }> {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: args.prompt,
        n: 1,
        size: args.size || '1024x1024',
        quality: 'standard',
        style: args.style || 'natural',
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: error.error?.message || 'Image generation failed',
      };
    }

    const data = await response.json();
    return {
      success: true,
      imageUrl: data.data[0].url,  // Temporary URL (expires in 1 hour)
      revisedPrompt: data.data[0].revised_prompt,
    };
  }
}
```

### Task 4: Build and Deploy

**Commands I'll Run:**
```bash
cd mcp-server
npm run build
npx wrangler deploy
```

**Expected Output:**
```
Deployed linkedin-post-composer-mcp triggers
  https://linkedin-post-composer-mcp.claude-8f5.workers.dev
```

### Task 5: Test DALL-E Integration

**Test I'll Run:**
```bash
curl -X POST https://linkedin-post-composer-mcp.claude-8f5.workers.dev/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "generate_image",
      "arguments": {
        "prompt": "Professional tech workspace with AI elements, modern design, blue and orange color scheme, minimalist style",
        "style": "natural",
        "size": "1024x1024"
      }
    }
  }'
```

**Expected Response:**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "structuredContent": {
      "success": true,
      "imageUrl": "https://oaidalleapiprodscus.blob.core.windows.net/...",
      "revisedPrompt": "A professional tech workspace..."
    }
  }
}
```

**What I'll Verify:**
- ✅ API key is accepted
- ✅ Image generates successfully
- ✅ Temporary URL is returned
- ✅ No errors in response

---

## Timeline Estimate

**Human Tasks:** 5-10 minutes
- Create OpenAI account: 3 min
- Add payment method: 2 min
- Generate API key: 1 min
- Provide to AI: 1 min

**AI Tasks:** 2-3 minutes (automated)
- Store secret: 30 sec
- Implement DALL-E code: 1 min
- Build: 30 sec
- Deploy: 1 min
- Test: 30 sec

**Total:** ~8-13 minutes end-to-end

---

## Important Notes

### About DALL-E 3 URLs
- Generated image URLs **expire in 1 hour**
- We must download and store them permanently in R2 (Integration 3)
- For now, we'll return the temporary URL to test generation
- In Integration 3, we'll upload to R2 immediately after generation

### Cost Considerations
- Standard quality: $0.04 per image (1024x1024)
- HD quality: $0.08 per image (2x cost, better detail)
- We'll use "standard" quality by default
- User can generate ~25 images for $1

### Rate Limits
- OpenAI has rate limits based on account tier
- Free tier: 3 requests/minute
- Tier 1 ($5+ spent): 50 requests/minute
- Tier 2 ($50+ spent): 100 requests/minute
- We'll implement error handling for rate limit errors

### Content Policy
- DALL-E rejects certain prompts (violence, adult content, etc.)
- We'll show user-friendly error messages
- Suggest prompt revisions if generation fails

---

## Next Steps After DALL-E

Once DALL-E integration is complete, we'll move to:

**Integration 3: Cloudflare R2 Storage**
- Create R2 bucket
- Implement upload functions
- Store generated images permanently
- No API keys needed (uses Cloudflare account)

**Integration 4: LinkedIn Publishing API**
- Use OAuth tokens from Integration 1
- Implement LinkedIn Posts API client
- Publish real posts with images
- No additional credentials needed

---

## Ready to Proceed?

**What I Need From You:**
1. OpenAI API key (starts with `sk-...`)

**What I'll Do:**
1. Store key in Cloudflare secrets
2. Implement DALL-E integration
3. Deploy and test
4. Provide you with test results

Once you provide the API key, I can complete Integration 2 in ~2-3 minutes autonomously.
