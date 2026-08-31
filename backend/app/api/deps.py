from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from typing import Optional
from app.core.security import verify_neon_auth_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login") # URL is just a placeholder now

class AuthUser(BaseModel):
    id: str
    email: Optional[str] = None

def get_current_user(token: str = Depends(oauth2_scheme)) -> AuthUser:
    """
    Validates the Neon Auth token and returns the user identity.
    No database lookup is performed for the user identity.
    """
    payload = verify_neon_auth_token(token)
    
    # Neon Auth payload typically contains 'sub' as the user ID
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token: missing subject")
        
    return AuthUser(
        id=user_id,
        email=payload.get("email") # May be present depending on token claims
    )
