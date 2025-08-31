#!/usr/bin/env bash
# build.sh - Optimized build script for React + Django deployment

set -o errexit

echo "🚀 Building Richman Tours application..."

# Install Python dependencies
echo "📦 Installing Python dependencies..."
python -m pip install --upgrade pip
pip install -r requirements.txt

echo "🔍 Environment check..."
echo "Node version: $(node --version 2>/dev/null || echo 'Not available')"
echo "Bun version: $(bun --version 2>/dev/null || echo 'Not available')"
echo "Working directory: $(pwd)"

# Clean everything
echo "🧹 Cleaning previous builds..."
rm -rf node_modules package-lock.json dist staticfiles .vite || true

# Use Bun for faster builds
echo "🥟 Using Bun for frontend build..."
if command -v bun &> /dev/null; then
    echo "✅ Bun is available"
    
    # Create optimized package.json with ALL required dependencies
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

    # Install dependencies with Bun
    echo "📦 Installing dependencies with Bun..."
    bun install --frozen-lockfile || bun install
    
    # Create optimized vite config
    echo "⚙️ Creating optimized Vite config..."
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
  base: mode === 'production' ? '/static/' : '/',
  define: {
    'process.env.NODE_ENV': JSON.stringify(mode || 'development'),
  },
  esbuild: {
    drop: mode === 'production' ? ['console', 'debugger'] : [],
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', '@tanstack/react-query']
  }
}))
VITE_EOF
    
    # Create PostCSS config
    cat > postcss.config.js << 'POSTCSS_EOF'
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
POSTCSS_EOF
    
    # Create optimized Tailwind config
    cat > tailwind.config.ts << 'TAILWIND_EOF'
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
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
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
TAILWIND_EOF
    
    # Build with Bun - multiple strategies
    echo "🏗️ Building React app with Bun..."
    
    # Strategy 1: Standard build
    if bun run build; then
        echo "✅ Standard Bun build successful!"
    # Strategy 2: Build with esbuild minifier
    elif bunx vite build --mode production --base=/static/ --minify=esbuild; then
        echo "✅ Bun build with esbuild minifier successful!"
    # Strategy 3: Build without minification
    elif bunx vite build --mode production --base=/static/ --minify=false; then
        echo "✅ Bun build without minification successful!"
    else
        echo "❌ All Bun build strategies failed, trying fallback..."
        
        # Fallback: Simple build with basic config
        cat > vite.simple.config.ts << 'SIMPLE_EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: 'dist',
    minify: false,
    target: 'es2020'
  },
  base: '/static/'
})
SIMPLE_EOF
        
        if bunx vite build --config vite.simple.config.ts; then
            echo "✅ Simple config build successful!"
        else
            echo "❌ All build strategies failed"
            exit 1
        fi
    fi
    
else
    echo "❌ Bun not available, falling back to manual build..."
    
    # Create minimal package.json for npm
    cat > package.json << 'NPM_EOF'
{
  "name": "richman-tours",
  "type": "module",
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.30.1",
    "@tanstack/react-query": "^5.56.2",
    "lucide-react": "^0.462.0",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.6.0"
  },
  "devDependencies": {
    "vite": "^5.4.19",
    "@vitejs/plugin-react": "^5.0.2",
    "typescript": "^5.8.3"
  }
}
NPM_EOF
    
    # Try npm
    if command -v npm &> /dev/null; then
        echo "📦 Installing with npm..."
        npm install --production=false --silent || npm install
        echo "🏗️ Building with npm..."
        npx vite build --mode production --base=/static/ --outDir=dist
    else
        echo "❌ No package manager available, using esbuild fallback..."
        # Download esbuild
        curl -fsSL https://esbuild.github.io/dl/latest/esbuild-linux-64 -o esbuild
        chmod +x esbuild
        
        # Simple build with esbuild
        mkdir -p dist/assets
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
            --define:process.env.NODE_ENV=\"production\"
    fi
fi

# Verify build
if [ ! -d "dist" ] || [ -z "$(ls -A dist 2>/dev/null)" ]; then
    echo "❌ Build failed - no dist directory or empty"
    exit 1
