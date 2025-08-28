#!/usr/bin/env bash
# build.sh - More robust build script with better error handling

set -o errexit  # Exit on error

echo "🚀 Starting build process..."

# Show environment info
echo "📋 Environment Information:"
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"
echo "Python version: $(python --version)"

# Set Node.js version if needed
if [ -n "$NODE_VERSION" ]; then
    echo "📦 Node.js version specified: $NODE_VERSION"
fi

# Upgrade pip first
echo "📦 Upgrading pip..."
python -m pip install --upgrade pip

# Install Python dependencies
echo "📦 Installing Python dependencies..."
pip install -r requirements.txt --timeout=300

# Clear npm cache
echo "🧹 Clearing npm cache..."
npm cache clean --force || true

# Remove node_modules and package-lock.json for fresh install
echo "🧹 Cleaning Node.js dependencies..."
rm -rf node_modules package-lock.json || true

# Install Node.js dependencies with verbose output
echo "📦 Installing Node.js dependencies..."
npm install --verbose

# Verify critical dependencies
echo "🔍 Verifying installations..."
echo "Checking for Vite..."
if npx vite --version > /dev/null 2>&1; then
    echo "✅ Vite found: $(npx vite --version)"
else
    echo "❌ Vite not found, installing explicitly..."
    npm install vite@latest @vitejs/plugin-react@latest --save-dev
fi

echo "Checking for React..."
if npm list react > /dev/null 2>&1; then
    echo "✅ React found"
else
    echo "❌ React not found, installing..."
    npm install react@latest react-dom@latest
fi

# Set environment variables for build
echo "🔧 Setting build environment..."
export NODE_ENV=production
export PUBLIC_URL="/static/"

# Build React app
echo "🏗️ Building React app..."
echo "Using build command: npx vite build --mode production"
npx vite build --mode production

# Verify build output
if [ ! -d "dist" ]; then
    echo "❌ Build failed - dist directory not found"
    echo "📋 Current directory contents:"
    ls -la
    exit 1
fi

echo "📋 Build output verification:"
ls -la dist/
if [ -d "dist/assets" ]; then
    echo "📋 Assets directory:"
    ls -la dist/assets/
fi

# Fix asset paths in index.html
echo "🔧 Fixing asset paths in index.html..."
if [ -f "dist/index.html" ]; then
    python3 << 'EOF'
import os
import re

index_path = 'dist/index.html'
if os.path.exists(index_path):
    with open(index_path, 'r') as f:
        content = f.read()
    
    print(f"Original index.html content (first 200 chars):")
    print(content[:200])
    
    # Replace asset paths to work with Django static serving
    original_content = content
    content = re.sub(r'"/assets/', '"/static/', content)
    content = re.sub(r"'/assets/", "'/static/", content)
    
    if content != original_content:
        with open(index_path, 'w') as f:
            f.write(content)
        print("✅ Fixed asset paths in index.html")
    else:
        print("ℹ️ No asset paths to fix in index.html")
        
    print(f"Updated index.html content (first 200 chars):")
    print(content[:200])
else:
    print("❌ index.html not found in dist/")
EOF
else
    echo "❌ dist/index.html not found"
    exit 1
fi

# Collect Django static files
echo "📦 Collecting Django static files..."
python manage.py collectstatic --noinput --clear --verbosity=2

# Verify static files collection
echo "📋 Verifying static files collection..."
if [ -d "staticfiles" ]; then
    echo "Static files directory contents:"
    ls -la staticfiles/
    if [ -d "staticfiles/assets" ] || [ -d "staticfiles/static" ]; then
        echo "✅ React assets found in staticfiles"
    else
        echo "⚠️ React assets might not be collected properly"
        echo "Staticfiles subdirectories:"
        find staticfiles -type d -maxdepth 2
    fi
else
    echo "❌ staticfiles directory not found"
fi

# Run migrations
echo "🗄️ Running database migrations..."
python manage.py migrate --noinput

echo "✅ Build completed successfully!"
echo "📋 Final directory structure:"
ls -la