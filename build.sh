#!/usr/bin/env bash
# build.sh - FIXED for production deployment

set -o errexit

echo "🚀 Building Richman Tours application..."

# CRITICAL FIX: Set correct API URL for production
if [ -z "$VITE_API_BASE_URL" ]; then
    if [ "$NODE_ENV" = "production" ] || [ "$RENDER" = "true" ]; then
        # Use the same domain for both frontend and API
        export VITE_API_BASE_URL="https://richmans-kenya-journeys-1.onrender.com/api"
        echo "✅ Set production API URL: $VITE_API_BASE_URL"
    else
        export VITE_API_BASE_URL="http://localhost:8000/api"
        echo "✅ Set development API URL: $VITE_API_BASE_URL"
    fi
fi

echo "📋 Environment Variables:"
echo "VITE_API_BASE_URL: $VITE_API_BASE_URL"
echo "NODE_ENV: ${NODE_ENV:-'not set'}"
echo "RENDER: ${RENDER:-'not set'}"

# Install Python dependencies
echo "📦 Installing Python dependencies..."
python -m pip install --upgrade pip
pip install -r requirements.txt

# Clean build directory
echo "🧹 Cleaning previous builds..."
rm -rf node_modules package-lock.json dist staticfiles .vite || true

# Create optimized package.json
echo "📝 Creating package.json..."
cat > package.json << 'EOF'
{
  "name": "richman-tours",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "build": "vite build --mode production"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.30.1",
    "@tanstack/react-query": "^5.56.2",
    "lucide-react": "^0.462.0",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.6.0",
    "class-variance-authority": "^0.7.1",
    "@hookform/resolvers": "^3.10.0",
    "@radix-ui/react-slot": "^1.2.3",
    "@radix-ui/react-toast": "^1.2.14",
    "sonner": "^1.7.4",
    "@radix-ui/react-tooltip": "^1.2.7"
  },
  "devDependencies": {
    "@types/react": "^18.3.23",
    "@types/react-dom": "^18.3.7",
    "@types/node": "^22.16.5",
    "@vitejs/plugin-react": "^5.0.2",
    "vite": "^5.4.19",
    "typescript": "^5.8.3",
    "tailwindcss": "^3.4.17",
    "postcss": "^8.5.6",
    "autoprefixer": "^10.4.21",
    "terser": "^5.24.0"
  }
}
EOF

# Create production vite config
echo "⚙️ Creating Vite config..."
cat > vite.config.ts << 'VITE_EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          query: ['@tanstack/react-query'],
          ui: ['lucide-react', 'clsx', 'tailwind-merge']
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
  base: '/static/',
  define: {
    'process.env.NODE_ENV': JSON.stringify(mode || 'production'),
    'import.meta.env.VITE_API_BASE_URL': JSON.stringify(process.env.VITE_API_BASE_URL || 'https://richmans-kenya-journeys-1.onrender.com/api'),
  },
  esbuild: {
    drop: mode === 'production' ? ['console', 'debugger'] : [],
  }
}))
VITE_EOF

# Use Node/npm for build
echo "📦 Installing dependencies..."
if command -v npm &> /dev/null; then
    npm install --production=false
    echo "🏗️ Building React app..."
    VITE_API_BASE_URL="$VITE_API_BASE_URL" npm run build
else
    echo "❌ npm not available"
    exit 1
fi

# Verify build
if [ ! -d "dist" ] || [ -z "$(ls -A dist 2>/dev/null)" ]; then
    echo "❌ Build failed - no dist directory"
    exit 1
fi

echo "✅ Build verification:"
ls -la dist/

# Fix asset paths in index.html
if [ -f "dist/index.html" ]; then
    echo "🔧 Fixing asset paths..."
    sed -i 's|="/assets/|="/static/assets/|g' dist/index.html
    sed -i 's|href="/assets/|href="/static/assets/|g' dist/index.html  
    sed -i 's|src="/assets/|src="/static/assets/|g' dist/index.html
    # Remove doubles
    sed -i 's|="/static/static/|="/static/|g' dist/index.html
    echo "✅ Asset paths fixed"
fi

# Create staticfiles directory and copy build
echo "📂 Setting up Django static files..."
mkdir -p staticfiles
cp -r dist/* staticfiles/

# Create favicon and missing assets
echo "📄 Creating missing assets..."
mkdir -p staticfiles/assets

# Create a simple favicon
cat > staticfiles/favicon.ico << 'EOF'
# This would be a real favicon file - for now create placeholder
EOF

# Run Django setup
echo "🗄️ Running Django migrations..."
python manage.py migrate --noinput

echo "📦 Collecting Django static files..."
python manage.py collectstatic --noinput --clear

# Verify final structure
echo "🔍 Final verification:"
ls -la staticfiles/
echo "✅ Build completed successfully!"