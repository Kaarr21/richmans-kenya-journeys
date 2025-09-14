#!/usr/bin/env bash
# Simplified build script for Render deployment

set -e  # Exit on any error

echo "🚀 Starting simplified build process..."

# Install Python dependencies
echo "📦 Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Install Node.js dependencies if package.json exists
if [ -f "package.json" ]; then
    echo "📦 Installing Node.js dependencies..."
    npm install --production=false
    
    # Build React app
    echo "🏗️ Building React app..."
    npm run build
    
    # Copy React build to Django static files
    echo "📂 Setting up static files..."
    mkdir -p staticfiles
    cp -r dist/* staticfiles/
    
    # Fix asset paths in index.html
    if [ -f "staticfiles/index.html" ]; then
        sed -i 's|="/assets/|="/static/assets/|g' staticfiles/index.html
        sed -i 's|href="/assets/|href="/static/assets/|g' staticfiles/index.html
        sed -i 's|src="/assets/|src="/static/assets/|g' staticfiles/index.html
    fi
else
    echo "⚠️ No package.json found, skipping React build"
fi

# Run Django migrations
echo "🗄️ Running Django migrations..."
python manage.py migrate --noinput

# Collect static files
echo "📦 Collecting Django static files..."
python manage.py collectstatic --noinput --clear

echo "✅ Build completed successfully!"
