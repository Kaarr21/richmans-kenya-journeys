from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAdminUser
from django.core.mail import send_mail
from django.conf import settings

from .models import Booking
from .serializers import BookingSerializer, BookingCreateSerializer


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
        self.send_booking_notification(booking)

    def send_booking_notification(self, booking):
        subject = f"New Booking Request - {booking.destination}"
        message = f"""
        New booking request received:

        Customer: {booking.customer_name}
        Email: {booking.customer_email}
        Phone: {booking.customer_phone}
        Destination: {booking.destination}
        Group Size: {booking.group_size}
        Preferred Date: {booking.preferred_date}
        Special Requests: {booking.special_requests}
        """

        try:
            send_mail(
                subject,
                message,
                settings.EMAIL_HOST_USER,
                ['richkaroki@gmail.com'],  # replace with your admin email(s)
                fail_silently=False,
            )
        except Exception as e:
            print(f"Failed to send email: {e}")


class BookingDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    permission_classes = [IsAdminUser]   # only admins can manage
