from pydantic_settings import BaseSettings
from pydantic import field_validator
from typing import Optional, Union, List

class Settings(BaseSettings):
    PROJECT_NAME: str = "ResumePro Backend"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"  # 'development', 'staging', 'production'

    # Admin access configuration (supporte une liste ou une chaîne séparée par des virgules dans .env)
    ADMIN_EMAILS: Union[List[str], str] = ["admin@resumepro.app", "admin@gencv.com", "landry@gencv.com"]
    DEFAULT_AFFILIATE_RATE: float = 0.30

    @field_validator("ADMIN_EMAILS", mode="before")
    def parse_admin_emails(cls, v):
        if isinstance(v, str):
            # Accepte "email1@domaine.com,email2@domaine.com" ou JSON
            import json
            try:
                parsed = json.loads(v)
                if isinstance(parsed, list):
                    return parsed
            except Exception:
                pass
            return [email.strip() for email in v.split(",") if email.strip()]
        return v

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
