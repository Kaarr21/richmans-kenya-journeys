#!/usr/bin/env python3
"""
Script to fix admin user - creates or resets admin credentials
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

def fix_admin():
    username = 'admin'
    email = 'karokin35@gmail.com'
    password = 'admin123'
    
    print("🔧 Fixing admin user...")
    
    # Delete existing admin user if it exists
    if User.objects.filter(username=username).exists():
        User.objects.filter(username=username).delete()
        print(f"🗑️ Deleted existing user '{username}'")
    
    # Create fresh superuser
    try:
        user = User.objects.create_superuser(
            username=username,
            email=email,
            password=password
        )
        print(f"✅ Superuser created successfully!")
        
        # Verify
        test_user = User.objects.get(username=username)
        print(f"\n🔍 Verification:")
        print(f"   Username: {test_user.username}")
        print(f"   Email: {test_user.email}")
        print(f"   Is Superuser: {test_user.is_superuser}")
        print(f"   Is Staff: {test_user.is_staff}")
        print(f"   Is Active: {test_user.is_active}")
        
        print(f"\n📋 Login Credentials:")
        print(f"   Username: {username}")
        print(f"   Password: {password}")
        print(f"   Admin URL: https://richmans-kenya-journeys-1.onrender.com/admin/")
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    fix_admin()
