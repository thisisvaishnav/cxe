import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/signup': 'http://localhost:3000',
      '/signin': 'http://localhost:3000',
      '/order': 'http://localhost:3000',
      '/depth': 'http://localhost:3000',
      '/balance': 'http://localhost:3000',
      '/positions': 'http://localhost:3000',
      '/ws': {
        target: 'ws://localhost:3000',
        ws: true,
      },
    },
  },
})
