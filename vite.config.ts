import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  build: {
    assetsDir: "./",
    rollupOptions: {
      output: {
      }
    }
  },
  base: "./",
  publicDir: './public',
  plugins: [
    react(),
  ],
})
