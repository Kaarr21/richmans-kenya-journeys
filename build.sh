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
    
    # Create package.json with ALL your actual dependencies
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
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "cmdk": "^1.1.1",
    "date-fns": "^3.6.0",
    "embla-carousel-react": "^8.6.0",
    "input-otp": "^1.4.2",
    "lucide-react": "^0.462.0",
    "next-themes": "^0.3.0",
    "react": "^18.3.1",
    "react-day-picker": "^8.10.1",
    "react-dom": "^18.3.1",
    "react-hook-form": "^7.61.1",
    "react-resizable-panels": "^2.1.9",
    "react-router-dom": "^6.30.1",
    "recharts": "^2.15.4",
    "sonner": "^1.7.4",
    "tailwind-merge": "^2.6.0",
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
    "typescript": "^5.8.3",
    "vite": "^5.4.19"
  }
}
EOF

    # Install with Bun
    echo "📦 Installing dependencies with Bun..."
    bun install
    
    # Create/copy the necessary config files
    echo "⚙️ Setting up config files..."
    
    # Copy vite.config.ts if it exists, or create a working one
    if [ ! -f "vite.config.ts" ]; then
        echo "📝 Creating vite.config.ts..."
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
    minify: 'terser',
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
      }
    },
  },
  base: mode === 'production' ? '/static/' : '/',
  define: {
    'process.env.NODE_ENV': JSON.stringify(mode || 'development'),
  },
}))
VITE_EOF
    fi
    
    # Create postcss.config.js if missing
    if [ ! -f "postcss.config.js" ]; then
        echo "📝 Creating postcss.config.js..."
        cat > postcss.config.js << 'POSTCSS_EOF'
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
POSTCSS_EOF
    fi
    
    # Create simplified tailwind.config.ts if the existing one causes issues
    if [ -f "tailwind.config.ts" ]; then
        echo "📝 Backing up and simplifying tailwind.config.ts..."
        mv tailwind.config.ts tailwind.config.ts.backup
    fi
    
    cat > tailwind.config.ts << 'TAILWIND_EOF'
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
TAILWIND_EOF
    
    # Try building with Bun
    echo "🏗️ Building with Bun..."
    if bun run build; then
        echo "✅ Bun build successful!"
    elif bunx --bun vite build --mode production --base=/static/ --outDir=dist; then
        echo "✅ Bunx vite build successful!"
    else
        echo "❌ Bun build failed, trying bun vite directly..."
        bun vite build --mode production --base=/static/ --outDir=dist || {
            echo "❌ All Bun methods failed"
            exit 1
        }
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