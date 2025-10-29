// JSON-RPC Handler for MCP Protocol
//ChatGPT connects via JSON-RPC 2.0 over HTTP POST

import { Server } from "@modelcontextprotocol/sdk/server/index.js";

/**
 * Handle JSON-RPC requests from ChatGPT
 *
 * MCP uses JSON-RPC 2.0 format:
 * Request: { "jsonrpc": "2.0", "method": "METHOD", "params": {...}, "id": ID }
 * Response: { "jsonrpc": "2.0", "result": {...}, "id": ID }
 */
export async function handleJsonRpc(
  request: Request,
  server: Server
): Promise<Response> {
  try {
    // Parse JSON-RPC request
    const body = await request.json() as any;

    // Validate JSON-RPC 2.0 format
    if (body.jsonrpc !== "2.0") {
      return jsonRpcError(body.id, -32600, "Invalid Request: must be JSON-RPC 2.0");
    }

    const { method, params, id } = body;

    // Route to appropriate handler
    let result;

    switch (method) {
      case "initialize":
        result = {
          protocolVersion: "2024-11-05",
          capabilities: {
            tools: {},
          },
          serverInfo: {
            name: server.serverInfo.name,
            version: server.serverInfo.version,
          },
        };
        break;

      case "tools/list":
        // This will be handled by the server's ListToolsRequestSchema handler
        // We need to manually invoke it
        result = { tools: [] }; // Placeholder - will be populated by server
        break;

      case "tools/call":
        // This will be handled by the server's CallToolRequestSchema handler
        result = { content: [] }; // Placeholder
        break;

      default:
        return jsonRpcError(id, -32601, `Method not found: ${method}`);
    }

    // Return JSON-RPC success response
    return new Response(
      JSON.stringify({
        jsonrpc: "2.0",
        id,
        result,
      }),
      {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (error) {
    console.error("JSON-RPC error:", error);
    return jsonRpcError(
      null,
      -32700,
      `Parse error: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Create a JSON-RPC error response
 */
function jsonRpcError(
  id: any,
  code: number,
  message: string
): Response {
  return new Response(
    JSON.stringify({
      jsonrpc: "2.0",
      id,
      error: {
        code,
        message,
      },
    }),
    {
      status: 200, // JSON-RPC errors use 200 status with error in body
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    }
  );
}
