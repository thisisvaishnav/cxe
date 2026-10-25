import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  build: {
    chunkSizeWarningLimit: 1500,
  },
  envPrefix: ['VITE_', 'NEXT_PUBLIC_', 'CLERK_'],
  server: {
    proxy: {
      '/signup': 'http://localhost:3000',
      '/signin': 'http://localhost:3000',
      '/order': 'http://localhost:3000',
      '/depth': 'http://localhost:3000',
      '/balance': 'http://localhost:3000',
      '/positions': 'http://localhost:3000',
      '/deposit': 'http://localhost:3000',
      '/api': 'http://localhost:3000',
      '/ws': {
        target: 'ws://localhost:3000',
        ws: true,
      },
    },
  },
})
