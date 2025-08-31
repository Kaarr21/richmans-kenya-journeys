#!/usr/bin/env bash
# build.sh - Simple approach to bypass Vite config issues

set -o errexit

echo "🚀 Starting build process..."

# Python dependencies
echo "📦 Installing Python dependencies..."
python -m pip install --upgrade pip
pip install -r requirements.txt --timeout=300

# Node.js setup
echo "📦 Setting up Node.js..."
rm -rf node_modules package-lock.json .vite || true
npm cache clean --force || true

# Install dependencies including PostCSS and Tailwind
echo "📦 Installing Node.js dependencies..."
npm install

# Install PostCSS and Tailwind explicitly
echo "📦 Installing PostCSS and Tailwind..."
npm install tailwindcss@latest postcss@latest autoprefixer@latest --save-dev

# Create PostCSS config
echo "🔧 Creating PostCSS config..."
cat > postcss.config.js << 'EOF'
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOF

# Create Tailwind config
echo "🔧 Creating Tailwind config..."
cat > tailwind.config.js << 'EOF'
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
EOF

# Create a minimal vite config that works with PostCSS
echo "🔧 Creating minimal Vite config..."
cat > vite.config.js << 'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  css: {
    postcss: './postcss.config.js',
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: undefined,
      }
    }
  },
  base: '/static/',
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})
EOF

# Build with the JS config (not TS)
echo "🏗️ Building React app..."
export NODE_ENV=production
export PUBLIC_URL="/static/"
npx vite build --config vite.config.js

# Verify build
if [ ! -d "dist" ]; then
    echo "❌ Build failed - no dist directory"
    exit 1
fi

echo "📋 Build contents:"
ls -la dist/

# Fix asset paths
echo "🔧 Fixing asset paths..."
if [ -f "dist/index.html" ]; then
    sed -i 's|"/assets/|"/static/|g' dist/index.html
    sed -i "s|'/assets/|'/static/|g" dist/index.html
    echo "✅ Fixed asset paths"
fi

# Django steps
echo "📦 Collecting static files..."
python manage.py collectstatic --noinput --clear

echo "🗄️ Running migrations..."
python manage.py migrate --noinput

echo "✅ Build completed!"