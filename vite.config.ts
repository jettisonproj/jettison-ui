import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vite.dev/config/
// eslint-disable-next-line no-restricted-syntax
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      src: "/src",
    },
  },
  // Configure the dev proxy. This should route to the dev api
  // See nginx for the prod proxy
  server: {
    proxy: {
      "/api": "http://osoriano.com:2846",
      "/ws": "ws://osoriano.com:2846",
    },
  },
});
