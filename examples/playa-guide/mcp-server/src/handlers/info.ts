// Server info endpoint handler
export function handleInfo(widgetUrl: string): Response {
  const info = {
    name: "Playa del Carmen Guide MCP Server",
    version: "1.0.0",
    description: "MCP server for finding places in Playa del Carmen with interactive map widget",
    endpoints: {
      health: "/health",
      info: "/info",
      mcp: "/mcp (JSON-RPC 2.0)",
    },
    tools: [
      {
        name: "find_places",
        description: "Finds and displays places in Playa del Carmen on an interactive map",
        parameters: ["location", "category", "preferences", "limit"],
      },
    ],
    widget: {
      url: widgetUrl,
      name: "Playa del Carmen Guide",
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
