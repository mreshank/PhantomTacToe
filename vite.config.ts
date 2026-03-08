import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "path";

export default defineConfig({
  // Expose VITE_ prefixed env vars to the client
  envPrefix: "VITE_",

  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },

  plugins: [
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "robots.txt", "icons/*.png"],
      manifest: false, // We already have a manual manifest.json in public/
      workbox: {
        // Cache all files in the build output for offline play
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2,mp3,wav}"],
        maximumFileSizeToCacheInBytes: 5000000, // 5MB limit to allow caching Three.js
      },
    }),
  ],

  build: {
    // Output directory
    outDir: "dist",
    // Generate sourcemaps for debugging
    sourcemap: false,
    // Optimize for production
    minify: "esbuild",
    // Asset file naming
    rollupOptions: {
      output: {
        assetFileNames: "assets/[name]-[hash][extname]",
        chunkFileNames: "assets/[name]-[hash].js",
        entryFileNames: "assets/[name]-[hash].js",
      },
    },
  },

  server: {
    // Dev server port
    port: 5173,
    // Allow network access for mobile testing
    host: true,
  },

  // Ensure public directory is served
  publicDir: "public",
});
