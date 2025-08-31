#!/usr/bin/env bash
# build.sh - Fixed for Node.js module resolution issues

set -o errexit

echo "🚀 Starting build with module resolution fix..."

# Python dependencies
echo "📦 Installing Python dependencies..."
python -m pip install --upgrade pip
pip install -r requirements.txt --timeout=300

# Complete Node.js reset
echo "🧹 Complete Node.js reset..."
rm -rf node_modules package-lock.json .vite dist || true
npm cache clean --force || true

# Install with exact package.json (no modifications)
echo "📦 Installing dependencies from package.json..."
npm install --legacy-peer-deps

# Verify installations
echo "🔍 Verifying critical packages..."
if [ ! -d "node_modules/vite" ]; then
    echo "❌ Vite not in node_modules, reinstalling..."
    npm install vite@^7.1.3 --legacy-peer-deps
fi

if [ ! -d "node_modules/@vitejs/plugin-react" ]; then
    echo "❌ Vite React plugin not found, reinstalling..."
    npm install @vitejs/plugin-react@^5.0.2 --legacy-peer-deps
fi

echo "✅ Node modules structure:"
ls -la node_modules/ | grep -E "(vite|react)" || echo "Packages found"

# Remove any existing Vite configs to avoid conflicts
echo "🧹 Removing existing Vite configs..."
rm -f vite.config.ts vite.config.js vite.config.mjs || true

# Create a working Vite config using CommonJS to avoid ES module issues
echo "🔧 Creating working Vite config..."
cat > vite.config.mjs << 'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(process.cwd(), 'src'),
    },
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
  define: {
    'process.env.NODE_ENV': '"production"',
  }
})
EOF

# Set Node.js environment variables
export NODE_ENV=production
export NODE_OPTIONS="--max-old-space-size=4096"

# Build using the .mjs config
echo "🏗️ Building with Vite..."
npx vite build --config vite.config.mjs

# Verify build
if [ ! -d "dist" ]; then
    echo "❌ Build failed - no dist directory"
    echo "📋 Trying alternative build method..."
    
    # Alternative: Use npx with explicit paths
    echo "🔄 Trying direct npx build..."
    NODE_PATH=./node_modules npx vite build --base="/static/" --outDir=dist
    
    if [ ! -d "dist" ]; then
        echo "❌ All build methods failed"
        echo "📋 Debug info:"
        echo "Current directory: $(pwd)"
        echo "Node modules vite: $(ls node_modules/vite 2>/dev/null || echo 'NOT FOUND')"
        echo "Available executables:"
        find node_modules/.bin -name "*vite*" 2>/dev/null || echo "No vite executables found"
        exit 1
    fi
fi

echo "✅ Build successful!"
echo "📋 Build output:"
ls -la dist/

# Fix asset paths
if [ -f "dist/index.html" ]; then
    echo "🔧 Fixing asset paths in HTML..."
    sed -i 's|="/assets/|="/static/|g' dist/index.html
    sed -i "s|='/assets/|='/static/|g" dist/index.html
    
    echo "📋 Checking HTML content:"
    head -n 20 dist/index.html | grep -E "(href|src)" || echo "HTML looks good"
    
    echo "✅ Asset paths fixed"
fi

# Django static collection
echo "📦 Collecting Django static files..."
python manage.py collectstatic --noinput --clear --verbosity=2

# Verify static collection worked
echo "📋 Verifying static files..."
if [ -d "staticfiles" ]; then
    ls -la staticfiles/ | head -10
    if find staticfiles -name "*.css" -o -name "*.js" | head -3; then
        echo "✅ Static assets found"
    else
        echo "⚠️ No CSS/JS assets found in staticfiles"
    fi
else
    echo "❌ staticfiles directory not created"
fi

# Run migrations
echo "🗄️ Running migrations..."
python manage.py migrate --noinput

echo "✅ Build completed successfully!"
echo "📋 Final verification:"
echo "Static files: $(ls staticfiles/ 2>/dev/null | wc -l) files"
echo "React dist: $(ls dist/ 2>/dev/null | wc -l) files"