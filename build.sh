#!/usr/bin/env bash
# build.sh - Enhanced build script with environment validation

set -o errexit

echo "🚀 Building Richman Tours application..."

# Environment validation
echo "🔍 Environment validation..."
echo "NODE_VERSION: ${NODE_VERSION:-'not set'}"
echo "VITE_API_BASE_URL: ${VITE_API_BASE_URL:-'not set'}"
echo "ALLOWED_HOSTS: ${ALLOWED_HOSTS:-'not set'}"
echo "DEBUG: ${DEBUG:-'not set'}"
echo "Working directory: $(pwd)"

# If VITE_API_BASE_URL is not set, derive it from the environment
if [ -z "$VITE_API_BASE_URL" ]; then
    if [ -n "$RENDER_SERVICE_NAME" ]; then
        export VITE_API_BASE_URL="https://${RENDER_SERVICE_NAME}.onrender.com/api"
        echo "📝 Set VITE_API_BASE_URL to: $VITE_API_BASE_URL"
    else
        echo "⚠️ VITE_API_BASE_URL not set and RENDER_SERVICE_NAME not available"
    fi
fi

# Install Python dependencies
echo "📦 Installing Python dependencies..."
python -m pip install --upgrade pip
pip install -r requirements.txt

echo "🔍 Build environment check..."
echo "Node version: $(node --version 2>/dev/null || echo 'Not available')"
echo "Bun version: $(bun --version 2>/dev/null || echo 'Not available')"

# Clean everything
echo "🧹 Cleaning previous builds..."
rm -rf node_modules package-lock.json bun.lockb dist staticfiles .vite || true

# Create optimized package.json with ALL required dependencies
cat > package.json << 'EOF'
{
  "name": "richman-tours",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "build": "vite build --mode production"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.30.1",
    "@tanstack/react-query": "^5.56.2",
    "lucide-react": "^0.462.0",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.6.0",
    "class-variance-authority": "^0.7.1",
    "@hookform/resolvers": "^3.10.0",
    "@radix-ui/react-accordion": "^1.2.11",
    "@radix-ui/react-alert-dialog": "^1.1.14",
    "@radix-ui/react-aspect-ratio": "^1.1.7",
    "@radix-ui/react-avatar": "^1.1.10",
    "@radix-ui/react-checkbox": "^1.3.2",
    "@radix-ui/react-collapsible": "^1.1.11",
    "@radix-ui/react-context-menu": "^2.2.15",
    "@radix-ui/react-dialog": "^1.1.14",
    "@radix-ui/react-dropdown-menu": "^2.1.15",
    "@radix-ui/react-hover-card": "^1.1.14",
    "@radix-ui/react-label": "^2.1.7",
    "@radix-ui/react-menubar": "^1.1.15",
    "@radix-ui/react-navigation-menu": "^1.2.13",
    "@radix-ui/react-popover": "^1.1.14",
    "@radix-ui/react-progress": "^1.1.7",
    "@radix-ui/react-radio-group": "^1.3.7",
    "@radix-ui/react-scroll-area": "^1.2.9",
    "@radix-ui/react-select": "^2.2.5",
    "@radix-ui/react-separator": "^1.1.7",
    "@radix-ui/react-slider": "^1.3.5",
    "@radix-ui/react-slot": "^1.2.3",
    "@radix-ui/react-switch": "^1.2.5",
    "@radix-ui/react-tabs": "^1.1.12",
    "@radix-ui/react-toast": "^1.2.14",
    "@radix-ui/react-toggle": "^1.1.9",
    "@radix-ui/react-toggle-group": "^1.1.10",
    "@radix-ui/react-tooltip": "^1.2.7",
    "cmdk": "^1.1.1",
    "date-fns": "^3.6.0",
    "embla-carousel-react": "^8.6.0",
    "input-otp": "^1.4.2",
    "next-themes": "^0.3.0",
    "react-day-picker": "^8.10.1",
    "react-hook-form": "^7.61.1",
    "react-resizable-panels": "^2.1.9",
    "recharts": "^2.15.4",
    "sonner": "^1.7.4",
    "tailwindcss-animate": "^1.0.7",
    "vaul": "^0.9.9",
    "zod": "^3.25.76"
  },
  "devDependencies": {
    "@types/node": "^22.16.5",
    "@types/react": "^18.3.23",
    "@types/react-dom": "^18.3.7",
    "@vitejs/plugin-react": "^5.0.2",
    "autoprefixer": "^10.4.21",
    "postcss": "^8.5.6",
    "tailwindcss": "^3.4.17",
    "tailwindcss-animate": "^1.0.7",
    "typescript": "^5.8.3",
    "vite": "^5.4.19",
    "terser": "^5.24.0"
  }
}
EOF

