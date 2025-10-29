// Tool Input Schema Types
// These types define the structure of data sent TO the MCP server

/**
 * Base interface for all tool inputs
 * Extend this in your specific widget implementation
 */
export interface BaseToolInput {
  // Add common fields here that all tools should have
  // Example: requestId?: string;
}

/**
 * Example tool input for the Hello World widget
 * Replace this with your actual tool input schema
 */
export interface HelloWorldToolInput extends BaseToolInput {
  name: string; // Required: User's name
  formal?: boolean; // Optional: Use formal greeting
}

/**
 * Generic tool input type
 * Replace with your specific input type
 */
export type ToolInput = HelloWorldToolInput;

/**
 * JSON Schema definition for tool input validation
 * This should match your MCP server's inputSchema
 */
export const TOOL_INPUT_SCHEMA = {
  type: "object",
  properties: {
    name: {
      type: "string",
      description: "User's name",
      minLength: 2,
    },
    formal: {
      type: "boolean",
      description: "Use formal greeting",
    },
  },
  required: ["name"],
} as const;
