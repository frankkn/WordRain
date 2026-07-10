import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    // Honor the port assigned by the preview harness (falls back to Vite's default).
    port: Number(process.env.PORT) || 5173,
  },
});
