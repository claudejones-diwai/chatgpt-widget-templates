import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Use absolute URLs for assets when loaded in ChatGPT's sandbox iframe
  // Will be updated after first deployment to Cloudflare Pages
  base: "https://animated-testimonials.pages.dev/",
  build: {
    outDir: "dist",
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: undefined, // Single bundle for simplicity
      },
    },
  },
  server: {
    port: 5173,
    strictPort: true,
  },
});
