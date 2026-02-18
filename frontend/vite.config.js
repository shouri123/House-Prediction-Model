import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          recharts: ['recharts'],
          leaflet: ['leaflet', 'react-leaflet'],
          pdf: ['jspdf'],
          vendor: ['react', 'react-dom', 'framer-motion', 'axios'],
        },
      },
    },
  },
})
