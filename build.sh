#!/usr/bin/env bash
# build.sh - Deploy YOUR actual React application using alternative methods

set -o errexit

echo "🚀 Building YOUR actual React application..."

# Install Python dependencies
echo "📦 Installing Python dependencies..."
python -m pip install --upgrade pip
pip install -r requirements.txt

echo "🔍 Environment check..."
node --version
echo "Working directory: $(pwd)"

# Clean everything
echo "🧹 Cleaning previous builds..."
rm -rf node_modules package-lock.json dist staticfiles .vite || true

# Since npm/vite isn't working, let's use Bun (which Render has available)
echo "🥟 Trying Bun as alternative to npm..."
if command -v bun &> /dev/null; then
    echo "✅ Bun is available, using it instead of npm"
    
    # Create package.json for your actual app
    cat > package.json << 'EOF'
{
  "name": "richman-tours",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "build": "vite build --mode production --base=/static/"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.30.1",
    "lucide-react": "^0.462.0",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.6.0",
    "class-variance-authority": "^0.7.1"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^5.0.2",
    "vite": "^5.4.19",
    "tailwindcss": "^3.4.17",
    "postcss": "^8.5.6",
    "autoprefixer": "^10.4.21"
  }
}
EOF

    # Install with Bun
    echo "📦 Installing dependencies with Bun..."
    bun install
    
    # Try building with Bun
    echo "🏗️ Building with Bun..."
    if bun run build; then
        echo "✅ Bun build successful!"
    else
        echo "❌ Bun build failed, trying direct vite..."
        bunx vite build --mode production --base=/static/ --outDir=dist
    fi
    
else
    echo "❌ Bun not available, using esbuild approach for your app..."
    
    # Download and install esbuild manually
    echo "📦 Setting up esbuild manually..."
    curl -fsSL https://esbuild.github.io/dl/latest/esbuild-linux-64 -o esbuild
    chmod +x esbuild
    
    # Build your actual React app with esbuild
    echo "🏗️ Building your React app with esbuild..."
    
    # Create the build directory
    mkdir -p dist/assets
    
    # Build your main.tsx file (adjust path if different)
    ./esbuild src/main.tsx \
        --bundle \
        --outdir=dist/assets \
        --format=esm \
        --platform=browser \
        --target=es2020 \
        --minify \
        --splitting \
        --chunk-names=[name]-[hash] \
        --entry-names=[name]-[hash] \
        --public-path=/static/ \
        --loader:.tsx=tsx \
        --loader:.ts=ts \
        --loader:.jsx=jsx \
        --loader:.js=js \
        --loader:.css=css \
        --loader:.png=file \
        --loader:.jpg=file \
        --loader:.jpeg=file \
        --loader:.gif=file \
        --loader:.svg=dataurl \
        --define:process.env.NODE_ENV=\"production\" \
        --define:import.meta.env.VITE_API_BASE_URL=\"https://richman-tours.onrender.com/api\" \
        --external:react \
        --external:react-dom || {
        
        echo "❌ esbuild with externals failed, trying without externals..."
        ./esbuild src/main.tsx \
            --bundle \
            --outdir=dist/assets \
            --format=esm \
            --platform=browser \
            --target=es2020 \
            --minify \
            --public-path=/static/ \
            --loader:.tsx=tsx \
            --loader:.ts=ts \
            --loader:.jsx=jsx \
            --loader:.js=js \
            --loader:.css=css \
            --loader:.png=file \
            --loader:.jpg=file \
            --loader:.jpeg=file \
            --loader:.gif=file \
            --loader:.svg=dataurl \
            --define:process.env.NODE_ENV=\"production\" \
            --define:import.meta.env.VITE_API_BASE_URL=\"https://richman-tours.onrender.com/api\"
    }
fi

# Verify build exists
if [ ! -d "dist" ] || [ -z "$(ls -A dist 2>/dev/null)" ]; then
    echo "❌ Build failed - no dist directory or empty"
    exit 1
fi

echo "📋 Build verification:"
ls -la dist/
find dist -name "*.js" -o -name "*.css" | head -5

# Create or fix index.html for your app
if [ ! -f "dist/index.html" ]; then
    echo "🔧 Creating index.html for your React app..."
    
    # Find the built JS and CSS files
    JS_FILE=$(find dist -name "*.js" | head -1 | sed 's|dist/||')
    CSS_FILE=$(find dist -name "*.css" | head -1 | sed 's|dist/||')
    
    cat > dist/index.html << EOF
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/static/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Richman Tours</title>
    $([ -n "$CSS_FILE" ] && echo "    <link rel=\"stylesheet\" crossorigin href=\"/static/$CSS_FILE\" />")
  </head>
  <body>
    <div id="root"></div>
    $([ -n "$JS_FILE" ] && echo "    <script type=\"module\" crossorigin src=\"/static/$JS_FILE\"></script>")
  </body>
</html>
EOF
fi

# Fix asset paths in index.html
if [ -f "dist/index.html" ]; then
    echo "🔧 Fixing asset paths for Django static serving..."
    sed -i 's|="/assets/|="/static/|g' dist/index.html
    sed -i 's|href="/assets/|href="/static/|g' dist/index.html
    sed -i 's|src="/assets/|src="/static/|g' dist/index.html
    sed -i 's|="/static/static/|="/static/|g' dist/index.html
    
    echo "📋 index.html preview:"
    head -15 dist/index.html
fi

# Create necessary static files if they don't exist
echo "📁 Ensuring static file structure..."
mkdir -p dist/assets

# Copy any additional static assets from src if they exist
if [ -d "src/assets" ]; then
    echo "📂 Copying src/assets to dist..."
    cp -r src/assets/* dist/assets/ 2>/dev/null || true
fi

# Handle any CSS files that need to be in the right place
if [ -f "src/index.css" ]; then
    echo "🎨 Processing main CSS..."
    cp src/index.css dist/assets/main.css 2>/dev/null || true
fi

# Django static collection
echo "📦 Collecting Django static files..."
python manage.py collectstatic --noinput --clear --verbosity=2

# Run migrations
echo "🗄️ Running Django migrations..."
python manage.py migrate --noinput

# Final verification
echo "📋 Final verification:"
echo "Dist files: $(find dist -type f 2>/dev/null | wc -l)"
echo "Static files: $(find staticfiles -type f 2>/dev/null | wc -l)"

if [ -d "staticfiles" ]; then
    echo "Sample static files:"
    find staticfiles -name "*.js" -o -name "*.css" | head -3
fi

echo "✅ Your React app build completed successfully!"
echo "🎯 Your actual application should now be deployed!"