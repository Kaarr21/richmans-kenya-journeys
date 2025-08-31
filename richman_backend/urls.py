# richman_backend/urls.py - Simplified and robust URL configuration

from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView
from django.http import Http404
import os

def serve_react_app(request, path=''):
    """
    Serve the React app for frontend routes
    """
    # Don't serve React for API routes
    if path.startswith('api/'):
        raise Http404("API route not found")
    
    # Don't serve React for admin routes  
    if path.startswith('admin'):
        raise Http404("Admin route not found")
        
    # Don't serve React for static files
    if path.startswith('static/') or any(path.endswith(ext) for ext in ['.js', '.css', '.png', '.jpg', '.ico', '.svg', '.woff', '.woff2', '.ttf', '.map']):
        raise Http404("Static file not found")
    
    # Serve React index.html for all other routes
    return TemplateView.as_view(template_name='index.html')(request)

# URL patterns - order matters!
urlpatterns = [
    # Django admin
    path('admin/', admin.site.urls),
    
    # API routes - must come first
    path('api/auth/', include('authentication.urls')),
    path('api/bookings/', include('bookings.urls')),  
    path('api/locations/', include('locations.urls')),
    path('api/tours/', include('tours.urls')),
]

# Static and media files
if settings.DEBUG:
    # Development - serve static and media files
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
else:
    # Production - let WhiteNoise handle static files
    # Add media files serving for production
    from django.views.static import serve
    urlpatterns += [
        re_path(r'^media/(?P<path>.*)$', serve, {
            'document_root': settings.MEDIA_ROOT,
        }),
    ]

# React app catch-all - MUST BE LAST
urlpatterns += [
    re_path(r'^(?P<path>.*)/$', serve_react_app, name='react-app-slash'),
    re_path(r'^(?P<path>.*)$', serve_react_app, name='react-app'),
]