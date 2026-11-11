import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
// eslint-disable-next-line no-restricted-syntax
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      src: "/src",
    },
  },
  // Configure the dev server
  // See nginx for the prod server
  // For options, see: https://vite.dev/config/server-options
  server: {
    // Default dev port is 5173. Make it strict to avoid trying other ports
    strictPort: true,
    // Routes to the dev backend
    proxy: {
      "/api": "http://osoriano.com:2847",
      "/ws": "ws://osoriano.com:2847",
    },
  },
  // Configure the preview server (used in CI)
  // For options, see: https://vite.dev/config/preview-options
  preview: {
    // Default dev port is 4173. Make it strict to avoid trying other ports
    strictPort: true,
    // Routes to the prod backend. This should be updated to the staging
    // backend if available
    proxy: {
      "/api": "http://jettison-api-service:2846/api",
      "/ws": "ws://jettison-api-service:2846/ws",
    },
  }
});
