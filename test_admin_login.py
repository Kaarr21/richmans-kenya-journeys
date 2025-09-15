#!/usr/bin/env python3
"""
Test admin login functionality
"""
import os
import sys
import django

# Add the project directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def test_admin_login():
    print("🔐 Testing Admin Login")
    print("=" * 40)
    
    try:
        # Set up Django
        os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'richman_backend.settings')
        django.setup()
        
        # Import after Django setup
        from django.test import Client
        from django.contrib.auth.models import User
        
        # Create test client
        client = Client()
        
        # Test admin page access
        print("🔍 Testing admin page access...")
        response = client.get('/admin/')
        print(f"  Admin page status: {response.status_code}")
        
        if response.status_code in [200, 302]:  # 302 is redirect to login, which is expected
            print("✅ Admin page accessible (redirects to login as expected)")
        else:
            print("❌ Admin page not accessible")
            return
        
        # Test login page
        print("\n🔍 Testing login page...")
        response = client.get('/admin/login/')
        print(f"  Login page status: {response.status_code}")
        
        if response.status_code == 200:
            print("✅ Login page accessible")
        else:
            print("❌ Login page not accessible")
            return
        
        # Test admin login
        print("\n🔍 Testing admin login...")
        login_data = {
            'username': 'admin',
            'password': 'admin123'
        }
        
        response = client.post('/admin/login/', login_data, follow=True)
        print(f"  Login response status: {response.status_code}")
        
        if response.status_code == 200:
            # Check if we're redirected to admin dashboard
            if hasattr(response, 'url'):
                if '/admin/' in response.url and 'login' not in response.url:
                    print("✅ Admin login successful!")
                    print("✅ Redirected to admin dashboard")
                else:
                    print("❌ Login failed - not redirected to dashboard")
                    print(f"  Redirected to: {response.url}")
            else:
                # Check if we can access admin content
                if 'Django administration' in str(response.content):
                    print("✅ Admin login successful!")
                    print("✅ Accessing admin dashboard")
                else:
                    print("❌ Login failed - not accessing admin dashboard")
        else:
            print("❌ Login failed")
        
        # Test admin user exists
        print("\n🔍 Checking admin user...")
        admin_user = User.objects.filter(username='admin').first()
        if admin_user:
            print(f"✅ Admin user exists: {admin_user.username}")
            print(f"  Is Superuser: {admin_user.is_superuser}")
            print(f"  Is Staff: {admin_user.is_staff}")
            print(f"  Is Active: {admin_user.is_active}")
            
            # Test password
            if admin_user.check_password('admin123'):
                print("✅ Password is correct")
            else:
                print("❌ Password is incorrect")
        else:
            print("❌ Admin user not found")
            
    except Exception as e:
        print(f"❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
    
    print("\n" + "=" * 40)
    print("🏁 Admin login test complete!")

if __name__ == "__main__":
    test_admin_login()
