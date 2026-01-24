"""
Centralized Configuration Management for Ingredient.AI Backend
Fetch all environment variables from this file instead of directly using os.getenv()
"""

import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# --- Core Paths ---
BASE_DIR = Path(__file__).resolve().parent.parent

# --- Django Core Settings ---
SECRET_KEY = os.getenv('SECRET_KEY')
DEBUG = os.getenv('DEBUG', 'True').lower() == 'true'
ALLOWED_HOSTS = ["*"]
ROOT_URLCONF = 'ingredient_analysis.urls'
WSGI_APPLICATION = 'ingredient_analysis.wsgi.application'
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# --- Database Configuration ---
DB_ENGINE = 'django.db.backends.postgresql'
DB_NAME = os.getenv('DB_NAME')
DB_USER = os.getenv('DB_USER')
DB_PASSWORD = os.getenv('DB_PASSWORD')
DB_HOST = os.getenv('DB_HOST')
DB_PORT = int(os.getenv('DB_PORT', 5432))

# --- Cloudinary Configuration ---
CLOUDINARY_CLOUD_NAME = os.getenv('CLOUDINARY_CLOUD_NAME')
CLOUDINARY_API_KEY = os.getenv('CLOUDINARY_API_KEY')
CLOUDINARY_API_SECRET = os.getenv('CLOUDINARY_API_SECRET')

# --- Redis Configuration ---
REDIS_HOST = os.getenv('REDIS_HOST', 'localhost')
REDIS_PORT = int(os.getenv('REDIS_PORT', 6379))
REDIS_DB = int(os.getenv('REDIS_DB', 0))

# --- AI Service Configuration ---
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')

# --- JWT Configuration ---
ACCESS_TOKEN_LIFETIME_MINUTES = 15
REFRESH_TOKEN_LIFETIME_DAYS = 7
JWT_ALGORITHM = 'HS256'
JWT_AUTH_HEADER_TYPE = 'Bearer'

# --- File Storage ---
STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# --- Internationalization ---
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# --- API Configuration ---
DEFAULT_PAGINATION_PAGE_SIZE = 10
