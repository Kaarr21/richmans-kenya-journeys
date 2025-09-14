#!/usr/bin/env python3
"""
Simple script to test if the Django backend is working
"""
import requests
import sys

def test_backend():
    base_url = "https://richmans-kenya-journeys-1.onrender.com"
    
    print("🔍 Testing Django Backend...")
    print(f"Base URL: {base_url}")
    
    # Test health endpoint
    try:
        print("\n1. Testing health endpoint...")
        response = requests.get(f"{base_url}/health/", timeout=10)
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.text}")
        if response.status_code == 200:
            print("   ✅ Health endpoint working")
        else:
            print("   ❌ Health endpoint failed")
    except Exception as e:
        print(f"   ❌ Health endpoint error: {e}")
    
    # Test API endpoints
    try:
        print("\n2. Testing API endpoints...")
        response = requests.get(f"{base_url}/api/locations/", timeout=10)
        print(f"   Locations API Status: {response.status_code}")
        if response.status_code in [200, 401]:  # 401 is expected without auth
            print("   ✅ Locations API accessible")
        else:
            print("   ❌ Locations API failed")
    except Exception as e:
        print(f"   ❌ Locations API error: {e}")
    
    # Test authentication endpoint
    try:
        print("\n3. Testing authentication endpoint...")
        response = requests.post(f"{base_url}/api/auth/login/", 
                               json={"email": "test@test.com", "password": "test"},
                               timeout=10)
        print(f"   Auth API Status: {response.status_code}")
        if response.status_code in [400, 401]:  # Expected for invalid credentials
            print("   ✅ Auth API accessible")
        else:
            print("   ❌ Auth API failed")
    except Exception as e:
        print(f"   ❌ Auth API error: {e}")
    
    print("\n🏁 Backend test complete!")

if __name__ == "__main__":
    test_backend()
