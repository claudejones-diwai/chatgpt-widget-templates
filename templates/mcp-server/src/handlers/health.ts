// Health Check Handler

export function handleHealth(widgetUrl: string): Response {
  return new Response(
    JSON.stringify({
      status: "ok",
      widgetUrl,
      timestamp: new Date().toISOString(),
      server: "{{PROJECT_NAME}}-mcp-server",
      version: "1.0.0",
    }),
    {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    }
  );
}
