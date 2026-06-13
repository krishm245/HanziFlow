import { defineConfig } from "vitest/config";
import viteConfig from "./vite.config";

export default defineConfig({
  plugins: viteConfig.plugins,
  resolve: viteConfig.resolve,
  test: {
    environment: "edge-runtime",
  },
});
