export function handleHealth(widgetUrl: string): Response {
  return new Response(
    JSON.stringify({
      status: "healthy",
      service: "linkedin-post-composer-mcp-server",
      version: "1.0.0",
      widgetUrl,
      timestamp: new Date().toISOString(),
    }),
    {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    }
  );
}
