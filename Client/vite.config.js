import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: { proxy: { '/api': { target: 'http://localhost:5000', changeOrigin: true } } },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) return 'vendor'
          if (id.includes('axios') || id.includes('zustand')) return 'ui'
        }
      }
    },
    chunkSizeWarningLimit: 1000,
  }
})
