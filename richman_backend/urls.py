# richman_backend/urls.py - PRODUCTION FIXES with Sitemap

from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView
from django.http import Http404, HttpResponse
from django.views.static import serve
from django.contrib.sitemaps.views import sitemap
import os
import logging
from PIL import Image, ImageDraw
import io

# Import sitemaps
try:
    from .sitemaps import StaticViewSitemap, LocationSitemap
    sitemaps = {
        'static': StaticViewSitemap,
        'locations': LocationSitemap,
    }
except ImportError:
    sitemaps = {}

logger = logging.getLogger(__name__)

def health_check(request):
    """Simple health check endpoint"""
    return HttpResponse("OK", content_type="text/plain")

def placeholder_image(request, width, height):
    """Generate a placeholder image with specified dimensions"""
    try:
        width = int(width)
        height = int(height)
        
        # Create a simple placeholder image
        img = Image.new('RGB', (width, height), color='#f3f4f6')
        draw = ImageDraw.Draw(img)
        
        # Add some text
        text = f"{width} × {height}"
        # Simple text positioning (this is basic, could be improved)
        text_bbox = draw.textbbox((0, 0), text)
        text_width = text_bbox[2] - text_bbox[0]
        text_height = text_bbox[3] - text_bbox[1]
        
        x = (width - text_width) // 2
        y = (height - text_height) // 2
        
        draw.text((x, y), text, fill='#6b7280')
        
        # Convert to bytes
        img_io = io.BytesIO()
        img.save(img_io, format='JPEG', quality=80)
        img_io.seek(0)
        
        response = HttpResponse(img_io.getvalue(), content_type='image/jpeg')
        response['Cache-Control'] = 'public, max-age=3600'  # Cache for 1 hour
        return response
        
    except (ValueError, TypeError):
        raise Http404("Invalid dimensions")
    except Exception as e:
        logger.error(f"Error generating placeholder image: {e}")
        raise Http404("Error generating image")

def serve_react_app(request, path=''):
    """
    Serve the React app for frontend routes - ENHANCED ERROR HANDLING
    """
    logger.info(f"Request path: {path}, Full path: {request.get_full_path()}")
    
    # Don't serve React for API routes
    if path.startswith('api/'):
        logger.warning(f"API route not found: {path}")
        raise Http404("API route not found")
    
    # Don't serve React for admin routes  
    if path.startswith('admin'):
        logger.warning(f"Admin route not found: {path}")
        raise Http404("Admin route not found")
    
    # Don't serve React for sitemap
    if path.startswith('sitemap'):
        logger.warning(f"Sitemap route not found: {path}")
        raise Http404("Sitemap not found")
        
    # Don't serve React for static/media files
    static_extensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.ico', '.svg', '.woff', '.woff2', '.ttf', '.map', '.json']
    if (path.startswith('static/') or path.startswith('media/') or 
        any(path.endswith(ext) for ext in static_extensions)):
        logger.warning(f"Static/media file not found: {path}")
        raise Http404("Static file not found")
    
    # Check if index.html exists
    index_path = os.path.join(settings.STATIC_ROOT, 'index.html')
    if not os.path.exists(index_path):
        logger.error(f"index.html not found at {index_path}")
        return HttpResponse(
            f"<h1>Build Error</h1><p>React app not built properly. index.html not found at {index_path}</p>",
            content_type="text/html"
        )
    
    logger.info(f"Serving React app for path: {path}")
    # Serve React index.html for all other routes
    return TemplateView.as_view(template_name='index.html')(request)

# Enhanced media file serving for production
def serve_media(request, path):
    """Serve media files with proper headers"""
    try:
        response = serve(request, path, document_root=settings.MEDIA_ROOT)
        # Add cache headers for images
        if any(path.lower().endswith(ext) for ext in ['.jpg', '.jpeg', '.png', '.gif', '.webp']):
            response['Cache-Control'] = 'public, max-age=31536000'
            response['Access-Control-Allow-Origin'] = '*'
        return response
    except Http404:
        logger.error(f"Media file not found: {path}")
        raise

# URL patterns - ENHANCED with health check and sitemap
urlpatterns = [
    # Health check for monitoring
    path('health/', health_check, name='health-check'),
    
    # Placeholder image endpoint
    path('api/placeholder/<int:width>/<int:height>/', placeholder_image, name='placeholder-image'),
    
    # SEO - Sitemap
    path('sitemap.xml', sitemap, {'sitemaps': sitemaps}, name='django.contrib.sitemaps.views.sitemap'),
    
    # Django admin
    path('admin/', admin.site.urls),
    
    # API routes - must come first
    path('api/auth/', include('authentication.urls')),
    path('api/bookings/', include('bookings.urls')),  
    path('api/locations/', include('locations.urls')),
    path('api/tours/', include('tours.urls')),
]

# Static and media files handling
if settings.DEBUG:
    # Development - serve static and media files directly
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    logger.info("Development: serving static files directly")
else:
    # Production - let WhiteNoise handle static files, but serve media files
    logger.info("Production: WhiteNoise handling static files")
    
    # Serve media files in production with enhanced handling
    urlpatterns += [
        re_path(r'^media/(?P<path>.*)$', serve_media, name='media'),
    ]

# React app routes - specific frontend routes only
urlpatterns += [
    # Handle root path
    re_path(r'^$', serve_react_app, name='react-app-root'),
    # Handle specific frontend routes
    re_path(r'^gallery/?$', serve_react_app, name='react-app-gallery'),
    re_path(r'^book-tour/?$', serve_react_app, name='react-app-book-tour'),
    re_path(r'^auth/?$', serve_react_app, name='react-app-auth'),
]

logger.info(f"URL patterns loaded. Total patterns: {len(urlpatterns)}")
logger.info(f"DEBUG mode: {settings.DEBUG}")
logger.info(f"STATIC_ROOT: {settings.STATIC_ROOT}")
logger.info(f"MEDIA_ROOT: {settings.MEDIA_ROOT}")