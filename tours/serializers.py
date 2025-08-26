# tours/serializers.py - New file
from rest_framework import serializers
from .models import Tour

class TourSerializer(serializers.ModelSerializer):
    available_spots = serializers.ReadOnlyField()
    is_full = serializers.ReadOnlyField()
    duration_days = serializers.ReadOnlyField()
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    
    class Meta:
        model = Tour
        fields = [
            'id', 'title', 'description', 'destination', 'start_date', 'end_date',
            'start_time', 'max_capacity', 'current_bookings', 'price_per_person',
            'status', 'notes', 'available_spots', 'is_full', 'duration_days',
            'created_by', 'created_by_name', 'created_at', 'updated_at'
        ]
        read_only_fields = ('id', 'created_by', 'created_at', 'updated_at')
    
    def validate(self, data):
        start_date = data.get('start_date')
        end_date = data.get('end_date')
        
        if start_date and end_date and end_date < start_date:
            raise serializers.ValidationError("End date cannot be before start date")
        
        current_bookings = data.get('current_bookings', 0)
        max_capacity = data.get('max_capacity', 0)
        
        if current_bookings > max_capacity:
            raise serializers.ValidationError("Current bookings cannot exceed maximum capacity")
        
        return data

class TourCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tour
        fields = [
            'title', 'description', 'destination', 'start_date', 'end_date',
            'start_time', 'max_capacity', 'price_per_person', 'notes'
        ]
        
    def validate(self, data):
        start_date = data.get('start_date')
        end_date = data.get('end_date')
        
        if start_date and end_date and end_date < start_date:
            raise serializers.ValidationError("End date cannot be before start date")
        
        return data