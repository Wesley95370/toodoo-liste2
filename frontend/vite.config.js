import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
  optimizeDeps: {
    include: ['react-google-recaptcha'], // Assure que Vite inclut cette dépendance
  },
  build: {
    rollupOptions: {
      // Optionnel : externaliser si nécessaire, mais pas recommandé ici
      // external: ['react-google-recaptcha'],
    },
  },
});