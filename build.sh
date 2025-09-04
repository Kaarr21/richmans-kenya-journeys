#!/usr/bin/env bash
set -o errexit

echo "🚀 Building Richman Tours application..."

# Environment validation
echo "🔍 Environment validation..."
echo "VITE_API_BASE_URL: ${VITE_API_BASE_URL:-'not set'}"

# Set API URL for production
export VITE_API_BASE_URL="https://richmans-kenya-journeys-1.onrender.com/api"

# Install Python dependencies
python -m pip install --upgrade pip
pip install -r requirements.txt

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf node_modules dist staticfiles || true

# Create optimized package.json
cat > package.json << 'EOF'
{
  "name": "richman-tours",
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
    "tailwind-merge": "^2.6.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.23",
    "@types/react-dom": "^18.3.7",
    "@vitejs/plugin-react": "^5.0.2",
    "vite": "^5.4.19",
    "tailwindcss": "^3.4.17",
    "typescript": "^5.8.3"
  }
}
EOF

# Install and build
npm install --production=false
npm run build

# Set up Django static files
echo "📁 Setting up Django static files..."
mkdir -p staticfiles
cp -r dist/* staticfiles/

# Create sitemap and robots
python manage.py collectstatic --noinput --clear
python manage.py migrate --noinput

echo "✅ Build completed successfully!"