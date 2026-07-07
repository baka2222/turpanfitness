from fastapi import Query, Request
from sqlalchemy.orm import Session

from database import get_db

_VALID_LANGS = {"ru", "en", "kg"}


def lang_dep(lang: str = Query(default="ru", description="Язык ответа")) -> str:
    lang = lang.strip().strip(":")
    if lang not in _VALID_LANGS:
        return "ru"
    return lang


def media_url(request: Request, path: str | None) -> str | None:
    if not path:
        return None
    base = str(request.base_url).rstrip("/")
    return f"{base}/media/{path}"
