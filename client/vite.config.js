import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const currentDir = typeof import.meta.dirname !== 'undefined' ? import.meta.dirname : process.cwd();
  const rootDir = path.resolve(currentDir, '..');
  const env = loadEnv(mode, rootDir, '');

  return {
    envDir: rootDir,
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.svg', 'apple-touch-icon.png', 'pwa-192x192.png', 'pwa-512x512.png', 'maskable-icon-512x512.png'],
        manifest: {
          name: 'Home Manga DB',
          short_name: 'MangaDB',
          description: 'Self-hosted manga and comic reader application',
          theme_color: '#000000',
          background_color: '#000000',
          display: 'standalone',
          display_override: ['fullscreen', 'standalone'],
          orientation: 'any',
          start_url: '/',
          icons: [
            {
              src: '/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png'
            },
            {
              src: '/maskable-icon-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable'
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any'
            }
          ]
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}']
        }
      })
    ],
    define: {
      'import.meta.env.PORT': JSON.stringify(env.PORT),
      'process.env.PORT': JSON.stringify(env.PORT)
    },
    server: {
      proxy: {
        '/api': {
          target: `http://localhost:${env.PORT}`,
          changeOrigin: true
        }
      }
    }
  };
});

