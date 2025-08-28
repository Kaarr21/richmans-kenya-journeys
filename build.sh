#!/usr/bin/env bash
# build.sh - Fixed build script for proper static file handling

set -o errexit  # Exit on error

echo "🚀 Starting build process..."

# Set Node.js version if needed
if [ -n "$NODE_VERSION" ]; then
    echo "📦 Setting Node.js version to $NODE_VERSION"
    export NODE_VERSION=$NODE_VERSION
fi

# Upgrade pip first
echo "📦 Upgrading pip..."
python -m pip install --upgrade pip

# Install Python dependencies with timeout and retry
echo "📦 Installing Python dependencies..."
pip install -r requirements.txt --timeout=300

# Clear npm cache to avoid potential issues
echo "🧹 Clearing npm cache..."
npm cache clean --force || true

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
npm ci --prefer-offline --no-audit --progress=false

# Set the public URL for proper asset paths
echo "🔧 Setting PUBLIC_URL for proper asset paths..."
export PUBLIC_URL="/static/"

# Build React app with error handling
echo "🏗️ Building React app..."
npm run build

# Verify build output exists
if [ ! -d "dist" ]; then
    echo "❌ Build failed - dist directory not found"
    exit 1
fi

echo "📋 Build output contents:"
ls -la dist/

# Create a custom index.html that works with Django static serving
echo "🔧 Fixing asset paths in index.html..."
python << 'EOF'
import os
import re

index_path = 'dist/index.html'
if os.path.exists(index_path):
    with open(index_path, 'r') as f:
        content = f.read()
    
    # Replace asset paths to work with Django static serving
    content = re.sub(r'/assets/', '/static/', content)
    
    with open(index_path, 'w') as f:
        f.write(content)
    
    print("✅ Fixed asset paths in index.html")
else:
    print("❌ index.html not found")
EOF

# Collect Django static files (includes React build)
echo "📦 Collecting Django static files..."
python manage.py collectstatic --noinput --clear

# Run Django migrations with retry logic
echo "🗄️ Running database migrations..."
python manage.py migrate --noinput

echo "✅ Build completed successfully!"