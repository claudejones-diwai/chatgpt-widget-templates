/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly DEV: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// OpenAI global types
declare global {
  interface Window {
    openai?: {
      theme?: "light" | "dark";
      displayMode?: "full" | "compact";
      maxHeight?: number;
      toolOutput?: unknown;
      widgetState?: unknown;
      locale?: string;
    };
  }
}

export {};
