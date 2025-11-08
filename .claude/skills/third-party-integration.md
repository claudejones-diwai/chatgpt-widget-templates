# Third-Party API Integration Skill

## Purpose
This skill provides a systematic approach for integrating with third-party APIs. Use this skill whenever you need to implement, debug, or fix integrations with external APIs (REST, GraphQL, webhooks, SDKs, etc.).

## When to Use This Skill
- Implementing a new third-party API integration
- Debugging failed API calls or unexpected responses
- Fixing integration issues after API updates or version changes
- Understanding how an existing API integration works
- Migrating from one API version to another

## Documentation-First Integration Methodology

### Core Principle
**ALWAYS consult official API documentation BEFORE writing or modifying integration code.** Never assume field names, data formats, URN types, or API behavior based on semantic naming or previous experience.

### Step-by-Step Process

#### 1. Documentation Research (MANDATORY)
Before writing any code:

**a) Locate Official Documentation**
- Find the official API documentation for the service
- Identify the current API version being used
- Check for migration guides if upgrading versions
- Look for OpenAPI/Swagger specs if available

**b) Read Complete API Specification**
- **Endpoint**: Full URL, HTTP method, required headers
- **Authentication**: Token type, header format, scope requirements
- **Request Format**: Required/optional fields, exact field names, data types
- **Response Format**: Success/error response structures, status codes
- **Special Behaviors**: Empty responses, header-based responses, pagination
- **Rate Limits**: Request limits, throttling behavior
- **Versioning**: API version headers, deprecation timelines

**c) Document Your Findings**
Create inline comments or documentation that includes:
```typescript
/**
 * LinkedIn REST Posts API - Create Post
 * Endpoint: POST https://api.linkedin.com/rest/posts
 * API Version: 202411 (November 2024)
 * Auth: Bearer token in Authorization header
 *
 * Request Headers:
 * - Authorization: Bearer {token}
 * - LinkedIn-Version: 202411
 * - X-Restli-Protocol-Version: 2.0.0
 * - Content-Type: application/json
 *
 * Request Body (single-image post):
 * {
 *   author: "urn:li:person:XXX",
 *   commentary: "post text",
 *   visibility: "PUBLIC",
 *   distribution: { feedDistribution: "MAIN_FEED", ... },
 *   content: {
 *     media: {
 *       id: "urn:li:image:XXX"  // NOTE: Must be image URN, NOT digitalmediaAsset
 *     }
 *   },
 *   lifecycleState: "PUBLISHED"
 * }
 *
 * Response:
 * - Success: 201 Created with EMPTY BODY
 * - Post ID returned in headers: Location, x-linkedin-id, or x-restli-id
 * - Some endpoints return JSON body with { id: "..." }
 *
 * Reference: https://learn.microsoft.com/en-us/linkedin/marketing/...
 */
```

#### 2. Implementation Pattern

**a) Defensive Response Handling**
Always handle multiple response scenarios:

```typescript
// 1. Read response as text first (don't assume JSON)
const responseText = await response.text();
console.log('Response body length:', responseText.length);

// 2. Handle empty responses (check headers)
if (!responseText || responseText.trim().length === 0) {
  console.log('Empty response - checking headers');

  // Check common header locations
  const locationHeader = response.headers.get('location');
  const xApiId = response.headers.get('x-api-id');
  const xResourceId = response.headers.get('x-resource-id');

  // Extract ID from headers
  // ...
}

// 3. Handle JSON responses
else {
  try {
    const data = JSON.parse(responseText);
    // Process JSON data
  } catch (parseError) {
    console.error('Failed to parse JSON:', parseError.message);
    console.error('Response preview:', responseText.substring(0, 200));
    // Return meaningful error
  }
}
```

**b) URN Type Conversion**
Document URN type requirements explicitly:

```typescript
// LinkedIn Assets API returns: urn:li:digitalmediaAsset:XXX
// LinkedIn REST Posts API requires: urn:li:image:XXX
// The ID is the same, only the type prefix changes

if (urn.includes('digitalmediaAsset')) {
  urn = urn.replace('digitalmediaAsset', 'image');
  console.log('Converted URN for API compatibility:', urn);
}
```

**c) Error Logging**
Provide detailed but size-limited error logging:

```typescript
if (!response.ok) {
  const errorText = await response.text();
  console.error('API call failed:', {
    status: response.status,
    statusText: response.statusText,
    errorPreview: errorText.substring(0, 500) // Limit to avoid log overflow
  });

  return {
    success: false,
    error: `Failed to ${action}: ${response.statusText}`,
  };
}
```

#### 3. Debugging Process

When an integration fails:

**a) Check Logs First**
```bash
# For Cloudflare Workers
npx wrangler tail worker-name --format pretty

# Look for:
# - Actual HTTP status codes (200, 201, 400, 401, 403, 404, 500)
# - Response body content (empty vs JSON vs error message)
# - Header values (especially for empty body responses)
# - Request payload (ensure correct format)
```

**b) Compare with Documentation**
- Does the request match the API spec exactly?
- Are all required headers present?
- Are field names spelled correctly (case-sensitive)?
- Are data types correct (string vs number vs array)?
- Is the API version header correct?

**c) Test with API Examples**
- Use examples from official documentation
- Test with cURL or Postman first if possible
- Verify authentication is working
- Confirm payload structure

**d) Check for API Changes**
- Has the API been updated recently?
- Are there deprecation notices?
- Is the endpoint still available?
- Have response formats changed?

#### 4. Common API Integration Patterns

