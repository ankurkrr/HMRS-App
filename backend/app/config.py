"""Application configuration loaded from environment variables."""

from pydantic_settings import BaseSettings
from pydantic import Field, model_validator


class Settings(BaseSettings):
    """Central configuration with environment variable binding."""

    # Application
    APP_NAME: str = "HRMS Lite"
    APP_ENV: str = "development"
    DEBUG: bool = False

    # Database (MySQL)
    DB_USER: str = "root"
    DB_PASSWORD: str = ""
    DB_NAME: str = "hrms_lite"
    DB_HOST: str = "localhost"
    DB_PORT: int = 3306
    DATABASE_URL: str | None = None

    @model_validator(mode="after")
    def assemble_db_connection(self) -> "Settings":
        """
        Assemble database URL if not provided directly.
        Ensures correct async driver (mysql+aiomysql) is used.
        """
        if self.DATABASE_URL:
            # Provide support for standard 'mysql://' schemes by auto-fixing them to async driver
            if self.DATABASE_URL.startswith("mysql://"):
                self.DATABASE_URL = self.DATABASE_URL.replace("mysql://", "mysql+aiomysql://", 1)
            return self

        self.DATABASE_URL = (
            f"mysql+aiomysql://{self.DB_USER}:{self.DB_PASSWORD}"
            f"@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}?charset=utf8mb4"
        )
        return self

    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 60
    RATE_LIMIT_BULK_PER_MINUTE: int = 10

    # Logging
    LOG_LEVEL: str = "INFO"
    SLOW_QUERY_THRESHOLD_MS: int = Field(default=200, description="Warn on queries exceeding this threshold (ms)")

    # API
    API_V1_PREFIX: str = "/api/v1"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8", "case_sensitive": True}


settings = Settings()
