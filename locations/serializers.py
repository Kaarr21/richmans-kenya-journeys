from rest_framework import serializers
from .models import Location

class LocationSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Location
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at', 'user')
    
    def get_image_url(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
        return None
        