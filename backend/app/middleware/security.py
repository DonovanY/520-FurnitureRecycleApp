from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from app.dependencies.config import get_settings

security = HTTPBearer()

async def validate_token(
    res: HTTPAuthorizationCredentials = Depends(security),
    settings = Depends(get_settings)
):
    token = res.credentials
    try:
        # Supabase uses 'authenticated' as the default audience
        payload = jwt.decode(
            token, 
            settings.SUPABASE_JWT_SECRET, 
            algorithms=[settings.ALGORITHM], 
            audience="authenticated"
        )
        return payload  # Contains user UUID (sub) and email
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )