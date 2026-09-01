import jwt
from jwt import PyJWKClient
from fastapi import HTTPException, status
from app.core.config import settings

def verify_neon_auth_token(token: str) -> dict:
    """
    Validates a JWT issued by Neon Auth using their JWKS endpoint.
    Returns the decoded payload if valid.
    """
    if not settings.NEON_AUTH_JWKS_URL:
        if settings.ENVIRONMENT != "development":
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Authentication provider is not properly configured for production (missing JWKS URL).",
            )
        # Fallback ONLY for local development
        print("WARNING: NEON_AUTH_JWKS_URL is not set. Running in insecure development fallback mode.")
        try:
            return jwt.decode(token, options={"verify_signature": False})
        except Exception:
            return {"sub": token, "email": f"{token}@example.com"}

    try:
        jwks_client = PyJWKClient(settings.NEON_AUTH_JWKS_URL)
        signing_key = jwks_client.get_signing_key_from_jwt(token)
        
        # Audience check is optional depending on Neon Auth setup
        kwargs = {"algorithms": ["RS256"]}
        if settings.NEON_AUTH_AUDIENCE:
            kwargs["audience"] = settings.NEON_AUTH_AUDIENCE

        payload = jwt.decode(
            token,
            signing_key.key,
            **kwargs
        )
        return payload
    except jwt.exceptions.PyJWKClientError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unable to fetch JWKS keys",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.InvalidTokenError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )
