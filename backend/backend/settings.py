from pathlib import Path
import os


BASE_DIR = Path(__file__).resolve().parent.parent
SECRET_KEY = os.environ.get(
    'DJANGO_SECRET_KEY',
    'django-insecure-za@%ehva8zc+l++ue^597wq23tv3w=znvfa6yt49=t!=%!xbp2',
)


DEBUG = os.environ.get('DJANGO_DEBUG', 'True').lower() in ('1', 'true', 'yes')

ALLOWED_HOSTS = [
    h.strip()
    for h in os.environ.get(
        'DJANGO_ALLOWED_HOSTS', '127.0.0.1,localhost,172.20.10.3'
    ).split(',')
    if h.strip()
]

# Trust origins forwarded by nginx / Cloudflare (needed for admin POST/CSRF over HTTPS).
CSRF_TRUSTED_ORIGINS = [
    o.strip()
    for o in os.environ.get('DJANGO_CSRF_TRUSTED_ORIGINS', '').split(',')
    if o.strip()
]

# We sit behind nginx (and, in production, Cloudflare). Honour the forwarded
# scheme/host so absolute URLs and CSRF/HTTPS checks are correct.
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
USE_X_FORWARDED_HOST = True

CKEDITOR_5_CONFIGS = {
    'default': {
        'toolbar': [
            'heading', '|', 'bold', 'italic', 'underline', 'strikethrough', '|',
            'bulletedList', 'numberedList', '|',
            'outdent', 'indent', '|',
            'link', 'uploadImage', 'blockQuote', '|',
            'undo', 'redo'
        ],
        'image': {
            'toolbar': [
                'imageTextAlternative', '|',
                'imageStyle:alignLeft', 'imageStyle:alignCenter', 'imageStyle:alignRight'
            ],
            'styles': [
                'alignLeft', 'alignCenter', 'alignRight'
            ]
        },
        'heading': {
            'options': [
                { 'model': 'paragraph', 'title': 'Paragraph', 'class': 'ck-heading_paragraph' },
                { 'model': 'heading1', 'view': 'h1', 'title': 'Heading 1', 'class': 'ck-heading_heading1' },
                { 'model': 'heading2', 'view': 'h2', 'title': 'Heading 2', 'class': 'ck-heading_heading2' },
                { 'model': 'heading3', 'view': 'h3', 'title': 'Heading 3', 'class': 'ck-heading_heading3' }
            ]
        }
    }
}

CKEDITOR_5_FILE_STORAGE = "django.core.files.storage.FileSystemStorage"

INSTALLED_APPS = [
    'jazzmin',
    'website_app.apps.WebsiteAppConfig',
    'bot_app.apps.BotAppConfig',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django_ckeditor_5',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

STATICFILES_DIRS = [
    os.path.join(BASE_DIR, 'assets'),
]

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

WSGI_APPLICATION = 'backend.wsgi.application'


JAZZMIN_SETTINGS = {
    "site_title": "TURPAN Админка",
    "site_header": "TURPAN FITNESS",
    "site_brand": "TURPAN",
    "site_logo": "turpan_logo_small.png",
    "welcome_sign": "Добро пожаловать в панель управления TURPAN FITNESS",
    "copyright": "Turpan Fitness & Gym",
    "custom_css": "css/jazzmin-custom.css",
    "icons": {
        "auth": "fas fa-users-cog",
        "auth.user": "fas fa-user",
        "auth.Group": "fas fa-users",
        "website_app.SiteSettings": "fas fa-cogs",
        "website_app.SocialMedia": "fas fa-share-alt",
        "website_app.Advantage": "fas fa-star",
        "website_app.SectionCategory": "fas fa-tags",
        "website_app.Zone": "fas fa-map-marker-alt",
        "website_app.GalleryImage": "fas fa-images",
        "website_app.Review": "fas fa-comment-dots",
        "website_app.StuffCategory": "fas fa-sitemap",
        "website_app.TrainerSpecialization": "fas fa-filter",
        "website_app.Stuff": "fas fa-user-tie",
        "website_app.Section": "fas fa-dumbbell",
        "website_app.SectionSlot": "fas fa-calendar-alt",
        "website_app.SectionSlotException": "fas fa-calendar-times",
        "website_app.ClubCard": "fas fa-id-card",
        "website_app.News": "fas fa-newspaper",
        "website_app.Lead": "fas fa-inbox",
        "bot_app.BotUser": "fas fa-user-circle",
        "bot_app.FAQCategory": "fas fa-folder-open",
        "bot_app.FAQ": "fas fa-question-circle",
    },

    "sidebar_fixed": True,              
    "sidebar_nav_compact_style": False,   
    "sidebar_nav_legacy_style": False,
    "sidebar_nav_flat_style": True,   
    "navigation_expanded": False,         
    "changeform_format": "horizontal_tabs", 
    "order_with_respect_to": ["website_app", "bot_app", "auth"],
    "show_ui_builder": False,
    "show_theme_chooser": True,
}

JAZZMIN_UI_TWEAKS = {
    "body_small_text": False,
    "footer_small_text": False,
    "sidebar_nav_small_text": False,
    "layout_boxed": False,            
    "no_navbar_border": True,         
    "button_classes": {
        "primary": "btn-danger",
        "secondary": "btn-outline-light",
        "info": "btn-info",
        "warning": "btn-warning",
        "danger": "btn-danger",
        "success": "btn-success"
    },
    "theme": "flatly",
}


# When POSTGRES_DB is provided (Docker / production) use PostgreSQL — the shared
# database that the FastAPI backend and the Telegram bot also connect to.
# Falls back to the local SQLite file for bare-metal development.
if os.environ.get('POSTGRES_DB'):
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': os.environ['POSTGRES_DB'],
            'USER': os.environ.get('POSTGRES_USER', 'postgres'),
            'PASSWORD': os.environ.get('POSTGRES_PASSWORD', ''),
            'HOST': os.environ.get('POSTGRES_HOST', 'db'),
            'PORT': os.environ.get('POSTGRES_PORT', '5432'),
        }
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

LANGUAGE_CODE = 'ru'

TIME_ZONE = 'Asia/Bishkek'

USE_I18N = True

USE_TZ = True

CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://172.20.10.3:3000',
]