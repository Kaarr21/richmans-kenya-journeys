# bookings/urls.py - Updated version
from django.urls import path
from . import views

urlpatterns = [
    path('', views.BookingListCreateView.as_view(), name='booking-list-create'),
    path('<uuid:pk>/', views.BookingDetailView.as_view(), name='booking-detail'),
    path('<uuid:pk>/send-notification/', views.send_booking_notification, name='send-booking-notification'),
    path('statistics/', views.booking_statistics, name='booking-statistics'),
]
