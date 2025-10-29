// Server Info Handler

export function handleInfo(widgetUrl: string): Response {
  return new Response(
    JSON.stringify({
      name: "hello-world-mcp-server",
      description: "Generates personalized greetings",
      version: "1.0.0",
      endpoints: {
        sse: "/sse",
        health: "/health",
        info: "/",
      },
      widgetUrl,
      tools: [
        {
          name: "greet_user",
          description: "Generates personalized greetings",
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
