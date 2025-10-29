// MCP Server for Cloudflare Workers
// Serves tool logic and returns widget URL

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema
} from "@modelcontextprotocol/sdk/types.js";
import { handleTool } from "./tools/greet_user";
import { handleHealth } from "./handlers/health";
import { handleInfo } from "./handlers/info";

// Widget URL - deployed to Cloudflare Pages
const WIDGET_URL = "https://e57ba5d0.hello-world-widget.pages.dev";

// Create MCP server
const server = new Server(
  {
    name: "hello-world-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Server automatically handles initialization handshake

// Register tool listing
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "greet_user",
        description: "Generates personalized greetings",
        inputSchema: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "User's name",
            },
            formal: {
              type: "boolean",
              description: "Use formal greeting",
            },
          },
          required: ["name"],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === "greet_user") {
    const result = await handleTool(args ?? {});

    return {
      content: [
        {
          type: "resource",
          resource: {
            uri: WIDGET_URL,
            mimeType: "text/html",
            text: JSON.stringify(result),
          },
        },
      ],
    };
  }

  throw new Error(`Unknown tool: ${name}`);
});

// Cloudflare Worker export
export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    // Health check endpoint
    if (url.pathname === "/health") {
      return handleHealth(WIDGET_URL);
    }

    // Server info endpoint (GET requests only)
    if ((url.pathname === "/" || url.pathname === "/info") && request.method === "GET") {
      return handleInfo(WIDGET_URL);
    }

    // MCP JSON-RPC endpoint for ChatGPT
    if (url.pathname === "/mcp") {
      // /mcp endpoint ONLY handles JSON-RPC (no SSE fallback)
      if (request.method !== "POST") {
        return new Response(JSON.stringify({
          error: "Method not allowed. POST required for JSON-RPC."
        }), {
          status: 405,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        });
      }

      try {
        const body = await request.json() as any;

        // Handle JSON-RPC 2.0 methods
        if (body.jsonrpc !== "2.0") {
          return new Response(JSON.stringify({
            jsonrpc: "2.0", id: body.id,
            error: { code: -32600, message: "Invalid Request: must be JSON-RPC 2.0" },
          }), { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } });
        }

        let result;

        switch (body.method) {
          case "initialize":
            result = {
              protocolVersion: "2024-11-05",
              capabilities: {
                tools: {},
                resources: {},
              },
              serverInfo: { name: "hello-world-mcp-server", version: "1.0.0" },
            };
            break;

          case "tools/list":
            result = {
              tools: [{
                name: "greet_user",
                description: "Generates personalized greetings",
                inputSchema: {
                  type: "object",
                  properties: {
                    name: { type: "string", description: "User's name" },
                    formal: { type: "boolean", description: "Use formal greeting" },
                  },
                  required: ["name"],
                },
                _meta: {
                  "openai/outputTemplate": WIDGET_URL,
                },
              }],
            };
            break;

          case "resources/list":
            result = {
              resources: [{
                uri: WIDGET_URL,
                name: "Hello World Widget",
                description: "Greeting widget with personalized messages",
                mimeType: "text/html+skybridge",
              }],
            };
            break;

          case "resources/read":
            const requestedUri = body.params?.uri;
            if (requestedUri === WIDGET_URL) {
              try {
                const widgetResponse = await fetch(WIDGET_URL);
                const widgetHtml = await widgetResponse.text();
                result = {
                  contents: [{
                    uri: WIDGET_URL,
                    mimeType: "text/html+skybridge",
                    text: widgetHtml,
                  }],
                };
              } catch (error) {
                return new Response(JSON.stringify({
                  jsonrpc: "2.0", id: body.id,
                  error: { code: -32603, message: `Failed to fetch widget: ${error}` },
                }), { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } });
              }
            } else {
              return new Response(JSON.stringify({
                jsonrpc: "2.0", id: body.id,
                error: { code: -32602, message: `Unknown resource URI: ${requestedUri}` },
              }), { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } });
            }
            break;

          case "tools/call":
            const toolResult = await handleTool(body.params?.arguments || {});
            result = {
              content: [
                {
                  type: "text",
                  text: toolResult.error
                    ? `Error: ${toolResult.message}`
                    : toolResult.greeting || "Greeting generated successfully",
                },
                {
                  type: "resource",
                  resource: {
                    uri: WIDGET_URL,
                    mimeType: "text/html+skybridge",
                    text: JSON.stringify(toolResult),
                  },
                },
              ],
            };
            break;

          default:
            return new Response(JSON.stringify({
              jsonrpc: "2.0", id: body.id,
              error: { code: -32601, message: `Method not found: ${body.method}` },
            }), { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } });
        }

        return new Response(JSON.stringify({ jsonrpc: "2.0", id: body.id, result }), {
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        });
      } catch (error) {
        console.error("JSON-RPC error:", error);
        return new Response(JSON.stringify({
          jsonrpc: "2.0",
          error: { code: -32700, message: `Parse error: ${error}` },
        }), {
          status: 400,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        });
      }
    }

    // SSE endpoint (for streaming connections)
    if (url.pathname === "/" || url.pathname === "/sse") {
      const transport = new SSEServerTransport(url.pathname, request);
      await server.connect(transport);
      return new Response((transport as any).readable, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With, Accept",
          "Access-Control-Max-Age": "86400",
        },
      });
    }

    return new Response("Not Found", { status: 404 });
  },
};
