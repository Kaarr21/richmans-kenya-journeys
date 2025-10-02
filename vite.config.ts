import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"
import { componentTagger } from "lovable-tagger"

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'esbuild', // Changed to esbuild for faster builds
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['lucide-react', '@radix-ui/react-slot']
        },
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
      }
    },
    chunkSizeWarningLimit: 1000,
    target: 'es2020',
    reportCompressedSize: false
  },
  base: mode === 'production' ? '/static/' : '/',
  define: {
    'process.env.NODE_ENV': JSON.stringify(mode || 'development'),
    // Inject environment variables at build time
    'import.meta.env.VITE_API_BASE_URL': JSON.stringify(process.env.VITE_API_BASE_URL || ''),
  },
  esbuild: {
    drop: mode === 'production' ? ['console', 'debugger'] : [],
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', '@tanstack/react-query']
  }
}))