# Widget Factory Automation Patterns

**Purpose:** Define clear boundaries between human tasks and AI-automated tasks for efficient ChatGPT widget development

**Use Case:** Streamline development workflow by maximizing AI automation while clearly identifying human-required steps

---

## Core Principle: Human/AI Task Boundaries

### Human Tasks (Cannot Be Automated)
Tasks that require:
- Account creation with third-party services
- Payment method setup
- Legal agreements/terms acceptance
- Security credentials (API keys, secrets)
- Manual verification/testing in external systems

### AI Tasks (Fully Automated)
Tasks that can be executed autonomously:
- File creation and editing
- Code implementation
- Build and deployment
- Testing via curl/automated scripts
- Configuration updates

---

## Integration Pattern Template

Every third-party integration follows this pattern:

### 1. Human: Obtain Credentials
**What:** Create account, get API keys/secrets
**Where:** Third-party service website
**Output:** Credentials to provide to AI

### 2. AI: Store Credentials Securely
**What:** Save credentials in Cloudflare secrets or KV
**How:** `npx wrangler secret put {KEY_NAME}`
**Verify:** `npx wrangler secret list`

### 3. AI: Implement Integration Code
**What:** Create integration classes, update handlers
**Files:** `src/integrations/{service}.ts`, `src/actions/*.ts`
**Pattern:** Reusable service client pattern

### 4. AI: Build and Deploy
**What:** Compile TypeScript, deploy to Cloudflare
**Commands:** `npm run build`, `npx wrangler deploy`

### 5. AI: Automated Testing
**What:** Test endpoints via curl
**Verify:** Expected responses, no errors

### 6. Human: Manual Verification
**What:** Test integration in browser/real environment
**Verify:** End-to-end flow works as expected

---

## Third-Party Integration Patterns

### OAuth Integration (LinkedIn, Twitter, GitHub, etc.)

**Human Tasks:**
1. Create developer app on provider platform
2. Configure redirect URLs
3. Obtain Client ID and Client Secret
4. Provide credentials to AI

**AI Tasks:**
1. Store credentials in Cloudflare secrets
2. Create KV namespace for token storage
3. Implement OAuth class (`src/oauth/{provider}.ts`)
4. Add OAuth routes (`/oauth/{provider}`, `/oauth/callback`)
5. Build, deploy, test
6. Provide test URL to human

**Time:** ~10-15 minutes
- Human: 5-10 min
- AI: 2-3 min

**Files Created:**
- `src/oauth/{provider}.ts` - OAuth client class
- Update `src/index.ts` - Add routes and Env interface
- Update `wrangler.toml` - Add KV namespace binding

**Example:** [LinkedIn OAuth Pattern](../oauth-integration/LINKEDIN-OAUTH-PATTERN.md)

---

### API Key Integration (OpenAI, Stripe, SendGrid, etc.)

**Human Tasks:**
1. Create account on service
2. Add payment method (if required)
3. Generate API key
4. Provide API key to AI

**AI Tasks:**
1. Store API key in Cloudflare secrets
2. Implement service client class
3. Update action handlers to use real API
4. Build, deploy, test
5. Provide test results to human

**Time:** ~8-13 minutes
- Human: 5-10 min
- AI: 2-3 min

**Files Created:**
- `src/integrations/{service}.ts` - API client class
- Update `src/actions/*.ts` - Replace mocks with real API calls
- Update `src/index.ts` - Import and use new integration

**Example:** DALL-E Integration (see INTEGRATION-2-DALLE-TASKS.md)

---

### Storage Integration (Cloudflare R2, AWS S3, etc.)

**Human Tasks:**
- None (uses existing Cloudflare account)

**AI Tasks:**
1. Create R2 bucket via wrangler
2. Configure bucket bindings in wrangler.toml
3. Implement storage client class
4. Update upload/download handlers
5. Build, deploy, test

**Time:** ~5 minutes (fully automated)

**Files Created:**
- `src/storage/{service}.ts` - Storage client class
- Update `src/actions/*.ts` - Use storage for file operations
- Update `wrangler.toml` - Add bucket bindings

---

## Automation Checklist Template

Use this checklist for any integration:

### Planning Phase
- [ ] Identify integration type (OAuth / API Key / Storage)
- [ ] Document human tasks vs. AI tasks
- [ ] Estimate time for each phase
- [ ] List required credentials/accounts

### Human Phase
- [ ] Create necessary accounts
- [ ] Complete verification steps (if required)
- [ ] Obtain credentials (API keys, Client ID/Secret)
- [ ] Configure redirect URLs / webhooks (if needed)
- [ ] Provide credentials to AI

### AI Phase
- [ ] Store credentials securely
- [ ] Create/update infrastructure (KV namespaces, R2 buckets)
- [ ] Implement integration code
- [ ] Update configuration files
- [ ] Build successfully (no TypeScript errors)
- [ ] Deploy successfully
- [ ] Run automated tests
- [ ] Provide test URL/results to human

### Verification Phase
- [ ] Human tests integration manually
- [ ] End-to-end flow works
- [ ] Error handling works
- [ ] Documentation updated
- [ ] Mark integration as complete

---

## Communication Protocol

### When AI Needs Human Input
**Pattern:**
```
🛑 WAITING FOR USER INPUT

Task: {specific task name}
What I need: {specific information/credentials}
Where to get it: {URL and steps}
Format: {expected format}

Once you provide this, I can continue with:
- {next automated task 1}
- {next automated task 2}
- ...
```

**Example:**
```
🛑 WAITING FOR USER INPUT

Task: OpenAI API Key
What I need: Your OpenAI API key (starts with sk-...)
Where to get it:
  1. Go to https://platform.openai.com/api-keys
  2. Click "Create new secret key"
  3. Copy the key (you'll only see it once)

Once you provide this, I can continue with:
- Storing key in Cloudflare secrets
- Implementing DALL-E integration
- Deploying and testing
```

