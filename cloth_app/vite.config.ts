import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    strictPort: false,
    allowedHosts: true,
    watch: {
      usePolling: true,
      interval: 1000,
      ignored: ['**/*.bat', '**/*.ps1', '**/.git/**'],
    },
  },
  preview: {
    host: true,
    allowedHosts: [
      'cloth-managment.onrender.com',
      '.onrender.com',
      'localhost',
      '127.0.0.1',
    ],
  }
});
