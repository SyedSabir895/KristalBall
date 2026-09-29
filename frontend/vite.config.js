import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Dev only: /api/* is forwarded to the backend → same origin, no CORS issues
    proxy: {
      '/api': 'http://localhost:5000',
    },
  },
})
