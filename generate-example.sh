#!/bin/bash

# Generate Hello World Example
# This script creates the hello-world example from templates

set -e

PROJECT_NAME="hello-world"
WIDGET_NAME="Hello World"
TOOL_NAME="greet_user"
TOOL_DESCRIPTION="Generates personalized greetings"
CURRENT_DATE=$(date +%Y-%m-%d)

echo "🚀 Generating Hello World example..."

# Create directory structure
mkdir -p examples/$PROJECT_NAME/{widget-react/src/{components,hooks,utils,styles},widget-react/public,mcp-server/src/{tools,handlers,utils},shared-types}

# Function to copy and replace placeholders
process_file() {
  local src=$1
  local dest=$2

  # Handle special case: rename {{TOOL_NAME}}.ts
  if [[ $dest == *"{{TOOL_NAME}}.ts"* ]]; then
    dest="${dest//\{\{TOOL_NAME\}\}/$TOOL_NAME}"
  fi

  # Copy and replace
  sed -e "s/{{PROJECT_NAME}}/$PROJECT_NAME/g" \
      -e "s/{{WIDGET_NAME}}/$WIDGET_NAME/g" \
      -e "s/{{TOOL_NAME}}/$TOOL_NAME/g" \
      -e "s/{{TOOL_DESCRIPTION}}/$TOOL_DESCRIPTION/g" \
      -e "s/{{CURRENT_DATE}}/$CURRENT_DATE/g" \
      "$src" > "$dest"

  echo "  ✓ $dest"
}

# Copy shared types
for file in templates/shared-types/*; do
  process_file "$file" "examples/$PROJECT_NAME/shared-types/$(basename $file)"
done

# Copy widget files
find templates/widget-react/src -type f | while read file; do
  rel_path="${file#templates/widget-react/}"
  process_file "$file" "examples/$PROJECT_NAME/widget-react/$rel_path"
done

# Copy widget config files
for file in templates/widget-react/{package.json,tsconfig.json,vite.config.ts,tailwind.config.js,postcss.config.js}; do
  [[ -f $file ]] && process_file "$file" "examples/$PROJECT_NAME/widget-react/$(basename $file)"
done

# Copy widget public files
process_file "templates/widget-react/public/index.html" "examples/$PROJECT_NAME/widget-react/public/index.html"

# Copy MCP server files
find templates/mcp-server/src -type f | while read file; do
  rel_path="${file#templates/mcp-server/}"
  process_file "$file" "examples/$PROJECT_NAME/mcp-server/$rel_path"
done

# Copy MCP server config files
for file in templates/mcp-server/{package.json,tsconfig.json,wrangler.toml}; do
  [[ -f $file ]] && process_file "$file" "examples/$PROJECT_NAME/mcp-server/$(basename $file)"
done

# Copy root files
process_file "templates/.gitignore" "examples/$PROJECT_NAME/.gitignore"
process_file "templates/.env.example" "examples/$PROJECT_NAME/.env.example"
process_file "templates/README.md" "examples/$PROJECT_NAME/README.md"
process_file "templates/WIDGET_SPEC.md" "examples/$PROJECT_NAME/WIDGET_SPEC.md"

echo ""
echo "✅ Hello World example generated successfully!"
echo ""
echo "📁 Location: examples/$PROJECT_NAME"
echo ""
echo "Next steps:"
echo "  cd examples/$PROJECT_NAME"
echo "  cat README.md"