**Pattern A: Empty Body with Header Response**
```typescript
// Used by: LinkedIn REST Posts API, some RESTful APIs
// Response: 201 Created, empty body, ID in headers

const responseText = await response.text();
if (!responseText || responseText.trim().length === 0) {
  const resourceId = response.headers.get('location')?.match(/\/([^\/\?]+)$/)?.[1]
    || response.headers.get('x-resource-id')
    || response.headers.get('x-api-id');
}
```

**Pattern B: JSON Body Response**
```typescript
// Used by: Most modern APIs
// Response: 200/201 with JSON body

const data = await response.json();
const resourceId = data.id || data.resource_id;
```

**Pattern C: Paginated Responses**
```typescript
// Used by: List endpoints with pagination

let allItems = [];
let nextUrl = initialUrl;

while (nextUrl) {
  const response = await fetch(nextUrl, headers);
  const data = await response.json();
  allItems.push(...data.items);
  nextUrl = data.next || data.pagination?.next_url || null;
}
```

**Pattern D: Multi-Step Upload**
```typescript
// Used by: File upload APIs (LinkedIn Documents, AWS S3)
// 1. Initialize upload (get upload URL)
// 2. Upload file to URL
// 3. Create resource with uploaded file URN

// Step 1: Initialize
const initResponse = await fetch('/api/initialize-upload', {
  method: 'POST',
  body: JSON.stringify({ owner: authorUrn })
});
const { uploadUrl, resourceUrn } = await initResponse.json();

// Step 2: Upload file
await fetch(uploadUrl, {
  method: 'PUT',
  body: fileData
});

// Step 3: Create resource
await fetch('/api/create-resource', {
  method: 'POST',
  body: JSON.stringify({ resourceUrn, metadata })
});
```

## Lessons Learned Reference

### LinkedIn API Specifics
1. **REST Posts API** (`/rest/posts`) returns **201 Created with empty body** - check headers for post ID
2. **Assets API** returns `urn:li:digitalmediaAsset:XXX` but **REST Posts API requires** `urn:li:image:XXX`
3. **UGC Posts API** (`/v2/ugcPosts`) accepts `digitalmediaAsset` URNs - older, less featured
4. **Multi-image posts** use `content.multiImage.images[]` with `id` field (NOT `image`)
5. **Document posts** use `content.media` with both `title` and `id`
6. **LinkedIn-Version header** format is `YYYYMM` (e.g., `202411` for November 2024)
7. **Always include**: `X-Restli-Protocol-Version: 2.0.0` for REST endpoints

### General API Integration
1. **Never assume field names** - always verify in documentation
2. **Empty responses are valid** - check headers for resource IDs
3. **Log response body length** - helps detect empty vs malformed responses
4. **Limit error logging** - prevent log overflow (max 500 chars per error)
5. **Version headers matter** - different versions may have different response formats
6. **Test each response path** - empty body, JSON body, error response
7. **Document URN conversions** - explain why conversion is needed

## Checklist for New Integration

- [ ] Official API documentation located and reviewed
- [ ] API version identified and documented in code
- [ ] Authentication method understood (OAuth, API key, Bearer token)
- [ ] All required headers documented
- [ ] Request payload structure verified against examples
- [ ] Response format documented (JSON body vs headers)
- [ ] Error response format understood
- [ ] Empty response handling implemented
- [ ] JSON parsing wrapped in try/catch
- [ ] Detailed error logging added (with size limits)
- [ ] Success logging includes resource ID
- [ ] URN/ID conversions documented if needed
- [ ] Rate limiting considered
- [ ] Integration tested with real API calls

## Anti-Patterns to Avoid

❌ **Don't assume field names based on semantics**
```typescript
// WRONG: Assuming field is called "image" because it's an image
payload.content.multiImage.images[0].image = imageUrn;

// RIGHT: Check documentation - field is actually "id"
payload.content.multiImage.images[0].id = imageUrn;
```

❌ **Don't call response.json() without error handling**
```typescript
// WRONG: Throws "Unexpected end of JSON input" if body is empty
const data = await response.json();

// RIGHT: Read as text first, handle empty responses
const text = await response.text();
if (text) {
  const data = JSON.parse(text);
}
```

❌ **Don't ignore empty responses**
```typescript
// WRONG: Assume all successful responses have JSON body
if (response.ok) {
  const data = await response.json(); // Fails if body is empty
}

// RIGHT: Check for empty body and look in headers
if (response.ok) {
  const text = await response.text();
  if (!text) {
    const id = response.headers.get('location');
  }
}
```

❌ **Don't log entire request/response bodies**
```typescript
// WRONG: Logs megabytes of base64 data, exceeds log limits
console.log('Request:', JSON.stringify(requestBody));

// RIGHT: Log only metadata
console.log('Uploading image, size:', bytes.length, 'bytes');
```

## When Integration Fails

If you cannot find documentation or API examples:

1. **Ask the user**: "I couldn't find the official documentation for [API endpoint]. Could you provide a link or reference to the API documentation?"

2. **Search for examples**: Look for official SDKs, code examples, or community implementations

3. **Inspect existing code**: If there's existing integration code, read it carefully to understand patterns

4. **Use API exploration tools**: Postman, curl, or API testing tools to experiment

5. **Check for OpenAPI specs**: Many APIs provide Swagger/OpenAPI specifications

## Success Criteria

A third-party integration is complete when:

✅ All API calls succeed with real data
✅ Response handling works for both success and error cases
✅ Empty responses handled correctly (if applicable)
✅ Error messages are informative and actionable
✅ Logging is detailed but size-limited
✅ Code includes comments referencing API documentation
✅ URN/ID conversions are explained with comments
✅ Integration matches API documentation exactly

---

**Remember**: Time spent reading documentation thoroughly is always less than time spent debugging assumptions.
