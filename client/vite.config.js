import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
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
      tailwindcss()
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
