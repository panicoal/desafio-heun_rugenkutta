import { defineConfig } from 'vite';

export default defineConfig({
  optimizeDeps: {
    exclude: ['@electric-sql/pglite'],
  },
  worker: {
    format: 'es',
  },
  build: {
    target: 'esnext',
    chunkSizeWarningLimit: 3000,
  },
});
