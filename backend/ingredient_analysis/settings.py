from pathlib import Path
from datetime import timedelta
import sys

# Add the parent directory to the path to import config module
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from config.configuration import (
    BASE_DIR, SECRET_KEY, DEBUG, ALLOWED_HOSTS, ROOT_URLCONF,
    WSGI_APPLICATION, DEFAULT_AUTO_FIELD
)


# --- Application Definitions ---
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third-party apps
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'drf_spectacular',
    'cloudinary',
    'cloudinary_storage',

    # Local apps
    'ingredient_analysis_app',
    'medical_history',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]


# --- Database Configuration ---
from config.configuration import DB_ENGINE, DB_NAME, DB_USER, DB_PASSWORD, DB_HOST, DB_PORT

DATABASES = {
    'default': {
        'ENGINE': DB_ENGINE,
        'NAME': DB_NAME,
        'USER': DB_USER,
        'PASSWORD': DB_PASSWORD,
        'HOST': DB_HOST,
        'PORT': DB_PORT
    }
}


# --- Static and Media File Configuration ---
from config.configuration import (
    STATIC_URL, STATIC_ROOT, STATICFILES_STORAGE,
    CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
)

STATIC_URL = STATIC_URL
STATIC_ROOT = STATIC_ROOT
STATICFILES_STORAGE = STATICFILES_STORAGE

# Media files will be handled by cloudinary python SDK directly
# Configure in models or views as needed


# --- Template Configuration ---
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]


# --- Internationalization ---
from config.configuration import LANGUAGE_CODE, TIME_ZONE, USE_I18N, USE_TZ

LANGUAGE_CODE = LANGUAGE_CODE
TIME_ZONE = TIME_ZONE
USE_I18N = USE_I18N
USE_TZ = USE_TZ


# --- Password Validation ---
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]


# --- DRF, JWT, and API Settings ---
from config.configuration import (
    ACCESS_TOKEN_LIFETIME_MINUTES, REFRESH_TOKEN_LIFETIME_DAYS,
    JWT_ALGORITHM, JWT_AUTH_HEADER_TYPE, DEFAULT_PAGINATION_PAGE_SIZE
)

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': ['rest_framework.permissions.IsAuthenticated'],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': DEFAULT_PAGINATION_PAGE_SIZE,
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
    'DEFAULT_PARSER_CLASSES': [
        'rest_framework.parsers.JSONParser',
        'rest_framework.parsers.MultiPartParser',
        'rest_framework.parsers.FormParser',
    ]
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=ACCESS_TOKEN_LIFETIME_MINUTES),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=REFRESH_TOKEN_LIFETIME_DAYS),
    'ROTATE_REFRESH_TOKENS': True,
    'SIGNING_KEY': SECRET_KEY,
    'ALGORITHM': JWT_ALGORITHM,
    'AUTH_HEADER_TYPES': (JWT_AUTH_HEADER_TYPE,),
}

# In production, set CORS_ALLOW_ALL_ORIGINS to False and configure CORS_ALLOWED_ORIGINS
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True

SPECTACULAR_SETTINGS = {
    'TITLE': 'Ingredient Analysis API',
    'DESCRIPTION': 'API for analyzing ingredients with OCR and medical history integration',
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
}
