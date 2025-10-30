// Health check endpoint handler
export function handleHealth(widgetUrl: string): Response {
  const health = {
    status: "healthy",
    service: "playa-guide-mcp-server",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    widgetUrl,
  };

  return new Response(JSON.stringify(health, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
