"""
Application Configuration Module for QueryX AI Service.
Reads settings from environment variables or .env file with fallback defaults.
"""

from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    QueryX Python AI Service Settings.
    Utilizes Pydantic Settings for strict typing and validation.
    """
    app_name: str = "QueryX AI Intelligence Service"
    app_version: str = "1.0.0"
    app_env: str = "development"
    debug: bool = True
    port: int = 8000
    host: str = "0.0.0.0"

    # Optional service-to-service API key for production
    service_api_key: str = ""

    # CORS Allowed Origins
    allowed_origins: str = "http://localhost:8080,http://127.0.0.1:8080,https://query-x-six.vercel.app"

    @property
    def cors_origins(self) -> List[str]:
        """Parses comma-separated allowed origins into a list."""
        return [origin.strip() for origin in self.allowed_origins.split(",") if origin.strip()]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore"
    )


settings = Settings()
