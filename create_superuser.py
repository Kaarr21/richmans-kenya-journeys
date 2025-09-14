#!/usr/bin/env python3
"""
Script to create a Django superuser for admin access
"""
import os
import sys
import django

# Add the project directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'richman_backend.settings')
django.setup()

from django.contrib.auth.models import User

def create_superuser():
    # Check if superuser already exists
    if User.objects.filter(is_superuser=True).exists():
        print("✅ Superuser already exists")
        return
    
    # Create superuser
    username = 'admin'
    email = 'karokin35@gmail.com'
    password = 'admin123'  # Change this to a secure password
    
    try:
        user = User.objects.create_superuser(
            username=username,
            email=email,
            password=password
        )
        print(f"✅ Superuser created successfully!")
        print(f"   Username: {username}")
        print(f"   Email: {email}")
        print(f"   Password: {password}")
        print(f"   Admin URL: https://richmans-kenya-journeys-1.onrender.com/admin/")
    except Exception as e:
        print(f"❌ Error creating superuser: {e}")

if __name__ == "__main__":
    create_superuser()
