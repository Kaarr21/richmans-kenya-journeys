# richman_backend/urls.py - Fixed to properly serve static files
from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView
from django.views.static import serve
from django.http import Http404
import os

# API routes - these should come first
urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('authentication.urls')),
    path('api/bookings/', include('bookings.urls')),
    path('api/locations/', include('locations.urls')),
    path('api/tours/', include('tours.urls')),
]

# Serve media files
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
else:
    # Production media file serving
    urlpatterns += [
        re_path(r'^media/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT}),
    ]

# Static files serving (for React assets)
if not settings.DEBUG:
    urlpatterns += [
        re_path(r'^static/(?P<path>.*)$', serve, {'document_root': settings.STATIC_ROOT}),
    ]

# Custom view to serve React app and handle routing
def serve_react_app(request, path=''):
    """
    Serve the React app for all non-API routes
    """
    try:
        # Check if the requested path is a static asset
        if path.startswith('assets/') or path.endswith(('.js', '.css', '.png', '.jpg', '.ico', '.svg')):
            raise Http404("Static file not found")
        
        # Serve React app
        return TemplateView.as_view(template_name='index.html')(request)
    except:
        raise Http404("Page not found")

# Catch-all for React routing - this should be LAST
urlpatterns += [
    re_path(r'^(?P<path>.*)$', serve_react_app, name='react-app'),
]