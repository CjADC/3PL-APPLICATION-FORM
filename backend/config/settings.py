from pathlib import Path
import os
import dj_database_url

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY') or os.environ.get('SECRET_KEY', 'dev-secret-key')
DEBUG = os.environ.get('DEBUG', 'False').lower() in ('1', 'true', 'yes')
ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', '*').split(',')

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'recruitment',
    'corsheaders',
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

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
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

WSGI_APPLICATION = 'config.wsgi.application'

# --- Database -----------------------------------------------------------
# Shared Aiven PostgreSQL database (same DB as the Capstone CJ / 3PL system).
# DATABASE_URL must be set as an Environment Variable in the Render dashboard.
# No local .env file or SQLite fallback: this app is deployment-only.
_DATABASE_URL = os.environ.get('DATABASE_URL', '').strip()
if not _DATABASE_URL:
    raise RuntimeError(
        "DATABASE_URL environment variable is not set. "
        "This application runs on Render only — set DATABASE_URL in the Render dashboard."
    )

_ssl_in_url = 'sslmode=' in _DATABASE_URL
_DB_SSL_REQUIRE = os.environ.get('DB_SSL_REQUIRE', 'True').lower() in ('1', 'true', 'yes')
_CONN_MAX_AGE = int(os.environ.get('CONN_MAX_AGE', '600'))

DATABASES = {
    'default': dj_database_url.config(
        default=_DATABASE_URL,
        conn_max_age=_CONN_MAX_AGE,
        ssl_require=False if _ssl_in_url else _DB_SSL_REQUIRE,
    )
}

AUTH_PASSWORD_VALIDATORS = []

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',
    ]
}

# CORS — allow requests from deployed frontends (configurable via environment)
_cors_env = os.environ.get('CORS_ALLOWED_ORIGINS', '')
if _cors_env:
    CORS_ALLOWED_ORIGINS = [origin.strip() for origin in _cors_env.split(',') if origin.strip()]
else:
    CORS_ALLOWED_ORIGINS = [
        'https://application-form-by-cj.vercel.app',
    ]

_cors_regex_env = os.environ.get('CORS_ALLOWED_ORIGIN_REGEXES', '')
if _cors_regex_env:
    CORS_ALLOWED_ORIGIN_REGEXES = [r.strip() for r in _cors_regex_env.split(',') if r.strip()]

CORS_ALLOW_ALL_ORIGINS = False

CSRF_TRUSTED_ORIGINS = [
    'https://*.onrender.com',
    'https://*.vercel.app',
    'https://application-form-by-cj.vercel.app',
]
