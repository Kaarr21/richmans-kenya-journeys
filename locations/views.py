# locations/views.py - Updated version
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.db import transaction

from .models import Location, LocationImage
from .serializers import LocationSerializer, LocationCreateSerializer

class LocationListCreateView(generics.ListCreateAPIView):
    queryset = Location.objects.all()
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return LocationCreateSerializer
        return LocationSerializer
    
    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAuthenticated()]
        return [AllowAny()]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Extract images and captions from validated data
        images = serializer.validated_data.pop('images')
        captions = serializer.validated_data.pop('captions', [])
        
        # Create location and images in a transaction
        with transaction.atomic():
            # Create the location
            location = Location.objects.create(
                user=request.user,
                **serializer.validated_data
            )
            
            # Create images
            for i, image in enumerate(images):
                caption = captions[i] if i < len(captions) else ""
                LocationImage.objects.create(
                    location=location,
                    image=image,
                    caption=caption,
                    order=i
                )
        
        # Return the created location with images
        response_serializer = LocationSerializer(location, context={'request': request})
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)

class LocationDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Location.objects.all()
    serializer_class = LocationSerializer
    permission_classes = [IsAuthenticated]
    
    def destroy(self, request, *args, **kwargs):
        """Delete location and all its images"""
        location = self.get_object()
        
        # Images will be deleted automatically due to CASCADE
        # But we can also explicitly delete image files from storage
        for image in location.images.all():
            if image.image:
                image.image.delete(save=False)
        
        location.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
        