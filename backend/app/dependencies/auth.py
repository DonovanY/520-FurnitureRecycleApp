from uuid import UUID

from fastapi import Depends, HTTPException

from app.middleware.security import validate_token


async def get_current_user_id(payload: dict = Depends(validate_token)) -> UUID:
    sub = payload.get("sub")
    if not sub:
        raise HTTPException(status_code=401, detail="Invalid token")

    try:
        return UUID(sub)
    except ValueError as exc:
        raise HTTPException(status_code=401, detail="Invalid user id in token") from exc