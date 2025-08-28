#!/usr/bin/env bash
# build.sh - Render build script for full-stack app

set -o errexit  # Exit on error

echo "🚀 Starting build process..."

# Upgrade pip first
echo "📦 Upgrading pip..."
pip install --upgrade pip

# Install Python dependencies
echo "📦 Installing Python dependencies..."
pip install -r requirements.txt

# Install Node.js dependencies and build React app
echo "📦 Installing Node.js dependencies..."
npm ci  # Use npm ci for faster, reliable builds

echo "🏗️ Building React app..."
npm run build

# Collect Django static files (includes React build)
echo "📦 Collecting Django static files..."
python manage.py collectstatic --noinput

# Run Django migrations
echo "🗄️ Running database migrations..."
python manage.py migrate

echo "✅ Build completed successfully!"