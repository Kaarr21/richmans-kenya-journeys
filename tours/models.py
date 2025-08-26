from django.db import models

# Create your models here.
# tours/models.py - New file for schedule management
from django.db import models
from django.contrib.auth.models import User
import uuid

class Tour(models.Model):
    TOUR_STATUS_CHOICES = [
        ('scheduled', 'Scheduled'),
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    destination = models.CharField(max_length=255)
    start_date = models.DateField()
    end_date = models.DateField()
    start_time = models.TimeField(blank=True, null=True)
    max_capacity = models.PositiveIntegerField(default=8)
    current_bookings = models.PositiveIntegerField(default=0)
    price_per_person = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    status = models.CharField(max_length=20, choices=TOUR_STATUS_CHOICES, default='scheduled')
    notes = models.TextField(blank=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['start_date', 'start_time']
    
    def __str__(self):
        return f"{self.title} - {self.start_date}"
    
    @property
    def available_spots(self):
        return self.max_capacity - self.current_bookings
    
    @property
    def is_full(self):
        return self.current_bookings >= self.max_capacity
    
    @property
    def duration_days(self):
        return (self.end_date - self.start_date).days + 1