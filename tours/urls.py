# tours/urls.py - New file
from django.urls import path
from . import views

urlpatterns = [
    path('', views.TourListCreateView.as_view(), name='tour-list-create'),
    path('<uuid:pk>/', views.TourDetailView.as_view(), name='tour-detail'),
    path('upcoming/', views.upcoming_tours, name='upcoming-tours'),
    path('<uuid:pk>/update-capacity/', views.update_tour_capacity, name='update-tour-capacity'),
]