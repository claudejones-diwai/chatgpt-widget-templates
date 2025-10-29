// Input Validation Utilities

import { TOOL_INPUT_SCHEMA } from "../../../shared-types";

/**
 * Validates input data against the tool input schema
 *
 * @returns { valid: boolean, errors: string[] }
 */
export function validateToolInput(
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

  // Validate field types and constraints
  for (const [key, value] of Object.entries(data)) {
    const fieldSchema = schema.properties[key as keyof typeof schema.properties];
    if (!fieldSchema) continue;

    // Type validation
    const fieldType = (fieldSchema as any).type;

    if (fieldType === "string" && typeof value !== "string") {
      errors.push(`${key} must be a string`);
    }
    if (fieldType === "number" && typeof value !== "number") {
      errors.push(`${key} must be a number`);
    }
    if (fieldType === "boolean" && typeof value !== "boolean") {
      errors.push(`${key} must be a boolean`);
    }

    // String-specific validation
    if (fieldType === "string" && typeof value === "string") {
      const minLength = (fieldSchema as any).minLength;
      const maxLength = (fieldSchema as any).maxLength;

      if (minLength !== undefined && value.length < minLength) {
        errors.push(`${key} must be at least ${minLength} characters`);
      }
      if (maxLength !== undefined && value.length > maxLength) {
        errors.push(`${key} must be at most ${maxLength} characters`);
      }
    }

    // Number-specific validation
    if (fieldType === "number" && typeof value === "number") {
      const minimum = (fieldSchema as any).minimum;
      const maximum = (fieldSchema as any).maximum;

      if (minimum !== undefined && value < minimum) {
        errors.push(`${key} must be at least ${minimum}`);
      }
      if (maximum !== undefined && value > maximum) {
        errors.push(`${key} must be at most ${maximum}`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
