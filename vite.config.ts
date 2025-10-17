import react from '@vitejs/plugin-react'
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    process.env = {...process.env, ...loadEnv(mode, process.cwd())};
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
      base: '/avery_analytics/',     // use a leading and trailing slash
      publicDir: 'public'       // default, can be e.g. 'static' or false
    };
});
