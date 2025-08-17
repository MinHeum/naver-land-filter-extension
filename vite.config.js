import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: resolve(__dirname, "src/main.js"),
      output: {
        entryFileNames: "content.js",
        format: "iife",
        name: "NaverLandFilter",
      },
    },
    target: "es2020",
    minify: false,
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
});