# Create production vite config with environment variable injection
cat > vite.config.ts << 'VITE_EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          query: ['@tanstack/react-query'],
          ui: ['lucide-react', 'clsx', 'tailwind-merge']
        },
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
      }
    },
    chunkSizeWarningLimit: 1000,
    target: 'es2020',
    reportCompressedSize: false
  },
  // CRITICAL: Set base to /static/ for production
  base: '/static/',
  define: {
    'process.env.NODE_ENV': JSON.stringify(mode || 'production'),
    // Inject environment variables at build time
    'import.meta.env.VITE_API_BASE_URL': JSON.stringify(process.env.VITE_API_BASE_URL || ''),
  },
  esbuild: {
    drop: mode === 'production' ? ['console', 'debugger'] : [],
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', '@tanstack/react-query']
  }
}))
VITE_EOF

# Use Bun for faster builds if available
if command -v bun &> /dev/null; then
    echo "🥟 Installing dependencies with Bun..."
    bun install --frozen-lockfile || bun install
    
    echo "🏗️ Building React app with Bun..."
    echo "Environment during build:"
    echo "VITE_API_BASE_URL: ${VITE_API_BASE_URL:-'not set'}"
    
    if VITE_API_BASE_URL="$VITE_API_BASE_URL" bun run build; then
        echo "✅ Bun build successful!"
    else
        echo "❌ Bun build failed, trying alternatives..."
        exit 1
    fi
else
    echo "📦 Using npm fallback..."
    if command -v npm &> /dev/null; then
        npm install --production=false --silent || npm install
        echo "Environment during build:"
        echo "VITE_API_BASE_URL: ${VITE_API_BASE_URL:-'not set'}"
        VITE_API_BASE_URL="$VITE_API_BASE_URL" npx vite build --mode production
    else
        echo "❌ No package manager available"
        exit 1
    fi
fi

# Verify build output
if [ ! -d "dist" ] || [ -z "$(ls -A dist 2>/dev/null)" ]; then
    echo "❌ Build failed - no dist directory or empty"
    exit 1
fi

echo "📋 Build verification:"
ls -la dist/
find dist -name "*.js" -o -name "*.css" | head -10

# Create or verify index.html has correct static paths
if [ -f "dist/index.html" ]; then
    echo "🔧 Verifying and fixing asset paths in index.html..."
    
    # Show original content (first few lines only)
    echo "📄 Original index.html (excerpt):"
    head -20 dist/index.html
    
    # Fix paths - ensure they start with /static/
    sed -i 's|="/assets/|="/static/assets/|g' dist/index.html
    sed -i 's|href="/assets/|href="/static/assets/|g' dist/index.html  
    sed -i 's|src="/assets/|src="/static/assets/|g' dist/index.html
    
    # Remove any double /static/ that might have been created
    sed -i 's|="/static/static/|="/static/|g' dist/index.html
    sed -i 's|href="/static/static/|href="/static/|g' dist/index.html
    sed -i 's|src="/static/static/|src="/static/|g' dist/index.html
    
    echo "📄 Fixed index.html (excerpt):"
    head -20 dist/index.html
else
    echo "❌ index.html not found in dist directory"
    exit 1
fi

# Set up Django static files structure
echo "📁 Setting up Django static files structure..."

# Create staticfiles directory
mkdir -p staticfiles

