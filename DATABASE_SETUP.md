# Database Setup Guide ✅

## PostgreSQL Database Created

You've successfully created a PostgreSQL database with the following configuration:

### **Database Details**
- **Database Name:** `richmanstoursdb`
- **Username:** `Karoki`
- **Password:** `Karokin35!`
- **Host:** `localhost` (or your server host)
- **Port:** `5432`

## Django Configuration Updated

I've updated the Django settings to use your PostgreSQL database:

### **Local Development**
```python
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": "richmanstoursdb",
        "USER": "Karoki",
        "PASSWORD": "Karokin35!",
        "HOST": "localhost",
        "PORT": "5432",
    }
}
```

### **Production (Render)**
- Uses `DATABASE_URL` environment variable
- Automatically configured in `render.yaml`

## Setup Steps

### **1. Local Development Setup**

Create a `.env` file in your project root:
```bash
# Django Settings
SECRET_KEY=your-secret-key-here
DEBUG=True

# Database Configuration
DATABASE_NAME=richmanstoursdb
DATABASE_USER=Karoki
DATABASE_PASSWORD=Karokin35!
DATABASE_HOST=localhost
DATABASE_PORT=5432

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=karokin35@gmail.com
EMAIL_HOST_PASSWORD=dscq pqoy xreg xuyz

# CORS Configuration
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000,http://127.0.0.1:5173
```

### **2. Run Database Setup**

```bash
# Install Python dependencies
pip install -r requirements.txt

# Run the database setup script
python setup_database.py
```

This will:
- Run Django migrations
- Create the admin user
- Set up all database tables

### **3. Start the Development Server**

```bash
# Start Django backend
python manage.py runserver

# In another terminal, start React frontend
npm run dev
```

## Admin Access

After running the setup script, you can access the Django admin:

- **URL:** `http://localhost:8000/admin/`
- **Username:** `admin`
- **Password:** `admin123`

## Production Deployment

For production deployment on Render:

1. **Push your changes** to the repository
2. **Deploy to Render** - it will automatically:
   - Use the Render PostgreSQL database
   - Run migrations
   - Create admin user
   - Build and deploy the application

## Database Tables Created

The following tables will be created:

### **Django Core Tables**
- `auth_user` - User accounts
- `auth_group` - User groups
- `django_session` - User sessions
- `django_migrations` - Migration history

### **Application Tables**
- `bookings_booking` - Tour bookings
- `locations_location` - Tour locations
- `locations_locationimage` - Location images
- `tours_tour` - Tour schedules
- `authentication_profile` - User profiles

## Troubleshooting

### **Connection Issues**
If you get database connection errors:

1. **Check PostgreSQL is running:**
   ```bash
   sudo systemctl status postgresql
   ```

2. **Check database exists:**
   ```bash
   psql -U Karoki -d richmanstoursdb -c "\dt"
   ```

3. **Test connection:**
   ```bash
   psql -U Karoki -d richmanstoursdb -h localhost
   ```

### **Permission Issues**
If you get permission errors:

```bash
# Grant additional permissions
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE richmanstoursdb TO Karoki;"
psql -U postgres -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO Karoki;"
psql -U postgres -c "GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO Karoki;"
```

## Next Steps

1. **Run the setup script** to initialize the database
2. **Test the admin login** at `http://localhost:8000/admin/`
3. **Deploy to production** when ready
4. **Change the admin password** for security

Your PostgreSQL database is now properly configured for the Django application! 🎉
