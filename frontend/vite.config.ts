import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "icons/*.png", "screenshots/*.png"],

      // ─── Web App Manifest ──────────────────────────────────
      manifest: {
        name: "Kultour — Descubre La Paz",
        short_name: "Kultour",
        description: "Descubre eventos y lugares únicos en La Paz, Bolivia",
        theme_color: "#1A4FFF",
        background_color: "#F8FAFC",
        display: "standalone",
        orientation: "portrait",
        scope: "/",
        start_url: "/",
        lang: "es",
        categories: ["lifestyle", "travel", "entertainment"],
        icons: [
          {
            src: "/icons/icon-72.png",
            sizes: "72x72",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/icons/icon-96.png",
            sizes: "96x96",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/icons/icon-128.png",
            sizes: "128x128",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/icons/icon-144.png",
            sizes: "144x144",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/icons/icon-152.png",
            sizes: "152x152",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/icons/icon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any maskable",
          },
          {
            src: "/icons/icon-384.png",
            sizes: "384x384",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
        screenshots: [
          {
            src: "/screenshots/mobile-home.png",
            sizes: "390x844",
            type: "image/png",
            form_factor: "narrow",
            label: "Kultour — Explorar eventos",
          },
        ],
      },

      // ─── Workbox — Estrategias de caché ───────────────────
      workbox: {
        navigateFallback: "/index.html",
        // Cachea todos los assets del build
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff,woff2}"],

        runtimeCaching: [
          // ── API: eventos (red primero, caché como respaldo) ──
          {
            urlPattern: ({ url }) =>
              url.pathname.startsWith("/api/events"),
            handler: "NetworkFirst",
            options: {
              cacheName: "kultour-events-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60, // 1 hora
              },
              networkTimeoutSeconds: 5,
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          // ── API: lugares (caché primero, actualiza en fondo) ─
          {
            urlPattern: ({ url }) =>
              url.pathname.startsWith("/api/places"),
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "kultour-places-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 6, // 6 horas
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          // ── API: ciudades y sugerencias (caché larga) ────────
          {
            urlPattern: ({ url }) =>
              url.pathname.startsWith("/api/cities") ||
              url.pathname.startsWith("/api/suggestions"),
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "kultour-static-api-cache",
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24, // 24 horas
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          // ── Imágenes externas (Unsplash, etc.) ───────────────
          {
            urlPattern: ({ request }) => request.destination === "image",
            handler: "CacheFirst",
            options: {
              cacheName: "kultour-images-cache",
              expiration: {
                maxEntries: 80,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 7 días
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          // ── Google Fonts ──────────────────────────────────────
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-cache",
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-static-cache",
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          // ── Tiles del mapa (OpenStreetMap) ────────────────────
          {
            urlPattern: /^https:\/\/[abc]\.tile\.openstreetmap\.org\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "osm-tiles-cache",
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 14, // 2 semanas
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },

      devOptions: {
        // Activa el SW también en desarrollo para probar
        enabled: true,
        type: "module",
      },
    }),
  ],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  server: {
    port: 5173,
    // Expone en red local para que el celular pueda conectarse
    host: "0.0.0.0",
    proxy: {
      "/api": {
        // En red local el proxy apunta al backend en la misma máquina
        target: "http://localhost:4000",
        changeOrigin: true,
      },
    },
  },

  preview: {
    port: 5173,
    host: "0.0.0.0",
  },
});
