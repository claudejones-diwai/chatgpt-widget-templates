// Server Info Handler

export function handleInfo(widgetUrl: string): Response {
  return new Response(
    JSON.stringify({
      name: "{{PROJECT_NAME}}-mcp-server",
      description: "{{TOOL_DESCRIPTION}}",
      version: "1.0.0",
      endpoints: {
        sse: "/sse",
        health: "/health",
        info: "/",
      },
      widgetUrl,
      tools: [
        {
          name: "{{TOOL_NAME}}",
          description: "{{TOOL_DESCRIPTION}}",
        },
      ],
    }),
    {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    }
  );
}
