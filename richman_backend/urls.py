# richman_backend/urls.py - Fixed static file serving with proper MIME types
from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView
from django.views.static import serve
from django.http import Http404, HttpResponse, FileResponse
from django.utils.http import http_date
from django.views.decorators.cache import cache_control
from django.views.decorators.http import condition
import os
import mimetypes
import time

# Initialize mimetypes with additional web types
mimetypes.add_type('application/javascript', '.js')
mimetypes.add_type('text/css', '.css')
mimetypes.add_type('image/svg+xml', '.svg')
mimetypes.add_type('font/woff', '.woff')
mimetypes.add_type('font/woff2', '.woff2')
mimetypes.add_type('font/ttf', '.ttf')
mimetypes.add_type('font/eot', '.eot')
mimetypes.add_type('font/otf', '.otf')

def get_static_file_etag(request, path):
    """Generate ETag for static files"""
    try:
        full_path = os.path.join(settings.STATIC_ROOT, path)
        if os.path.exists(full_path):
            stat = os.stat(full_path)
            return f'"{stat.st_mtime}-{stat.st_size}"'
    except:
        pass
    return None

def get_static_file_last_modified(request, path):
    """Get last modified time for static files"""
    try:
        full_path = os.path.join(settings.STATIC_ROOT, path)
        if os.path.exists(full_path):
            return os.path.getmtime(full_path)
    except:
        pass
    return None

@condition(etag_func=get_static_file_etag, last_modified_func=get_static_file_last_modified)
@cache_control(max_age=31536000, immutable=True, public=True)
def serve_static_file(request, path):
    """
    Serve static files with proper MIME types and caching headers
    """
    try:
        full_path = os.path.join(settings.STATIC_ROOT, path)
        
        if not os.path.exists(full_path):
            raise Http404("Static file not found")
        
        if not os.path.isfile(full_path):
            raise Http404("Path is not a file")
        
        # Security check - ensure file is within STATIC_ROOT
        if not os.path.abspath(full_path).startswith(os.path.abspath(settings.STATIC_ROOT)):
            raise Http404("Access denied")
        
        # Get MIME type
        content_type, encoding = mimetypes.guess_type(full_path)
        
        # Default content types for common web assets
        if not content_type:
            ext = os.path.splitext(path)[1].lower()
            content_type_map = {
                '.js': 'application/javascript',
                '.css': 'text/css',
                '.svg': 'image/svg+xml',
                '.woff': 'font/woff',
                '.woff2': 'font/woff2',
                '.ttf': 'font/ttf',
                '.eot': 'application/vnd.ms-fontobject',
                '.otf': 'font/otf',
                '.png': 'image/png',
                '.jpg': 'image/jpeg',
                '.jpeg': 'image/jpeg',
                '.gif': 'image/gif',
                '.webp': 'image/webp',
                '.ico': 'image/x-icon',
                '.json': 'application/json',
                '.map': 'application/json',
            }
            content_type = content_type_map.get(ext, 'application/octet-stream')
        
        # Use FileResponse for efficient file serving
        response = FileResponse(
            open(full_path, 'rb'),
            content_type=content_type
        )
        
        # Add security headers
        response['X-Content-Type-Options'] = 'nosniff'
        
        # Add encoding if detected
        if encoding:
            response['Content-Encoding'] = encoding
        
        return response
        
    except Exception as e:
        print(f"Error serving static file {path}: {e}")
        raise Http404("Static file error")

def serve_react_app(request, path=''):
    """
    Serve the React app for non-API, non-static routes
    """
    try:
        # Don't serve React app for static file requests
        if path.startswith('assets/') or any(path.endswith(ext) for ext in ['.js', '.css', '.png', '.jpg', '.ico', '.svg', '.woff', '.woff2', '.ttf', '.eot', '.otf', '.map']):
            raise Http404("Static file not found in React handler")
        
        # Don't serve React app for admin URLs
        if path.startswith('admin'):
            raise Http404("Admin URL")
        
        # Serve React app
        return TemplateView.as_view(template_name='index.html')(request)
    except:
        raise Http404("Page not found")

# API routes - highest priority
urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('authentication.urls')),
    path('api/bookings/', include('bookings.urls')),
    path('api/locations/', include('locations.urls')),
    path('api/tours/', include('tours.urls')),
]

# Media files
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
else:
    # Production media file serving
    urlpatterns += [
        re_path(r'^media/(?P<path>.*)$', serve, {
            'document_root': settings.MEDIA_ROOT,
            'show_indexes': False
        }),
    ]

# Static files - MUST come before catch-all
urlpatterns += [
    # Serve static files with custom handler for proper MIME types
    re_path(r'^static/(?P<path>.*)$', serve_static_file, name='static'),
]

# React app catch-all - MUST be last
urlpatterns += [
    re_path(r'^(?P<path>.*)$', serve_react_app, name='react-app'),
]