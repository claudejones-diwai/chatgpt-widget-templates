// OpenAI Window API Types
// Based on: https://github.com/openai/openai-apps-sdk-examples

export type DeviceType = "mobile" | "tablet" | "desktop" | "unknown";
export type DisplayMode = "pip" | "inline" | "fullscreen";
export type Theme = "light" | "dark";

export interface SafeAreaInsets {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export interface UserAgent {
  device: {
    type: DeviceType;
  };
  capabilities: {
    hover: boolean;
    touch: boolean;
  };
}

export interface OpenAiGlobals<
  ToolInput = Record<string, unknown>,
  ToolOutput = Record<string, unknown>,
  ToolResponseMetadata = Record<string, unknown>,
  WidgetState = Record<string, unknown>
> {
  // Visual
  theme: Theme;
  userAgent: UserAgent;
  locale: string;

  // Layout
  maxHeight: number;
  displayMode: DisplayMode;
  safeArea: {
    insets: SafeAreaInsets;
  };

  // State
  toolInput: ToolInput;
  toolOutput: ToolOutput | null;
  toolResponseMetadata: ToolResponseMetadata | null;
  widgetState: WidgetState | null;
}

export interface OpenAiAPI {
  callTool: (
    name: string,
    args: Record<string, unknown>
  ) => Promise<CallToolResponse>;
  sendFollowUpMessage: (args: { prompt: string }) => Promise<void>;
  openExternal: (payload: { href: string }) => void;
  requestDisplayMode: (args: {
    mode: DisplayMode;
  }) => Promise<{ mode: DisplayMode }>;
  setWidgetState: <T = Record<string, unknown>>(state: T) => Promise<void>;
}

export interface CallToolResponse {
  success: boolean;
  data?: unknown;
  error?: string;
}

export const SET_GLOBALS_EVENT_TYPE = "openai:set_globals" as const;

export class SetGlobalsEvent extends CustomEvent<{
  globals: Partial<OpenAiGlobals>;
}> {
  constructor(globals: Partial<OpenAiGlobals>) {
    super(SET_GLOBALS_EVENT_TYPE, { detail: { globals } });
  }
}

declare global {
  interface Window {
    openai: OpenAiAPI & OpenAiGlobals;
  }

  interface WindowEventMap {
    [SET_GLOBALS_EVENT_TYPE]: SetGlobalsEvent;
  }
}
