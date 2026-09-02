from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from typing import Optional
from app.core.security import verify_neon_auth_token

from app.core.config import settings

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)

class AuthUser(BaseModel):
    id: str
    email: Optional[str] = None
    role: Optional[str] = None
    is_admin: bool = False

def get_current_user(token: Optional[str] = Depends(oauth2_scheme)) -> AuthUser:
    """
    Validates the Neon Auth token and returns the user identity.
    """
    if not token:
        # In local dev environment, allow fallback dev admin if token is missing
        if settings.ENVIRONMENT == "development":
            return AuthUser(
                id="dev-admin-id",
                email="admin@resumepro.app",
                role="admin",
                is_admin=True
            )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    payload = verify_neon_auth_token(token)
    
    # Neon Auth payload typically contains 'sub' as the user ID
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token: missing subject")
        
    email = payload.get("email")
    role = payload.get("role")
    
    # Check if user has admin privileges
    is_admin = False
    if role == "admin" or payload.get("is_admin") is True:
        is_admin = True
    elif email and email.lower() in [admin_email.lower() for admin_email in settings.ADMIN_EMAILS]:
        is_admin = True
    elif user_id in settings.ADMIN_EMAILS:
        is_admin = True
    elif settings.ENVIRONMENT == "development" and (user_id == "admin" or "admin" in (email or "").lower()):
        is_admin = True

    return AuthUser(
        id=user_id,
        email=email,
        role=role,
        is_admin=is_admin
    )

def require_admin_user(current_user: AuthUser = Depends(get_current_user)) -> AuthUser:
    """
    Strict backend verification: Rejects any request if user is not verified as admin.
    """
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Admin privileges required."
        )
    return current_user
