/// <reference types="vite/client" />

// OpenAI ChatGPT Widget API types
interface OpenAIGlobal {
  readonly version: string;
  readonly theme: "light" | "dark";
  readonly displayMode?: string;
  readonly maxHeight?: number;
  readonly toolOutput: any;
  readonly widgetState?: any;
  readonly locale?: string;
  readonly callTool: (toolName: string, params: any) => Promise<any>;
  readonly sendFollowUpMessage?: (options: { message: string }) => void;
  readonly setWidgetState?: (state: any) => void;
}

declare global {
  interface Window {
    openai?: OpenAIGlobal;
  }
}

export {};
