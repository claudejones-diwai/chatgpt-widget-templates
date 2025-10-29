// Input Validation Utilities

import { TOOL_INPUT_SCHEMA } from "../../../shared-types";

export function validateInput(
  data: Record<string, unknown>
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const schema = TOOL_INPUT_SCHEMA;

  // Check required fields
  if (schema.required) {
    for (const field of schema.required) {
      if (!(field in data) || data[field] === undefined || data[field] === "") {
        errors.push(`${field} is required`);
      }
    }
  }

  // Validate field types
  for (const [key, value] of Object.entries(data)) {
    const fieldSchema = schema.properties[key as keyof typeof schema.properties];
    if (!fieldSchema) continue;

    if (fieldSchema.type === "string" && typeof value !== "string") {
      errors.push(`${key} must be a string`);
    }
    if (fieldSchema.type === "number" && typeof value !== "number") {
      errors.push(`${key} must be a number`);
    }
    if (fieldSchema.type === "boolean" && typeof value !== "boolean") {
      errors.push(`${key} must be a boolean`);
    }

    // String constraints
    if (fieldSchema.type === "string" && typeof value === "string") {
      if ("minLength" in fieldSchema && value.length < fieldSchema.minLength) {
        errors.push(`${key} must be at least ${fieldSchema.minLength} characters`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
