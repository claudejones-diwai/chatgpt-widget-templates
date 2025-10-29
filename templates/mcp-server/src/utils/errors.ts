// Error Handling Utilities

import { ErrorOutput } from "../../../shared-types";

export function createError(code: string, message: string): ErrorOutput {
  return {
    error: true,
    message,
    code,
    timestamp: new Date().toISOString(),
  };
}

export class ToolError extends Error {
  code: string;

  constructor(code: string, message: string) {
    super(message);
    this.code = code;
    this.name = "ToolError";
  }
}
