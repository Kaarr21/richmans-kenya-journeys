from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.db import connection
import os

class Command(BaseCommand):
    help = 'Create or update admin superuser'

    def handle(self, *args, **options):
        username = 'admin'
        email = 'karokin35@gmail.com'
        password = 'admin123'
        
        try:
            # Test database connection first
            self.stdout.write("🔍 Testing database connection...")
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
            self.stdout.write(self.style.SUCCESS("✅ Database connection successful"))
            
            # Check if user already exists
            if User.objects.filter(username=username).exists():
                self.stdout.write(f"User '{username}' already exists")
                user = User.objects.get(username=username)
                
                # Make sure it's a superuser
                if not user.is_superuser:
                    user.is_superuser = True
                    user.is_staff = True
                    user.save()
                    self.stdout.write(self.style.SUCCESS(f"Updated user '{username}' to superuser"))
                else:
                    self.stdout.write(f"User '{username}' is already a superuser")
                
                # Update password
                user.set_password(password)
                user.save()
                self.stdout.write(self.style.SUCCESS(f"Password updated for user '{username}'"))
            else:
                # Create new superuser
                user = User.objects.create_superuser(
                    username=username,
                    email=email,
                    password=password
                )
                self.stdout.write(self.style.SUCCESS(f"Superuser '{username}' created successfully!"))
            
            # Get the admin URL based on environment
            if os.environ.get('RENDER'):
                admin_url = "https://richmans-kenya-journeys-1.onrender.com/admin/"
            else:
                admin_url = "http://localhost:8000/admin/"
            
            self.stdout.write(f"\nLogin Credentials:")
            self.stdout.write(f"  Username: {username}")
            self.stdout.write(f"  Password: {password}")
            self.stdout.write(f"  Email: {email}")
            self.stdout.write(f"  Admin URL: {admin_url}")
            
            # Verify the user
            test_user = User.objects.get(username=username)
            self.stdout.write(f"\nUser Verification:")
            self.stdout.write(f"  Username: {test_user.username}")
            self.stdout.write(f"  Email: {test_user.email}")
            self.stdout.write(f"  Is Superuser: {test_user.is_superuser}")
            self.stdout.write(f"  Is Staff: {test_user.is_staff}")
            self.stdout.write(f"  Is Active: {test_user.is_active}")
            
            if test_user.is_superuser and test_user.is_staff and test_user.is_active:
                self.stdout.write(self.style.SUCCESS("✅ Admin user is properly configured!"))
            else:
                self.stdout.write(self.style.ERROR("❌ Admin user configuration is incomplete!"))
                
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"❌ Error creating admin user: {e}"))
            self.stdout.write("This might be due to database connection issues during deployment.")
            raise