fi

echo "📋 Build verification:"
ls -la dist/ || echo "No dist directory"
find dist -name "*.js" -o -name "*.css" 2>/dev/null | head -5 || echo "No JS/CSS files found"

# Create or fix index.html
if [ ! -f "dist/index.html" ]; then
    echo "🔧 Creating index.html..."
    
    JS_FILE=$(find dist -name "*.js" 2>/dev/null | head -1 | sed 's|dist/||')
    CSS_FILE=$(find dist -name "*.css" 2>/dev/null | head -1 | sed 's|dist/||')
    
    cat > dist/index.html << EOF
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/static/favicon.ico" />
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

# Fix asset paths in HTML
if [ -f "dist/index.html" ]; then
    echo "🔧 Fixing asset paths for Django static serving..."
    sed -i 's|="/assets/|="/static/|g' dist/index.html
    sed -i 's|href="/assets/|href="/static/|g' dist/index.html
    sed -i 's|src="/assets/|src="/static/|g' dist/index.html
    sed -i 's|="/static/static/|="/static/|g' dist/index.html
    
    echo "📋 Generated index.html:"
    head -10 dist/index.html
fi

# Ensure static file structure
echo "📁 Setting up static files structure..."
mkdir -p dist/assets

# Copy additional assets if they exist
if [ -d "public" ]; then
    echo "📂 Copying public assets..."
    cp -r public/* dist/ 2>/dev/null || true
fi

if [ -d "src/assets" ]; then
    echo "📂 Copying src assets..."
    cp -r src/assets/* dist/assets/ 2>/dev/null || true
fi

# Django operations
echo "📦 Collecting Django static files..."
python manage.py collectstatic --noinput --clear --verbosity=1

# Verify static files are properly collected
echo "🔍 Verifying static file collection..."
if [ -d "staticfiles" ]; then
    echo "✅ Django staticfiles directory exists"
    echo "📊 Static files count: $(find staticfiles -type f | wc -l)"
    
    # List sample files for verification
    echo "📋 Sample static files:"
    find staticfiles -name "*.js" -o -name "*.css" | head -5
    
    # Verify React assets are in staticfiles
    if find staticfiles -name "*.js" | grep -q "assets"; then
        echo "✅ React JavaScript assets found in staticfiles"
    else
        echo "⚠️ React JavaScript assets not found in staticfiles"
    fi
    
    if find staticfiles -name "*.css" | grep -q "assets"; then
        echo "✅ React CSS assets found in staticfiles"
    else
        echo "⚠️ React CSS assets not found in staticfiles"
    fi
else
    echo "❌ Django staticfiles directory not created"
    exit 1
fi

echo "🗄️ Running Django migrations..."
python manage.py migrate --noinput

# Test static file serving
echo "🧪 Testing static file setup..."
python -c "
import os
from django.conf import settings
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'richman_backend.settings')
django.setup()

print(f'STATIC_ROOT: {settings.STATIC_ROOT}')
print(f'STATIC_URL: {settings.STATIC_URL}')
print(f'STATICFILES_DIRS: {settings.STATICFILES_DIRS}')

# Check if static files exist
import glob
js_files = glob.glob(os.path.join(settings.STATIC_ROOT, '**', '*.js'), recursive=True)
css_files = glob.glob(os.path.join(settings.STATIC_ROOT, '**', '*.css'), recursive=True)
print(f'Found {len(js_files)} JS files and {len(css_files)} CSS files in STATIC_ROOT')
"

# Final verification
echo "🎯 Final verification:"
echo "React build files: $(find dist -type f 2>/dev/null | wc -l)"
echo "Django static files: $(find staticfiles -type f 2>/dev/null | wc -l)"

if [ -d "staticfiles" ]; then
    echo "✅ Sample static files:"
    find staticfiles -name "*.js" -o -name "*.css" 2>/dev/null | head -3
fi

echo "🎉 Build completed successfully!"
echo "🚀 Richman Tours is ready for deployment!"