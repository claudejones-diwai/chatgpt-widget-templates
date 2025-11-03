// MCP Server for Cloudflare Workers - LinkedIn Post Composer
// Serves compose_linkedin_post tool and server actions

import { handleComposePost } from "./tools/compose_post";
import { handleGenerateImage } from "./actions/generate-image";
import { handleUploadImage } from "./actions/upload-image";
import { handleUploadCarouselImages } from "./actions/upload-carousel-images";
import { handleUploadDocument } from "./actions/upload-document";
import { handlePublishPost } from "./actions/publish-post";
import { handleHealth } from "./handlers/health";
import { handleInfo } from "./handlers/info";
import { LinkedInOAuth } from "./oauth/linkedin";
import { R2ImageStorage } from "./integrations/r2-storage";
import { LinkedInPostsAPI } from "./integrations/linkedin-posts-api";

// Widget URL - Deployed on Cloudflare Pages
const WIDGET_URL = "https://linkedin-post-composer-widget.pages.dev";

// Cloudflare Worker environment interface
export interface Env {
  OPENAI_API_KEY?: string;           // For DALL-E (Phase 2)
  LINKEDIN_CLIENT_ID?: string;        // For LinkedIn OAuth (Phase 2)
  LINKEDIN_CLIENT_SECRET?: string;    // For LinkedIn OAuth (Phase 2)
  OAUTH_TOKENS: KVNamespace;         // For storing OAuth tokens (Phase 2)
  IMAGE_BUCKET: R2Bucket;            // For permanent image storage (Phase 2)
}

