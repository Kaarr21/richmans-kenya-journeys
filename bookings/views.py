# bookings/views.py - Updated version
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from .models import Booking
from .serializers import BookingSerializer, BookingCreateSerializer, BookingUpdateSerializer
from .email_service import EmailService


class BookingListCreateView(generics.ListCreateAPIView):
    queryset = Booking.objects.all()

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return BookingCreateSerializer   # customer booking
        return BookingSerializer            # admin listing

    def get_permissions(self):
        if self.request.method == 'POST':
            return [AllowAny()]    # anyone can book
        return [IsAdminUser()]     # only admins can view

    def perform_create(self, serializer):
        booking = serializer.save()
        
        # Send notifications
        EmailService.send_booking_confirmation_to_customer(booking)
        EmailService.send_admin_notification(booking)


class BookingDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Booking.objects.all()
    permission_classes = [IsAdminUser]   # only admins can manage
    
    def get_serializer_class(self):
        if self.request.method in ['PATCH', 'PUT']:
            return BookingUpdateSerializer
        return BookingSerializer
    
    def perform_update(self, serializer):
        send_notification = serializer.validated_data.pop('send_notification', True)
        booking = serializer.save()
        
        # Send customer notification if requested and status changed
        if send_notification and 'status' in serializer.validated_data:
            EmailService.send_booking_status_update(booking)


@api_view(['POST'])
@permission_classes([IsAdminUser])
def send_booking_notification(request, pk):
    """Manually send notification to customer"""
    booking = get_object_or_404(Booking, pk=pk)
    
    success = EmailService.send_booking_status_update(booking)
    
    if success:
        return Response({
            'message': 'Notification sent successfully',
            'customer_email': booking.customer_email
        })
    else:
        return Response(
            {'error': 'Failed to send notification'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAdminUser])
def booking_statistics(request):
    """Get booking statistics for admin dashboard"""
    total_bookings = Booking.objects.count()
    pending_bookings = Booking.objects.filter(status='pending').count()
    confirmed_bookings = Booking.objects.filter(status='confirmed').count()
    completed_bookings = Booking.objects.filter(status='completed').count()
    cancelled_bookings = Booking.objects.filter(status='cancelled').count()
    
    # Recent bookings (last 30 days)
    from datetime import datetime, timedelta
    thirty_days_ago = datetime.now() - timedelta(days=30)
    recent_bookings = Booking.objects.filter(created_at__gte=thirty_days_ago).count()
    
    return Response({
        'total_bookings': total_bookings,
        'pending_bookings': pending_bookings,
        'confirmed_bookings': confirmed_bookings,
        'completed_bookings': completed_bookings,
        'cancelled_bookings': cancelled_bookings,
        'recent_bookings': recent_bookings,
    })
    