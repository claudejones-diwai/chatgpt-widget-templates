/// <reference types="vite/client" />

// CSS module type declarations
declare module '*.css' {
  const content: string;
  export default content;
}

// Image type declarations
declare module '*.svg' {
  const content: string;
  export default content;
}

declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.jpg' {
  const content: string;
  export default content;
}

// Vite environment variables
interface ImportMetaEnv {
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly SSR: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
