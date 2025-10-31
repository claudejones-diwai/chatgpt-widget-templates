// Server info endpoint handler
export function handleInfo(widgetUrl: string): Response {
  const info = {
    name: "Priority Inbox MCP Server",
    version: "1.0.0",
    description: "MCP server for managing priority emails with interactive inbox widget",
    endpoints: {
      health: "/health",
      info: "/info",
      mcp: "/mcp (JSON-RPC 2.0)",
    },
    tools: [
      {
        name: "get_priority_emails",
        description: "Retrieves priority emails from inbox with filtering options",
        parameters: ["category", "limit", "unreadOnly"],
      },
    ],
    widget: {
      url: widgetUrl,
      name: "Priority Inbox",
    },
    protocol: {
      name: "MCP (Model Context Protocol)",
      version: "2025-06-18",
    },
  };

  return new Response(JSON.stringify(info, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
