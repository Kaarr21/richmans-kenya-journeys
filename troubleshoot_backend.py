#!/usr/bin/env python3
"""
Comprehensive backend troubleshooting script
"""
import os
import sys
import django
import traceback

# Add the project directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def test_django_setup():
    print("🔍 Testing Django Setup...")
    try:
        # Set up Django
        os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'richman_backend.settings')
        django.setup()
        print("✅ Django setup successful")
        return True
    except Exception as e:
        print(f"❌ Django setup failed: {e}")
        traceback.print_exc()
        return False

def test_database_connection():
    print("\n🗄️ Testing Database Connection...")
    try:
        from django.db import connection
        from django.conf import settings
        
        print(f"Database Engine: {settings.DATABASES['default']['ENGINE']}")
        print(f"Database Name: {settings.DATABASES['default']['NAME']}")
        print(f"Database User: {settings.DATABASES['default']['USER']}")
        print(f"Database Host: {settings.DATABASES['default']['HOST']}")
        print(f"Database Port: {settings.DATABASES['default']['PORT']}")
        
        # Test connection
        with connection.cursor() as cursor:
            cursor.execute('SELECT 1')
            result = cursor.fetchone()
            print(f"✅ Database connection successful: {result}")
        
        # Test if tables exist
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public'
            """)
            tables = cursor.fetchall()
            print(f"✅ Found {len(tables)} tables in database")
            for table in tables:
                print(f"   - {table[0]}")
        
        return True
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        traceback.print_exc()
        return False

def test_user_creation():
    print("\n👤 Testing User Creation...")
    try:
        from django.contrib.auth.models import User
        
        # Check existing users
        users = User.objects.all()
        print(f"Found {users.count()} existing users:")
        for user in users:
            print(f"   - {user.username} (superuser: {user.is_superuser}, staff: {user.is_staff}, active: {user.is_active})")
        
        # Create or update admin user
        username = 'admin'
        email = 'karokin35@gmail.com'
        password = 'admin123'
        
        if User.objects.filter(username=username).exists():
            user = User.objects.get(username=username)
            print(f"✅ User '{username}' already exists")
            
            # Update to superuser if needed
            if not user.is_superuser:
                user.is_superuser = True
                user.is_staff = True
                user.save()
                print(f"✅ Updated user '{username}' to superuser")
            
            # Update password
            user.set_password(password)
            user.save()
            print(f"✅ Password updated for user '{username}'")
        else:
            user = User.objects.create_superuser(
                username=username,
                email=email,
                password=password
            )
            print(f"✅ Created superuser '{username}'")
        
        # Verify user
        test_user = User.objects.get(username=username)
        print(f"\n🔍 User Verification:")
        print(f"   Username: {test_user.username}")
        print(f"   Email: {test_user.email}")
        print(f"   Is Superuser: {test_user.is_superuser}")
        print(f"   Is Staff: {test_user.is_staff}")
        print(f"   Is Active: {test_user.is_active}")
        
        return True
    except Exception as e:
        print(f"❌ User creation failed: {e}")
        traceback.print_exc()
        return False

def test_api_endpoints():
    print("\n🌐 Testing API Endpoints...")
    try:
        from django.test import Client
        from django.urls import reverse
        
        client = Client()
        
        # Test health endpoint
        try:
            response = client.get('/health/')
            print(f"✅ Health endpoint: {response.status_code}")
        except Exception as e:
            print(f"❌ Health endpoint failed: {e}")
        
        # Test API endpoints
        api_endpoints = [
            '/api/locations/',
            '/api/bookings/',
            '/api/tours/',
        ]
        
        for endpoint in api_endpoints:
            try:
                response = client.get(endpoint)
                print(f"✅ {endpoint}: {response.status_code}")
            except Exception as e:
                print(f"❌ {endpoint} failed: {e}")
        
        return True
    except Exception as e:
        print(f"❌ API testing failed: {e}")
        traceback.print_exc()
        return False

def test_admin_access():
    print("\n🔐 Testing Admin Access...")
    try:
        from django.test import Client
        from django.contrib.auth.models import User
        
        client = Client()
        
        # Test admin login page
        response = client.get('/admin/')
        print(f"✅ Admin page access: {response.status_code}")
        
        # Test admin login
        username = 'admin'
        password = 'admin123'
        
        # Try to login
        response = client.post('/admin/login/', {
            'username': username,
            'password': password,
        })
        print(f"✅ Admin login attempt: {response.status_code}")
        
        if response.status_code == 302:  # Redirect means successful login
            print("✅ Admin login successful!")
        else:
            print("❌ Admin login failed")
            print(f"Response content: {response.content.decode()[:200]}...")
        
        return True
    except Exception as e:
        print(f"❌ Admin access testing failed: {e}")
        traceback.print_exc()
        return False

def main():
    print("🚀 Backend Troubleshooting Script")
    print("=" * 50)
    
    # Test Django setup
    if not test_django_setup():
        print("\n❌ Django setup failed. Cannot continue.")
        return
    
    # Test database connection
    if not test_database_connection():
        print("\n❌ Database connection failed. Check your database configuration.")
        return
    
    # Test user creation
    if not test_user_creation():
        print("\n❌ User creation failed. Check database permissions.")
        return
    
    # Test API endpoints
    test_api_endpoints()
    
    # Test admin access
    test_admin_access()
    
    print("\n" + "=" * 50)
    print("🏁 Troubleshooting complete!")
    print("\n📋 Summary:")
    print("   - Django setup: ✅")
    print("   - Database connection: ✅")
    print("   - User creation: ✅")
    print("   - Admin credentials: admin / admin123")
    print("   - Admin URL: http://localhost:8000/admin/")

if __name__ == "__main__":
    main()
