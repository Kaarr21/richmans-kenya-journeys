# locations/serializers.py - Updated version
from rest_framework import serializers
from .models import Location, LocationImage

class LocationImageSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = LocationImage
        fields = ['id', 'image_url', 'caption', 'order']
        read_only_fields = ('id',)
    
    def get_image_url(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
        return None

class LocationSerializer(serializers.ModelSerializer):
    images = LocationImageSerializer(many=True, read_only=True)
    primary_image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Location
        fields = ['id', 'title', 'description', 'images', 'primary_image_url', 'created_at', 'updated_at']
        read_only_fields = ('id', 'created_at', 'updated_at')
    
    def get_primary_image_url(self, obj):
        """Get the first/primary image URL for backwards compatibility"""
        first_image = obj.images.first()
        if first_image and first_image.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(first_image.image.url)
        return None

class LocationCreateSerializer(serializers.ModelSerializer):
    images = serializers.ListField(
        child=serializers.ImageField(), 
        max_length=5, 
        min_length=1,
        write_only=True,
        help_text="Upload 1-5 images for this location"
    )
    captions = serializers.ListField(
        child=serializers.CharField(max_length=255, allow_blank=True),
        required=False,
        write_only=True,
        help_text="Optional captions for each image (same order as images)"
    )
    
    class Meta:
        model = Location
        fields = ['title', 'description', 'images', 'captions']
        
    def validate(self, data):
        images = data.get('images', [])
        captions = data.get('captions', [])
        
        if len(images) > 5:
            raise serializers.ValidationError("Maximum 5 images allowed per location")
        
        if captions and len(captions) != len(images):
            raise serializers.ValidationError("Number of captions must match number of images")
            
        return data
    