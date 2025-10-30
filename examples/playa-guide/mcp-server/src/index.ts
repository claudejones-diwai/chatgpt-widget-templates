// MCP Server for Cloudflare Workers - Playa del Carmen Guide
// Serves find_places tool and returns widget URL

import { handleFindPlaces } from "./tools/find_places";
import { handleHealth } from "./handlers/health";
import { handleInfo } from "./handlers/info";

// Widget URL with version for cache busting
const WIDGET_VERSION = "1.0.4";
const WIDGET_URL = `https://playa-guide-widget.pages.dev?v=${WIDGET_VERSION}`;

// Cloudflare Worker environment interface
export interface Env {
  MAPBOX_ACCESS_TOKEN?: string; // For future Mapbox integration
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
                  name: "playa-guide-mcp-server",
                  version: "1.0.0",
                },
              };
              break;

            case "notifications/initialized":
              // Client notifies that initialization is complete
              // No response needed for notifications
              return new Response(null, {
                status: 204,
                headers: { "Access-Control-Allow-Origin": "*" },
              });

            case "tools/list":
              result = {
                tools: [
                  {
                    name: "find_places",
                    description:
                      "Finds and displays recommended places in Playa del Carmen, Mexico on an interactive map. " +
                      "Use this when users ask about restaurants, beaches, activities, nightlife, shopping, or hotels in Playa del Carmen. " +
                      "Returns places with details, coordinates, ratings, and displays them on a Mapbox-powered interactive map widget. " +
                      "Supports filtering by category and preferences (e.g., 'family-friendly', 'romantic', 'budget').",
                    inputSchema: {
                      type: "object",
                      properties: {
                        location: {
                          type: "string",
                          description:
                            "Location name (currently only 'Playa del Carmen' is supported)",
                          default: "Playa del Carmen",
                        },
                        category: {
                          type: "string",
                          description:
                            "Category of places to find",
                          enum: [
                            "all",
                            "restaurants",
                            "beaches",
                            "activities",
                            "nightlife",
                            "shopping",
                            "hotels",
                          ],
                          default: "all",
                        },
                        preferences: {
                          type: "string",
                          description:
                            "User preferences for filtering (e.g., 'family-friendly', 'romantic', 'budget', 'luxury')",
                        },
                        limit: {
                          type: "number",
                          description:
                            "Maximum number of places to return (default: 10, max: 50)",
                          default: 10,
                          minimum: 1,
                          maximum: 50,
                        },
                      },
                      required: [],
                    },
                    _meta: {
                      "openai/outputTemplate": WIDGET_URL,
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
                    name: "Playa del Carmen Guide Widget",
                    description:
                      "Interactive map widget displaying places in Playa del Carmen with details and filters",
                    mimeType: "text/html+skybridge",
                  },
                ],
              };
              break;

            case "resources/read":
              const requestedUri = body.params?.uri;
              // Normalize URIs: parse and compare origin + pathname (ignore query params)
              const parseUri = (uri: string) => {
                try {
                  const url = new URL(uri);
                  // Remove trailing slash from pathname
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
                        uri: requestedUri, // Return the URI as requested
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
              if (body.params?.name === "find_places") {
                const toolResult = await handleFindPlaces(
                  body.params?.arguments || {}
                );

                // Following Pizzaz pattern: use structuredContent for widget data
                result = {
                  content: [
                    {
                      type: "text",
                      text: toolResult.error
                        ? `Error: ${toolResult.message}`
                        : `Found ${toolResult.totalCount} ${toolResult.category} place${toolResult.totalCount !== 1 ? "s" : ""} in ${toolResult.location}`,
                    },
                  ],
                  structuredContent: toolResult, // Widget receives this via window.openai.toolOutput
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
                      message: `Unknown tool: ${body.params?.name}`,
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

      // If not JSON-RPC POST, return error
      return new Response("MCP endpoint requires POST with application/json", {
        status: 400,
        headers: { "Access-Control-Allow-Origin": "*" },
      });
    }

    // Default 404
    return new Response("Not Found", { status: 404 });
  },
};
