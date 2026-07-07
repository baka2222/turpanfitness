from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

_HERE = Path(__file__).parent
_BACKEND = _HERE.parent / "backend"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=str(_HERE / ".env"),
        env_file_encoding="utf-8-sig",
        case_sensitive=True,
    )

    DATABASE_URL: str = f"sqlite:///{_BACKEND / 'db.sqlite3'}"
    MEDIA_ROOT: str = str(_BACKEND / "media")

    TELEGRAM_BOT_TOKEN: str = ""
    TELEGRAM_ADMIN_CHAT_ID: str = ""

    ALLOWED_ORIGINS: str = "http://localhost:3000"

    @property
    def origins_list(self) -> list[str]:
        return [o.strip() for o in self.ALLOWED_ORIGINS.split(",")]


settings = Settings()
