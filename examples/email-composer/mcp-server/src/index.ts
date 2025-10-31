// MCP Server for Cloudflare Workers - Email Composer
// Serves compose_email tool and returns widget URL

import { handleComposeEmail } from "./tools/compose_email";
import { handleHealth } from "./handlers/health";
import { handleInfo } from "./handlers/info";

// Widget URL - stable production URL (auto-updates with each deployment)
const WIDGET_URL = "https://email-composer.pages.dev";

// Cloudflare Worker environment interface
export interface Env {
  // Add environment variables here if needed
}

// Cloudflare Worker export
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Handle CORS preflight FIRST (before any other logic)
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

      // Handle JSON-RPC POST requests
      if (
        request.method === "POST" &&
        contentType.includes("application/json")
      ) {
        try {
          const body = (await request.json()) as any;

          // Log the request for debugging
          console.log("MCP Request:", JSON.stringify(body));

          // Handle JSON-RPC 2.0 methods
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
                  name: "email-composer-mcp-server",
                  version: "1.0.0",
                },
              };
              break;

            case "notifications/initialized":
              // Client notifies that initialization is complete
              // No response needed for notifications
              return new Response(null, {
                status: 204,
                headers: {
                  "Access-Control-Allow-Origin": "*",
                },
              });

            case "tools/list":
              result = {
                tools: [
                  {
                    name: "compose_email",
                    description:
                      "Compose an email with pre-filled fields. Use this when users want to draft an email, send a message, or compose correspondence. Supports templates for common scenarios like meeting follow-ups, introductions, and thank you notes.",
                    inputSchema: {
                      type: "object",
                      properties: {
                        to: {
                          type: "string",
                          description: "Recipient email address",
                        },
                        subject: {
                          type: "string",
                          description: "Email subject line",
                        },
                        template: {
                          type: "string",
                          description: "Email template to use",
                          enum: ["blank", "meeting-followup", "introduction", "thank-you", "roadmap-inquiry"],
                        },
                      },
                      required: [],
                    },
                    annotations: {
                      title: "Email Composer",
                      readOnlyHint: true, // Tool opens composer UI, doesn't send email
                      destructiveHint: false,
                      idempotentHint: true,
                      openWorldHint: false,
                    },
                    _meta: {
                      "openai/outputTemplate": WIDGET_URL,
                    },
                  },
                ],
              };
              break;

            case "resources/read":
              // Fetch the actual deployed widget HTML dynamically
              const requestedUri = body.params?.uri;

              // Normalize URIs: parse and compare origin + pathname (ignore query params)
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
                      status: 500,
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
                      message: `Resource not found: ${requestedUri}`,
                    },
                  }),
                  {
                    status: 404,
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

              if (toolName === "compose_email") {
                const emailData = handleComposeEmail(toolArgs);

                result = {
                  content: [
                    {
                      type: "text",
                      text: `Draft email ready to send to ${emailData.defaultTo}`,
                    },
                  ],
                  structuredContent: emailData,
                  _meta: {
                    "openai/outputTemplate": WIDGET_URL,
                  },
                };
              } else {
                return new Response(
                  JSON.stringify({
                    jsonrpc: "2.0",
                    id: body.id,
                    error: {
                      code: -32601,
                      message: `Tool not found: ${toolName}`,
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

          // Log the response for debugging
          const response = {
            jsonrpc: "2.0",
            id: body.id,
            result,
          };
          console.log("MCP Response:", JSON.stringify(response));

          return new Response(JSON.stringify(response), {
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
          });
        } catch (error: any) {
          console.error("Error processing MCP request:", error);
          return new Response(
            JSON.stringify({
              jsonrpc: "2.0",
              id: null,
              error: {
                code: -32603,
                message: "Internal server error",
                data: error.message,
              },
            }),
            {
              status: 500,
              headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
              },
            }
          );
        }
      }
    }

    // Default 404 response
    return new Response("Not Found", {
      status: 404,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    });
  },
};
