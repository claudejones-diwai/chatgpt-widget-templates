// Server info handler
export function handleInfo(widgetUrl: string): Response {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Email Composer MCP Server</title>
      <style>
        body { font-family: system-ui; max-width: 800px; margin: 40px auto; padding: 20px; }
        code { background: #f4f4f4; padding: 2px 6px; border-radius: 3px; }
        pre { background: #f4f4f4; padding: 15px; border-radius: 5px; overflow-x: auto; }
      </style>
    </head>
    <body>
      <h1>Email Composer MCP Server</h1>
      <p>MCP server for composing emails with pre-filled templates.</p>

      <h2>Available Tool</h2>
      <ul>
        <li><code>compose_email</code> - Returns email template with editable fields</li>
      </ul>

      <h2>Widget URL</h2>
      <p><a href="${widgetUrl}">${widgetUrl}</a></p>

      <h2>Endpoints</h2>
      <ul>
        <li><code>GET /</code> - This info page</li>
        <li><code>GET /health</code> - Health check</li>
        <li><code>POST /mcp</code> - MCP JSON-RPC endpoint</li>
      </ul>
    </body>
    </html>
  `;

  return new Response(html, {
    headers: {
      "Content-Type": "text/html",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