### When AI Completes Automated Tasks
**Pattern:**
```
✅ INTEGRATION COMPLETE

What I did:
- {task 1}
- {task 2}
- {task 3}

Test Results:
- {test 1 result}
- {test 2 result}

Next Steps for You:
1. {manual verification step 1}
2. {manual verification step 2}

Ready to proceed to next integration? (Y/N)
```

**Example:**
```
✅ LINKEDIN OAUTH COMPLETE

What I did:
- Created KV namespace (ID: 67a1346...)
- Implemented OAuth flow (src/oauth/linkedin.ts)
- Added OAuth routes (/oauth/linkedin, /oauth/callback)
- Built and deployed successfully

Test Results:
- ✅ OAuth initiation returns 302 redirect
- ✅ Health endpoint returns healthy
- ✅ Deployment includes KV binding

Next Steps for You:
1. Test OAuth flow: https://linkedin-post-composer-mcp.claude-8f5.workers.dev/oauth/linkedin
2. Authorize app on LinkedIn
3. Verify success page shows your profile

Ready to proceed to Integration 2 (DALL-E)? (Y/N)
```

---

## Multi-Tenant SaaS Considerations

### Current Single-Tenant Pattern
- Developer obtains credentials
- AI stores in Cloudflare secrets (global)
- All users share same integration

### Future Multi-Tenant Pattern
- Each customer obtains their own credentials
- Credentials stored in KV per tenant (not secrets)
- Isolated integrations per customer

**Implementation Differences:**

**Single-Tenant (Current):**
```typescript
// Credentials from environment
const apiKey = env.OPENAI_API_KEY;
const clientId = env.LINKEDIN_CLIENT_ID;
```

**Multi-Tenant (Future):**
```typescript
// Credentials from KV per tenant
const tenantConfig = await env.TENANT_CONFIGS.get(tenantId, 'json');
const apiKey = tenantConfig.openai_api_key;
const clientId = tenantConfig.linkedin_client_id;
```

**UI Changes for Multi-Tenant:**
1. Add "Integrations" settings page
2. Forms for each integration (LinkedIn, OpenAI, etc.)
3. Store credentials in KV: `TENANT_CONFIGS.put(tenantId, config)`
4. Validation and testing per tenant

---

## Reusable Code Patterns

### Service Client Pattern
All integrations follow this pattern:

```typescript
// src/integrations/{service}.ts
import { Env } from '../index';

export interface {Service}Config {
  // Configuration options
}

export interface {Service}Response {
  success: boolean;
  data?: any;
  error?: string;
}

export class {Service}Client {
  constructor(private env: Env) {}

  async performAction(args: any): Promise<{Service}Response> {
    try {
      const response = await fetch('{api-url}', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.env.API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(args),
      });

      if (!response.ok) {
        const error = await response.text();
        return { success: false, error };
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}
```

### Action Handler Pattern
```typescript
// src/actions/{action}.ts
import { {Service}Client } from '../integrations/{service}';
import type { {Action}Output } from '../../shared-types';

export async function handle{Action}(args: any, env: Env): Promise<{Action}Output> {
  const client = new {Service}Client(env);
  const result = await client.performAction(args);

  if (!result.success) {
    return {
      success: false,
      message: result.error || 'Action failed',
      error: result.error,
    };
  }

  return {
    success: true,
    message: 'Action completed successfully',
    data: result.data,
  };
}
```

---

## Testing Patterns

### Automated Testing (AI)
```bash
# Test endpoint availability
curl -I https://{worker-url}/{endpoint}

# Test JSON-RPC endpoint
curl -X POST https://{worker-url}/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "{tool_name}",
      "arguments": {test-args}
    }
  }'

# Test OAuth redirect
curl -I https://{worker-url}/oauth/{provider}
```

### Manual Testing (Human)
1. **OAuth Flow:**
   - Click OAuth URL
   - Authorize on provider
   - Verify success page

2. **Widget Integration:**
   - Open widget in ChatGPT
   - Test all features
   - Verify real data appears

3. **End-to-End Flow:**
   - Complete user journey
   - Verify external results (post published, email sent, etc.)

---

## Future Automation Enhancements

### 1. Credential Management UI
- Web form for entering credentials
- Test connection before saving
- Visual confirmation of integration status

### 2. Integration Marketplace
- Pre-built integration templates
- One-click setup for common services
- Community-contributed integrations

### 3. Testing Automation
- Automated end-to-end tests
- Continuous verification of integrations
- Alert on integration failures

### 4. Documentation Generation
- Auto-generate integration docs from code
- API reference from TypeScript types
- Interactive testing playground

---

## Summary

**Key Takeaways:**

1. **Clear Boundaries:** Always distinguish human vs. AI tasks upfront
2. **Consistent Pattern:** Every integration follows the same flow
3. **Reusable Code:** Use service client and action handler patterns
4. **Automated Testing:** AI runs curl tests, human verifies manually
5. **Multi-Tenant Ready:** Pattern scales to SaaS with KV storage
6. **Time Efficient:** Most integrations complete in 10-15 minutes total

**Benefits:**

- ✅ Faster development (AI automates 80% of work)
- ✅ Fewer errors (consistent patterns)
- ✅ Better documentation (clear task breakdown)
- ✅ Scalable to SaaS (multi-tenant ready)
- ✅ Maintainable (reusable components)

**Next Steps:**

When adding a new integration:
1. Choose pattern (OAuth / API Key / Storage)
2. Create task breakdown document
3. List human vs. AI tasks
4. Execute phase by phase
5. Test and verify
6. Mark complete ✅
