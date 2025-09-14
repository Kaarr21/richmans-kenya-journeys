# richman_backend/settings.py - FIXED for production

import dj_database_url
import os
from decouple import config
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = config("SECRET_KEY")
DEBUG = config("DEBUG", default=False, cast=bool)

# FIXED: Ensure proper allowed hosts
allowed_hosts_str = config("ALLOWED_HOSTS", default="localhost")
ALLOWED_HOSTS = [host.strip() for host in allowed_hosts_str.split(",") if host.strip()]

# Add render domains
if os.environ.get('RENDER'):
    ALLOWED_HOSTS.extend([
        'richmans-kenya-journeys-1.onrender.com',
        '.onrender.com',
    ])

print(f"DEBUG: {DEBUG}")
print(f"ALLOWED_HOSTS: {ALLOWED_HOSTS}")

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "django.contrib.sitemaps",
    "rest_framework",
    "rest_framework.authtoken",
    "corsheaders",
    "django_filters",
    "authentication",
    "bookings",
    "locations",
    "tours",
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "richman_backend.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "staticfiles"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "richman_backend.wsgi.application"

# Database
if "DATABASE_URL" in os.environ:
    DATABASES = {
        "default": dj_database_url.parse(
            os.environ.get("DATABASE_URL"),
            conn_max_age=600,
            conn_health_checks=True,
        )
    }
    print("Using production database")
else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.postgresql",
            "NAME": config("DATABASE_NAME"),
            "USER": config("DATABASE_USER"),
            "PASSWORD": config("DATABASE_PASSWORD"),
            "HOST": config("DATABASE_HOST"),
            "PORT": config("DATABASE_PORT", default="5433"),
        }
    }
    print("Using local database")

# REST Framework
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework.authentication.TokenAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.AllowAny",
    ],
    "DEFAULT_FILTER_BACKENDS": [
        "django_filters.rest_framework.DjangoFilterBackend",
        "rest_framework.filters.OrderingFilter",
        "rest_framework.filters.SearchFilter",
    ],
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 20,
}

# CORS Configuration - Simplified for reliability
if DEBUG:
    CORS_ALLOW_ALL_ORIGINS = True
    print("Development: CORS allow all origins")
else:
    # Production CORS - Simplified
    CORS_ALLOWED_ORIGINS = [
        "https://richmans-kenya-journeys-1.onrender.com",
    ]
    
    # Add from environment if set
    cors_origins_str = config("CORS_ALLOWED_ORIGINS", default="")
    if cors_origins_str:
        additional_origins = [origin.strip() for origin in cors_origins_str.split(",") if origin.strip()]
        CORS_ALLOWED_ORIGINS.extend(additional_origins)
    
    # CSRF trusted origins
    CSRF_TRUSTED_ORIGINS = CORS_ALLOWED_ORIGINS.copy()
    
    # Simplified CORS settings
    CORS_ALLOW_CREDENTIALS = False
    CORS_ALLOW_ALL_HEADERS = True  # Simplified for reliability
    CORS_ALLOW_ALL_METHODS = True  # Simplified for reliability
    
    # Security settings - Simplified
    SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
    SECURE_SSL_REDIRECT = False  # Disabled to prevent redirect loops
    CSRF_COOKIE_SECURE = False   # Disabled for Render compatibility
    SESSION_COOKIE_SECURE = False # Disabled for Render compatibility
    
    print(f"Production CORS origins: {CORS_ALLOWED_ORIGINS}")

# Static files configuration - Simplified
STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

# Staticfiles dirs
STATICFILES_DIRS = []
if (BASE_DIR / "dist").exists():
    STATICFILES_DIRS.append(BASE_DIR / "dist")

# Simplified WhiteNoise configuration
if DEBUG:
    STATICFILES_STORAGE = "django.contrib.staticfiles.storage.StaticFilesStorage"
else:
    STATICFILES_STORAGE = "whitenoise.storage.CompressedStaticFilesStorage"  # Simplified

WHITENOISE_USE_FINDERS = True
WHITENOISE_AUTOREFRESH = DEBUG

# Media files - PRODUCTION FIX
MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

# Ensure media directories exist
MEDIA_ROOT.mkdir(exist_ok=True)
(MEDIA_ROOT / "locations").mkdir(exist_ok=True)

# File upload settings
FILE_UPLOAD_MAX_MEMORY_SIZE = 10 * 1024 * 1024  # 10MB
DATA_UPLOAD_MAX_MEMORY_SIZE = 10 * 1024 * 1024
FILE_UPLOAD_PERMISSIONS = 0o644
FILE_UPLOAD_DIRECTORY_PERMISSIONS = 0o755

# Email configuration
EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
EMAIL_HOST = config("EMAIL_HOST")
EMAIL_PORT = config("EMAIL_PORT", cast=int)
EMAIL_USE_TLS = config("EMAIL_USE_TLS", cast=bool)
EMAIL_HOST_USER = config("EMAIL_HOST_USER")
EMAIL_HOST_PASSWORD = config("EMAIL_HOST_PASSWORD")

# General settings
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
LANGUAGE_CODE = "en-us"
TIME_ZONE = "Africa/Nairobi"
USE_I18N = True
USE_TZ = True

# Enhanced logging for debugging
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "verbose": {
            "format": "{levelname} {asctime} {module} {message}",
            "style": "{",
        },
    },
    "handlers": {
        "console": {
            "level": "INFO",
            "class": "logging.StreamHandler", 
            "formatter": "verbose",
        },
    },
    "root": {
        "handlers": ["console"],
        "level": "INFO",
    },
    "loggers": {
        "django": {
            "handlers": ["console"],
            "level": "INFO",
            "propagate": False,
        },
        "corsheaders": {
            "handlers": ["console"],
            "level": "DEBUG" if DEBUG else "INFO",
            "propagate": False,
        },
    },
}

print("Settings loaded successfully")
print(f"Static URL: {STATIC_URL}")
print(f"Static Root: {STATIC_ROOT}")
print(f"Media URL: {MEDIA_URL}")
print(f"Media Root: {MEDIA_ROOT}")