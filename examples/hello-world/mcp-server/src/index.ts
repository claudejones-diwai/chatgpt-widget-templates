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

    // MCP endpoint for ChatGPT (supports root /, /mcp, and /sse)
    if (url.pathname === "/" || url.pathname === "/mcp" || url.pathname === "/sse") {
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
