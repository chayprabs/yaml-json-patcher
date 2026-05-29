import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";
import { VitePWA } from "vite-plugin-pwa";
import { viteSingleFile } from "vite-plugin-singlefile";
import path from "node:path";

const singleFile = process.env.SINGLEFILE === "1";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    wasm(),
    topLevelAwait(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "ConfigShape",
        short_name: "ConfigShape",
        description:
          "Query and patch YAML, JSON, TOML and XML configs in your browser",
        theme_color: "#0f172a",
        background_color: "#0f172a",
        display: "standalone",
        icons: [
          {
            src: "/icon.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,woff2}"],
        navigateFallback: "/index.html",
      },
    }),
    ...(singleFile ? [viteSingleFile()] : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@configshape/yaml-json-patcher": path.resolve(__dirname, "../core/src/index.ts"),
    },
  },
  build: {
    target: "esnext",
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("jq-wasm")) return "jq-wasm";
          if (id.includes("monaco-editor")) return "monaco";
          if (id.includes("ajv")) return "ajv";
          if (id.includes("jsonpath-plus")) return "jsonpath";
          if (id.includes("jmespath")) return "jmespath";
        },
      },
    },
  },
  server: {
    port: 5173,
    headers: {
      "Content-Security-Policy":
        "default-src 'self'; script-src 'self' 'wasm-unsafe-eval'; connect-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:;",
    },
  },
});
