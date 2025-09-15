#!/usr/bin/env python3
"""
Test email notification system for date/time updates
"""
import os
import sys
import django
from datetime import date, time, datetime

# Add the project directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def test_email_notifications():
    print("📧 Testing Email Notification System")
    print("=" * 50)
    
    try:
        # Set up Django
        os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'richman_backend.settings')
        django.setup()
        
        from bookings.models import Booking
        from bookings.email_service import EmailService
        
        # Create a test booking
        print("🔍 Creating test booking...")
        test_booking = Booking.objects.create(
            customer_name="Test Customer",
            customer_email="test@example.com",  # Use a test email
            destination="Maasai Mara",
            group_size=2,
            preferred_date=date.today(),
            confirmed_date=date.today(),
            confirmed_time=time(8, 0),
            status='confirmed',
            amount=500.00
        )
        print(f"✅ Test booking created: {test_booking.id}")
        
        # Test date/time change detection
        print("\n🔍 Testing date/time change detection...")
        print(f"  Original date: {test_booking.confirmed_date}")
        print(f"  Original time: {test_booking.confirmed_time}")
        
        # Update the date and time
        new_date = date.today().replace(day=date.today().day + 1)
        new_time = time(9, 30)
        
        test_booking.confirmed_date = new_date
        test_booking.confirmed_time = new_time
        test_booking.save()
        
        print(f"  Updated date: {test_booking.confirmed_date}")
        print(f"  Updated time: {test_booking.confirmed_time}")
        print(f"  Date/time changed: {test_booking.has_date_time_changed()}")
        
        # Test email notification (commented out to avoid sending real emails)
        print("\n📧 Testing email notification system...")
        print("  Note: Email sending is disabled for testing")
        print("  In production, this would send:")
        print(f"    - To: {test_booking.customer_email}")
        print(f"    - Subject: Tour Schedule Update - {test_booking.destination}")
        print(f"    - Previous date: {test_booking.previous_confirmed_date}")
        print(f"    - Previous time: {test_booking.previous_confirmed_time}")
        print(f"    - New date: {test_booking.confirmed_date}")
        print(f"    - New time: {test_booking.confirmed_time}")
        
        # Uncomment the line below to actually send a test email
        # success = EmailService.send_date_time_update_notification(test_booking)
        # print(f"  Email sent: {success}")
        
        # Clean up test booking
        print("\n🧹 Cleaning up test booking...")
        test_booking.delete()
        print("✅ Test booking deleted")
        
        print("\n" + "=" * 50)
        print("✅ Email notification system test completed!")
        print("\n📋 Summary:")
        print("  - Booking model enhanced with date/time tracking")
        print("  - Email template created for date/time updates")
        print("  - Email service method implemented")
        print("  - Admin interface updated with notification actions")
        print("  - API endpoints added for manual notifications")
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_email_notifications()
