// vite.config.ts - Fixed configuration for Django deployment
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Output directory should match Django's expectations
    outDir: 'dist',
    // Ensure assets are placed in an assets folder
    assetsDir: 'assets',
    // Generate manifest for better caching
    manifest: true,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html')
      }
    }
  },
  // Set base URL for proper asset serving in production
  base: process.env.NODE_ENV === 'production' ? '/static/' : '/',
  // Configure dev server
  server: {
    port: 5173,
    host: true
  }
})