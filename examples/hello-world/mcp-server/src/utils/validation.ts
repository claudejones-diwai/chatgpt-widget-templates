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

    const fieldType = (fieldSchema as any).type;
    const minLength = (fieldSchema as any).minLength;

    if (fieldType === "string" && typeof value !== "string") {
      errors.push(`${key} must be a string`);
    }
    if (fieldType === "number" && typeof value !== "number") {
      errors.push(`${key} must be a number`);
    }
    if (fieldType === "boolean" && typeof value !== "boolean") {
      errors.push(`${key} must be a boolean`);
    }

    // String constraints
    if (fieldType === "string" && typeof value === "string") {
      if (minLength !== undefined && value.length < minLength) {
        errors.push(`${key} must be at least ${minLength} characters`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