# Copy ALL dist contents to staticfiles, preserving structure
echo "📂 Copying React build to staticfiles..."
cp -r dist/* staticfiles/

# Ensure assets directory exists and copy assets specifically
if [ -d "dist/assets" ]; then
    echo "📂 Ensuring assets are in staticfiles/assets..."
    mkdir -p staticfiles/assets
    cp -r dist/assets/* staticfiles/assets/
fi

# Django static file collection
echo "📦 Collecting Django static files..."
python manage.py collectstatic --noinput --clear --verbosity=2

# Verify static files structure
echo "🔍 Final static files verification..."
if [ -d "staticfiles" ]; then
    echo "✅ staticfiles directory exists"
    echo "📊 Total files in staticfiles: $(find staticfiles -type f | wc -l)"
    
    echo "📋 Static files structure:"
    find staticfiles -name "*.js" -o -name "*.css" | head -10
    
    echo "📋 Checking for assets directory:"
    ls -la staticfiles/assets/ || echo "No assets directory found"
    
    echo "📋 Sample asset files:"
    find staticfiles/assets -name "*.js" -o -name "*.css" | head -5 || echo "No JS/CSS in assets"
    
    # Verify the key files exist
    if find staticfiles -name "*.js" | head -1 | grep -q .; then
        echo "✅ JavaScript files found in staticfiles"
    else
        echo "❌ No JavaScript files in staticfiles"
    fi
    
    if find staticfiles -name "*.css" | head -1 | grep -q .; then
        echo "✅ CSS files found in staticfiles"
    else
        echo "❌ No CSS files in staticfiles"
    fi
else
    echo "❌ staticfiles directory not created"
    exit 1
fi

# Run Django migrations
echo "🗄️ Running Django migrations..."
python manage.py migrate --noinput

# Final test
echo "🧪 Testing Django configuration..."
python -c "
import os
import django
from django.conf import settings

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'richman_backend.settings')
django.setup()

print(f'✅ STATIC_ROOT: {settings.STATIC_ROOT}')
print(f'✅ STATIC_URL: {settings.STATIC_URL}')
print(f'✅ STATICFILES_DIRS: {settings.STATICFILES_DIRS}')
print(f'✅ STATICFILES_STORAGE: {settings.STATICFILES_STORAGE}')
print(f'✅ DEBUG: {settings.DEBUG}')
print(f'✅ ALLOWED_HOSTS: {settings.ALLOWED_HOSTS}')

# Verify files exist
import glob
static_root = settings.STATIC_ROOT
js_files = glob.glob(os.path.join(static_root, '**', '*.js'), recursive=True)
css_files = glob.glob(os.path.join(static_root, '**', '*.css'), recursive=True)
html_files = glob.glob(os.path.join(static_root, '**', '*.html'), recursive=True)

print(f'✅ Found {len(js_files)} JS files')
print(f'✅ Found {len(css_files)} CSS files') 
print(f'✅ Found {len(html_files)} HTML files')

if js_files:
    print('Sample JS files:')
    for f in js_files[:3]:
        print(f'  - {f}')

if css_files:
    print('Sample CSS files:')
    for f in css_files[:3]:
        print(f'  - {f}')

# Test environment variables
vite_api_url = os.environ.get('VITE_API_BASE_URL', 'NOT SET')
print(f'✅ VITE_API_BASE_URL: {vite_api_url}')
"

# Health check endpoint test
echo "🏥 Testing server health..."
python -c "
import os
import django
from django.test.utils import get_runner
from django.conf import settings

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'richman_backend.settings')

try:
    django.setup()
    print('✅ Django setup successful')
    
    # Test imports
    from django.urls import reverse
    from django.contrib.auth.models import User
    print('✅ Core Django imports working')
    
    # Test database connection
    from django.db import connection
    with connection.cursor() as cursor:
        cursor.execute('SELECT 1')
        result = cursor.fetchone()
    print('✅ Database connection successful')
    
except Exception as e:
    print(f'❌ Django health check failed: {e}')
    import traceback
    traceback.print_exc()
"

echo "🎉 Build completed successfully!"
echo "🚀 Static files are ready for serving!"

# Final environment summary
echo "📋 Final Environment Summary:"
echo "VITE_API_BASE_URL: ${VITE_API_BASE_URL:-'not set'}"
echo "ALLOWED_HOSTS: ${ALLOWED_HOSTS:-'not set'}"
echo "DEBUG: ${DEBUG:-'not set'}"
echo "CORS_ALLOWED_ORIGINS: ${CORS_ALLOWED_ORIGINS:-'not set'}"