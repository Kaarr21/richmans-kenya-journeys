# richman_backend/urls.py - Updated to serve React app
from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView
from django.views.static import serve
import os

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

# Serve React app - this should be LAST
urlpatterns += [
    re_path(r'^.*$', TemplateView.as_view(template_name='index.html')),
]