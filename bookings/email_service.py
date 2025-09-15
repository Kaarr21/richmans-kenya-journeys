# bookings/email_service.py - New file for handling emails
from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from datetime import datetime
from django.utils import timezone
import logging

logger = logging.getLogger(__name__)

class EmailService:
    @staticmethod
    def send_booking_confirmation_to_customer(booking):
        """Send initial booking confirmation to customer"""
        subject = f"Booking Confirmation - {booking.destination}"
        
        context = {
            'customer_name': booking.customer_name,
            'destination': booking.destination,
            'group_size': booking.group_size,
            'preferred_date': booking.preferred_date,
            'special_requests': booking.special_requests,
            'booking_id': str(booking.id)[:8],  # Show first 8 chars of UUID
        }
        
        html_message = render_to_string('emails/booking_confirmation.html', context)
        plain_message = strip_tags(html_message)
        
        try:
            send_mail(
                subject=subject,
                message=plain_message,
                from_email=settings.EMAIL_HOST_USER,
                recipient_list=[booking.customer_email],
                html_message=html_message,
                fail_silently=False,
            )
            logger.info(f"Booking confirmation sent to {booking.customer_email}")
            return True
        except Exception as e:
            logger.error(f"Failed to send booking confirmation: {e}")
            return False

    @staticmethod
    def send_booking_status_update(booking):
        """Send booking status update to customer"""
        status_messages = {
            'confirmed': 'Your booking has been confirmed!',
            'cancelled': 'Your booking has been cancelled',
            'completed': 'Thank you for your tour with us!'
        }
        
        subject = f"Booking Update - {booking.destination}"
        
        context = {
            'customer_name': booking.customer_name,
            'destination': booking.destination,
            'status': booking.status,
            'status_message': status_messages.get(booking.status, 'Your booking status has been updated'),
            'confirmed_date': booking.confirmed_date,
            'confirmed_time': booking.confirmed_time,
            'duration_days': booking.duration_days,
            'amount': booking.amount,
            'admin_message': booking.admin_message,
            'booking_id': str(booking.id)[:8],
            'richard_phone': '0720912561',
            'richard_email': 'richkaroki@gmail.com'
        }
        
        html_message = render_to_string('emails/booking_status_update.html', context)
        plain_message = strip_tags(html_message)
        
        try:
            send_mail(
                subject=subject,
                message=plain_message,
                from_email=settings.EMAIL_HOST_USER,
                recipient_list=[booking.customer_email],
                html_message=html_message,
                fail_silently=False,
            )
            
            # Update tracking fields
            booking.customer_notified = True
            booking.last_notification_sent = timezone.now()
            booking.save(update_fields=['customer_notified', 'last_notification_sent'])
            
            logger.info(f"Status update sent to {booking.customer_email} for booking {booking.id}")
            return True
        except Exception as e:
            logger.error(f"Failed to send status update: {e}")
            return False

    @staticmethod
    def send_admin_notification(booking):
        """Send notification to Richard about new booking"""
        subject = f"New Booking Request - {booking.destination}"
        
        message = f"""
New booking request received:

Customer: {booking.customer_name}
Email: {booking.customer_email}
Phone: {booking.customer_phone or 'Not provided'}
Destination: {booking.destination}
Group Size: {booking.group_size}
Preferred Date: {booking.preferred_date or 'Flexible'}
Special Requests: {booking.special_requests or 'None'}
Booking ID: {str(booking.id)[:8]}

Created: {booking.created_at.strftime('%Y-%m-%d %H:%M:%S')}

Please log into the admin dashboard to manage this booking.
        """

        try:
            send_mail(
                subject=subject,
                message=message,
                from_email=settings.EMAIL_HOST_USER,
                recipient_list=['karokin35@gmail.com'], 
                recipient_list=['richkaroki@gmail.com'], # Richard's email
                fail_silently=False,
            )
            logger.info(f"Admin notification sent for booking {booking.id}")
            return True
        except Exception as e:
            logger.error(f"Failed to send admin notification: {e}")
            return False

    @staticmethod
    def send_date_time_update_notification(booking):
        """Send notification to customer when confirmed date/time is updated"""
        subject = f"Tour Schedule Update - {booking.destination}"
        
        context = {
            'customer_name': booking.customer_name,
            'destination': booking.destination,
            'booking_id': str(booking.id)[:8],
            'group_size': booking.group_size,
            'duration_days': booking.duration_days,
            'amount': booking.amount,
            'admin_message': booking.admin_message,
            'confirmed_date': booking.confirmed_date,
            'confirmed_time': booking.confirmed_time,
            'previous_confirmed_date': booking.previous_confirmed_date,
            'previous_confirmed_time': booking.previous_confirmed_time,
            'richard_phone': '0720912561',
            'richard_email': 'richkaroki@gmail.com'
        }
        
        html_message = render_to_string('emails/date_time_update.html', context)
        plain_message = strip_tags(html_message)
        
        try:
            send_mail(
                subject=subject,
                message=plain_message,
                from_email=settings.EMAIL_HOST_USER,
                recipient_list=[booking.customer_email],
                html_message=html_message,
                fail_silently=False,
            )
            
            # Update tracking fields
            booking.date_time_notification_sent = True
            booking.last_notification_sent = timezone.now()
            booking.save(update_fields=['date_time_notification_sent', 'last_notification_sent'])
            
            logger.info(f"Date/time update notification sent to {booking.customer_email} for booking {booking.id}")
            return True
        except Exception as e:
            logger.error(f"Failed to send date/time update notification: {e}")
            return False
            