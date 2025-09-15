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
    # Clear npm cache to avoid issues with removed dependencies
    npm cache clean --force
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
    
    # Copy background images from public to staticfiles
    echo "🖼️ Copying background images..."
    if [ -f "public/kenya-safari-hero.jpg" ]; then
        cp public/kenya-safari-hero.jpg staticfiles/
        echo "  ✅ Copied kenya-safari-hero.jpg"
    fi
    if [ -f "public/kenya-wildlife-hero.jpg" ]; then
        cp public/kenya-wildlife-hero.jpg staticfiles/
        echo "  ✅ Copied kenya-wildlife-hero.jpg"
    fi
    if [ -f "public/kenya-landscape-hero.jpg" ]; then
        cp public/kenya-landscape-hero.jpg staticfiles/
        echo "  ✅ Copied kenya-landscape-hero.jpg"
    fi
    if [ -f "public/Masai_Mara_at_Sunset.jpg" ]; then
        cp public/Masai_Mara_at_Sunset.jpg staticfiles/
        echo "  ✅ Copied Masai_Mara_at_Sunset.jpg"
    fi
    
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
echo "Testing database connection first..."
python manage.py check --database default
echo "Running migrations to ensure database is ready..."
python manage.py migrate --noinput
echo "Creating admin user..."
python manage.py create_admin || {
    echo "❌ Admin creation failed, trying alternative method..."
    echo "from django.contrib.auth.models import User; User.objects.create_superuser('admin', 'karokin35@gmail.com', 'admin123') if not User.objects.filter(username='admin').exists() else print('Admin already exists')" | python manage.py shell
}
echo "Verifying admin user was created..."
python manage.py shell -c "from django.contrib.auth.models import User; admin = User.objects.filter(username='admin').first(); print(f'Admin exists: {admin is not None}'); print(f'Is superuser: {admin.is_superuser if admin else False}')"

# Collect static files
echo "📦 Collecting Django static files..."
python manage.py collectstatic --noinput --clear

echo "✅ Build completed successfully!"
