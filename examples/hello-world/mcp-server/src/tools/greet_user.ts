// Tool Handler
// Implements the business logic for the tool

import { HelloWorldToolInput, HelloWorldToolOutput, ErrorOutput } from "../../../shared-types";
import { validateInput } from "../utils/validation";
import { createError } from "../utils/errors";

/**
 * Handles the greet_user tool invocation
 *
 * @param args - Tool arguments from ChatGPT
 * @returns Tool output data that will be passed to the widget
 */
export async function handleTool(
  args: Record<string, unknown>
): Promise<HelloWorldToolOutput | ErrorOutput> {
  try {
    // Validate input
    const validation = validateInput(args);
    if (!validation.valid) {
      return createError("VALIDATION_ERROR", validation.errors.join(", "));
    }

    const input = args as unknown as HelloWorldToolInput;

    // TODO: Implement your tool logic here
    // This is where you would:
    // - Call external APIs
    // - Process data
    // - Query databases
    // - Perform calculations
    // etc.

    // Example implementation:
    const greeting = input.formal
      ? `Good day, ${input.name}.`
      : `Hello, ${input.name}!`;

    const result: HelloWorldToolOutput = {
      greeting,
      formal: input.formal || false,
      timestamp: new Date().toISOString(),
    };

    return result;
  } catch (error) {
    console.error("Tool execution error:", error);
    return createError(
      "EXECUTION_ERROR",
      error instanceof Error ? error.message : "An unexpected error occurred"
    );
  }
}
