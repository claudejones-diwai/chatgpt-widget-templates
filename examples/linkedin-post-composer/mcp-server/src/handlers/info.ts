export function handleInfo(widgetUrl: string): Response {
  const infoHtml = `
<!DOCTYPE html>
<html>
<head>
  <title>LinkedIn Post Composer MCP Server</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      max-width: 800px;
      margin: 40px auto;
      padding: 0 20px;
      line-height: 1.6;
      color: #333;
    }
    h1 { color: #0A66C2; }
    code {
      background: #f4f4f4;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: 'Monaco', monospace;
    }
    pre {
      background: #f4f4f4;
      padding: 15px;
      border-radius: 5px;
      overflow-x: auto;
    }
    .badge {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 3px;
      font-size: 12px;
      font-weight: bold;
    }
    .badge.success { background: #d4edda; color: #155724; }
    .badge.warning { background: #fff3cd; color: #856404; }
  </style>
</head>
<body>
  <h1>LinkedIn Post Composer MCP Server</h1>
  <p><span class="badge success">Status: Running</span> <span class="badge warning">Phase 1: Stubs</span></p>

  <h2>Available Tools</h2>
  <ul>
    <li><strong>compose_linkedin_post</strong> - Opens post composer widget</li>
    <li><strong>generate_image</strong> - Generate image with DALL-E (server action)</li>
    <li><strong>upload_image</strong> - Upload image to R2 (server action)</li>
    <li><strong>publish_post</strong> - Publish post to LinkedIn (server action)</li>
  </ul>

  <h2>Widget URL</h2>
  <p><a href="${widgetUrl}" target="_blank">${widgetUrl}</a></p>

  <h2>Endpoints</h2>
  <ul>
    <li><code>GET /</code> - This page</li>
    <li><code>GET /health</code> - Health check</li>
    <li><code>POST /mcp</code> - MCP JSON-RPC endpoint</li>
  </ul>

  <h2>Phase Implementation Status</h2>
  <h3>Phase 1 (Current) ✅</h3>
  <ul>
    <li>✅ Text-only posts</li>
    <li>✅ Single image posts</li>
    <li>✅ AI image generation (stub)</li>
    <li>✅ Image upload (stub)</li>
    <li>✅ Account selection (stub data)</li>
    <li>✅ Publish to LinkedIn (stub)</li>
  </ul>

  <h3>Phase 2 (Planned) ⏳</h3>
  <ul>
    <li>⏳ Real LinkedIn API integration</li>
    <li>⏳ Real DALL-E API integration</li>
    <li>⏳ Carousel posts (2-10 images)</li>
    <li>⏳ Video posts</li>
    <li>⏳ Document posts</li>
    <li>⏳ Poll creation</li>
  </ul>

  <h2>Documentation</h2>
  <p>See <code>PRD.md</code> for complete specifications and integration guides.</p>
</body>
</html>
`;

  return new Response(infoHtml, {
    headers: {
      "Content-Type": "text/html",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
