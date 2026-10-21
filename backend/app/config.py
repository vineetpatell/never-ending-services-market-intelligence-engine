"""Application configuration loaded from environment / .env (placeholders only)."""
from __future__ import annotations

from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_env: str = "development"
    frontend_url: str = "http://127.0.0.1:5173"
    api_base_url: str = "http://127.0.0.1:8000"
    database_url: str = "sqlite:///./data/app.sqlite3"
    market_provider: str = "demo"
    max_import_bytes: int = 10 * 1024 * 1024  # 10 MiB
    max_candles_limit: int = 20000
    default_candles_limit: int = 5000

    @property
    def is_dev(self) -> bool:
        return self.app_env.lower() in {"development", "dev", "test"}

    @property
    def sqlite_path(self) -> Path | None:
        prefix = "sqlite:///"
        if self.database_url.startswith(prefix):
            return Path(self.database_url[len(prefix):])
        return None


settings = Settings()
