#!/usr/bin/env python3
"""
Script to check existing Django users
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

def check_users():
    print("🔍 Checking existing Django users...")
    
    users = User.objects.all()
    
    if not users.exists():
        print("❌ No users found in database")
        return
    
    print(f"✅ Found {users.count()} user(s):")
    print()
    
    for user in users:
        print(f"👤 User: {user.username}")
        print(f"   Email: {user.email}")
        print(f"   Is Superuser: {user.is_superuser}")
        print(f"   Is Staff: {user.is_staff}")
        print(f"   Is Active: {user.is_active}")
        print(f"   Date Joined: {user.date_joined}")
        print()

if __name__ == "__main__":
    check_users()
