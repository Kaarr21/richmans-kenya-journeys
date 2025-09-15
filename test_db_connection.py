#!/usr/bin/env python3
"""
Simple database connection test
"""
import psycopg2
import os

def test_postgres_connection():
    print("🔍 Testing PostgreSQL Connection...")
    
    # Database connection parameters
    db_params = {
        'host': 'localhost',
        'port': '5432',
        'database': 'richmanstoursdb',
        'user': 'karoki',  # Note: lowercase as per your change
        'password': 'Karokin35!'
    }
    
    try:
        # Test connection
        print(f"Connecting to database: {db_params['database']}")
        print(f"User: {db_params['user']}")
        print(f"Host: {db_params['host']}:{db_params['port']}")
        
        conn = psycopg2.connect(**db_params)
        print("✅ Database connection successful!")
        
        # Test query
        cursor = conn.cursor()
        cursor.execute('SELECT version();')
        version = cursor.fetchone()
        print(f"✅ PostgreSQL version: {version[0]}")
        
        # List tables
        cursor.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        """)
        tables = cursor.fetchall()
        print(f"✅ Found {len(tables)} tables:")
        for table in tables:
            print(f"   - {table[0]}")
        
        cursor.close()
        conn.close()
        print("✅ Database connection test completed successfully!")
        
    except psycopg2.Error as e:
        print(f"❌ Database connection failed: {e}")
        print("\n🔧 Troubleshooting tips:")
        print("1. Make sure PostgreSQL is running")
        print("2. Check if the database 'richmanstoursdb' exists")
        print("3. Verify user 'karoki' has proper permissions")
        print("4. Check if the password is correct")
        
    except Exception as e:
        print(f"❌ Unexpected error: {e}")

if __name__ == "__main__":
    test_postgres_connection()
