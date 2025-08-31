#!/usr/bin/env bash
# build.sh - Bypass all config issues by building without config files

set -o errexit

echo "🚀 Starting config-free build process..."

# Python dependencies
echo "📦 Installing Python dependencies..."
python -m pip install --upgrade pip
pip install -r requirements.txt --timeout=300

# Complete reset
echo "🧹 Complete reset..."
rm -rf node_modules package-lock.json .vite dist || true
rm -rf vite.config.* || true
npm cache clean --force || true

# Create a minimal package.json focusing only on essentials
echo "📦 Creating minimal package.json..."
cat > package.json << 'EOF'
{
  "name": "richman-tours",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "build": "vite build"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.30.1",
    "lucide-react": "^0.462.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^5.0.2",
    "vite": "^7.1.3",
    "tailwindcss": "^3.4.17",
    "postcss": "^8.5.6",
    "autoprefixer": "^10.4.21"
  }
}
EOF

# Install minimal dependencies
echo "📦 Installing minimal dependencies..."
npm install --legacy-peer-deps

# Verify Vite is actually installed
echo "🔍 Verifying Vite installation..."
if [ -d "node_modules/vite" ]; then
    echo "✅ Vite found in node_modules"
    ls -la node_modules/vite/
else
    echo "❌ Vite still not found, trying direct installation..."
    npm install vite@7.1.3 @vitejs/plugin-react@5.0.2 --save-dev --force
fi

# Build WITHOUT any config file
echo "🏗️ Building without config file..."
export NODE_ENV=production

# Try multiple build approaches
echo "📋 Approach 1: Direct vite build with inline options..."
if npx vite build --base="/static/" --outDir="dist"; then
    echo "✅ Direct build successful!"
elif ./node_modules/.bin/vite build --base="/static/" --outDir="dist"; then
    echo "✅ Direct bin build successful!"
elif node ./node_modules/vite/bin/vite.js build --base="/static/" --outDir="dist"; then
    echo "✅ Node direct build successful!"
else
    echo "❌ All direct build methods failed"
    echo "🔧 Creating inline build script..."
    
    # Create a simple build with esbuild directly
    cat > build-react.js << 'EOF'
import { build } from 'esbuild'
import { resolve } from 'path'

await build({
  entryPoints: ['src/main.tsx'],
  bundle: true,
  outdir: 'dist',
  format: 'esm',
  platform: 'browser',
  target: 'es2020',
  minify: true,
  sourcemap: false,
  publicPath: '/static/',
  loader: {
    '.tsx': 'tsx',
    '.ts': 'ts',
    '.jsx': 'jsx',
    '.js': 'js',
    '.css': 'css'
  },
  external: []
})

console.log('Build completed with esbuild')
EOF
    
    # Try esbuild approach
    npm install esbuild --save-dev
    node build-react.js || {
        echo "❌ Even esbuild failed"
        exit 1
    }
fi

# Verify build output
if [ ! -d "dist" ]; then
    echo "❌ No dist directory created"
    exit 1
fi

echo "📋 Build verification:"
ls -la dist/

# Create index.html if it doesn't exist
if [ ! -f "dist/index.html" ]; then
    echo "🔧 Creating index.html..."
    cat > dist/index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Richman Tours</title>
    <script type="module" crossorigin src="/static/main.js"></script>
    <link rel="stylesheet" href="/static/main.css">
</head>
<body>
    <div id="root"></div>
</body>
</html>
EOF
fi

# Ensure asset paths are correct
if [ -f "dist/index.html" ]; then
    echo "🔧 Fixing asset paths..."
    sed -i 's|"/assets/|"/static/|g' dist/index.html
    sed -i 's|/assets/|/static/|g' dist/index.html
    
    echo "📋 HTML content check:"
    head -10 dist/index.html
fi

# Create assets directory structure for Django
if [ ! -d "dist/assets" ]; then
    mkdir -p dist/assets
    if [ -f "dist/main.js" ]; then
        cp dist/main.js dist/assets/
    fi
    if [ -f "dist/main.css" ]; then
        cp dist/main.css dist/assets/
    fi
fi

# Django static collection
echo "📦 Collecting Django static files..."
python manage.py collectstatic --noinput --clear --verbosity=2

# Final verification
echo "📋 Final verification:"
echo "Dist files: $(ls dist/ 2>/dev/null | wc -l)"
echo "Static files: $(ls staticfiles/ 2>/dev/null | wc -l)"
if [ -d "staticfiles" ]; then
    find staticfiles -name "*.js" -o -name "*.css" | head -3
fi

# Run migrations
echo "🗄️ Running migrations..."
python manage.py migrate --noinput

echo "✅ Config-free build completed!"