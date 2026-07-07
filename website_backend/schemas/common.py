from typing import Any


def loc(obj: Any, field: str, lang: str) -> str:
    value = getattr(obj, f"{field}_{lang}", None)
    if not value:
        value = getattr(obj, f"{field}_ru", None) or ""
    return value
