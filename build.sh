#!/usr/bin/env bash
# build.sh - Optimized Render build script for full-stack app

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

# Collect Django static files (includes React build)
echo "📦 Collecting Django static files..."
python manage.py collectstatic --noinput --clear

# Run Django migrations with retry logic
echo "🗄️ Running database migrations..."
python manage.py migrate --noinput

# Create superuser if needed (optional)
# echo "👤 Creating superuser (if needed)..."
# python manage.py shell -c "
# from django.contrib.auth import get_user_model
# User = get_user_model()
# if not User.objects.filter(is_superuser=True).exists():
#     User.objects.create_superuser('admin', 'admin@example.com', 'your-secure-password')
#     print('Superuser created')
# else:
#     print('Superuser already exists')
# " || true

echo "✅ Build completed successfully!"