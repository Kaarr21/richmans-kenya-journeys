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

# Install dependencies
echo "📦 Installing Node.js dependencies..."
npm install

# Install Vite and plugins explicitly
echo "📦 Installing Vite explicitly..."
npm install vite@latest @vitejs/plugin-react@latest

# Create a minimal vite config if it doesn't exist or is problematic
echo "🔧 Creating minimal Vite config..."
cat > vite.config.js << 'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  },
  base: '/static/'
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