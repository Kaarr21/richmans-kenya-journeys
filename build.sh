#!/usr/bin/env bash
# build.sh - Zero-conflict build script using existing package.json

set -o errexit

echo "🚀 Starting zero-conflict build process..."

# Python dependencies
echo "📦 Installing Python dependencies..."
python -m pip install --upgrade pip
pip install -r requirements.txt --timeout=300

# Complete Node.js clean slate
echo "🧹 Complete Node.js cleanup..."
rm -rf node_modules package-lock.json .vite dist .npm || true
npm cache clean --force || true

# Use legacy peer deps to resolve all conflicts
echo "📦 Installing all dependencies with conflict resolution..."
npm install --legacy-peer-deps --no-audit

# Verify critical packages are installed
echo "🔍 Verifying installations..."
if npm list react > /dev/null 2>&1; then
    echo "✅ React installed: $(npm list react --depth=0 2>/dev/null | grep react || echo 'Found')"
else
    echo "❌ React missing, installing..."
    npm install react@^18.2.0 react-dom@^18.2.0 --legacy-peer-deps
fi

if npm list vite > /dev/null 2>&1; then
    echo "✅ Vite installed: $(npm list vite --depth=0 2>/dev/null | grep vite || echo 'Found')"
else
    echo "❌ Vite missing, installing..."
    npm install vite@latest @vitejs/plugin-react@latest --save-dev --legacy-peer-deps
fi

# Create the most basic Vite config possible
echo "🔧 Creating basic Vite config..."
cat > vite.config.basic.js << 'EOF'
import react from '@vitejs/plugin-react'

export default {
  plugins: [react()],
  build: {
    outDir: 'dist'
  },
  base: '/static/'
}
EOF

# Try building with the basic config first
echo "🏗️ Building React app with basic config..."
export NODE_ENV=production

# Try the build
if npx vite build --config vite.config.basic.js; then
    echo "✅ Build successful with basic config"
else
    echo "❌ Basic build failed, trying alternative approach..."
    
    # Alternative: Build with default config
    echo "🔄 Trying build with default Vite config..."
    npx vite build --base="/static/" --outDir=dist || {
        echo "❌ All build attempts failed"
        echo "📋 Debug info:"
        echo "Node version: $(node --version)"
        echo "NPM version: $(npm --version)"
        echo "Package.json contents:"
        cat package.json || echo "No package.json found"
        exit 1
    }
fi

# Verify build output
if [ ! -d "dist" ]; then
    echo "❌ No dist directory created"
    exit 1
fi

echo "📋 Build output:"
ls -la dist/
if [ -d "dist/assets" ]; then
    echo "📋 Assets (first 5 files):"
    ls -la dist/assets/ | head -5
fi

# Fix HTML paths
if [ -f "dist/index.html" ]; then
    echo "🔧 Fixing asset paths..."
    cp dist/index.html dist/index.html.backup
    sed 's|/assets/|/static/|g' dist/index.html.backup > dist/index.html
    echo "✅ Asset paths fixed"
else
    echo "❌ No index.html found"
    exit 1
fi

# Django steps
echo "📦 Django static collection..."
python manage.py collectstatic --noinput --clear

# Verify Django static files
if [ -d "staticfiles" ]; then
    echo "📋 Static files collected:"
    ls -la staticfiles/ | head -5
else
    echo "❌ No staticfiles directory"
fi

echo "🗄️ Running migrations..."
python manage.py migrate --noinput

echo "✅ Zero-conflict build completed!"