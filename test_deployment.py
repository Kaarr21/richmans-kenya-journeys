#!/usr/bin/env python3
"""
Test deployment configuration
"""
import os
import sys
import django

# Add the project directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def test_deployment_config():
    print("🚀 Testing Deployment Configuration")
    print("=" * 50)
    
    # Test environment variables
    print("🔍 Environment Variables:")
    print(f"  RENDER: {os.environ.get('RENDER', 'Not set')}")
    print(f"  DATABASE_URL: {'Set' if os.environ.get('DATABASE_URL') else 'Not set'}")
    print(f"  DEBUG: {os.environ.get('DEBUG', 'Not set')}")
    print(f"  ALLOWED_HOSTS: {os.environ.get('ALLOWED_HOSTS', 'Not set')}")
    print(f"  SECRET_KEY: {'Set' if os.environ.get('SECRET_KEY') else 'Not set'}")
    
    # Test Django setup
    print("\n🔍 Django Setup:")
    try:
        os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'richman_backend.settings')
        django.setup()
        print("✅ Django setup successful")
        
        from django.conf import settings
        print(f"  DEBUG: {settings.DEBUG}")
        print(f"  ALLOWED_HOSTS: {settings.ALLOWED_HOSTS}")
        print(f"  Database Engine: {settings.DATABASES['default']['ENGINE']}")
        
        # Test database connection
        from django.db import connection
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        print("✅ Database connection successful")
        
        # Test admin user
        from django.contrib.auth.models import User
        admin_user = User.objects.filter(username='admin').first()
        if admin_user:
            print(f"✅ Admin user exists: {admin_user.username}")
            print(f"  Is Superuser: {admin_user.is_superuser}")
            print(f"  Is Staff: {admin_user.is_staff}")
            print(f"  Is Active: {admin_user.is_active}")
        else:
            print("❌ Admin user not found")
            
    except Exception as e:
        print(f"❌ Django setup failed: {e}")
        import traceback
        traceback.print_exc()
    
    print("\n" + "=" * 50)
    print("🏁 Deployment test complete!")

if __name__ == "__main__":
    test_deployment_config()
