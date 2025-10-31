export function handleInfo(widgetUrl: string): Response {
  return new Response(
    JSON.stringify({
      name: "animated-testimonials-mcp-server",
      version: "1.0.0",
      description: "Display animated testimonials carousel with 3D card effects",
      widget_url: widgetUrl,
      mcp_endpoint: "/mcp",
      health_endpoint: "/health",
    }),
    {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    }
  );
}
