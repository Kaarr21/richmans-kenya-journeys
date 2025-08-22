# Create your models here.
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
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.customer_name} - {self.destination}"
