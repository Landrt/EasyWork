from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "ResumePro Backend"
    API_V1_STR: str = "/api/v1"

    # Database
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/resumepro"

    # Neon Auth / Stack Auth — JWT validation via JWKS
    # Set to your Stack Auth JWKS endpoint, e.g.:
    # https://api.stack-auth.com/api/v1/projects/<project_id>/.well-known/jwks.json
    NEON_AUTH_JWKS_URL: str = ""
    # Optional: enforce a specific audience claim on the JWT
    NEON_AUTH_AUDIENCE: Optional[str] = None

    # LLM Provider (DeepSeek)
    DEEPSEEK_API_KEY: str = ""
    DEEPSEEK_MODEL: str = "deepseek-chat"

    # Async Tasks (Celery)
    REDIS_URL: str = "redis://localhost:6379/0"

    # Payments (Flutterwave)
    FLW_PUBLIC_KEY: str = ""
    FLW_SECRET_KEY: str = ""
    FLW_SECRET_HASH: str = ""

    class Config:
        env_file = ".env"

settings = Settings()
