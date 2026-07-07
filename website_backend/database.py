from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session

from config import settings

_connect_args = {"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(settings.DATABASE_URL, connect_args=_connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Session:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


_MIGRATIONS = [
    "ALTER TABLE website_app_sitesettings ADD COLUMN phone VARCHAR",
    "ALTER TABLE website_app_sitesettings ADD COLUMN whatsapp_phone VARCHAR",
]


def run_migrations() -> None:
    # Each statement runs in its own transaction so that a failure (e.g. the
    # column already exists — Django owns the schema and normally creates it)
    # does not poison the connection on PostgreSQL, where an aborted
    # transaction blocks every subsequent statement until rollback.
    for stmt in _MIGRATIONS:
        try:
            with engine.begin() as conn:
                conn.execute(text(stmt))
        except Exception:
            pass
