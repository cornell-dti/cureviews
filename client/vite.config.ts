import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// import svgr from 'vite-plugin-svgr';

export default defineConfig({
    build: {
      outDir: 'build',
    },
    plugins: [
      react(),
      // svgr({ svgrOptions: { icon: true } }),
    ],
    server: {
      port: 3000,
      proxy: {
        '/api': {
          target: 'http://localhost:8080',
          changeOrigin: true,
          secure: false,
        },
    },
  }
});