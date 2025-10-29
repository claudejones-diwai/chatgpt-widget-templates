# ChatGPT Widget Templates

Production-ready templates for building custom ChatGPT widgets with React and MCP servers deployed to Cloudflare.

## Overview

This repository contains everything you need to create rich, interactive ChatGPT widgets:

- **React Widget Template** - Modern UI with TypeScript, Tailwind CSS, and Vite
- **MCP Server Template** - Cloudflare Workers backend
- **Shared Types** - Type-safe communication between widget and server
- **Claude Skill** - Automated project generation
- **Examples** - Complete reference implementations

## Quick Start

### Using the Claude Skill (Recommended)

If you're using Claude Code:

```
Use the widget-factory skill to generate a new widget project
```

Claude will guide you through the process interactively.

### Manual Generation

1. Clone this repository:
```bash
git clone https://github.com/claudejones-diwai/chatgpt-widget-templates.git
cd chatgpt-widget-templates
```

2. Copy the templates:
```bash
cp -r templates/widget-react my-widget/widget-react
cp -r templates/mcp-server my-widget/mcp-server
cp -r templates/shared-types my-widget/shared-types
cp templates/.gitignore my-widget/.gitignore
cp templates/.env.example my-widget/.env.example
cp templates/README.md my-widget/README.md
cp templates/WIDGET_SPEC.md my-widget/WIDGET_SPEC.md
```

3. Replace placeholders:
   - `{{PROJECT_NAME}}` → your-project-name
   - `{{WIDGET_NAME}}` → Your Widget Name
   - `{{TOOL_NAME}}` → your_tool_name
   - `{{TOOL_DESCRIPTION}}` → What your tool does

4. Follow the README in your new project for deployment instructions

## What's Included

### Templates

- **widget-react/** - React 19 + TypeScript + Tailwind + Vite
  - Custom hooks for window.openai API
  - Theme support (light/dark)
  - Display mode handling (inline/pip/fullscreen)
  - Responsive design
  - Error boundaries
  - Loading/empty/error states
  - Form components with validation

- **mcp-server/** - Cloudflare Workers + MCP SDK
  - Tool registration
  - SSE transport
  - Input validation
  - Error handling
  - Health check endpoints

- **shared-types/** - TypeScript definitions
  - window.openai API types
  - Tool input/output schemas
  - Shared interfaces

### Examples

- **hello-world/** - Complete reference implementation
  - Simple greeting widget
  - Demonstrates all key features
  - Ready to deploy

### Documentation

- **README.md** - Getting started guide
- **WIDGET_SPEC.md** - Detailed specification
- **docs/ARCHITECTURE.md** - Why separation matters
- **docs/DEPLOYMENT.md** - Step-by-step deployment
- **docs/CUSTOMIZATION.md** - How to customize
- **docs/TROUBLESHOOTING.md** - Common issues

## Architecture

```
ChatGPT ──(SSE)──> MCP Server (Cloudflare Workers)
                        │
                        │ (returns widget URL)
                        ↓
                   Widget URL (Cloudflare Pages)
                        │
                        │ (loads in iframe)
                        ↓
                   User's Browser
```

**Key principle:** Widgets and MCP servers are SEPARATE deployments.

## Features

✅ Production-ready templates
✅ Type-safe with TypeScript
✅ Modern React patterns
✅ Tailwind CSS styling
✅ Dark mode support
✅ Responsive design
✅ Error handling
✅ Input validation
✅ Cloudflare deployment
✅ Complete documentation

## Requirements

- Node.js 18+
- Cloudflare account
- Wrangler CLI: `npm install -g wrangler`

## Tech Stack

**Widget:**
- React 19
- TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- Lucide Icons

**MCP Server:**
- TypeScript
- @modelcontextprotocol/sdk
- Cloudflare Workers

## Examples

### Hello World

Simple greeting widget that demonstrates all core features:

```bash
cd examples/hello-world
cat README.md
```

### Coming Soon

- LinkedIn Post Creator
- Image Gallery
- Data Visualization
- Form Builder

## Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Resources

- [OpenAI Apps SDK Examples](https://github.com/openai/openai-apps-sdk-examples)
- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [MCP Protocol Docs](https://modelcontextprotocol.io)

## License

MIT

## Support

For issues or questions:
- Open an issue on GitHub
- Check the troubleshooting guide
- Review example projects

---

**Ready to build your ChatGPT widget? Start with the hello-world example!**
