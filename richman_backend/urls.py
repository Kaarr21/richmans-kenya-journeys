# Update richman_backend/urls.py to include tours
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('authentication.urls')),
    path('api/bookings/', include('bookings.urls')),
    path('api/locations/', include('locations.urls')),
    path('api/tours/', include('tours.urls')),  # Add this line
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)