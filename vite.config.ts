/// <reference types="node" />
import react from '@vitejs/plugin-react'
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    // load environment variables (VITE_* are exposed to client code via import.meta.env)
    const env = loadEnv(mode, process.cwd());
    process.env = { ...process.env, ...env };

    // Allow overriding base via VITE_BASE_URL, fallback to '/avery_analytics/'
    const baseUrl = process.env.VITE_BASE_URL || '/avery_analytics/';

    return {
      plugins: [react()],
      server: {
        host: true,
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      base: baseUrl,     // use a leading and trailing slash when setting VITE_BASE_URL
      publicDir: 'public'       // default, can be e.g. 'static' or false
    };
});
