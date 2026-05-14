import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig(({ mode }) => {
  return {
    plugins: [react()],
    base: mode === "production" ? "/" : "/",
    build: {
      outDir: "dist",
      assetsDir: "assets",
    },
    test: {
      environment: "jsdom",
      setupFiles: "./src/test/setupTests.js",
      globals: true,
      css: true,
    },
  };
});
