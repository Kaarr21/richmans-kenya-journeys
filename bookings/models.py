# bookings/models.py - Enhanced version
from django.db import models
import uuid
from django.contrib.auth.models import User

class Booking(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
        ('completed', 'Completed'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    customer_name = models.CharField(max_length=255)
    customer_email = models.EmailField()
    customer_phone = models.CharField(max_length=20, blank=True, null=True)
    destination = models.CharField(max_length=255)
    group_size = models.PositiveIntegerField(default=1)
    preferred_date = models.DateField(blank=True, null=True)
    confirmed_date = models.DateField(blank=True, null=True)
    confirmed_time = models.TimeField(blank=True, null=True)
    duration_days = models.PositiveIntegerField(default=1)
    amount = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    special_requests = models.TextField(blank=True)
    notes = models.TextField(blank=True)
    admin_message = models.TextField(blank=True, help_text="Message from Richard to customer")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Email tracking
    customer_notified = models.BooleanField(default=False, help_text="Whether customer has been notified of status")
    last_notification_sent = models.DateTimeField(blank=True, null=True)
    
    # Date/time change tracking
    previous_confirmed_date = models.DateField(blank=True, null=True, help_text="Previous confirmed date for change detection")
    previous_confirmed_time = models.TimeField(blank=True, null=True, help_text="Previous confirmed time for change detection")
    date_time_notification_sent = models.BooleanField(default=False, help_text="Whether customer has been notified of date/time changes")
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.customer_name} - {self.destination} ({self.status})"
    
    def has_date_time_changed(self):
        """Check if confirmed date or time has changed"""
        return (
            self.confirmed_date != self.previous_confirmed_date or
            self.confirmed_time != self.previous_confirmed_time
        )
    
    def save(self, *args, **kwargs):
        """Override save to track date/time changes"""
        # Store previous values before saving
        if self.pk:
            try:
                old_instance = Booking.objects.get(pk=self.pk)
                self.previous_confirmed_date = old_instance.confirmed_date
                self.previous_confirmed_time = old_instance.confirmed_time
            except Booking.DoesNotExist:
                pass
        
        super().save(*args, **kwargs)
        