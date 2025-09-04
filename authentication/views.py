# authentication/views.py - FIXED version with proper imports
from django.shortcuts import render
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.views.decorators.csrf import csrf_exempt  # FIXED: Added missing import
from django.utils.decorators import method_decorator
from .serializers import LoginSerializer, UserSerializer, ProfileSerializer
from .models import Profile


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """Enhanced login view with better error handling for mobile"""
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        email = serializer.validated_data['email']
        password = serializer.validated_data['password']

        try:
            user = User.objects.get(email=email)
            user = authenticate(username=user.username, password=password)
            if user and user.is_active:  # Check if user is active
                token, created = Token.objects.get_or_create(user=user)
                return Response({
                    'token': token.key,
                    'user': UserSerializer(user).data,
                    'message': 'Login successful'
                })
            else:
                return Response({
                    'error': 'Account is inactive or invalid credentials'
                }, status=status.HTTP_401_UNAUTHORIZED)
        except User.DoesNotExist:
            pass

        return Response({
            'error': 'Invalid email or password'
        }, status=status.HTTP_401_UNAUTHORIZED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """Enhanced logout with better error handling"""
    try:
        token = Token.objects.get(user=request.user)
        token.delete()
        return Response({
            'message': 'Successfully logged out'
        })
    except Token.DoesNotExist:
        return Response({
            'error': 'Token not found'
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_profile(request):
    """Enhanced profile view with better error handling"""
    try:
        return Response({
            'user': UserSerializer(request.user).data,
            'message': 'Profile retrieved successfully'
        })
    except Exception as e:
        return Response({
            'error': 'Profile not found'
        }, status=status.HTTP_404_NOT_FOUND)
        