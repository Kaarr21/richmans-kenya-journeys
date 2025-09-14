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
    
    # Set environment variables for build
    echo "🔧 Setting build environment variables..."
    export VITE_API_BASE_URL="https://richmans-kenya-journeys-1.onrender.com/api"
    export NODE_ENV="production"
    
    # Build React app
    echo "🏗️ Building React app..."
    echo "Environment during build:"
    echo "VITE_API_BASE_URL: ${VITE_API_BASE_URL}"
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

# Create superuser if it doesn't exist
echo "👤 Creating superuser..."
python create_superuser.py

# Collect static files
echo "📦 Collecting Django static files..."
python manage.py collectstatic --noinput --clear

echo "✅ Build completed successfully!"
