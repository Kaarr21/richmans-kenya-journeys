from django.shortcuts import render

# Create your views here.
# tours/views.py - New file
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from .models import Tour
from .serializers import TourSerializer, TourCreateSerializer


class TourListCreateView(generics.ListCreateAPIView):
    queryset = Tour.objects.all()

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return TourCreateSerializer
        return TourSerializer

    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]  # Anyone can view tours
        return [IsAuthenticated()]  # Only authenticated users can create

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class TourDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Tour.objects.all()
    serializer_class = TourSerializer
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method in ['PATCH', 'PUT']:
            return TourCreateSerializer
        return TourSerializer


@api_view(['GET'])
@permission_classes([AllowAny])
def upcoming_tours(request):
    """Get upcoming available tours for public view"""
    from datetime import date
    tours = Tour.objects.filter(
        start_date__gte=date.today(),
        status='scheduled'
    ).order_by('start_date')
    
    serializer = TourSerializer(tours, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_tour_capacity(request, pk):
    """Update tour capacity and current bookings"""
    tour = get_object_or_404(Tour, pk=pk)
    
    current_bookings = request.data.get('current_bookings')
    if current_bookings is not None:
        if current_bookings > tour.max_capacity:
            return Response(
                {'error': 'Current bookings cannot exceed maximum capacity'},
                status=status.HTTP_400_BAD_REQUEST
            )
        tour.current_bookings = current_bookings
        tour.save()
        
        serializer = TourSerializer(tour, context={'request': request})
        return Response(serializer.data)
    
    return Response(
        {'error': 'current_bookings field is required'},
        status=status.HTTP_400_BAD_REQUEST
    )