#!/usr/bin/env bash
# build.sh - Optimized build script for Render deployment

set -o errexit
set -o pipefail

echo "🚀 Starting optimized build process..."

# Install Python dependencies
echo "📦 Installing Python dependencies..."
python -m pip install --upgrade pip
pip install -r requirements.txt --timeout=300

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf node_modules package-lock.json .vite dist staticfiles || true
npm cache clean --force || true

# Install Node dependencies
echo "📦 Installing Node.js dependencies..."
npm install --legacy-peer-deps

# Verify critical dependencies
echo "🔍 Verifying dependencies..."
if [ ! -d "node_modules/vite" ]; then
    echo "❌ Vite not found, installing directly..."
    npm install vite@latest @vitejs/plugin-react@latest --save-dev --force
fi

if [ ! -d "node_modules/react" ]; then
    echo "❌ React not found, installing..."
    npm install react@latest react-dom@latest --save --force
fi

# Set production environment
export NODE_ENV=production
export VITE_API_BASE_URL=https://richman-tours.onrender.com/api

# Build React application
echo "🏗️ Building React application..."
npm run build || {
    echo "❌ npm run build failed, trying npx vite build..."
    npx vite build --base="/static/" --outDir="dist" || {
        echo "❌ All build methods failed"
        exit 1
    }
}

# Verify build output
if [ ! -d "dist" ]; then
    echo "❌ Build failed - no dist directory"
    exit 1
fi

echo "📋 Build verification:"
ls -la dist/
echo "Built files count: $(find dist -type f | wc -l)"

# Fix asset paths for Django static serving
if [ -f "dist/index.html" ]; then
    echo "🔧 Fixing asset paths for Django..."
    # Replace relative paths with /static/ prefix
    sed -i 's|="/assets/|="/static/|g' dist/index.html
    sed -i 's|href="/assets/|href="/static/|g' dist/index.html
    sed -i 's|src="/assets/|src="/static/|g' dist/index.html
fi

# Collect Django static files
echo "📦 Collecting Django static files..."
python manage.py collectstatic --noinput --clear --verbosity=1

# Run database migrations
echo "🗄️ Running database migrations..."
python manage.py migrate --noinput

# Final verification
echo "📋 Final build verification:"
echo "Static files: $(find staticfiles -type f 2>/dev/null | wc -l || echo '0')"
if [ -d "staticfiles" ]; then
    echo "Sample static files:"
    find staticfiles -name "*.js" -o -name "*.css" | head -5
fi

echo "✅ Build completed successfully!"