// Health check handler
export function handleHealth(widgetUrl: string): Response {
  return new Response(
    JSON.stringify({
      status: "ok",
      service: "email-composer-mcp-server",
      widget_url: widgetUrl,
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
