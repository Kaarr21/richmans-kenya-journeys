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
    username = 'admin'
    email = 'karokin35@gmail.com'
    password = 'admin123'
    
    # Check if user already exists
    if User.objects.filter(username=username).exists():
        print(f"✅ User '{username}' already exists")
        user = User.objects.get(username=username)
        # Make sure it's a superuser
        if not user.is_superuser:
            user.is_superuser = True
            user.is_staff = True
            user.save()
            print(f"✅ Updated user '{username}' to superuser")
        else:
            print(f"✅ User '{username}' is already a superuser")
        
        # Update password
        user.set_password(password)
        user.save()
        print(f"✅ Password updated for user '{username}'")
    else:
        # Create new superuser
        try:
            user = User.objects.create_superuser(
                username=username,
                email=email,
                password=password
            )
            print(f"✅ Superuser created successfully!")
        except Exception as e:
            print(f"❌ Error creating superuser: {e}")
            return
    
    print(f"\n📋 Login Credentials:")
    print(f"   Username: {username}")
    print(f"   Password: {password}")
    print(f"   Email: {email}")
    print(f"   Admin URL: https://richmans-kenya-journeys-1.onrender.com/admin/")
    
    # Verify the user
    try:
        test_user = User.objects.get(username=username)
        print(f"\n🔍 User Verification:")
        print(f"   Username: {test_user.username}")
        print(f"   Email: {test_user.email}")
        print(f"   Is Superuser: {test_user.is_superuser}")
        print(f"   Is Staff: {test_user.is_staff}")
        print(f"   Is Active: {test_user.is_active}")
    except Exception as e:
        print(f"❌ Error verifying user: {e}")

if __name__ == "__main__":
    create_superuser()