// Cloudflare Worker export
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Handle CORS preflight FIRST
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers":
            "Content-Type, Authorization, X-Requested-With, Accept",
          "Access-Control-Max-Age": "86400",
        },
      });
    }

    // Health check endpoint
    if (url.pathname === "/health") {
      return handleHealth(WIDGET_URL);
    }

    // Server info endpoint (GET requests only)
    if (
      (url.pathname === "/" || url.pathname === "/info") &&
      request.method === "GET"
    ) {
      return handleInfo(WIDGET_URL);
    }

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
      const state = url.searchParams.get("state");
      const error = url.searchParams.get("error");

      if (error) {
        return new Response(
          `<!DOCTYPE html>
          <html>
            <head>
              <title>OAuth Error</title>
              <style>
                body { font-family: system-ui; max-width: 600px; margin: 50px auto; padding: 20px; }
                .error { background: #fee; border: 2px solid #c33; border-radius: 8px; padding: 20px; }
                h1 { color: #c33; }
              </style>
            </head>
            <body>
              <div class="error">
                <h1>❌ OAuth Error</h1>
                <p><strong>Error:</strong> ${error}</p>
                <p><strong>Description:</strong> ${url.searchParams.get("error_description") || "Unknown error"}</p>
                <p>Please try again or contact support if the issue persists.</p>
              </div>
            </body>
          </html>`,
          {
            status: 400,
            headers: { "Content-Type": "text/html" },
          }
        );
      }

      if (!code) {
        return new Response("Missing authorization code", { status: 400 });
      }

      try {
        const oauth = new LinkedInOAuth(env, request.url);

        // Exchange code for token
        const tokenData = await oauth.exchangeCodeForToken(code);

        // Get user profile
        const profile = await oauth.getUserProfile(tokenData.access_token);

        // Store token
        await oauth.storeToken(profile.sub, tokenData);

        // Return success page
        return new Response(
          `<!DOCTYPE html>
          <html>
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>LinkedIn Connected</title>
              <style>
                body { font-family: system-ui; max-width: 600px; margin: 50px auto; padding: 20px; text-align: center; }
                .success { background: #efe; border: 2px solid #3c3; border-radius: 8px; padding: 30px; }
                h1 { color: #3c3; font-size: 2em; margin-bottom: 20px; }
                .profile { background: white; border-radius: 8px; padding: 20px; margin: 20px 0; }
                .profile img { width: 80px; height: 80px; border-radius: 50%; margin-bottom: 10px; }
                .profile-name { font-size: 1.3em; font-weight: bold; margin: 10px 0; }
                .profile-email { color: #666; font-size: 0.95em; }
                .note { color: #666; font-size: 0.9em; margin-top: 20px; }
              </style>
            </head>
            <body>
              <div class="success">
                <h1>✅ LinkedIn Connected Successfully!</h1>
                <div class="profile">
                  <img src="${profile.picture}" alt="${profile.name}" />
                  <div class="profile-name">${profile.name}</div>
                  ${profile.email ? `<div class="profile-email">${profile.email}</div>` : ''}
                </div>
                <p class="note">You can close this window and return to ChatGPT.</p>
                <p class="note">Your LinkedIn account is now connected and ready to use!</p>
              </div>
            </body>
          </html>`,
          {
            headers: { "Content-Type": "text/html; charset=utf-8" },
          }
        );
      } catch (err: any) {
        console.error("OAuth callback error:", err);
        return new Response(
          `<!DOCTYPE html>
          <html>
            <head>
              <title>OAuth Failed</title>
              <style>
                body { font-family: system-ui; max-width: 600px; margin: 50px auto; padding: 20px; }
                .error { background: #fee; border: 2px solid #c33; border-radius: 8px; padding: 20px; }
                h1 { color: #c33; }
                pre { background: #f5f5f5; padding: 10px; border-radius: 4px; overflow-x: auto; }
              </style>
            </head>
            <body>
              <div class="error">
                <h1>❌ OAuth Failed</h1>
                <p><strong>Error:</strong> ${err.message}</p>
                <p>Please try again or contact support if the issue persists.</p>
                <details>
                  <summary>Technical Details</summary>
                  <pre>${err.stack || err.toString()}</pre>
                </details>
              </div>
            </body>
          </html>`,
          {
            status: 500,
            headers: { "Content-Type": "text/html" },
          }
        );
      }
    }

    // Image serving endpoint - Serve images from R2
    // Format: /images/linkedin-posts/123456-image.png
    if (url.pathname.startsWith("/images/")) {
      const imageKey = url.pathname.substring(8); // Remove "/images/" prefix
      const storage = new R2ImageStorage(env);
      return await storage.serveImage(imageKey);
    }

    // Debug endpoint to inspect organization API response
    if (url.pathname === "/debug/organizations" && request.method === "GET") {
      try {
        // Get authenticated user ID from KV
        const keys = await env.OAUTH_TOKENS.list({ prefix: 'linkedin:' });

        if (keys.keys.length === 0) {
          return new Response(JSON.stringify({ error: "No authenticated user found. Please authenticate via /oauth/linkedin first." }), {
            status: 401,
            headers: { "Content-Type": "application/json" }
          });
        }

        const userId = keys.keys[0].name.replace('linkedin:', '');
        console.log('Debug: Found user ID:', userId);

        // Fetch account data using LinkedInPostsAPI
        const linkedInAPI = new LinkedInPostsAPI(env);
        const accounts = await linkedInAPI.getAccounts(userId);

        if (!accounts) {
          return new Response(JSON.stringify({ error: "Failed to fetch accounts" }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
          });
        }

        // Return the full accounts data for inspection
        return new Response(JSON.stringify({
          userId,
          personal: accounts.personal,
          organizations: accounts.organizations,
          rawData: "Check worker logs for full organization API responses"
        }, null, 2), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
      } catch (err: any) {
        console.error('Debug endpoint error:', err);
        return new Response(JSON.stringify({ error: err.message, stack: err.stack }), {
          status: 500,
          headers: { "Content-Type": "application/json" }
        });
      }
    }

    // Test endpoint to try fetching organization logos via different methods
    if (url.pathname === "/debug/test-logo-fetch" && request.method === "GET") {
      try {
        const keys = await env.OAUTH_TOKENS.list({ prefix: 'linkedin:' });
        if (keys.keys.length === 0) {
          return new Response(JSON.stringify({ error: "No authenticated user" }), { status: 401, headers: { "Content-Type": "application/json" }});
        }

        const userId = keys.keys[0].name.replace('linkedin:', '');
        const tokenData = await env.OAUTH_TOKENS.get(`linkedin:${userId}`);
        if (!tokenData) {
          return new Response(JSON.stringify({ error: "No token found" }), { status: 401, headers: { "Content-Type": "application/json" }});
        }

        const { access_token } = JSON.parse(tokenData);
        const orgId = url.searchParams.get('orgId') || '18613176'; // Default to first org

        const results: any = {
          orgId,
          tests: {}
        };

        // Test 1: Try fetching organization logo with field projection using tilde operator
        // This expands the digitalmediaAsset URN to actual image URLs
        try {
          const resp1 = await fetch(
            `https://api.linkedin.com/rest/organizations/${orgId}?projection=(id,localizedName,logoV2(displayImage~:playableStreams))`,
            {
              headers: {
                'Authorization': `Bearer ${access_token}`,
                'LinkedIn-Version': '202411',
                'X-Restli-Protocol-Version': '2.0.0',
              }
            }
          );
          results.tests.fieldProjectionWithTilde = {
            status: resp1.status,
            data: resp1.ok ? await resp1.json() : await resp1.text()
          };
        } catch (e: any) {
          results.tests.fieldProjectionWithTilde = { error: e.message };
        }

        // Test 2: Fetch organization data and extract logoV2 URN
        try {
          const resp2 = await fetch(
            `https://api.linkedin.com/rest/organizations/${orgId}`,
            {
              headers: {
                'Authorization': `Bearer ${access_token}`,
                'LinkedIn-Version': '202411',
                'X-Restli-Protocol-Version': '2.0.0',
              }
            }
          );
          const orgData: any = resp2.ok ? await resp2.json() : null;
          results.tests.basicOrganizationFetch = {
            status: resp2.status,
            data: orgData || await resp2.text(),
            logoV2Field: orgData?.logoV2
          };
        } catch (e: any) {
          results.tests.basicOrganizationFetch = { error: e.message };
        }

        // Test 3: Convert digitalmediaAsset URN to image URN and resolve
        // LinkedIn hack: digitalmediaAsset ID is the same as image ID
        try {
          const orgResp = await fetch(`https://api.linkedin.com/rest/organizations/${orgId}`, {
            headers: {
              'Authorization': `Bearer ${access_token}`,
              'LinkedIn-Version': '202411',
              'X-Restli-Protocol-Version': '2.0.0',
            }
          });

          if (orgResp.ok) {
            const orgData: any = await orgResp.json();
            if (orgData.logoV2?.cropped) {
              const mediaUrn = orgData.logoV2.cropped;
              results.foundLogoUrn = mediaUrn;

              // Convert urn:li:digitalmediaAsset:XXX to urn:li:image:XXX
              const imageUrn = mediaUrn.replace('digitalmediaAsset', 'image');
              results.convertedImageUrn = imageUrn;

              // Try to resolve using images API
              const imageResp = await fetch(
                `https://api.linkedin.com/rest/images/${encodeURIComponent(imageUrn)}`,
                {
                  headers: {
                    'Authorization': `Bearer ${access_token}`,
                    'LinkedIn-Version': '202411',
                    'X-Restli-Protocol-Version': '2.0.0',
                  }
                }
              );

              results.tests.convertUrnAndResolve = {
                status: imageResp.status,
                data: imageResp.ok ? await imageResp.json() : await imageResp.text()
              };
            } else {
              results.tests.convertUrnAndResolve = { error: "No logoV2.cropped field found" };
            }
          }
        } catch (e: any) {
          results.tests.convertUrnAndResolve = { error: e.message };
        }

        return new Response(JSON.stringify(results, null, 2), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
      } catch (err: any) {
        console.error('Test endpoint error:', err);
        return new Response(JSON.stringify({ error: err.message, stack: err.stack }), {
          status: 500,
          headers: { "Content-Type": "application/json" }
        });
      }
    }

    // MCP JSON-RPC endpoint for ChatGPT
    if (url.pathname === "/mcp") {
      const contentType = request.headers.get("Content-Type") || "";

      if (
        request.method === "POST" &&
        contentType.includes("application/json")
      ) {
        try {
          const body = (await request.json()) as any;
          console.log("MCP Request:", JSON.stringify(body));

          if (body.jsonrpc !== "2.0") {
            return new Response(
              JSON.stringify({
                jsonrpc: "2.0",
                id: body.id,
                error: {
                  code: -32600,
                  message: "Invalid Request: must be JSON-RPC 2.0",
                },
              }),
              {
                headers: {
                  "Content-Type": "application/json",
                  "Access-Control-Allow-Origin": "*",
                },
              }
            );
          }

          let result;

          switch (body.method) {
            case "initialize":
              result = {
                protocolVersion: "2025-06-18",
                capabilities: {
                  tools: {},
                  resources: {},
                },
                serverInfo: {
                  name: "linkedin-post-composer-mcp-server",
                  version: "1.0.0",
                },
              };
              break;

            case "notifications/initialized":
              return new Response(null, {
                status: 204,
                headers: { "Access-Control-Allow-Origin": "*" },
              });

            case "tools/list":
              result = {
                tools: [
                  {
                    name: "compose_linkedin_post",
                    description:
                      "Use this when the user wants to create, draft, or publish a LinkedIn post. " +
                      "Opens an interactive widget for composing LinkedIn content with AI assistance. " +
                      "Supports text posts, AI-generated images (DALL-E), uploaded images, and posting to personal profiles or company pages. " +
                      "The widget provides live preview, account selection, and image generation controls. " +
                      "IMPORTANT: ALWAYS provide a detailed suggestedImagePrompt based on the post content, even for text posts. This gives users the option to add an AI-generated image later. " +
                      "The prompt should be descriptive and capture the mood, style, and content of the post (e.g., 'Professional tech workspace with AI elements, modern design, blue and orange color scheme, minimalist style'). " +
                      "If the user explicitly wants an image, also set postType='image' and imageSource='ai-generate'. " +
                      "Do NOT use this for: viewing existing LinkedIn posts, managing LinkedIn messages, or analyzing LinkedIn analytics.",
                    inputSchema: {
                      type: "object",
                      properties: {
                        content: {
                          type: "string",
                          description: "Post text content (refined by ChatGPT)",
                        },
                        postType: {
                          type: "string",
                          description: "Type of post",
                          enum: ["text", "image", "carousel", "video", "document", "poll"],
                          default: "text",
                        },
                        imageSource: {
                          type: "string",
                          description: "How to get image (required if postType='image')",
                          enum: ["upload", "ai-generate", "url"],
                        },
                        imageUrl: {
                          type: "string",
                          description: "Direct image URL (if imageSource='url')",
                        },
                        suggestedImagePrompt: {
                          type: "string",
                          description: "ALWAYS provide this field. AI image generation prompt suggestion based on the post content. Provide a detailed, descriptive prompt that captures the style, content, and mood that would complement the post. This gives users the option to generate an AI image even if they didn't explicitly request one. Example: 'Professional tech workspace with AI elements, modern design, blue and orange color scheme, minimalist style'",
                        },
                        accountType: {
                          type: "string",
                          description: "Account type to post to",
                          enum: ["personal", "organization"],
                          default: "personal",
                        },
                      },
                      required: ["content"],
                    },
                    annotations: {
                      title: "LinkedIn Post Composer",
                      readOnlyHint: true,
                      destructiveHint: false,
                      idempotentHint: true,
                      openWorldHint: false,
                    },
                    _meta: {
                      "openai/outputTemplate": WIDGET_URL,
                    },
                  },
                  // Server Actions (called by widget)
                  {
                    name: "generate_image",
                    description: "Generate image using DALL-E based on prompt (server action)",
                    inputSchema: {
                      type: "object",
                      properties: {
                        prompt: {
                          type: "string",
                          description: "Image generation prompt",
                        },
                        style: {
                          type: "string",
                          enum: ["professional", "creative", "minimalist"],
                          default: "professional",
                        },
                        size: {
                          type: "string",
                          enum: ["1024x1024", "1792x1024", "1024x1792"],
                          default: "1024x1024",
                        },
                      },
                      required: ["prompt"],
                    },
                  },
                  {
                    name: "upload_image",
                    description: "Upload image to Cloudflare R2 storage (server action)",
                    inputSchema: {
                      type: "object",
                      properties: {
                        image: {
                          type: "string",
                          description: "Base64 encoded image data",
                        },
                        filename: {
                          type: "string",
                          description: "Original filename",
                        },
                      },
                      required: ["image", "filename"],
                    },
                  },
                  {
                    name: "upload_carousel_images",
                    description: "Upload multiple images (2-20) for carousel post to Cloudflare R2 storage (server action)",
                    inputSchema: {
                      type: "object",
                      properties: {
                        images: {
                          type: "array",
                          description: "Array of carousel images",
                          items: {
                            type: "object",
                            properties: {
                              image: {
                                type: "string",
                                description: "Base64 encoded image data (with data:image/... prefix)",
                              },
                              filename: {
                                type: "string",
                                description: "Original filename",
                              },
                              order: {
                                type: "number",
                                description: "Display order (0-indexed)",
                              },
                            },
                            required: ["image", "filename", "order"],
                          },
                          minItems: 2,
                          maxItems: 20,
                        },
                      },
                      required: ["images"],
                    },
                  },
                  {
                    name: "upload_document",
                    description: "Upload document (PDF, Word, PowerPoint) to Cloudflare R2 storage (server action)",
                    inputSchema: {
                      type: "object",
                      properties: {
                        document: {
                          type: "string",
                          description: "Base64 encoded document data (with data:application/... prefix)",
                        },
                        filename: {
                          type: "string",
                          description: "Original filename",
                        },
                        fileType: {
                          type: "string",
                          description: "MIME type of the document",
                        },
                        fileSize: {
                          type: "number",
                          description: "File size in bytes",
                        },
                      },
                      required: ["document", "filename", "fileType", "fileSize"],
                    },
                  },
                  {
                    name: "publish_post",
                    description: "Publish post to LinkedIn (server action)",
                    inputSchema: {
                      type: "object",
                      properties: {
                        accountId: {
                          type: "string",
                          description: "LinkedIn account URN",
                        },
                        content: {
                          type: "string",
                          description: "Post text content",
                        },
                        imageUrl: {
                          type: "string",
                          description: "Single image URL (optional, for single image posts)",
                        },
                        carouselImageUrls: {
                          type: "array",
                          description: "Array of image URLs for carousel posts (2-20 images)",
                          items: {
                            type: "string",
                          },
                          minItems: 2,
                          maxItems: 20,
                        },
                        documentUrl: {
                          type: "string",
                          description: "Document URL (optional, for document posts)",
                        },
                        postType: {
                          type: "string",
                          enum: ["text", "image", "carousel", "document"],
                        },
                      },
                      required: ["accountId", "content", "postType"],
                    },
                  },
                ],
              };
              break;

            case "resources/list":
              result = {
                resources: [
                  {
                    uri: WIDGET_URL,
                    name: "LinkedIn Post Composer Widget",
                    description:
                      "Interactive widget for creating and publishing LinkedIn posts with AI-powered content and image generation",
                    mimeType: "text/html+skybridge",
                  },
                ],
              };
              break;

            case "resources/read":
              const requestedUri = body.params?.uri;
              const parseUri = (uri: string) => {
                try {
                  const url = new URL(uri);
                  const pathname = url.pathname.replace(/\/$/, "") || "/";
                  return `${url.origin}${pathname}`;
                } catch {
                  return uri?.replace(/\/$/, "");
                }
              };

              const normalizedRequested = parseUri(requestedUri);
              const normalizedWidget = parseUri(WIDGET_URL);

              if (normalizedRequested === normalizedWidget) {
                try {
                  const widgetResponse = await fetch(WIDGET_URL);
                  const widgetHtml = await widgetResponse.text();
                  result = {
                    contents: [
                      {
                        uri: requestedUri,
                        mimeType: "text/html+skybridge",
                        text: widgetHtml,
                      },
                    ],
                  };
                } catch (error) {
                  return new Response(
                    JSON.stringify({
                      jsonrpc: "2.0",
                      id: body.id,
                      error: {
                        code: -32603,
                        message: `Failed to fetch widget: ${error}`,
                      },
                    }),
                    {
                      headers: {
                        "Content-Type": "application/json",
                        "Access-Control-Allow-Origin": "*",
                      },
                    }
                  );
                }
              } else {
                return new Response(
                  JSON.stringify({
                    jsonrpc: "2.0",
                    id: body.id,
                    error: {
                      code: -32602,
                      message: `Unknown resource URI: ${requestedUri}`,
                    },
                  }),
                  {
                    headers: {
                      "Content-Type": "application/json",
                      "Access-Control-Allow-Origin": "*",
                    },
                  }
                );
              }
              break;

            case "tools/call":
              const toolName = body.params?.name;
              const toolArgs = body.params?.arguments || {};

              let toolResult;
              let textMessage;

              switch (toolName) {
                case "compose_linkedin_post":
                  toolResult = await handleComposePost(toolArgs, env);
                  textMessage = `Opening LinkedIn Post Composer with your content...`;
                  result = {
                    content: [{ type: "text", text: textMessage }],
                    structuredContent: toolResult,
                    _meta: {
                      "openai/outputTemplate": WIDGET_URL,
                      "openai/widgetDescription": "Interactive LinkedIn post composer with account selection, content editor, AI image generation, live preview, and publish workflow"
                    },
                  };
                  break;

                case "generate_image":
                  toolResult = await handleGenerateImage(toolArgs, env);
                  textMessage = toolResult.success
                    ? `Image generated successfully!`
                    : `Error: ${toolResult.error}`;
                  result = {
                    content: [{ type: "text", text: textMessage }],
                    structuredContent: toolResult,
                  };
                  break;

                case "upload_image":
                  toolResult = await handleUploadImage(toolArgs, env);
                  textMessage = toolResult.success
                    ? `Image uploaded successfully!`
                    : `Error: ${toolResult.error}`;
                  result = {
                    content: [{ type: "text", text: textMessage }],
                    structuredContent: toolResult,
                  };
                  break;

                case "upload_carousel_images":
                  toolResult = await handleUploadCarouselImages(toolArgs, env);
                  textMessage = toolResult.success
                    ? toolResult.message || `Successfully uploaded ${toolResult.images?.length} carousel images!`
                    : `Error: ${toolResult.error}`;
                  result = {
                    content: [{ type: "text", text: textMessage }],
                    structuredContent: toolResult,
                  };
                  break;

                case "upload_document":
                  toolResult = await handleUploadDocument(toolArgs, env);
                  textMessage = toolResult.success
                    ? `Document uploaded successfully!`
                    : `Error: ${toolResult.error}`;
                  result = {
                    content: [{ type: "text", text: textMessage }],
                    structuredContent: toolResult,
                  };
                  break;

                case "publish_post":
                  toolResult = await handlePublishPost(toolArgs, env);
                  textMessage = toolResult.message;
                  result = {
                    content: [{ type: "text", text: textMessage }],
                    structuredContent: toolResult,
                  };
                  break;

                default:
                  return new Response(
                    JSON.stringify({
                      jsonrpc: "2.0",
                      id: body.id,
                      error: {
                        code: -32601,
                        message: `Unknown tool: ${toolName}`,
                      },
                    }),
                    {
                      headers: {
                        "Content-Type": "application/json",
                        "Access-Control-Allow-Origin": "*",
                      },
                    }
                  );
              }
              break;

            default:
              return new Response(
                JSON.stringify({
                  jsonrpc: "2.0",
                  id: body.id,
                  error: {
                    code: -32601,
                    message: `Method not found: ${body.method}`,
                  },
                }),
                {
                  headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                  },
                }
              );
          }

          const response = { jsonrpc: "2.0", id: body.id, result };
          console.log("MCP Response:", JSON.stringify(response));

          return new Response(JSON.stringify(response), {
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
          });
        } catch (error) {
          console.error("JSON-RPC error:", error);
          return new Response(
            JSON.stringify({
              jsonrpc: "2.0",
              error: { code: -32700, message: `Parse error: ${error}` },
            }),
            {
              status: 400,
              headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
              },
            }
          );
        }
      }

      return new Response("MCP endpoint requires POST with application/json", {
        status: 400,
        headers: { "Access-Control-Allow-Origin": "*" },
      });
    }

    // Default 404
    return new Response("Not Found", { status: 404 });
  },
};
