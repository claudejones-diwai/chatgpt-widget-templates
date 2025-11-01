// MCP Server for Cloudflare Workers - LinkedIn Post Composer
// Serves compose_linkedin_post tool and server actions

import { handleComposePost } from "./tools/compose_post";
import { handleGenerateImage } from "./actions/generate-image";
import { handleUploadImage } from "./actions/upload-image";
import { handlePublishPost } from "./actions/publish-post";
import { handleHealth } from "./handlers/health";
import { handleInfo } from "./handlers/info";

// Widget URL - Deployed on Cloudflare Pages
const WIDGET_URL = "https://a57d4776.linkedin-post-composer-widget.pages.dev";

// Cloudflare Worker environment interface
export interface Env {
  OPENAI_API_KEY?: string;           // For DALL-E (Phase 2)
  LINKEDIN_CLIENT_ID?: string;        // For LinkedIn OAuth (Phase 2)
  LINKEDIN_CLIENT_SECRET?: string;    // For LinkedIn OAuth (Phase 2)
  R2_BUCKET_NAME?: string;           // For image storage (Phase 2)
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
                      "Opens the LinkedIn Post Composer widget to create, preview, and publish LinkedIn posts. " +
                      "Supports text-only posts and posts with images (upload or AI-generated). " +
                      "Users can post to their personal profile or company pages.",
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
                          description: "AI generation prompt (if imageSource='ai-generate')",
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
                          description: "Image URL (optional)",
                        },
                        postType: {
                          type: "string",
                          enum: ["text", "image"],
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
                  toolResult = await handleComposePost(toolArgs);
                  textMessage = `Opening LinkedIn Post Composer with your content...`;
                  result = {
                    content: [{ type: "text", text: textMessage }],
                    structuredContent: toolResult,
                    _meta: { "openai/outputTemplate": WIDGET_URL },
                  };
                  break;

                case "generate_image":
                  toolResult = await handleGenerateImage(toolArgs);
                  textMessage = toolResult.success
                    ? `Image generated successfully!`
                    : `Error: ${toolResult.error}`;
                  result = {
                    content: [{ type: "text", text: textMessage }],
                    structuredContent: toolResult,
                  };
                  break;

                case "upload_image":
                  toolResult = await handleUploadImage(toolArgs);
                  textMessage = toolResult.success
                    ? `Image uploaded successfully!`
                    : `Error: ${toolResult.error}`;
                  result = {
                    content: [{ type: "text", text: textMessage }],
                    structuredContent: toolResult,
                  };
                  break;

                case "publish_post":
                  toolResult = await handlePublishPost(toolArgs);
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
