// Tool Output Schema Types
// These types define the structure of data received FROM the MCP server

/**
 * Base interface for all tool outputs
 * Extend this in your specific widget implementation
 */
export interface BaseToolOutput {
  timestamp: string; // ISO timestamp
  error?: boolean;
  message?: string; // Error message if error is true
}

/**
 * Example tool output for the Hello World widget
 * Replace this with your actual tool output schema
 */
export interface HelloWorldToolOutput extends BaseToolOutput {
  greeting: string; // Personalized greeting
  formal: boolean; // Whether formal greeting was used
}

/**
 * Generic tool output type
 * Replace with your specific output type
 */
export type ToolOutput = HelloWorldToolOutput;

/**
 * Error output structure
 */
export interface ErrorOutput extends BaseToolOutput {
  error: true;
  message: string;
  code?: string;
}
