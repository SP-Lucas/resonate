from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    DATABASE_URL: str = "postgresql+asyncpg://resonate:resonate@localhost:5432/resonate"
    REDIS_URL: str = "redis://localhost:6379"
    ANTHROPIC_API_KEY: str = ""
    SECRET_KEY: str = "change-me-in-production-use-a-long-random-string"
    CORS_ORIGINS: list[str] = ["*"]


settings = Settings()
