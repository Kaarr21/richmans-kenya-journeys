from django.urls import path
from . import views

urlpatterns = [
    path('', views.LocationListCreateView.as_view(), name='location-list-create'),
    path('<uuid:pk>/', views.LocationDetailView.as_view(), name='location-detail'),
]
