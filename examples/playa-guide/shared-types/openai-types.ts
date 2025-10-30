// OpenAI Apps SDK Global Types
// Extending the Window interface to include the openai global

export type Theme = "light" | "dark";
export type DisplayMode = "inline" | "fullscreen" | "pip";

export interface SendFollowUpMessageOptions {
  prompt: string;
}

export interface CallToolOptions {
  name: string;
  arguments?: Record<string, unknown>;
}

export interface OpenAI {
  theme: Theme | null;
  displayMode: DisplayMode | null;
  maxHeight: number | null;
  toolOutput: unknown | null;
  widgetState: unknown | null;
  locale: string | null;
  sendFollowUpMessage: (options: SendFollowUpMessageOptions) => Promise<void>;
  callTool: (options: CallToolOptions) => Promise<void>;
  subscribe: (callback: () => void) => () => void;
}

declare global {
  interface Window {
    openai?: OpenAI;
  }
}
