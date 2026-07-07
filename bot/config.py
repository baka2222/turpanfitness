import os
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent

load_dotenv(BASE_DIR / '.env')

BOT_TOKEN = os.getenv('BOT_TOKEN', '') or os.getenv('TELEGRAM_BOT_TOKEN', '')

# Prefer a full async SQLAlchemy URL (e.g. postgresql+asyncpg://...) when provided
# — this is the shared PostgreSQL database in Docker/production. Otherwise fall
# back to the local SQLite file used for bare-metal development.
DB_URL = os.getenv('DATABASE_URL', '')
if not DB_URL:
    _default_db = BASE_DIR.parent / 'backend' / 'db.sqlite3'
    DB_PATH = os.getenv('DB_PATH', str(_default_db))
    DB_URL = f'sqlite+aiosqlite:///{DB_PATH}'

DEFAULT_LANGUAGE = 'ru'
LANGUAGES = ('ru', 'en', 'kg')
