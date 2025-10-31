import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Use absolute URLs for assets when loaded in ChatGPT's sandbox iframe
  base: "https://priority-inbox.pages.dev/",
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
})
