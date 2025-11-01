// Hook to call server actions (MCP tools) from widget
import { useState } from "react";

export interface ServerActionResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export function useServerAction<TParams = any, TResult = any>(toolName: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TResult | null>(null);

  const execute = async (params: TParams): Promise<ServerActionResult<TResult>> => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      if (!window.openai?.callTool) {
        throw new Error("window.openai.callTool not available");
      }

      const response = await window.openai.callTool(toolName, params);
      const data = response?.structuredContent || response;

      setResult(data);
      setLoading(false);

      return {
        success: true,
        data,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      setLoading(false);

      return {
        success: false,
        error: errorMessage,
      };
    }
  };

  return {
    execute,
    loading,
    error,
    result,
  };
}
