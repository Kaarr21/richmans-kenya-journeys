#!/usr/bin/env bash
# build.sh - Minimal approach avoiding PostCSS/Tailwind issues

set -o errexit

echo "🚀 Starting minimal build process..."

# Python dependencies
echo "📦 Installing Python dependencies..."
python -m pip install --upgrade pip
pip install -r requirements.txt --timeout=300

# Clean slate for Node.js
echo "🧹 Cleaning Node.js environment..."
rm -rf node_modules package-lock.json .vite dist || true
npm cache clean --force || true

# Install only essential dependencies
echo "📦 Installing essential Node.js dependencies..."
npm install react@latest react-dom@latest
npm install vite@latest @vitejs/plugin-react@latest --save-dev

# Check if we have Tailwind in index.css and handle it
echo "🔧 Checking CSS configuration..."
if grep -q "@tailwind" src/index.css; then
    echo "📦 Tailwind detected, installing Tailwind CSS..."
    npm install tailwindcss@latest postcss@latest autoprefixer@latest --save-dev
    
    # Create simple configs
    cat > tailwind.config.js << 'EOF'
/** @type {import('tailwindcss').Config} */
module.exports = {
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

    cat > postcss.config.js << 'EOF'
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOF
    echo "✅ Tailwind CSS configured"
else
    echo "ℹ️ No Tailwind detected, skipping Tailwind setup"
fi

# Create ultra-minimal Vite config
echo "🔧 Creating minimal Vite config..."
cat > vite.config.minimal.js << 'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: undefined,
      }
    }
  },
  base: '/static/'
})
EOF

# Build with explicit config
echo "🏗️ Building React app..."
export NODE_ENV=production
npx vite build --config vite.config.minimal.js

# Verify build
if [ ! -d "dist" ]; then
    echo "❌ Build failed - no dist directory"
    echo "📋 Current directory contents:"
    ls -la
    exit 1
fi

echo "📋 Build successful - contents:"
ls -la dist/
if [ -d "dist/assets" ]; then
    echo "📋 Assets:"
    ls -la dist/assets/ | head -5
fi

# Fix asset paths in HTML
echo "🔧 Fixing asset paths in index.html..."
if [ -f "dist/index.html" ]; then
    # Show original content
    echo "📋 Original index.html (first 300 chars):"
    head -c 300 dist/index.html
    
    # Replace paths
    sed -i.bak 's|="/assets/|="/static/|g' dist/index.html
    sed -i.bak "s|='/assets/|='/static/|g" dist/index.html
    
    echo "📋 Updated index.html (first 300 chars):"
    head -c 300 dist/index.html
    
    echo "✅ Fixed asset paths"
else
    echo "❌ No index.html found in dist/"
    exit 1
fi

# Django static collection
echo "📦 Collecting Django static files..."
python manage.py collectstatic --noinput --clear --verbosity=1

# Verify static files
echo "📋 Verifying static collection..."
ls -la staticfiles/ | head -10

# Run migrations
echo "🗄️ Running migrations..."
python manage.py migrate --noinput

echo "✅ Minimal build completed successfully!"