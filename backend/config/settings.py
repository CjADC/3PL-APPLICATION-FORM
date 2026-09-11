from pathlib import Path
import os
import dj_database_url

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY', 'dev-secret-key')
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

# ─── Database ─────────────────────────────────────────────────────────────────
# Shared PostgreSQL database with the Final Copy 3PL system.
# Applications submitted here appear instantly in the Final Copy dashboard.
_env_file = BASE_DIR / '.env'
if _env_file.exists() and not os.environ.get('DATABASE_URL'):
    for _line in _env_file.read_text(encoding='utf-8').splitlines():
        if _line.strip().startswith('DATABASE_URL='):
            os.environ['DATABASE_URL'] = _line.strip().split('=', 1)[1].strip()
            break

_DATABASE_URL = os.environ.get('DATABASE_URL', '').strip()
if not _DATABASE_URL:
    _DATABASE_URL = f'sqlite:///{BASE_DIR / "db.sqlite3"}'
_ssl_in_url = 'sslmode=' in _DATABASE_URL
_DB_SSL_REQUIRE = os.environ.get('DB_SSL_REQUIRE', 'True').lower() in ('1', 'true', 'yes')

DATABASES = {
    'default': dj_database_url.config(
        default=_DATABASE_URL,
        conn_max_age=600,
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

# CORS (allow dev and production origins)
CORS_ALLOW_ALL_ORIGINS = True

CSRF_TRUSTED_ORIGINS = [
    'https://*.onrender.com',
    'https://*.vercel.app',
    'https://application-form-by-cj.vercel.app',
]
