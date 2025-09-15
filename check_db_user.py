#!/usr/bin/env python3
"""
Check database user and permissions
"""
import psycopg2
import os

def check_database_user():
    print("🔍 Checking Database User and Permissions...")
    
    # Try both cases for username
    usernames = ['Karoki', 'karoki']
    
    for username in usernames:
        print(f"\n📋 Testing username: '{username}'")
        
        db_params = {
            'host': 'localhost',
            'port': '5432',
            'database': 'richmanstoursdb',
            'user': username,
            'password': 'Karokin35!'
        }
        
        try:
            conn = psycopg2.connect(**db_params)
            print(f"✅ Connection successful with username '{username}'")
            
            cursor = conn.cursor()
            
            # Check user permissions
            cursor.execute("""
                SELECT 
                    usename,
                    usesuper,
                    usecreatedb,
                    usebypassrls
                FROM pg_user 
                WHERE usename = %s
            """, (username,))
            
            user_info = cursor.fetchone()
            if user_info:
                print(f"   User: {user_info[0]}")
                print(f"   Superuser: {user_info[1]}")
                print(f"   Can create databases: {user_info[2]}")
                print(f"   Can bypass RLS: {user_info[3]}")
            
            # Check database permissions
            cursor.execute("""
                SELECT 
                    datname,
                    datacl
                FROM pg_database 
                WHERE datname = 'richmanstoursdb'
            """)
            
            db_info = cursor.fetchone()
            if db_info:
                print(f"   Database: {db_info[0]}")
                print(f"   Permissions: {db_info[1]}")
            
            cursor.close()
            conn.close()
            
            print(f"✅ Username '{username}' is working correctly!")
            return username
            
        except psycopg2.Error as e:
            print(f"❌ Connection failed with username '{username}': {e}")
            continue
    
    print("\n❌ No working username found. Please check your database setup.")
    return None

if __name__ == "__main__":
    working_username = check_database_user()
    if working_username:
        print(f"\n🎯 Use username '{working_username}' in your Django settings")
    else:
        print("\n🔧 You may need to recreate the database user with the correct case")
