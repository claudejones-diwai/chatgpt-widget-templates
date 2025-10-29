// MCP Server for Cloudflare Workers
// Serves tool logic and returns widget URL

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { handleTool } from "./tools/{{TOOL_NAME}}";
import { handleHealth } from "./handlers/health";
import { handleInfo } from "./handlers/info";

// IMPORTANT: Update this URL after deploying your widget to Cloudflare Pages
// Step 1: Deploy widget to Pages (npx wrangler pages deploy)
// Step 2: Copy the URL here
// Step 3: Deploy this MCP server (npm run deploy)
const WIDGET_URL = "https://PLACEHOLDER-REPLACE-AFTER-WIDGET-DEPLOYMENT.pages.dev";

// Create MCP server
const server = new Server(
  {
    name: "{{PROJECT_NAME}}-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Register tool listing
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "{{TOOL_NAME}}",
        description: "{{TOOL_DESCRIPTION}}",
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

  if (name === "{{TOOL_NAME}}") {
    const result = await handleTool(args);

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

    // Server info endpoint
    if (url.pathname === "/" || url.pathname === "/info") {
      return handleInfo(WIDGET_URL);
    }

    // MCP endpoint for ChatGPT (supports both /mcp and /sse)
    if (url.pathname === "/mcp" || url.pathname === "/sse") {
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
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    return new Response("Not Found", { status: 404 });
  },
};
