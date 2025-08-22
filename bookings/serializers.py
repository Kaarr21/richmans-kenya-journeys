# bookings/serializers.py - Updated version
from rest_framework import serializers
from .models import Booking

class BookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at', 'customer_notified', 'last_notification_sent')

class BookingCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = [
            'customer_name', 'customer_email', 'customer_phone',
            'destination', 'group_size', 'preferred_date', 'special_requests'
        ]

class BookingUpdateSerializer(serializers.ModelSerializer):
    """Serializer for admin updating bookings"""
    send_notification = serializers.BooleanField(default=True, write_only=True, required=False)
    
    class Meta:
        model = Booking
        fields = [
            'status', 'confirmed_date', 'confirmed_time', 'duration_days',
            'amount', 'notes', 'admin_message', 'send_notification'
        ]
        
    def validate(self, data):
        # If confirming, ensure we have confirmed_date
        if data.get('status') == 'confirmed' and not data.get('confirmed_date'):
            # If not provided in this update, check if it exists on the instance
            if not self.instance or not self.instance.confirmed_date:
                raise serializers.ValidationError(
                    "Confirmed date is required when confirming a booking"
                )
        return data
        