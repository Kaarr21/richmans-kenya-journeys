from django.urls import path
from . import views

urlpatterns = [
    path('', views.BookingListCreateView.as_view(), name='booking-list-create'),
    path('<uuid:pk>/', views.BookingDetailView.as_view(), name='booking-detail'),
]
