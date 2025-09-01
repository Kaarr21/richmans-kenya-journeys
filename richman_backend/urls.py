# richman_backend/urls.py - PRODUCTION FIXES

from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView
from django.http import Http404, HttpResponse
from django.views.static import serve
import os
import logging

logger = logging.getLogger(__name__)

def health_check(request):
    """Simple health check endpoint"""
    return HttpResponse("OK", content_type="text/plain")

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

# URL patterns - ENHANCED with health check
urlpatterns = [
    # Health check for monitoring
    path('health/', health_check, name='health-check'),
    
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
    
    # Serve media files in production
    urlpatterns += [
        re_path(r'^media/(?P<path>.*)$', serve, {
            'document_root': settings.MEDIA_ROOT,
        }, name='media'),
    ]

# React app catch-all - MUST BE LAST
urlpatterns += [
    # Handle paths with trailing slash
    re_path(r'^(?P<path>.*)/$', serve_react_app, name='react-app-slash'),
    # Handle paths without trailing slash
    re_path(r'^(?P<path>.*)$', serve_react_app, name='react-app'),
]

logger.info(f"URL patterns loaded. Total patterns: {len(urlpatterns)}")
logger.info(f"DEBUG mode: {settings.DEBUG}")
logger.info(f"STATIC_ROOT: {settings.STATIC_ROOT}")
logger.info(f"MEDIA_ROOT: {settings.MEDIA_ROOT}")