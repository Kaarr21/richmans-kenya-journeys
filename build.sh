#!/usr/bin/env bash
# build.sh - Fixed build script for Render deployment

set -o errexit
set -o pipefail

echo "🚀 Starting build process..."

# Install Python dependencies first
echo "📦 Installing Python dependencies..."
python -m pip install --upgrade pip
pip install -r requirements.txt --timeout=300

# Clean everything
echo "🧹 Complete cleanup..."
rm -rf node_modules package-lock.json .vite dist staticfiles || true
rm -rf .npm _npm_cache || true

# Check Node.js version
echo "🔍 Node.js environment check..."
node --version
npm --version
which node
which npm

# Create a minimal package.json for this build
echo "📦 Creating build-specific package.json..."
cat > package.json << 'EOF'
{
  "name": "richman-tours",
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "build": "vite build"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.30.1",
    "lucide-react": "^0.462.0",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.6.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^5.0.2",
    "vite": "^5.4.19",
    "tailwindcss": "^3.4.17",
    "postcss": "^8.5.6",
    "autoprefixer": "^10.4.21",
    "@types/react": "^18.3.23",
    "@types/react-dom": "^18.3.7"
  }
}
EOF

# Install with explicit cache settings
echo "📦 Installing Node.js dependencies..."
npm config set cache /tmp/.npm
npm install --no-audit --no-fund --legacy-peer-deps --verbose

# Double-check Vite installation
echo "🔍 Verifying Vite installation..."
if [ ! -f "node_modules/.bin/vite" ]; then
    echo "❌ Vite binary not found, forcing installation..."
    npm install vite@5.4.19 --save-dev --force --no-audit
fi

# List what we actually have
echo "📋 Installed packages check:"
ls -la node_modules/.bin/vite* || echo "No vite binary found"
ls -la node_modules/vite/ || echo "No vite package found"

# Try direct build approaches
echo "🏗️ Building React application..."

# Method 1: Try npx first
if npx vite build --base="/static/" --outDir="dist" --mode=production; then
    echo "✅ npx vite build successful!"
elif ./node_modules/.bin/vite build --base="/static/" --outDir="dist" --mode=production; then
    echo "✅ Direct vite binary successful!"
elif node -e "
    const { build } = require('./node_modules/vite/dist/node/index.js');
    build({
        base: '/static/',
        build: { outDir: 'dist' },
        mode: 'production'
    }).then(() => console.log('✅ Node API build successful!'))
    .catch(err => { console.error('❌ Node API build failed:', err); process.exit(1); });
"; then
    echo "✅ Node API build completed!"
else
    echo "❌ All Vite methods failed, trying esbuild fallback..."
    
    # Install esbuild as fallback
    npm install esbuild --save-dev --force
    
    # Create esbuild configuration
    cat > build-fallback.mjs << 'EOF'
import { build } from 'esbuild';
import { resolve } from 'path';

try {
  await build({
    entryPoints: ['src/main.tsx'],
    bundle: true,
    outdir: 'dist/assets',
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
    external: [],
    define: {
      'process.env.NODE_ENV': '"production"'
    }
  });
  
  console.log('✅ esbuild fallback successful!');
} catch (error) {
  console.error('❌ esbuild failed:', error);
  process.exit(1);
}
EOF
    
    node build-fallback.mjs || {
        echo "❌ Even esbuild fallback failed"
        exit 1
    }
    
    # Create index.html for esbuild output
    mkdir -p dist
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