import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      includeAssets: ["favicon.svg", "pwa-icon.svg", "pwa-maskable-icon.svg"],
      manifest: {
        background_color: "#f6fbf8",
        description:
          "Build, download, and review Mandarin pinyin flashcard decks.",
        display: "standalone",
        icons: [
          {
            src: "/pwa-icon.svg",
            sizes: "192x192",
            type: "image/svg+xml",
          },
          {
            src: "/pwa-icon.svg",
            sizes: "512x512",
            type: "image/svg+xml",
          },
          {
            purpose: "maskable",
            src: "/pwa-maskable-icon.svg",
            sizes: "512x512",
            type: "image/svg+xml",
          },
        ],
        name: "HanziFlow",
        short_name: "HanziFlow",
        start_url: "/",
        theme_color: "#183d32",
      },
      registerType: "prompt",
      workbox: {
        cleanupOutdatedCaches: true,
        navigateFallback: "/index.html",
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
